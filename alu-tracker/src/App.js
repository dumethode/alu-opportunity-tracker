import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from "firebase/auth";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  query, 
  orderBy 
} from "firebase/firestore";

import { 
  Plus, Search, Trash2, Edit2, CheckCircle, Briefcase, GraduationCap, 
  X, Download, Upload, LayoutGrid, List, PieChart, Calendar, 
  Image as ImageIcon, BarChart2, Bell, LogOut, Loader2, Lock
} from 'lucide-react';

// --- 1. FIREBASE CONFIGURATION ---
const firebaseConfig = {
  apiKey: "AIzaSyCOJpNxSsuxmR8RV45inuNuwacaMCvMcs0",
  authDomain: "alu-tracker.firebaseapp.com",
  databaseURL: "https://alu-tracker-default-rtdb.firebaseio.com",
  projectId: "alu-tracker",
  storageBucket: "alu-tracker.firebasestorage.app",
  messagingSenderId: "694157040022",
  appId: "1:694157040022:web:9907df539882d3f78c25b7",
  measurementId: "G-E4W7N50DK4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- STYLES & THEMES ---
const THEME = {
  primary: '#162A43',    // ALU Deep Navy Blue
  accent: '#DB2B39',     // ALU Bright Red
  light: '#F3F4F6',      
  white: '#FFFFFF',
  gold: '#BFA15F'        // ALU Gold
};

const STYLES = {
  font: { fontFamily: "'Montserrat', sans-serif" },
  btnPrimary: `bg-[#162A43] text-white hover:bg-[#2C4B70] transition-colors shadow-sm flex items-center gap-2 justify-center`,
  btnAccent: `bg-[#DB2B39] text-white hover:bg-[#B91C29] transition-colors shadow-sm flex items-center gap-2 justify-center`,
  btnOutline: `border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2 justify-center`,
  card: `bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden`,
  input: `w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-[#162A43] focus:border-[#162A43] outline-none transition-all`,
  label: `block text-xs font-bold text-gray-500 uppercase mb-1.5`
};

export default function App() {
  // --- STATE ---
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [apps, setApps] = useState([]);
  
  // UI State
  const [activeTab, setActiveTab] = useState('dashboard');
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(initialFormState());

  // Auth Form State
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // --- EFFECTS ---

  // 1. Listen for Auth Changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // 2. Listen for Data (Real-time from Firestore)
  useEffect(() => {
    if (!user) return;

    // We store data at: users/{userId}/applications
    const q = query(collection(db, "users", user.uid, "applications"), orderBy("id", "desc"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loadedApps = snapshot.docs.map(doc => ({ ...doc.data(), firebaseId: doc.id }));
      setApps(loadedApps);
      checkDailyReminders(loadedApps); // Check notifications when data loads
    });

    return () => unsubscribe();
  }, [user]);

  // --- AUTH HANDLERS ---
  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError('');

    try {
      if (authMode === 'login') {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      let msg = err.message;
      if(msg.includes("auth/invalid-email")) msg = "Invalid email address.";
      if(msg.includes("auth/user-not-found")) msg = "No account found with this email.";
      if(msg.includes("auth/wrong-password")) msg = "Incorrect password.";
      if(msg.includes("auth/email-already-in-use")) msg = "Email already in use.";
      setAuthError(msg);
    }
  };

  const handleLogout = () => signOut(auth);

  // --- DATA HANDLERS ---
  
  const handleSave = async (e) => {
    e.preventDefault();
    if (!user) return;

    // Sync steps
    let updatedSteps = editingId 
        ? apps.find(a => a.id === editingId).steps 
        : { readCall: false, drafting: false, docsReady: false, referees: false, finalReview: false, submitted: false };
    updatedSteps = getSyncedSteps(formData.status, updatedSteps);

    const appData = { ...formData, steps: updatedSteps };

    try {
      if (editingId) {
        // Find the firebase document ID
        const appToUpdate = apps.find(a => a.id === editingId);
        if (appToUpdate) {
           await updateDoc(doc(db, "users", user.uid, "applications", appToUpdate.firebaseId), appData);
        }
      } else {
        // Create new
        const newApp = { ...appData, id: Date.now() };
        await addDoc(collection(db, "users", user.uid, "applications"), newApp);
      }
      closeForm();
    } catch (err) {
      alert("Error saving: " + err.message);
    }
  };

  const handleDelete = async (firebaseId) => {
    if (window.confirm("Delete this application permanently?")) {
      await deleteDoc(doc(db, "users", user.uid, "applications", firebaseId));
    }
  };

  // --- NOTIFICATION LOGIC ---
  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) return alert("Browser does not support notifications");
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      new Notification("ALU Tracker", { body: "Daily reminders enabled!" });
    }
  };

  const checkDailyReminders = (currentApps) => {
    if (Notification.permission !== 'granted') return;
    const lastReminder = localStorage.getItem('alu_last_reminder');
    const today = new Date().toDateString();

    if (lastReminder !== today) {
      const pendingCount = currentApps.filter(a => ['In Progress', 'Researching', 'Drafting'].includes(a.status)).length;
      if (pendingCount > 0) {
        new Notification("ALU Tracker Reminder", {
          body: `You have ${pendingCount} pending applications to work on today!`,
          icon: "https://cdn-icons-png.flaticon.com/512/2983/2983808.png"
        });
        localStorage.setItem('alu_last_reminder', today);
      }
    }
  };

  // --- HELPERS ---
  function initialFormState() {
    return { institution: "", program: "", type: "Scholarship", deadline: "", status: "Researching", notes: "", image: "" };
  }

  const handleEdit = (app) => {
    setFormData({
      institution: app.institution, program: app.program, type: app.type, 
      deadline: app.deadline, status: app.status, notes: app.notes, image: app.image || ""
    });
    setEditingId(app.id);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingId(null);
    setFormData(initialFormState());
  };

  const getSyncedSteps = (status, currentSteps) => {
    if (['Submitted', 'Accepted', 'Rejected', 'Offer Accepted', 'Offer Declined'].includes(status)) {
      return { readCall: true, drafting: true, docsReady: true, referees: true, finalReview: true, submitted: true };
    }
    return currentSteps;
  };

  const getProgress = (app) => {
    if (['Submitted', 'Accepted', 'Rejected', 'Offer Accepted', 'Offer Declined'].includes(app.status)) return 100;
    const steps = app.steps || {};
    const keys = Object.keys(steps);
    if (keys.length === 0) return 0;
    return Math.round((keys.filter(k => steps[k]).length / keys.length) * 100);
  };

  const toggleStep = async (app, stepKey) => {
     const newSteps = { ...app.steps, [stepKey]: !app.steps[stepKey] };
     await updateDoc(doc(db, "users", user.uid, "applications", app.firebaseId), { steps: newSteps });
  };

  // --- RENDERERS ---

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-[#162A43]" size={48} /></div>;

  // 1. LOGIN SCREEN
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4" style={STYLES.font}>
        <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border border-gray-100">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-[#162A43] rounded-full flex items-center justify-center text-white text-3xl font-bold">A</div>
          </div>
          <h2 className="text-2xl font-bold text-center text-[#162A43] mb-1">{authMode === 'login' ? 'Welcome Back' : 'Create Account'}</h2>
          <p className="text-center text-gray-500 mb-6 text-sm">Track your scholarships & jobs in the cloud.</p>
          
          {authError && <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">{authError}</div>}

          <form onSubmit={handleAuth} className="space-y-4">
            <div>
               <label className={STYLES.label}>Email Address</label>
               <input type="email" required className={STYLES.input} value={email} onChange={e => setEmail(e.target.value)} placeholder="you@alueducation.com" />
            </div>
            <div>
               <label className={STYLES.label}>Password</label>
               <input type="password" required className={STYLES.input} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
            </div>
            <button type="submit" className={`w-full py-3 rounded font-bold ${STYLES.btnPrimary}`}>
              {authMode === 'login' ? <><Lock size={16} /> Login</> : <><Plus size={16} /> Sign Up Free</>}
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
             <button onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')} className="text-[#DB2B39] font-semibold hover:underline">
               {authMode === 'login' ? "Don't have an account? Sign Up" : "Already have an account? Login"}
             </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. DASHBOARD (LOGGED IN)
  const filteredApps = apps.filter(a => {
     if (activeTab === 'scholarships' && a.type !== 'Scholarship') return false;
     if (activeTab === 'jobs' && a.type !== 'Job') return false;
     if (searchTerm && !a.institution.toLowerCase().includes(searchTerm.toLowerCase())) return false;
     return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 text-slate-800" style={STYLES.font}>
      {/* NAVBAR */}
      <header className="sticky top-0 z-50 shadow-md" style={{ backgroundColor: THEME.primary }}>
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center font-bold text-xl" style={{ color: THEME.primary }}>A</div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-wide leading-none">ALU TRACKER</h1>
              <p className="text-[10px] text-gray-300 uppercase tracking-widest mt-0.5">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={requestNotificationPermission} className="text-white/70 hover:text-white" title="Enable Daily Reminders"><Bell size={20} /></button>
            <button onClick={handleLogout} className="text-white/70 hover:text-red-300" title="Logout"><LogOut size={20} /></button>
            <button onClick={() => setIsFormOpen(true)} className={`ml-2 px-4 py-2 rounded font-semibold text-sm ${STYLES.btnAccent}`}><Plus size={16} /> New Opportunity</button>
          </div>
        </div>
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 flex overflow-x-auto">
            {['dashboard', 'scholarships', 'jobs', 'all'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-3 font-semibold text-sm border-b-2 capitalize ${activeTab === tab ? `border-[#DB2B39] text-[#162A43]` : `border-transparent text-gray-500`}`}>{tab}</button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {activeTab !== 'dashboard' && (
          <div className="flex justify-between items-center gap-4 mb-6">
             <div className="relative w-full md:w-96">
               <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
               <input placeholder="Search..." className={STYLES.input + " rounded-full pl-10 py-2"} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
             </div>
             <div className="flex bg-white rounded-lg border p-1">
               <button onClick={() => setViewMode('table')} className={`p-2 rounded ${viewMode === 'table' ? 'bg-gray-100' : ''}`}><List size={20} /></button>
               <button onClick={() => setViewMode('grid')} className={`p-2 rounded ${viewMode === 'grid' ? 'bg-gray-100' : ''}`}><LayoutGrid size={20} /></button>
             </div>
          </div>
        )}

        {/* DASHBOARD VIEW */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-fade-in">
             <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard label="Total" value={apps.length} icon={<Briefcase />} color="border-l-4 border-[#162A43]" />
                <StatCard label="Submitted" value={apps.filter(a => a.status === 'Submitted').length} icon={<CheckCircle />} color="border-l-4 border-green-500" />
                <StatCard label="Pending" value={apps.filter(a => ['In Progress', 'Drafting'].includes(a.status)).length} icon={<PieChart />} color="border-l-4 border-[#BFA15F]" />
                <StatCard label="Completed" value={`${apps.length > 0 ? Math.round((apps.filter(a => a.status === 'Submitted').length / apps.length) * 100) : 0}%`} icon={<BarChart2 />} color="border-l-4 border-[#DB2B39]" />
             </div>
             {/* Progress Report */}
             <div className="bg-white p-6 rounded-lg border">
                <h3 className="text-lg font-bold text-[#162A43] mb-4">Your Progress</h3>
                {apps.slice(0, 5).map(app => {
                  const p = getProgress(app);
                  return (
                    <div key={app.id} className="mb-3">
                      <div className="flex justify-between text-sm font-semibold text-gray-700"><span>{app.institution}</span><span>{p}%</span></div>
                      <div className="w-full bg-gray-100 rounded-full h-2 mt-1"><div className="h-2 rounded-full transition-all" style={{ width: `${p}%`, backgroundColor: p===100 ? '#BFA15F' : '#162A43' }}></div></div>
                    </div>
                  )
                })}
                {apps.length === 0 && <p className="text-gray-400">No applications yet. Add one!</p>}
             </div>
          </div>
        )}

        {/* LIST/GRID VIEW */}
        {activeTab !== 'dashboard' && (
          <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-2"}>
             {filteredApps.map(app => (
                <div key={app.id} className={viewMode === 'grid' ? STYLES.card + " flex flex-col hover:shadow-md transition-all" : "bg-white border rounded p-4 flex items-center justify-between"}>
                   {viewMode === 'grid' ? (
                     <>
                      <div className="h-32 bg-gray-100 relative">
                        {app.image ? <img src={app.image} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-300"><GraduationCap size={40} /></div>}
                        <span className="absolute top-2 right-2 bg-white/90 px-2 py-1 text-xs font-bold rounded">{app.status}</span>
                      </div>
                      <div className="p-4 flex-1 flex flex-col gap-3">
                        <div><h3 className="font-bold text-[#162A43] line-clamp-1">{app.institution}</h3><p className="text-sm text-[#DB2B39]">{app.program}</p></div>
                        <div className="space-y-1">
                           {Object.keys(app.steps).slice(0,3).map(key => (
                             <div key={key} onClick={() => toggleStep(app, key)} className="flex items-center gap-2 text-xs cursor-pointer hover:text-blue-800">
                               <div className={`w-3 h-3 border rounded-sm ${app.steps[key] ? 'bg-[#162A43]' : ''}`}></div> <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                             </div>
                           ))}
                        </div>
                        <div className="mt-auto pt-3 border-t flex justify-between">
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded">{app.type}</span>
                          <div className="flex gap-2"><button onClick={() => handleEdit(app)}><Edit2 size={16} /></button><button onClick={() => handleDelete(app.firebaseId)} className="text-red-500"><Trash2 size={16} /></button></div>
                        </div>
                      </div>
                     </>
                   ) : (
                     /* Table Row Style */
                     <>
                       <div className="flex items-center gap-4">
                         <div className="font-bold text-[#162A43] w-48">{app.institution}</div>
                         <div className="text-sm text-gray-600 w-48">{app.program}</div>
                         <span className="text-xs bg-gray-100 px-2 py-1 rounded">{app.status}</span>
                       </div>
                       <div className="flex gap-2"><button onClick={() => handleEdit(app)}><Edit2 size={16} /></button><button onClick={() => handleDelete(app.firebaseId)} className="text-red-500"><Trash2 size={16} /></button></div>
                     </>
                   )}
                </div>
             ))}
          </div>
        )}

        {/* MODAL FORM */}
        {isFormOpen && (
           <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4 backdrop-blur-sm">
             <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden">
               <div className="p-5 border-b flex justify-between bg-[#162A43] text-white">
                 <h2 className="font-bold flex items-center gap-2">{editingId ? 'Edit' : 'New'} Opportunity</h2>
                 <button onClick={closeForm}><X /></button>
               </div>
               <form onSubmit={handleSave} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className={STYLES.label}>Image URL</label>
                    <input className={STYLES.input} value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} placeholder="https://..." />
                  </div>
                  <div><label className={STYLES.label}>Institution</label><input required className={STYLES.input} value={formData.institution} onChange={e => setFormData({...formData, institution: e.target.value})} /></div>
                  <div><label className={STYLES.label}>Program</label><input required className={STYLES.input} value={formData.program} onChange={e => setFormData({...formData, program: e.target.value})} /></div>
                  <div><label className={STYLES.label}>Type</label><select className={STYLES.input} value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}><option>Scholarship</option><option>Job</option></select></div>
                  <div><label className={STYLES.label}>Deadline</label><input type="date" className={STYLES.input} value={formData.deadline} onChange={e => setFormData({...formData, deadline: e.target.value})} /></div>
                  <div><label className={STYLES.label}>Status</label><select className={STYLES.input} value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}><option>Researching</option><option>In Progress</option><option>Drafting</option><option>Submitted</option><option>Accepted</option><option>Rejected</option></select></div>
                  <div className="col-span-2 flex justify-end gap-3 mt-4">
                    <button type="button" onClick={closeForm} className={`px-5 py-2.5 rounded ${STYLES.btnOutline}`}>Cancel</button>
                    <button type="submit" className={`px-8 py-2.5 rounded font-bold ${STYLES.btnPrimary}`}>Save to Cloud</button>
                  </div>
               </form>
             </div>
           </div>
        )}
      </main>
    </div>
  );
}

const StatCard = ({ label, value, icon, color }) => (
  <div className={`bg-white p-5 rounded-lg border ${color} flex justify-between`}>
    <div><p className="text-xs text-gray-500 font-bold uppercase">{label}</p><p className="text-3xl font-bold text-[#162A43]">{value}</p></div>
    <div className="text-gray-300 bg-gray-50 p-3 rounded-full">{icon}</div>
  </div>
);
