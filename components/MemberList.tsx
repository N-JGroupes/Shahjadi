import React, { useState, useRef, useEffect } from 'react';
import { Member, Transaction, DEFAULT_LOGO_URL } from '../types';
import { UserPlus, Search, Trash2, Phone, Award, User, ChevronDown, Sparkles, Edit3, ShieldCheck, KeyRound, Check, Briefcase, Lock, Eye, EyeOff, X, ToggleLeft, ToggleRight, Fingerprint, Plus, FileDown, Copy, Download } from 'lucide-react';

interface Props {
  members: Member[];
  transactions?: Transaction[]; // Added transactions prop to filter for download
  onAddMember: (m: Member) => void;
  onUpdateMember: (m: Member) => void;
  onDeleteMember: (id: string) => void;
  currentUserRole?: 'ADMIN' | 'MODERATOR' | 'MEMBER' | 'VIEWER';
  currentUserId?: string; 
  onUpdateMemberProfileImage: (memberId: string, url: string) => void; 
  onUpdateMemberHomePageBanner: (memberId: string, url: string) => void; 
}

const COMMON_DESIGNATIONS = ['সভাপতি', 'সহ-সভাপতি', 'সেক্রেটারি', 'যুগ্ন সেক্রেটারি', 'সাধারণ সম্পাদক', 'কোষাধ্যক্ষ', 'কায্যকরি সদস্য', 'সাধারণ সদস্য', 'দাতা সদস্য', 'ইমাম', 'মোয়াজ্জেম', 'খাদেম', 'অন্যান্য'];
const MONTH_NAMES = ["জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন", "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"];
const CURRENT_YEAR = new Date().getFullYear();
const YEARS_RANGE = Array.from({ length: 11 }, (_, i) => (CURRENT_YEAR - 5 + i).toString()); 
const BACKGROUND_TEXTURE_URL = "https://i.postimg.cc/gk74Nvv0/6e51778241b494ebab515a0aba518837.jpg";

// Explicit Hex Colors for guaranteed application (for the side stripe)
const MEMBER_COLORS = [
  '#059669', // Emerald 600
  '#2563eb', // Blue 600
  '#e11d48', // Rose 600
  '#d97706', // Amber 600
  '#7c3aed', // Violet 600
  '#0891b2', // Cyan 600
  '#db2777', // Pink 600
  '#4f46e5', // Indigo 600
  '#ea580c', // Orange 600
  '#0d9488', // Teal 600
  '#65a30d', // Lime 600
  '#9333ea', // Purple 600
  '#be123c', // Rose 700
  '#0f766e', // Teal 700
  '#4338ca', // Indigo 700
];

// Helper to get a consistent color for the side stripe based on member ID
const getMemberColor = (id: string) => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % MEMBER_COLORS.length;
  return MEMBER_COLORS[index];
};

