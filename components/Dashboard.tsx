
import React, { useState, useEffect, useMemo } from 'react';
import { MosqueState, Transaction, Member, Category } from '../types';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Landmark, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Cloud, 
  CloudOff, 
  ShieldCheck,
  Clock,
  CheckCircle2,
  XCircle,
  Database,
  ChevronDown,
  CalendarRange,
  AlertTriangle,
  CircleDollarSign,
  Users
} from 'lucide-react';
import CustomSelectModal from './CustomSelectModal';

interface Props {
  state: MosqueState;
  title?: string;
  isAdmin?: boolean;
  onApprove?: (id: string) => void;
  currentUser: { role: 'ADMIN' | 'MODERATOR' | 'MEMBER' | 'VIEWER', id: string, name: string }; 
  members: Member[]; 
}

const MONTH_NAMES = ["জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন", "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"];
const YEARS = Array.from({ length: 10 }, (_, i) => (new Date().getFullYear() - 5 + i).toString());

// Helper to get the effective monthly amount for a given year
const getEffectiveMonthlyAmount = (member: Member, year: number): number => {
  if (member.monthlyAmounts && member.monthlyAmounts[year.toString()] !== undefined) {
    return member.monthlyAmounts[year.toString()];
  }
  for (let y = year - 1; y >= parseInt(member.startYear || '0'); y--) {
    if (member.monthlyAmounts && member.monthlyAmounts[y.toString()] !== undefined) {
      return member.monthlyAmounts[y.toString()];
    }
  }
  return 0;
};

const formatTimeAgo = (isoString?: string): string => {
  if (!isoString) return 'এখনো ব্যাকআপ হয়নি';
  const date = new Date(isoString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 5) return 'এই মাত্র';
  if (seconds < 60) return `${Math.floor(seconds)} সেকেন্ড আগে`;
  
  const minutes = seconds / 60;
  if (minutes < 60) return `${Math.floor(minutes)} মিনিট আগে`;

  const hours = minutes / 60;
  if (hours < 24) return `${Math.floor(hours)} ঘন্টা আগে`;

  const days = hours / 24;
  if (days < 30) return `${Math.floor(days)} দিন আগে`;

  const months = days / 30.44; // Average month length
  if (months < 12) return `${Math.floor(months)} মাস আগে`;

  const years = days / 365.25;
  return `${Math.floor(years)} বছর আগে`;
};


