import React, { useState, useMemo } from 'react';
import { Transaction, Category, Member } from '../types';
import { 
  TrendingUp, 
  ChevronDown, 
  CircleDollarSign, 
  Gift, 
  Heart, 
  Archive, 
  MoreHorizontal,
  ArrowUpRight,
  PieChart,
  ShieldCheck
} from 'lucide-react';

interface Props {
  transactions: Transaction[];
  members?: Member[];
}

const MONTH_NAMES = ["জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন", "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"];
const YEARS = Array.from({ length: 10 }, (_, i) => (new Date().getFullYear() - 5 + i).toString());

const backgroundUrl = "https://i.postimg.cc/0QH5G0cF/dbc22a620c251fe2b4aa7271b9a1e723.gif";
const sectionBackgroundUrl = "https://i.postimg.cc/Gt8LXTfG/31f62157aaa3d42311e9bb67db59b50b.gif";

const IncomeTracker: React.FC<Props> = ({ transactions, members = [] }) => {
  const [selectedMonth, setSelectedMonth] = useState((new Date().getMonth() + 1).toString());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

  const selectedPeriod = `${selectedYear}-${selectedMonth.padStart(2, '0')}`;
  
  const incomeTransactions = useMemo(() => 
    transactions.filter(t => t.type === 'INCOME' && (t.calculationDate || t.date).startsWith(selectedPeriod) && t.status === 'APPROVED'),
  [transactions, selectedPeriod]);

  const incomeCategories = [
    { cat: Category.SUBSCRIPTION, icon: CircleDollarSign, color: 'emerald' },
    { cat: Category.DONATION, icon: Gift, color: 'blue' },
    { cat: Category.MARRIAGE, icon: Heart, color: 'rose' },
    { cat: Category.BOX, icon: Archive, color: 'amber' },
    { cat: Category.OTHERS, icon: MoreHorizontal, color: 'slate' },
  ];

  const categoryWiseTotals = useMemo(() => {
    return incomeCategories.map(item => {
      const categoryTxs = incomeTransactions.filter(t => t.category === item.cat);
      const total = categoryTxs.reduce((sum, t) => sum + t.amount, 0);
      
      // Get serials of moderators who contributed to this category
      const modSerials = Array.from(new Set(
        categoryTxs
          .filter(t => t.createdBy !== 'ADMIN')
          .map(t => members.find(m => m.id === t.createdBy)?.moderatorSerial)
          .filter(Boolean)
      ));

      return { ...item, total, modSerials };
    });
  }, [incomeTransactions, members]);

  const grandTotal = useMemo(() => 
    categoryWiseTotals.reduce((sum, item) => sum + item.total, 0),
  [categoryWiseTotals]);

  return (
    <div className="relative rounded-t-[2.5rem] overflow-hidden -mt-4">
      <div className="absolute inset-0 bg-cover bg-center z-0" style={{ backgroundImage: `url(${backgroundUrl})` }}></div>
      <div className="absolute inset-0 bg-black/20 z-0"></div>
      <div className="relative z-10 p-6 space-y-8 pb-32">
        <div className="text-center space-y-3 mb-4 text-white">
          <h2 className="text-4xl font-[1000] tracking-tighter leading-none">মাসিক আয়</h2>
          <p className="text-[11px] text-emerald-300 font-[1000] uppercase tracking-[0.4em]">আয়ের খাতের সারসংক্ষেপ</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="relative group">
            <select 
              value={selectedMonth}
              onChange={e => setSelectedMonth(e.target.value)}
              className="w-full pl-6 pr-10 py-4 bg-black/20 border-2 border-white/10 rounded-[2rem] outline-none font-black text-slate-100 appearance-none shadow-sm focus:border-emerald-500/50 transition-all"
            >
              {MONTH_NAMES.map((name, i) => (
                <option key={i} value={i + 1}>{name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-emerald-400 pointer-events-none" size={18} strokeWidth={3} />
          </div>
          <div className="relative group">
            <select 
              value={selectedYear}
              onChange={e => setSelectedYear(e.target.value)}
              className="w-full pl-6 pr-10 py-4 bg-black/20 border-2 border-white/10 rounded-[2rem] outline-none font-black text-slate-100 appearance-none shadow-sm focus:border-emerald-500/50 transition-all"
            >
              {YEARS.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-emerald-400 pointer-events-none" size={18} strokeWidth={3} />
          </div>
        </div>

        <div className="rounded-[3rem] shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${sectionBackgroundUrl})` }}></div>
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative z-10 p-9 text-white">
            <div className="absolute top-[-10%] right-[-5%] opacity-10 group-hover:scale-110 transition-transform duration-1000 rotate-12 pointer-events-none">
              <TrendingUp size={240} />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                  <PieChart size={20} className="text-amber-300" />
                </div>
                <p className="text-emerald-50 text-[11px] font-[1000] tracking-[0.3em] uppercase opacity-90">
                  {MONTH_NAMES[parseInt(selectedMonth)-1]} {selectedYear} এর সর্বমোট আয়
                </p>
              </div>
              
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-amber-400">৳</span>
                <h2 className="text-5xl font-[1000] tracking-tighter drop-shadow-2xl">
                  {grandTotal.toLocaleString()}
                </h2>
              </div>
            </div>
          </div>
        </div>


        <div className="space-y-6">
          <div className="flex items-center gap-3 ml-2">
            <div className="h-6 w-1.5 bg-emerald-500 rounded-full"></div>
            <h4 className="text-lg font-[1000] text-slate-100 tracking-tight">খাত অনুযায়ী আদায়</h4>
          </div>

          <div className="space-y-4">
            {categoryWiseTotals.map((item, idx) => (
              <div 
                key={idx} 
                className="rounded-[2.5rem] shadow-lg border border-white/10 group hover:border-emerald-500/30 transition-all active:scale-[0.98] relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${sectionBackgroundUrl})` }}></div>
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="relative z-10 p-6 flex justify-between items-center">
                  <div className="flex items-center gap-5">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner group-hover:rotate-12 transition-transform duration-500 bg-${item.color}-500/10 text-${item.color}-400`}>
                      <item.icon size={28} strokeWidth={2.5} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h5 className="font-[1000] text-slate-100 text-lg leading-none">{item.cat}</h5>
                        <div className="flex gap-1">
                          {item.modSerials.map(serial => (
                            <div key={serial} className="bg-emerald-500/10 text-emerald-300 px-1.5 py-0.5 rounded-lg flex items-center gap-1 shadow-sm border border-emerald-500/20" title={`Moderator M-${serial}`}>
                              <ShieldCheck size={8} strokeWidth={4} />
                              <span className="text-[7px] font-[1000]">M-{serial}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1.5">আয়ের উৎস</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className={`px-5 py-2.5 rounded-2xl shadow-inner border border-white/5 bg-emerald-500/10`}>
                      <p className="text-xl font-[1000] text-emerald-300 tracking-tighter">
                        ৳ {item.total.toLocaleString()}
                      </p>
                    </div>
                    <p className="text-[9px] font-black text-slate-500 uppercase mt-1">মোট আদায়</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {grandTotal === 0 && (
          <div className="text-center py-16 bg-black/20 border-4 border-dashed border-slate-700 rounded-[3rem]">
            <p className="text-slate-500 font-black uppercase tracking-widest text-xs">এই মাসে এখনো কোন আয় রেকর্ড করা হয়নি</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default IncomeTracker;