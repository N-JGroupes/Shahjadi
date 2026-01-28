import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, Users, PlusCircle, History, Menu, X, ChevronRight, Heart, Gift, Archive, 
  TrendingUp, TrendingDown, PieChart, CalendarDays, CircleDollarSign, FileDown, ShieldCheck, 
  Smartphone, LogOut, UserCircle, ClipboardCheck, Headphones as HeadphonesIcon, Bell, BellRing, CalendarClock, 
  Home, UserCog, Wallet, Landmark, MoonStar, Download, Database, AlertTriangle, Code
} from 'lucide-react';
import { MosqueState, Transaction, Member, Category, DEFAULT_LOGO_URL } from './types';
import Dashboard from './components/Dashboard';
// FIX: Changed to a named import for MemberList to resolve the "no default export" error.
import { MemberList } from './components/MemberList';
import TransactionForm from './components/TransactionForm';
import HistoryList from './components/HistoryList';
import SubscriptionTracker from './components/SubscriptionTracker';
// FIX: Changed to a named import for ExpenseTracker to resolve the "no default export" error.
import { ExpenseTracker } from './components/ExpenseTracker';
import IncomeTracker from './components/IncomeTracker';
import MonthlyReport from './components/MonthlyReport';
import YearlyReport from './components/YearlyReport';
import PrintableReport from './components/PrintableReport';
import BackupSettings from './components/BackupSettings';
import Login from './components/Login';
import { ModeratorEntries } from './components/ModeratorEntries';
import NotificationMenu from './components/NotificationMenu';
import DueList from './components/DueList';
import PageScroller from './components/PageScroller';
import ProfileSettings from './components/ProfileSettings';
import ModeratorMonthlyReport from './components/ModeratorMonthlyReport'; 
import MyEntryReport from './components/MyEntryReport'; 
import { 
  // FIX: Added 'auth' to the import list to resolve 'Cannot find name' errors.
  db, seedInitialData, auth,
  collection, onSnapshot, doc, getDoc, setDoc, addDoc, updateDoc, deleteDoc, writeBatch,
  getAuth, onAuthStateChanged, signInAnonymously, signOut 
} from './data/mockApi';


const Logo = ({ url }: { url?: string }) => {
  if (url) {
    return (
      <div className="relative w-14 h-14 bg-white rounded-xl flex items-center justify-center p-0.5 border-2 border-emerald-200 shadow-md group transition-all hover:scale-105 active:scale-95 overflow-hidden shrink-0">
        <img src={url} alt="Mosque Logo" className="w-full h-full object-contain relative z-10" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
      </div>
    );
  }
  return (
    <div className="relative w-14 h-14 bg-gradient-to-br from-emerald-600 to-emerald-900 rounded-xl flex flex-col items-center justify-center border-2 border-amber-400/50 shadow-lg group transition-all hover:scale-105 active:scale-95 overflow-hidden shrink-0">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent"></div>
      <div className="relative z-10 flex items-center justify-center">
         <div className="relative">
            <Landmark size={32} strokeWidth={1.5} className="text-emerald-50 drop-shadow-md" />
            <MoonStar size={16} strokeWidth={2.5} className="text-amber-300 absolute -top-1 -right-2 drop-shadow-sm rotate-12" />
         </div>
      </div>
    </div>
  );
};

type AppTab = 'dashboard' | 'members' | 'add' | 'history' | 'subscription' | 'donation' | 'marriage' | 'box' | 'monthly_income' | 'monthly_expense' | 'monthly_report' | 'yearly_report' | 'backup' | 'profile' | 'moderator_entries' | 'notifications' | 'due_list' | 'moderator_report' | 'my_report';

interface MenuItem { id: string; label: string; icon: any; color: string; bg: string; action?: () => void; }
interface MenuGroup { title: string; items: MenuItem[]; }

const APP_LOGO_URL = "https://i.postimg.cc/3Jntss2R/Logo.png";
const APP_BACKGROUND_URL = "https://i.postimg.cc/VNBrT8bG/sultan_ahmet_mosque.gif";
const APP_FAB_ICON_URL = "https://i.postimg.cc/26S6KBY5/Whats_App_Image_2026-01-25-at-10-24-19-AM.jpg";
const APP_HEADER_BACKGROUND_URL = "https://i.postimg.cc/MpzmpdbT/stunning_high_resolution_nature_and_landscape_backgrounds_breathtaking_scenery_in_hd_photo.jpg";