const Dashboard: React.FC<Props> = ({ state, title = 'হোম ড্যাশবোর্ড', isAdmin, onApprove, currentUser, members }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  const [selectedMonth, setSelectedMonth] = useState((new Date().getMonth() + 1).toString());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

  // Modal states for Month/Year selection
  const [isMonthModalOpen, setIsMonthModalOpen] = useState(false);
  const [isYearModalOpen, setIsYearModalOpen] = useState(false);

  const monthOptions = useMemo(() => MONTH_NAMES.map((name, i) => ({ value: (i + 1).toString(), label: name })), []);
  const yearOptions = useMemo(() => YEARS.map(y => ({ value: y, label: y })), []);

  useEffect(() => {
    const handleStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', handleStatus);
    window.addEventListener('offline', handleStatus);
    return () => {
      window.removeEventListener('online', handleStatus);
      window.removeEventListener('offline', handleStatus);
    };
  }, []);

  const approvedTransactions = useMemo(() => state.transactions.filter(t => t.status === 'APPROVED'), [state.transactions]);
  const pendingTransactions = useMemo(() => state.transactions.filter(t => t.status === 'PENDING'), [state.transactions]);

  const selectedPeriod = `${selectedYear}-${selectedMonth.padStart(2, '0')}`;
  
  const monthlyTransactions = useMemo(() => 
    approvedTransactions.filter(t => (t.calculationDate || t.date).startsWith(selectedPeriod)),
  [approvedTransactions, selectedPeriod]);

  const monthlyIncome = monthlyTransactions
    .filter(t => t.type === 'INCOME')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const monthlyExpense = monthlyTransactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const monthlyBalance = monthlyIncome - monthlyExpense;

  const totalCumulativeIncome = approvedTransactions.filter(t => t.type === 'INCOME').reduce((acc, curr) => acc + curr.amount, 0);
  const totalCumulativeExpense = approvedTransactions.filter(t => t.type === 'EXPENSE').reduce((acc, curr) => acc + curr.amount, 0);
  const totalFund = totalCumulativeIncome - totalCumulativeExpense;
  const isDeficit = totalFund < 0;

  const memberStats = useMemo(() => {
    if (currentUser.role !== 'MEMBER') return null;
    
    const member = members.find(m => m.id === currentUser.id);
    if (!member) return null;

    const myTotalPaid = approvedTransactions
      .filter(t => t.memberId === member.id && t.type === 'INCOME')
      .reduce((sum, t) => sum + t.amount, 0);

    let totalExpected = 0;
    const startYear = parseInt(member.startYear);
    const startMonth = member.startMonth || 1;
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;

    for (let y = startYear; y <= currentYear; y++) {
      const monthlyRateForYear = getEffectiveMonthlyAmount(member, y);
      if (monthlyRateForYear === 0) continue;

      let monthsToConsider = 0;
      if (y === startYear && y === currentYear) {
        monthsToConsider = Math.max(0, currentMonth - startMonth + 1);
      } else if (y === startYear) {
        monthsToConsider = 12 - startMonth + 1;
      } else if (y === currentYear) {
        monthsToConsider = currentMonth;
      } else {
        monthsToConsider = 12;
      }
      totalExpected += monthsToConsider * monthlyRateForYear;
    }

    const totalSubscriptionPaid = approvedTransactions
      .filter(t => t.memberId === member.id && t.category === Category.SUBSCRIPTION && t.type === 'INCOME')
      .reduce((sum, t) => sum + t.amount, 0);

    const balance = totalSubscriptionPaid - totalExpected;
    const dueAmount = balance < 0 ? Math.abs(balance) : 0;

    return {
      myTotalPaid,
      dueAmount
    };
  }, [approvedTransactions, currentUser.id, currentUser.role, members]);

  const currentMemberInfo = useMemo(() => members.find(m => m.id === currentUser.id), [members, currentUser.id]);
  const bannerUrl = currentMemberInfo?.homePageBannerUrl;

  return (
    <div className={`p-4 space-y-6 ${bannerUrl ? 'relative' : ''}`}>
        {bannerUrl && (
            <>
                <div 
                    className="absolute inset-0 z-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${bannerUrl})` }}
                ></div>
                <div className="absolute inset-0 z-0 bg-black/40 backdrop-blur-sm"></div>
            </>
        )}
        <div className="relative z-10 space-y-6">

        {/* Top Status Pills */}
        <div className="flex justify-between items-start px-4">
            <div className="flex flex-col items-start">
                <div className="flex items-center gap-2" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.4)' }}>
                    <Database size={16} className="text-emerald-300"/>
                    <span className="text-xs font-black text-emerald-100 uppercase tracking-wider">ডাটা সেভ আছে</span>
                </div>
                <span className="text-[10px] text-slate-400 font-bold pl-8 -mt-1" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
                    {formatTimeAgo(state.lastBackup)}
                </span>
            </div>
            <div className="flex items-center gap-2 pt-1" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.4)' }}>
                {isOnline ? <Cloud size={16} className="text-sky-300"/> : <CloudOff size={16} className="text-rose-400"/>}
                <span className={`text-xs font-black uppercase tracking-wider ${isOnline ? 'text-sky-100' : 'text-rose-200'}`}>{isOnline ? 'অনলাইন' : 'অফলাইন'}</span>
            </div>
        </div>

        {/* Title */}
        <div className="text-center">
            <h2 className="text-4xl font-[1000] tracking-tighter" style={{filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.5))'}}>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-sky-500">{title}</span>
            </h2>
        </div>

        {/* Date Filters - Background Image Buttons */}
        <div className="grid grid-cols-2 gap-4">
            <button 
                onClick={() => setIsMonthModalOpen(true)}
                className="w-full py-4 px-6 rounded-[2rem] shadow-lg flex justify-between items-center group active:scale-95 transition-all relative overflow-hidden border border-white/20"
            >
                <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('https://i.postimg.cc/MpzmpdbT/stunning_high_resolution_nature_and_landscape_backgrounds_breathtaking_scenery_in_hd_photo.jpg')`}}></div>
                <span className="relative z-10 font-black text-yellow-300 text-lg drop-shadow-md">{MONTH_NAMES[parseInt(selectedMonth) - 1]}</span>
                <ChevronDown size={20} className="relative z-10 text-yellow-300 stroke-[3] drop-shadow-md" />
            </button>

            <button 
                onClick={() => setIsYearModalOpen(true)}
                className="w-full py-4 px-6 rounded-[2rem] shadow-lg flex justify-between items-center group active:scale-95 transition-all relative overflow-hidden border border-white/20"
            >
                <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('https://i.postimg.cc/MpzmpdbT/stunning_high_resolution_nature_and_landscape_backgrounds_breathtaking_scenery_in_hd_photo.jpg')`}}></div>
                <span className="relative z-10 font-black text-cyan-300 text-lg drop-shadow-md">{selectedYear}</span>
                <ChevronDown size={20} className="relative z-10 text-cyan-300 stroke-[3] drop-shadow-md" />
            </button>
        </div>

        {/* Hero Card - New Background */}
        <div className="relative h-80 rounded-[2.5rem] overflow-hidden shadow-2xl group border-2 border-white/20">
            <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-105" 
                style={{ backgroundImage: `url('https://i.postimg.cc/fLswGSh4/71Kl13r_PONL_AC_UF894_1000_QL80.jpg')` }}
            ></div>
            
            <div className="relative z-10 p-6 h-full flex flex-col justify-between text-white">
                <div className="flex items-center gap-2 drop-shadow-md bg-black/20 self-start px-3 py-1 rounded-full backdrop-blur-sm">
                    <CalendarRange size={16} className="text-emerald-300" />
                    <span className="font-bold text-sm tracking-wide">{MONTH_NAMES[parseInt(selectedMonth) - 1]} মাসের হিসাব</span>
                </div>

                <div className="text-center">
                    <span className="text-7xl font-[1000] text-pink-300 drop-shadow-xl tracking-tighter">
                    ৳ {monthlyBalance.toLocaleString()}
                    </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="backdrop-blur-md rounded-[1.5rem] p-4 border border-white/20 shadow-lg">
                        <p className="text-[10px] font-black text-emerald-300 uppercase tracking-widest mb-1">আয় (জানু)</p>
                        <p className="text-3xl font-[1000] tracking-tight text-emerald-300">৳ {monthlyIncome.toLocaleString()}</p>
                    </div>
                    <div className="backdrop-blur-md rounded-[1.5rem] p-4 border border-white/20 shadow-lg">
                        <p className="text-[10px] font-black text-rose-300 uppercase tracking-widest mb-1">ব্যয় (জানু)</p>
                        <p className="text-3xl font-[1000] tracking-tight text-rose-300">৳ {monthlyExpense.toLocaleString()}</p>
                    </div>
                </div>
            </div>
        </div>

        {/* Bottom Stats Cards */}
        <div className="grid grid-cols-2 gap-4">
            <div className="h-44 rounded-[2.5rem] relative overflow-hidden shadow-xl p-6 flex flex-col justify-center group border-2 border-slate-700">
                <div className="absolute inset-0 bg-cover bg-center" style={{backgroundImage: "url('https://i.postimg.cc/Gt8LXTfG/31f62157aaa3d42311e9bb67db59b50b.gif')"}}></div>
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="relative z-10 text-center">
                    <p className="text-sm font-black uppercase tracking-[0.2em] mb-1">
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-400">সদস্য</span>
                    </p>
                    <p className="text-7xl font-[1000] tracking-tighter">
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-300 to-teal-300">{members.length}</span>
                    </p>
                </div>
            </div>

            <div className="h-44 rounded-[2.5rem] relative overflow-hidden shadow-xl p-6 flex flex-col justify-center group border-2 border-slate-700">
                <div className="absolute inset-0 bg-cover bg-center" style={{backgroundImage: "url('https://i.postimg.cc/Gt8LXTfG/31f62157aaa3d42311e9bb67db59b50b.gif')"}}></div>
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="relative z-10 text-center">
                    <p className="text-sm font-black uppercase tracking-[0.2em] mb-1">
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-blue-400">মোট তহবিল</span>
                    </p>
                    <p className="text-5xl font-[1000] tracking-tighter">
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-sky-300 to-blue-300">৳ {totalFund.toLocaleString()}</span>
                    </p>
                </div>
            </div>
        </div>

        {/* User Specific Stats (Due/Paid) */}
        {currentUser.role === 'MEMBER' && memberStats && (
            <div className="bg-gradient-to-br from-indigo-50 to-purple-100 rounded-[2.5rem] p-6 shadow-lg border border-white space-y-4">
                <h3 className="text-lg font-[1000] text-indigo-900">আমার হিসাব ({currentUser.name})</h3>
                <div className="flex justify-between items-center p-4 bg-white/70 rounded-2xl">
                    <span className="text-xs font-bold text-slate-600">মোট পরিশোধিত</span>
                    <span className="font-black text-lg text-emerald-700">৳{memberStats.myTotalPaid}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-white/70 rounded-2xl">
                    <span className="text-xs font-bold text-slate-600">মোট বকেয়া</span>
                    <span className={`font-black text-lg ${memberStats.dueAmount > 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                        ৳{memberStats.dueAmount}
                    </span>
                </div>
            </div>
        )}

        {/* Pending Transactions Section for Admins */}
        {isAdmin && pendingTransactions.length > 0 && (
          <div className="bg-amber-50 rounded-[2.5rem] p-6 shadow-lg border border-amber-200">
            <h3 className="text-lg font-[1000] text-amber-800 mb-3 flex items-center gap-2">
              <Clock size={16} /> পেন্ডিং এন্ট্রি ({pendingTransactions.length})
            </h3>
            <div className="space-y-3">
              {pendingTransactions.slice(0, 3).map(t => (
                <div key={t.id} className="flex justify-between items-center p-4 bg-white/70 rounded-2xl">
                  <div>
                    <p className="text-xs font-bold text-slate-600">{t.category}</p>
                    <p className="text-[10px] text-slate-500">{t.description}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-sm font-bold ${t.type === 'INCOME' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      ৳{t.amount.toLocaleString()}
                    </span>
                    <button onClick={() => onApprove && onApprove(t.id)} className="p-2 bg-emerald-100 text-emerald-600 rounded-lg shadow-sm">
                      <CheckCircle2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
              {pendingTransactions.length > 3 && (
                <p className="text-center text-xs text-amber-700 font-bold">এবং আরো {pendingTransactions.length - 3}টি...</p>
              )}
            </div>
          </div>
        )}
        </div>

        <CustomSelectModal
            isOpen={isMonthModalOpen}
            onClose={() => setIsMonthModalOpen(false)}
            options={monthOptions}
            onSelect={(value) => setSelectedMonth(value)}
            selectedValue={selectedMonth}
            title="মাস নির্বাচন করুন"
            backgroundUrl="https://i.postimg.cc/0QH5G0cF/dbc22a621c251fe2b4aa7271b9a1e723.gif"
        />
        <CustomSelectModal
            isOpen={isYearModalOpen}
            onClose={() => setIsYearModalOpen(false)}
            options={yearOptions}
            onSelect={(value) => setSelectedYear(value)}
            selectedValue={selectedYear}
            title="বছর নির্বাচন করুন"
            backgroundUrl="https://i.postimg.cc/0QH5G0cF/dbc22a621c251fe2b4aa7271b9a1e723.gif"
        />
    </div>
  );
};

export default Dashboard;
