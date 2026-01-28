import React, { useRef, useState, useEffect } from 'react';
import { MosqueState, DEFAULT_LOGO_URL } from '../types';
import { 
  ShieldCheck, 
  AlertCircle,
  CheckCircle2,
  Edit3,
  Save,
  X,
  Image as ImageIcon,
  RotateCcw,
  Upload,
  HeadphonesIcon,
  Mail,
  Wallpaper,
  PlusCircle,
  Volume2,
  Music,
  Home,
  Share2,
  Copy,
  Clipboard
} from 'lucide-react';

interface Props {
  state: MosqueState;
  onRestore: (state: MosqueState) => void;
  onBackupSuccess: () => void;
  onUpdateEmail: (email: string) => void;
  onUpdateWelcomeAudio?: (url: string) => void;
  onUpdateLoginAudio?: (url: string) => void;
  onUpdateHomeIcon?: (url: string) => void;
}

const backgroundUrl = "https://i.postimg.cc/VvdQYyBQ/v-B6e-Cf.gif";
const sectionBackgroundUrl = "https://i.postimg.cc/Gt8LXTfG/31f62157aaa3d42311e9bb67db59b50b.gif";

const BackupSettings: React.FC<Props> = ({ state, onRestore, onBackupSuccess, onUpdateEmail, onUpdateWelcomeAudio, onUpdateLoginAudio, onUpdateHomeIcon }) => {
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null, message: string }>({ type: null, message: '' });
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [isEditingHomeIcon, setIsEditingHomeIcon] = useState(false);
  const [newEmail, setNewEmail] = useState(state.backupEmail || 'njgroupbangladesh@gmail.com');
  const [tempHomeIconUrl, setTempHomeIconUrl] = useState(state.homeIconUrl || '');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const welcomeAudioInputRef = useRef<HTMLInputElement>(null);
  const loginAudioInputRef = useRef<HTMLInputElement>(null);
  const homeIconInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', handleStatus);
    window.addEventListener('offline', handleStatus);
    return () => {
      window.removeEventListener('online', handleStatus);
      window.removeEventListener('offline', handleStatus);
    };
  }, []);

  const handleExport = async () => {
    const dataStr = JSON.stringify(state, null, 2);
    const fileName = `Mosque_Backup_${new Date().toISOString().split('T')[0]}.json`;

    try {
      // 1. Try Native Share (Best for Android WebView/APK)
      const blob = new Blob([dataStr], { type: "application/json" });
      const file = new File([blob], fileName, { type: "application/json" });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Mosque Backup Data',
          text: 'নিরাপদ সংরক্ষণের জন্য ব্যাকআপ ফাইলটি সেভ করুন।'
        });
        setStatus({ type: 'success', message: 'শেয়ার মেনু ওপেন হয়েছে। ফাইলটি সেভ করুন।' });
        return;
      }
    } catch (e) {
      console.log('Share API failed, falling back to download...', e);
    }

    // 2. Fallback to Browser Download
    try {
      const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', fileName);
      document.body.appendChild(linkElement);
      linkElement.click();
      document.body.removeChild(linkElement);
      
      setStatus({ type: 'success', message: 'ব্যাকআপ ফাইলটি ডাউনলোড হয়েছে।' });
    } catch (err) {
      setStatus({ type: 'error', message: 'ব্যাকআপ তৈরিতে সমস্যা হয়েছে।' });
    }
  };

  // NEW: Manual Copy Function as failsafe for APK
  const handleCopyBackup = () => {
    const dataStr = JSON.stringify(state);
    navigator.clipboard.writeText(dataStr).then(() => {
      setStatus({ type: 'success', message: 'সম্পূর্ণ ডাটা ক্লিপবোর্ডে কপি হয়েছে! নোটপ্যাডে পেস্ট করে রাখুন।' });
      setTimeout(() => setStatus({ type: null, message: '' }), 4000);
    }).catch(() => {
      setStatus({ type: 'error', message: 'কপি করা সম্ভব হয়নি।' });
    });
  };

  const handleEmailBackup = () => {
    const backupTarget = state.backupEmail || 'njgroupbangladesh@gmail.com';
    const dataStr = JSON.stringify(state);
    const subject = encodeURIComponent("N~J Group Mosque: " + new Date().toLocaleDateString('bn-BD') + " এর ডাটা ব্যাকআপ");
    const body = encodeURIComponent(
      "মসজিদ: N~J Group মসজিদ কমপ্লেক্স\n" +
      "তারিখ: " + new Date().toLocaleString('bn-BD') + "\n" +
      "সদস্য সংখ্যা: " + state.members.length + "\n" +
      "মোট এন্ট্রি: " + state.transactions.length + "\n\n" +
      "নিচের ডাটাটি কপি করে রাখবেন না। এটি অ্যাপে ডাটা রিস্টোর করার জন্য প্রয়োজন হবে।\n\n" +
      "---------------------------\n" +
      "ডাটা কোড (নিছে):\n" +
      dataStr
    );
    
    window.location.href = `mailto:${backupTarget}?subject=${subject}&body=${body}`;
    
    onBackupSuccess();
    setStatus({ type: 'success', message: `আপনার জিমেইল অ্যাপে ডাটা পাঠানো হচ্ছে (${backupTarget})` });
  };

  const handleSaveEmail = () => {
    if (!newEmail.includes('@')) {
      setStatus({ type: 'error', message: 'সঠিক ইমেইল অ্যাড্রেস দিন।' });
      return;
    }
    onUpdateEmail(newEmail);
    setIsEditingEmail(false);
    setStatus({ type: 'success', message: 'ব্যাকআপ ইমেইল আপডেট হয়েছে।' });
    setTimeout(() => setStatus({ type: null, message: '' }), 3000);
  };

  const handleWelcomeAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 500 * 1024) { // 500KB Limit for Audio to prevent localStorage overflow
        alert('অডিও ফাইলটি ৫০০ কিলোবাইটের চেয়ে বড় হতে পারবে না।');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        if (onUpdateWelcomeAudio) onUpdateWelcomeAudio(base64String);
        setStatus({ type: 'success', message: 'ওয়েলকাম অডিও আপলোড হয়েছে।' });
        setTimeout(() => setStatus({ type: null, message: '' }), 3000);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLoginAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 500 * 1024) { // 500KB Limit
        alert('অডিও ফাইলটি ৫০০ কিলোবাইটের চেয়ে বড় হতে পারবে না।');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        if (onUpdateLoginAudio) onUpdateLoginAudio(base64String);
        setStatus({ type: 'success', message: 'লগইন অডিও আপলোড হয়েছে।' });
        setTimeout(() => setStatus({ type: null, message: '' }), 3000);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleHomeIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) { // 1MB Limit
        alert('ছবিটি ১ মেগাবাইটের চেয়ে বড় হতে পারবে না।');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        if (onUpdateHomeIcon) onUpdateHomeIcon(base64String);
        setTempHomeIconUrl(base64String); // Update temp URL for preview
        setStatus({ type: 'success', message: 'হোম আইকন সফলভাবে আপলোড হয়েছে।' });
        setTimeout(() => setStatus({ type: null, message: '' }), 3000);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveHomeIconLink = () => {
    if (onUpdateHomeIcon) onUpdateHomeIcon(tempHomeIconUrl);
    setIsEditingHomeIcon(false);
    setStatus({ type: 'success', message: 'হোম আইকন সফলভাবে আপডেট হয়েছে।' });
    setTimeout(() => setStatus({ type: null, message: '' }), 3000);
  };

  const handleResetWelcomeAudio = () => {
    if (confirm('আপনি কি ওয়েলকাম অডিও মুছে ফেলতে চান?')) {
      if (onUpdateWelcomeAudio) onUpdateWelcomeAudio('');
      setStatus({ type: 'success', message: 'ওয়েলকাম অডিও রিসেট করা হয়েছে।' });
    }
  };

  const handleResetLoginAudio = () => {
    if (confirm('আপনি কি লগইন অডিও মুছে ফেলতে চান?')) {
      if (onUpdateLoginAudio) onUpdateLoginAudio('');
      setStatus({ type: 'success', message: 'লগইন অডিও রিসেট করা হয়েছে।' });
    }
  };

  const handleResetHomeIcon = () => {
    if (confirm('আপনি কি হোম আইকনটি রিসেট করে ডিফল্ট আইকনে ফিরে যেতে চান?')) {
      if (onUpdateHomeIcon) onUpdateHomeIcon('');
      setTempHomeIconUrl('');
      setIsEditingHomeIcon(false);
      setStatus({ type: 'success', message: 'হোম আইকন রিসেট করা হয়েছে।' });
    }
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    const files = event.target.files;
    
    if (!files || files.length === 0) return;

    fileReader.onload = (e) => {
      try {
        const content = e.target?.result;
        if (typeof content === 'string') {
          const importedState = JSON.parse(content);
          
          if (importedState.members && importedState.transactions) {
            onRestore(importedState);
            setStatus({ type: 'success', message: 'সব ডাটা সফলভাবে রিস্টোর করা হয়েছে।' });
          } else {
            throw new Error("Invalid format");
          }
        }
      } catch (err) {
        setStatus({ type: 'error', message: 'ভুল ফাইল সিলেক্ট করেছেন। ব্যাকআপ ফাইলটি পুনরায় চেক করুন।' });
      }
    };
    
    fileReader.readAsText(files[0]);
  };

  return (
    <div className="relative rounded-t-[2.5rem] overflow-hidden -mt-4">
      <div className="absolute inset-0 bg-cover bg-center z-0" style={{ backgroundImage: `url(${backgroundUrl})` }}></div>
      <div className="absolute inset-0 bg-black/20 z-0"></div>
      <div className="relative z-10 p-7 pb-32 space-y-8 animate-in fade-in duration-500 text-white">
        <div className="text-center space-y-4 mb-4">
          <div className="inline-flex p-5 bg-emerald-500/10 text-emerald-400 rounded-[2.5rem] shadow-inner mb-2 border border-emerald-500/20">
            <ShieldCheck size={48} strokeWidth={2.5} />
          </div>
          <h2 className="text-4xl font-[1000] tracking-tighter leading-none">সেটিংস ও ব্যাকআপ</h2>
          
          <div className="flex flex-col items-center gap-4 pt-3">
            {isEditingEmail ? (
              <div className="w-full max-w-sm flex gap-3 animate-in zoom-in-95 duration-300">
                <input 
                  type="email"
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                  className="flex-1 px-6 py-4 bg-black/20 border-2 border-emerald-500 rounded-[1.5rem] outline-none font-bold text-base text-white shadow-xl"
                  placeholder="নতুন ইমেইল দিন..."
                />
                <button onClick={handleSaveEmail} className="p-4 bg-emerald-600 text-white rounded-[1.5rem] shadow-lg active:scale-90 transition-all">
                  <Save size={24} />
                </button>
                <button onClick={() => {setIsEditingEmail(false); setNewEmail(state.backupEmail || '');}} className="p-4 bg-slate-600 text-slate-200 rounded-[1.5rem] active:scale-90 transition-all">
                  <X size={24} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4 bg-black/20 px-6 py-3 rounded-full border border-white/10 shadow-sm group">
                <span className="text-[13px] text-emerald-300 font-[1000] uppercase tracking-[0.2em]">{state.backupEmail || 'njgroupbangladesh@gmail.com'}</span>
                <button 
                  onClick={() => setIsEditingEmail(true)}
                  className="p-2 text-slate-400 hover:text-emerald-300 transition-colors rounded-xl hover:bg-white/10"
                >
                  <Edit3 size={18} />
                </button>
              </div>
            )}
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">ব্যাকআপ ইমেইল</p>
          </div>
        </div>

        {status.type && (
          <div className={`p-7 rounded-[3rem] flex items-start gap-5 animate-in zoom-in-95 ${status.type === 'success' ? 'bg-emerald-900/30 border-2 border-emerald-500/20 text-emerald-100' : 'bg-rose-900/30 border-2 border-rose-500/20 text-rose-100'}`}>
            <div className={`p-3 rounded-2xl ${status.type === 'success' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
              {status.type === 'success' ? <CheckCircle2 size={28} /> : <AlertCircle size={28} />}
            </div>
            <p className="font-bold text-base leading-tight pt-1">{status.message}</p>
          </div>
        )}

        {/* Backup and Restore Options */}
        <div className="rounded-[3.5rem] shadow-xl border border-white/10 animate-in slide-in-from-bottom-4 duration-700 relative overflow-hidden">
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${sectionBackgroundUrl})` }}></div>
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="relative z-10 p-9 space-y-7">
                <div className="flex items-center gap-5 mb-2">
                  <div className="w-14 h-14 bg-indigo-500/10 text-indigo-400 rounded-[1.75rem] flex items-center justify-center shadow-inner">
                    <ShieldCheck size={30} strokeWidth={3} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-[1000] text-slate-100 tracking-tight leading-none">ডাটা ব্যাকআপ ও রিস্টোর</h3>
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mt-1.5">নিরাপদ ডাটা সংরক্ষণ</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button 
                    onClick={handleEmailBackup} 
                    disabled={!isOnline}
                    className="py-5 rounded-2xl bg-indigo-600 text-white font-black text-sm flex items-center justify-center gap-3 shadow-lg shadow-indigo-900/50 active:scale-95 transition-all disabled:opacity-50"
                  >
                    <Mail size={20} /> ইমেইলে ব্যাকআপ
                  </button>
                  <button 
                    onClick={handleExport} 
                    className="py-5 rounded-2xl bg-emerald-600 text-white font-black text-sm flex items-center justify-center gap-3 shadow-lg shadow-emerald-900/50 active:scale-95 transition-all"
                  >
                    <Share2 size={20} /> ডাউনলোড/শেয়ার
                  </button>
                  {/* New Copy to Clipboard Button for APK reliability */}
                  <button 
                    onClick={handleCopyBackup}
                    className="md:col-span-2 py-5 rounded-2xl bg-amber-500 text-white font-black text-sm flex items-center justify-center gap-3 shadow-lg shadow-amber-900/50 active:scale-95 transition-all"
                  >
                    <Copy size={20} /> ব্যাকআপ কোড কপি করুন (APK এর জন্য)
                  </button>

                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleImport} 
                    accept=".json" 
                    className="hidden" 
                  />
                  <button 
                    onClick={() => fileInputRef.current?.click()} 
                    className="md:col-span-2 py-5 rounded-2xl bg-slate-600 text-slate-100 font-black text-sm flex items-center justify-center gap-3 shadow-lg shadow-slate-900/50 active:scale-95 transition-all"
                  >
                    <Upload size={20} /> ডাটা রিস্টোর (ফাইল থেকে)
                  </button>
                </div>
            </div>
        </div>

        {/* Support Section */}
        <div className="rounded-[3.5rem] shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${sectionBackgroundUrl})` }}></div>
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="relative z-10 p-9 space-y-7">
              <div className="absolute top-0 right-0 p-8 text-white/10 group-hover:scale-110 transition-transform">
                <HeadphonesIcon size={140} />
              </div>
              <div className="relative z-10">
                <h3 className="text-3xl font-[1000] tracking-tight">অনলাইন সাপোর্ট</h3>
                <p className="text-[15px] font-bold text-blue-50/80 leading-relaxed mt-2">অ্যাপ ব্যবহারে কোনো সমস্যা হলে বা নতুন ফিচার চাইলে সরাসরি যোগাযোগ করুন।</p>
              </div>
              <a 
                href="mailto:njgroupbangladesh@gmail.com"
                className="w-full py-6 rounded-[2.5rem] bg-white text-blue-900 font-[1000] text-xl shadow-xl active:scale-95 transition-all flex items-center justify-center gap-4"
              >
                <Mail size={26} strokeWidth={3} /> ইমেইল সাপোর্ট নিন
              </a>
            </div>
        </div>

        {/* Visual Settings Section */}
        <div className="space-y-6">
          
          {/* Audio Settings */}
          <div className="rounded-[3.5rem] shadow-xl border border-white/10 group animate-in slide-in-from-bottom-4 duration-700 relative overflow-hidden">
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${sectionBackgroundUrl})` }}></div>
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="relative z-10 p-9 space-y-7">
                <div className="flex items-center gap-5 mb-2">
                  <div className="w-14 h-14 bg-indigo-500/10 text-indigo-400 rounded-[1.75rem] flex items-center justify-center shadow-inner">
                    <Music size={30} strokeWidth={3} />
                  </div>
                  <div>
                    <h3 className="2xl font-[1000] text-slate-100 tracking-tight leading-none">কাস্টম অডিও</h3>
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mt-1.5">অ্যাপ ওপেন ও লগইন সাউন্ড</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Welcome Audio */}
                  <div className="p-6 bg-black/20 rounded-[2.5rem] border border-white/10 space-y-4">
                      <div className="flex items-center gap-3">
                        <Volume2 size={20} className="text-indigo-400" />
                        <h5 className="font-black text-slate-200 text-sm">ওয়েলকাম অডিও</h5>
                      </div>
                      {state.welcomeAudioUrl ? (
                        <div className="text-xs text-emerald-300 font-bold bg-emerald-500/10 p-2 rounded-xl text-center">অডিও সেট করা আছে</div>
                      ) : (
                        <div className="text-xs text-slate-400 font-bold bg-black/20 p-2 rounded-xl text-center">সেট করা নেই</div>
                      )}
                      <input 
                        type="file" 
                        ref={welcomeAudioInputRef}
                        onChange={handleWelcomeAudioUpload}
                        accept="audio/*"
                        className="hidden"
                      />
                      <button 
                        onClick={() => welcomeAudioInputRef.current?.click()}
                        className="w-full py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg"
                      >
                        আপলোড (Welcome)
                      </button>
                      {state.welcomeAudioUrl && (
                        <button onClick={handleResetWelcomeAudio} className="w-full text-rose-400 text-[10px] font-black uppercase">মুছে ফেলুন</button>
                      )}
                  </div>

                  {/* Login Success Audio */}
                  <div className="p-6 bg-black/20 rounded-[2.5rem] border border-white/10 space-y-4">
                      <div className="flex items-center gap-3">
                        <Volume2 size={20} className="text-indigo-400" />
                        <h5 className="font-black text-slate-200 text-sm">লগইন অডিও</h5>
                      </div>
                      {state.loginAudioUrl ? (
                        <div className="text-xs text-emerald-300 font-bold bg-emerald-500/10 p-2 rounded-xl text-center">অডিও সেট করা আছে</div>
                      ) : (
                        <div className="text-xs text-slate-400 font-bold bg-black/20 p-2 rounded-xl text-center">সেট করা নেই</div>
                      )}
                      <input 
                        type="file" 
                        ref={loginAudioInputRef}
                        onChange={handleLoginAudioUpload}
                        accept="audio/*"
                        className="hidden"
                      />
                      <button 
                        onClick={() => loginAudioInputRef.current?.click()}
                        className="w-full py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg"
                      >
                        আপলোড (Login)
                      </button>
                      {state.loginAudioUrl && (
                        <button onClick={handleResetLoginAudio} className="w-full text-rose-400 text-[10px] font-black uppercase">মুছে ফেলুন</button>
                      )}
                  </div>
                </div>
              </div>
          </div>

          {/* Home Icon Settings */}
          <div className="rounded-[3.5rem] shadow-xl border border-white/10 group animate-in slide-in-from-bottom-4 duration-700 relative overflow-hidden">
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${sectionBackgroundUrl})` }}></div>
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="relative z-10 p-9 space-y-7">
                <div className="flex items-center gap-5 mb-2">
                  <div className="w-14 h-14 bg-sky-500/10 text-sky-400 rounded-[1.75rem] flex items-center justify-center shadow-inner">
                    <Home size={30} strokeWidth={3} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-[1000] text-slate-100 tracking-tight leading-none">হোম আইকন</h3>
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mt-1.5">হেডারের বাম পাশের বাটন</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-7 p-6 bg-black/20 rounded-[2.5rem] border border-white/10">
                  <div className="w-24 h-24 bg-gradient-to-tr from-sky-600 to-blue-500 rounded-[2rem] p-4 shadow-xl flex items-center justify-center overflow-hidden shrink-0 border-[4px] border-slate-800">
                    {state.homeIconUrl ? (
                      <img 
                        src={state.homeIconUrl} 
                        className="w-full h-full object-contain" 
                        alt="Home Icon Preview"
                        onError={(e) => e.currentTarget.style.display = 'none'}
                      />
                    ) : (
                      <Home size={32} color="white" strokeWidth={3} />
                    )}
                  </div>
                  <div className="flex-1 w-full space-y-3">
                    <div className="flex flex-col gap-3">
                      <input 
                        type="file" 
                        ref={homeIconInputRef}
                        onChange={handleHomeIconUpload}
                        accept="image/*"
                        className="hidden"
                      />
                      <button 
                        onClick={() => homeIconInputRef.current?.click()}
                        disabled={!isOnline}
                        className="w-full py-4 bg-sky-600 text-white rounded-2xl text-[12px] font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-lg shadow-sky-900/50 active:scale-95 transition-all disabled:opacity-50"
                      >
                        <Upload size={18} /> ফোন থেকে আপলোড
                      </button>
                      
                      {!isEditingHomeIcon ? (
                        <button 
                          onClick={() => setIsEditingHomeIcon(true)}
                          className="w-full py-3 bg-slate-600 text-slate-200 rounded-2xl text-[11px] font-black uppercase tracking-widest"
                        >
                          লিঙ্ক ব্যবহার করুন
                        </button>
                      ) : (
                        <div className="flex flex-col gap-3 animate-in fade-in duration-300">
                          <input 
                            type="text"
                            value={tempHomeIconUrl}
                            onChange={e => setTempHomeIconUrl(e.target.value)}
                            className="w-full px-6 py-4 bg-black/20 border-2 border-sky-500 rounded-2xl outline-none font-bold text-sm shadow-inner text-white"
                            placeholder="ইমেজ URL দিন..."
                          />
                          <div className="flex gap-3">
                            <button onClick={handleSaveHomeIconLink} className="flex-1 py-3 bg-sky-500 text-white rounded-2xl text-sm font-black shadow-lg">সেভ</button>
                            <button onClick={() => setIsEditingHomeIcon(false)} className="flex-1 py-3 bg-slate-600 text-slate-200 rounded-2xl text-sm font-black">X</button>
                          </div>
                        </div>
                      )}

                      {state.homeIconUrl && (
                        <button onClick={handleResetHomeIcon} className="w-full py-2 text-rose-400 font-black text-[11px] uppercase flex items-center justify-center gap-2">
                          <RotateCcw size={14} /> রিসেট
                        </button>
                      )}
                    </div>
                  </div>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BackupSettings;