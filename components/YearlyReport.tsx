import React, { useState, useMemo } from 'react';
import { Transaction, MosqueState } from '../types';
import { 
  TrendingUp, 
  TrendingDown, 
  ChevronDown, 
  Scale, 
  AlertCircle, 
  CheckCircle2,
  CalendarDays,
  ArrowRightLeft,
  BarChart3
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';

interface Props {
  state: MosqueState;
}

const MONTH_NAMES = ["জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন", "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"];
const YEARS = Array.from({ length: 10 }, (_, i) => (new Date().getFullYear() - 5 + i).toString());

const backgroundUrl = "https://i.postimg.cc/26Xjd72G/5219903_79263.gif";
const sectionBackgroundUrl = "https://i.postimg.cc/9XGxXRHW/6c8c53c52bf91af51f6509dbe21f5ea1.jpg";

const YearlyReport: React.FC<Props> = ({ state }) => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

  const filteredTransactions = useMemo(() => 
    state.transactions.filter(t => (t.calculationDate || t.date).startsWith(selectedYear)),
  [state.transactions, selectedYear]);

  const yearlyIncome = useMemo(() => 
    filteredTransactions.filter(t => t.type === 'INCOME').reduce((sum, t) => sum + t.amount, 0),
  [filteredTransactions]);

  const yearlyExpense = useMemo(() => 
    filteredTransactions.filter(t => t.type === 'EXPENSE').reduce((sum, t) => sum + t.amount, 0),
  [filteredTransactions]);

  const netResult = yearlyIncome - yearlyExpense;
  const isSurplus = netResult >= 0;

  const monthlyChartData = useMemo(() => {
    return MONTH_NAMES.map((name, index) => {
      const monthPrefix = `${selectedYear}-${(index + 1).toString().padStart(2, '0')}`;
      const monthIncome = filteredTransactions
        .filter(t => t.type === 'INCOME' && (t.calculationDate || t.date).startsWith(monthPrefix))
        .reduce((sum, t) => sum + t.amount, 0);
      const monthExpense = filteredTransactions
        .filter(t => t.type === 'EXPENSE' && (t.calculationDate || t.date).startsWith(monthPrefix))
        .reduce((sum, t) => sum + t.amount, 0);
      
      return {
        name: name.substring(0, 3), // Short name
        fullName: name,
        income: monthIncome,
        expense: monthExpense,
      };
    });
  }, [filteredTransactions, selectedYear]);

  return (
    <div className="relative rounded-t-[2.5rem] overflow-hidden -mt-4">
      <div className="absolute inset-0 bg-cover bg-center z-0" style={{ backgroundImage: `url(${backgroundUrl})` }}></div>
      <div className="absolute inset-0 bg-black/20 z-0"></div>
      <div className="relative z-10 p-6 space-y-8 pb-32 text-white">
        <div className="text-center space-y-3 mb-4">
          <h2 className="text-4xl font-[1000] tracking-tighter leading-none">বাৎসরিক হিসাব</h2>
          <p className="text-[11px] text-purple-300 font-[1000] uppercase tracking-[0.4em]">পুরো বছরের আয়-ব্যয় বিবরণী</p>
        </div>

        {/* Year Selection */}
        <div className="relative group">
          <select 
            value={selectedYear}
            onChange={e => setSelectedYear(e.target.value)}
            className="w-full pl-6 pr-10 py-5 bg-black/20 border-2 border-white/10 rounded-[2.5rem] outline-none font-black text-slate-100 appearance-none shadow-sm focus:border-purple-500/50 transition-all text-center text-xl"
          >
            {YEARS.map(y => (
              <option key={y} value={y}>{y} সাল</option>
            ))}
          </select>
          <ChevronDown className="absolute right-8 top-1/2 -translate-y-1/2 text-purple-400 pointer-events-none" size={24} strokeWidth={3} />
        </div>

        {/* Yearly Summary Card */}
        <div className="rounded-[3.5rem] shadow-2xl relative overflow-hidden group transition-all duration-700">
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${sectionBackgroundUrl})` }}></div>
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="relative z-10 p-9 space-y-8">
              <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12 scale-150 group-hover:scale-175 transition-transform duration-1000 text-slate-900">
                {isSurplus ? <CheckCircle2 size={120} /> : <AlertCircle size={120} />}
              </div>
              
              <div className="relative z-10 space-y-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-black/10 backdrop-blur-md flex items-center justify-center border border-black/10 text-slate-800">
                    <Scale size={20} />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-800">
                    {selectedYear} সালের চূড়ান্ত ফলাফল
                  </p>
                </div>

                <div>
                  <h3 className="text-5xl font-[1000] tracking-tighter mb-2 text-slate-900">
                    ৳ {Math.abs(netResult).toLocaleString()}
                  </h3>
                  <p className={`text-xl font-black ${isSurplus ? 'text-indigo-800' : 'text-rose-800'}`}>
                    সারা বছর শেষে মোট {isSurplus ? 'উদ্বৃত্ত' : 'ঘাটতি'}
                  </p>
                </div>
              </div>
            </div>
        </div>

        {/* Monthly Performance Chart */}
        <div className="rounded-[3rem] shadow-xl border border-white/10 relative overflow-hidden">
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${sectionBackgroundUrl})` }}></div>
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="relative z-10 p-8">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-500/10 text-indigo-600 rounded-xl">
                    <BarChart3 size={20} strokeWidth={3} />
                  </div>
                  <div>
                    <h3 className="text-slate-900 text-lg font-[1000] tracking-tight leading-none">মাসিক প্রবৃদ্ধি গ্রাফ</h3>
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mt-1.5">জানুয়ারি - ডিসেম্বর</p>
                  </div>
                </div>
              </div>
              
              <div className="h-72 w-full">
                {filteredTransactions.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0, 0, 0, 0.1)" />
                      <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fill: '#334155', fontSize: 11, fontWeight: 700}} 
                      />
                      <YAxis hide />
                      <Tooltip 
                        cursor={{fill: 'rgba(0,0,0,0.05)', radius: 10}}
                        contentStyle={{borderRadius: '20px', border: 'none', background: 'rgba(255,255,255,0.7)', padding: '12px', backdropFilter: 'blur(10px)'}}
                        labelStyle={{fontWeight: 900, marginBottom: '4px', color: '#1e293b'}}
                        itemStyle={{color: '#334155'}}
                      />
                      <Bar dataKey="income" fill="#10b981" radius={[8, 8, 8, 8]} barSize={12} />
                      <Bar dataKey="expense" fill="#f43f5e" radius={[8, 8, 8, 8]} barSize={12} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-600">
                    <Scale size={48} strokeWidth={1} className="opacity-20 mb-2" />
                    <p className="text-[10px] font-black uppercase tracking-widest">এই বছরে কোনো ডাটা নেই</p>
                  </div>
                )}
              </div>
              <div className="flex justify-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                  <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">আয়</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                  <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">ব্যয়</span>
                </div>
              </div>
            </div>
        </div>

        {/* Income & Expense Breakdown */}
        <div className="grid grid-cols-1 gap-5">
          <div className="rounded-[3rem] border border-black/10 shadow-lg group relative overflow-hidden">
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${sectionBackgroundUrl})` }}></div>
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="relative z-10 p-7 flex items-center justify-between">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 bg-emerald-500/10 text-emerald-600 rounded-[1.75rem] flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                  <TrendingUp size={32} strokeWidth={2.5} />
                </div>
                <div>
                  <h5 className="font-black text-slate-900 text-lg leading-none">পুরো বছরের আয়</h5>
                  <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mt-2">মোট আদায়</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-[1000] text-emerald-700 tracking-tighter">৳ {yearlyIncome.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="rounded-[3rem] border border-black/10 shadow-lg group relative overflow-hidden">
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${sectionBackgroundUrl})` }}></div>
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="relative z-10 p-7 flex items-center justify-between">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 bg-rose-500/10 text-rose-600 rounded-[1.75rem] flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                  <TrendingDown size={32} strokeWidth={2.5} />
                </div>
                <div>
                  <h5 className="font-black text-slate-900 text-lg leading-none">পুরো বছরের ব্যয়</h5>
                  <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mt-2">মোট খরচ</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-[1000] text-rose-700 tracking-tighter">৳ {yearlyExpense.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Yearly Analysis */}
        <div className={`rounded-[3rem] border-2 relative overflow-hidden ${isSurplus ? 'border-indigo-500/20' : 'border-rose-500/20'}`}>
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${sectionBackgroundUrl})` }}></div>
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative z-10 p-8 flex gap-5 items-start">
            <div className={`p-4 rounded-2xl ${isSurplus ? 'bg-indigo-500/10 text-indigo-700' : 'bg-rose-500/10 text-rose-700'}`}>
                <ArrowRightLeft size={24} strokeWidth={3} />
            </div>
            <div className="space-y-2">
                <h4 className={`text-sm font-[1000] uppercase tracking-widest ${isSurplus ? 'text-indigo-700' : 'text-rose-700'}`}>বাৎসরিক বিশ্লেষণ</h4>
                <p className={`text-[13px] font-bold leading-relaxed ${isSurplus ? 'text-indigo-900' : 'text-rose-900'}`}>
                  {selectedYear} সালে {isSurplus 
                    ? `মসজিদ ফান্ডের অবস্থা সন্তোষজনক। মোট ${netResult.toLocaleString()} টাকা উদ্বৃত্ত আছে যা ভবিষ্যতের বড় কোনো উন্নয়নমূলক কাজে ব্যবহার করা যেতে পারে।`
                    : `মসজিদ ফান্ডে ${Math.abs(netResult).toLocaleString()} টাকা ঘাটতি ছিল। নিয়মিত দান ও চাঁদা কালেকশন বাড়ানোর দিকে বিশেষ নজর দেওয়া প্রয়োজন।`
                  }
                </p>
            </div>
          </div>
        </div>

        {filteredTransactions.length === 0 && (
          <div className="text-center py-20 bg-black/20 border-4 border-dashed border-slate-700 rounded-[3rem]">
            <CalendarDays size={48} className="mx-auto text-slate-600 mb-4" />
            <p className="text-slate-500 font-black uppercase tracking-widest text-xs">এই বছরে কোনো এন্ট্রি পাওয়া যায়নি</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default YearlyReport;
