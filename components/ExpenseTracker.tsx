
import React, { useState, useMemo } from 'react';
import { Transaction, Category, TransactionType, Member } from '../types';
import { 
  PlusCircle, 
  Trash2, 
  Wallet, 
  UserRound, 
  Zap, 
  MoreHorizontal, 
  Star, 
  Check,
  History,
  TrendingDown,
  Calendar,
  ChevronDown,
  AlertCircle,
  ShieldCheck,
  FileText,
  Edit3
} from 'lucide-react';

interface Props {
  transactions: Transaction[];
  onAddExpense: (t: Transaction) => void;
  onDeleteExpense: (id: string) => void;
  onEditExpense: (t: Transaction) => void;
  members?: Member[];
  // FIX: Ensured the 'VIEWER' role is included in the currentUser prop type to align with the App state and fix the type error.
  currentUser: { role: 'ADMIN' | 'MODERATOR' | 'MEMBER' | 'VIEWER', id: string, name: string };
}

const MONTH_NAMES = ["জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন", "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"];
const YEARS = Array.from({ length: 10 }, (_, i) => (new Date().getFullYear() - 5 + i).toString());

const backgroundUrl = "https://i.postimg.cc/Gt8LXTfG/31f62157aaa3d42311e9bb67db59b50b.gif";
const sectionBackgroundUrl = "https://i.postimg.cc/VvdQYyBQ/v_B6e_Cf.gif";

