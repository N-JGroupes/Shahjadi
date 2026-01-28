
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Check, 
  Clock, 
  ChevronDown, 
  CalendarCheck,
  MapPin,
  User,
  Calculator,
  UserPlus, 
  X,
  ListFilter,
  FileText,
  RotateCcw,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { Transaction, Member, TransactionType, Category } from '../types';
import CustomSelectModal from './CustomSelectModal';

interface Props {
  members: Member[];
  onAddTransaction: (t: Transaction) => void;
  onUpdateTransaction?: (t: Transaction) => void;
  onTabSwitch: () => void;
  initialCategory?: Category;
  initialType?: TransactionType;
  allTransactions?: Transaction[];
  editingTransaction?: Transaction | null;
  onCancelEdit?: () => void;
}

const NOTE_VALUES = [1000, 500, 200, 100, 50, 20, 10, 5, 2, 1];
const MONTH_NAMES = ["জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন", "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"];
const YEARS_LIST = Array.from({length: 10}, (_, i) => (new Date().getFullYear() - 5 + i).toString());
const BACKGROUND_TEXTURE_URL = "https://i.postimg.cc/gk74Nvv0/6e51778241b494ebab515a0aba518837.jpg";
const MODAL_BACKGROUND_URL = "https://i.postimg.cc/MpzmpdbT/stunning_high_resolution_nature_and_landscape_backgrounds_breathtaking_scenery_in_hd_photo.jpg";

const getCategoryType = (cat: Category): TransactionType => {
  const incomeCategories = [Category.SUBSCRIPTION, Category.DONATION, Category.MARRIAGE, Category.BOX];
  return incomeCategories.includes(cat) ? 'INCOME' : 'EXPENSE';
};

const formatDateToBengali = (dateStr: string) => {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  return date.toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' });
};

