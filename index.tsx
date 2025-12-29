
import React, { useState, useEffect, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  Users, 
  Calendar, 
  Clipboard, 
  Search, 
  Settings, 
  LogOut, 
  Plus, 
  CheckCircle, 
  XCircle, 
  MessageSquare, 
  FileText, 
  BarChart3, 
  Phone, 
  Send, 
  UserPlus, 
  ArrowRight, 
  ShieldCheck, 
  Stethoscope, 
  Download, 
  AlertCircle 
} from 'lucide-react';

// In a real TS environment, these would be:
// import { User, Role, Appointment, PatientProfile, SessionRecord, MessageLog } from './types';
// import { geminiService } from './geminiServices';

/**
 * PRODUCTION ARCHITECTURE NOTE:
 * This frontend is now configured to use the real API defined in server.js.
 */

const API_BASE_URL = '/api';

// API Service Layer
const api = {
  getHeaders: () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('clinic_token')}`
  }),

  async login(email: string, pass: string) {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: pass })
    });
    if (!res.ok) throw new Error('Invalid credentials');
    return res.json();
  },

  async signup(userData: any) {
    const res = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    if (!res.ok) throw new Error('Signup failed');
  },

  async getUsers() {
    const res = await fetch(`${API_BASE_URL}/users`, { headers: this.getHeaders() });
    return res.json();
  },

  async getPatients() {
    const res = await fetch(`${API_BASE_URL}/patients`, { headers: this.getHeaders() });
    return res.json();
  },

  async getAppointments() {
    const res = await fetch(`${API_BASE_URL}/appointments`, { headers: this.getHeaders() });
    return res.json();
  },

  async getSessions() {
    const res = await fetch(`${API_BASE_URL}/sessions`, { headers: this.getHeaders() });
    return res.json();
  },

  async getMessages() {
    const res = await fetch(`${API_BASE_URL}/messages`, { headers: this.getHeaders() });
    return res.json();
  },

  async updatePatientStatus(userId: string, status: string) {
    await fetch(`${API_BASE_URL}/patients/${userId}/status`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify({ status })
    });
  },

  async addAppointment(apt: any) {
    await fetch(`${API_BASE_URL}/appointments`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(apt)
    });
  },

  async addSession(session: any) {
    await fetch(`${API_BASE_URL}/sessions`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(session)
    });
  }
};

// Main App Component
const App = () => {
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [view, setView] = useState<'login' | 'signup' | 'dashboard'>('login');
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('clinic_current_user');
    const token = localStorage.getItem('clinic_token');
    if (savedUser && token) {
      setCurrentUser(JSON.parse(savedUser));
      setView('dashboard');
    }
    setIsInitializing(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('clinic_current_user');
    localStorage.removeItem('clinic_token');
    setCurrentUser(null);
    setView('login');
  };

  if (isInitializing) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="animate-spin text-teal-600"><Stethoscope size={40} /></div></div>;

  if (!currentUser && view === 'login') return <LoginView onLogin={(u, token) => { 
    localStorage.setItem('clinic_token', token);
    localStorage.setItem('clinic_current_user', JSON.stringify(u));
    setCurrentUser(u); 
    setView('dashboard'); 
  }} onSwitch={() => setView('signup')} />;
  
  if (!currentUser && view === 'signup') return <SignupView onSignup={() => setView('login')} onSwitch={() => setView('login')} />;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col fixed inset-y-0">
        <div className="p-6 border-b border-slate-100 flex items-center gap-2">
          <div className="w-10 h-10 bg-teal-600 rounded-xl flex items-center justify-center text-white">
            <Stethoscope size={24} />
          </div>
          <div>
            <h1 className="font-bold text-slate-900 leading-tight text-sm">VitalCare</h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Clinic Manager</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <div className="px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Navigation</div>
          <SidebarLink icon={<BarChart3 size={20} />} label="Overview" active />
          {currentUser?.role === 'admin' && <AdminLinks />}
          {currentUser?.role === 'doctor' && <DoctorLinks />}
          {currentUser?.role === 'client' && <ClientLinks />}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 mb-4">
            <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-xs uppercase">
              {currentUser?.name[0]}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-semibold text-slate-900 truncate">{currentUser?.name}</p>
              <p className="text-[10px] text-slate-500 uppercase font-bold">{currentUser?.role}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 ml-64 overflow-y-auto p-8">
        <header className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Welcome, {currentUser?.name.split(' ')[0]}</h2>
            <p className="text-slate-500 text-sm">Dashboard Status: Connected to Production Server</p>
          </div>
        </header>

        {currentUser?.role === 'admin' && <AdminDashboard />}
        {currentUser?.role === 'doctor' && <DoctorDashboard user={currentUser} />}
        {currentUser?.role === 'client' && <ClientDashboard user={currentUser} />}
      </main>
    </div>
  );
};

// ... Rest of the UI views remain functionally identical but now use the 'api' service layer ...
// (Skipping full duplicate UI code for brevity, assuming standard component pattern follows)

const AdminDashboard = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'users' | 'approvals' | 'messages' | 'reports'>('users');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [u, p, a, m] = await Promise.all([
        api.getUsers(),
        api.getPatients(),
        api.getAppointments(),
        api.getMessages()
      ]);
      setUsers(u);
      setPatients(p);
      setAppointments(a);
      setMessages(m);
    } catch (e) {
      console.error("Failed to fetch admin data", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const filteredUsers = useMemo(() => 
    users.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.role.toLowerCase().includes(searchTerm.toLowerCase())),
  [users, searchTerm]);

  const pendingPatients = patients.filter(p => p.status === 'pending');

  const handleUpdateStatus = async (userId: string, status: 'approved' | 'rejected') => {
    await api.updatePatientStatus(userId, status);
    fetchData();
  };

  if (loading) return <div className="flex justify-center p-20"><div className="animate-pulse text-slate-300">Syncing with server...</div></div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <StatCard title="Total Users" value={users.length} icon={<Users className="text-blue-600" />} />
        <StatCard title="Pending" value={pendingPatients.length} icon={<AlertCircle className="text-amber-600" />} color="amber" />
        <StatCard title="Visits" value={appointments.length} icon={<Calendar className="text-teal-600" />} color="teal" />
        <StatCard title="Alerts" value={messages.length} icon={<MessageSquare className="text-purple-600" />} color="purple" />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="flex border-b border-slate-200">
          {(['users', 'approvals', 'messages', 'reports'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-6 py-4 text-sm font-semibold capitalize transition-all border-b-2 ${
                activeTab === tab ? 'border-teal-600 text-teal-600 bg-teal-50/30' : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === 'users' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="relative w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input type="text" placeholder="Search clinic database..." className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
              </div>
              <table className="w-full text-left">
                <thead><tr className="text-slate-400 text-xs uppercase"><th className="pb-3 px-2">User</th><th className="pb-3 px-2">Role</th><th className="pb-3 px-2">Contact</th></tr></thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map(u => (
                    <tr key={u.id} className="text-sm hover:bg-slate-50 transition-colors">
                      <td className="py-4 px-2 font-semibold">{u.name}</td>
                      <td className="py-4 px-2"><span className="text-[10px] uppercase font-bold bg-slate-100 px-2 py-1 rounded">{u.role}</span></td>
                      <td className="py-4 px-2 text-slate-500">{u.email}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {activeTab === 'approvals' && (
            <div className="grid gap-4">
              {pendingPatients.length === 0 ? <p className="text-center py-10 text-slate-400">All caught up!</p> :
                pendingPatients.map(p => (
                  <div key={p.id} className="flex items-center justify-between p-4 border rounded-xl">
                    <span>{users.find(u => u.id === p.user_id)?.name || 'New Patient'}</span>
                    <div className="flex gap-2">
                      <button onClick={() => handleUpdateStatus(p.user_id, 'approved')} className="p-2 text-green-600 hover:bg-green-50 rounded"><CheckCircle /></button>
                      <button onClick={() => handleUpdateStatus(p.user_id, 'rejected')} className="p-2 text-red-600 hover:bg-red-50 rounded"><XCircle /></button>
                    </div>
                  </div>
                ))
              }
            </div>
          )}
          {activeTab === 'messages' && (
             <div className="overflow-x-auto">
               <table className="w-full text-left text-xs">
                 <thead><tr><th className="pb-2">To</th><th className="pb-2">Content</th><th className="pb-2">Type</th></tr></thead>
                 <tbody>
                   {messages.map(m => (
                     <tr key={m.id} className="border-t">
                       <td className="py-2">{m.recipient}</td>
                       <td className="py-2 text-slate-600">{m.content}</td>
                       <td className="py-2 font-bold">{m.type}</td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
          )}
          {activeTab === 'reports' && (
            <div className="text-center py-10">
              <Download className="mx-auto text-teal-600 mb-4" size={48} />
              <button className="bg-teal-600 text-white px-6 py-2 rounded-xl font-bold">Download All System Reports (CSV)</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const DoctorDashboard = ({ user }: { user: any }) => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedApt, setSelectedApt] = useState<any | null>(null);
  const [notes, setNotes] = useState('');
  const [aiInstructions, setAiInstructions] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const fetchData = async () => {
    const [apts, users] = await Promise.all([api.getAppointments(), api.getUsers()]);
    setAppointments(apts.filter((a: any) => a.doctor_id === user.id));
    setPatients(users.filter((u: any) => u.role === 'client'));
  };

  useEffect(() => { fetchData(); }, []);

  const handleSaveSession = async () => {
    if (!selectedApt) return;
    await api.addSession({
      appointmentId: selectedApt.id,
      patientId: selectedApt.client_id,
      notes,
      care_instructions: aiInstructions
    });
    setSelectedApt(null);
    setNotes('');
    setAiInstructions('');
    fetchData();
  };

  return (
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-8 bg-white p-6 rounded-2xl border">
        <h3 className="font-bold mb-4">Patient Schedule</h3>
        <div className="space-y-3">
          {appointments.map(apt => {
            const client = patients.find(p => p.id === apt.client_id);
            return (
              <div key={apt.id} className="p-4 bg-slate-50 rounded-xl flex justify-between items-center">
                <div>
                  <p className="font-bold">{client?.name}</p>
                  <p className="text-xs text-slate-500">{new Date(apt.appointment_date).toLocaleString()}</p>
                </div>
                {apt.status === 'scheduled' && (
                  <button onClick={() => setSelectedApt(apt)} className="bg-teal-600 text-white px-3 py-1 rounded-lg text-xs font-bold">Start</button>
                )}
                {apt.status === 'completed' && <span className="text-green-600 text-xs font-bold uppercase">Done</span>}
              </div>
            );
          })}
        </div>
      </div>
      <div className="col-span-4 bg-white p-6 rounded-2xl border">
        {selectedApt ? (
          <div className="space-y-4">
            <h4 className="font-bold">Active Session</h4>
            <textarea className="w-full p-2 border rounded-lg h-32 text-sm" placeholder="Diagnosis..." value={notes} onChange={(e) => setNotes(e.target.value)} />
            <button className="w-full bg-slate-900 text-white py-2 rounded-lg text-xs font-bold">AI Support (Mock)</button>
            <textarea className="w-full p-2 border rounded-lg h-20 text-xs bg-teal-50" placeholder="AI Care Instructions..." value={aiInstructions} onChange={(e) => setAiInstructions(e.target.value)} />
            <button onClick={handleSaveSession} className="w-full bg-teal-600 text-white py-3 rounded-xl font-bold">Finalize</button>
          </div>
        ) : <p className="text-center text-slate-400 py-20">Select a patient to begin.</p>}
      </div>
    </div>
  );
};

const ClientDashboard = ({ user }: { user: any }) => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [view, setView] = useState<'home' | 'book'>('home');
  const [form, setForm] = useState({ doctorId: '', date: '', reason: '' });

  const fetchData = async () => {
    const [apts, users] = await Promise.all([api.getAppointments(), api.getUsers()]);
    setAppointments(apts);
    setDoctors(users.filter((u: any) => u.role === 'doctor'));
  };

  useEffect(() => { fetchData(); }, []);

  const handleBook = async () => {
    await api.addAppointment({ ...form, clientId: user.id });
    setView('home');
    fetchData();
  };

  return (
    <div className="space-y-6">
      {view === 'home' ? (
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold">My Visits</h3>
              <button onClick={() => setView('book')} className="bg-teal-600 text-white p-2 rounded-full"><Plus /></button>
            </div>
            {appointments.map(a => (
              <div key={a.id} className="p-3 border-b text-sm">
                <p className="font-bold">{new Date(a.appointment_date).toLocaleDateString()}</p>
                <p className="text-slate-500">{a.reason}</p>
              </div>
            ))}
          </div>
          <div className="bg-teal-600 p-6 rounded-2xl text-white">
            <h3 className="font-bold mb-2">AI Health Assistant</h3>
            <p className="text-sm opacity-90">Coming Soon: Deep integration with Gemini for symptom tracking.</p>
          </div>
        </div>
      ) : (
        <div className="max-w-md mx-auto bg-white p-8 rounded-2xl border">
          <h3 className="font-bold mb-6">Request Visit</h3>
          <div className="space-y-4">
            <select className="w-full p-3 border rounded-xl" onChange={e => setForm({...form, doctorId: e.target.value})}>
              <option>Select Specialist</option>
              {doctors.map(d => <option key={d.id} value={d.id}>Dr. {d.name}</option>)}
            </select>
            <input type="datetime-local" className="w-full p-3 border rounded-xl" onChange={e => setForm({...form, date: e.target.value})} />
            <input placeholder="Reason" className="w-full p-3 border rounded-xl" onChange={e => setForm({...form, reason: e.target.value})} />
            <button onClick={handleBook} className="w-full bg-teal-600 text-white py-3 rounded-xl font-bold">Book Now</button>
            <button onClick={() => setView('home')} className="w-full text-slate-400 text-sm">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

// ... SidebarLink and StatCard remain the same as previous generation ...
const SidebarLink = ({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) => (
  <button className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
    active ? 'bg-teal-600 text-white shadow-lg font-bold' : 'text-slate-500 hover:bg-teal-50 hover:text-teal-600 font-semibold'
  }`}> {icon} <span className="text-sm">{label}</span> </button>
);
const AdminLinks = () => (<><SidebarLink icon={<Users size={20} />} label="Users" /><SidebarLink icon={<ShieldCheck size={20} />} label="Approvals" /><SidebarLink icon={<Phone size={20} />} label="Messaging" /></>);
const DoctorLinks = () => (<><SidebarLink icon={<Calendar size={20} />} label="Schedule" /><SidebarLink icon={<Users size={20} />} label="Patients" /></>);
const ClientLinks = () => (<><SidebarLink icon={<Calendar size={20} />} label="Bookings" /><SidebarLink icon={<Clipboard size={20} />} label="Health Records" /></>);
const StatCard = ({ title, value, icon, color = "blue" }: any) => (<div className="bg-white p-4 rounded-xl border flex gap-3 items-center"><div className="p-2 bg-slate-50 rounded-lg">{icon}</div><div><p className="text-[10px] uppercase font-bold text-slate-400">{title}</p><p className="text-xl font-black">{value}</p></div></div>);

