import React, { useState, useMemo } from 'react';
import { Member, Transaction, Category } from '../types';
import { Search, Phone, AlertCircle, CheckCircle2, User, CalendarClock, CircleDollarSign } from 'lucide-react';

interface Props {
  members: Member[];
  transactions: Transaction[];
}

const backgroundUrl = "https://i.postimg.cc/htcx8sjV/feliz-noche.gif";

// Helper to get the effective monthly amount for a given year
const getEffectiveMonthlyAmount = (member: Member, year: number): number => {
  // Try to find the exact year's amount
  if (member.monthlyAmounts && member.monthlyAmounts[year.toString()] !== undefined) {
    return member.monthlyAmounts[year.toString()];
  }
  // If not found, look for the most recent previous year's amount
  for (let y = year - 1; y >= parseInt(member.startYear || '0'); y--) {
    if (member.monthlyAmounts && member.monthlyAmounts[y.toString()] !== undefined) {
      return member.monthlyAmounts[y.toString()];
    }
  }
  // Fallback to 0 if no monthly amount is defined for any relevant year
  return 0;
};


const DueList: React.FC<Props> = ({ members, transactions }) => {
  const [search, setSearch] = useState('');

  // Define currentYear and currentMonth here, outside useMemo, to make them accessible in JSX
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1; // 1-12

  const dueReport = useMemo(() => {
    const report = members.map(member => {
      let totalExpected = 0;
      
      const startYear = parseInt(member.startYear);
      const startMonth = member.startMonth || 1;

      // Calculate expected amount year by year from member's start year up to current year
      for (let y = startYear; y <= currentYear; y++) {
        const monthlyRateForYear = getEffectiveMonthlyAmount(member, y);
        if (monthlyRateForYear === 0) continue; // If no rate for this year, skip

        let monthsToConsider = 0;

        if (y === startYear && y === currentYear) {
          // Member started this year, and this is also the current year.
          // Count months from member's startMonth up to the currentMonth.
          monthsToConsider = Math.max(0, currentMonth - startMonth + 1);
        } else if (y === startYear) {
          // Member started in a previous year. Count from startMonth to December.
          monthsToConsider = 12 - startMonth + 1;
        } else if (y === currentYear) {
          // It's the current year, but member started in a previous year.
          // Count from January up to the currentMonth.
          monthsToConsider = currentMonth;
        } else {
          // Full year between startYear and currentYear.
          monthsToConsider = 12;
        }
        totalExpected += monthsToConsider * monthlyRateForYear;
      }

      // 2. Calculate Total Paid Amount
      const totalPaid = transactions
        .filter(t => t.memberId === member.id && t.category === Category.SUBSCRIPTION && t.type === 'INCOME' && t.status === 'APPROVED')
        .reduce((sum, t) => sum + t.amount, 0);

      // 3. Calculate Due
      const balance = totalPaid - totalExpected;
      const isDue = balance < 0;
      const dueAmount = Math.abs(balance);
      
      // Calculate approx months (decimal rounded up) based on current year's monthly rate
      const currentYearMonthlyRate = getEffectiveMonthlyAmount(member, currentYear);
      const dueMonths = isDue && currentYearMonthlyRate > 0 ? (dueAmount / currentYearMonthlyRate).toFixed(1) : '0';
      const advanceMonths = !isDue && currentYearMonthlyRate > 0 ? (balance / currentYearMonthlyRate).toFixed(1) : '0';

      return {
        ...member,
        totalPaid,
        totalExpected,
        balance,
        isDue,
        dueAmount,
        dueMonths,
        advanceMonths
      };
    });

    // Sort: High dues first, then by name
    return report.sort((a, b) => a.balance - b.balance);
  }, [members, transactions, currentYear, currentMonth]); // Add currentYear and currentMonth to dependencies

  const filteredList = useMemo(() => {
    return dueReport.filter(m => 
      m.name.toLowerCase().includes(search.toLowerCase()) || 
      m.memberNo.includes(search) || 
      m.phone.includes(search)
    );
  }, [dueReport, search]);

  const totalDueAmount = dueReport.filter(m => m.isDue).reduce((acc, m) => acc + m.dueAmount, 0);

  return (
    <div className="relative rounded-t-[2.5rem] overflow-hidden -mt-4">
      <div className="absolute inset-0 bg-cover bg-center z-0" style={{ backgroundImage: `url(${backgroundUrl})` }}></div>
      <div className="absolute inset-0 bg-black/20 z-0"></div>
      <div className="relative z-10 p-6 space-y-8 pb-32">
        <div className="text-center space-y-3 mb-4 text-white">
          <h2 className="text-4xl font-[1000] tracking-tighter leading-none">চাঁদা বকেয়া তালিকা</h2>
          <p className="text-[11px] text-rose-300 font-[1000] uppercase tracking-[0.4em]">সকল সদস্যের বকেয়া হিসাব</p>
        </div>

        {/* Summary Card */}
        <div className="bg-gradient-to-br from-rose-600 to-pink-700 rounded-[3rem] p-8 text-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-10 rotate-12">
            <AlertCircle size={140} />
          </div>
          <div className="relative z-10 text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-80 mb-2">মোট বকেয়া বাকেয়া (চলতি মাস সহ)</p>
            <div className="flex items-center justify-center gap-2">
              <span className="text-2xl font-black text-rose-200">৳</span>
              <h3 className="text-5xl font-[1000] tracking-tighter">{totalDueAmount.toLocaleString()}</h3>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
            <Search className="text-rose-400 opacity-60 group-focus-within:opacity-100 transition-all" size={24} strokeWidth={3} />
          </div>
          <input 
            type="text"
            placeholder="নাম বা আইডি দিয়ে খুঁজুন..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-16 pr-8 py-6 bg-black/20 backdrop-blur-xl border-2 border-white/10 rounded-[3rem] outline-none focus:border-rose-500/50 shadow-inner font-black text-white text-lg transition-all"
          />
        </div>

        <div className="space-y-4">
          {filteredList.map(member => (
            <div key={member.id} className={`p-6 rounded-[2.5rem] border flex items-center justify-between relative overflow-hidden group transition-all ${member.isDue ? 'bg-rose-900/20 border-rose-500/20' : 'bg-emerald-900/20 border-emerald-500/20'}`}>
              <div className={`absolute top-0 left-0 w-2 h-full transition-all group-hover:w-3 opacity-40 ${member.isDue ? 'bg-rose-500' : 'bg-emerald-500'}`}></div>
              
              <div className="flex items-center gap-5 relative z-10 pl-2">
                <div className={`w-14 h-14 rounded-[1.25rem] flex items-center justify-center shadow-inner group-hover:rotate-12 transition-transform duration-500 ${member.isDue ? 'bg-rose-500/10 text-rose-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                  <User size={28} strokeWidth={3.5} />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-[1000] text-slate-100 text-2xl tracking-tight leading-none">{member.name}</span>
                    <div className="bg-slate-700/50 text-slate-300 px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm border border-slate-600">
                      <CalendarClock size={10} strokeWidth={3} />
                      <span className="text-[12px] font-black uppercase">{member.memberNo}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-0.5 mt-1">
                    <div className="flex items-center gap-2">
                      <Phone size={14} strokeWidth={3} className="text-slate-400" />
                      <span className="text-sm font-bold text-slate-300">{member.phone || 'N/A'}</span>
                    </div>
                    {member.isDue ? (
                      <div className={`flex items-center gap-2 text-rose-300 rounded-lg px-3 py-1 mt-1`}>
                        <AlertCircle size={16} strokeWidth={3} />
                        <span className="text-base font-black uppercase tracking-wide">
                          বাকি: {member.dueMonths} মাস <span className="text-rose-700 mx-1">|</span> মাসিক: {getEffectiveMonthlyAmount(member, currentYear)}৳
                        </span>
                      </div>
                    ) : (
                      <div className={`flex items-center gap-2 text-emerald-300 rounded-lg px-3 py-1 mt-1`}>
                        <CheckCircle2 size={16} strokeWidth={3} />
                        <span className="text-base font-black uppercase tracking-wide">
                           পরিশোধিত {member.balance > 0 && `(+${member.advanceMonths} মাস অগ্রিম)`}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col items-end relative z-10">
                <div className={`flex flex-col items-end px-5 py-2.5 rounded-2xl shadow-inner border border-white/5 ${member.isDue ? 'bg-rose-500/10' : 'bg-emerald-500/10'}`}>
                  <span className={`font-[1000] text-3xl tracking-tighter ${member.isDue ? 'text-rose-300' : 'text-emerald-300'}`}>
                    ৳ {Math.abs(member.balance).toLocaleString()}
                  </span>
                  <span className={`text-[10px] font-black uppercase ${member.isDue ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {member.isDue ? `মোট বাকি` : `মোট অগ্রিম`}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredList.length === 0 && (
          <div className="text-center py-24 space-y-6 bg-black/20 border-4 border-dashed border-slate-700 rounded-[3rem] animate-in fade-in duration-700">
            <div className="w-24 h-24 bg-black/20 backdrop-blur-sm rounded-[2.5rem] shadow-inner flex items-center justify-center mx-auto text-slate-600">
              <CircleDollarSign size={48} strokeWidth={2} />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-[1000] text-slate-400 tracking-tight">কোন সদস্য বকেয়া নেই</h3>
              <p className="text-slate-500 font-bold max-w-[200px] mx-auto text-sm">অথবা আপনার সার্চের সাথে কোন মিল পাওয়া যায়নি।</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DueList;
