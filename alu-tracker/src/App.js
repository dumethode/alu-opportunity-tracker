import React, { useState, useEffect } from 'react';
import { initializeApp } from "firebase/app";
import { 
  getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile, sendEmailVerification 
} from "firebase/auth";
import { 
  getFirestore, collection, addDoc, updateDoc, deleteDoc, doc, setDoc, onSnapshot, query, orderBy, getDoc 
} from "firebase/firestore";
import { 
  Plus, Search, Trash2, Edit2, CheckCircle, Briefcase, GraduationCap, 
  X, LayoutGrid, List, PieChart, User,
  BarChart2, Bell, LogOut, Loader2, Lock, Mail, Info, Twitter, Github, Linkedin, Instagram, CheckSquare, Send, Settings, Moon, Sun, Languages, Shield, FileText, Save, Link as LinkIcon, Image as ImageIcon, Wrench, FileText as DocumentIcon, PenTool, Download, Eye, Wand2, Clock, Calendar
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
let app;
try {
  app = initializeApp(firebaseConfig);
} catch (error) {
  console.log("Firebase already initialized");
}
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
  btnPrimary: `bg-[#162A43] text-white hover:bg-[#2C4B70] dark:bg-[#BFA15F] dark:text-[#162A43] transition-colors shadow-sm flex items-center gap-2 justify-center disabled:opacity-70 disabled:cursor-not-allowed px-4 py-2 rounded font-bold text-sm`,
  btnSecondary: `bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-white transition-colors flex items-center gap-2 justify-center px-4 py-2 rounded font-bold text-sm`,
  btnOutline: `border border-gray-300 text-gray-700 dark:text-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 justify-center px-4 py-2 rounded text-sm`,
  card: `bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden`,
  input: `w-full p-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded focus:ring-2 focus:ring-[#162A43] dark:focus:ring-[#BFA15F] outline-none transition-all`,
  label: `block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1.5`,
  tabActive: `border-b-2 border-[#162A43] dark:border-[#BFA15F] text-[#162A43] dark:text-[#BFA15F] font-bold`,
  tabInactive: `text-gray-500 dark:text-gray-400 hover:text-gray-700`
};

const ALU_SMALL_LOGO_URL = "https://www.alueducation.com/wp-content/uploads/2016/02/alu_logo_original.png";
const ALU_LARGE_LOGO_URL = "https://www.alueducation.com/wp-content/uploads/2023/05/ALU-logo-with-name-min.png";

const DEFAULT_STEPS = { research: false, networking: false, readCall: false, drafting: false, docsReady: false, referees: false, finalReview: false, submitted: false };

// --- INITIAL DATA (Based on your CV) ---
const INITIAL_PROFILE = {
  fullName: "Methode Duhujubumwe",
  contactInfo: "KG 26 Street, Kigali, Rwanda | +250 790 265 770",
  email: "duhujubumwe@icloud.com",
  linkedin: "linkedin.com/in/dumethode",
  summary: "Motivated educator and technology enthusiast passionate about making learning accessible for all. Over two years of experience in digital learning, training, and community impact projects. Proven expertise in facilitating technological adoption for diverse populations, delivering comprehensive training programs, and managing stakeholder engagement initiatives.",
  education: [
    { school: "Kepler College", degree: "Bachelor of Arts in Project Management", year: "Sept 2022 - Aug 2025", grade: "77.74% (Second Upper-Class)", coursework: "Financial Management, Org Behavior, Operations Management, Stakeholder Management" },
    { school: "ALX Africa", degree: "Software Engineering Certificate (Backend)", year: "May 2023 - Oct 2024", grade: "", coursework: "Systems development, database management, technical problem-solving" }
  ],
  experience: [
    { role: "Program Coordinator & Finance Intern", company: "Bible Society of Rwanda", date: "May 2024 - Feb 2025", description: "• Managed financial operations for 50+ partner organizations with 100% accuracy.\n• Developed Excel-based dashboards reducing report preparation time by 40%.\n• Designed and implemented standardized data collection templates improving data quality by 35%.\n• Established systematic filing systems for financial documents ensuring audit compliance and reducing retrieval time by 50%." },
    { role: "Customer Support & Call Center Agent", company: "BBOXX Rwanda", date: "Mar 2025 - Sep 2025", description: "• Processed over 80 daily payment transactions with 99% accuracy while managing customer accounts.\n• Created user-friendly support guides and video tutorials reducing customer complaints by 30%.\n• Reconciled daily transactions and resolved payment discrepancies for Finance teams.\n• Facilitated cross-departmental communication reducing response time by 20%." },
    { role: "Computer Applications Learning Assistant", company: "Kepler College", date: "May 2023 - Apr 2024", description: "• Trained 100+ students on Microsoft Office and Google Workspace achieving 90% proficiency.\n• Created video tutorials and step-by-step guides reducing support requests by 40%.\n• Maintained student performance databases using Excel to track achievement trends." },
    { role: "Event Operations Coordinator (Volunteer)", company: "Unleash Rwanda", date: "Dec 2023 - Jan 2024", description: "• Coordinated logistics for international innovation summit with 300+ participants from 45 countries.\n• Managed vendor contracts, registrations, and facility operations delivering seamless event experience.\n• Analyzed operational data to prepare post-event evaluation reports." }
  ],
  volunteering: [
    { role: "Co-Founder & Program Manager", company: "Raise Them Foundation", date: "Feb 2023 - Present", description: "• Co-founded a scholarship program sponsoring high school students with tuition and mentorship.\n• Developed fundraising strategies and built partnerships with schools and donors.\n• Managed program budgets and financial forecasting while preparing quarterly reports." },
    { role: "Founder & Community Mobilizer", company: "Turye Neza Youth Club", date: "Jan 2021 - Present", description: "• Mobilized 20+ youth volunteers to establish vegetable gardens for vulnerable families.\n• Partnered with local authorities to implement sustainable agriculture programs.\n• Trained 15 families in gardening techniques and nutritional meal planning." }
  ],
  awards: "Aspire Leaders Program Alumni (2024) | School Leadership Award (G.S. Rilima 2021)",
  skills: "Project Management, Financial Modeling, QuickBooks, Excel/Data Studio, SQL, HTML/CSS/JS, Stakeholder Management, Training & Facilitation",
  customSections: [] 
};

const COVER_LETTER_TEMPLATE = `[Date Today]

Hiring Team,
{{COMPANY_NAME}}
Kigali, Rwanda

Subject: Application for {{POSITION_TITLE}}

Dear Hiring Team,

I would like to express my profound interest in the {{POSITION_TITLE}} position at {{COMPANY_NAME}}. Having followed your reputation for reliability, I am confident that my background in project management and customer-focused administration aligns perfectly with your mission.

My academic foundation in project management, coupled with extensive practical experience in administrative and financial documentation, provides me with a deep understanding of the core concepts vital to this role. In my previous role, I was responsible for processing and reconciling over 150 financial documents weekly and maintaining financial records with an exceptional 99% data accuracy.

I am a motivated person, and I work hard to reach goals. I aim to utilize my expertise to attract new clients and foster strong relationships with them in the expanding Rwandan market.

Thank you for reviewing my application and considering my suitability for this opportunity. I look forward to the possibility of discussing this position further.

Sincerely,

{{FULL_NAME}}
{{CONTACT_INFO}}`;

