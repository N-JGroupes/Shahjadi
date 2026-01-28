
import React, { useState, useMemo } from 'react';
import { Transaction, Member } from '../types';
import { 
  User, 
  ChevronDown, 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  ShieldCheck, 
  Wallet,
  ClipboardList,
  FileDown,
  MessageCircle,
  Share2,
  Clock,
  CheckCircle2
} from 'lucide-react';

interface Props {
  transactions: Transaction[];
  // FIX: Added 'VIEWER' to the role union type to match the type of the currentUser state from App.tsx.
  currentUser: { role: 'ADMIN' | 'MODERATOR' | 'MEMBER' | 'VIEWER', id: string, name: string };
  members: Member[];
}

const MONTH_NAMES = ["জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন", "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"];
const YEARS = Array.from({ length: 10 }, (_, i) => (new Date().getFullYear() - 5 + i).toString());

const backgroundUrl = "https://i.postimg.cc/htcx8sjV/feliz-noche.gif";

const MyEntryReport: React.FC<Props> = ({ transactions, currentUser, members }) => {
  const [selectedMonth, setSelectedMonth] = useState((new Date().getMonth() + 1).toString());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

  // Get current moderator details to show Serial No
  const currentMemberInfo = useMemo(() => members.find(m => m.id === currentUser.id), [members, currentUser.id]);

  // Calculate stats based on selection for the specific logged-in user
  const stats = useMemo(() => {
    const selectedPeriod = `${selectedYear}-${selectedMonth.padStart(2, '0')}`;
    
    // Filter transactions created by the CURRENT USER in the selected month
    // NOTE: Removed 't.status === APPROVED' check so moderator can see/download PENDING entries too.
    const myTransactions = transactions.filter(t => 
      t.createdBy === currentUser.id && 
      (t.calculationDate || t.date).startsWith(selectedPeriod)
    );

    const income = myTransactions
      .filter(t => t.type === 'INCOME')
      .reduce((sum, t) => sum + t.amount, 0);

    const expense = myTransactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + t.amount, 0);

    const pendingCount = myTransactions.filter(t => t.status === 'PENDING').length;

    return {
      income,
      expense,
      count: myTransactions.length,
      pendingCount,
      transactions: myTransactions
    };
  }, [transactions, currentUser.id, selectedMonth, selectedYear]);

  // New function to handle report download and WhatsApp message
  const handleSendReport = async () => {
    if (stats.transactions.length === 0) {
      alert('এই মাসে পাঠানোর মতো কোনো ডাটা নেই।');
      return;
    }

    const reportData = {
      type: 'moderator_monthly_report',
      exportedAt: new Date().toISOString(),
      moderator: {
        id: currentUser.id,
        name: currentUser.name,
        serial: currentMemberInfo?.moderatorSerial
      },
      month: selectedMonth,
      year: selectedYear,
      transactions: stats.transactions
    };

    // Fixed Regex: Use RegExp constructor
    const sanitizedName = currentUser.name.replace(new RegExp('\\s+', 'g'), '_');
    const fileName = `Report_${sanitizedName}_${MONTH_NAMES[parseInt(selectedMonth)-1]}_${selectedYear}.json`;
    const adminPhone = "8801750242240";
    const monthName = MONTH_NAMES[parseInt(selectedMonth)-1];
    const text = `আসসালামু আলাইকুম। আমি ${currentUser.name}। ${monthName} ${selectedYear} এর হিসাবের রিপোর্ট ফাইলটি এখানে অ্যাটাচ করে পাঠাচ্ছি, দয়া করে চেক করুন।`;

    try {
      // 1. Try Native Share (Best for Android WebView/APK)
      const dataStr = JSON.stringify(reportData, null, 2);
      const blob = new Blob([dataStr], { type: "application/json" });
      const file = new File([blob], fileName, { type: "application/json" });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Monthly Report',
          text: text
        });
        return; // Stop if share was successful
      }
    } catch (e) {
      console.log('Share failed, trying download...');
    }

    // 2. Fallback to Download then WhatsApp link
    try {
      const dataStr = JSON.stringify(reportData, null, 2);
      const blob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url); // Clean up

      // Small delay to allow download to start
      setTimeout(() => {
        window.open(`https://wa.me/${adminPhone}?text=${encodeURIComponent(text)}`, '_blank');
      }, 500);

    } catch (err) {
      console.error('Error downloading report:', err);
      alert('রিপোর্ট ডাউনলোডে সমস্যা হয়েছে।');
    }
  };

  return (
    <div className="relative rounded-t-[2.5rem] overflow-hidden -mt-4">
      <div className="absolute inset-0 bg-cover bg-center z-0" style={{ backgroundImage: `url(${backgroundUrl})` }}></div>
      <div className="absolute inset-0 bg-black/20 z-0"></div>
      <div className="relative z-10 p-6 space-y-8 pb-32 text-white animate-in fade-in duration-500">
        <div className="text-center space-y-3 mb-4">
          <h2 className="text-3xl font-[1000] tracking-tighter leading-none">আমার হিসাব</h2>
          <p className="text-[11px] text-teal-300 font-[1000] uppercase tracking-[0.4em]">নিজের এন্ট্রি রিপোর্ট ও শেয়ার</p>
        </div>

        {/* Header Info Card */}
        <div className="bg-black/20 backdrop-blur-md p-4 rounded-[2rem] border border-white/10 flex items-center justify-center gap-3 mb-2">
          <div className="p-2 bg-teal-500/10 text-teal-300 rounded-full">
              <User size={20} strokeWidth={2.5} />
          </div>
          <div className="text-left">
              <h3 className="text-sm font-black text-slate-100">{currentUser.name}</h3>
              {currentMemberInfo?.moderatorSerial && (
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-700/50 px-2 py-0.5 rounded-md">
                      Moderator ID: M-{currentMemberInfo.moderatorSerial}
                  </span>
              )}
          </div>
        </div>

        {/* Selectors */}
        <div className="bg-black/20 backdrop-blur-xl p-6 rounded-[2.5rem] shadow-xl border border-white/10 space-y-4">
          <div className="flex items-center gap-2 px-2">
            <Calendar size={16} className="text-teal-400" />
            <p className="text-[11px] font-[1000] text-slate-300 uppercase tracking-widest">রিপোর্টের মাস ও সাল নির্বাচন করুন</p>
          </div>
          {/* Month & Year Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="relative group">
              <select 
                value={selectedMonth}
                onChange={e => setSelectedMonth(e.target.value)}
                className="w-full pl-5 pr-8 py-3 bg-black/20 border-2 border-white/10 rounded-[2rem] outline-none font-bold text-slate-100 appearance-none shadow-inner focus:border-teal-500/50 transition-all text-sm"
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
                className="w-full pl-5 pr-8 py-3 bg-black/20 border-2 border-white/10 rounded-[2rem] outline-none font-bold text-slate-100 appearance-none shadow-inner focus:border-teal-500/50 transition-all text-sm"
              >
                {YEARS.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} strokeWidth={3} />
            </div>
          </div>
        </div>

        {/* Report Content */}
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            
            {/* Summary Card */}
            <div className="bg-gradient-to-br from-teal-600 to-emerald-700 rounded-[3rem] p-8 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-10 rotate-12 group-hover:scale-110 transition-transform">
                <ClipboardList size={140} />
              </div>
              
              <div className="relative z-10 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">
                      {MONTH_NAMES[parseInt(selectedMonth)-1]} {selectedYear} এর সারাংশ
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="bg-white/10 p-4 rounded-[2rem] border border-white/10 flex flex-col justify-between h-28 relative overflow-hidden">
                      <div className="absolute -right-2 -top-2 text-emerald-300 opacity-20">
                          <TrendingUp size={60} />
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-emerald-200">আমার এন্ট্রি (আয়)</p>
                      <p className="font-[1000] text-2xl">৳ {stats.income.toLocaleString()}</p>
                  </div>
                  <div className="bg-white/10 p-4 rounded-[2rem] border border-white/10 flex flex-col justify-between h-28 relative overflow-hidden">
                      <div className="absolute -right-2 -top-2 text-rose-300 opacity-20">
                          <TrendingDown size={60} />
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-rose-200">আমার এন্ট্রি (ব্যয়)</p>
                      <p className="font-[1000] text-2xl">৳ {stats.expense.toLocaleString()}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between bg-black/20 p-4 rounded-[1.5rem] border border-white/5">
                  <div className="flex items-center gap-2">
                      <Wallet size={16} className="text-amber-300" />
                      <span className="text-xs font-bold">মোট এন্ট্রি সংখ্যা</span>
                  </div>
                  <div className="text-right">
                      <span className="font-black text-xl block leading-none">{stats.count} টি</span>
                      {stats.pendingCount > 0 && (
                          <span className="text-[9px] font-bold text-amber-300">
                              {stats.pendingCount} টি পেন্ডিং আছে
                          </span>
                      )}
                  </div>
                </div>
              </div>
            </div>

            {/* Send Report Button */}
            {stats.count > 0 && (
              <button 
                onClick={handleSendReport}
                className="w-full py-5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-[2rem] font-black text-sm flex items-center justify-center gap-3 shadow-xl shadow-emerald-900/50 active:scale-95 transition-all group"
              >
                <Share2 size={22} className="group-hover:rotate-12 transition-transform" /> 
                {MONTH_NAMES[parseInt(selectedMonth)-1]} {selectedYear} এর হিসাব পাঠান
              </button>
            )}

            {/* Breakdown / Message */}
            {stats.count === 0 ? (
              <div className="text-center py-12 bg-black/20 border-4 border-dashed border-slate-700 rounded-[3rem]">
                <p className="text-slate-500 font-black uppercase tracking-widest text-xs">এই মাসে আপনার কোনো এন্ট্রি নেই</p>
              </div>
            ) : (
              <div className="bg-black/20 p-6 rounded-[2.5rem] shadow-lg border border-white/10 space-y-4">
                <h4 className="font-black text-slate-200 ml-2 flex items-center gap-2">
                  <Calendar size={16} className="text-teal-400" /> আমার এন্ট্রি সমূহ
                </h4>
                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                  {stats.transactions.map((t, idx) => (
                    <div key={idx} className={`flex items-center justify-between p-4 rounded-2xl border relative overflow-hidden ${t.status === 'PENDING' ? 'bg-amber-500/10 border-amber-500/20' : 'bg-slate-500/10 border-slate-500/20'}`}>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                              <p className="text-xs font-black text-slate-200">{t.category}</p>
                              {t.status === 'PENDING' ? (
                                  <span className="bg-amber-500/10 text-amber-300 text-[8px] font-black px-1.5 py-0.5 rounded flex items-center gap-1">
                                      <Clock size={8} /> পেন্ডিং
                                  </span>
                              ) : (
                                  <span className="bg-emerald-500/10 text-emerald-300 text-[8px] font-black px-1.5 py-0.5 rounded flex items-center gap-1">
                                      <CheckCircle2 size={8} /> অনুমোদিত
                                  </span>
                              )}
                          </div>
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
      </div>
    </div>
  );
};

export default MyEntryReport;