const FirebaseSetupGuide: React.FC = () => {
  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center p-6 relative font-sans text-white bg-slate-900">
      <div className="absolute inset-0 z-0 bg-cover bg-center" style={{ backgroundImage: `url(${APP_BACKGROUND_URL})` }}></div>
      <div className="absolute inset-0 z-0 bg-black/70 backdrop-blur-sm"></div>

      <div className="relative z-10 w-full max-w-lg bg-black/20 p-8 rounded-3xl border border-amber-500/30 shadow-2xl text-center animate-in fade-in zoom-in-95 duration-500">
        <div className="inline-flex p-4 bg-amber-500/10 text-amber-300 rounded-full border border-amber-500/20 mb-4">
          <AlertTriangle size={32} />
        </div>
        <h2 className="text-2xl font-bold mb-3">Firebase কানেকশন সেটআপ করুন</h2>
        <p className="text-sm text-slate-300 mb-6">
          অ্যাপটি ব্যবহার করার জন্য আপনার Firebase প্রকল্পের সাথে সংযোগ স্থাপন করতে হবে। অনুগ্রহ করে নিচের ভ্যারিয়েবলগুলো আপনার হোস্টিং প্ল্যাটফর্মের 'Environment Variables' সেটিংসে যোগ করুন।
        </p>

        <div className="bg-slate-900/50 p-4 rounded-xl text-left font-mono text-xs text-slate-300 border border-slate-700">
          <pre><code>
            FIREBASE_API_KEY="AIzaSy..."<br />
            FIREBASE_AUTH_DOMAIN="..."<br />
            FIREBASE_PROJECT_ID="..."<br />
            FIREBASE_STORAGE_BUCKET="..."<br />
            FIREBASE_MESSAGING_SENDER_ID="..."<br />
            FIREBASE_APP_ID="..."
          </code></pre>
        </div>

        <p className="text-xs text-slate-400 mt-4">
          এই Key-গুলো আপনার Firebase প্রকল্পের <b className="text-amber-300">Project Settings &gt; General &gt; Your apps &gt; SDK setup and configuration (Config)</b> সেকশনে পাবেন।
        </p>
      </div>
    </div>
  );
};


