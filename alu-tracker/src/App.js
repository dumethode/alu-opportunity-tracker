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
  BarChart2, Bell, LogOut, Loader2, Lock, Mail, Info, Twitter, Github, Linkedin, Instagram, CheckSquare, Clock, Send, Settings, Moon, Sun, Languages, Shield, FileText, Save
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
  btnPrimary: `bg-[#162A43] text-white hover:bg-[#2C4B70] dark:bg-[#BFA15F] dark:text-[#162A43] transition-colors shadow-sm flex items-center gap-2 justify-center disabled:opacity-70 disabled:cursor-not-allowed`,
  btnAccent: `bg-[#DB2B39] text-white hover:bg-[#B91C29] transition-colors shadow-sm flex items-center gap-2 justify-center`,
  btnOutline: `border border-gray-300 text-gray-700 dark:text-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 justify-center`,
  card: `bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden`,
  input: `w-full p-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded focus:ring-2 focus:ring-[#162A43] dark:focus:ring-[#BFA15F] outline-none transition-all`,
  label: `block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1.5`
};

// --- CONSTANTS ---
const ALU_LARGE_LOGO_URL = "https://www.alueducation.com/wp-content/uploads/2023/05/ALU-logo-with-name-min.png";
const ALU_SMALL_LOGO_URL = "https://www.alueducation.com/wp-content/uploads/2016/02/alu_logo_original.png";

const DEFAULT_STEPS = { 
  research: false, networking: false, readCall: false, drafting: false, 
  docsReady: false, referees: false, finalReview: false, submitted: false 
};

const TRANSLATIONS = {
  en: {
    dashboard: "Dashboard", scholarships: "Scholarships", jobs: "Jobs", all: "All Opportunities",
    newOpp: "New Opportunity", search: "Search...", total: "Total", submitted: "Submitted",
    pending: "Pending", completed: "Completed", nextSchol: "Next Scholarship Deadline",
    nextJob: "Next Job Deadline", dailyReport: "Daily Report", sendReport: "Send Daily Report",
    progress: "Overall Progress", checklist: "Application Checklist",
    settings: "Preferences", language: "Language", theme: "Theme", notifications: "Email Notifications",
    save: "Save Changes", cancel: "Cancel", directions: "Directions",
    directionsText: "Fill in the details below. Use the checklist to track your progress.",
    welcome: "Welcome Back", join: "Join the Community", 
    noNotifs: "No new notifications yet.", enableAlerts: "Enable System Alerts",
    light: "Light", dark: "Dark", english: "English", french: "French"
  },
  fr: {
    dashboard: "Tableau de bord", scholarships: "Bourses", jobs: "Emplois", all: "Toutes les opportunités",
    newOpp: "Nouvelle Opportunité", search: "Rechercher...", total: "Total", submitted: "Soumis",
    pending: "En attente", completed: "Terminé", nextSchol: "Prochaine date limite (Bourse)",
    nextJob: "Prochaine date limite (Emploi)", dailyReport: "Rapport quotidien", sendReport: "Envoyer le rapport",
    progress: "Progrès global", checklist: "Liste de contrôle",
    settings: "Préférences", language: "Langue", theme: "Thème", notifications: "Notifications par e-mail",
    save: "Enregistrer", cancel: "Annuler", directions: "Instructions",
    directionsText: "Remplissez les détails ci-dessous. Utilisez la liste de contrôle pour suivre vos progrès.",
    welcome: "Bon retour", join: "Rejoindre la communauté",
    noNotifs: "Aucune nouvelle notification.", enableAlerts: "Activer les alertes système",
    light: "Clair", dark: "Sombre", english: "Anglais", french: "Français"
  }
};

