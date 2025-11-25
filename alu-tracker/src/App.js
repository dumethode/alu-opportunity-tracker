import React, { useState, useEffect } from 'react';
import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile,
  sendEmailVerification
} from "firebase/auth";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  setDoc,
  onSnapshot, 
  query, 
  orderBy 
} from "firebase/firestore";

import { 
  Plus, Search, Trash2, Edit2, CheckCircle, Briefcase, GraduationCap, 
  X, LayoutGrid, List, PieChart, Calendar, 
  BarChart2, Bell, LogOut, Loader2, Lock, Mail, Info, Twitter, Github, Linkedin, Instagram, CheckSquare, Clock, Send
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
  btnPrimary: `bg-[#162A43] text-white hover:bg-[#2C4B70] transition-colors shadow-sm flex items-center gap-2 justify-center disabled:opacity-70 disabled:cursor-not-allowed`,
  btnAccent: `bg-[#DB2B39] text-white hover:bg-[#B91C29] transition-colors shadow-sm flex items-center gap-2 justify-center`,
  btnOutline: `border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2 justify-center`,
  card: `bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden`,
  input: `w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-[#162A43] focus:border-[#162A43] outline-none transition-all`,
  label: `block text-xs font-bold text-gray-500 uppercase mb-1.5`
};

// --- CONSTANTS ---
const ALU_LOGO_URL = "https://www.alueducation.com/wp-content/uploads/2023/05/ALU-logo-with-name-min.png";