const TRANSLATIONS = {
  en: {
    dashboard: "Dashboard", scholarships: "Scholarships", jobs: "Jobs", profile: "Profile", all: "All Opportunities",
    newOpp: "New Opportunity", search: "Search...", total: "Total", submitted: "Submitted",
    pending: "Pending", completed: "Completed", nextSchol: "Next Scholarship Deadline",
    nextJob: "Next Job Deadline", dailyReport: "Daily Report", sendReport: "Send Daily Report",
    progress: "Overall Progress", checklist: "Application Checklist",
    settings: "Preferences", language: "Language", theme: "Theme", notifications: "Email Notifications",
    save: "Save Changes", cancel: "Cancel", directions: "Directions",
    directionsText: "Fill in the details below. Use the checklist to track your progress.",
    welcome: "Welcome Back", join: "Join the Community", 
    noNotifs: "No new notifications yet.", enableAlerts: "Enable System Alerts",
    light: "Light", dark: "Dark", english: "English", french: "French",
    imgUrl: "Image URL (Logo/Banner)", pasteUrl: "Paste image link here...",
    jdLabel: "Job Description / Requirements", tools: "Application Tools", 
    resumeBuilder: "Resume Builder", coverLetter: "Cover Letter", viewJD: "View Description"
  },
  fr: {
    dashboard: "Tableau de bord", scholarships: "Bourses", jobs: "Emplois", profile: "Profil", all: "Toutes les opportunités",
    newOpp: "Nouvelle Opportunité", search: "Rechercher...", total: "Total", submitted: "Soumis",
    pending: "En attente", completed: "Terminé", nextSchol: "Prochaine date limite (Bourse)",
    nextJob: "Prochaine date limite (Emploi)", dailyReport: "Rapport quotidien", sendReport: "Envoyer le rapport",
    progress: "Progrès global", checklist: "Liste de contrôle",
    settings: "Préférences", language: "Langue", theme: "Thème", notifications: "Notifications par e-mail",
    save: "Enregistrer", cancel: "Annuler", directions: "Instructions",
    directionsText: "Remplissez les détails ci-dessous. Utilisez la liste de contrôle pour suivre vos progrès.",
    welcome: "Bon retour", join: "Rejoindre la communauté",
    noNotifs: "Aucune nouvelle notification.", enableAlerts: "Activer les alertes système",
    light: "Clair", dark: "Sombre", english: "Anglais", french: "Français",
    imgUrl: "URL de l'image", pasteUrl: "Coller le lien ici...",
    jdLabel: "Description du poste", tools: "Outils",
    resumeBuilder: "CV Intelligent", coverLetter: "Lettre de motivation", viewJD: "Voir Description"
  }
};

