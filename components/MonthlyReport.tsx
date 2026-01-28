import React, { useState, useMemo } from 'react';
import { Transaction, MosqueState } from '../types';
import { 
  TrendingUp, 
  TrendingDown, 
  ChevronDown, 
  Wallet, 
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

const backgroundUrl = "https://i.postimg.cc/VvdQYyBQ/v_B6e_Cf.gif";
const sectionBackgroundUrl = "https://i.postimg.cc/26Xjd72G/5219903_79263.gif";

const MonthlyReport: React.FC<Props> = ({ state }) => {
  const [selectedMonth, setSelectedMonth] = useState((new Date().getMonth() + 1).toString());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

  const selectedPeriod = `${selectedYear}-${selectedMonth.padStart(2, '0')}`;
  
  const filteredTransactions = useMemo(() => 
    state.transactions.filter(t => (t.calculationDate || t.date).startsWith(selectedPeriod)),
  [state.transactions, selectedPeriod]);

  const monthlyIncome = useMemo(() => 
    filteredTransactions.filter(t => t.type === 'INCOME').reduce((sum, t) => sum + t.amount, 0),
  [filteredTransactions]);

  const monthlyExpense = useMemo(() => 
    filteredTransactions.filter(t => t.type === 'EXPENSE').reduce((sum, t) => sum + t.amount, 0),
  [filteredTransactions]);

  const netResult = monthlyIncome - monthlyExpense;
  const isSurplus = netResult >= 0;

  const chartData = useMemo(() => [
    { name: 'মোট আয়', value: monthlyIncome, color: '#10b981' },
    { name: 'মোট ব্যয়', value: monthlyExpense, color: '#f43f5e' },
  ], [monthlyIncome, monthlyExpense]);

  return (
    <div className="relative rounded-t-[2.5rem] overflow-hidden -mt-4">
      <div className="absolute inset-0 bg-cover bg-center z-0" style={{ backgroundImage: `url(${backgroundUrl})` }}></div>
      <div className="absolute inset-0 bg-black/20 z-0"></div>
      <div className="relative z-10 p-6 space-y-8 pb-32 text-white">
        <div className="text-center space-y-3 mb-4">
          <h2 className="text-4xl font-[1000] tracking-tighter leading-none">মাসিক হিসাব রিপোর্ট</h2>
          <p className="text-[11px] text-blue-300 font-[1000] uppercase tracking-[0.4em]">আয় ও ব্যয়ের চূড়ান্ত ফলাফল</p>
        </div>

        {/* Month/Year Selection */}
        <div className="grid grid-cols-2 gap-4">
          <div className="relative group">
            <select 
              value={selectedMonth}
              onChange={e => setSelectedMonth(e.target.value)}
              className="w-full pl-6 pr-10 py-4 bg-black/20 border-2 border-white/10 rounded-[2rem] outline-none font-black text-slate-100 appearance-none shadow-sm focus:border-blue-500/50 transition-all"
            >
              {MONTH_NAMES.map((name, i) => (
                <option key={i} value={i + 1}>{name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-blue-400 pointer-events-none" size={18} strokeWidth={3} />
          </div>
          <div className="relative group">
            <select 
              value={selectedYear}
              onChange={e => setSelectedYear(e.target.value)}
              className="w-full pl-6 pr-10 py-4 bg-black/20 border-2 border-white/10 rounded-[2rem] outline-none font-black text-slate-100 appearance-none shadow-sm focus:border-blue-500/50 transition-all"
            >
              {YEARS.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-blue-400 pointer-events-none" size={18} strokeWidth={3} />
          </div>
        </div>

        {/* Main Result Card */}
        <div className="rounded-[3.5rem] shadow-2xl relative overflow-hidden group transition-all duration-700">
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${sectionBackgroundUrl})` }}></div>
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="relative z-10 p-9 space-y-8">
              <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12 scale-150 group-hover:scale-175 transition-transform duration-1000">
                {isSurplus ? <CheckCircle2 size={120} /> : <AlertCircle size={120} />}
              </div>
              
              <div className="relative z-10 space-y-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20">
                    <Scale size={20} />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-80">
                    {MONTH_NAMES[parseInt(selectedMonth)-1]} {selectedYear} এর ফলাফল
                  </p>
                </div>

                <div>
                  <h3 className="text-5xl font-[1000] tracking-tighter mb-2">
                    ৳ {Math.abs(netResult).toLocaleString()}
                  </h3>
                  <p className={`text-xl font-black ${isSurplus ? 'text-emerald-100' : 'text-rose-100'}`}>
                    এই মাসে মোট {isSurplus ? 'জমা (উদ্বৃত্ত)' : 'ঘাটতি'} হয়েছে
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-4">
                  <div className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest ${isSurplus ? 'bg-white text-emerald-600' : 'bg-white text-rose-600'}`}>
                    {isSurplus ? 'আলহামদুলিল্লাহ' : 'তদারকি প্রয়োজন'}
                  </div>
                </div>
              </div>
            </div>
        </div>

        {/* Styled Chart Section */}
        <div className="rounded-[3rem] shadow-xl border border-white/10 relative group overflow-hidden">
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${sectionBackgroundUrl})` }}></div>
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="relative z-10 p-8">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 text-blue-400 rounded-xl">
                    <BarChart3 size={20} strokeWidth={3} />
                  </div>
                  <div>
                    <h3 className="text-slate-100 text-lg font-[1000] tracking-tight leading-none">হিসাব গ্রাফ</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1.5">আয় ও ব্যয়ের তুলনা</p>
                  </div>
                </div>
              </div>
              
              <div className="h-64 w-full">
                {filteredTransactions.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255, 255, 255, 0.1)" />
                      <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fill: '#94a3b8', fontSize: 13, fontWeight: 900}} 
                      />
                      <YAxis hide />
                      <Tooltip 
                        cursor={{fill: 'rgba(255,255,255,0.05)', radius: 20}}
                        contentStyle={{borderRadius: '24px', border: 'none', background: 'rgba(20,20,20,0.7)', padding: '16px', backdropFilter: 'blur(10px)'}}
                        labelStyle={{fontWeight: 900, marginBottom: '4px', color: '#e2e8f0'}}
                        itemStyle={{color: '#cbd5e1'}}
                      />
                      <Bar dataKey="value" radius={[15, 15, 15, 15]} barSize={60}>
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-600">
                    <Scale size={48} strokeWidth={1} className="opacity-20 mb-2" />
                    <p className="text-[10px] font-black uppercase tracking-widest">গ্রাফের জন্য পর্যাপ্ত ডাটা নেই</p>
                  </div>
                )}
              </div>
          </div>
        </div>

        {/* Income & Expense Breakdown */}
        <div className="grid grid-cols-1 gap-5">
          <div className="rounded-[3rem] border border-white/10 shadow-lg group relative overflow-hidden">
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${sectionBackgroundUrl})` }}></div>
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="relative z-10 p-7 flex items-center justify-between">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-[1.75rem] flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                  <TrendingUp size={32} strokeWidth={2.5} />
                </div>
                <div>
                  <h5 className="font-black text-slate-100 text-lg leading-none">মোট আয়</h5>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">কালেকশন খাত থেকে</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-[1000] text-emerald-400 tracking-tighter">৳ {monthlyIncome.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="rounded-[3rem] border border-white/10 shadow-lg group relative overflow-hidden">
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${sectionBackgroundUrl})` }}></div>
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="relative z-10 p-7 flex items-center justify-between">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 bg-rose-500/10 text-rose-400 rounded-[1.75rem] flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                  <TrendingDown size={32} strokeWidth={2.5} />
                </div>
                <div>
                  <h5 className="font-black text-slate-100 text-lg leading-none">মোট ব্যয়</h5>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">খরচের খাত থেকে</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-[1000] text-rose-400 tracking-tighter">৳ {monthlyExpense.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Automated Advice Message based on calculation */}
        <div className={`rounded-[3rem] border-2 animate-in fade-in slide-in-from-bottom-4 duration-1000 relative overflow-hidden ${isSurplus ? 'border-emerald-500/20' : 'border-rose-500/20'}`}>
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${sectionBackgroundUrl})` }}></div>
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative z-10 p-8 flex gap-5 items-start">
            <div className={`p-4 rounded-2xl ${isSurplus ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                <ArrowRightLeft size={24} strokeWidth={3} />
            </div>
            <div className="space-y-2">
                <h4 className={`text-sm font-[1000] uppercase tracking-widest ${isSurplus ? 'text-emerald-300' : 'text-rose-300'}`}>অটোমেটিক বিশ্লেষণ</h4>
                <p className={`text-[13px] font-bold leading-relaxed ${isSurplus ? 'text-emerald-100' : 'text-rose-100'}`}>
                  {isSurplus 
                    ? `${MONTH_NAMES[parseInt(selectedMonth)-1]} মাসে মসজিদ ফান্ডে ${netResult.toLocaleString()} টাকা উদ্বৃত্ত আছে। এই টাকা মসজিদের উন্নয়নমূলক কাজে ব্যবহার করা যেতে পারে।`
                    : `${MONTH_NAMES[parseInt(selectedMonth)-1]} মাসে ব্যয়ের তুলনায় আয় কম হয়েছে। ঘাটতি পূরণে পরবর্তী মাসে দান কালেকশন বাড়ানোর উদ্যোগ নেওয়া প্রয়োজন।`
                  }
                </p>
            </div>
          </div>
        </div>

        {filteredTransactions.length === 0 && (
          <div className="text-center py-20 bg-black/20 border-4 border-dashed border-slate-700 rounded-[3rem]">
            <CalendarDays size={48} className="mx-auto text-slate-600 mb-4" />
            <p className="text-slate-500 font-black uppercase tracking-widest text-xs">এই মাসে কোনো এন্ট্রি পাওয়া যায়নি</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MonthlyReport;