const DEFAULT_STEPS = { 
  research: false,
  networking: false,
  readCall: false, 
  drafting: false, 
  docsReady: false, 
  referees: false, 
  finalReview: false, 
  submitted: false 
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
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(initialFormState());

  // Auth Form State
  const [authMode, setAuthMode] = useState('login'); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [surname, setSurname] = useState('');
  const [phone, setPhone] = useState('');
  const [authError, setAuthError] = useState('');
  const [verificationSent, setVerificationSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); 

  // --- EFFECTS ---

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser && currentUser.emailVerified) {
        setUser(currentUser);
      } else if (currentUser && !currentUser.emailVerified) {
         setUser(null);
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "users", user.uid, "applications"), orderBy("id", "desc"));
    
    // Real-time listener
    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const loadedApps = snapshot.docs.map(doc => ({ ...doc.data(), firebaseId: doc.id }));
        setApps(loadedApps);
      },
      (error) => console.error("Firestore Error:", error)
    );
    return () => unsubscribe();
  }, [user]);

  // --- NOTIFICATION TIMER ---
  useEffect(() => {
    // Check for reminders every minute
    const interval = setInterval(() => {
      checkScheduledReminders(apps);
    }, 60000); // 60000ms = 1 minute

    // Also check immediately when apps change or component mounts
    checkScheduledReminders(apps);

    return () => clearInterval(interval);
  }, [apps]);

  // --- AUTH HANDLERS ---
  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError('');
    setVerificationSent(false);
    setIsSubmitting(true);

    try {
      if (authMode === 'login') {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        if (!userCredential.user.emailVerified) {
          try {
            await sendEmailVerification(userCredential.user);
            setAuthError("Account not verified. We have resent the verification link. Please check your inbox.");
          } catch (emailErr) {
            setAuthError("Account not verified. Please check your inbox.");
          }
          await signOut(auth);
        }
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const newUser = userCredential.user;
        
        await updateProfile(newUser, { displayName: `${firstName} ${surname}` });
        await setDoc(doc(db, "users", newUser.uid), {
          firstName, surname, phone, email, uid: newUser.uid, createdAt: new Date().toISOString()
        });

        try {
          await sendEmailVerification(newUser);
          setVerificationSent(true);
          setAuthMode('login');
          setFirstName(''); setSurname(''); setPhone(''); setEmail(''); setPassword('');
        } catch (emailErr) {
          setAuthError("Account created, but verification email failed. Try logging in to resend.");
        }
        await signOut(auth);
      }
    } catch (err) {
      let msg = err.message;
      if(msg.includes("auth/email-already-in-use")) msg = "Email already in use.";
      if(msg.includes("auth/weak-password")) msg = "Password should be at least 6 characters.";
      if(msg.includes("auth/invalid-credential") || msg.includes("auth/wrong-password")) msg = "Invalid email or password.";
      setAuthError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    setApps([]); 
    signOut(auth);
  };

  // --- DATA HANDLERS ---
  const handleSave = async (e) => {
    e.preventDefault();
    if (!user) return;
    setIsSubmitting(true);
    
    let updatedSteps = formData.steps;
    updatedSteps = getSyncedSteps(formData.status, updatedSteps);
    const appData = { ...formData, steps: updatedSteps };

    try {
      if (editingId) {
        const appToUpdate = apps.find(a => a.id === editingId);
        if (appToUpdate) await updateDoc(doc(db, "users", user.uid, "applications", appToUpdate.firebaseId), appData);
      } else {
        const newApp = { ...appData, id: Date.now() };
        await addDoc(collection(db, "users", user.uid, "applications"), newApp);
      }
      closeForm();
    } catch (err) { alert("Error saving: " + err.message); }
    finally { setIsSubmitting(false); }
  };

  const handleDelete = async (firebaseId) => {
    if (window.confirm("Delete this application permanently?")) {
      await deleteDoc(doc(db, "users", user.uid, "applications", firebaseId));
    }
  };

  // --- NOTIFICATION & HELPERS ---
  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) return alert("Browser does not support notifications");
    const permission = await Notification.requestPermission();
    if (permission === 'granted') new Notification("ALU Tracker", { body: "Daily reminders enabled for 10:00 PM!" });
  };

  const checkScheduledReminders = (currentApps) => {
    if (Notification.permission !== 'granted') return;
    
    const now = new Date();
    // ONLY trigger if it is 22:00 (10 PM) or later
    if (now.getHours() < 22) return;

    const lastReminder = localStorage.getItem('alu_last_reminder');
    const today = now.toDateString();

    // If we haven't sent a reminder TODAY, send one now
    if (lastReminder !== today) {
      const pendingCount = currentApps.filter(a => ['In Progress', 'Researching', 'Drafting'].includes(a.status)).length;
      if (pendingCount > 0) {
        new Notification("ALU Tracker Reminder 🌙", { 
          body: `It's 10 PM! You have ${pendingCount} pending applications. Time to work?`, 
          icon: ALU_LOGO_URL 
        });
        localStorage.setItem('alu_last_reminder', today);
      }
    }
  };

  function initialFormState() { 
    return { 
      institution: "", 
      program: "", 
      type: "Scholarship", 
      startDate: "", 
      deadline: "", 
      status: "Researching", 
      notes: "", 
      image: "",
      steps: { ...DEFAULT_STEPS }
    }; 
  }
  
  const handleEdit = (app) => {
    setFormData({ 
      institution: app.institution, 
      program: app.program, 
      type: app.type, 
      startDate: app.startDate || "", 
      deadline: app.deadline, 
      status: app.status, 
      notes: app.notes, 
      image: app.image || "",
      steps: { ...DEFAULT_STEPS, ...(app.steps || {}) }
    });
    setEditingId(app.id); 
    setIsFormOpen(true);
  };

  const closeForm = () => { setIsFormOpen(false); setEditingId(null); setFormData(initialFormState()); };
  
  const handleChecklistChange = (key) => {
    setFormData(prev => ({
      ...prev,
      steps: { ...prev.steps, [key]: !prev.steps[key] }
    }));
  };

  const getSyncedSteps = (status, currentSteps) => {
    if (['Submitted', 'Accepted', 'Rejected', 'Offer Accepted', 'Offer Declined'].includes(status)) {
      const completed = {};
      Object.keys(currentSteps).forEach(k => completed[k] = true);
      return completed;
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

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50">
      <Loader2 className="animate-spin text-[#162A43]" size={48} />
      <p className="text-[#162A43] font-semibold animate-pulse">Loading ALU Tracker...</p>
    </div>
  );

  // LOGIN / SIGNUP SCREEN
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50 font-sans">
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
          <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-md border border-gray-100">
            <div className="flex justify-center mb-6">
              <img src={ALU_LOGO_URL} alt="ALU Logo" className="h-16 object-contain" />
            </div>
            
            <h2 className="text-2xl font-bold text-center text-[#162A43] mb-1">
              {authMode === 'login' ? 'Welcome Back' : 'Join the Community'}
            </h2>
            <p className="text-center text-gray-500 mb-6 text-sm">
              Master your future by tracking every opportunity.
            </p>
            
            {verificationSent && (
              <div className="bg-green-50 text-green-700 p-4 rounded mb-6 text-sm flex items-start gap-2 border border-green-200">
                <Mail size={20} className="shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Check your inbox!</p>
                  <p>We sent a verification link. Please click it to activate your account, then log in here.</p>
                </div>
              </div>
            )}

            {authError && (
              <div className="bg-red-50 text-red-600 p-4 rounded mb-6 text-sm font-medium flex items-start gap-2 border border-red-200">
                 <div className="shrink-0 mt-0.5">⚠️</div>
                 <div>{authError}</div>
              </div>
            )}

            <form onSubmit={handleAuth} className="space-y-4">
              {authMode === 'signup' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className={STYLES.label}>First Name</label><input required className={STYLES.input} value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="John" /></div>
                    <div><label className={STYLES.label}>Surname</label><input required className={STYLES.input} value={surname} onChange={e => setSurname(e.target.value)} placeholder="Doe" /></div>
                  </div>
                  <div><label className={STYLES.label}>Phone Number</label><input required type="tel" className={STYLES.input} value={phone} onChange={e => setPhone(e.target.value)} placeholder="+250 7..." /></div>
                </>
              )}
              <div><label className={STYLES.label}>Email Address</label><input type="email" required className={STYLES.input} value={email} onChange={e => setEmail(e.target.value)} placeholder="you@alueducation.com" /></div>
              <div><label className={STYLES.label}>Password</label><input type="password" required className={STYLES.input} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" /></div>
              
              <button type="submit" disabled={isSubmitting} className={`w-full py-3 rounded font-bold ${STYLES.btnPrimary}`}>
                {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : (authMode === 'login' ? <><Lock size={16} /> Login</> : <><Plus size={16} /> Create Account</>)}
              </button>
            </form>

            <div className="mt-6 text-center text-sm">
              <button onClick={() => { setAuthMode(authMode === 'login' ? 'signup' : 'login'); setVerificationSent(false); setAuthError(''); }} className="text-[#DB2B39] font-semibold hover:underline">
                {authMode === 'login' ? "New here? Create an Account" : "Already have an account? Login"}
              </button>
            </div>
          </div>

          <footer className="mt-12 text-center text-gray-500 text-xs">
            <div className="flex items-center justify-center gap-4 mb-2">
              <button onClick={() => setIsAboutOpen(true)} className="hover:text-[#162A43] flex items-center gap-1 transition-colors">
                <Info size={14} /> About this App
              </button>
            </div>
            <p>&copy; {new Date().getFullYear()} ALU Opportunity Tracker. Developed by <span className="font-bold text-[#162A43]">dumethode</span>.</p>
          </footer>
        </div>
        {isAboutOpen && <AboutModal onClose={() => setIsAboutOpen(false)} />}
      </div>
    );
  }

  // DASHBOARD (LOGGED IN)
  const filteredApps = apps.filter(a => {
     if (activeTab === 'scholarships' && a.type !== 'Scholarship') return false;
     if (activeTab === 'jobs' && a.type !== 'Job') return false;
     if (searchTerm && !a.institution.toLowerCase().includes(searchTerm.toLowerCase())) return false;
     return true;
  });

  // New logic for separated upcoming deadlines
  const pendingApps = apps.filter(a => !['Submitted', 'Accepted', 'Rejected', 'Offer Accepted', 'Offer Declined'].includes(a.status));
  
  const nextScholarship = pendingApps
    .filter(a => a.type === 'Scholarship' && a.deadline && new Date(a.deadline) >= new Date().setHours(0,0,0,0))
    .sort((a,b) => new Date(a.deadline) - new Date(b.deadline))[0];

  const nextJob = pendingApps
    .filter(a => a.type === 'Job' && a.deadline && new Date(a.deadline) >= new Date().setHours(0,0,0,0))
    .sort((a,b) => new Date(a.deadline) - new Date(b.deadline))[0];

  const sendEmailReport = () => {
    if (pendingApps.length === 0) return alert("You have no pending applications to report!");
    const subject = "My Pending Applications Report 🎓";
    const body = `Hello ${user.displayName},%0D%0A%0D%0AHere is the status of your pending applications:%0D%0A%0D%0A${pendingApps.map(a => `📌 ${a.institution} (${a.type})%0D%0A   - Program: ${a.program}%0D%0A   - Status: ${a.status}%0D%0A   - Deadline: ${a.deadline || 'N/A'}%0D%0A`).join('%0D%0A')}%0D%0AKeep pushing!%0D%0AALU Opportunity Tracker`;
    window.location.href = `mailto:${user.email}?subject=${subject}&body=${body}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 text-slate-800 font-sans flex flex-col">
      {/* NAVBAR */}
      <header className="sticky top-0 z-50 shadow-md" style={{ backgroundColor: THEME.primary }}>
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center space-x-3">
            <img src={ALU_LOGO_URL} alt="ALU Logo" className="h-10 w-auto object-contain bg-white rounded px-2 py-1" />
            <div>
              <h1 className="text-xl font-bold text-white tracking-wide leading-none">ALU TRACKER</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] text-white font-bold uppercase bg-white/20 px-1.5 rounded">{user.displayName || 'User'}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setIsAboutOpen(true)} className="text-white/70 hover:text-white" title="About & Credits"><Info size={20} /></button>
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

      <main className="max-w-7xl mx-auto px-4 py-8 flex-1 w-full">
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
             
             {/* 1. STATS ROW */}
             <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard label="Total" value={apps.length} icon={<Briefcase />} color="border-l-4 border-[#162A43]" />
                <StatCard label="Submitted" value={apps.filter(a => a.status === 'Submitted').length} icon={<CheckCircle />} color="border-l-4 border-green-500" />
                <StatCard label="Pending" value={apps.filter(a => ['In Progress', 'Drafting'].includes(a.status)).length} icon={<PieChart />} color="border-l-4 border-[#BFA15F]" />
                <StatCard label="Completed" value={`${apps.length > 0 ? Math.round((apps.filter(a => a.status === 'Submitted').length / apps.length) * 100) : 0}%`} icon={<BarChart2 />} color="border-l-4 border-[#DB2B39]" />
             </div>

             {/* 2. UPCOMING DEADLINES (SPLIT) */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Scholarship Deadline Card */}
                <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-[#162A43] flex items-center gap-2"><GraduationCap size={20} /> Next Scholarship Deadline</h3>
                    {nextScholarship && <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-full">Approaching</span>}
                  </div>
                  {nextScholarship ? (
                    <div className="bg-gray-50 p-4 rounded border border-gray-100">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold text-lg text-[#162A43]">{nextScholarship.institution}</p>
                          <p className="text-sm text-gray-600">{nextScholarship.program}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500 uppercase font-bold">Due Date</p>
                          <p className="text-lg font-mono font-bold text-[#DB2B39]">{nextScholarship.deadline}</p>
                        </div>
                      </div>
                      <div className="mt-3 flex gap-2">
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded font-bold">{nextScholarship.status}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6 text-gray-400 text-sm bg-gray-50 rounded border border-dashed">No upcoming scholarship deadlines.</div>
                  )}
                </div>

                {/* Job Deadline Card */}
                <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-[#162A43] flex items-center gap-2"><Briefcase size={20} /> Next Job Deadline</h3>
                    {nextJob && <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-full">Approaching</span>}
                  </div>
                  {nextJob ? (
                    <div className="bg-gray-50 p-4 rounded border border-gray-100">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold text-lg text-[#162A43]">{nextJob.institution}</p>
                          <p className="text-sm text-gray-600">{nextJob.program}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500 uppercase font-bold">Due Date</p>
                          <p className="text-lg font-mono font-bold text-[#DB2B39]">{nextJob.deadline}</p>
                        </div>
                      </div>
                      <div className="mt-3 flex gap-2">
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded font-bold">{nextJob.status}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6 text-gray-400 text-sm bg-gray-50 rounded border border-dashed">No upcoming job deadlines.</div>
                  )}
                </div>
             </div>

             {/* 3. EMAIL REPORT BUTTON */}
             <div className="bg-gradient-to-r from-[#162A43] to-[#2C4B70] p-6 rounded-lg text-white shadow-md flex flex-col md:flex-row items-center justify-between gap-4">
               <div>
                 <h3 className="font-bold text-lg flex items-center gap-2"><Mail size={20}/> Daily Report</h3>
                 <p className="text-sm text-gray-300 opacity-90">Get a summarized list of all your pending applications and deadlines sent directly to your email. <span className="font-bold text-[#BFA15F]">Daily notifications at 10:00 PM.</span></p>
               </div>
               <button 
                 onClick={sendEmailReport}
                 className="bg-[#BFA15F] text-[#162A43] px-6 py-3 rounded font-bold hover:bg-white transition-colors flex items-center gap-2 shadow-lg"
               >
                 <Send size={18} /> Send Daily Report
               </button>
             </div>

             {/* 4. PROGRESS LIST */}
             <div className="bg-white p-6 rounded-lg border">
                <h3 className="text-lg font-bold text-[#162A43] mb-4">Overall Progress</h3>
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
                           {/* Expanded Checklist display */}
                           {Object.keys(app.steps || {}).slice(0, 4).map(key => (
                             <div key={key} onClick={() => toggleStep(app, key)} className="flex items-center gap-2 text-xs cursor-pointer hover:text-blue-800">
                               <div className={`w-3.5 h-3.5 border rounded-sm flex items-center justify-center ${app.steps[key] ? 'bg-[#162A43] border-[#162A43]' : 'border-gray-300'}`}>
                                 {app.steps[key] && <div className="text-white text-[8px]">✓</div>}
                               </div>
                               <span className="capitalize text-gray-600">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                             </div>
                           ))}
                           {(Object.keys(app.steps || {}).length > 4) && <div className="text-xs text-gray-400 italic ml-5">+ {Object.keys(app.steps).length - 4} more...</div>}
                        </div>
                        <div className="mt-auto pt-3 border-t flex justify-between">
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded">{app.type}</span>
                          <div className="flex gap-2"><button onClick={() => handleEdit(app)}><Edit2 size={16} /></button><button onClick={() => handleDelete(app.firebaseId)} className="text-red-500"><Trash2 size={16} /></button></div>
                        </div>
                      </div>
                     </>
                   ) : (
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
             <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
               <div className="p-5 border-b flex justify-between bg-[#162A43] text-white sticky top-0 z-10">
                 <h2 className="font-bold flex items-center gap-2">{editingId ? 'Edit' : 'New'} Opportunity</h2>
                 <button onClick={closeForm}><X /></button>
               </div>
               <form onSubmit={handleSave} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="col-span-2 bg-gray-50 p-3 rounded border border-gray-200 mb-2">
                    <p className="text-sm font-semibold text-[#162A43]">Directions:</p>
                    <p className="text-xs text-gray-600 mt-1">Fill in the details below. Use the checklist to track your progress from research to submission. Marking "Submitted" will auto-complete the list.</p>
                  </div>

                  <div className="col-span-2">
                    <label className={STYLES.label}>Image URL</label>
                    <input className={STYLES.input} value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} placeholder="https://..." />
                  </div>
                  <div><label className={STYLES.label}>Institution</label><input required className={STYLES.input} value={formData.institution} onChange={e => setFormData({...formData, institution: e.target.value})} /></div>
                  <div><label className={STYLES.label}>Program</label><input required className={STYLES.input} value={formData.program} onChange={e => setFormData({...formData, program: e.target.value})} /></div>
                  <div><label className={STYLES.label}>Type</label><select className={STYLES.input} value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}><option>Scholarship</option><option>Job</option></select></div>
                  <div><label className={STYLES.label}>Start Date</label><input type="date" className={STYLES.input} value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} /></div>
                  <div><label className={STYLES.label}>Deadline</label><input type="date" className={STYLES.input} value={formData.deadline} onChange={e => setFormData({...formData, deadline: e.target.value})} /></div>
                  <div><label className={STYLES.label}>Status</label><select className={STYLES.input} value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}><option>Researching</option><option>In Progress</option><option>Drafting</option><option>Submitted</option><option>Accepted</option><option>Rejected</option></select></div>
                  
                  {/* CHECKLIST SECTION IN FORM */}
                  <div className="col-span-2">
                    <label className={STYLES.label}>Application Checklist</label>
                    <div className="grid grid-cols-2 gap-2 mt-2 bg-gray-50 p-3 rounded border border-gray-200">
                      {Object.keys(formData.steps).map(stepKey => (
                        <div key={stepKey} onClick={() => handleChecklistChange(stepKey)} className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-1 rounded">
                          <div className={`w-4 h-4 border rounded flex items-center justify-center ${formData.steps[stepKey] ? 'bg-[#162A43] border-[#162A43]' : 'bg-white border-gray-300'}`}>
                             {formData.steps[stepKey] && <div className="text-white text-xs">✓</div>}
                          </div>
                          <span className="text-sm capitalize select-none">{stepKey.replace(/([A-Z])/g, ' $1').trim()}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="col-span-2 flex justify-end gap-3 mt-4">
                    <button type="button" onClick={closeForm} className={`px-5 py-2.5 rounded ${STYLES.btnOutline}`}>Cancel</button>
                    <button type="submit" disabled={isSubmitting} className={`px-8 py-2.5 rounded font-bold ${STYLES.btnPrimary}`}>
                      {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : "Save to Cloud"}
                    </button>
                  </div>
               </form>
             </div>
           </div>
        )}

        {/* MODALS */}
        {isAboutOpen && <AboutModal onClose={() => setIsAboutOpen(false)} />}
        {isPrivacyOpen && <PrivacyModal onClose={() => setIsPrivacyOpen(false)} />}
        {isTermsOpen && <TermsModal onClose={() => setIsTermsOpen(false)} />}
      </main>

      {/* DASHBOARD FOOTER */}
      <footer className="bg-gray-100 border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
           <div>
             <span className="font-bold text-[#162A43]">ALU Opportunity Tracker</span> &copy; {new Date().getFullYear()}
           </div>
           <div className="flex items-center gap-6">
              <span>Developed by <span className="font-bold text-[#162A43]">dumethode</span></span>
              <a href="#" onClick={(e) => { e.preventDefault(); setIsAboutOpen(true); }} className="hover:text-[#DB2B39] transition-colors">About</a>
              <a href="#" onClick={(e) => { e.preventDefault(); setIsPrivacyOpen(true); }} className="hover:text-[#DB2B39] transition-colors">Privacy</a>
              <a href="#" onClick={(e) => { e.preventDefault(); setIsTermsOpen(true); }} className="hover:text-[#DB2B39] transition-colors">Terms</a>
           </div>
        </div>
      </footer>
    </div>
  );
}

const StatCard = ({ label, value, icon, color }) => (
  <div className={`bg-white p-5 rounded-lg border ${color} flex justify-between`}>
    <div><p className="text-xs text-gray-500 font-bold uppercase">{label}</p><p className="text-3xl font-bold text-[#162A43]">{value}</p></div>
    <div className="text-gray-300 bg-gray-50 p-3 rounded-full">{icon}</div>
  </div>
);

// --- MODALS ---

const AboutModal = ({ onClose }) => (
  <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[70] p-4 backdrop-blur-sm animate-fade-in">
    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden relative">
      <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-black"><X size={24}/></button>
      
      <div className="bg-[#162A43] p-8 text-center text-white">
        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 overflow-hidden p-1">
          <img src={ALU_LOGO_URL} alt="ALU" className="w-full h-full object-cover rounded-full" />
        </div>
        <h2 className="text-2xl font-bold">ALU Opportunity Tracker</h2>
        <p className="text-gray-300 text-sm mt-2">Version 3.0.2</p>
      </div>

      <div className="p-8 space-y-6">
        <div>
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2">About the App</h3>
          <p className="text-gray-600 text-sm leading-relaxed">
            This platform helps ALU students and alumni organize their career journey. Track scholarships, job applications, and deadlines in one secure, cloud-based dashboard.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Credits & Developer</h3>
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 flex items-center gap-4">
            <div className="w-12 h-12 bg-[#162A43] rounded-full flex items-center justify-center text-white font-bold text-xl">D</div>
            <div>
              <p className="font-bold text-[#162A43]">dumethode</p>
              <p className="text-xs text-gray-500">Lead Developer & Designer</p>
            </div>
          </div>
          <div className="flex gap-4 mt-4 justify-center">
             <a href="https://github.com/dumethode" target="_blank" rel="noopener noreferrer" className="p-2 text-gray-400 hover:text-[#162A43] transition-colors"><Github size={20} /></a>
             <a href="https://www.linkedin.com/in/dumethode/" target="_blank" rel="noopener noreferrer" className="p-2 text-gray-400 hover:text-[#0077B5] transition-colors"><Linkedin size={20} /></a>
             <a href="https://www.instagram.com/dumethode/" target="_blank" rel="noopener noreferrer" className="p-2 text-gray-400 hover:text-[#E1306C] transition-colors"><Instagram size={20} /></a>
             <a href="https://twitter.com/dumethode" target="_blank" rel="noopener noreferrer" className="p-2 text-gray-400 hover:text-[#1DA1F2] transition-colors"><Twitter size={20} /></a>
          </div>
        </div>
      </div>
      
      <div className="bg-gray-50 p-4 text-center border-t border-gray-100">
        <p className="text-xs text-gray-400">© 2025 All Rights Reserved. Made with ❤️ in Rwanda.</p>
      </div>
    </div>
  </div>
);

const PrivacyModal = ({ onClose }) => (
  <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[70] p-4 backdrop-blur-sm animate-fade-in">
    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden relative flex flex-col max-h-[80vh]">
      <div className="p-5 border-b flex justify-between items-center bg-gray-50">
        <h3 className="font-bold text-lg">Privacy Policy (Draft)</h3>
        <button onClick={onClose}><X size={20}/></button>
      </div>
      <div className="p-6 overflow-y-auto text-sm text-gray-600 space-y-4">
        <p><strong>Last Updated: November 2025</strong></p>
        <p>Your privacy is important to us. This draft policy outlines how ALU Opportunity Tracker collects, uses, and protects your information.</p>
        <h4 className="font-bold text-gray-800">1. Information We Collect</h4>
        <p>We collect information you provide directly to us, such as your name, email address, and details of the applications you track.</p>
        <h4 className="font-bold text-gray-800">2. How We Use Information</h4>
        <p>We use this information to provide and improve the tracking service, send verification emails, and display your personal dashboard.</p>
        <h4 className="font-bold text-gray-800">3. Data Security</h4>
        <p>We implement appropriate technical measures to protect your personal data against unauthorized access or disclosure.</p>
      </div>
    </div>
  </div>
);

const TermsModal = ({ onClose }) => (
  <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[70] p-4 backdrop-blur-sm animate-fade-in">
    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden relative flex flex-col max-h-[80vh]">
      <div className="p-5 border-b flex justify-between items-center bg-gray-50">
        <h3 className="font-bold text-lg">Terms of Service (Draft)</h3>
        <button onClick={onClose}><X size={20}/></button>
      </div>
      <div className="p-6 overflow-y-auto text-sm text-gray-600 space-y-4">
        <p><strong>Last Updated: November 2025</strong></p>
        <p>By accessing or using ALU Opportunity Tracker, you agree to be bound by these Terms.</p>
        <h4 className="font-bold text-gray-800">1. Use of Service</h4>
        <p>You agree to use the service only for lawful purposes and in accordance with these Terms.</p>
        <h4 className="font-bold text-gray-800">2. Accounts</h4>
        <p>You are responsible for safeguarding the password that you use to access the service.</p>
        <h4 className="font-bold text-gray-800">3. Termination</h4>
        <p>We may terminate or suspend access to our service immediately, without prior notice, for any reason whatsoever.</p>
      </div>
    </div>
  </div>
);