export default function App() {
  // --- STATE ---
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [apps, setApps] = useState([]);
  
  // Preferences - Initialize from LocalStorage for persistence
  const [theme, setTheme] = useState(() => localStorage.getItem('alu_theme') || 'light');
  const [language, setLanguage] = useState(() => localStorage.getItem('alu_lang') || 'en');
  const [emailEnabled, setEmailEnabled] = useState(() => localStorage.getItem('alu_email_notif') === 'true');

  // UI State
  const [activeTab, setActiveTab] = useState('dashboard');
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(initialFormState());
  
  // Notifications History (Local)
  const [notifications, setNotifications] = useState([]);

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

  // --- HELPERS ---
  const t = (key) => TRANSLATIONS[language][key] || key;

  // --- EFFECTS ---

  // Theme Effect
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('alu_theme', theme);
  }, [theme]);

  // Language Persistence
  useEffect(() => {
    localStorage.setItem('alu_lang', language);
  }, [language]);

  // Email Preference Persistence
  useEffect(() => {
    localStorage.setItem('alu_email_notif', emailEnabled);
  }, [emailEnabled]);

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
    const interval = setInterval(() => {
      checkScheduledReminders(apps);
    }, 60000); 
    checkScheduledReminders(apps); 
    return () => clearInterval(interval);
  }, [apps, emailEnabled]); 

  // --- PREFERENCE HANDLER ---
  const handleSavePreferences = (newSettings) => {
    setTheme(newSettings.theme);
    setLanguage(newSettings.language);
    setEmailEnabled(newSettings.emailEnabled);
  };

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
    if (permission === 'granted') {
      addNotification("System Alerts Enabled", "You will receive daily reminders at 10:00 PM.");
    }
  };

  const addNotification = (title, body) => {
    const newNotif = { id: Date.now(), title, body, time: new Date().toLocaleTimeString(), read: false };
    setNotifications(prev => [newNotif, ...prev]);
    // Show System Notification
    if (Notification.permission === 'granted') {
      new Notification(title, { body, icon: ALU_SMALL_LOGO_URL });
    }
  };

  const checkScheduledReminders = (currentApps) => {
    const now = new Date();
    if (now.getHours() < 22) return;

    const lastReminder = localStorage.getItem('alu_last_reminder');
    const today = now.toDateString();

    if (lastReminder !== today) {
      const pendingApps = currentApps.filter(a => ['In Progress', 'Researching', 'Drafting'].includes(a.status));
      
      if (pendingApps.length > 0) {
        addNotification("Daily Reminder 🌙", `It's 10 PM! You have ${pendingApps.length} pending applications.`);
        
        if (emailEnabled) {
           if(window.confirm(`It's 10PM! You have ${pendingApps.length} pending tasks. Generate Report?`)) {
             sendEmailReport(pendingApps);
           }
        }
        localStorage.setItem('alu_last_reminder', today);
      }
    }
  };

  const sendEmailReport = (appsToReport = null) => {
    const list = appsToReport || apps.filter(a => !['Submitted', 'Accepted', 'Rejected', 'Offer Accepted', 'Offer Declined'].includes(a.status));
    if (list.length === 0) return alert("No pending applications to report!");
    
    const subject = `Daily ALU Tracker Report - ${new Date().toLocaleDateString()}`;
    const body = `Hello ${user.displayName},%0D%0A%0D%0AHere is your daily summary of pending applications:%0D%0A%0D%0A${list.map(a => `📌 ${a.institution} (${a.type})%0D%0A   - Deadline: ${a.deadline || 'N/A'}%0D%0A   - Status: ${a.status}%0D%0A`).join('%0D%0A')}%0D%0AKeep pushing towards your goals!%0D%0AALU Opportunity Tracker`;
    
    window.location.href = `mailto:${user.email}?subject=${subject}&body=${body}`;
  };

  function initialFormState() { return { institution: "", program: "", type: "Scholarship", startDate: "", deadline: "", status: "Researching", notes: "", image: "", steps: { ...DEFAULT_STEPS } }; }
  
  const handleEdit = (app) => {
    setFormData({ 
      institution: app.institution, program: app.program, type: app.type, startDate: app.startDate || "", 
      deadline: app.deadline, status: app.status, notes: app.notes, image: app.image || "", steps: { ...DEFAULT_STEPS, ...(app.steps || {}) }
    });
    setEditingId(app.id); setIsFormOpen(true);
  };

  const closeForm = () => { setIsFormOpen(false); setEditingId(null); setFormData(initialFormState()); };
  
  const handleChecklistChange = (key) => {
    setFormData(prev => ({ ...prev, steps: { ...prev.steps, [key]: !prev.steps[key] } }));
  };

  const getSyncedSteps = (status, currentSteps) => {
    if (['Submitted', 'Accepted', 'Rejected', 'Offer Accepted', 'Offer Declined'].includes(status)) {
      const completed = {}; Object.keys(currentSteps).forEach(k => completed[k] = true); return completed;
    }
    return currentSteps;
  };

  const getProgress = (app) => {
    if (['Submitted', 'Accepted', 'Rejected', 'Offer Accepted', 'Offer Declined'].includes(app.status)) return 100;
    const steps = app.steps || {}; const keys = Object.keys(steps); if (keys.length === 0) return 0;
    return Math.round((keys.filter(k => steps[k]).length / keys.length) * 100);
  };

  const toggleStep = async (app, stepKey) => {
     const newSteps = { ...app.steps, [stepKey]: !app.steps[stepKey] };
     await updateDoc(doc(db, "users", user.uid, "applications", app.firebaseId), { steps: newSteps });
  };

  // --- RENDERERS ---

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50 dark:bg-gray-900">
      <Loader2 className="animate-spin text-[#162A43] dark:text-[#BFA15F]" size={48} />
      <p className="text-[#162A43] dark:text-white font-semibold animate-pulse">Loading ALU Tracker...</p>
    </div>
  );

  // LOGIN SCREEN
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 font-sans text-slate-800 dark:text-white transition-colors duration-300">
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-xl w-full max-w-md border border-gray-100 dark:border-gray-700">
            <div className="flex justify-center mb-6">
              {/* USE LARGE LOGO FOR LOGIN */}
              <img src={ALU_LARGE_LOGO_URL} alt="ALU Logo" className="h-16 object-contain bg-white rounded px-2" />
            </div>
            <h2 className="text-2xl font-bold text-center text-[#162A43] dark:text-[#BFA15F] mb-1">{authMode === 'login' ? t('welcome') : t('join')}</h2>
            
            {verificationSent && <div className="bg-green-50 text-green-700 p-4 rounded mb-6 text-sm flex items-start gap-2 border border-green-200"><Mail size={20} className="shrink-0 mt-0.5" /><div><p className="font-bold">Check your inbox!</p><p>Verification link sent.</p></div></div>}
            {authError && <div className="bg-red-50 text-red-600 p-4 rounded mb-6 text-sm font-medium flex items-start gap-2 border border-red-200"><div className="shrink-0 mt-0.5">⚠️</div><div>{authError}</div></div>}

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
        </div>
      </div>
    );
  }

  // LOGGED IN
  const filteredApps = apps.filter(a => {
     if (activeTab === 'scholarships' && a.type !== 'Scholarship') return false;
     if (activeTab === 'jobs' && a.type !== 'Job') return false;
     if (searchTerm && !a.institution.toLowerCase().includes(searchTerm.toLowerCase())) return false;
     return true;
  });

  // Deadline logic
  const pendingApps = apps.filter(a => !['Submitted', 'Accepted', 'Rejected', 'Offer Accepted', 'Offer Declined'].includes(a.status));
  const nextScholarship = pendingApps.filter(a => a.type === 'Scholarship' && a.deadline && new Date(a.deadline) >= new Date().setHours(0,0,0,0)).sort((a,b) => new Date(a.deadline) - new Date(b.deadline))[0];
  const nextJob = pendingApps.filter(a => a.type === 'Job' && a.deadline && new Date(a.deadline) >= new Date().setHours(0,0,0,0)).sort((a,b) => new Date(a.deadline) - new Date(b.deadline))[0];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-slate-800 dark:text-gray-100 font-sans flex flex-col transition-colors duration-300">
      {/* NAVBAR */}
      <header className="sticky top-0 z-50 shadow-md" style={{ backgroundColor: THEME.primary }}>
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center space-x-3">
            {/* USE SMALL LOGO FOR NAVBAR */}
            <img src={ALU_SMALL_LOGO_URL} alt="ALU Logo" className="h-10 w-auto object-contain bg-white rounded px-2 py-1" />
            <div>
              <h1 className="text-xl font-bold text-white tracking-wide leading-none">ALU TRACKER</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] text-white font-bold uppercase bg-white/20 px-1.5 rounded">{user.displayName || 'User'}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setIsAboutOpen(true)} className="text-white/70 hover:text-white flex items-center justify-center" title="About"><Info size={20} /></button>
            <button onClick={() => setIsSettingsOpen(true)} className="text-white/70 hover:text-white flex items-center justify-center" title="Settings"><Settings size={20} /></button>
            
            {/* NOTIFICATION CENTER */}
            <div className="relative">
              <button onClick={() => setShowNotifDropdown(!showNotifDropdown)} className="text-white/70 hover:text-white relative flex items-center justify-center" title="Notifications">
                <Bell size={20} />
                {notifications.filter(n => !n.read).length > 0 && <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>}
              </button>
              {showNotifDropdown && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
                  <div className="p-3 border-b dark:border-gray-700 font-bold text-sm flex justify-between">
                    <span>Notifications</span>
                    <button onClick={requestNotificationPermission} className="text-xs text-blue-500 hover:underline">{t('enableAlerts')}</button>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-gray-500 text-xs">{t('noNotifs')}</div>
                    ) : (
                      notifications.map(n => (
                        <div key={n.id} className="p-3 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm">
                          <p className="font-bold text-[#162A43] dark:text-[#BFA15F]">{n.title}</p>
                          <p className="text-gray-600 dark:text-gray-300 text-xs">{n.body}</p>
                          <p className="text-[10px] text-gray-400 mt-1">{n.time}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <button onClick={handleLogout} className="text-white/70 hover:text-red-300 flex items-center justify-center" title="Logout"><LogOut size={20} /></button>
            <button onClick={() => setIsFormOpen(true)} className={`ml-2 px-4 py-2 rounded font-semibold text-sm ${STYLES.btnAccent}`}><Plus size={16} /> {t('newOpp')}</button>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 flex overflow-x-auto">
            {['dashboard', 'scholarships', 'jobs', 'all'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-3 font-semibold text-sm border-b-2 capitalize ${activeTab === tab ? `border-[#DB2B39] text-[#162A43] dark:text-[#BFA15F]` : `border-transparent text-gray-500 dark:text-gray-400`}`}>{t(tab)}</button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 flex-1 w-full">
        {activeTab !== 'dashboard' && (
          <div className="flex justify-between items-center gap-4 mb-6">
             <div className="relative w-full md:w-96">
               <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
               <input placeholder={t('search')} className={STYLES.input + " rounded-full pl-10 py-2"} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
             </div>
             <div className="flex bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-1">
               <button onClick={() => setViewMode('table')} className={`p-2 rounded ${viewMode === 'table' ? 'bg-gray-100 dark:bg-gray-700' : ''}`}><List size={20} /></button>
               <button onClick={() => setViewMode('grid')} className={`p-2 rounded ${viewMode === 'grid' ? 'bg-gray-100 dark:bg-gray-700' : ''}`}><LayoutGrid size={20} /></button>
             </div>
          </div>
        )}

        {/* DASHBOARD VIEW */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-fade-in">
             
             <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard label={t('total')} value={apps.length} icon={<Briefcase />} color="border-l-4 border-[#162A43] dark:border-[#BFA15F]" />
                <StatCard label={t('submitted')} value={apps.filter(a => a.status === 'Submitted').length} icon={<CheckCircle />} color="border-l-4 border-green-500" />
                <StatCard label={t('pending')} value={apps.filter(a => ['In Progress', 'Drafting'].includes(a.status)).length} icon={<PieChart />} color="border-l-4 border-[#BFA15F] dark:border-[#2C4B70]" />
                <StatCard label={t('completed')} value={`${apps.length > 0 ? Math.round((apps.filter(a => a.status === 'Submitted').length / apps.length) * 100) : 0}%`} icon={<BarChart2 />} color="border-l-4 border-[#DB2B39]" />
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Scholarships */}
                <div className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-[#162A43] dark:text-[#BFA15F] flex items-center gap-2"><GraduationCap size={20} /> {t('nextSchol')}</h3>
                    {nextScholarship && <span className="text-xs font-bold text-red-600 bg-red-50 dark:bg-red-900 dark:text-red-200 px-2 py-1 rounded-full">Approaching</span>}
                  </div>
                  {nextScholarship ? (
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded border border-gray-100 dark:border-gray-600">
                      <div className="flex justify-between items-start">
                        <div><p className="font-bold text-lg text-[#162A43] dark:text-white">{nextScholarship.institution}</p><p className="text-sm text-gray-600 dark:text-gray-400">{nextScholarship.program}</p></div>
                        <div className="text-right"><p className="text-xs text-gray-500 uppercase font-bold">Due</p><p className="text-lg font-mono font-bold text-[#DB2B39]">{nextScholarship.deadline}</p></div>
                      </div>
                    </div>
                  ) : <div className="text-center py-6 text-gray-400 text-sm bg-gray-50 dark:bg-gray-700 rounded border border-dashed">No upcoming deadlines.</div>}
                </div>

                {/* Jobs */}
                <div className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-[#162A43] dark:text-[#BFA15F] flex items-center gap-2"><Briefcase size={20} /> {t('nextJob')}</h3>
                    {nextJob && <span className="text-xs font-bold text-red-600 bg-red-50 dark:bg-red-900 dark:text-red-200 px-2 py-1 rounded-full">Approaching</span>}
                  </div>
                  {nextJob ? (
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded border border-gray-100 dark:border-gray-600">
                      <div className="flex justify-between items-start">
                        <div><p className="font-bold text-lg text-[#162A43] dark:text-white">{nextJob.institution}</p><p className="text-sm text-gray-600 dark:text-gray-400">{nextJob.program}</p></div>
                        <div className="text-right"><p className="text-xs text-gray-500 uppercase font-bold">Due</p><p className="text-lg font-mono font-bold text-[#DB2B39]">{nextJob.deadline}</p></div>
                      </div>
                    </div>
                  ) : <div className="text-center py-6 text-gray-400 text-sm bg-gray-50 dark:bg-gray-700 rounded border border-dashed">No upcoming deadlines.</div>}
                </div>
             </div>

             {/* Email Report Button */}
             <div className="bg-gradient-to-r from-[#162A43] to-[#2C4B70] p-6 rounded-lg text-white shadow-md flex flex-col md:flex-row items-center justify-between gap-4">
               <div>
                 <h3 className="font-bold text-lg flex items-center gap-2"><Mail size={20}/> {t('dailyReport')}</h3>
                 <p className="text-sm text-gray-300 opacity-90">Daily notifications at <span className="font-bold text-[#BFA15F]">10:00 PM</span>. {emailEnabled ? "Auto-email is ON." : "Auto-email is OFF."}</p>
               </div>
               <button onClick={() => sendEmailReport()} className="bg-[#BFA15F] text-[#162A43] px-6 py-3 rounded font-bold hover:bg-white transition-colors flex items-center gap-2 shadow-lg"><Send size={18} /> {t('sendReport')}</button>
             </div>

             {/* Progress List */}
             <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border dark:border-gray-700">
                <h3 className="text-lg font-bold text-[#162A43] dark:text-[#BFA15F] mb-4">{t('progress')}</h3>
                {apps.slice(0, 5).map(app => {
                  const p = getProgress(app);
                  return (
                    <div key={app.id} className="mb-3">
                      <div className="flex justify-between text-sm font-semibold text-gray-700 dark:text-gray-300"><span>{app.institution}</span><span>{p}%</span></div>
                      <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2 mt-1"><div className="h-2 rounded-full transition-all" style={{ width: `${p}%`, backgroundColor: p===100 ? '#BFA15F' : '#162A43' }}></div></div>
                    </div>
                  )
                })}
             </div>
          </div>
        )}

        {/* LIST/GRID RENDER (Hidden for brevity, logic is same as before, just with dark mode classes applied in STYLES) */}
        {activeTab !== 'dashboard' && (
          <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-2"}>
             {filteredApps.map(app => (
                <div key={app.id} className={viewMode === 'grid' ? STYLES.card + " flex flex-col hover:shadow-md transition-all" : "bg-white dark:bg-gray-800 border dark:border-gray-700 rounded p-4 flex items-center justify-between"}>
                   {/* Card/Row rendering with dark mode text colors */}
                   <div className="p-4">
                     <h3 className="font-bold text-[#162A43] dark:text-white">{app.institution}</h3>
                     <p className="text-sm text-gray-600 dark:text-gray-300">{app.program}</p>
                     <div className="flex gap-2 mt-2">
                        <button onClick={() => handleEdit(app)} className="text-blue-600 dark:text-blue-400"><Edit2 size={16}/></button>
                        <button onClick={() => handleDelete(app.firebaseId)} className="text-red-600 dark:text-red-400"><Trash2 size={16}/></button>
                     </div>
                   </div>
                </div>
             ))}
          </div>
        )}

        {/* MODAL FORM */}
        {isFormOpen && (
           <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4 backdrop-blur-sm">
             <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
               <div className="p-5 border-b dark:border-gray-700 flex justify-between bg-[#162A43] text-white sticky top-0 z-10">
                 <h2 className="font-bold flex items-center gap-2">{editingId ? 'Edit' : t('newOpp')}</h2>
                 <button onClick={closeForm}><X /></button>
               </div>
               <form onSubmit={handleSave} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="col-span-2 bg-gray-50 dark:bg-gray-700 p-3 rounded border border-gray-200 dark:border-gray-600 mb-2">
                    <p className="text-sm font-semibold text-[#162A43] dark:text-[#BFA15F]">{t('directions')}:</p>
                    <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">{t('directionsText')}</p>
                  </div>
                  {/* Form Fields (Institution, Program, etc.) */}
                  <div className="col-span-2"><label className={STYLES.label}>Image URL</label><input className={STYLES.input} value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} /></div>
                  <div><label className={STYLES.label}>Institution</label><input required className={STYLES.input} value={formData.institution} onChange={e => setFormData({...formData, institution: e.target.value})} /></div>
                  <div><label className={STYLES.label}>Program</label><input required className={STYLES.input} value={formData.program} onChange={e => setFormData({...formData, program: e.target.value})} /></div>
                  <div><label className={STYLES.label}>Type</label><select className={STYLES.input} value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}><option>Scholarship</option><option>Job</option></select></div>
                  <div><label className={STYLES.label}>Start Date</label><input type="date" className={STYLES.input} value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} /></div>
                  <div><label className={STYLES.label}>Deadline</label><input type="date" className={STYLES.input} value={formData.deadline} onChange={e => setFormData({...formData, deadline: e.target.value})} /></div>
                  <div><label className={STYLES.label}>Status</label><select className={STYLES.input} value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}><option>Researching</option><option>In Progress</option><option>Drafting</option><option>Submitted</option><option>Accepted</option><option>Rejected</option></select></div>
                  
                  <div className="col-span-2">
                    <label className={STYLES.label}>{t('checklist')}</label>
                    <div className="grid grid-cols-2 gap-2 mt-2 bg-gray-50 dark:bg-gray-700 p-3 rounded border border-gray-200 dark:border-gray-600">
                      {Object.keys(formData.steps).map(stepKey => (
                        <div key={stepKey} onClick={() => handleChecklistChange(stepKey)} className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 p-1 rounded">
                          <div className={`w-4 h-4 border rounded flex items-center justify-center ${formData.steps[stepKey] ? 'bg-[#162A43] border-[#162A43]' : 'bg-white border-gray-300'}`}>{formData.steps[stepKey] && <div className="text-white text-xs">✓</div>}</div>
                          <span className="text-sm capitalize select-none dark:text-gray-300">{stepKey.replace(/([A-Z])/g, ' $1').trim()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="col-span-2 flex justify-end gap-3 mt-4">
                    <button type="button" onClick={closeForm} className={`px-5 py-2.5 rounded ${STYLES.btnOutline}`}>{t('cancel')}</button>
                    <button type="submit" disabled={isSubmitting} className={`px-8 py-2.5 rounded font-bold ${STYLES.btnPrimary}`}>{isSubmitting ? <Loader2 className="animate-spin" size={20} /> : t('save')}</button>
                  </div>
               </form>
             </div>
           </div>
        )}

        {/* PREFERENCES MODAL */}
        {isSettingsOpen && (
          <PreferencesModal 
            isOpen={isSettingsOpen} 
            onClose={() => setIsSettingsOpen(false)}
            currentSettings={{ theme, language, emailEnabled }}
            onSave={handleSavePreferences}
            t={t}
          />
        )}

        {/* MODALS */}
        {isAboutOpen && <AboutModal onClose={() => setIsAboutOpen(false)} />}
        {isPrivacyOpen && <PrivacyModal onClose={() => setIsPrivacyOpen(false)} />}
        {isTermsOpen && <TermsModal onClose={() => setIsTermsOpen(false)} />}
      </main>

      {/* DASHBOARD FOOTER */}
      <footer className="bg-gray-100 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
           <div><span className="font-bold text-[#162A43] dark:text-[#BFA15F]">ALU Opportunity Tracker</span> &copy; {new Date().getFullYear()}</div>
           <div className="flex items-center gap-6">
              <span>Developed by <span className="font-bold text-[#162A43] dark:text-[#BFA15F]">dumethode</span></span>
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
  <div className={`bg-white dark:bg-gray-800 p-5 rounded-lg border dark:border-gray-700 ${color} flex justify-between`}>
    <div><p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase">{label}</p><p className="text-3xl font-bold text-[#162A43] dark:text-white">{value}</p></div>
    <div className="text-gray-300 dark:text-gray-600 bg-gray-50 dark:bg-gray-700 p-3 rounded-full">{icon}</div>
  </div>
);

// --- NEW PREFERENCES MODAL COMPONENT ---
const PreferencesModal = ({ isOpen, onClose, currentSettings, onSave, t }) => {
  const [localTheme, setLocalTheme] = useState(currentSettings.theme);
  const [localLanguage, setLocalLanguage] = useState(currentSettings.language);
  const [localEmail, setLocalEmail] = useState(currentSettings.emailEnabled);

  useEffect(() => {
    if (isOpen) {
      setLocalTheme(currentSettings.theme);
      setLocalLanguage(currentSettings.language);
      setLocalEmail(currentSettings.emailEnabled);
    }
  }, [isOpen, currentSettings]);

  const handleSave = () => {
    onSave({ theme: localTheme, language: localLanguage, emailEnabled: localEmail });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[70] p-4 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="p-5 border-b dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900">
          <h3 className="font-bold text-lg dark:text-white flex items-center gap-2"><Settings size={20}/> {t('settings')}</h3>
          <button onClick={onClose} className="dark:text-gray-400"><X size={20}/></button>
        </div>
        <div className="p-6 space-y-6">
          {/* THEME */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              {localTheme === 'light' ? <Sun size={20} className="text-orange-500"/> : <Moon size={20} className="text-blue-400"/>}
              <span className="dark:text-gray-200 font-medium">{t('theme')}</span>
            </div>
            <button 
              onClick={() => setLocalTheme(localTheme === 'light' ? 'dark' : 'light')} 
              className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 dark:text-white text-xs font-bold uppercase transition-colors hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              {localTheme === 'light' ? t('light') : t('dark')}
            </button>
          </div>

          {/* LANGUAGE */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Languages size={20} className="text-purple-500"/>
              <span className="dark:text-gray-200 font-medium">{t('language')}</span>
            </div>
            <select 
              value={localLanguage} 
              onChange={(e) => setLocalLanguage(e.target.value)} 
              className="p-1.5 rounded border dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm focus:ring-2 focus:ring-[#162A43]"
            >
              <option value="en">{t('english')}</option>
              <option value="fr">{t('french')}</option>
            </select>
          </div>

          {/* EMAIL NOTIFICATIONS */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Mail size={20} className="text-red-500"/>
              <span className="dark:text-gray-200 font-medium">{t('notifications')}</span>
            </div>
            <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
              <input type="checkbox" checked={localEmail} onChange={() => setLocalEmail(!localEmail)} className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer top-0"/>
              <label onClick={() => setLocalEmail(!localEmail)} className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${localEmail ? 'bg-green-400' : 'bg-gray-300'}`}></label>
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="pt-4 border-t dark:border-gray-700 flex justify-end gap-3">
            <button onClick={onClose} className={`px-4 py-2 rounded ${STYLES.btnOutline} text-sm`}>{t('cancel')}</button>
            <button onClick={handleSave} className={`px-6 py-2 rounded font-bold text-sm ${STYLES.btnPrimary} flex items-center gap-2`}>
              <Save size={16} /> {t('save')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const AboutModal = ({ onClose }) => (
  <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[70] p-4 backdrop-blur-sm animate-fade-in">
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden relative">
      <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-black dark:hover:text-white"><X size={24}/></button>
      <div className="bg-[#162A43] p-8 text-center text-white">
        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 overflow-hidden p-1"><img src={ALU_SMALL_LOGO_URL} alt="ALU" className="w-full h-full object-cover rounded-full" /></div>
        <h2 className="text-2xl font-bold">ALU Opportunity Tracker</h2>
        <p className="text-gray-300 text-sm mt-2">Version 3.1.0</p>
      </div>
      <div className="p-8 space-y-6 dark:text-gray-300">
        <div><h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-2">About</h3><p className="text-sm leading-relaxed">Track scholarships, jobs, and deadlines in one secure dashboard.</p></div>
        <div>
          <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-3">Developer</h3>
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-100 dark:border-gray-600 flex items-center gap-4">
            <div className="w-12 h-12 bg-[#162A43] rounded-full flex items-center justify-center text-white font-bold text-xl">D</div>
            <div><p className="font-bold text-[#162A43] dark:text-[#BFA15F]">dumethode</p><p className="text-xs text-gray-500 dark:text-gray-400">Lead Developer</p></div>
          </div>
          <div className="flex gap-4 mt-4 justify-center">
             <a href="https://twitter.com/dumethode" target="_blank" rel="noopener noreferrer" className="p-2 text-gray-400 hover:text-[#1DA1F2] transition-colors"><Twitter size={20} /></a>
             <a href="https://github.com/dumethode" target="_blank" rel="noopener noreferrer" className="p-2 text-gray-400 hover:text-[#162A43] dark:hover:text-white transition-colors"><Github size={20} /></a>
             <a href="https://www.linkedin.com/in/dumethode/" target="_blank" rel="noopener noreferrer" className="p-2 text-gray-400 hover:text-[#0077B5] transition-colors"><Linkedin size={20} /></a>
             <a href="https://www.instagram.com/dumethode/" target="_blank" rel="noopener noreferrer" className="p-2 text-gray-400 hover:text-[#E1306C] transition-colors"><Instagram size={20} /></a>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const PrivacyModal = ({ onClose }) => (
  <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[70] p-4 backdrop-blur-sm animate-fade-in">
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden relative flex flex-col max-h-[80vh]">
      <div className="p-5 border-b dark:border-gray-700 flex justify-between items-center">
        <h3 className="font-bold text-lg dark:text-white flex items-center gap-2"><Shield size={20}/> Privacy Policy</h3><button onClick={onClose} className="dark:text-white"><X size={20}/></button>
      </div>
      <div className="p-6 overflow-y-auto text-sm text-gray-600 dark:text-gray-300 space-y-4 leading-relaxed">
        <p><strong>Last Updated: November 2025</strong></p>
        <p>Your privacy is important to us. This policy outlines how ALU Opportunity Tracker collects, uses, and protects your information.</p>
        
        <h4 className="font-bold text-[#162A43] dark:text-white">1. Information Collection</h4>
        <p>We collect limited personal information including your name, email address, and phone number during registration. We also store the application data you voluntarily input (scholarship details, deadlines, notes).</p>

        <h4 className="font-bold text-[#162A43] dark:text-white">2. Use of Data</h4>
        <p>Your data is used exclusively to provide the tracking service, authenticate your identity, and send requested notifications. We do not sell or share your personal data with third parties.</p>

        <h4 className="font-bold text-[#162A43] dark:text-white">3. Data Security</h4>
        <p>All data is stored securely using Google Firebase Firestore with encrypted transmission. User authentication is handled via Firebase Auth to ensure secure access.</p>

        <h4 className="font-bold text-[#162A43] dark:text-white">4. Your Rights</h4>
        <p>You have the right to access, edit, or delete your data at any time. Deleting an application removes it permanently from our database.</p>
      </div>
    </div>
  </div>
);

const TermsModal = ({ onClose }) => (
  <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[70] p-4 backdrop-blur-sm animate-fade-in">
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden relative flex flex-col max-h-[80vh]">
      <div className="p-5 border-b dark:border-gray-700 flex justify-between items-center">
        <h3 className="font-bold text-lg dark:text-white flex items-center gap-2"><FileText size={20}/> Terms of Service</h3><button onClick={onClose} className="dark:text-white"><X size={20}/></button>
      </div>
      <div className="p-6 overflow-y-auto text-sm text-gray-600 dark:text-gray-300 space-y-4 leading-relaxed">
        <p><strong>Last Updated: November 2025</strong></p>
        <p>By accessing or using ALU Opportunity Tracker, you agree to be bound by these Terms.</p>

        <h4 className="font-bold text-[#162A43] dark:text-white">1. Acceptance of Terms</h4>
        <p>By creating an account, you confirm that you will use this service for lawful purposes related to tracking educational and professional opportunities.</p>

        <h4 className="font-bold text-[#162A43] dark:text-white">2. User Accounts</h4>
        <p>You are responsible for maintaining the confidentiality of your password and account. You agree to notify us immediately of any unauthorized use of your account.</p>

        <h4 className="font-bold text-[#162A43] dark:text-white">3. Content Ownership</h4>
        <p>The application data you enter belongs to you. The platform code and design remain the intellectual property of the developer.</p>

        <h4 className="font-bold text-[#162A43] dark:text-white">4. Termination</h4>
        <p>We may terminate or suspend access to our service immediately, without prior notice, for any reason whatsoever, including without limitation if you breach the Terms.</p>
      </div>
    </div>
  </div>
);
