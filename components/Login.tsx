
import React, { useState, useEffect, useRef } from 'react';
import { MosqueState, Member, Transaction } from '../types';
import { Lock, User, Eye, EyeOff, KeyRound, ArrowRight, Landmark, MoonStar, Upload, Clipboard, X } from 'lucide-react';

interface Props {
  state: MosqueState;
  onLogin: (user: { role: 'ADMIN' | 'MODERATOR' | 'MEMBER' | 'VIEWER', id: string, name: string }) => void;
  onImportData: (member: Member, transactions: Transaction[]) => void;
}

const APP_LOGO_URL = "https://i.postimg.cc/3Jntss2R/Logo.png";
const APP_BACKGROUND_URL = "https://i.postimg.cc/VNBrT8bG/sultan_ahmet_mosque.gif";

const Login: React.FC<Props> = ({ state, onLogin, onImportData }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [restoreText, setRestoreText] = useState('');

  const importInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedUsername = localStorage.getItem('loginUsername');
    const savedPassword = localStorage.getItem('loginPassword');
    if (savedUsername && savedPassword) {
      setUsername(savedUsername);
      setPassword(savedPassword);
      setRememberMe(true);
    }
  }, []);

  useEffect(() => {
    if (state.welcomeAudioUrl) {
      const audio = new Audio(state.welcomeAudioUrl);
      const playWelcomeAudio = () => {
        audio.play().catch(e => console.warn("Welcome audio couldn't play due to browser policy:", e));
      };
      document.addEventListener('click', playWelcomeAudio, { once: true });
      document.addEventListener('touchstart', playWelcomeAudio, { once: true });
      return () => {
        document.removeEventListener('click', playWelcomeAudio);
        document.removeEventListener('touchstart', playWelcomeAudio);
      };
    }
  }, [state.welcomeAudioUrl]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Admin login check
    if (username.toLowerCase() === 'puriya mosjid' && password === state.adminPassword) {
      if (rememberMe) {
        localStorage.setItem('loginUsername', username);
        localStorage.setItem('loginPassword', password);
      } else {
        localStorage.removeItem('loginUsername');
        localStorage.removeItem('loginPassword');
      }
      if (state.loginAudioUrl) {
        const audio = new Audio(state.loginAudioUrl);
        await audio.play().catch(e => console.log("Login audio failed", e));
      }
      onLogin({ role: 'ADMIN', id: 'ADMIN', name: 'এডমিন' });
      return;
    }

    const member = state.members.find(m => m.memberNo === username);
    if (member) {
      const savedPass = member.password || 'admin';
      if (password === savedPass) {
        if (rememberMe) {
          localStorage.setItem('loginUsername', username);
          localStorage.setItem('loginPassword', password);
        } else {
          localStorage.removeItem('loginUsername');
          localStorage.removeItem('loginPassword');
        }

        if (state.loginAudioUrl) {
          const audio = new Audio(state.loginAudioUrl);
          await audio.play().catch(e => console.log("Login audio failed", e));
        }

        onLogin({ 
          role: member.isViewer ? 'VIEWER' : (member.isModerator ? 'MODERATOR' : 'MEMBER'), 
          id: member.id, 
          name: member.name 
        });
        return;
      }
    }
    setError('ইউজারনেম বা পাসওয়ার্ড ভুল হয়েছে!');
  };

  const handleMemberImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => processRestoreData(event.target?.result as string);
    reader.readAsText(file);
    e.target.value = '';
  };

  const handlePasteRestore = () => {
    if (!restoreText) return;
    processRestoreData(restoreText);
    setShowRestoreModal(false);
    setRestoreText('');
  };

  const processRestoreData = (content: string) => {
    try {
      const data = JSON.parse(content);
      if (data.type === 'single_member_backup' && data.member) {
        onImportData(data.member, data.transactions || []);
        setUsername(data.member.memberNo);
        setPassword(data.member.password || 'admin');
        alert(`স্বাগতম ${data.member.name}! আপনার ডাটা রিস্টোর হয়েছে। লগইন বাটনে ক্লিক করুন।`);
      } else {
        throw new Error('Invalid format');
      }
    } catch (e) {
      alert('ভুল কোড বা ফাইল ফরম্যাট। অনুগ্রহ করে চেক করুন।');
    }
  };

  return (
    <div className="h-screen flex flex-col items-center justify-start px-6 py-12 relative bg-slate-900 font-sans overflow-y-auto">
      <div className="absolute inset-0 z-0 bg-cover bg-center" style={{ backgroundImage: `url(${APP_BACKGROUND_URL})` }}></div>
      <div className="absolute inset-0 z-0 bg-black/50 backdrop-blur-[1px]"></div>

      <div className="w-full max-w-sm space-y-8 relative z-10 animate-in fade-in zoom-in-95 duration-700">
        <div className="text-center space-y-5">
          <div className="inline-flex p-1 bg-gradient-to-tr from-white/30 to-white/5 rounded-[2.5rem] shadow-2xl mb-2 backdrop-blur-md border border-white/20">
            <div className="bg-white/90 p-2 rounded-[2.2rem]">
              <img src={APP_LOGO_URL} alt="Logo" className="w-20 h-20 object-contain drop-shadow-lg" />
            </div>
          </div>
          <div className="space-y-1">
             <h1 className="text-4xl font-[1000] tracking-tighter leading-tight bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-sky-300 to-amber-300" style={{ filter: 'drop-shadow(0 2px 5px rgba(0,0,0,0.7))' }}>
                পুরিয়া জামে মসজিদ
             </h1>
             <div className="h-1 w-12 bg-emerald-500 mx-auto rounded-full"></div>
             <p className="text-[12px] text-slate-300 font-bold uppercase tracking-[0.3em] pt-2">হিসাব ও ব্যবস্থাপনা অ্যাপ</p>
          </div>
        </div>

        <form onSubmit={handleLogin} className="bg-white/5 p-8 rounded-[3rem] border border-white/10 space-y-6 mt-16">
          <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest text-center">সদস্য ও মডারেটর লগইন</p>
          <div className="space-y-4">
            <div className="relative group">
              <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-400 transition-colors">
                <User size={20} strokeWidth={3} />
              </div>
              <input 
                required
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full pl-14 pr-6 py-5 bg-black/20 border border-white/10 focus:border-emerald-500/50 rounded-[2rem] outline-none font-bold text-white text-lg transition-all placeholder:text-slate-500 shadow-inner"
                placeholder="সদস্য আইডি"
              />
            </div>

            <div className="relative group">
              <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-400 transition-colors">
                <KeyRound size={20} strokeWidth={3} />
              </div>
              <input 
                required
                type={showPass ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-14 pr-14 py-5 bg-black/20 border border-white/10 focus:border-emerald-500/50 rounded-[2rem] outline-none font-bold text-white text-lg transition-all placeholder:text-slate-500 shadow-inner"
                placeholder="পাসওয়ার্ড"
              />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors">
                {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-3">
            <input type="checkbox" id="rememberMe" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="w-5 h-5 accent-emerald-500" />
            <label htmlFor="rememberMe" className="text-white text-sm font-bold select-none">পাসওয়ার্ড মনে রাখুন</label>
          </div>

          {error && <div className="bg-rose-500/20 border border-rose-500/30 text-rose-200 px-5 py-3 rounded-2xl text-[13px] font-bold text-center animate-shake">{error}</div>}
          
          <button type="submit" className="w-full py-5 rounded-[2rem] bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-[1000] text-xl shadow-lg shadow-emerald-900/50 active:scale-[0.98] transition-all flex items-center justify-center gap-3 group/btn">
            লগইন <div className="bg-white/20 p-1.5 rounded-full group-hover/btn:translate-x-1 transition-transform"><ArrowRight size={18} strokeWidth={4} /></div>
          </button>
        </form>

        <div className="text-center space-y-4">
          <p className="text-[10px] text-slate-500 font-bold">ডিফল্ট পাসওয়ার্ড: <span className="text-emerald-500 font-black">admin</span></p>
          <div className="pt-2 border-t border-slate-700/50 mt-4 space-y-2">
            <p className="text-[9px] text-emerald-400 font-black uppercase tracking-widest mb-1">সদস্যদের জন্য ডাটা রিস্টোর</p>
            <input type="file" ref={importInputRef} onChange={handleMemberImport} accept=".json" className="hidden" />
            <button onClick={() => importInputRef.current?.click()} className="w-full py-3 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-400 hover:text-white rounded-2xl text-[12px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all border border-indigo-500/30">
              <Upload size={16} /> ডাটা রিস্টোর (ফাইল)
            </button>
            <button onClick={() => setShowRestoreModal(true)} className="w-full py-3 bg-amber-600/20 hover:bg-amber-600 text-amber-400 hover:text-white rounded-2xl text-[12px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all border border-amber-500/30">
              <Clipboard size={16} /> ডাটা রিস্টোর (কোড পেস্ট)
            </button>
          </div>
        </div>
      </div>

      {showRestoreModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-sm rounded-[3rem] shadow-2xl p-8 border border-white/20 animate-in zoom-in-95 duration-500">
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-[1000] text-slate-800">ব্যাকআপ কোড পেস্ট করুন</h3>
                <button onClick={() => setShowRestoreModal(false)} className="p-2 bg-slate-100 rounded-full text-slate-400 hover:text-rose-500"><X size={20} /></button>
             </div>
             <p className="text-[10px] text-slate-400 mb-2">অ্যাডমিনের দেওয়া পুরো কোডটি কপি করে নিচে পেস্ট করুন:</p>
             <textarea value={restoreText} onChange={e => setRestoreText(e.target.value)} className="w-full h-40 bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs font-mono text-slate-600 focus:border-indigo-500 outline-none mb-6" placeholder='{"type": "single_member_backup", ...}' />
             <button onClick={handlePasteRestore} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg">
                <Upload size={18} /> রিস্টোর করুন
             </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default Login;
