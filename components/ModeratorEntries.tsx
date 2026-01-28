
import React, { useRef, useState } from 'react';
import { Transaction, Member } from '../types';
import { 
  ShieldCheck, 
  CheckCircle2, 
  Trash2, 
  Clock, 
  ArrowUpRight, 
  ArrowDownLeft, 
  AlertCircle,
  FileUp,
  Clipboard,
  X,
  Upload
} from 'lucide-react';

interface Props {
  transactions: Transaction[];
  onApprove: (id: string) => void;
  onDelete: (id: string) => void;
  members?: Member[];
  onMergeTransactions?: (transactions: Transaction[]) => void; // Added prop for merging
  // FIX: Ensured the 'VIEWER' role is included in the currentUser prop type to align with the App state and fix the type error.
  currentUser: { role: 'ADMIN' | 'MODERATOR' | 'MEMBER' | 'VIEWER', id: string, name: string };
}

const backgroundUrl = "https://i.postimg.cc/cJnvLjhs/pngtree-animated-gif-webcam-overlay-pixel-image-16531760.jpg";

// Changed to named export
export const ModeratorEntries: React.FC<Props> = ({ transactions, onApprove, onDelete, members = [], onMergeTransactions, currentUser }) => {
  const pending = transactions.filter(t => t.status === 'PENDING');
  const approvedModEntries = transactions.filter(t => t.status === 'APPROVED' && t.createdBy !== 'ADMIN');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [showPasteModal, setShowPasteModal] = useState(false);
  const [pasteText, setPasteText] = useState("");

  const getModeratorSerial = (userId: string) => {
    return members.find(m => m.id === userId)?.moderatorSerial;
  };

  const formatDateToBengali = (dateStr: string) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return date.toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const processImportData = (json: any) => {
    if (json.type === 'moderator_monthly_report' && Array.isArray(json.transactions)) {
        // Force status to PENDING just in case
        const txsToImport = json.transactions.map((t: Transaction) => ({
          ...t,
          status: 'PENDING' // Ensure it needs approval
        }));
        if (onMergeTransactions) {
          onMergeTransactions(txsToImport);
        }
     } else {
       alert('ভুল ফাইল ফরম্যাট। মডারেটর রিপোর্ট ফাইল বা কোড ব্যবহার করুন।');
     }
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        processImportData(json);
      } catch (err) {
        alert('ফাইল পড়তে সমস্যা হয়েছে।');
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset
  };

  const handlePasteImport = () => {
    try {
        if (!pasteText) return;
        const json = JSON.parse(pasteText);
        processImportData(json);
        setShowPasteModal(false);
        setPasteText("");
    } catch (e) {
        alert('ভুল কোড। অনুগ্রহ করে সঠিক JSON কোড পেস্ট করুন।');
    }
  };

  return (
    <div className="relative rounded-t-[2.5rem] overflow-hidden -mt-4">
      <div className="absolute inset-0 bg-cover bg-center z-0" style={{ backgroundImage: `url(${backgroundUrl})` }}></div>
      <div className="absolute inset-0 bg-black/20 z-0"></div>
      <div className="relative z-10 p-6 space-y-8 pb-32">
        <div className="flex justify-between items-end text-white">
          <div>
            <h2 className="text-3xl font-[1000] tracking-tighter leading-none">মডারেটর এন্ট্রি</h2>
            <p className="text-[11px] text-amber-300 font-[1000] uppercase tracking-widest mt-2">পর্যালোচনা ও অনুমোদন</p>
          </div>
          <div className="w-16 h-16 bg-amber-500/10 rounded-[1.75rem] flex items-center justify-center text-amber-300 shadow-inner border border-amber-500/20">
            <ShieldCheck size={32} strokeWidth={2.5} />
          </div>
        </div>

        {currentUser.role !== 'VIEWER' && (
          <div className="bg-black/20 backdrop-blur-sm p-8 rounded-[3rem] shadow-xl border border-amber-500/20 space-y-6">
            <h3 className="font-black text-slate-100 uppercase tracking-widest text-base flex items-center gap-2">
              <FileUp size={18} className="text-amber-400" /> রিপোর্ট ইম্পোর্ট করুন
            </h3>
            <p className="text-xs text-slate-300 font-bold leading-relaxed">
              মডারেটর থেকে পাওয়া মাসিক রিপোর্ট ফাইল বা কোড আপলোড/পেস্ট করুন। এটি পেন্ডিং এন্ট্রি হিসেবে যুক্ত হবে।
            </p>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImport} 
              accept=".json" 
              className="hidden" 
            />
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => fileInputRef.current?.click()} 
                className="py-4 bg-amber-600 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-3 shadow-lg shadow-amber-900/50 active:scale-95 transition-all"
              >
                <Upload size={18} /> ফাইল আপলোড
              </button>
              <button 
                onClick={() => setShowPasteModal(true)} 
                className="py-4 bg-slate-600 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-3 shadow-lg shadow-slate-900/50 active:scale-95 transition-all"
              >
                <Clipboard size={18} /> কোড পেস্ট করুন
              </button>
            </div>
          </div>
        )}

        {pending.length > 0 && (
          <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-3 ml-2">
              <Clock className="text-amber-400" size={20} strokeWidth={3} />
              <h3 className="font-black text-slate-100 text-sm uppercase tracking-widest">পেন্ডিং এন্ট্রি ({pending.length})</h3>
            </div>
            <div className="space-y-4">
              {pending.map(t => {
                const creator = members.find(m => m.id === t.createdBy);
                return (
                  <div key={t.id} className="bg-black/20 backdrop-blur-sm p-5 rounded-[2.75rem] shadow-xl border border-amber-500/30 flex justify-between items-center group relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-2 h-full bg-amber-500 opacity-60"></div>
                    
                    <div className="flex items-center gap-5 relative z-10 pl-2">
                      <div className={`w-14 h-14 rounded-[1.25rem] flex items-center justify-center shadow-inner ${t.type === 'INCOME' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                        {t.type === 'INCOME' ? <ArrowUpRight size={28} strokeWidth={3.5} /> : <ArrowDownLeft size={28} strokeWidth={3.5} />}
                      </div>
                      <div className="space-y-1">
                        <p className="font-[1000] text-slate-100 text-lg leading-none">{t.category}</p>
                        <p className="text-[10px] font-bold text-amber-300">৳ {t.amount} • {t.description || 'বিবরণ নেই'}</p>
                        {creator && (
                          <div className="bg-amber-500/10 text-amber-300 px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm border border-amber-500/20" title="Moderator Entry">
                            <ShieldCheck size={10} strokeWidth={3} />
                            <span className="text-[8px] font-black uppercase">M-{creator.moderatorSerial} ({creator.name})</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {currentUser.role !== 'VIEWER' && (
                      <div className="flex items-center gap-4 relative z-10">
                        <button 
                          onClick={() => onApprove(t.id)}
                          className="bg-emerald-600 text-white px-5 py-2.5 rounded-2xl font-black text-[12px] shadow-lg shadow-emerald-900/50 active:scale-90 transition-all flex items-center gap-2"
                        >
                          <CheckCircle2 size={16} strokeWidth={3} /> অনুমোদন দিন
                        </button>
                        <button 
                          onClick={() => confirm('মুছে ফেলবেন?') && onDelete(t.id)}
                          className="p-2.5 text-rose-400 bg-white/5 rounded-xl hover:bg-white/10 transition-all"
                          title="মুছে ফেলুন"
                        >
                          <Trash2 size={18} strokeWidth={2.5} />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {approvedModEntries.length > 0 && (
          <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-3 ml-2">
              <CheckCircle2 className="text-emerald-400" size={20} strokeWidth={3} />
              <h3 className="font-black text-slate-100 text-sm uppercase tracking-widest">অনুমোদিত মডারেটর এন্ট্রি ({approvedModEntries.length})</h3>
            </div>
            <div className="space-y-4">
              {approvedModEntries.map(t => {
                const creator = members.find(m => m.id === t.createdBy);
                return (
                  <div key={t.id} className="bg-black/20 backdrop-blur-sm p-5 rounded-[2.75rem] shadow-lg border border-white/10 flex justify-between items-center group relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-2 h-full bg-emerald-500 opacity-60"></div>
                    
                    <div className="flex items-center gap-5 relative z-10 pl-2">
                      <div className={`w-14 h-14 rounded-[1.25rem] flex items-center justify-center shadow-inner ${t.type === 'INCOME' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                        {t.type === 'INCOME' ? <ArrowUpRight size={28} strokeWidth={3.5} /> : <ArrowDownLeft size={28} strokeWidth={3.5} />}
                      </div>
                      <div className="space-y-1">
                        <p className="font-[1000] text-slate-100 text-lg leading-none">{t.category}</p>
                        <p className="text-[10px] font-bold text-slate-300">৳ {t.amount} • {t.description || 'বিবরণ নেই'}</p>
                        {creator && (
                          <div className="bg-emerald-500/10 text-emerald-300 px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm border border-emerald-500/20" title="Moderator Entry">
                            <ShieldCheck size={10} strokeWidth={3} />
                            <span className="text-[8px] font-black uppercase">M-{creator.moderatorSerial} ({creator.name})</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 relative z-10">
                      <div className={`flex flex-col items-end px-5 py-2.5 rounded-2xl shadow-inner border border-white/5 ${t.type === 'INCOME' ? 'bg-emerald-500/10' : 'bg-rose-500/10'}`}>
                        <span className={`font-[1000] text-xl tracking-tighter ${t.type === 'INCOME' ? 'text-emerald-300' : 'text-rose-300'}`}>
                          {t.type === 'INCOME' ? '+' : '-'} ৳{t.amount.toLocaleString()}
                        </span>
                      </div>
                      {currentUser.role !== 'VIEWER' && (
                        <button 
                          onClick={() => confirm('মুছে ফেলবেন?') && onDelete(t.id)}
                          className="p-2.5 text-slate-400 hover:text-rose-400 bg-white/5 hover:bg-white/10 rounded-xl transition-all"
                          title="মুছে ফেলুন"
                        >
                          <Trash2 size={20} strokeWidth={2.5} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {pending.length === 0 && approvedModEntries.length === 0 && (
          <div className="text-center py-24 space-y-6 bg-black/20 border-4 border-dashed border-slate-700 rounded-[3rem] animate-in fade-in duration-700">
            <div className="w-24 h-24 bg-black/20 rounded-[2.5rem] shadow-inner flex items-center justify-center mx-auto text-slate-600">
              <Clock size={48} strokeWidth={2} />
            </div>
            <p className="text-slate-500 font-black uppercase tracking-widest text-xs">কোনো মডারেটর এন্ট্রি নেই</p>
          </div>
        )}

        {showPasteModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 animate-in fade-in duration-300">
            <div className="bg-slate-800 w-full max-w-sm rounded-[3rem] shadow-2xl p-8 border border-slate-600 animate-in zoom-in-95 duration-500">
              <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-[1000] text-slate-100">কোড পেস্ট করুন</h3>
                  <button onClick={() => setShowPasteModal(false)} className="p-2 bg-slate-700 rounded-full text-slate-400 hover:text-rose-500">
                    <X size={20} />
                  </button>
              </div>
              <p className="text-[10px] text-slate-400 mb-2">মডারেটরের দেওয়া পুরো কোডটি কপি করে নিচে পেস্ট করুন:</p>
              <textarea 
                value={pasteText}
                onChange={e => setPasteText(e.target.value)}
                className="w-full h-40 bg-slate-900 border border-slate-600 rounded-2xl p-4 text-xs font-mono text-slate-300 focus:border-amber-500 outline-none mb-6"
                placeholder='{"type": "moderator_monthly_report", ...}'
              />
              <button 
                  onClick={handlePasteImport}
                  className="w-full py-4 bg-amber-600 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg"
              >
                  <Upload size={18} /> রিস্টোর করুন
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
