
import React, { useState, useMemo, useEffect } from 'react';
import { Member, Transaction, Category } from '../types';
import { 
  Search, 
  User, 
  ChevronRight, 
  CheckCircle2, 
  AlertCircle, 
  CircleDollarSign,
  Sparkles,
  Calendar,
  ChevronDown,
  Ban
} from 'lucide-react';

interface Props {
  members: Member[];
  transactions: Transaction[];
  onAddPayment: (t: Transaction) => void;
}

const MONTH_NAMES = ["জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন", "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"];

const backgroundUrl = "https://i.postimg.cc/VvdQYyBQ/v-B6e-Cf.gif";

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

const SubscriptionTracker: React.FC<Props> = ({ members, transactions, onAddPayment }) => {
  const [search, setSearch] = useState('');
  
  // Initialize with the single member if only one exists (e.g., MEMBER role)
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(
    members.length === 1 ? members[0].id : null
  );
  
  const [viewYear, setViewYear] = useState<string>(new Date().getFullYear().toString());

  // Update selection if members prop changes (e.g. data load) and there's only one
  useEffect(() => {
    if (members.length === 1) {
      setSelectedMemberId(members[0].id);
    }
  }, [members]);

  const filteredMembers = useMemo(() => {
    if (!search) return [];
    return members.filter(m => 
      m.name.toLowerCase().includes(search.toLowerCase()) || 
      m.memberNo.includes(search) || 
      m.phone.includes(search)
    );
  }, [members, search]);

  const selectedMember = useMemo(() => 
    members.find(m => m.id === selectedMemberId), 
    [members, selectedMemberId]
  );

  // Advanced Ledger Calculation with specific transaction mapping
  const ledgerData = useMemo(() => {
    if (!selectedMember) return null;

    // 1. Get transactions sorted by date
    const memberTransactions = transactions
      .filter(t => t.memberId === selectedMember.id && t.category === Category.SUBSCRIPTION && t.type === 'INCOME' && t.status === 'APPROVED')
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const totalPaid = memberTransactions.reduce((acc, t) => acc + t.amount, 0);

    // 2. Setup Years Calculation
    const startYear = parseInt(selectedMember.startYear);
    const startMonth = selectedMember.startMonth || 1; // Default to Jan if not set
    const currentYear = new Date().getFullYear();
    const yearsToCalculate = [];
    
    // Generate years from startYear to currentYear + 1 (for advance)
    for (let y = startYear; y <= currentYear + 1; y++) {
      yearsToCalculate.push(y);
    }

    // 3. Payment Distribution Simulation
    const yearlyData: Record<number, Array<{ 
      monthIndex: number, 
      status: 'PAID' | 'PARTIAL' | 'DUE' | 'NA', 
      paidAmount: number,
      paymentMeta?: { date: string, receipt?: string } 
    }>> = {};

    let totalMonthsDue = 0;
    
    // We create a "Payment Stream" to track which transaction covers which month
    // Create a mutable copy of transactions to track used amounts
    const paymentStream = memberTransactions.map(t => ({
      ...t,
      remainingAmount: t.amount
    }));
    
    let streamIndex = 0;

    yearsToCalculate.forEach(year => {
      yearlyData[year] = [];
      const monthlyRateForYear = getEffectiveMonthlyAmount(selectedMember, year); // Get year-specific rate

      for (let m = 0; m < 12; m++) {
        // Check if member joined after this month in the start year
        if (year === startYear && (m + 1) < startMonth) {
             yearlyData[year].push({
                monthIndex: m,
                status: 'NA',
                paidAmount: 0
             });
             continue;
        }

        const isFuture = year > currentYear || (year === currentYear && m > new Date().getMonth());
        
        let status: 'PAID' | 'PARTIAL' | 'DUE' | 'NA' = 'DUE';
        let paidForThisMonth = 0;
        let lastPaymentMeta = null;

        let needed = monthlyRateForYear; // Use year-specific rate

        // Try to fill this month's requirement from the stream
        while (needed > 0 && streamIndex < paymentStream.length) {
          const currentTx = paymentStream[streamIndex];
          
          if (currentTx.remainingAmount > 0) {
            const take = Math.min(needed, currentTx.remainingAmount);
            paidForThisMonth += take;
            currentTx.remainingAmount -= take;
            needed -= take;
            
            // Capture metadata from the transaction that contributed (taking the latest one if multiple)
            lastPaymentMeta = {
              date: currentTx.date,
              receipt: currentTx.receiptNo
            };
          }

          if (currentTx.remainingAmount <= 0) {
            streamIndex++;
          }
        }

        if (paidForThisMonth >= monthlyRateForYear) {
          status = 'PAID';
        } else if (paidForThisMonth > 0) {
          status = 'PARTIAL';
          if (!isFuture) totalMonthsDue++;
        } else {
          status = 'DUE';
          if (!isFuture) totalMonthsDue++;
        }

        yearlyData[year].push({
          monthIndex: m,
          status,
          paidAmount: paidForThisMonth,
          paymentMeta: lastPaymentMeta || undefined
        });
      }
    });

    const totalDueAmount = totalMonthsDue * getEffectiveMonthlyAmount(selectedMember, currentYear); // Use current year's rate for total due calc

    return {
      totalPaid,
      remainingBalance: paymentStream.reduce((acc, t) => acc + t.remainingAmount, 0), // Calculate true advance from remaining in stream
      yearlyData,
      yearsList: yearsToCalculate,
      totalDueAmount
    };
  }, [selectedMember, transactions]);

  // Reset view year when member changes
  useEffect(() => {
    if (selectedMember) {
      setViewYear(new Date().getFullYear().toString());
    }
  }, [selectedMember]);

  const formatDateShort = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('bn-BD', { day: 'numeric', month: 'numeric', year: '2-digit' });
  };

  const currentYearMonthlyRate = selectedMember ? getEffectiveMonthlyAmount(selectedMember, parseInt(viewYear)) : 0;

  const isSingleMemberView = members.length === 1;

  return (
    <div className="relative rounded-t-[2.5rem] overflow-hidden -mt-4">
      <div className="absolute inset-0 bg-cover bg-center z-0" style={{ backgroundImage: `url(${backgroundUrl})` }}></div>
      <div className="absolute inset-0 bg-black/20 z-0"></div>
      <div className="relative z-10 p-6 space-y-8 pb-32 w-full text-white">
        <div className="text-center space-y-3 mb-4">
          <h2 className="text-4xl font-[1000] tracking-tighter leading-none">
            {isSingleMemberView ? 'আমার চাঁদার হিসাব' : 'মাসিক চাঁদা লিষ্ট'}
          </h2>
          <p className="text-[11px] text-emerald-300 font-[1000] uppercase tracking-[0.4em]">
            {isSingleMemberView ? 'আপনার বিস্তারিত চাঁদা রিপোর্ট' : 'সদস্য ভিত্তিক চাঁদার হিসাব'}
          </p>
        </div>

        {/* Search Interface - Only show if not single member view */}
        {!isSingleMemberView && (
          <div className="space-y-4">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                <Search className="text-emerald-400 opacity-60 group-focus-within:opacity-100 transition-all" size={24} strokeWidth={3} />
              </div>
              <input 
                type="text"
                placeholder="সদস্যর নাম বা আইডি দিয়ে খুঁজুন..."
                value={search}
                onChange={e => {
                  setSearch(e.target.value);
                  if (selectedMemberId) setSelectedMemberId(null);
                }}
                className="w-full pl-16 pr-8 py-6 bg-black/20 border-2 border-white/10 rounded-[3rem] outline-none focus:border-emerald-500/50 shadow-inner font-black text-white text-lg transition-all placeholder:text-slate-400"
              />
            </div>

            {search && !selectedMemberId && (
              <div className="bg-black/20 backdrop-blur-sm rounded-[2.5rem] p-3 shadow-xl border border-white/10 space-y-1 animate-in fade-in slide-in-from-top-4 duration-300">
                {filteredMembers.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 font-bold">সদস্য পাওয়া যায়নি</div>
                ) : (
                  filteredMembers.map(m => (
                    <button
                      key={m.id}
                      onClick={() => {
                        setSelectedMemberId(m.id);
                        setSearch('');
                      }}
                      className="w-full flex items-center justify-between p-5 hover:bg-white/10 rounded-3xl transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-300">
                          <User size={28} strokeWidth={3} />
                        </div>
                        <div className="text-left">
                          <p className="font-[1000] text-slate-100 text-lg leading-tight">{m.name}</p>
                          <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{m.memberNo}</p>
                        </div>
                      </div>
                      <ChevronRight size={24} className="text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {/* Member Ledger View */}
        {selectedMember && ledgerData ? (
          <div className="space-y-8 animate-in zoom-in-95 duration-500">
            
            {/* Top Summary Card */}
            <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-[3.5rem] p-8 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-10 scale-150 rotate-12 pointer-events-none">
                <Sparkles size={120} />
              </div>
              
              <div className="relative z-10 space-y-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <span className="bg-white/20 text-white text-[11px] font-black px-4 py-1.5 rounded-full tracking-widest uppercase">
                      ID: {selectedMember.memberNo}
                    </span>
                    <h3 className="text-3xl font-[1000] tracking-tighter leading-none">{selectedMember.name}</h3>
                    <p className="text-[13px] opacity-80 font-bold">
                      মাসিক হার ({viewYear} সাল): ৳{currentYearMonthlyRate}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="bg-white/10 p-5 rounded-[2rem] border border-white/10 flex flex-col items-center">
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-1">মোট আদায়</p>
                      <p className="font-[1000] text-2xl">৳{ledgerData.totalPaid}</p>
                  </div>
                  <div className="bg-white p-5 rounded-[2rem] text-emerald-900 flex flex-col items-center shadow-lg">
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">উদ্বৃত্ত / অগ্রিম</p>
                      <p className="font-[1000] text-2xl">৳{ledgerData.remainingBalance}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Year Selector & Grid */}
            <div className="bg-black/20 backdrop-blur-sm rounded-[3rem] p-2 pb-8 shadow-sm border border-white/10">
              
              {/* Year Selector Header */}
              <div className="p-6 pb-2">
                <div className="flex items-center gap-3 mb-4">
                  <Calendar className="text-emerald-400" size={24} />
                  <h4 className="text-xl font-[1000] tracking-tight">বাৎসরিক হিসাব</h4>
                </div>
                
                <div className="relative group">
                  <select 
                    value={viewYear}
                    onChange={(e) => setViewYear(e.target.value)}
                    className="w-full pl-6 pr-10 py-5 bg-black/20 border-2 border-white/10 rounded-[2rem] outline-none font-black text-slate-100 appearance-none shadow-sm focus:border-emerald-500/20 transition-all text-xl"
                  >
                    {ledgerData.yearsList.map(y => (
                      <option key={y} value={y}>{y} সালের হিসাব</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-emerald-400 pointer-events-none" size={24} strokeWidth={3} />
                </div>
              </div>

              {/* 12 Month Table Grid - Compact */}
              <div className="px-2 space-y-2">
                {ledgerData.yearlyData[parseInt(viewYear)]?.map((data, idx) => (
                  <div 
                    key={idx} 
                    className={`p-3 rounded-[1.75rem] grid grid-cols-12 items-center gap-1 border transition-all ${
                      data.status === 'PAID' 
                        ? 'bg-emerald-500/10 border-emerald-500/20' 
                        : data.status === 'PARTIAL'
                          ? 'bg-amber-500/10 border-amber-500/20'
                          : data.status === 'NA' 
                            ? 'bg-slate-500/10 border-slate-500/20 opacity-60'
                            : 'bg-black/10 border-white/5'
                    }`}
                  >
                    {/* Left: Month Name */}
                    <div className="col-span-4 flex items-center gap-2">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shadow-sm shrink-0 ${
                          data.status === 'PAID' ? 'bg-emerald-500 text-white' : 
                          data.status === 'PARTIAL' ? 'bg-amber-400 text-amber-950' : 
                          data.status === 'NA' ? 'bg-slate-600 text-slate-300' :
                          'bg-slate-700 text-slate-400'
                        }`}>
                          {idx + 1}
                        </div>
                        <div className="min-w-0">
                          <h5 className="font-[1000] text-slate-200 text-[15px] leading-none truncate">{MONTH_NAMES[idx]}</h5>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{viewYear}</p>
                        </div>
                    </div>

                    {/* Center: Date & Receipt */}
                    <div className="col-span-5 flex flex-col items-center justify-center">
                      {data.status === 'NA' ? (
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-700/50 px-2 py-1 rounded-md">সদস্য ছিলেন না</span>
                      ) : data.paymentMeta ? (
                        <>
                            <span className="text-[13px] font-bold text-slate-300 bg-black/20 px-2 py-0.5 rounded-md border border-white/10">
                              {formatDateShort(data.paymentMeta.date)}
                            </span>
                            {data.paymentMeta.receipt && (
                              <span className="text-[12px] font-black text-emerald-400 mt-0.5">
                                রশিদ: {data.paymentMeta.receipt}
                              </span>
                            )}
                        </>
                      ) : (
                        <div className="w-1 h-1 bg-slate-700 rounded-full"></div>
                      )}
                    </div>

                    {/* Right: Status, Amount */}
                    <div className="col-span-3 text-right flex flex-col items-end">
                        {data.status === 'NA' ? (
                          <div className="text-slate-500">
                            <Ban size={16} />
                          </div>
                        ) : data.status === 'PAID' ? (
                          <>
                            <div className="flex items-center gap-1">
                              <span className="font-[1000] text-emerald-400 text-base">৳{data.paidAmount}</span>
                              <CheckCircle2 size={14} className="text-emerald-400" />
                            </div>
                          </>
                        ) : data.status === 'PARTIAL' ? (
                          <>
                            <span className="font-[1000] text-amber-400 text-base">৳{data.paidAmount}</span>
                            <span className="text-[9px] font-black text-amber-400">আংশিক</span>
                          </>
                        ) : (
                          <div className="flex flex-col items-end">
                            <span className="bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1">
                              <AlertCircle size={10} strokeWidth={4} /> বাকি
                            </span>
                          </div>
                        )}
                    </div>
                  </div>
                ))}
            </div>
          </div>

        </div>
      ) : (
        !isSingleMemberView && !search && (
          <div className="text-center py-24 space-y-6 bg-black/20 border-4 border-dashed border-slate-700 rounded-[3rem] animate-in fade-in duration-700">
            <div className="w-24 h-24 bg-black/20 backdrop-blur-sm rounded-[2.5rem] shadow-inner flex items-center justify-center mx-auto text-slate-600">
              <CircleDollarSign size={48} strokeWidth={2} />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-[1000] text-slate-400 tracking-tight">সদস্য সার্চ করুন</h3>
              <p className="text-slate-500 font-bold max-w-[200px] mx-auto text-sm">সদস্যর নাম দিয়ে সার্চ করলে তার বিস্তারিত চাঁদা রিপোর্ট এখানে দেখা যাবে</p>
            </div>
          </div>
        )
      )}
      </div>
    </div>
  );
};

export default SubscriptionTracker;
