import React, { useState, useMemo } from 'react';
import { Transaction, Member } from '../types';
import { 
  User, 
  ChevronDown, 
  Calendar, 
  Search, 
  TrendingUp, 
  TrendingDown, 
  ShieldCheck, 
  ArrowRight,
  Wallet
} from 'lucide-react';

interface Props {
  transactions: Transaction[];
  members: Member[];
}

const MONTH_NAMES = ["জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন", "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"];
const YEARS = Array.from({ length: 10 }, (_, i) => (new Date().getFullYear() - 5 + i).toString());

const backgroundUrl = "https://i.postimg.cc/htcx8sjV/feliz-noche.gif";

const ModeratorMonthlyReport: React.FC<Props> = ({ transactions, members }) => {
  const [selectedMonth, setSelectedMonth] = useState((new Date().getMonth() + 1).toString());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedModeratorId, setSelectedModeratorId] = useState<string>('');

  // Filter only members who are moderators
  const moderators = useMemo(() => members.filter(m => m.isModerator), [members]);

  // Calculate stats based on selection
  const stats = useMemo(() => {
    if (!selectedModeratorId) return null;

    const selectedPeriod = `${selectedYear}-${selectedMonth.padStart(2, '0')}`;
    
    // Filter transactions created by the selected moderator in the selected month
    const modTransactions = transactions.filter(t => 
      t.createdBy === selectedModeratorId && 
      t.status === 'APPROVED' &&
      (t.calculationDate || t.date).startsWith(selectedPeriod)
    );

    const income = modTransactions
      .filter(t => t.type === 'INCOME')
      .reduce((sum, t) => sum + t.amount, 0);

    const expense = modTransactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      income,
      expense,
      balance: income - expense,
      count: modTransactions.length,
      transactions: modTransactions
    };
  }, [transactions, selectedModeratorId, selectedMonth, selectedYear]);

  const selectedModerator = members.find(m => m.id === selectedModeratorId);

  return (
    <div className="relative rounded-t-[2.5rem] overflow-hidden -mt-4">
      <div className="absolute inset-0 bg-cover bg-center z-0" style={{ backgroundImage: `url(${backgroundUrl})` }}></div>
      <div className="absolute inset-0 bg-black/20 z-0"></div>
      <div className="relative z-10 p-6 space-y-8 pb-32 animate-in fade-in duration-500 text-white">
        <div className="text-center space-y-3 mb-4">
          <h2 className="text-3xl font-[1000] tracking-tighter leading-none">মডারেটর মাসিক হিসাব</h2>
          <p className="text-[11px] text-indigo-300 font-[1000] uppercase tracking-[0.4em]">কালেকশন ও এন্ট্রি রিপোর্ট</p>
        </div>

        {/* Selectors */}
        <div className="bg-black/20 backdrop-blur-xl p-6 rounded-[2.5rem] shadow-xl border border-white/10 space-y-4">
          
          {/* Month & Year Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="relative group">
              <select 
                value={selectedMonth}
                onChange={e => setSelectedMonth(e.target.value)}
                className="w-full pl-5 pr-8 py-3 bg-black/20 border-2 border-white/10 rounded-[2rem] outline-none font-bold text-slate-100 appearance-none shadow-inner focus:border-indigo-500/50 transition-all text-sm"
              >
                {MONTH_NAMES.map((name, i) => (
                  <option key={i} value={i + 1}>{name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} strokeWidth={3} />
            </div>
            <div className="relative group">
              <select 
                value={selectedYear}
                onChange={e => setSelectedYear(e.target.value)}
                className="w-full pl-5 pr-8 py-3 bg-black/20 border-2 border-white/10 rounded-[2rem] outline-none font-bold text-slate-100 appearance-none shadow-inner focus:border-indigo-500/50 transition-all text-sm"
              >
                {YEARS.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} strokeWidth={3} />
            </div>
          </div>

          {/* Moderator Selector */}
          <div className="relative group">
            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-indigo-400">
              <Search size={20} strokeWidth={2.5} />
            </div>
            <select 
              value={selectedModeratorId}
              onChange={e => setSelectedModeratorId(e.target.value)}
              className="w-full pl-14 pr-10 py-4 bg-indigo-500/10 border-2 border-indigo-500/20 rounded-[2rem] outline-none font-black text-slate-100 appearance-none shadow-sm focus:border-indigo-500 transition-all"
            >
              <option value="">-- মডারেটর সিলেক্ট করুন --</option>
              {moderators.map(m => (
                <option key={m.id} value={m.id}>
                  {m.name} (M-{m.moderatorSerial})
                </option>
              ))}
            </select>
            <div className="absolute right-6 top-1/2 -translate-y-1/2 text-indigo-400 pointer-events-none bg-indigo-500/20 p-1 rounded-full">
              <ChevronDown size={16} strokeWidth={3} />
            </div>
          </div>
        </div>

        {/* Report Content */}
        {selectedModeratorId && stats ? (
          <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            
            {/* Summary Card */}
            <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[3rem] p-8 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-10 rotate-12 group-hover:scale-110 transition-transform">
                <ShieldCheck size={140} />
              </div>
              
              <div className="relative z-10 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20">
                    <User size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-[1000] leading-none">{selectedModerator?.name}</h3>
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 mt-1">
                      মডারেটর আইডি: M-{selectedModerator?.moderatorSerial}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="bg-white/10 p-4 rounded-[2rem] border border-white/10 flex flex-col justify-between h-28 relative overflow-hidden">
                      <div className="absolute -right-2 -top-2 text-emerald-300 opacity-20">
                          <TrendingUp size={60} />
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-emerald-200">মোট এন্ট্রি (আয়)</p>
                      <p className="font-[1000] text-2xl">৳ {stats.income.toLocaleString()}</p>
                  </div>
                  <div className="bg-white/10 p-4 rounded-[2rem] border border-white/10 flex flex-col justify-between h-28 relative overflow-hidden">
                      <div className="absolute -right-2 -top-2 text-rose-300 opacity-20">
                          <TrendingDown size={60} />
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-rose-200">মোট এন্ট্রি (ব্যয়)</p>
                      <p className="font-[1000] text-2xl">৳ {stats.expense.toLocaleString()}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between bg-black/20 p-4 rounded-[1.5rem] border border-white/5">
                  <div className="flex items-center gap-2">
                      <Wallet size={16} className="text-amber-300" />
                      <span className="text-xs font-bold">মোট লেনদেন সংখ্যা</span>
                  </div>
                  <span className="font-black text-xl">{stats.count} টি</span>
                </div>
              </div>
            </div>

            {/* Breakdown / Message */}
            {stats.count === 0 ? (
              <div className="text-center py-12 bg-black/20 border-4 border-dashed border-slate-700 rounded-[3rem]">
                <p className="text-slate-500 font-black uppercase tracking-widest text-xs">এই মাসে কোনো এন্ট্রি নেই</p>
              </div>
            ) : (
              <div className="bg-black/20 p-6 rounded-[2.5rem] shadow-lg border border-white/10 space-y-4">
                <h4 className="font-black text-slate-200 ml-2 flex items-center gap-2">
                  <Calendar size={16} className="text-indigo-400" /> বিস্তারিত লগ
                </h4>
                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                  {stats.transactions.map((t, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-black/20 rounded-2xl border border-white/10">
                        <div>
                          <p className="text-xs font-black text-slate-200">{t.category}</p>
                          <p className="text-[10px] text-slate-400 font-bold line-clamp-1">{t.description || 'বিবরণ নেই'}</p>
                        </div>
                        <div className={`text-right ${t.type === 'INCOME' ? 'text-emerald-400' : 'text-rose-400'}`}>
                          <p className="font-[1000] text-sm">
                            {t.type === 'INCOME' ? '+' : '-'} ৳{t.amount}
                          </p>
                          <p className="text-[9px] font-bold text-slate-400">{t.date}</p>
                        </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        ) : (
          <div className="text-center py-16 opacity-50 space-y-4">
            <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto text-indigo-400">
              <User size={40} />
            </div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">রিপোর্ট দেখতে মডারেটর সিলেক্ট করুন</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModeratorMonthlyReport;