// --- MAIN COMPONENT ---
export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [apps, setApps] = useState([]);
  const [userProfile, setUserProfile] = useState(INITIAL_PROFILE);
  
  // UI State
  const [activeTab, setActiveTab] = useState('dashboard');
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState("");
  
  // Preferences
  const [theme, setTheme] = useState(() => localStorage.getItem('alu_theme') || 'light');
  const [language, setLanguage] = useState(() => localStorage.getItem('alu_lang') || 'en');
  const [emailEnabled, setEmailEnabled] = useState(() => localStorage.getItem('alu_email_notif') === 'true');
  
  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(initialFormState());
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // Auth
  const [authMode, setAuthMode] = useState('login'); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [surname, setSurname] = useState('');
  const [phone, setPhone] = useState('');
  const [authError, setAuthError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);

  const t = (key) => TRANSLATIONS[language][key] || key;

  // --- EFFECTS ---
  useEffect(() => {
    // Load PDF Script dynamically
    const script = document.createElement('script');
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
    script.async = true;
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); }
  }, []);

  useEffect(() => {
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.setItem('alu_theme', theme);
  }, [theme]);

  useEffect(() => { localStorage.setItem('alu_lang', language); }, [language]);
  useEffect(() => { localStorage.setItem('alu_email_notif', emailEnabled); }, [emailEnabled]);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser && currentUser.emailVerified) {
        setUser(currentUser);
        // Fetch User Profile
        const docRef = doc(db, "users", currentUser.uid, "data", "profile");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            setUserProfile({...INITIAL_PROFILE, ...docSnap.data()});
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Data Listener
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "users", user.uid, "applications"), orderBy("id", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setApps(snapshot.docs.map(doc => ({ ...doc.data(), firebaseId: doc.id })));
    });
    return () => unsubscribe();
  }, [user]);

  // Notification Timer
  useEffect(() => {
    const interval = setInterval(() => checkScheduledReminders(apps), 60000); 
    checkScheduledReminders(apps); // Check once on mount
    return () => clearInterval(interval);
  }, [apps, emailEnabled]);

  // --- HANDLERS ---
  const handleSavePreferences = (newSettings) => {
    setTheme(newSettings.theme);
    setLanguage(newSettings.language);
    setEmailEnabled(newSettings.emailEnabled);
    localStorage.setItem('alu_theme', newSettings.theme);
    localStorage.setItem('alu_lang', newSettings.language);
    localStorage.setItem('alu_email_notif', newSettings.emailEnabled);
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError('');
    setIsSubmitting(true);
    try {
      if (authMode === 'login') {
        const cred = await signInWithEmailAndPassword(auth, email, password);
        if (!cred.user.emailVerified) {
          try { await sendEmailVerification(cred.user); } catch(e){}
          setAuthError("Account not verified. Please verify your email first.");
          await signOut(auth);
        }
      } else {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(cred.user, { displayName: `${firstName} ${surname}` });
        await setDoc(doc(db, "users", cred.user.uid), { firstName, surname, phone, email, uid: cred.user.uid, createdAt: new Date().toISOString() });
        await sendEmailVerification(cred.user);
        setVerificationSent(true);
        setAuthMode('login');
        await signOut(auth);
      }
    } catch (err) { setAuthError(err.message.replace("Firebase:", "").trim()); }
    finally { setIsSubmitting(false); }
  };

  const handleSaveApp = async (e) => {
    e.preventDefault();
    if (!user) return;
    setIsSubmitting(true);
    const appData = { ...formData };
    try {
      if (editingId) {
        const appToUpdate = apps.find(a => a.id === editingId);
        await updateDoc(doc(db, "users", user.uid, "applications", appToUpdate.firebaseId), appData);
      } else {
        await addDoc(collection(db, "users", user.uid, "applications"), { ...appData, id: Date.now() });
      }
      setIsFormOpen(false);
      setFormData(initialFormState());
      setEditingId(null);
    } catch (err) { alert(err.message); }
    finally { setIsSubmitting(false); }
  };

  const handleSaveProfile = async (newProfile) => {
    if (!user) return;
    setUserProfile(newProfile);
    await setDoc(doc(db, "users", user.uid, "data", "profile"), newProfile);
    alert("Master Profile Saved!");
  };

  const openTools = (app) => {
    setSelectedApp(app);
    setIsToolsOpen(true);
  };

  const handleLogout = () => {
    setApps([]); 
    signOut(auth);
  };

  const addNotification = (title, body) => {
    setNotifications(prev => [{ id: Date.now(), title, body, time: new Date().toLocaleTimeString(), read: false }, ...prev]);
    if (Notification.permission === 'granted') new Notification(title, { body, icon: ALU_SMALL_LOGO_URL });
  };

  const checkScheduledReminders = (currentApps) => {
    const now = new Date();
    // ONLY trigger at 22:00 (10 PM) or later
    if (now.getHours() < 22) return;

    const lastReminder = localStorage.getItem('alu_last_reminder');
    const today = now.toDateString();

    if (lastReminder !== today) {
      const pendingApps = currentApps.filter(a => ['In Progress', 'Researching', 'Drafting'].includes(a.status));
      if (pendingApps.length > 0) {
        addNotification("Daily Reminder 🌙", `It's 10 PM! ${pendingApps.length} pending applications.`);
        if (emailEnabled && window.confirm(`10 PM Check: Generate Daily Report?`)) sendEmailReport(pendingApps);
        localStorage.setItem('alu_last_reminder', today);
      }
    }
  };

  const sendEmailReport = (appsToReport = null) => {
    const list = appsToReport || apps.filter(a => !['Submitted', 'Accepted', 'Rejected'].includes(a.status));
    const subject = `Daily ALU Tracker Report`;
    const body = `Hello ${user.displayName},%0D%0A%0D%0AHere is your summary:%0D%0A%0D%0A${list.map(a => `📌 ${a.institution}%0D%0A   Deadline: ${a.deadline || 'N/A'} | Status: ${a.status}%0D%0A`).join('%0D%0A')}`;
    window.location.href = `mailto:${user.email}?subject=${subject}&body=${body}`;
  };
  
  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) return;
    const permission = await Notification.requestPermission();
    if (permission === 'granted') addNotification("System Alerts Enabled", "You will receive daily reminders at 10:00 PM.");
  };

  function initialFormState() { return { institution: "", program: "", type: "Scholarship", startDate: "", deadline: "", status: "Researching", notes: "", jobDescription: "", image: "", steps: { ...DEFAULT_STEPS } }; }
  
  const handleEdit = (app) => {
    setFormData({ 
      institution: app.institution, program: app.program, type: app.type, startDate: app.startDate || "", 
      deadline: app.deadline, status: app.status, notes: app.notes, jobDescription: app.jobDescription || "", image: app.image || "", steps: { ...DEFAULT_STEPS, ...(app.steps || {}) }
    });
    setEditingId(app.id); setIsFormOpen(true);
  };

  const closeForm = () => { setIsFormOpen(false); setEditingId(null); setFormData(initialFormState()); };
  const handleChecklistChange = (key) => { setFormData(prev => ({ ...prev, steps: { ...prev.steps, [key]: !prev.steps[key] } })); };
  const getProgress = (app) => { if (['Submitted', 'Accepted', 'Rejected'].includes(app.status)) return 100; const s=app.steps||{}; const k=Object.keys(s); if(!k.length)return 0; return Math.round((k.filter(x=>s[x]).length/k.length)*100); };
  const getFormProgress = () => { const s=formData.steps; const k=Object.keys(s); return Math.round((k.filter(x=>s[x]).length/k.length)*100); }

  const toggleStep = async (app, stepKey) => {
     const newSteps = { ...app.steps, [stepKey]: !app.steps[stepKey] };
     await updateDoc(doc(db, "users", user.uid, "applications", app.firebaseId), { steps: newSteps });
  };

  // --- RENDERERS ---
  if (loading) return <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50 dark:bg-gray-900"><Loader2 className="animate-spin text-[#162A43] dark:text-[#BFA15F]" size={48} /><p className="text-[#162A43] dark:text-white font-semibold animate-pulse">Loading ALU Tracker...</p></div>;

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 font-sans text-slate-800 dark:text-white transition-colors duration-300">
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-xl w-full max-w-md border border-gray-100 dark:border-gray-700">
            <div className="flex justify-center mb-6"><img src={ALU_LARGE_LOGO_URL} alt="ALU" className="h-16 object-contain bg-white rounded px-2" /></div>
            <h2 className="text-2xl font-bold text-center text-[#162A43] dark:text-[#BFA15F] mb-1">{authMode === 'login' ? t('welcome') : t('join')}</h2>
            {verificationSent && <div className="bg-green-50 text-green-700 p-4 rounded mb-6 text-sm font-bold">Verification link sent. Check your inbox.</div>}
            {authError && <div className="bg-red-50 text-red-600 p-4 rounded mb-6 text-sm font-medium flex items-start gap-2 border border-red-200"><div>{authError}</div></div>}
            <form onSubmit={handleAuth} className="space-y-4">
              {authMode === 'signup' && (<>
                  <div className="grid grid-cols-2 gap-3"><div><label className={STYLES.label}>First Name</label><input required className={STYLES.input} value={firstName} onChange={e => setFirstName(e.target.value)} /></div><div><label className={STYLES.label}>Surname</label><input required className={STYLES.input} value={surname} onChange={e => setSurname(e.target.value)} /></div></div>
                  <div><label className={STYLES.label}>Phone</label><input required type="tel" className={STYLES.input} value={phone} onChange={e => setPhone(e.target.value)} /></div>
              </>)}
              <div><label className={STYLES.label}>Email</label><input type="email" required className={STYLES.input} value={email} onChange={e => setEmail(e.target.value)} /></div>
              <div><label className={STYLES.label}>Password</label><input type="password" required className={STYLES.input} value={password} onChange={e => setPassword(e.target.value)} /></div>
              <button type="submit" disabled={isSubmitting} className={`w-full py-3 rounded font-bold ${STYLES.btnPrimary}`}>{isSubmitting ? <Loader2 className="animate-spin"/> : (authMode === 'login' ? 'Login' : 'Sign Up')}</button>
            </form>
            <div className="mt-6 text-center text-sm"><button onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')} className="text-[#DB2B39] font-semibold hover:underline">{authMode === 'login' ? "Create Account" : "Login"}</button></div>
          </div>
        </div>
      </div>
    );
  }

  const filteredApps = apps.filter(a => {
     if (activeTab === 'scholarships' && a.type !== 'Scholarship') return false;
     if (activeTab === 'jobs' && a.type !== 'Job') return false;
     if (searchTerm && !a.institution.toLowerCase().includes(searchTerm.toLowerCase())) return false;
     return true;
  });

  const nextScholarship = filteredApps.filter(a => a.type === 'Scholarship' && a.deadline && new Date(a.deadline) >= new Date().setHours(0,0,0,0)).sort((a,b) => new Date(a.deadline) - new Date(b.deadline))[0];
  const nextJob = filteredApps.filter(a => a.type === 'Job' && a.deadline && new Date(a.deadline) >= new Date().setHours(0,0,0,0)).sort((a,b) => new Date(a.deadline) - new Date(b.deadline))[0];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-slate-800 dark:text-gray-100 font-sans flex flex-col transition-colors duration-300">
      <header className="sticky top-0 z-50 shadow-md" style={{ backgroundColor: THEME.primary }}>
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center space-x-3"><img src={ALU_SMALL_LOGO_URL} alt="ALU Logo" className="h-10 w-auto object-contain bg-white rounded px-2 py-1" />
            <div>
              <h1 className="text-xl font-bold text-white tracking-wide leading-none">ALU TRACKER</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] text-white font-bold uppercase bg-white/20 px-1.5 rounded">{user.displayName || 'User'}</span>
                <span className="text-[10px] text-gray-300 uppercase tracking-widest">ID: {user.uid.slice(0,6)}...</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setIsAboutOpen(true)} className="text-white/70 hover:text-white flex items-center justify-center p-2" title="About"><Info size={20} /></button>
            <button onClick={() => setIsSettingsOpen(true)} className="text-white/70 hover:text-white flex items-center justify-center p-2" title="Settings"><Settings size={20} /></button>
            <div className="relative">
              <button onClick={() => setShowNotifDropdown(!showNotifDropdown)} className="text-white/70 hover:text-white relative flex items-center justify-center p-2" title="Notifications"><Bell size={20} />{notifications.filter(n => !n.read).length > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>}</button>
              {showNotifDropdown && (<div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden"><div className="p-3 border-b dark:border-gray-700 font-bold text-sm flex justify-between"><span>Notifications</span><button onClick={requestNotificationPermission} className="text-xs text-blue-500 hover:underline">{t('enableAlerts')}</button></div><div className="max-h-64 overflow-y-auto">{notifications.length === 0 ? <div className="p-4 text-center text-gray-500 text-xs">{t('noNotifs')}</div> : notifications.map(n => <div key={n.id} className="p-3 border-b dark:border-gray-700 text-sm"><p className="font-bold">{n.title}</p><p className="text-xs">{n.body}</p></div>)}</div></div>)}
            </div>
            <button onClick={handleLogout} className="text-white/70 hover:text-red-300 flex items-center justify-center p-2" title="Logout"><LogOut size={20} /></button>
            <button onClick={() => setIsFormOpen(true)} className={`ml-2 px-4 py-2 rounded font-semibold text-sm ${STYLES.btnAccent}`}><Plus size={16} /> {t('newOpp')}</button>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 overflow-x-auto"><div className="max-w-7xl mx-auto px-4 flex">{['dashboard', 'scholarships', 'jobs', 'profile', 'all'].map(tab => (<button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-3 font-semibold text-sm capitalize whitespace-nowrap ${activeTab === tab ? STYLES.tabActive : STYLES.tabInactive}`}>{t(tab)}</button>))}</div></div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 flex-1 w-full">
        {activeTab === 'profile' ? (
          <ProfileBuilder profile={userProfile} onSave={handleSaveProfile} />
        ) : (
          <>
            {activeTab === 'dashboard' && <DashboardStats apps={apps} t={t} emailEnabled={emailEnabled} onSendReport={sendEmailReport} nextScholarship={nextScholarship} nextJob={nextJob}/>}
            
            {/* MAIN GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
              {filteredApps.map(app => (
                <div key={app.id} className={STYLES.card + " p-4 flex flex-col relative group"}>
                  <div className="absolute top-2 left-2 z-10"><button onClick={() => openTools(app)} className="bg-white dark:bg-gray-700 p-2 rounded-full shadow hover:bg-gray-100 text-[#162A43] dark:text-[#BFA15F]" title="Tools"><Wrench size={16}/></button></div>
                  <div className="h-32 bg-gray-100 dark:bg-gray-700 relative flex items-center justify-center overflow-hidden">
                    {app.image ? <img src={app.image} className="w-full h-full object-cover" alt={app.institution}/> : <GraduationCap size={40} className="text-gray-300"/>}
                    <span className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 text-xs font-bold rounded">{app.status}</span>
                  </div>
                  <div className="mt-4">
                    <h3 className="font-bold text-lg text-[#162A43] dark:text-white">{app.institution}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{app.program}</p>
                    {app.startDate && <p className="text-xs text-gray-500 mt-1 flex items-center gap-1"><Clock size={12}/> Started: {app.startDate}</p>}
                    <div className="flex justify-between items-center mt-4">
                      <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{app.type}</span>
                      <div className="flex gap-2">
                        <button onClick={() => { setEditingId(app.id); setFormData(app); setIsFormOpen(true); }}><Edit2 size={16} className="text-blue-500"/></button>
                        <button onClick={async () => { if(window.confirm("Delete?")) await deleteDoc(doc(db, "users", user.uid, "applications", app.firebaseId)); }}><Trash2 size={16} className="text-red-500"/></button>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5"><div className="h-1.5 bg-green-500 rounded-full" style={{width: `${getProgress(app)}%`}}></div></div>
                  <div className="text-right text-xs mt-1 text-gray-500">{getProgress(app)}% Complete</div>
                </div>
              ))}
            </div>
          </>
        )}

        {isFormOpen && <FormModal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} editingId={editingId} formData={formData} setFormData={setFormData} onSubmit={handleSaveApp} isSubmitting={isSubmitting} handleChecklistChange={handleChecklistChange} getFormProgress={getFormProgress} t={t} />}
        {isToolsOpen && selectedApp && <ToolsModal appData={selectedApp} userProfile={userProfile} onClose={() => setIsToolsOpen(false)} t={t} />}
        {isSettingsOpen && <PreferencesModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} currentSettings={{ theme, language, emailEnabled }} onSave={handleSavePreferences} t={t} />}
        {isAboutOpen && <AboutModal onClose={() => setIsAboutOpen(false)} />}
        {isPrivacyOpen && <PrivacyModal onClose={() => setIsPrivacyOpen(false)} />}
        {isTermsOpen && <TermsModal onClose={() => setIsTermsOpen(false)} />}
      </main>

      <footer className="bg-gray-100 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
           <div><span className="font-bold text-[#162A43] dark:text-[#BFA15F]">ALU Opportunity Tracker</span> &copy; {new Date().getFullYear()}</div>
           <div className="flex items-center gap-6">
              <span className="mr-4">Developed by <span className="font-bold text-[#162A43] dark:text-[#BFA15F]">dumethode</span></span>
              <div className="flex gap-2 mr-4">
                 <a href="https://twitter.com/dumethode" target="_blank" rel="noopener noreferrer" className="hover:text-[#1DA1F2]"><Twitter size={16}/></a>
                 <a href="https://github.com/dumethode" target="_blank" rel="noopener noreferrer" className="hover:text-[#162A43] dark:hover:text-white"><Github size={16}/></a>
                 <a href="https://linkedin.com/in/dumethode" target="_blank" rel="noopener noreferrer" className="hover:text-[#0077B5]"><Linkedin size={16}/></a>
                 <a href="https://instagram.com/dumethode" target="_blank" rel="noopener noreferrer" className="hover:text-[#E1306C]"><Instagram size={16}/></a>
              </div>
              <button onClick={() => setIsAboutOpen(true)} className="hover:text-[#DB2B39]">About</button>
              <button onClick={() => setIsPrivacyOpen(true)} className="hover:text-[#DB2B39]">Privacy</button>
              <button onClick={() => setIsTermsOpen(true)} className="hover:text-[#DB2B39]">Terms</button>
           </div>
        </div>
      </footer>
    </div>
  );
}

// --- SUB-COMPONENTS ---

const DashboardStats = ({ apps, t, emailEnabled, onSendReport, nextScholarship, nextJob }) => {
  const total = apps.length;
  const submitted = apps.filter(a => a.status === 'Submitted').length;
  const pending = apps.filter(a => ['In Progress', 'Drafting'].includes(a.status)).length;
  const completed = total > 0 ? Math.round((submitted / total) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label={t('total')} value={total} icon={<Briefcase />} color="border-l-4 border-[#162A43]" />
        <StatCard label={t('submitted')} value={submitted} icon={<CheckCircle />} color="border-l-4 border-green-500" />
        <StatCard label={t('pending')} value={pending} icon={<PieChart />} color="border-l-4 border-[#BFA15F]" />
        <StatCard label={t('completed')} value={`${completed}%`} icon={<BarChart2 />} color="border-l-4 border-[#DB2B39]" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 p-5 rounded-lg border dark:border-gray-700 shadow-sm"><div className="flex items-center justify-between mb-3"><h3 className="font-bold text-[#162A43] dark:text-[#BFA15F] flex items-center gap-2"><GraduationCap size={20} /> {t('nextSchol')}</h3>{nextScholarship && <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-full">Approaching</span>}</div>{nextScholarship ? (<div className="bg-gray-50 dark:bg-gray-700 p-4 rounded border border-gray-100 dark:border-gray-600"><div className="flex justify-between items-start"><div><p className="font-bold text-lg text-[#162A43] dark:text-white">{nextScholarship.institution}</p><p className="text-sm text-gray-600 dark:text-gray-400">{nextScholarship.program}</p></div><div className="text-right"><p className="text-xs text-gray-500 uppercase font-bold">Due</p><p className="text-lg font-mono font-bold text-[#DB2B39]">{nextScholarship.deadline}</p></div></div></div>) : <div className="text-center py-6 text-gray-400 text-sm bg-gray-50 dark:bg-gray-700 rounded border border-dashed">No upcoming deadlines.</div>}</div>
          <div className="bg-white dark:bg-gray-800 p-5 rounded-lg border dark:border-gray-700 shadow-sm"><div className="flex items-center justify-between mb-3"><h3 className="font-bold text-[#162A43] dark:text-[#BFA15F] flex items-center gap-2"><Briefcase size={20} /> {t('nextJob')}</h3>{nextJob && <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-full">Approaching</span>}</div>{nextJob ? (<div className="bg-gray-50 dark:bg-gray-700 p-4 rounded border border-gray-100 dark:border-gray-600"><div className="flex justify-between items-start"><div><p className="font-bold text-lg text-[#162A43] dark:text-white">{nextJob.institution}</p><p className="text-sm text-gray-600 dark:text-gray-400">{nextJob.program}</p></div><div className="text-right"><p className="text-xs text-gray-500 uppercase font-bold">Due</p><p className="text-lg font-mono font-bold text-[#DB2B39]">{nextJob.deadline}</p></div></div></div>) : <div className="text-center py-6 text-gray-400 text-sm bg-gray-50 dark:bg-gray-700 rounded border border-dashed">No upcoming deadlines.</div>}</div>
      </div>
      <div className="bg-gradient-to-r from-[#162A43] to-[#2C4B70] p-6 rounded-lg text-white shadow-md flex justify-between items-center">
        <div><h3 className="font-bold text-lg flex items-center gap-2"><Mail size={20}/> {t('dailyReport')}</h3><p className="text-sm opacity-80">Automated reminders enabled: {emailEnabled ? "ON" : "OFF"}</p></div>
        <button onClick={onSendReport} className="bg-[#BFA15F] text-[#162A43] px-6 py-2 rounded font-bold hover:bg-white transition-colors"><Send size={16}/> Send Now</button>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, icon, color }) => (
  <div className={`bg-white dark:bg-gray-800 p-5 rounded-lg border dark:border-gray-700 ${color} flex justify-between`}>
    <div><p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase">{label}</p><p className="text-3xl font-bold text-[#162A43] dark:text-white">{value}</p></div>
    <div className="text-gray-300 dark:text-gray-600 bg-gray-50 dark:bg-gray-700 p-3 rounded-full">{icon}</div>
  </div>
);

const ProfileBuilder = ({ profile, onSave }) => {
  const [localProfile, setLocalProfile] = useState(profile);
  
  // Dynamic Section handlers
  const addArrayItem = (key, template) => setLocalProfile({ ...localProfile, [key]: [...(localProfile[key] || []), template] });
  const updateArrayItem = (key, idx, field, val) => {
    const updated = [...localProfile[key]];
    updated[idx][field] = val;
    setLocalProfile({ ...localProfile, [key]: updated });
  };
  const removeArrayItem = (key, idx) => {
    const updated = [...localProfile[key]];
    updated.splice(idx, 1);
    setLocalProfile({ ...localProfile, [key]: updated });
  };
  
  // Gemini-powered "Enhance" simulation: Format text into bullet points
  const enhanceText = async (text) => {
    if (!text) return "• ";
    // Client-side simulation: Split sentences and make them bullet points
    const sentences = text.split('.').map(s => s.trim()).filter(s => s.length > 5);
    return sentences.map(s => s.startsWith('•') ? s : `• ${s}`).join('\n');
  };

  // Add Custom Section
  const addCustomSection = () => {
    const name = prompt("Enter Section Name (e.g., Certifications, Projects):");
    if (name) {
        const newSections = [...(localProfile.customSections || [])];
        newSections.push({ title: name, items: [{ title: '', subtitle: '', description: '' }] });
        setLocalProfile({ ...localProfile, customSections: newSections });
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border dark:border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-[#162A43] dark:text-white flex gap-2"><User size={24}/> Master Profile</h2>
          <div className="flex gap-2">
             <button onClick={() => onSave(localProfile)} className={STYLES.btnPrimary}><Save size={16}/> Save Profile</button>
          </div>
        </div>
        
        {/* PERSONAL */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <input className={STYLES.input} placeholder="Full Name" value={localProfile.fullName} onChange={e=>setLocalProfile({...localProfile, fullName: e.target.value})} />
          <input className={STYLES.input} placeholder="Contact Info" value={localProfile.contactInfo} onChange={e=>setLocalProfile({...localProfile, contactInfo: e.target.value})} />
          <input className={STYLES.input} placeholder="LinkedIn" value={localProfile.linkedin} onChange={e=>setLocalProfile({...localProfile, linkedin: e.target.value})} />
          <input className={STYLES.input} placeholder="Email" value={localProfile.email} onChange={e=>setLocalProfile({...localProfile, email: e.target.value})} />
          <div className="md:col-span-2 relative">
             <label className={STYLES.label}>Professional Summary</label>
             <textarea className={`${STYLES.input} h-24`} placeholder="Professional Summary" value={localProfile.summary} onChange={e=>setLocalProfile({...localProfile, summary: e.target.value})} />
          </div>
        </div>

        {/* SECTIONS */}
        {[
          { key: 'education', title: 'Educational Background', fields: [{k:'degree', p:'Degree'}, {k:'school', p:'School'}, {k:'year', p:'Dates'}, {k:'grade', p:'Grade'}, {k:'coursework', p:'Coursework'}] },
          { key: 'experience', title: 'Work Experience', fields: [{k:'role', p:'Role'}, {k:'company', p:'Company'}, {k:'date', p:'Dates'}, {k:'description', p:'Description', type:'textarea'}] },
          { key: 'volunteering', title: 'Community Leadership & Volunteering', fields: [{k:'role', p:'Role'}, {k:'company', p:'Organization'}, {k:'date', p:'Dates'}, {k:'description', p:'Description', type:'textarea'}] }
        ].map(section => (
          <div key={section.key} className="mb-8">
            <div className="flex justify-between items-center mb-2 border-b pb-1"><h3 className="font-bold capitalize dark:text-white">{section.title}</h3><button onClick={() => addArrayItem(section.key, {})} className="text-sm text-blue-500">+ Add</button></div>
            {(localProfile[section.key] || []).map((item, idx) => (
              <div key={idx} className="grid grid-cols-2 gap-2 mb-2 p-3 bg-gray-50 dark:bg-gray-700 rounded border dark:border-gray-600 relative">
                 {section.fields.map(f => (
                    f.type === 'textarea' ? 
                    <div key={f.k} className="col-span-2 relative">
                        <textarea className={`${STYLES.input} h-24`} placeholder={f.p} value={item[f.k] || ''} onChange={e => updateArrayItem(section.key, idx, f.k, e.target.value)} />
                        <button onClick={async () => updateArrayItem(section.key, idx, f.k, await enhanceText(item[f.k]))} className="absolute bottom-2 right-2 bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded flex items-center gap-1"><Wand2 size={12}/> Enhance with AI</button>
                    </div> :
                    <input key={f.k} className={STYLES.input} placeholder={f.p} value={item[f.k] || ''} onChange={e => updateArrayItem(section.key, idx, f.k, e.target.value)} />
                 ))}
                 <button onClick={() => removeArrayItem(section.key, idx)} className="absolute top-2 right-2 text-red-500"><Trash2 size={14}/></button>
              </div>
            ))}
          </div>
        ))}
        
        {/* Custom Sections */}
        <div className="mb-8">
            <div className="flex justify-between items-center mb-2"><h3 className="font-bold dark:text-white">Additional Sections</h3><button onClick={addCustomSection} className="text-sm text-blue-500">+ Add Section</button></div>
            {(localProfile.customSections || []).map((sec, sIdx) => (
                <div key={sIdx} className="mb-4 border p-3 rounded dark:border-gray-600">
                    <h4 className="font-bold text-sm text-gray-600 dark:text-gray-300 mb-2">{sec.title}</h4>
                    <textarea className={`${STYLES.input} h-20`} placeholder="Details..." value={sec.items[0].description} onChange={(e) => {
                        const newSecs = [...localProfile.customSections];
                        newSecs[sIdx].items[0].description = e.target.value;
                        setLocalProfile({...localProfile, customSections: newSecs});
                    }} />
                </div>
            ))}
        </div>

        <div><label className={STYLES.label}>Awards & Recognition</label><textarea className={STYLES.input} value={localProfile.awards} onChange={e=>setLocalProfile({...localProfile, awards: e.target.value})} /></div>
        <div className="mt-4"><label className={STYLES.label}>Core Competencies & Skills</label><textarea className={STYLES.input} value={localProfile.skills} onChange={e=>setLocalProfile({...localProfile, skills: e.target.value})} /></div>
      </div>
    </div>
  );
};

const ToolsModal = ({ appData, userProfile, onClose, t }) => {
  const [activeTool, setActiveTool] = useState('resume');
  const [generatedContent, setGeneratedContent] = useState('');

  const downloadPDF = async () => {
    if (!window.jspdf) return alert("PDF Library loading... try again in 3 seconds.");
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.setFont("helvetica"); // Use standard font to ensure clean PDF export
    
    if (activeTool === 'resume') {
      let y = 20;
      
      // HEADER
      doc.setFontSize(16); doc.setFont("helvetica", "bold"); 
      doc.text(userProfile.fullName || "Your Name", 105, y, { align: "center" });
      y += 6;
      doc.setFontSize(10); doc.setFont("helvetica", "normal"); 
      doc.text(`${userProfile.contactInfo} | ${userProfile.email}`, 105, y, { align: "center" });
      y += 5;
      doc.text(userProfile.linkedin || "", 105, y, { align: "center" });
      y += 10;

      const addSectionTitle = (title) => {
        if (y > 270) { doc.addPage(); y = 20; }
        y += 5; 
        doc.setFont("helvetica", "bold"); 
        doc.setFontSize(11); 
        doc.text(title.toUpperCase(), 20, y); 
        doc.setLineWidth(0.5); 
        doc.line(20, y + 1, 190, y + 1); 
        y += 6;
      };

      // 1. SUMMARY
      addSectionTitle("OBJECTIVE PROFESSIONAL PROFILE");
      doc.setFont("helvetica", "normal"); doc.setFontSize(10);
      const sumLines = doc.splitTextToSize(userProfile.summary || "", 170);
      doc.text(sumLines, 20, y); y += (sumLines.length * 5);

      // 2. EDUCATION
      addSectionTitle("EDUCATIONAL BACKGROUND");
      (userProfile.education || []).forEach(edu => {
        if (y > 270) { doc.addPage(); y = 20; }
        doc.setFont("helvetica", "bold"); doc.text(edu.degree, 20, y); y += 5;
        doc.setFont("helvetica", "normal"); doc.text(`${edu.school} | ${edu.year}`, 20, y); y += 5;
        if(edu.grade) { doc.text(`Final Grade: ${edu.grade}`, 20, y); y+=5; }
        if(edu.coursework) { 
            const cw = doc.splitTextToSize(`Relevant Coursework: ${edu.coursework}`, 170);
            doc.text(cw, 20, y); y += (cw.length * 5); 
        }
        y += 3;
      });

      // 3. EXPERIENCE
      addSectionTitle("WORK EXPERIENCE");
      (userProfile.experience || []).forEach(exp => {
        if (y > 250) { doc.addPage(); y = 20; }
        doc.setFont("helvetica", "bold"); doc.text(exp.role, 20, y);
        doc.setFont("helvetica", "italic"); doc.text(`${exp.company} | ${exp.date}`, 190, y, { align: "right" }); y+=5;
        doc.setFont("helvetica", "normal"); 
        const desc = doc.splitTextToSize(exp.description || "", 170);
        doc.text(desc, 20, y); y += (desc.length * 5) + 4; 
      });

      // 4. VOLUNTEERING
      if (userProfile.volunteering?.length) {
        addSectionTitle("COMMUNITY LEADERSHIP & VOLUNTEERING");
        userProfile.volunteering.forEach(vol => {
          if (y > 250) { doc.addPage(); y = 20; }
          doc.setFont("helvetica", "bold"); doc.text(vol.role, 20, y);
          doc.setFont("helvetica", "italic"); doc.text(`${vol.company} | ${vol.date}`, 190, y, { align: "right" }); y+=5;
          doc.setFont("helvetica", "normal"); 
          const vdesc = doc.splitTextToSize(vol.description || "", 170);
          doc.text(vdesc, 20, y); y += (vdesc.length * 5) + 4;
        });
      }

      // 5. AWARDS
      if (userProfile.awards) {
         addSectionTitle("AWARDS & RECOGNITION");
         doc.setFont("helvetica", "normal"); 
         const aw = doc.splitTextToSize(userProfile.awards, 170);
         doc.text(aw, 20, y); y += (aw.length * 5);
      }

      // 6. SKILLS
      addSectionTitle("CORE COMPETENCIES & SKILLS");
      let skillText = userProfile.skills || "";
      // AI Tailoring: Capitalize skills found in Job Description
      if (appData && appData.jobDescription) {
         const jd = appData.jobDescription.toLowerCase();
         skillText = userProfile.skills.split(',').map(s => jd.includes(s.trim().toLowerCase()) ? s.trim().toUpperCase() : s.trim()).join(', ');
      }
      const skLines = doc.splitTextToSize(skillText, 170);
      doc.text(skLines, 20, y);

      // FOOTER
      y += 20; if (y > 270) { doc.addPage(); y = 20; }
      doc.setFont("helvetica", "italic");
      doc.text("References Available Upon Request", 105, y, { align: "center" });

      doc.save(`${userProfile.fullName.replace(' ', '_')}_Resume.pdf`);

    } else {
      // --- COVER LETTER ---
      const today = new Date().toLocaleDateString();
      const company = appData ? appData.institution : "[Company Name]";
      const role = appData ? appData.program : "[Position Name]";
      let content = COVER_LETTER_TEMPLATE.replace('[Date Today]', today).replace(/{{COMPANY_NAME}}/g, company).replace(/{{POSITION_TITLE}}/g, role).replace('{{FULL_NAME}}', userProfile.fullName).replace('{{CONTACT_INFO}}', userProfile.contactInfo);
      
      doc.setFontSize(11);
      const lines = doc.splitTextToSize(content, 170);
      doc.text(lines, 20, 20);
      doc.save(`Cover_Letter_${company}.pdf`);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[70] p-4 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden">
        <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900">
          <div><h3 className="font-bold text-lg dark:text-white flex gap-2"><Wrench size={20}/> Tools: {appData.institution}</h3></div>
          <button onClick={onClose}><X/></button>
        </div>
        <div className="flex flex-1 overflow-hidden">
          <div className="w-64 bg-gray-100 dark:bg-gray-900 p-4 flex flex-col gap-2 border-r dark:border-gray-700">
            <button onClick={() => setActiveTool('resume')} className={`p-3 rounded text-left flex gap-2 ${activeTool === 'resume' ? 'bg-[#162A43] text-white' : 'hover:bg-gray-200 dark:text-gray-300'}`}><DocumentIcon size={18}/> Resume Builder</button>
            <button onClick={() => setActiveTool('coverletter')} className={`p-3 rounded text-left flex gap-2 ${activeTool === 'coverletter' ? 'bg-[#162A43] text-white' : 'hover:bg-gray-200 dark:text-gray-300'}`}><PenTool size={18}/> Cover Letter</button>
          </div>
          <div className="flex-1 p-6 overflow-y-auto bg-white dark:bg-gray-800 flex flex-col items-center justify-center">
            <h3 className="text-xl font-bold mb-4 text-[#162A43] dark:text-white">{activeTool === 'resume' ? "Tailored Resume Generator" : "Cover Letter Generator"}</h3>
            <p className="text-center text-gray-600 dark:text-gray-300 mb-8 max-w-md">
               {activeTool === 'resume' ? 
               "This tool uses your Master Profile and compares it against the Job Description to highlight relevant skills." : 
               "This tool generates a professional cover letter using your profile summary and the job details."}
            </p>
            <button onClick={downloadPDF} className={`${STYLES.btnPrimary} text-lg px-8 py-4`}><Download size={24}/> Download PDF</button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- MODALS ---
const FormModal = ({ isOpen, onClose, editingId, formData, setFormData, onSubmit, isSubmitting, handleChecklistChange, getFormProgress, t }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
        <div className="flex justify-between mb-4"><h2 className="font-bold text-xl text-[#162A43] dark:text-white">{editingId ? 'Edit' : 'New'} Opportunity</h2><button onClick={onClose}><X/></button></div>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className={STYLES.label}>Institution</label><input required className={STYLES.input} value={formData.institution} onChange={e => setFormData({...formData, institution: e.target.value})} /></div>
            <div><label className={STYLES.label}>Program</label><input required className={STYLES.input} value={formData.program} onChange={e => setFormData({...formData, program: e.target.value})} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className={STYLES.label}>Type</label><select className={STYLES.input} value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}><option>Scholarship</option><option>Job</option></select></div>
            <div><label className={STYLES.label}>Deadline</label><input type="date" className={STYLES.input} value={formData.deadline} onChange={e => setFormData({...formData, deadline: e.target.value})} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className={STYLES.label}>Start Date</label><input type="date" className={STYLES.input} value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} /></div>
            <div><label className={STYLES.label}>Status</label><select className={STYLES.input} value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}><option>Researching</option><option>In Progress</option><option>Drafting</option><option>Submitted</option><option>Accepted</option><option>Rejected</option></select></div>
          </div>
          <div><label className={STYLES.label}>Job Description / Requirements</label><textarea className={`${STYLES.input} h-32`} placeholder="Paste the full job description here..." value={formData.jobDescription} onChange={e => setFormData({...formData, jobDescription: e.target.value})}></textarea></div>
          <div><label className={STYLES.label}>Image URL</label><input className={STYLES.input} value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} /></div>
          <div className="col-span-2"><div className="flex justify-between items-center mb-2"><label className={STYLES.label}>{t('checklist')}</label><span className="text-xs font-bold text-[#BFA15F]">{getFormProgress()}% Complete</span></div><div className="grid grid-cols-2 md:grid-cols-4 gap-3">{Object.keys(formData.steps).map(stepKey => (<div key={stepKey} onClick={() => handleChecklistChange(stepKey)} className={`cursor-pointer p-3 rounded-lg border text-center transition-all duration-200 flex flex-col items-center gap-2 ${formData.steps[stepKey] ? 'bg-[#162A43] border-[#162A43] text-white' : 'bg-gray-50 border-gray-200'}`}>{formData.steps[stepKey] ? <CheckCircle size={20} /> : <CheckSquare size={20} />}<span className="text-[10px] font-bold uppercase">{stepKey}</span></div>))}</div></div>
          <div className="flex justify-end gap-2 mt-4"><button type="button" onClick={onClose} className={STYLES.btnOutline}>Cancel</button><button type="submit" className={STYLES.btnPrimary}>{isSubmitting ? <Loader2 className="animate-spin"/> : 'Save'}</button></div>
        </form>
      </div>
    </div>
  );
};

const PreferencesModal = ({ isOpen, onClose, currentSettings, onSave, t }) => {
  const [localTheme, setLocalTheme] = useState(currentSettings.theme);
  const [localLanguage, setLocalLanguage] = useState(currentSettings.language);
  const [localEmail, setLocalEmail] = useState(currentSettings.emailEnabled);
  useEffect(() => { if (isOpen) { setLocalTheme(currentSettings.theme); setLocalLanguage(currentSettings.language); setLocalEmail(currentSettings.emailEnabled); } }, [isOpen, currentSettings]);
  const handleSave = () => { onSave({ theme: localTheme, language: localLanguage, emailEnabled: localEmail }); onClose(); };
  if (!isOpen) return null;
  return (<div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[70] p-4"><div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden"><div className="p-5 border-b dark:border-gray-700 flex justify-between items-center"><h3 className="font-bold text-lg dark:text-white">Preferences</h3><button onClick={onClose}><X/></button></div><div className="p-6 space-y-6"><div className="flex justify-between"><span>Theme</span><button onClick={() => setLocalTheme(localTheme === 'light' ? 'dark' : 'light')}>{localTheme}</button></div><div className="flex justify-between items-center"><div className="flex items-center gap-3"><Languages size={20} className="text-purple-500"/><span className="dark:text-gray-200 font-medium">{t('language')}</span></div><select value={localLanguage} onChange={(e) => setLocalLanguage(e.target.value)} className="p-1.5 rounded border dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm focus:ring-2 focus:ring-[#162A43]"><option value="en">{t('english')}</option><option value="fr">{t('french')}</option></select></div><div className="flex justify-between items-center"><div className="flex items-center gap-3"><Mail size={20} className="text-red-500"/><span className="dark:text-gray-200 font-medium">{t('notifications')}</span></div><div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in"><input type="checkbox" checked={localEmail} onChange={() => setLocalEmail(!localEmail)} className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer top-0"/><label onClick={() => setLocalEmail(!localEmail)} className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${localEmail ? 'bg-green-400' : 'bg-gray-300'}`}></label></div></div><div className="pt-4 flex justify-end"><button onClick={handleSave} className={STYLES.btnPrimary}>Save</button></div></div></div></div>);
};

const AboutModal = ({ onClose }) => (<div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[70] p-4"><div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden"><div className="p-5 flex justify-between"><h3 className="font-bold text-lg">About</h3><button onClick={onClose}><X/></button></div><div className="p-6"><div className="flex justify-center mb-4"><img src={ALU_SMALL_LOGO_URL} className="w-20 h-20 rounded-full object-cover"/></div><p className="text-center mb-4">ALU Tracker v4.1 - Built by dumethode</p><p className="text-sm text-center text-gray-500">Empowering ALU students to manage their career journey effectively. Track scholarships, jobs, and deadlines in one secure, cloud-based dashboard.</p><div className="flex gap-4 mt-4 justify-center"><a href="https://twitter.com/dumethode" target="_blank" className="p-2 text-gray-400 hover:text-[#1DA1F2]"><Twitter size={20}/></a><a href="https://github.com/dumethode" target="_blank" className="p-2 text-gray-400 hover:text-[#162A43]"><Github size={20}/></a><a href="https://linkedin.com/in/dumethode" target="_blank" className="p-2 text-gray-400 hover:text-[#0077B5]"><Linkedin size={20}/></a><a href="https://instagram.com/dumethode" target="_blank" className="p-2 text-gray-400 hover:text-[#E1306C]"><Instagram size={20}/></a></div></div></div></div>);
const PrivacyModal = ({ onClose }) => (<div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[70] p-4"><div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg"><div className="p-5 flex justify-between"><h3 className="font-bold text-lg">Privacy Policy</h3><button onClick={onClose}><X/></button></div><div className="p-6 text-sm text-gray-600 dark:text-gray-300 space-y-4"><p><strong>Last Updated: November 2025.</strong></p><p>We collect limited personal information including your name, email address, and phone number during registration. We also store the application data you voluntarily input (scholarship details, deadlines, notes).</p><p>Your data is used exclusively to provide the tracking service, authenticate your identity, and send requested notifications. We do not sell or share your personal data with third parties.</p><p>All data is stored securely using Google Firebase Firestore with encrypted transmission. User authentication is handled via Firebase Auth to ensure secure access.</p><p>You have the right to access, edit, or delete your data at any time. Deleting an application removes it permanently from our database.</p></div></div></div>);
const TermsModal = ({ onClose }) => (<div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[70] p-4"><div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg"><div className="p-5 flex justify-between"><h3 className="font-bold text-lg">Terms of Service</h3><button onClick={onClose}><X/></button></div><div className="p-6 text-sm text-gray-600 dark:text-gray-300 space-y-4"><p><strong>Last Updated: November 2025.</strong></p><p>By accessing or using ALU Opportunity Tracker, you agree to be bound by these Terms.</p><p>By creating an account, you confirm that you will use this service for lawful purposes related to tracking educational and professional opportunities.</p><p>You are responsible for maintaining the confidentiality of your password and account. You agree to notify us immediately of any unauthorized use of your account.</p><p>The application data you enter belongs to you. The platform code and design remain the intellectual property of the developer.</p><p>We may terminate or suspend access to our service immediately, without prior notice, for any reason whatsoever, including without limitation if you breach the Terms.</p></div></div></div>);