const TransactionForm: React.FC<Props> = ({ 
  members, 
  onAddTransaction, 
  onUpdateTransaction,
  onTabSwitch, 
  initialCategory, 
  initialType,
  allTransactions = [],
  editingTransaction,
  onCancelEdit
}) => {
  const [type, setType] = useState<TransactionType>(initialType || 'INCOME');
  const [useCustomDate, setUseCustomDate] = useState(false);
  const [accountingMonth, setAccountingMonth] = useState((new Date().getMonth() + 1).toString());
  const [accountingYear, setAccountingYear] = useState(new Date().getFullYear().toString());
  const [noteCounts, setNoteCounts] = useState<Record<number, string>>({});
  const [formData, setFormData] = useState({
    amount: '',
    category: initialCategory || Category.SUBSCRIPTION,
    memberId: '',
    description: '',
    donorName: '',
    donorAddress: '',
    receiptNo: '',
    date: new Date().toISOString().split('T')[0],
    boxMonth: (new Date().getMonth() + 1).toString(),
    boxYear: new Date().getFullYear().toString()
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [receiptError, setReceiptError] = useState<string | null>(null);
  
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);

  useEffect(() => {
    if (editingTransaction) {
      setType(editingTransaction.type);
      setUseCustomDate(true);
      
      const calcDate = editingTransaction.calculationDate || editingTransaction.date;
      const [y, m] = calcDate.split('-');
      setAccountingYear(y);
      setAccountingMonth(parseInt(m).toString());

      let donorName = '';
      let donorAddress = '';
      let desc = editingTransaction.description;

      if (editingTransaction.category === Category.DONATION || editingTransaction.category === Category.MARRIAGE) {
        const parts = editingTransaction.description.split(', ');
        parts.forEach(part => {
          if (part.startsWith('নাম: ')) donorName = part.replace('নাম: ', '');
          else if (part.startsWith('ঠিকানা: ')) donorAddress = part.replace('ঠিকানা: ', '');
          else if (part.startsWith('বিবরণ: ')) desc = part.replace('বিবরণ: ', '');
        });
      }
      
      setFormData({
        amount: editingTransaction.amount.toString(),
        category: editingTransaction.category,
        memberId: editingTransaction.memberId || '',
        description: desc,
        donorName: donorName,
        donorAddress: donorAddress,
        receiptNo: editingTransaction.receiptNo || '',
        date: editingTransaction.date,
        boxMonth: m,
        boxYear: y,
      });

      const resetNotes: Record<number, string> = {};
      NOTE_VALUES.forEach(v => resetNotes[v] = '');
      setNoteCounts(resetNotes);

    } else {
      const today = new Date();
      const defaultCategory = initialCategory || Category.SUBSCRIPTION;
      
      setFormData({
        amount: '',
        category: defaultCategory,
        memberId: '',
        description: '',
        donorName: '',
        donorAddress: '',
        receiptNo: '',
        date: today.toISOString().split('T')[0],
        boxMonth: (today.getMonth() + 1).toString(),
        boxYear: today.getFullYear().toString(),
      });
      
      setType(getCategoryType(defaultCategory));
      
      const resetNotes: Record<number, string> = {};
      NOTE_VALUES.forEach(v => resetNotes[v] = '');
      setNoteCounts(resetNotes);
      
      setUseCustomDate(false);
      setReceiptError(null);
      setAccountingMonth((today.getMonth() + 1).toString());
      setAccountingYear(today.getFullYear().toString());
    }
  }, [editingTransaction, initialCategory]);

  useEffect(() => {
    setType(getCategoryType(formData.category));
  }, [formData.category]);

  useEffect(() => {
    if (formData.category === Category.BOX && !editingTransaction) {
      const total = NOTE_VALUES.reduce((sum, val) => {
        const count = parseInt(noteCounts[val] || '0');
        return sum + (val * count);
      }, 0);
      setFormData(prev => ({ ...prev, amount: total > 0 ? total.toString() : '' }));
    }
  }, [noteCounts, formData.category, editingTransaction]);
  
  const isReceiptNoRequired = useMemo(() => {
    const mandatoryReceiptCategories = [
      Category.SUBSCRIPTION,
      Category.DONATION,
      Category.MARRIAGE,
    ];
    return mandatoryReceiptCategories.includes(formData.category);
  }, [formData.category]);

  const categoryOptions = useMemo(() => {
    return Object.values(Category).map(cat => ({ value: cat, label: cat }));
  }, []);

  const memberOptions = useMemo(() => {
    return members.map(m => ({
      value: m.id,
      label: `[ID: ${m.memberNo}] ${m.name}`
    }));
  }, [members]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setReceiptError(null);

    if (!formData.amount || Number(formData.amount) <= 0) {
      alert('টাকার পরিমাণ সঠিকভাবে দিন।');
      return;
    }
    
    if (isReceiptNoRequired && !formData.receiptNo) {
        alert('রশিদ নাম্বার বাধ্যতামূলক!');
        return;
    }

    const isDescriptionRequired = formData.category === Category.OTHERS || formData.category === Category.SPECIAL;
    if (isDescriptionRequired && !formData.description) {
        alert('বিবরণ বাধ্যতামূলক!');
        return;
    }
    
    if ((formData.category === Category.DONATION || formData.category === Category.MARRIAGE) && (!formData.donorName || !formData.donorAddress)) {
      alert('দান বা বিয়ের ক্ষেত্রে নাম এবং ঠিকানা উভয়ই বাধ্যতামূলক।');
      return;
    }
    
    if (formData.category === Category.SUBSCRIPTION && !formData.memberId) {
      alert('মাসিক চাঁদার জন্য সদস্য নির্বাচন করুন।');
      return;
    }

    if (isReceiptNoRequired && formData.receiptNo) {
      const mandatoryReceiptCategories = [Category.SUBSCRIPTION, Category.DONATION, Category.MARRIAGE];
      const isDuplicateReceipt = allTransactions.some(
        t => t.receiptNo === formData.receiptNo && 
             mandatoryReceiptCategories.includes(t.category) &&
             t.id !== editingTransaction?.id
      );
      if (isDuplicateReceipt) {
        setReceiptError(`এই রশিদ নাম্বার (${formData.receiptNo}) ইতিমধ্যেই ব্যবহার করা হয়েছে।`);
        return;
      }
    }

    let finalDescription = formData.description;
    let calculationDate: string;

    if (formData.category === Category.BOX) {
      const entryDay = parseInt(formData.date.split('-')[2]);
      const maxDayInBoxMonth = new Date(parseInt(formData.boxYear), parseInt(formData.boxMonth), 0).getDate();
      const finalDay = Math.min(entryDay, maxDayInBoxMonth);
      calculationDate = `${formData.boxYear}-${formData.boxMonth.padStart(2, '0')}-${finalDay.toString().padStart(2, '0')}`;
      finalDescription = `মাস: ${MONTH_NAMES[parseInt(formData.boxMonth) - 1]}, সাল: ${formData.boxYear}`;
    } else {
      const entryDay = parseInt(formData.date.split('-')[2]);
      const maxDayInAccMonth = new Date(parseInt(accountingYear), parseInt(accountingMonth), 0).getDate();
      const finalDay = Math.min(entryDay, maxDayInAccMonth);
      calculationDate = `${accountingYear}-${accountingMonth.padStart(2, '0')}-${finalDay.toString().padStart(2, '0')}`;
    }

    if (formData.category === Category.DONATION || formData.category === Category.MARRIAGE) {
      const namePart = formData.donorName ? `নাম: ${formData.donorName}` : '';
      const addressPart = formData.donorAddress ? `ঠিকানা: ${formData.donorAddress}` : '';
      const extraPart = formData.description ? `বিবরণ: ${formData.description}` : '';
      finalDescription = [namePart, addressPart, extraPart].filter(p => p).join(', ');
    } else if (formData.category === Category.BOX && !editingTransaction) {
      const monthName = MONTH_NAMES[parseInt(formData.boxMonth) - 1];
      finalDescription = `কৌটা আদায়: ${monthName}, ${formData.boxYear} সাল`;
    }

    const transactionData: Transaction = {
      id: editingTransaction ? editingTransaction.id : Date.now().toString(),
      type,
      amount: Number(formData.amount),
      category: formData.category,
      memberId: formData.memberId || undefined,
      description: finalDescription,
      date: formData.date,
      calculationDate: calculationDate,
      receiptNo: formData.receiptNo,
      status: editingTransaction ? editingTransaction.status : 'APPROVED',
      createdBy: editingTransaction ? editingTransaction.createdBy : 'SYSTEM'
    };

    if (editingTransaction && onUpdateTransaction) {
      onUpdateTransaction(transactionData);
    } else {
      onAddTransaction(transactionData);
    }

    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      onTabSwitch();
    }, 1200);

    if (!editingTransaction) {
      const today = new Date();
      setFormData(prev => ({
        ...prev,
        amount: '', memberId: '', description: '', donorName: '',
        donorAddress: '', receiptNo: '', date: today.toISOString().split('T')[0],
        boxMonth: (today.getMonth() + 1).toString(),
        boxYear: today.getFullYear().toString(),
      }));
    }
  };

  const isDonationOrMarriage = formData.category === Category.DONATION || formData.category === Category.MARRIAGE;
  const isBox = formData.category === Category.BOX;
  const isDescriptionRequired = formData.category === Category.OTHERS || formData.category === Category.SPECIAL;

  return (
    <div className="p-4 pb-32 flex flex-col items-center animate-in fade-in zoom-in-95 duration-500 w-full">
      <div className="w-full space-y-5">
        
        {editingTransaction && (
          <div className="bg-amber-100 p-3 rounded-2xl flex justify-between items-center border border-amber-200 text-amber-800 font-bold text-sm">
            <span className="ml-2">এডিট মোড: {editingTransaction.category}</span>
            <button onClick={onCancelEdit} className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg text-xs shadow-sm">
              <RotateCcw size={12} /> বাতিল
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div 
            className="bg-cover bg-center p-6 rounded-[2.5rem] shadow-xl border border-white space-y-6 relative overflow-hidden" 
            style={{ backgroundImage: `url(${BACKGROUND_TEXTURE_URL})` }}
          >
            <div className="absolute inset-0 bg-white/20"></div>
            
            <div className="relative z-10 space-y-6">
              <div className={`absolute top-0 right-0 w-48 h-48 rounded-full translate-x-20 -translate-y-20 pointer-events-none blur-3xl transition-colors duration-500 ${type === 'INCOME' ? 'bg-emerald-100/30' : 'bg-rose-100/30'}`}></div>
              
              {isBox && !editingTransaction ? (
                <div className="space-y-6 animate-in slide-in-from-top-4 duration-500">
                  <div className="flex justify-between items-center px-2 mb-4">
                    <label className="text-[11px] font-[1000] text-slate-500 uppercase tracking-widest flex items-center gap-2">
                      <Calculator size={14} className={'text-emerald-500'} /> কৌটা হিসাব ({MONTH_NAMES[parseInt(formData.boxMonth) - 1]}, {formData.boxYear} সাল)
                    </label>
                  </div>

                  <div className="p-4 bg-slate-50/70 rounded-[2rem] space-y-3 border border-slate-200">
                      <div className="flex items-center gap-2 px-1">
                        <CalendarCheck size={14} className="text-blue-500" />
                        <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">কৌটার মাস ও সাল</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="relative">
                          <select
                            onChange={(e) => setFormData(prev => ({...prev, boxMonth: e.target.value}))}
                            value={formData.boxMonth}
                            className="w-full px-4 py-3 bg-white/70 border border-slate-200 rounded-2xl outline-none font-bold text-base text-center shadow-sm appearance-none focus:border-blue-400"
                          >
                            {MONTH_NAMES.map((m, i) => (
                              <option key={i} value={i+1}>{m}</option>
                            ))}
                          </select>
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"><ChevronDown size={14}/></span>
                        </div>
                        <div className="relative">
                          <select
                            onChange={(e) => setFormData(prev => ({...prev, boxYear: e.target.value}))}
                            value={formData.boxYear}
                            className="w-full px-4 py-3 bg-white/70 border border-slate-200 rounded-2xl outline-none font-bold text-base text-center shadow-sm appearance-none focus:border-blue-400"
                          >
                            {YEARS_LIST.map((y) => (
                              <option key={y} value={y}>{y}</option>
                            ))}
                          </select>
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"><ChevronDown size={14}/></span>
                        </div>
                      </div>
                    </div>

                  <div className="bg-white/50 p-6 rounded-[2.5rem] border border-slate-100 shadow-lg space-y-4">
                      {NOTE_VALUES.map(noteValue => {
                          const count = parseInt(noteCounts[noteValue] || '0');
                          const subtotal = noteValue * count;
                          return (
                            <div key={noteValue} className="flex items-center justify-between p-4 rounded-[1.75rem] border border-slate-200 bg-white/80 shadow-sm">
                              <span className="text-xl font-black text-slate-700 w-24">৳{noteValue.toLocaleString('bn-BD')}</span>
                              <span className="text-slate-400 font-bold mx-2">x</span>
                              <input
                                type="number"
                                min="0"
                                value={noteCounts[noteValue]}
                                onChange={e => setNoteCounts({...noteCounts, [noteValue]: e.target.value})}
                                className="w-20 text-center py-2 bg-slate-100 border border-slate-200 rounded-xl font-black text-lg text-slate-700 shadow-inner outline-none"
                              />
                              <span className="text-slate-400 font-bold mx-2">=</span>
                              <span className="text-2xl font-black text-emerald-700 w-24 text-right">৳{subtotal.toLocaleString('bn-BD')}</span>
                            </div>
                          );
                      })}
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-between items-center px-2">
                    <label className="text-[11px] font-[1000] text-slate-500 uppercase tracking-widest flex items-center gap-2">
                      <Clock size={14} className={type === 'INCOME' ? 'text-emerald-500' : 'text-rose-500'} /> তারিখ ও সময়
                    </label>
                    <button 
                      type="button" 
                      onClick={() => setUseCustomDate(!useCustomDate)}
                      className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full transition-colors flex items-center gap-1.5 ${useCustomDate ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                    >
                      {useCustomDate ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                      {useCustomDate ? 'কাষ্টম তারিখ চালু' : 'অটোমেটিক তারিখ'}
                    </button>
                  </div>
                  
                  {useCustomDate ? (
                    <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 ml-2">এন্ট্রির তারিখ (যেদিন লেনদেন হয়েছে)</label>
                        <input 
                          type="date"
                          value={formData.date}
                          onChange={e => setFormData({...formData, date: e.target.value})}
                          className={`w-full px-4 py-4 bg-white/70 border-2 rounded-[2rem] outline-none font-black text-lg text-center shadow-sm transition-all ${type === 'INCOME' ? 'border-emerald-200 focus:border-emerald-500 text-emerald-900' : 'border-rose-200 focus:border-rose-500 text-rose-900'}`}
                        />
                      </div>
                      <div className={`w-full py-3 rounded-[1.5rem] flex items-center justify-center gap-2 border ${type === 'INCOME' ? 'bg-emerald-50/70 border-emerald-200' : 'bg-rose-50/70 border-rose-200'}`}>
                          <CalendarCheck size={16} className={type === 'INCOME' ? 'text-emerald-500' : 'text-rose-500'} />
                          <span className="font-bold text-sm text-slate-700">{formatDateToBengali(formData.date)}</span>
                      </div>

                      <div className="p-4 bg-slate-100/70 rounded-[2rem] space-y-3 border border-slate-200">
                        <div className="flex items-center gap-2 px-1">
                          <CalendarCheck size={14} className="text-blue-500" />
                          <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">হিসাবের মাস ও সাল (Accounting Period)</span>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="relative">
                            <select
                              onChange={(e) => setAccountingMonth(e.target.value)}
                              value={accountingMonth}
                              className="w-full px-4 py-3 bg-white/70 border border-slate-200 rounded-2xl outline-none font-bold text-base text-center shadow-sm appearance-none focus:border-blue-400"
                            >
                              {MONTH_NAMES.map((m, i) => (
                                <option key={i} value={i+1}>{m}</option>
                              ))}
                            </select>
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"><ChevronDown size={14}/></span>
                          </div>
                          <div className="relative">
                            <select
                              onChange={(e) => setAccountingYear(e.target.value)}
                              value={accountingYear}
                              className="w-full px-4 py-3 bg-white/70 border border-slate-200 rounded-2xl outline-none font-bold text-base text-center shadow-sm appearance-none focus:border-blue-400"
                            >
                              {YEARS_LIST.map((y) => (
                                <option key={y} value={y}>{y}</option>
                              ))}
                            </select>
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"><ChevronDown size={14}/></span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className={`w-full py-4 rounded-[2rem] flex items-center justify-center gap-2 border-2 ${type === 'INCOME' ? 'bg-emerald-50/70 border-emerald-200/50' : 'bg-rose-50/70 border-rose-200/50'}`}>
                      <CalendarCheck size={20} className={type === 'INCOME' ? 'text-emerald-500' : 'text-rose-500'} />
                      <span className="font-[1000] text-lg text-slate-700">{formatDateToBengali(formData.date)} (আজ)</span>
                    </div>
                  )}
                </div>
              )}

              {!initialCategory && !editingTransaction && (
                <div className="space-y-2">
                  <label className="text-[11px] font-[1000] text-slate-500 uppercase tracking-widest ml-2 flex items-center gap-2">
                    <ListFilter size={14} className={type === 'INCOME' ? 'text-emerald-500' : 'text-rose-500'} /> হিসাবের খাত
                  </label>
                  <button
                      type="button"
                      onClick={() => setIsCategoryModalOpen(true)}
                      className="w-full px-5 py-4 bg-white/70 border-2 border-slate-200 focus:border-emerald-500/20 rounded-3xl outline-none font-black text-slate-700 text-xl shadow-inner transition-all flex justify-between items-center text-left group"
                  >
                      <span className="truncate">{formData.category || 'খাত নির্বাচন করুন'}</span>
                      <div className={`pointer-events-none group-hover:scale-110 transition-transform ${type === 'INCOME' ? 'text-emerald-600' : 'text-rose-600'}`}>
                          <ChevronDown size={24} strokeWidth={3} />
                      </div>
                  </button>
                </div>
              )}

              {isDonationOrMarriage && (
                <div className="space-y-5 animate-in slide-in-from-bottom-4 duration-500">
                  <div className="space-y-2">
                    <label className="text-[11px] font-[1000] text-slate-500 uppercase tracking-widest ml-2 flex items-center gap-2">
                      <User size={14} className="text-emerald-500" /> নাম *
                    </label>
                    <input 
                      required
                      type="text"
                      value={formData.donorName}
                      onChange={e => setFormData({...formData, donorName: e.target.value})}
                      className="w-full px-6 py-4 bg-white/70 border-2 border-slate-200 rounded-3xl outline-none focus:border-emerald-500 font-black text-slate-800 text-lg shadow-inner transition-all"
                      placeholder={formData.category === Category.DONATION ? "দাতার নাম" : "দম্পতির নাম"}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-[1000] text-slate-500 uppercase tracking-widest ml-2 flex items-center gap-2">
                      <MapPin size={14} className="text-emerald-500" /> ঠিকানা *
                    </label>
                    <input 
                      required
                      type="text"
                      value={formData.donorAddress}
                      onChange={e => setFormData({...formData, donorAddress: e.target.value})}
                      className="w-full px-6 py-4 bg-white/70 border-2 border-slate-200 rounded-3xl outline-none focus:border-emerald-500 font-black text-slate-800 text-lg shadow-inner transition-all"
                      placeholder="গ্রাম/এলাকা"
                    />
                  </div>
                </div>
              )}

              {(formData.category === Category.SUBSCRIPTION && type === 'INCOME') && (
                  <div className="space-y-2 animate-in slide-in-from-bottom-4 duration-500">
                      <label className="text-[11px] font-[1000] text-slate-500 uppercase tracking-widest ml-2">সদস্য নির্বাচন করুন *</label>
                      <button
                          type="button"
                          onClick={() => setIsMemberModalOpen(true)}
                          className="w-full px-6 py-4 bg-white/70 border-2 border-slate-200 rounded-3xl outline-none font-black text-slate-800 text-lg shadow-inner transition-all flex justify-between items-center text-left group"
                      >
                          <span className="truncate">
                              {formData.memberId ? memberOptions.find(m => m.value === formData.memberId)?.label : '-- সদস্য বেছে নিন --'}
                          </span>
                          <div className="text-emerald-500 pointer-events-none group-hover:scale-110 transition-transform">
                              <ChevronDown size={24} strokeWidth={3} />
                          </div>
                      </button>
                  </div>
              )}

              <div className="space-y-2">
                <label className="text-[11px] font-[1000] text-slate-500 uppercase tracking-widest ml-2">টাকার পরিমাণ *</label>
                <div className="relative group">
                  <div className={`absolute left-8 top-1/2 -translate-y-1/2 font-[1000] text-3xl transition-colors duration-500 ${type === 'INCOME' ? 'text-emerald-500' : 'text-rose-500'}`}>৳</div>
                  <input 
                    required
                    readOnly={isBox && !editingTransaction}
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={e => setFormData({...formData, amount: e.target.value})}
                    className={`w-full pl-16 pr-6 py-6 bg-white/70 border-2 border-slate-200 focus:border-emerald-500/20 rounded-[2.5rem] outline-none text-4xl font-[1000] text-slate-800 tracking-tighter shadow-inner transition-all placeholder:text-slate-200 ${isBox && !editingTransaction ? 'cursor-default' : ''}`}
                    placeholder="0.00"
                  />
                </div>
              </div>

              {!isBox && (
                <div className="space-y-2">
                  <label className="text-[11px] font-[1000] text-slate-500 uppercase tracking-widest ml-2 flex items-center gap-2">
                    <FileText size={14} className="text-slate-400" /> রশিদ নাম্বার {isReceiptNoRequired && '*'}
                  </label>
                  <input 
                    required={isReceiptNoRequired}
                    type="text"
                    value={formData.receiptNo}
                    onChange={e => setFormData({...formData, receiptNo: e.target.value})}
                    className="w-full px-6 py-4 bg-white/70 border-2 border-slate-200 rounded-3xl outline-none font-black text-slate-800 text-lg shadow-inner transition-all"
                    placeholder={isReceiptNoRequired ? "রশিদ নং (বাধ্যতামূলক)" : "রশিদ নং (ঐচ্ছিক)"}
                  />
                  {receiptError && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-xs font-bold animate-in fade-in slide-in-from-top-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-alert-circle"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg> {receiptError}
                    </div>
                  )}
                </div>
              )}

              {!isBox && (
                <div className="space-y-2">
                  <label className="text-[11px] font-[1000] text-slate-500 uppercase tracking-widest ml-2">অতিরিক্ত বিবরণ {isDescriptionRequired && '*'}</label>
                  <textarea 
                    required={isDescriptionRequired}
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    className="w-full px-6 py-5 bg-white/70 border-2 border-slate-200 rounded-3xl outline-none font-black text-slate-700 text-lg shadow-inner transition-all min-h-[120px]"
                    placeholder={isDescriptionRequired ? "বিবরণ লিখুন (বাধ্যতামূলক)" : "যদি কিছু লিখতে চান..."}
                  />
                </div>
              )}
            </div>
          </div>

          <button 
            type="submit"
            className={`w-full py-6 rounded-[2.5rem] font-[1000] text-2xl text-white shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-4 relative overflow-hidden group ${type === 'INCOME' ? 'bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 shadow-emerald-200' : 'bg-gradient-to-tr from-rose-600 via-rose-500 to-pink-500 shadow-rose-200'}`}
          >
            {showSuccess ? (
              <><Check size={32} strokeWidth={5} className="animate-bounce" /> {editingTransaction ? 'আপডেট' : 'সংরক্ষণ'}</>
            ) : (
              editingTransaction ? 'আপডেট করুন' : 'ডাটা সেভ করুন'
            )}
          </button>
        </form>
      </div>

      <CustomSelectModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        options={categoryOptions}
        onSelect={(value) => setFormData({ ...formData, category: value as Category })}
        selectedValue={formData.category}
        title="হিসাবের খাত নির্বাচন করুন"
        backgroundUrl={MODAL_BACKGROUND_URL}
      />

      <CustomSelectModal
        isOpen={isMemberModalOpen}
        onClose={() => setIsMemberModalOpen(false)}
        options={memberOptions}
        onSelect={(value) => setFormData({ ...formData, memberId: value })}
        selectedValue={formData.memberId}
        title="সদস্য নির্বাচন করুন"
        backgroundUrl={MODAL_BACKGROUND_URL}
      />
    </div>
  );
};

export default TransactionForm;
