
const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const twilio = require('twilio');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// --- DATABASE ---
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-123';

// --- TWILIO ---
const twilioClient = process.env.TWILIO_ACCOUNT_SID ? twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
) : null;

const sendMessage = async (to, body, type = 'whatsapp') => {
  if (!twilioClient) {
    console.log(`[MOCK] ${type.toUpperCase()} to ${to}: ${body}`);
    await pool.query('INSERT INTO message_logs (recipient, content, type) VALUES ($1, $2, $3)', [to, body, type]);
    return;
  }
  try {
    const from = type === 'whatsapp' ? process.env.TWILIO_WHATSAPP_NUMBER : process.env.TWILIO_SMS_NUMBER;
    const recipient = type === 'whatsapp' ? `whatsapp:${to}` : to;
    await twilioClient.messages.create({ body, from, to: recipient });
    await pool.query('INSERT INTO message_logs (recipient, content, type) VALUES ($1, $2, $3)', [to, body, type]);
  } catch (err) {
    console.error("Twilio Error:", err);
  }
};

// --- AUTH MIDDLEWARE ---
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// --- API ROUTES ---
app.post('/api/auth/signup', async (req, res) => {
  const { name, email, password, phone, role } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (name, email, password_hash, phone, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, name',
      [name, email, hashedPassword, phone, role]
    );
    const user = result.rows[0];
    if (role === 'client') {
      await pool.query('INSERT INTO patients (user_id, status) VALUES ($1, $2)', [user.id, 'pending']);
      await sendMessage(phone, `Welcome to VitalCare, ${name}! Your registration is pending approval.`);
    }
    res.status(201).json({ message: 'User created' });
  } catch (err) {
    res.status(400).json({ error: 'Email already exists' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];
    if (user && await bcrypt.compare(password, user.password_hash)) {
      const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET);
      res.json({ token, user: { id: user.id, name: user.name, role: user.role, email: user.email, phone: user.phone } });
    } else {
      res.status(401).json({ error: 'Invalid login' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin/Doctor routes (Simplified for brevity - assuming logic from previous generation)
app.get('/api/users', authenticateToken, async (req, res) => {
  const result = await pool.query('SELECT id, name, email, role, phone FROM users');
  res.json(result.rows);
});

app.get('/api/appointments', authenticateToken, async (req, res) => {
  let query = 'SELECT * FROM appointments';
  if (req.user.role === 'client') query += ` WHERE client_id = '${req.user.id}'`;
  const result = await pool.query(query);
  res.json(result.rows);
});

// --- STATIC FILE SERVING (CRITICAL FOR VPS) ---
// Serve all files in the root directory
app.use(express.static(path.join(__dirname)));

// For any route that isn't an API call, serve the index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`VitalCare Production Server running on port ${PORT}`);
});