const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>('dashboard');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ role: 'ADMIN' | 'MODERATOR' | 'MEMBER' | 'VIEWER', id: string, name: string } | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const mainScrollRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [firebaseUser, setFirebaseUser] = useState<any | null>(null);

  const [state, setState] = useState<MosqueState>({
    members: [],
    transactions: [],
    backupEmail: 'njgroupbangladesh@gmail.com',
    adminPassword: '825646',
    homeIconUrl: '',
    welcomeAudioUrl: 'https://image2url.com/r2/default/audio/1769316418293-46bb57b7-03a1-496a-b671-75064aaf36f1.wav',
    loginAudioUrl: 'https://image2url.com/r2/default/audio/1769316517283-1b4c0f43-ad17-468a-985d-8c835e7eab14.wav',
    adminProfileImageUrl: ''
  });

  const isFirebaseConfigMissing = !process.env.FIREBASE_API_KEY || !process.env.FIREBASE_PROJECT_ID;
  
  // Centralized Authentication Logic - REFACTORED
  useEffect(() => {
    if (isFirebaseConfigMissing || !auth || typeof auth.onAuthStateChanged !== 'function') {
      setIsAuthLoading(false);
      setIsLoading(false);
      console.warn("Firebase Auth is not available. Running in offline/guest mode.");
      return;
    }
    const authInstance = getAuth();
    const unsubscribe = onAuthStateChanged(authInstance, (user: any) => {
      setFirebaseUser(user); // Keep track of the firebase user
      if (!user) {
        // If there's no user (e.g., after signOut or on first load), sign in anonymously.
        signInAnonymously(authInstance).catch((error) => console.error("Anonymous sign-in failed:", error));
      }
      setIsAuthLoading(false);
    });
    return () => unsubscribe();
  }, [isFirebaseConfigMissing]);
  
  // Effect for seeding initial data
  useEffect(() => {
    if (firebaseUser && !isFirebaseConfigMissing) {
      seedInitialData();
    }
  }, [firebaseUser, isFirebaseConfigMissing]);

  // Effect for real-time data listeners
  useEffect(() => {
    if (!firebaseUser || isFirebaseConfigMissing || !db || typeof collection !== 'function') {
        setIsLoading(false);
        return;
    };

    setIsLoading(true);

    const membersCollectionRef = collection(db, 'members');
    const unsubMembers = onSnapshot(membersCollectionRef, (snapshot) => {
      const membersData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Member));
      setState(prevState => ({ ...prevState, members: membersData }));
      setIsLoading(false);
    }, (error) => {
        console.error("Error fetching members:", error);
        setIsLoading(false);
    });

    const transactionsCollectionRef = collection(db, 'transactions');
    const unsubTransactions = onSnapshot(transactionsCollectionRef, (snapshot) => {
      const transactionsData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Transaction));
      setState(prevState => ({ ...prevState, transactions: transactionsData }));
    }, (error) => {
        console.error("Error fetching transactions:", error);
    });

    const configDocRef = doc(db, "config", "main");
    const unsubConfig = onSnapshot(configDocRef, (doc) => {
      if (doc.exists()) {
        const configData = doc.data();
        setState(prevState => ({
          ...prevState,
          backupEmail: configData.backupEmail,
          adminPassword: configData.adminPassword,
          homeIconUrl: configData.homeIconUrl,
          welcomeAudioUrl: configData.welcomeAudioUrl,
          loginAudioUrl: configData.loginAudioUrl,
          adminProfileImageUrl: configData.adminProfileImageUrl,
          lastBackup: configData.lastBackup
        }));
      }
    }, (error) => {
        console.error("Error fetching config:", error);
    });

    return () => {
      unsubMembers();
      unsubTransactions();
      unsubConfig();
    };
  }, [firebaseUser, isFirebaseConfigMissing]);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => { e.preventDefault(); setDeferredPrompt(e); };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setIsMenuOpen(false);
    };
    if (isMenuOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  useEffect(() => {
    if (mainScrollRef.current) mainScrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      setActiveTab(event.state?.tab || 'dashboard');
      setEditingTransaction(null);
      setIsMenuOpen(false);
    };
    window.history.replaceState({ tab: 'dashboard' }, '');
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const getNotificationCount = () => {
    if (!currentUser) return 0;
    let count = (currentUser.role === 'ADMIN') ? state.transactions.filter(t => t.status === 'PENDING').length : 0;
    if (currentUser.role !== 'ADMIN' && new Date().getDate() <= 5) count += 1;
    return count;
  };

  const addMember = async (member: Member) => { await setDoc(doc(collection(db, "members"), member.id), member); };
  const updateMember = async (updatedMember: Member) => { await setDoc(doc(db, "members", updatedMember.id), updatedMember, { merge: true }); };
  const deleteMember = async (id: string) => { await deleteDoc(doc(db, "members", id)); };
  
  const addTransaction = async (tx: Transaction) => {
      const { id, ...data } = tx;
      const finalTx = {
        ...data,
        status: currentUser?.role === 'MODERATOR' ? 'PENDING' : 'APPROVED',
        createdBy: currentUser?.id || 'SYSTEM'
      };
      const cleanTx = Object.fromEntries(Object.entries(finalTx).filter(([_, v]) => v !== undefined));
      await addDoc(collection(db, "transactions"), cleanTx);
  };

  const updateTransaction = async (updatedTx: Transaction) => {
      const { id, ...data } = updatedTx;
      await setDoc(doc(db, "transactions", id), data, { merge: true });
      setEditingTransaction(null);
  };
  
  const approveTransaction = async (id: string) => { await updateDoc(doc(db, "transactions", id), { status: 'APPROVED' }); };
  const deleteTransaction = async (id: string) => { await deleteDoc(doc(db, "transactions", id)); };
  
  const updateConfigDoc = async (data: object) => { await setDoc(doc(db, "config", "main"), data, { merge: true }); };
  
  const updateMemberProfileImage = async (memberId: string, url: string) => { await updateDoc(doc(db, "members", memberId), { profileImageUrl: url }); };
  const updateMemberHomePageBanner = async (memberId: string, url: string) => { await updateDoc(doc(db, "members", memberId), { homePageBannerUrl: url }); };
  const updateAdminProfileImage = async (url: string) => { await updateConfigDoc({ adminProfileImageUrl: url }); };
  
  const restoreSingleMemberData = async (member: Member, transactions: Transaction[]) => {
      const batch = writeBatch(db);
      batch.set(doc(db, "members", member.id), member);
      for (const tx of transactions) {
        const txRef = doc(db, "transactions", tx.id);
        batch.set(txRef, tx);
      }
      await batch.commit();
  };
  
  const mergeTransactions = async (newTransactions: Transaction[]) => {
      const batch = writeBatch(db);
      let addedCount = 0, skippedCount = 0;
      for (const tx of newTransactions) {
        const docSnap = await getDoc(doc(db, 'transactions', tx.id));
        if (docSnap.exists()) skippedCount++; else { addedCount++; batch.set(doc(db, 'transactions', tx.id), tx); }
      }
      await batch.commit();
      setTimeout(() => alert(`রিপোর্ট ইম্পোর্ট সম্পন্ন।\nনতুন এন্ট্রি: ${addedCount}\nডুপ্লিকেট বাদ: ${skippedCount}`), 100);
  };

  const handleBackupSuccess = () => updateConfigDoc({ lastBackup: new Date().toISOString() });
  const handleUpdateEmail = (email: string) => updateConfigDoc({ backupEmail: email });
  const handleUpdateWelcomeAudio = (url: string) => updateConfigDoc({ welcomeAudioUrl: url });
  const handleUpdateLoginAudio = (url: string) => updateConfigDoc({ loginAudioUrl: url });
  const handleUpdateHomeIcon = (url: string) => updateConfigDoc({ homeIconUrl: url });
  const handleUpdateAdminPassword = (newPass: string) => updateConfigDoc({ adminPassword: newPass });

  const handleTabChange = (tab: AppTab) => {
    setActiveTab(tab);
    window.history.pushState({ tab }, '');
    setIsMenuOpen(false);
    setEditingTransaction(null);
  };

  const handleEditInit = (t: Transaction) => {
    setEditingTransaction(t);
    setActiveTab('add');
    window.history.pushState({ tab: 'add' }, '');
    setIsMenuOpen(false);
  };
  
  const handleLogout = () => {
    const authInstance = getAuth();
    signOut(authInstance)
      .then(() => {
        // onAuthStateChanged will handle getting a new anonymous user.
        // We just need to clear our app's user state.
        setCurrentUser(null);
        setIsMenuOpen(false);
        // Clear remembered credentials on manual logout
        localStorage.removeItem('loginUsername');
        localStorage.removeItem('loginPassword');
      })
      .catch((error) => {
        console.error("Sign out error, forcing UI logout:", error);
        // Still clear app state on error
        setCurrentUser(null);
        setIsMenuOpen(false);
        localStorage.removeItem('loginUsername');
        localStorage.removeItem('loginPassword');
      });
  };

  const handleDownloadPDF = () => { window.print(); setIsMenuOpen(false); };
  const handleContactSupport = () => { window.location.href = `mailto:${state.backupEmail}`; setIsMenuOpen(false); };
  const handleInstallApp = async () => { if (deferredPrompt) await deferredPrompt.prompt(); setIsMenuOpen(false); };

  if (isFirebaseConfigMissing) {
    return <FirebaseSetupGuide />;
  }

  if (isAuthLoading || (isLoading && state.members.length === 0)) {
    return (
      <div className="flex items-center justify-center h-screen bg-emerald-900 text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          <p className="font-bold">লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }
  
  if (!currentUser) {
    return (
      <Login 
        state={state} 
        onLogin={setCurrentUser} 
        onImportData={restoreSingleMemberData} 
      />
    );
  }

  const getMenuGroups = (): MenuGroup[] => {
    if (!currentUser) return [];
    
    const currentMember = state.members.find(m => m.id === currentUser.id);
    const committeeDesignations = ['সভাপতি', 'সহ-সভাপতি', 'সেক্রেটারি', 'যুগ্ন সেক্রেটারি', 'সাধারণ সম্পাদক', 'কোষাধ্যক্ষ'];
    const isCommitteeMember = currentMember && committeeDesignations.includes(currentMember.designation);

    const isAdminOrMod = currentUser.role === 'ADMIN' || currentUser.role === 'MODERATOR';
    const isViewer = currentUser.role === 'VIEWER';
    const hasReportAccess = isAdminOrMod || isViewer || isCommitteeMember;

    return [
      {
        title: 'মেইন মেনু',
        items: [
          { id: 'dashboard', label: 'হোম ড্যাশবোর্ড', icon: LayoutDashboard, color: 'text-emerald-400', bg: 'bg-emerald-100' },
          ...((currentUser.role !== 'MEMBER' || isCommitteeMember) ? [{ id: 'members', label: 'সদস্য তালিকা', icon: Users, color: 'text-blue-400', bg: 'bg-blue-100' }] : []),
          { id: 'history', label: 'সব হিসাব', icon: History, color: 'text-slate-300', bg: 'bg-slate-100' },
          ...((currentUser.role === 'ADMIN' || currentUser.role === 'VIEWER') ? [{ id: 'moderator_entries', label: 'মডারেটর এন্ট্রি', icon: ClipboardCheck, color: 'text-amber-400', bg: 'bg-amber-100' }] : []),
        ]
      },
      {
        title: 'আদায় ও কালেকশন',
        items: [
          { id: 'subscription', label: 'মাসিক চাঁদা রিপোর্ট', icon: CircleDollarSign, color: 'text-emerald-400', bg: 'bg-emerald-100' },
          { id: 'due_list', label: 'মাসিক চাঁদা বাকি', icon: CalendarClock, color: 'text-rose-400', bg: 'bg-rose-100' },
          { id: 'donation', label: 'দান', icon: Gift, color: 'text-amber-400', bg: 'bg-amber-100' },
          { id: 'marriage', label: 'বিয়ে', icon: Heart, color: 'text-rose-400', bg: 'bg-rose-100' },
          { id: 'box', label: 'কৌটা', icon: Archive, color: 'text-indigo-400', bg: 'bg-indigo-100' },
        ].filter(i => {
            if (i.id === 'subscription' || i.id === 'due_list') return hasReportAccess;
            return isAdminOrMod;
        }) as MenuItem[]
      },
      {
        title: 'রিপোর্ট ও বিশ্লেষণ',
        items: [
          { id: 'monthly_income', label: 'মাসিক আয়', icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-100' },
          { id: 'monthly_expense', label: 'মাসিক ব্যয়', icon: TrendingDown, color: 'text-rose-400', bg: 'bg-rose-100' },
          { id: 'monthly_report', label: 'মাসিক হিসাব', icon: PieChart, color: 'text-blue-400', bg: 'bg-blue-100' },
          { id: 'yearly_report', label: 'বাৎসরিক হিসাব', icon: CalendarDays, color: 'text-purple-400', bg: 'bg-purple-100' },
          ...(currentUser.role === 'ADMIN' || currentUser.role === 'VIEWER' ? [{ id: 'moderator_report', label: 'মডারেটর মাসিক হিসাব', icon: UserCog, color: 'text-indigo-400', bg: 'bg-indigo-100' }] : []), 
          ...(currentUser.role === 'MODERATOR' ? [{ id: 'my_report', label: 'আমার হিসাব', icon: Wallet, color: 'text-teal-400', bg: 'bg-teal-100' }] : []), 
          { id: 'download_pdf', label: 'রিপোর্ট ডাউনলোড (PDF)', icon: FileDown, color: 'text-slate-300', bg: 'bg-slate-200', action: handleDownloadPDF },
        ].filter(() => hasReportAccess) as MenuItem[]
      },
      {
        title: 'সিস্টেম ও সাপোর্ট',
        items: [
          { id: 'profile', label: 'আমার প্রোফাইল', icon: UserCircle, color: 'text-sky-400', bg: 'bg-sky-100' }, 
          ...(currentUser.role === 'ADMIN' ? [{ id: 'members', label: 'সদস্য ডাটা এক্সপোর্ট', icon: Database, color: 'text-orange-400', bg: 'bg-orange-100' } as MenuItem] : []),
          ...(deferredPrompt ? [{ id: 'install_app', label: 'অ্যাপ ইন্সটল করুন', icon: Download, color: 'text-emerald-400', bg: 'bg-emerald-100', action: handleInstallApp }] : []),
          ...(currentUser.role === 'ADMIN' ? [{ id: 'backup', label: 'সেটিংস ও ব্যাকআপ', icon: ShieldCheck, color: 'text-emerald-400', bg: 'bg-emerald-200' } as MenuItem] : []),
          { id: 'support', label: 'অনলাইন সাপোর্ট', icon: HeadphonesIcon, color: 'text-blue-400', bg: 'bg-blue-100', action: handleContactSupport },
          { id: 'logout', label: 'লগ-আউট', icon: LogOut, color: 'text-rose-400', bg: 'bg-rose-100', action: handleLogout },
        ]
      }
    ];
  };

  const renderContent = () => {
    if (!currentUser) return null;
    const currentMember = state.members.find(m => m.id === currentUser.id);
    const committeeDesignations = ['সভাপতি', 'সহ-সভাপতি', 'সেক্রেটারি', 'যুগ্ন সেক্রেটারি', 'সাধারণ সম্পাদক', 'কোষাধ্যক্ষ'];
    const isCommitteeMember = currentMember && committeeDesignations.includes(currentMember.designation);

    const visibleTransactions = (currentUser.role === 'ADMIN' || currentUser.role === 'VIEWER')
      ? state.transactions 
      : currentUser.role === 'MODERATOR'
        ? state.transactions.filter(t => t.status === 'APPROVED' || t.createdBy === currentUser.id)
        : state.transactions.filter(t => t.memberId === currentUser.id && t.status === 'APPROVED');

    switch (activeTab) {
      case 'dashboard':
        return <Dashboard state={state} isAdmin={currentUser.role === 'ADMIN'} onApprove={approveTransaction} currentUser={currentUser} members={state.members} />;
      case 'members':
        return <MemberList 
          members={state.members} 
          transactions={state.transactions}
          onAddMember={addMember} 
          onUpdateMember={updateMember} 
          onDeleteMember={deleteMember} 
          currentUserRole={currentUser.role}
          currentUserId={currentUser.id}
          onUpdateMemberProfileImage={updateMemberProfileImage}
          onUpdateMemberHomePageBanner={updateMemberHomePageBanner}
        />;
      case 'add':
        return <TransactionForm 
          members={state.members}
          onAddTransaction={addTransaction}
          onUpdateTransaction={updateTransaction}
          onTabSwitch={() => handleTabChange('history')}
          allTransactions={state.transactions}
          editingTransaction={editingTransaction}
          onCancelEdit={() => { setEditingTransaction(null); handleTabChange('history'); }}
        />;
      case 'history':
        return <HistoryList 
          transactions={visibleTransactions} 
          onDelete={deleteTransaction} 
          onEdit={handleEditInit} 
          isAdmin={currentUser.role === 'ADMIN'}
          onApprove={approveTransaction}
          members={state.members}
          currentUser={currentUser}
        />;
      case 'subscription':
      case 'due_list':
        const targetMembers = (currentUser.role === 'MEMBER' && !isCommitteeMember) ? state.members.filter(m => m.id === currentUser.id) : state.members;
        return activeTab === 'subscription' ? 
          <SubscriptionTracker members={targetMembers} transactions={state.transactions} onAddPayment={addTransaction} /> : 
          <DueList members={targetMembers} transactions={state.transactions} />;
      case 'monthly_expense':
        return <ExpenseTracker 
          transactions={state.transactions} 
          onAddExpense={addTransaction}
          onDeleteExpense={deleteTransaction}
          onEditExpense={updateTransaction}
          members={state.members}
          currentUser={currentUser}
        />;
      case 'monthly_income':
        return <IncomeTracker transactions={state.transactions} members={state.members} />;
      case 'donation':
      case 'marriage':
      case 'box':
        const catMap: { [key: string]: Category } = { donation: Category.DONATION, marriage: Category.MARRIAGE, box: Category.BOX };
        return <TransactionForm 
          members={state.members} 
          onAddTransaction={addTransaction}
          onTabSwitch={() => handleTabChange('monthly_income')}
          initialCategory={catMap[activeTab]} 
          initialType="INCOME"
          allTransactions={state.transactions}
        />;
      case 'monthly_report':
        return <MonthlyReport state={state} />;
      case 'yearly_report':
        return <YearlyReport state={state} />;
      case 'backup':
        return <BackupSettings 
          state={state}
          onRestore={() => {}}
          onBackupSuccess={handleBackupSuccess}
          onUpdateEmail={handleUpdateEmail}
          onUpdateWelcomeAudio={handleUpdateWelcomeAudio}
          onUpdateLoginAudio={handleUpdateLoginAudio}
          onUpdateHomeIcon={handleUpdateHomeIcon}
        />;
      case 'profile':
        return <ProfileSettings 
          currentUser={currentUser}
          members={state.members}
          transactions={state.transactions}
          adminPassword={state.adminPassword || '825646'}
          onUpdateMember={updateMember}
          onUpdateAdminPassword={handleUpdateAdminPassword}
          onUpdateMemberProfileImage={updateMemberProfileImage}
          onUpdateAdminProfileImage={updateAdminProfileImage}
          adminProfileImageUrl={state.adminProfileImageUrl || ''}
          onRestoreSingleMemberData={restoreSingleMemberData}
        />;
      case 'moderator_entries':
        return <ModeratorEntries 
          transactions={state.transactions} 
          onApprove={approveTransaction} 
          onDelete={deleteTransaction} 
          members={state.members} 
          onMergeTransactions={mergeTransactions}
          currentUser={currentUser}
        />;
      case 'notifications':
        return <NotificationMenu state={state} currentUser={currentUser} onNavigate={(tab) => handleTabChange(tab as AppTab)} />;
      case 'moderator_report':
        return <ModeratorMonthlyReport transactions={state.transactions} members={state.members} />;
      case 'my_report':
        return <MyEntryReport transactions={state.transactions} currentUser={currentUser} members={state.members} />;
      default:
        return <Dashboard state={state} isAdmin={currentUser.role === 'ADMIN'} onApprove={approveTransaction} currentUser={currentUser} members={state.members} />;
    }
  };

  const getActiveTabTitle = () => {
    const tabMap: { [key in AppTab]?: string } = {
      dashboard: 'ড্যাশবোর্ড', members: 'সদস্য তালিকা', add: editingTransaction ? 'এন্ট্রি এডিট' : 'নতুন এন্ট্রি', history: 'হিসাবের খাতা', 
      subscription: 'মাসিক চাঁদা', donation: 'দান', marriage: 'বিয়ে', box: 'কৌটা',
      monthly_income: 'মাসিক আয়', monthly_expense: 'মাসিক ব্যয়', monthly_report: 'মাসিক রিপোর্ট', yearly_report: 'বাৎসরিক রিপোর্ট',
      backup: 'ব্যাকআপ ও সেটিংস', profile: 'প্রোফাইল', moderator_entries: 'মডারেটর এন্ট্রি', notifications: 'নোটিফিকেশন',
      due_list: 'চাঁদা বাকি', moderator_report: 'মডারেটর রিপোর্ট', my_report: 'আমার হিসাব'
    };
    return tabMap[activeTab] || 'ড্যাশবোর্ড';
  };
  
  const currentMemberInfo = state.members.find(m => m.id === currentUser.id);
  const isEntryFormOpen = ['add', 'donation', 'marriage', 'box'].includes(activeTab);
  const fabVisible = (currentUser.role === 'ADMIN' || currentUser.role === 'MODERATOR') && !isEntryFormOpen;

  return (
    <div className="h-screen w-screen flex flex-col font-sans relative">
      <div 
        className="absolute inset-0 bg-cover bg-center -z-10" 
        style={{ backgroundImage: `url(${APP_BACKGROUND_URL})` }}
      ></div>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm -z-10"></div>
      
      {/* Header */}
      <header 
        className="flex-shrink-0 flex items-center justify-between p-4 shadow-sm print:hidden bg-cover bg-center relative"
        style={{ backgroundImage: `url(${APP_HEADER_BACKGROUND_URL})` }}
      >
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="relative flex items-center gap-4">
          <Logo url={state.homeIconUrl || APP_LOGO_URL} />
          <div>
            <h1 className="text-3xl font-black tracking-tighter leading-none bg-gradient-to-r from-yellow-300 via-amber-400 to-orange-500 bg-clip-text text-transparent" style={{ filter: 'drop-shadow(1px 1px 0 #b91c1c) drop-shadow(-1px -1px 0 #b91c1c) drop-shadow(1px -1px 0 #b91c1c) drop-shadow(-1px 1px 0 #b91c1c)' }}>
              পুরিয়া জামে মসজিদ
            </h1>
            <p className="text-sm font-bold text-amber-300 drop-shadow-sm">{currentUser.name} ({getActiveTabTitle()})</p>
          </div>
        </div>
        <div className="relative flex items-center gap-2">
           <button onClick={() => handleTabChange('dashboard')} className="p-2.5 text-slate-200 hover:text-white transition-colors">
              <Home size={22} />
           </button>
          <button onClick={() => handleTabChange('notifications')} className="relative p-2.5 text-slate-200 hover:text-white transition-colors">
            {getNotificationCount() > 0 && <span className="absolute top-1 right-1 flex h-4 w-4"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span><span className="relative inline-flex rounded-full h-4 w-4 bg-rose-500 text-white text-[9px] font-bold items-center justify-center">{getNotificationCount()}</span></span>}
            <Bell size={22} />
          </button>
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2.5 text-slate-200 hover:text-white transition-colors">
            <Menu size={24} />
          </button>
        </div>
      </header>
      
      {/* Menu Sidebar */}
      <div 
        ref={menuRef}
        className={`fixed top-0 right-0 h-full w-4/5 max-w-sm bg-cover bg-center shadow-2xl z-50 transform transition-transform duration-300 ease-in-out print:hidden ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
        style={{ backgroundImage: `url('https://i.postimg.cc/Gt8LXTfG/31f62157aaa3d42311e9bb67db59b50b.gif')` }}
      >
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 p-4 flex justify-between items-center border-b border-white/10">
          <h2 className="text-xl font-bold text-white">মেনু</h2>
          <button onClick={() => setIsMenuOpen(false)} className="p-2 text-white"><X /></button>
        </div>
        <div className="relative z-10 overflow-y-auto h-[calc(100%-60px)] p-4">
          {getMenuGroups().map((group, i) => (
            <div key={i} className="mb-6">
              <h3 className="text-sm font-bold text-slate-300 uppercase px-4 mb-2">{group.title}</h3>
              <div className="space-y-2">
                {group.items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => item.action ? item.action() : handleTabChange(item.id as AppTab)}
                    className="w-full flex items-center gap-4 text-left p-3 rounded-2xl font-bold transition-all shadow-sm hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] border-2 border-white/10 bg-white/5 backdrop-blur-md"
                  >
                    <div className={'p-2.5 rounded-xl bg-white/20 backdrop-blur-sm shadow-inner'}>
                      <item.icon className={item.color} size={22} strokeWidth={2.5} />
                    </div>
                    <span className={`tracking-tight ${item.color}`}>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <main ref={mainScrollRef} className="flex-grow overflow-y-auto">
        {isLoading && state.members.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center gap-4 text-emerald-800">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"></div>
              <p className="font-bold">ডাটা লোড হচ্ছে...</p>
            </div>
          </div>
        ) : (
          renderContent()
        )}
      </main>

      {fabVisible && (
        <button
          onClick={() => handleTabChange('add')}
          className="fixed bottom-8 right-8 w-16 h-16 bg-white rounded-full shadow-2xl z-40 flex items-center justify-center print:hidden active:scale-90 transition-transform overflow-hidden p-1 border-2 border-emerald-300"
        >
          <img src={APP_FAB_ICON_URL} alt="Add Entry" className="w-full h-full object-cover rounded-full" />
        </button>
      )}

      <PageScroller scrollRef={mainScrollRef} />

      <PrintableReport 
        month={(new Date().getMonth() + 1).toString()} 
        year={new Date().getFullYear().toString()}
        transactions={state.transactions}
        members={state.members}
      />
    </div>
  );
};

export default App;