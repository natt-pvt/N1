
# VitalCare Deployment Guide

## 1. Database Setup (SQL)
Run this in your PostgreSQL console:

```sql
-- Existing tables (from previous generation) ...

-- MISSING TABLE: Message Logs
CREATE TABLE message_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient TEXT NOT NULL,
    content TEXT NOT NULL,
    type TEXT NOT NULL, -- 'sms' or 'whatsapp'
    created_at TIMESTAMP DEFAULT NOW()
);
```

## 2. VPS Checklist
1. **Install Node.js & Git**: `sudo apt update && sudo apt install nodejs npm git`
2. **Install PM2**: `sudo npm install -g pm2` (Keeps the app running forever).
3. **Environment**: Create a `.env` file in the root folder:
   ```env
   DATABASE_URL=postgres://user:pass@localhost:5432/vitalcare
   API_KEY=your_gemini_key
   JWT_SECRET=something_very_long_and_random
   PORT=3000
   ```
4. **Start the App**: `pm2 start server.js --name vitalcare`
5. **Nginx**: Set up a reverse proxy to point Port 80/443 to Port 3000.

## 3. Deployment Command
On your VPS, simply run:
```bash
git clone <your-repo-url>
cd vitalcare
npm install
# Create your .env file here
pm2 start server.js
```