// FIX: Changed to a named export to resolve the "no default export" error.
export const ExpenseTracker: React.FC<Props> = ({ transactions, onAddExpense, onDeleteExpense, onEditExpense, members = [], currentUser }) => {
  const [selectedMonth, setSelectedMonth] = useState((new Date().getMonth() + 1).toString());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [receiptNo, setReceiptNo] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedPeriod = `${selectedYear}-${selectedMonth.padStart(2, '0')}`;
  
  const filteredExpenses = useMemo(() => 
    transactions.filter(t => t.type === 'EXPENSE' && (t.calculationDate || t.date).startsWith(selectedPeriod) && t.status === 'APPROVED'),
  [transactions, selectedPeriod]);

  const totalExpense = useMemo(() => 
    filteredExpenses.reduce((sum, t) => sum + t.amount, 0),
  [filteredExpenses]);

  const isAlreadyEntered = (cat: Category) => {
    if (cat === Category.OTHERS) return false;
    return filteredExpenses.some(t => t.category === cat);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory || !amount) return;

    if (isAlreadyEntered(selectedCategory)) {
      setError(`${selectedCategory} এই মাসে ইতিমধ্যে এন্ট্রি করা হয়েছে।`);
      return;
    }

    const entryDate = `${selectedYear}-${selectedMonth.padStart(2, '0')}-01`;

    onAddExpense({
      id: Date.now().toString(),
      type: 'EXPENSE',
      amount: Number(amount),
      category: selectedCategory,
      description: description,
      receiptNo: receiptNo,
      date: entryDate,
      calculationDate: entryDate,
      status: 'APPROVED',
      createdBy: 'ADMIN' 
    });

    setError(null);
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setSelectedCategory(null);
      setAmount('');
      setDescription('');
      setReceiptNo('');
    }, 1200);
  };

  const getModeratorSerial = (userId: string) => {
    return members.find(m => m.id === userId)?.moderatorSerial;
  };

  const expenseCategories = [
    { cat: Category.IMAM_HONORARIUM, icon: UserRound, color: 'emerald' },
    { cat: Category.MUAZZIN_HONORARIUM, icon: UserRound, color: 'teal' },
    { cat: Category.UTILITY, icon: Zap, color: 'amber' },
    { cat: Category.SPECIAL, icon: Star, color: 'rose' },
    { cat: Category.OTHERS, icon: MoreHorizontal, color: 'slate' },
  ];

  return (
    <div className="relative rounded-t-[2.5rem] overflow-hidden -mt-4">
      <div className="absolute inset-0 bg-cover bg-center z-0" style={{ backgroundImage: `url(${backgroundUrl})` }}></div>
      <div className="absolute inset-0 bg-black/20 z-0"></div>
      <div className="relative z-10 p-6 space-y-8 pb-32 text-white">
        <div className="text-center space-y-3 mb-4">
          <h2 className="text-4xl font-[1000] tracking-tighter leading-none">মাসিক ব্যয়</h2>
          <p className="text-[11px] text-rose-300 font-[1000] uppercase tracking-[0.4em]">মসজিদ ফান্ডের খরচ সমূহ</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="relative group">
            <select 
              value={selectedMonth}
              onChange={e => setSelectedMonth(e.target.value)}
              className="w-full pl-6 pr-10 py-4 bg-black/20 border-2 border-white/10 rounded-[2rem] outline-none font-black text-slate-100 appearance-none shadow-sm focus:border-rose-500/50 transition-all"
            >
              {MONTH_NAMES.map((name, i) => (
                <option key={i} value={i + 1}>{name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-rose-400 pointer-events-none" size={18} strokeWidth={3} />
          </div>
          <div className="relative group">
            <select 
              value={selectedYear}
              onChange={e => setSelectedYear(e.target.value)}
              className="w-full pl-6 pr-10 py-4 bg-black/20 border-2 border-white/10 rounded-[2rem] outline-none font-black text-slate-100 appearance-none shadow-sm focus:border-rose-500/50 transition-all"
            >
              {YEARS.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-rose-400 pointer-events-none" size={18} strokeWidth={3} />
          </div>
        </div>

        <div className="rounded-[3rem] shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${sectionBackgroundUrl})` }}></div>
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative z-10 p-8">
            <div className="absolute top-0 right-0 p-6 opacity-10 rotate-12 group-hover:scale-110 transition-transform duration-1000">
              <TrendingDown size={140} />
            </div>
            <div className="relative z-10">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-80 mb-2">
                {MONTH_NAMES[parseInt(selectedMonth)-1]} {selectedYear} এর মোট ব্যয়
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-rose-200">৳</span>
                <h3 className="text-5xl font-[1000] tracking-tighter">{totalExpense.toLocaleString()}</h3>
              </div>
            </div>
          </div>
        </div>

        {currentUser.role !== 'VIEWER' && (
        <>
            <div className="grid grid-cols-2 gap-4">
            {expenseCategories.map(({ cat, icon: Icon, color }) => {
                const filled = isAlreadyEntered(cat);
                return (
                <button
                    key={cat}
                    disabled={filled}
                    onClick={() => {
                    setSelectedCategory(cat);
                    setError(null);
                    }}
                    className={`p-6 rounded-[2.5rem] border-2 transition-all active:scale-90 shadow-sm relative overflow-hidden ${selectedCategory === cat ? 'border-rose-500 shadow-rose-900/50 scale-105' : 'border-white/10'} ${filled ? 'opacity-40 grayscale pointer-events-none' : ''}`}
                >
                    <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${sectionBackgroundUrl})` }}></div>
                    <div className="absolute inset-0 bg-black/20"></div>
                    {filled && (
                    <div className="absolute top-3 right-3 text-emerald-300 bg-emerald-500/10 p-1 rounded-full z-20">
                        <Check size={12} strokeWidth={4} />
                    </div>
                    )}
                    <div className="relative z-10 flex flex-col items-center justify-center">
                    <div className={`p-4 rounded-2xl mb-3 bg-${color}-500/10 text-${color}-400`}>
                        <Icon size={24} strokeWidth={3} />
                    </div>
                    <span className="font-black text-slate-100 text-sm tracking-tight">{cat}</span>
                    {filled && <span className="text-[8px] font-black text-emerald-400 uppercase mt-1">পূর্ণ হয়েছে</span>}
                    </div>
                </button>
                );
            })}
            </div>

            {error && (
            <div className="p-5 bg-rose-500/10 border-2 border-rose-500/20 rounded-3xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                <AlertCircle className="text-rose-400" size={20} strokeWidth={3} />
                <p className="text-rose-200 font-black text-xs leading-tight">{error}</p>
            </div>
            )}

            {selectedCategory && (
            <div className="rounded-[3rem] shadow-2xl border border-rose-500/20 animate-in slide-in-from-top-4 duration-500 relative overflow-hidden">
                <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${sectionBackgroundUrl})` }}></div>
                <div className="absolute inset-0 bg-black/20"></div>
                <form onSubmit={handleSubmit} className="relative z-10 p-8 space-y-6">
                <div className="flex justify-between items-center mb-2">
                    <h4 className="text-xl font-[1000] text-slate-100 tracking-tight">{selectedCategory} এন্ট্রি ({MONTH_NAMES[parseInt(selectedMonth)-1]})</h4>
                    <button type="button" onClick={() => setSelectedCategory(null)} className="text-slate-500 hover:text-rose-400 transition-colors">
                    <PlusCircle size={24} className="rotate-45" />
                    </button>
                </div>

                <div className="space-y-2">
                    <label className="text-[11px] font-[1000] text-slate-400 uppercase tracking-widest ml-2">টাকার পরিমাণ *</label>
                    <div className="relative group">
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 font-[1000] text-2xl text-rose-400">৳</div>
                    <input
                        required
                        type="number"
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                        className="w-full pl-14 pr-6 py-5 bg-black/20 border-2 border-white/10 rounded-[2rem] outline-none focus:border-rose-500/50 font-black text-slate-100 text-2xl shadow-inner transition-all placeholder:text-slate-600"
                        placeholder="0.00"
                    />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[11px] font-[1000] text-slate-400 uppercase tracking-widest ml-2 flex items-center gap-2">
                      <FileText size={14} /> রশিদ নাম্বার (ঐচ্ছিক)
                    </label>
                    <input 
                      type="text"
                      value={receiptNo}
                      onChange={e => setReceiptNo(e.target.value)}
                      className="w-full px-6 py-4 bg-black/20 border-2 border-white/10 rounded-[2rem] outline-none font-black text-slate-100 text-base shadow-inner transition-all placeholder:text-slate-600"
                      placeholder="যেমন: V-101"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-[11px] font-[1000] text-slate-400 uppercase tracking-widest ml-2">বিবরণ (ঐচ্ছিক)</label>
                    <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    className="w-full px-6 py-4 bg-black/20 border-2 border-white/10 rounded-[2rem] outline-none font-black text-slate-100 text-base shadow-inner transition-all min-h-[100px]"
                    placeholder="খরচের বিস্তারিত..."
                    />
                </div>

                <button
                    type="submit"
                    className="w-full py-6 rounded-[2.5rem] bg-gradient-to-tr from-rose-600 to-pink-500 text-white font-[1000] text-xl shadow-2xl shadow-rose-900/50 active:scale-95 transition-all flex items-center justify-center gap-3"
                >
                    {showSuccess ? (
                    <>
                        <Check size={28} strokeWidth={4} className="animate-bounce" /> সেভ হয়েছে
                    </>
                    ) : (
                    <>
                        <PlusCircle size={24} /> খরচ যোগ করুন
                    </>
                    )}
                </button>
                </form>
            </div>
            )}
        </>
        )}

        <div className="space-y-6">
          <div className="flex items-center gap-3 ml-2">
            <div className="h-6 w-1.5 bg-rose-500 rounded-full"></div>
            <h4 className="text-lg font-[1000] text-slate-100 tracking-tight">এই মাসের খরচসমূহ</h4>
          </div>

          <div className="space-y-4">
            {filteredExpenses.length === 0 ? (
                <div className="text-center py-16 bg-black/20 border-4 border-dashed border-slate-700 rounded-[3rem]">
                    <p className="text-slate-500 font-black uppercase tracking-widest text-xs">এই মাসে এখনো কোনো খরচ রেকর্ড করা হয়নি</p>
                </div>
            ) : (
                filteredExpenses.map(t => (
                <div 
                    key={t.id} 
                    className="rounded-[2.5rem] shadow-lg border border-white/10 group relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${sectionBackgroundUrl})` }}></div>
                    <div className="absolute inset-0 bg-black/20"></div>
                    <div className="relative z-10 p-6 flex justify-between items-center">
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-rose-500/10 text-rose-400 rounded-2xl flex items-center justify-center shadow-inner group-hover:rotate-12 transition-transform duration-500">
                          <Wallet size={28} strokeWidth={2.5} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h5 className="font-[1000] text-slate-100 text-lg leading-none">{t.category}</h5>
                            {t.createdBy !== 'ADMIN' && (
                              <div className="bg-emerald-500/10 text-emerald-300 px-1.5 py-0.5 rounded-lg flex items-center gap-1 shadow-sm border border-emerald-500/20" title={`Moderator M-${getModeratorSerial(t.createdBy)}`}>
                                <ShieldCheck size={8} strokeWidth={4} />
                                <span className="text-[7px] font-[1000]">M-{getModeratorSerial(t.createdBy)}</span>
                              </div>
                            )}
                          </div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1.5 line-clamp-1">{t.description || 'বিবরণ নেই'}</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-xl font-[1000] text-rose-300 tracking-tighter">
                            ৳ {t.amount.toLocaleString()}
                          </p>
                          <p className="text-[9px] font-black text-slate-500 uppercase mt-1">{t.receiptNo || "রশিদ নেই"}</p>
                        </div>
                        {currentUser.role !== 'VIEWER' && (
                        <div className="flex flex-col gap-2">
                            <button onClick={() => onEditExpense(t)} className="p-2 text-slate-400 bg-white/5 rounded-xl hover:bg-white/10 hover:text-emerald-400">
                                <Edit3 size={16} />
                            </button>
                            <button onClick={() => onDeleteExpense(t.id)} className="p-2 text-slate-400 bg-white/5 rounded-xl hover:bg-white/10 hover:text-rose-400">
                                <Trash2 size={16} />
                            </button>
                        </div>
                        )}
                    </div>
                    </div>
                </div>
                ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Removed default export