// FIX: Changed to a named export to resolve the "no default export" error.
export const MemberList: React.FC<Props> = ({ members, transactions = [], onAddMember, onUpdateMember, onDeleteMember, currentUserRole, currentUserId, onUpdateMemberProfileImage, onUpdateMemberHomePageBanner }) => {
  const [showAddMemberForm, setShowAddMemberForm] = useState(false); 
  const [editingId, setEditingId] = useState<string | null>(null); 
  const [activeActionsId, setActiveActionsId] = useState<string | null>(null); 
  const [search, setSearch] = useState('');
  const [useAutomaticMemberId, setUseAutomaticMemberId] = useState(true); 
  
  const [formData, setFormData] = useState<{
    memberNo: string;
    name: string;
    phone: string;
    designation: string;
    customDesignation: string;
    yearlyAmounts: { year: string; amount: string; }[]; 
    startYear: string;
    startMonth: string;
    isModerator: boolean;
    password: string;
  }>({
    memberNo: '',
    name: '',
    phone: '',
    designation: 'সাধারণ সদস্য',
    customDesignation: '',
    yearlyAmounts: [{ year: CURRENT_YEAR.toString(), amount: '' }], 
    startYear: CURRENT_YEAR.toString(),
    startMonth: '1', 
    isModerator: false,
    password: 'admin'
  });
  
  const memberFormRef = useRef<HTMLDivElement>(null); 

  const isAdmin = currentUserRole === 'ADMIN';
  const isViewer = currentUserRole === 'VIEWER';

  useEffect(() => {
    if (!editingId && useAutomaticMemberId && showAddMemberForm) {
      const existingSequentialNumbers = members
        .map(m => {
          const match = m.memberNo.match(/^NJ-(\d+)$/);
          return match ? parseInt(match[1], 10) : 0;
        })
        .filter(num => num > 0);
      const nextIdNumber = existingSequentialNumbers.length > 0
        ? Math.max(...existingSequentialNumbers) + 1
        : 1;
      setFormData(prev => ({ ...prev, memberNo: nextIdNumber.toString() }));
    } else if (!editingId && !useAutomaticMemberId && showAddMemberForm && formData.memberNo.startsWith('NJ-')) {
      setFormData(prev => ({ ...prev, memberNo: '' }));
    }
  }, [editingId, useAutomaticMemberId, showAddMemberForm, members]); 

  const handleYearlyAmountChange = (index: number, field: 'year' | 'amount', value: string) => {
    const newYearlyAmounts = [...formData.yearlyAmounts];
    newYearlyAmounts[index] = { ...newYearlyAmounts[index], [field]: value };
    setFormData(prev => ({ ...prev, yearlyAmounts: newYearlyAmounts }));
  };

  const addYearlyAmountRow = () => {
    setFormData(prev => ({
      ...prev,
      yearlyAmounts: [...prev.yearlyAmounts, { year: (parseInt(prev.yearlyAmounts[prev.yearlyAmounts.length - 1]?.year || CURRENT_YEAR.toString()) + 1).toString(), amount: '' }]
    }));
  };

  const removeYearlyAmountRow = (index: number) => {
    const newYearlyAmounts = formData.yearlyAmounts.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, yearlyAmounts: newYearlyAmounts }));
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.memberNo) return;

    if (formData.yearlyAmounts.length === 0) {
      alert('মাসিক চাঁদার পরিমাণ অন্তত একটি বছরের জন্য নির্ধারণ করুন।');
      return;
    }
    const validatedMonthlyAmounts: { [year: string]: number; } = {};
    const yearsEntered: Set<string> = new Set();

    for (const entry of formData.yearlyAmounts) {
      if (!entry.year || !entry.amount) {
        alert('অনুগ্রহ করে সাল এবং মাসিক চাঁদার পরিমাণ উভয়ই পূরণ করুন।');
        return;
      }
      if (yearsEntered.has(entry.year)) {
        alert(`একই সাল (${entry.year}) একাধিকবার ব্যবহার করা যাবে না।`);
        return;
      }
      const amountNum = Number(entry.amount);
      if (isNaN(amountNum) || amountNum < 0) {
        alert('মাসিক চাঁদার পরিমাণ সঠিক সংখ্যা হতে হবে।');
        return;
      }
      validatedMonthlyAmounts[entry.year] = amountNum;
      yearsEntered.add(entry.year);
    }
    
    if (!validatedMonthlyAmounts[formData.startYear]) {
        alert(`যোগদানের বছর (${formData.startYear}) এর জন্য মাসিক চাঁদার পরিমাণ নির্ধারণ করা আবশ্যক।`);
        return;
    }

    const finalDesignation = formData.designation === 'অন্যান্য' ? formData.customDesignation : formData.designation;
    const memberNoValue = formData.memberNo; 
    
    const fullMemberNoForSave = memberNoValue.startsWith('NJ-') ? memberNoValue : `NJ-${memberNoValue}`;

    const isDuplicateName = members.some(m => 
      m.name.toLowerCase() === formData.name.toLowerCase() && 
      m.id !== editingId 
    );
    if (isDuplicateName) {
      alert(`এই নামটি (${formData.name}) ইতিমধ্যেই ব্যবহার করা হয়েছে। অনুগ্রহ করে অন্য একটি নাম দিন।`);
      return;
    }

    const isDuplicatePhone = members.some(m => 
      formData.phone && m.phone === formData.phone && 
      m.id !== editingId 
    );
    if (isDuplicatePhone) {
      alert(`এই ফোন নাম্বারটি (${formData.phone}) ইতিমধ্যেই ব্যবহার করা হয়েছে। অনুগ্রহ করে অন্য একটি নাম্বার দিন।`);
      return;
    }

    if (!editingId) { 
      const isDuplicateId = members.some(m => m.memberNo === fullMemberNoForSave);
      if (isDuplicateId) {
        alert('এই আইডি নম্বরটি ইতিমধ্যেই ব্যবহার করা হয়েছে। অনুগ্রহ করে অন্য একটি আইডি দিন।');
        return;
      }
    } else { 
      const isDuplicateId = members.some(m => m.memberNo === fullMemberNoForSave && m.id !== editingId);
      if (isDuplicateId) {
        alert('এই আইডি নম্বরটি ইতিমধ্যেই অন্য একজন সদস্য ব্যবহার করছেন। অনুগ্রহ করে অন্য একটি আইডি দিন।');
        return;
      }
    }

    let modSerial = members.find(m => m.id === editingId)?.moderatorSerial;
    if (formData.isModerator && !modSerial) {
      const existingSerials = members.map(m => m.moderatorSerial || 0);
      modSerial = Math.max(0, ...existingSerials) + 1;
    } else if (!formData.isModerator) {
      modSerial = undefined;
    }

    const memberData: Member = {
      id: editingId || Date.now().toString(),
      memberNo: fullMemberNoForSave, 
      name: formData.name,
      phone: formData.phone,
      designation: finalDesignation || 'সাধারণ সদস্য',
      joinDate: new Date().toISOString().split('T')[0],
      startYear: formData.startYear,
      startMonth: parseInt(formData.startMonth),
      monthlyAmounts: validatedMonthlyAmounts, 
      isModerator: formData.isModerator,
      moderatorSerial: modSerial,
      password: formData.password || 'admin',
      profileImageUrl: members.find(m => m.id === editingId)?.profileImageUrl || undefined, 
      homePageBannerUrl: members.find(m => m.id === editingId)?.homePageBannerUrl || undefined, 
    };

    // Sanitize the object to remove undefined values before sending to Firestore
    const cleanMemberData = Object.fromEntries(Object.entries(memberData).filter(([_, v]) => v !== undefined));

    if (editingId) {
      onUpdateMember(cleanMemberData as Member);
    } else {
      onAddMember(cleanMemberData as Member);
    }

    resetForm();
    setShowAddMemberForm(false); 
    setEditingId(null); 
    setActiveActionsId(null); 
  };

  const resetForm = () => {
    setFormData({ 
      memberNo: '', name: '', phone: '', designation: 'সাধারণ সদস্য', 
      customDesignation: '', 
      yearlyAmounts: [{ year: CURRENT_YEAR.toString(), amount: '' }], 
      startYear: CURRENT_YEAR.toString(),
      startMonth: '1',
      isModerator: false, password: 'admin'
    });
    setEditingId(null);
    setActiveActionsId(null); 
    setUseAutomaticMemberId(true); 
  };

  const startEdit = (member: Member) => {
    const isCommon = COMMON_DESIGNATIONS.includes(member.designation);
    
    const yearlyAmountsArray = Object.entries(member.monthlyAmounts || {}).map(([year, amount]) => ({
        year,
        amount: amount.toString()
    }));
    
    if (yearlyAmountsArray.length === 0) {
        yearlyAmountsArray.push({ year: member.startYear || CURRENT_YEAR.toString(), amount: '' });
    }

    setFormData({
      memberNo: member.memberNo.startsWith('NJ-') ? member.memberNo.replace('NJ-', '') : member.memberNo,
      name: member.name,
      phone: member.phone,
      designation: isCommon ? member.designation : 'অন্যান্য',
      customDesignation: isCommon ? '' : member.designation,
      yearlyAmounts: yearlyAmountsArray,
      startYear: member.startYear,
      startMonth: (member.startMonth || 1).toString(),
      isModerator: member.isModerator || false,
      password: member.password || 'admin'
    });
    setEditingId(member.id);
    setActiveActionsId(member.id); 
    setShowAddMemberForm(false); 

    setTimeout(() => {
      memberFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const toggleActions = (memberId: string) => {
    if (isViewer) return;
    setActiveActionsId(prevId => {
      if (prevId === memberId) {
        if (editingId === memberId) resetForm();
        return null;
      } else {
        if (editingId) resetForm(); 
        return memberId;
      }
    });
    setTimeout(() => {
      document.getElementById(`member-card-${memberId}`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 50);
  };

  const handleCancelEdit = () => {
    resetForm(); 
    setShowAddMemberForm(false); 
  };


  const handleResetPassword = (member: Member) => {
    onUpdateMember({ ...member, password: 'admin' });
    if (editingId === member.id) {
        setFormData(prev => ({ ...prev, password: 'admin' }));
    }
    alert(`${member.name} এর পাসওয়ার্ড সফলভাবে রিসেট হয়েছে। নতুন পাসওয়ার্ড: admin`);
  };

  // NEW: Handle Download Member Data (as JSON file)
  const handleDownloadMemberData = (member: Member) => {
    const memberTransactions = transactions.filter(t => t.memberId === member.id);
    
    const exportData = {
      type: 'single_member_backup',
      exportDate: new Date().toISOString(),
      member: member,
      transactions: memberTransactions
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const sanitizedName = member.name.replace(/\s+/g, '_');
    const fileName = `Member_Backup_${member.memberNo}_${sanitizedName}.json`;

    try {
      const blob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      alert('সদস্যের ডাটা ব্যাকআপ ফাইল ডাউনলোড হয়েছে।');
    } catch(err) {
        alert('ফাইল ডাউনলোড করতে সমস্যা হয়েছে।');
    }
  };

  // NEW: Handle Copy Member Data (to clipboard as JSON string)
  const handleCopyMemberData = (member: Member) => {
    const memberTransactions = transactions.filter(t => t.memberId === member.id);
    
    const exportData = {
      type: 'single_member_backup',
      exportDate: new Date().toISOString(),
      member: member,
      transactions: memberTransactions
    };

    const dataStr = JSON.stringify(exportData); // No pretty print for clipboard
    
    navigator.clipboard.writeText(dataStr)
      .then(() => {
        alert('সদস্যের ডাটা ক্লিপবোর্ডে কপি হয়েছে।');
      })
      .catch((err) => {
        console.error('Failed to copy member data:', err);
        alert('ডাটা কপি করতে সমস্যা হয়েছে।');
      });
  };

  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(search.toLowerCase()) || 
    m.phone.includes(search) || m.memberNo.includes(search)
  );

  return (
    <div className="p-6 space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-[1000] text-slate-800 tracking-tighter leading-none">সদস্য বৃন্দ</h2>
          <p className="text-[11px] text-emerald-600 font-[1000] uppercase tracking-widest mt-2">{members.length} জন নিবন্ধিত</p>
        </div>
        {(!isViewer && (isAdmin || currentUserRole === 'MODERATOR')) && (
          <button 
            onClick={() => { 
              if (showAddMemberForm) { 
                resetForm(); 
                setShowAddMemberForm(false);
              } else { 
                resetForm(); 
                setShowAddMemberForm(true);
              }
            }}
            className={`py-4 px-6 rounded-[2.5rem] font-black text-sm flex items-center gap-3 active:scale-95 transition-all shadow-lg ${showAddMemberForm ? 'bg-rose-500 text-white shadow-rose-100' : 'bg-emerald-600 text-white shadow-emerald-100'}`}
          >
            {showAddMemberForm ? <X size={20} /> : 'নতুন সদস্য যোগ করুন'}
          </button>
        )}
      </div>

      {!isViewer && showAddMemberForm && (
        <div 
          className="p-6 rounded-[3rem] shadow-xl border border-white/20 space-y-6 animate-in slide-in-from-bottom-4 duration-500 relative overflow-hidden bg-cover bg-center"
          style={{ backgroundImage: 'url(https://i.postimg.cc/9XGxXRHW/6c8c53c52bf91af51f6509dbe21f5ea1.jpg)' }}
        >
          <div className="absolute inset-0 bg-white/10"></div>
          <div className="relative z-10">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xl font-[1000] text-slate-900 tracking-tight leading-none">নতুন সদস্য যোগ করুন</h3>
              <button onClick={handleCancelEdit} className="p-2 text-slate-500 hover:text-slate-900 transition-colors">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex items-center justify-between px-2">
                <label className="text-[11px] font-[1000] text-slate-600 uppercase tracking-widest flex items-center gap-2">
                  <Fingerprint size={14} className="text-blue-500" /> আইডি অটোমেটিক
                </label>
                <button 
                  type="button" 
                  onClick={() => setUseAutomaticMemberId(!useAutomaticMemberId)}
                  className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full transition-colors flex items-center gap-1.5 ${useAutomaticMemberId ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                >
                  {useAutomaticMemberId ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                  {useAutomaticMemberId ? 'চালু' : 'বন্ধ'}
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-[1000] text-slate-600 uppercase tracking-widest ml-2 flex items-center gap-2">
                  <User size={14} className="text-slate-500" /> সদস্য আইডি *
                </label>
                <div className="relative">
                  {(useAutomaticMemberId && !editingId) && (
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 font-black text-lg">NJ-</span>
                  )}
                  <input
                    required
                    type="text"
                    value={formData.memberNo}
                    onChange={e => setFormData({ ...formData, memberNo: e.target.value })}
                    className={`w-full px-6 py-4 bg-white/90 border-2 border-slate-200 rounded-3xl outline-none focus:border-emerald-500 font-black text-slate-800 text-lg shadow-inner transition-all placeholder:text-slate-400 ${useAutomaticMemberId && !editingId ? 'pl-16' : ''}`}
                    placeholder={useAutomaticMemberId && !editingId ? "অটো আইডি" : "যেমন: 001"}
                    disabled={useAutomaticMemberId && !editingId}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-[1000] text-slate-600 uppercase tracking-widest ml-2">নাম *</label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-6 py-4 bg-white/90 border-2 border-slate-200 rounded-3xl outline-none focus:border-emerald-500 font-black text-slate-800 text-lg shadow-inner transition-all placeholder:text-slate-400"
                  placeholder="সদস্যের পুরো নাম"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-[1000] text-slate-600 uppercase tracking-widest ml-2">ফোন</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-6 py-4 bg-white/90 border-2 border-slate-200 rounded-3xl outline-none focus:border-emerald-500 font-black text-slate-800 text-lg shadow-inner transition-all placeholder:text-slate-400"
                  placeholder="ফোন নাম্বার (ঐচ্ছিক)"
                  maxLength={11} 
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-[1000] text-slate-600 uppercase tracking-widest ml-2">পদবী *</label>
                <div className="relative group">
                  <select
                    value={formData.designation}
                    onChange={e => setFormData({ ...formData, designation: e.target.value })}
                    className="w-full px-6 py-4 bg-white/90 border-2 border-slate-200 rounded-3xl outline-none focus:border-emerald-500 font-black text-slate-800 text-lg appearance-none shadow-inner transition-all"
                  >
                    {COMMON_DESIGNATIONS.map((d, i) => <option key={i} value={d}>{d}</option>)}
                  </select>
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 text-emerald-500 pointer-events-none group-hover:scale-110 transition-transform">
                    <ChevronDown size={24} strokeWidth={3} />
                  </div>
                </div>
                {formData.designation === 'অন্যান্য' && (
                  <input
                    type="text"
                    value={formData.customDesignation}
                    onChange={e => setFormData({ ...formData, customDesignation: e.target.value })}
                    className="w-full mt-3 px-6 py-4 bg-white/90 border-2 border-slate-200 rounded-3xl outline-none focus:border-emerald-500 font-black text-slate-800 text-lg shadow-inner transition-all placeholder:text-slate-400"
                    placeholder="আপনার কাস্টম পদবী লিখুন"
                  />
                )}
              </div>
              
              <div className="space-y-2">
                <label className="text-[11px] font-[1000] text-slate-600 uppercase tracking-widest ml-2">যোগদানের বছর ও মাস *</label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <select
                      value={formData.startYear}
                      onChange={e => setFormData({...formData, startYear: e.target.value})}
                      className="w-full px-4 py-3 bg-white/90 border-2 border-slate-200 rounded-2xl outline-none font-bold text-base text-center text-slate-800 shadow-inner appearance-none focus:border-emerald-500"
                    >
                      {YEARS_RANGE.map(y => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"><ChevronDown size={14}/></span>
                  </div>
                  <div className="relative">
                    <select
                      value={formData.startMonth}
                      onChange={e => setFormData({...formData, startMonth: e.target.value})}
                      className="w-full px-4 py-3 bg-white/90 border-2 border-slate-200 rounded-2xl outline-none font-bold text-base text-center text-slate-800 shadow-inner appearance-none focus:border-emerald-500"
                    >
                      {MONTH_NAMES.map((m, i) => (
                        <option key={i} value={i+1}>{m}</option>
                      ))}
                    </select>
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"><ChevronDown size={14}/></span>
                  </div>
                </div>
              </div>

              {/* Monthly Amount - Year Specific */}
              <div className="space-y-4 pt-4 pb-2">
                <label className="text-[11px] font-[1000] text-slate-600 uppercase tracking-widest ml-2 flex items-center gap-2">
                  <Plus size={14} className="text-emerald-500" /> মাসিক চাঁদা নির্ধারণ *
                </label>
                <div className="bg-black/10 p-4 rounded-[2rem] border border-white/10 space-y-3">
                  {formData.yearlyAmounts.map((entry, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="relative flex-1">
                        <select
                          value={entry.year}
                          onChange={(e) => handleYearlyAmountChange(index, 'year', e.target.value)}
                          className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl outline-none font-bold text-base text-center shadow-sm appearance-none focus:border-emerald-400"
                        >
                          {YEARS_RANGE.map(y => (
                            <option key={y} value={y}>{y}</option>
                          ))}
                        </select>
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"><ChevronDown size={14}/></span>
                      </div>
                      <div className="relative flex-1">
                        <input
                          required
                          type="number"
                          min="0"
                          step="0.01"
                          value={entry.amount}
                          onChange={(e) => handleYearlyAmountChange(index, 'amount', e.target.value)}
                          className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl outline-none font-bold text-base text-center shadow-sm focus:border-emerald-400"
                          placeholder="পরিমাণ (৳)"
                        />
                      </div>
                      {formData.yearlyAmounts.length > 1 && (
                        <button type="button" onClick={() => removeYearlyAmountRow(index)} className="p-2 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-100 transition-all">
                          <X size={18} />
                        </button>
                      )}
                    </div>
                  ))}
                  <button type="button" onClick={addYearlyAmountRow} className="w-full py-3 mt-4 bg-emerald-500 text-white rounded-2xl text-xs font-black uppercase flex items-center justify-center gap-2 shadow-lg hover:bg-emerald-600 transition-all">
                    <Plus size={14} /> আরো বছর যোগ করুন
                  </button>
                </div>
              </div>


              {isAdmin && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center px-2">
                    <label className="text-[11px] font-[1000] text-slate-600 uppercase tracking-widest flex items-center gap-2">
                      <ShieldCheck size={14} className="text-emerald-500" /> মডারেটর
                    </label>
                    <button 
                      type="button" 
                      onClick={() => setFormData(prev => ({ ...prev, isModerator: !prev.isModerator }))}
                      className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full transition-colors flex items-center gap-1.5 ${formData.isModerator ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                    >
                      {formData.isModerator ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                      {formData.isModerator ? 'চালু' : 'বন্ধ'}
                    </button>
                  </div>
                </div>
              )}
              
              <button
                type="submit"
                className="w-full py-6 rounded-[2.5rem] bg-gradient-to-tr from-blue-600 to-indigo-500 text-white font-[1000] text-xl shadow-xl shadow-blue-900/50 active:scale-95 transition-all flex items-center justify-center gap-4"
              >
                <Check size={28} strokeWidth={4} /> {editingId ? 'আপডেট করুন' : 'ডাটা সেভ করুন'}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="space-y-6 pt-4">
        <div className="flex items-center gap-3 ml-2">
          <Sparkles size={20} className="text-blue-500" />
          <h4 className="text-lg font-[1000] text-slate-800 tracking-tight">সকল সদস্য</h4>
        </div>

        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
            <Search className="text-blue-500 opacity-40 group-focus-within:opacity-100 transition-all" size={24} strokeWidth={3} />
          </div>
          <input 
            type="text"
            placeholder="নাম বা আইডি দিয়ে খুঁজুন..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-16 pr-8 py-5.5 bg-gradient-to-br from-white/80 to-slate-50/80 border-2 border-slate-50 rounded-[2.5rem] outline-none focus:border-blue-500/20 shadow-[0_15px_40px_-15px_rgba(0,0,0,0.05)] font-black text-slate-700 text-lg transition-all placeholder:text-slate-300"
          />
        </div>

        <div className="space-y-4">
          {filteredMembers.length === 0 ? (
            <div className="text-center py-16 bg-white/50 border-4 border-dashed border-slate-100 rounded-[3rem]">
              <p className="text-slate-300 font-black uppercase tracking-widest text-xs">কোন সদস্য পাওয়া যায়নি</p>
            </div>
          ) : (
            filteredMembers.map(m => (
              <div key={m.id} id={`member-card-${m.id}`} className="member-card-container">
                <button 
                  onClick={() => toggleActions(m.id)} 
                  className={`w-full p-6 rounded-[2.75rem] shadow-xl shadow-black/10 border border-white/10 flex items-center gap-5 relative group transition-all active:scale-[0.98] overflow-hidden bg-cover bg-center ${isViewer ? 'cursor-default' : 'cursor-pointer'}`}
                  style={{ backgroundImage: 'url(https://i.postimg.cc/4d2SzjPL/71N1Lz-P2EWL-AC-UF894-1000-QL80.jpg)' }}
                >
                  <div className="absolute inset-0 bg-white/20"></div>
                  <div 
                    className="absolute top-0 left-0 w-2 h-full opacity-60" 
                    style={{backgroundColor: getMemberColor(m.id)}}
                  ></div>
                  <div className="flex-1 space-y-1 text-left relative z-10 pl-4">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-lg uppercase bg-black/10 text-slate-900">{m.memberNo}</span>
                      <h4 className="font-[1000] text-xl leading-snug text-slate-900">{m.name}</h4> 
                    </div>
                    <div className="flex flex-col gap-0.5 mt-1 text-slate-900">
                      <div className="flex items-center gap-1.5">
                        <Briefcase size={10} strokeWidth={3} />
                        <span className="text-[11px] font-bold">{m.designation}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Phone size={10} strokeWidth={3} />
                        <span className="text-[10px] font-bold">{m.phone || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </button>

                {/* Inline Actions and Edit Form */}
                {activeActionsId === m.id && !isViewer && (
                  <div 
                    className="bg-cover bg-center p-4 rounded-b-[2.75rem] -mt-2 space-y-4 animate-in fade-in slide-in-from-top-2 duration-500 relative overflow-hidden"
                    style={{ backgroundImage: 'url(https://i.postimg.cc/cJyD3H58/1801899_cf3c6.gif)' }}
                  >
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
                    <div className="relative z-10">
                      <div className="flex justify-around items-center gap-2 pt-2">
                        {/* Edit Button */}
                        <button onClick={() => startEdit(m)} className="flex flex-col items-center gap-2 text-slate-200 hover:text-emerald-300 transition-colors p-2 rounded-lg" title="সদস্য এডিট করুন">
                          <div className="p-3 bg-black/30 rounded-full"><Edit3 size={20} className="text-emerald-300"/></div>
                          <span className="text-[10px] font-bold">এডিট</span>
                        </button>

                        {isAdmin && (
                          <>
                            {/* Password Reset Button */}
                            <button onClick={() => handleResetPassword(m)} className="flex flex-col items-center gap-2 text-slate-200 hover:text-amber-300 transition-colors p-2 rounded-lg" title="পাসওয়ার্ড রিসেট করুন">
                              <div className="p-3 bg-black/30 rounded-full"><KeyRound size={20} className="text-amber-300"/></div>
                              <span className="text-[10px] font-bold">পাসওয়ার্ড</span>
                            </button>
                            {/* Download Member Data Button */}
                            <button onClick={() => handleDownloadMemberData(m)} className="flex flex-col items-center gap-2 text-slate-200 hover:text-blue-300 transition-colors p-2 rounded-lg" title="সদস্য ডাটা ডাউনলোড">
                              <div className="p-3 bg-black/30 rounded-full"><Download size={20} className="text-blue-300"/></div>
                              <span className="text-[10px] font-bold">ডাউনলোড</span>
                            </button>
                            {/* Delete button - no confirm */}
                            <button onClick={() => onDeleteMember(m.id)} className="flex flex-col items-center gap-2 text-slate-200 hover:text-rose-300 transition-colors p-2 rounded-lg" title="সদস্য মুছে ফেলুন">
                              <div className="p-3 bg-black/30 rounded-full"><Trash2 size={20} className="text-rose-300"/></div>
                              <span className="text-[10px] font-bold">ডিলিট</span>
                            </button>
                          </>
                        )}
                        
                        {/* Call Button - visible to all */}
                        {m.phone && (
                          <a href={`tel:${m.phone}`} className="flex flex-col items-center gap-2 text-slate-200 hover:text-sky-300 transition-colors p-2 rounded-lg" title="কল করুন">
                              <div className="p-3 bg-black/30 rounded-full"><Phone size={20} className="text-sky-300"/></div>
                              <span className="text-[10px] font-bold">কল</span>
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Inline Edit Form */}
                    {editingId === m.id && (
                      <div 
                        ref={memberFormRef} 
                        className="mt-6 p-6 rounded-[2.5rem] shadow-lg border border-white/20 animate-in fade-in slide-in-from-top-4 duration-500 relative overflow-hidden bg-cover bg-center"
                        style={{ backgroundImage: 'url(https://i.postimg.cc/9XGxXRHW/6c8c53c52bf91af51f6509dbe21f5ea1.jpg)' }}
                      >
                        <div className="absolute inset-0 bg-white/10"></div>
                        <div className="relative z-10">
                          <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-[1000] text-slate-900 tracking-tight leading-none">সদস্য এডিট করুন: {m.name}</h3>
                            <button onClick={handleCancelEdit} className="p-2 text-slate-500 hover:text-slate-900 transition-colors">
                              <X size={24} />
                            </button>
                          </div>
                          <form onSubmit={handleSubmit} className="space-y-6">
                            {/* All form fields except password management */}
                            <div className="space-y-2">
                              <label className="text-[11px] font-[1000] text-slate-600 uppercase tracking-widest ml-2 flex items-center gap-2">
                                <User size={14} className="text-slate-500" /> সদস্য আইডি *
                              </label>
                              <div className="relative">
                                <input
                                  required
                                  type="text"
                                  value={formData.memberNo}
                                  onChange={e => setFormData({ ...formData, memberNo: e.target.value })}
                                  className={`w-full px-6 py-4 bg-white/90 border-2 border-slate-200 rounded-3xl outline-none focus:border-emerald-500 font-black text-slate-800 text-lg shadow-inner transition-all placeholder:text-slate-400`}
                                  placeholder="যেমন: 001"
                                  disabled={!isAdmin} 
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <label className="text-[11px] font-[1000] text-slate-600 uppercase tracking-widest ml-2">নাম *</label>
                              <input
                                required
                                type="text"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-6 py-4 bg-white/90 border-2 border-slate-200 rounded-3xl outline-none focus:border-emerald-500 font-black text-slate-800 text-lg shadow-inner transition-all placeholder:text-slate-400"
                                placeholder="সদস্যের পুরো নাম"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[11px] font-[1000] text-slate-600 uppercase tracking-widest ml-2">ফোন</label>
                              <input
                                type="tel"
                                value={formData.phone}
                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                className="w-full px-6 py-4 bg-white/90 border-2 border-slate-200 rounded-3xl outline-none focus:border-emerald-500 font-black text-slate-800 text-lg shadow-inner transition-all placeholder:text-slate-400"
                                placeholder="ফোন নাম্বার (ঐচ্ছিক)"
                                maxLength={11} 
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[11px] font-[1000] text-slate-600 uppercase tracking-widest ml-2">পদবী *</label>
                              <div className="relative group">
                                <select
                                  value={formData.designation}
                                  onChange={e => setFormData({ ...formData, designation: e.target.value })}
                                  className="w-full px-6 py-4 bg-white/90 border-2 border-slate-200 rounded-3xl outline-none focus:border-emerald-500 font-black text-slate-800 text-lg appearance-none shadow-inner transition-all"
                                >
                                  {COMMON_DESIGNATIONS.map((d, i) => <option key={i} value={d}>{d}</option>)}
                                </select>
                                <div className="absolute right-6 top-1/2 -translate-y-1/2 text-emerald-500 pointer-events-none group-hover:scale-110 transition-transform">
                                  <ChevronDown size={24} strokeWidth={3} />
                                </div>
                              </div>
                              {formData.designation === 'অন্যান্য' && (
                                <input
                                  type="text"
                                  value={formData.customDesignation}
                                  onChange={e => setFormData({ ...formData, customDesignation: e.target.value })}
                                  className="w-full mt-3 px-6 py-4 bg-white/90 border-2 border-slate-200 rounded-3xl outline-none focus:border-emerald-500 font-black text-slate-800 text-lg shadow-inner transition-all placeholder:text-slate-400"
                                  placeholder="আপনার কাস্টম পদবী লিখুন"
                                />
                              )}
                            </div>
                            <div className="space-y-2">
                              <label className="text-[11px] font-[1000] text-slate-600 uppercase tracking-widest ml-2">যোগদানের বছর ও মাস *</label>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="relative">
                                  <select
                                    value={formData.startYear}
                                    onChange={e => setFormData({...formData, startYear: e.target.value})}
                                    className="w-full px-4 py-3 bg-white/90 border-2 border-slate-200 rounded-2xl outline-none font-bold text-base text-center text-slate-800 shadow-inner appearance-none focus:border-emerald-500"
                                  >
                                    {YEARS_RANGE.map(y => (
                                      <option key={y} value={y}>{y}</option>
                                    ))}
                                  </select>
                                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"><ChevronDown size={14}/></span>
                                </div>
                                <div className="relative">
                                  <select
                                    value={formData.startMonth}
                                    onChange={e => setFormData({...formData, startMonth: e.target.value})}
                                    className="w-full px-4 py-3 bg-white/90 border-2 border-slate-200 rounded-2xl outline-none font-bold text-base text-center text-slate-800 shadow-inner appearance-none focus:border-emerald-500"
                                  >
                                    {MONTH_NAMES.map((m, i) => (
                                      <option key={i} value={i+1}>{m}</option>
                                    ))}
                                  </select>
                                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"><ChevronDown size={14}/></span>
                                </div>
                              </div>
                            </div>
                            <div className="space-y-4 pt-4 pb-2">
                              <label className="text-[11px] font-[1000] text-slate-600 uppercase tracking-widest ml-2 flex items-center gap-2">
                                <Plus size={14} className="text-emerald-500" /> মাসিক চাঁদা নির্ধারণ *
                              </label>
                              <div className="bg-black/10 p-4 rounded-[2rem] border border-white/10 space-y-3">
                                {formData.yearlyAmounts.map((entry, index) => (
                                  <div key={index} className="flex items-center gap-3">
                                    <div className="relative flex-1">
                                      <select
                                        value={entry.year}
                                        onChange={(e) => handleYearlyAmountChange(index, 'year', e.target.value)}
                                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl outline-none font-bold text-base text-center shadow-sm appearance-none focus:border-emerald-400"
                                      >
                                        {YEARS_RANGE.map(y => (
                                          <option key={y} value={y}>{y}</option>
                                        ))}
                                      </select>
                                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"><ChevronDown size={14}/></span>
                                    </div>
                                    <div className="relative flex-1">
                                      <input
                                        required
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={entry.amount}
                                        onChange={(e) => handleYearlyAmountChange(index, 'amount', e.target.value)}
                                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl outline-none font-bold text-base text-center shadow-sm focus:border-emerald-400"
                                        placeholder="পরিমাণ (৳)"
                                      />
                                    </div>
                                    {formData.yearlyAmounts.length > 1 && (
                                      <button type="button" onClick={() => removeYearlyAmountRow(index)} className="p-2 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-100 transition-all">
                                        <X size={18} />
                                      </button>
                                    )}
                                  </div>
                                ))}
                                <button type="button" onClick={addYearlyAmountRow} className="w-full py-3 mt-4 bg-emerald-500 text-white rounded-2xl text-xs font-black uppercase flex items-center justify-center gap-2 shadow-lg hover:bg-emerald-600 transition-all">
                                  <Plus size={14} /> আরো বছর যোগ করুন
                                </button>
                              </div>
                            </div>
                            {isAdmin && (
                              <div className="space-y-2">
                                <div className="flex justify-between items-center px-2">
                                  <label className="text-[11px] font-[1000] text-slate-600 uppercase tracking-widest flex items-center gap-2">
                                    <ShieldCheck size={14} className="text-emerald-500" /> মডারেটর
                                  </label>
                                  <button 
                                    type="button" 
                                    onClick={() => setFormData(prev => ({ ...prev, isModerator: !prev.isModerator }))}
                                    className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full transition-colors flex items-center gap-1.5 ${formData.isModerator ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                                  >
                                    {formData.isModerator ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                                    {formData.isModerator ? 'চালু' : 'বন্ধ'}
                                  </button>
                                </div>
                              </div>
                            )}
                            <button
                              type="submit"
                              className="w-full py-6 rounded-[2.5rem] bg-gradient-to-tr from-blue-600 to-indigo-500 text-white font-[1000] text-xl shadow-xl shadow-blue-900/50 active:scale-95 transition-all flex items-center justify-center gap-4"
                            >
                              <Check size={28} strokeWidth={4} /> আপডেট করুন
                            </button>
                          </form>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