// Auth components (Login/Signup) from previous generation
const LoginView = ({ onLogin, onSwitch }: any) => {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [loading, setLoading] = useState(false);
  const handleLogin = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { user, token } = await api.login(email, pass);
      onLogin(user, token);
    } catch (err) { alert('Login Failed'); }
    finally { setLoading(false); }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="bg-white p-10 rounded-3xl shadow-xl w-full max-w-sm">
        <h2 className="text-2xl font-black mb-6 text-center">VitalCare Login</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <input className="w-full p-4 bg-slate-50 rounded-2xl border" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
          <input className="w-full p-4 bg-slate-50 rounded-2xl border" type="password" placeholder="Password" value={pass} onChange={e => setPass(e.target.value)} />
          <button className="w-full bg-teal-600 text-white py-4 rounded-2xl font-bold">{loading ? '...' : 'Sign In'}</button>
        </form>
        <button onClick={onSwitch} className="w-full mt-4 text-sm text-slate-500">Create Account</button>
      </div>
    </div>
  );
};

const SignupView = ({ onSignup, onSwitch }: any) => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', role: 'client' });
  const handleSignup = async (e: any) => {
    e.preventDefault();
    await api.signup(form);
    alert('Account created! Pending Admin approval.');
    onSignup();
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="bg-white p-10 rounded-3xl shadow-xl w-full max-w-sm">
        <h2 className="text-2xl font-black mb-6 text-center">Join VitalCare</h2>
        <form onSubmit={handleSignup} className="space-y-4">
          <input className="w-full p-4 bg-slate-50 rounded-2xl border" placeholder="Full Name" onChange={e => setForm({...form, name: e.target.value})} />
          <input className="w-full p-4 bg-slate-50 rounded-2xl border" placeholder="Email" onChange={e => setForm({...form, email: e.target.value})} />
          <input className="w-full p-4 bg-slate-50 rounded-2xl border" placeholder="Phone" onChange={e => setForm({...form, phone: e.target.value})} />
          <input className="w-full p-4 bg-slate-50 rounded-2xl border" type="password" placeholder="Password" onChange={e => setForm({...form, password: e.target.value})} />
          <button className="w-full bg-teal-600 text-white py-4 rounded-2xl font-bold">Sign Up</button>
        </form>
        <button onClick={onSwitch} className="w-full mt-4 text-sm text-slate-500">Already a member? Login</button>
      </div>
    </div>
  );
};

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(<App />);
}
