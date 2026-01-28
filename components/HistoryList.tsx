
import React, { useState } from 'react';
import { Transaction, Member } from '../types';
import { Search, Trash2, Calendar, ArrowUpRight, ArrowDownLeft, Receipt, ChevronRight, ShieldCheck, Clock, CheckCircle2, Edit3, User as UserIcon, Share2 } from 'lucide-react'; // Added UserIcon and Share2

interface Props {
  transactions: Transaction[];
  onDelete: (id: string) => void;
  onEdit?: (transaction: Transaction) => void;
  isAdmin?: boolean;
  onApprove?: (id: string) => void;
  title?: string;
  members?: Member[];
  // FIX: Added 'VIEWER' to the role union type to match the type of the currentUser state from App.tsx.
  currentUser: { role: 'ADMIN' | 'MODERATOR' | 'MEMBER' | 'VIEWER', id: string, name: string }; // Added currentUser
}

const backgroundUrl = "https://i.postimg.cc/htcx8sjV/feliz-noche.gif";

const HistoryList: React.FC<Props> = ({ transactions, onDelete, onEdit, isAdmin, onApprove, title = 'হিসাবের খাতা', members = [], currentUser }) => {
  const [search, setSearch] = useState('');

  const memberMap = new Map(members.map(m => [m.id, m])); // For efficient member lookup

  const filtered = transactions.filter(t => 
    t.category.toLowerCase().includes(search.toLowerCase()) || 
    t.description.toLowerCase().includes(search.toLowerCase()) ||
    t.receiptNo?.toLowerCase().includes(search.toLowerCase()) ||
    (t.memberId && memberMap.get(t.memberId)?.name.toLowerCase().includes(search.toLowerCase())) // Search by member name
  );

  const groups: { [date: string]: Transaction[] } = {};
  filtered.forEach(t => {
    if (!groups[t.date]) groups[t.date] = [];
    groups[t.date].push(t);
  });

  const sortedDates = Object.keys(groups).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  const formatDateToBengali = (dateStr: string) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return date.toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const getModeratorSerial = (userId: string) => {
    const member = members.find(m => m.id === userId);
    return member?.moderatorSerial;
  };

  const handleShareToWhatsApp = () => {
    const totalIncome = filtered.filter(t => t.type === 'INCOME').reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = filtered.filter(t => t.type === 'EXPENSE').reduce((sum, t) => sum + t.amount, 0);
    const netBalance = totalIncome - totalExpense;

    // Get date range for the filtered transactions
    const transactionDates = filtered.map(t => new Date(t.date));
    const minDate = transactionDates.length > 0 ? new Date(Math.min(...transactionDates.map(d => d.getTime()))) : null;
    const maxDate = transactionDates.length > 0 ? new Date(Math.max(...transactionDates.map(d => d.getTime()))) : null;

    let dateRange = "সকল তারিখ";
    if (minDate && maxDate) {
        if (minDate.toDateString() === maxDate.toDateString()) {
            dateRange = formatDateToBengali(minDate.toISOString().split('T')[0]);
        } else {
            dateRange = `${formatDateToBengali(minDate.toISOString().split('T')[0])} - ${formatDateToBengali(maxDate.toISOString().split('T')[0])}`;
        }
    }

    let message = `*মসজিদ হিসাবের সারসংক্ষেপ*\n`;
    message += `*সময়কাল:* ${dateRange}\n`;
    message += `-------------------------\n`;
    message += `*মোট আয়:* ৳${totalIncome.toLocaleString('bn-BD')}\n`;
    message += `*মোট ব্যয়:* ৳${totalExpense.toLocaleString('bn-BD')}\n`;
    message += `*নিট ব্যালেন্স:* ৳${netBalance.toLocaleString('bn-BD')}\n`;
    message += `-------------------------\n`;
    
    // Add last 5 transactions
    const recentTransactions = filtered.slice(0, 5); // Take top 5 from filtered, as they are already sorted by date descending.
    if (recentTransactions.length > 0) {
      message += `*সাম্প্রতিক ${recentTransactions.length}টি লেনদেন:*\n`;
      recentTransactions.forEach(t => {
        const member = t.memberId ? memberMap.get(t.memberId) : undefined;
        const detail = member ? member.name : (t.description || t.category);
        const typePrefix = t.type === 'INCOME' ? '+' : '-';
        message += `• ${formatDateToBengali(t.date)} - ${t.category} (${detail}) - ${typePrefix}৳${t.amount.toLocaleString('bn-BD')}\n`;
      });
      message += `-------------------------\n`;
    }

    message += `এই রিপোর্টটি N~J Group মসজিদ অ্যাপ থেকে তৈরি করা হয়েছে।`;

    const whatsappUrl = `https://wa.me/8801750242240?text=${encodeURIComponent(message)}`; // Corrected WhatsApp number here
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="relative rounded-t-[2.5rem] overflow-hidden -mt-4">
      <div className="absolute inset-0 bg-cover bg-center z-0" style={{ backgroundImage: `url(${backgroundUrl})` }}></div>
      <div className="absolute inset-0 bg-black/20 z-0"></div>
      <div className="relative z-10 p-6 space-y-8 pb-32">
        <div className="flex justify-between items-end text-white">
          <div>
            <h2 className="text-3xl font-[1000] tracking-tighter leading-none">{title}</h2>
            <div className="flex items-center gap-2 mt-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
              <p className="text-[11px] text-slate-300 font-[1000] uppercase tracking-[0.3em]">ট্রানজেকশন হিস্ট্রি</p>
            </div>
          </div>
          <div className="w-16 h-16 bg-white/10 rounded-[1.75rem] flex items-center justify-center text-emerald-300 shadow-[0_10px_30px_rgba(0,0,0,0.2)] border border-white/10">
            <Receipt size={32} strokeWidth={2.5} />
          </div>
        </div>
        
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
            <Search className="text-emerald-400 opacity-60 group-focus-within:opacity-100 transition-all" size={22} strokeWidth={3} />
          </div>
          <input 
            type="text"
            placeholder="বিবরণ, খাত, রশিদ নং বা সদস্য খুঁজুন..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-14 pr-8 py-5.5 bg-black/20 border-2 border-white/10 rounded-[2.5rem] outline-none focus:border-emerald-500/50 shadow-inner font-black text-white transition-all placeholder:text-slate-400"
          />
        </div>

        {/* WhatsApp Share Button */}
        <button 
          onClick={handleShareToWhatsApp}
          className="w-full py-4 rounded-[2rem] bg-emerald-500 text-white font-[1000] text-sm flex items-center justify-center gap-3 shadow-lg shadow-emerald-900/50 active:scale-95 transition-all"
        >
          <Share2 size={20} /> WhatsApp এ শেয়ার করুন
        </button>

        <div className="space-y-10">
          {sortedDates.length === 0 ? (
            <div className="text-center py-24 text-slate-500 bg-black/20 rounded-[3rem] border-4 border-dashed border-slate-700 flex flex-col items-center gap-6">
              <div className="w-24 h-24 bg-black/20 rounded-[2.5rem] flex justify-center items-center shadow-inner">
                <Calendar size={48} className="opacity-20" />
              </div>
              <p className="font-[1000] uppercase tracking-[0.4em] text-xs">কোন ডাটা নেই</p>
            </div>
          ) : (
            sortedDates.map(date => (
              <div key={date} className="space-y-5 animate-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-3 ml-2">
                  <div className="h-6 w-1.5 bg-gradient-to-b from-emerald-500 to-teal-400 rounded-full shadow-lg shadow-emerald-900/50"></div>
                  <span className="text-xs font-[1000] text-slate-200 uppercase tracking-[0.25em] bg-white/10 px-4 py-1.5 rounded-xl shadow-inner border border-white/5">
                    {formatDateToBengali(date)}
                  </span>
                </div>
                
                <div className="space-y-4">
                  {groups[date].map(t => {
                    const member = t.memberId ? memberMap.get(t.memberId) : undefined;
                    const canEditOrDelete = isAdmin || (currentUser.role === 'MODERATOR' && t.createdBy === currentUser.id);

                    return (
                    <div key={t.id} className={`bg-black/20 backdrop-blur-sm p-5 rounded-[2.75rem] shadow-xl border flex justify-between items-center group transition-all relative overflow-hidden ${t.status === 'PENDING' ? 'border-amber-500/30' : 'border-white/10'}`}>
                      <div className="absolute top-0 left-0 w-2 h-full transition-all group-hover:w-3 opacity-60" style={{backgroundColor: t.type === 'INCOME' ? '#10b981' : '#f43f5e'}}></div>
                      
                      <div className="flex items-center gap-5 relative z-10 pl-2">
                        <div className={`w-14 h-14 rounded-[1.25rem] flex items-center justify-center shadow-inner group-hover:rotate-12 transition-transform duration-500 ${t.type === 'INCOME' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                          {t.type === 'INCOME' ? <ArrowUpRight size={28} strokeWidth={3.5} /> : <ArrowDownLeft size={28} strokeWidth={3.5} />}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-[1000] text-slate-100 text-lg tracking-tight leading-none">{t.category}</span>
                            {member && (
                              <div className="bg-emerald-500/10 text-emerald-300 px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm border border-emerald-500/20" title="সদস্য">
                                <UserIcon size={10} strokeWidth={3} />
                                <span className="text-[8px] font-black uppercase">{member.name}</span>
                              </div>
                            )}
                            {t.createdBy !== 'ADMIN' && t.status === 'APPROVED' && (
                              <div className="bg-emerald-500/10 text-emerald-300 px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm border border-emerald-500/20" title="Moderator Entry">
                                <ShieldCheck size={10} strokeWidth={3} />
                                <span className="text-[8px] font-black uppercase">M-{getModeratorSerial(t.createdBy)}</span>
                              </div>
                            )}
                            {t.status === 'PENDING' && (
                              <div className="bg-amber-500/10 text-amber-300 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest">
                                Pending
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <div className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-slate-600"></div>
                              <span className="text-[11px] text-slate-400 font-black uppercase tracking-widest line-clamp-1 max-w-[150px]">{t.description || 'বিবরণ নেই'}</span>
                            </div>
                            {t.receiptNo && (
                              <span className="text-[10px] text-emerald-400 font-bold ml-3.5">রশিদ: {t.receiptNo}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 relative z-10">
                        <div className={`flex flex-col items-end px-5 py-2.5 rounded-2xl shadow-inner border border-white/5 ${t.type === 'INCOME' ? 'bg-emerald-500/10' : 'bg-rose-500/10'}`}>
                          <span className={`font-[1000] text-xl tracking-tighter ${t.type === 'INCOME' ? 'text-emerald-300' : 'text-rose-400'}`}>
                            {t.type === 'INCOME' ? '+' : '-'} ৳${t.amount.toLocaleString()}
                          </span>
                        </div>
                        {canEditOrDelete && (
                          <div className="flex flex-col gap-2">
                            {isAdmin && t.status === 'PENDING' && onApprove && (
                              <button 
                                onClick={() => onApprove(t.id)}
                                className="text-emerald-400 p-2.5 bg-white/5 rounded-xl hover:bg-white/10 transition-all"
                              >
                                <CheckCircle2 size={18} strokeWidth={3} />
                              </button>
                            )}
                            {onEdit && (
                              <button 
                                onClick={() => onEdit(t)}
                                className="text-slate-400 hover:text-emerald-400 p-2.5 transition-all bg-white/5 hover:bg-white/10 rounded-[1.25rem]"
                                title="এডিট করুন"
                              >
                                <Edit3 size={18} strokeWidth={2.5} />
                              </button>
                            )}
                            <button 
                              onClick={() => onDelete(t.id)}
                              className="text-slate-400 hover:text-rose-400 p-2.5 transition-all bg-white/5 hover:bg-white/10 rounded-[1.25rem]"
                              title="মুছে ফেলুন"
                            >
                              <Trash2 size={20} strokeWidth={2.5} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryList;
