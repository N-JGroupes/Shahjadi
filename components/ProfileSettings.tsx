import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Member, DEFAULT_LOGO_URL, Transaction } from '../types';
import { UserCircle, Lock, Eye, EyeOff, KeyRound, CheckCircle2, AlertCircle, Save, ArrowLeft, Image as ImageIcon, RotateCcw, Upload, FileDown, Database, MessageCircle, Download, ChevronDown, Copy } from 'lucide-react';

interface Props {
  currentUser: { role: 'ADMIN' | 'MODERATOR' | 'MEMBER' | 'VIEWER', id: string, name: string };
  members: Member[];
  transactions?: Transaction[]; // Added optional transactions prop
  adminPassword: string;
  onUpdateMember: (member: Member) => void;
  onUpdateAdminPassword: (newPass: string) => void;
  onUpdateMemberProfileImage: (memberId: string, url: string) => void; 
  onUpdateAdminProfileImage: (url: string) => void; 
  adminProfileImageUrl: string;
  onRestoreSingleMemberData?: (member: Member, transactions: Transaction[]) => void; // NEW
}

const MONTH_NAMES = ["জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন", "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"];
const YEARS = Array.from({ length: 10 }, (_, i) => (new Date().getFullYear() - 5 + i).toString());

const backgroundUrl = "https://i.postimg.cc/VvdQYyBQ/v_B6e_Cf.gif";
const sectionBackgroundUrl = "https://i.postimg.cc/26Xjd72G/5219903_79263.gif";

const ProfileSettings: React.FC<Props> = ({ 
  currentUser, 
  members,
  transactions = [], 
  adminPassword, 
  onUpdateMember, 
  onUpdateAdminPassword,
  onUpdateMemberProfileImage,
  onUpdateAdminProfileImage,
  adminProfileImageUrl,
  onRestoreSingleMemberData
}) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null, message: string }>({ type: null, message: '' });

  // Moderator Backup Selection State
  const [backupMonth, setBackupMonth] = useState((new Date().getMonth() + 1).toString());
  const [backupYear, setBackupYear] = useState(new Date().getFullYear().toString());

  const profileImageInputRef = useRef<HTMLInputElement>(null);
  const dataRestoreInputRef = useRef<HTMLInputElement>(null); // NEW ref for restore

  const initialProfileImage = currentUser.role === 'ADMIN' 
    ? adminProfileImageUrl 
    : members.find(m => m.id === currentUser.id)?.profileImageUrl;

  const [tempProfileImageUrl, setTempProfileImageUrl] = useState(initialProfileImage || '');

  // Get current member info to include ID in WhatsApp message
  const memberInfo = useMemo(() => members.find(m => m.id === currentUser.id), [members, currentUser.id]);

  useEffect(() => {
    if (currentUser.role === 'ADMIN') {
      setTempProfileImageUrl(adminProfileImageUrl || '');
    } else {
      setTempProfileImageUrl(members.find(m => m.id === currentUser.id)?.profileImageUrl || '');
    }
  }, [currentUser.id, adminProfileImageUrl, members]);


  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ type: null, message: '' });

    let actualCurrentPassword = '';
    let targetUser: Member | undefined;

    if (currentUser.role === 'ADMIN') {
      actualCurrentPassword = adminPassword;
    } else {
      targetUser = members.find(m => m.id === currentUser.id);
      actualCurrentPassword = targetUser?.password || 'admin';
    }

    if (currentPassword !== actualCurrentPassword) {
      setStatus({ type: 'error', message: 'বর্তমান পাসওয়ার্ড ভুল দিয়েছেন।' });
      return;
    }

    if (newPassword.length < 4) {
      setStatus({ type: 'error', message: 'নতুন পাসওয়ার্ড কমপক্ষে ৪ অক্ষরের হতে হবে।' });
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setStatus({ type: 'error', message: 'নতুন পাসওয়ার্ড এবং কনফার্ম পাসওয়ার্ড ম্যাচ করেনি।' });
      return;
    }

    if (currentUser.role === 'ADMIN') {
      onUpdateAdminPassword(newPassword);
    } else if (targetUser) {
      onUpdateMember({ ...targetUser, password: newPassword });
    }

    setStatus({ type: 'success', message: 'পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে!' });
    setCurrentPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
    setTimeout(() => setStatus({ type: null, message: '' }), 3000);
  };

  const handleProfileImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) { 
        alert('ছবিটি ১ মেগাবাইটের চেয়ে বড় হতে পারবে না।');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setTempProfileImageUrl(base64String); 

        if (currentUser.role === 'ADMIN') {
          onUpdateAdminProfileImage(base64String);
        } else {
          onUpdateMemberProfileImage(currentUser.id, base64String);
        }
        setStatus({ type: 'success', message: 'প্রোফাইল ছবি সফলভাবে আপলোড হয়েছে!' });
        setTimeout(() => setStatus({ type: null, message: '' }), 3000);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResetProfileImage = () => {
    if (confirm('আপনি কি আপনার প্রোফাইল ছবিটি মুছে ফেলতে চান?')) {
      if (currentUser.role === 'ADMIN') {
        onUpdateAdminProfileImage('');
      } else {
        onUpdateMemberProfileImage(currentUser.id, '');
      }
      setTempProfileImageUrl(''); 
      setStatus({ type: 'success', message: 'প্রোফাইল ছবি রিসেট করা হয়েছে।' });
      setTimeout(() => setStatus({ type: null, message: '' }), 3000);
    }
  };

  // NEW: Handle Data Restore from File
  const handleDataRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const data = JSON.parse(content);

        // Basic validation
        if (data.type === 'single_member_backup' && data.member && Array.isArray(data.transactions)) {
          if (onRestoreSingleMemberData) {
            onRestoreSingleMemberData(data.member, data.transactions);
            setStatus({ type: 'success', message: 'আপনার ডাটা সফলভাবে রিস্টোর করা হয়েছে।' });
            setTimeout(() => setStatus({ type: null, message: '' }), 3000);
          }
        } else {
          throw new Error('Invalid format');
        }
      } catch (err) {
        setStatus({ type: 'error', message: 'ভুল ফাইল নির্বাচন করেছেন। সঠিক ব্যাকআপ ফাইল দিন।' });
      }
    };
    reader.readAsText(file);
    // Clear input
    e.target.value = '';
  };

  // NEW: Handle Request Backup via WhatsApp
  const handleRequestBackup = () => {
    const adminPhone = '8801750242240';
    const memberId = memberInfo ? memberInfo.memberNo : 'Unknown ID';
    const memberName = currentUser.name;
    // Updated text to 'নতুন' as requested
    const message = `আসসালামু আলাইকুম, আমি ${memberName} (ID: ${memberId})। আমার অ্যাপের নতুন হিসাবের ব্যাকআপ ফাইলটি প্রয়োজন।`;
    
    const whatsappUrl = `https://wa.me/${adminPhone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const getBackupData = () => {
    const selectedPeriod = `${backupYear}-${backupMonth.padStart(2, '0')}`;
    
    // Filter transactions created by the current user for the selected month/year
    const myEntries = transactions.filter(t => 
        t.createdBy === currentUser.id && 
        (t.calculationDate || t.date).startsWith(selectedPeriod)
    );
    
    if (myEntries.length === 0) {
      alert('এই মাসে আপনার তৈরি কোনো এন্ট্রি পাওয়া যায়নি।');
      return null;
    }

    return {
      type: 'moderator_monthly_report', // Compatible with Admin Import
      exportedAt: new Date().toISOString(),
      month: backupMonth,
      year: backupYear,
      moderator: {
        id: currentUser.id,
        name: currentUser.name,
        serial: memberInfo?.moderatorSerial
      },
      transactions: myEntries
    };
  };

  // NEW: Handle Download My Entries Backup (For Moderators) with Month Selection
  const handleDownloadMyEntries = () => {
    const backupData = getBackupData();
    if (!backupData) return;

    try {
      const dataStr = JSON.stringify(backupData, null, 2);
      const blob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const monthName = MONTH_NAMES[parseInt(backupMonth)-1];
      // Fixed Regex: Use regex literal
      const sanitizedName = currentUser.name.replace(/\s+/g, '_');
      link.download = `My_Entries_${sanitizedName}_${monthName}_${backupYear}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setStatus({ type: 'success', message: `${MONTH_NAMES[parseInt(backupMonth)-1]} ${backupYear} এর ব্যাকআপ ডাউনলোড হয়েছে।` });
      setTimeout(() => setStatus({ type: null, message: '' }), 3000);
    } catch (e) {
      alert('ডাউনলোড করতে সমস্যা হয়েছে।');
    }
  };

  // NEW: Handle Copy My Entries Code (For APK reliability)
  const handleCopyMyEntries = () => {
    const backupData = getBackupData();
    if (!backupData) return;

    const dataStr = JSON.stringify(backupData);
    navigator.clipboard.writeText(dataStr).then(() => {
        setStatus({ type: 'success', message: 'ব্যাকআপ কোড কপি হয়েছে! এখন এডমিনকে পাঠান।' });
        setTimeout(() => setStatus({ type: null, message: '' }), 4000);
    }).catch(() => {
        alert('কপি করতে সমস্যা হয়েছে।');
    });
  };


  const getRoleBengali = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'এডমিন';
      case 'MODERATOR': return 'মডারেটর';
      case 'MEMBER': return 'সদস্য';
      case 'VIEWER': return 'পর্যবেক্ষক';
      default: return role;
    }
  };

  const finalDisplayedImageUrl = tempProfileImageUrl || DEFAULT_LOGO_URL;


  return (
    <div className="relative rounded-t-[2.5rem] overflow-hidden -mt-4">
      <div className="absolute inset-0 bg-cover bg-center z-0" style={{ backgroundImage: `url(${backgroundUrl})` }}></div>
      <div className="absolute inset-0 bg-black/20 z-0"></div>
      <div className="relative z-10 p-7 pb-32 space-y-8 animate-in fade-in duration-500 text-white">
        <div className="text-center space-y-4 mb-4">
          <div className="inline-flex p-5 bg-sky-500/10 text-sky-400 rounded-[2.5rem] shadow-inner border border-sky-500/20 mb-2">
            <UserCircle size={48} strokeWidth={2.5} />
          </div>
          <h2 className="text-4xl font-[1000] tracking-tighter leading-none">আমার প্রোফাইল</h2>
          <p className="text-[11px] text-sky-300 font-[1000] uppercase tracking-[0.4em]">{getRoleBengali(currentUser.role)} ({currentUser.name})</p>
        </div>

        {status.type && (
          <div className={`p-7 rounded-[3rem] flex items-start gap-5 animate-in zoom-in-95 ${status.type === 'success' ? 'bg-emerald-900/30 border-2 border-emerald-500/20 text-emerald-100' : 'bg-rose-900/30 border-2 border-rose-500/20 text-rose-100'}`}>
            <div className={`p-3 rounded-2xl ${status.type === 'success' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
              {status.type === 'success' ? <CheckCircle2 size={28} /> : <AlertCircle size={28} />}
            </div>
            <p className="font-bold text-base leading-tight pt-1">{status.message}</p>
          </div>
        )}

        {/* Profile Picture Section */}
        <div className="rounded-[3.5rem] shadow-xl border border-sky-500/20 relative overflow-hidden">
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${sectionBackgroundUrl})` }}></div>
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative z-10 p-9 space-y-7">
            <h3 className="font-black text-slate-100 uppercase tracking-widest text-base">প্রোফাইল ছবি পরিবর্তন</h3>
            <div className="flex flex-col sm:flex-row items-center gap-7 p-6 bg-black/20 rounded-[2.5rem] border border-white/10">
              <div className="w-24 h-24 bg-slate-900 rounded-full p-2 border-2 border-sky-500/20 shadow-sm flex items-center justify-center overflow-hidden shrink-0">
                <img 
                  src={finalDisplayedImageUrl} 
                  className="w-full h-full object-cover rounded-full" 
                  alt="Profile Preview"
                  onError={(e) => e.currentTarget.src = DEFAULT_LOGO_URL}
                />
              </div>
              <div className="flex-1 w-full space-y-3">
                <input 
                  type="file" 
                  ref={profileImageInputRef}
                  onChange={handleProfileImageUpload}
                  accept="image/*"
                  className="hidden"
                />
                <button 
                  onClick={() => profileImageInputRef.current?.click()}
                  className="w-full py-4 bg-sky-600 text-white rounded-2xl text-[12px] font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-lg shadow-sky-900/50 active:scale-95 transition-all"
                >
                  <Upload size={18} /> ছবি আপলোড
                </button>
                {tempProfileImageUrl && (
                  <button onClick={handleResetProfileImage} className="w-full py-2 text-rose-400 font-black text-[11px] uppercase flex items-center justify-center gap-2">
                    <RotateCcw size={14} /> ছবি রিসেট করুন
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* NEW: Restore Data Section (Only visible for Members/Moderators) */}
        {currentUser.role !== 'ADMIN' && onRestoreSingleMemberData && (
          <div className="rounded-[3.5rem] shadow-xl border border-indigo-500/20 relative overflow-hidden">
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${sectionBackgroundUrl})` }}></div>
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="relative z-10 p-9 space-y-7">
              <h3 className="font-black text-slate-100 uppercase tracking-widest text-base flex items-center gap-2">
                <Database size={18} className="text-indigo-400" /> আমার ডাটা রিস্টোর
              </h3>
              <div className="bg-black/20 p-6 rounded-[2.5rem] border border-white/10 space-y-4">
                <p className="text-xs text-slate-300 font-bold leading-relaxed">
                  অ্যাডমিন থেকে পাওয়া আপনার ব্যাকআপ ফাইলটি এখানে আপলোড করে আপনার নতুন হিসাব রিস্টোর করুন।
                </p>
                <input 
                  type="file" 
                  ref={dataRestoreInputRef}
                  onChange={handleDataRestore}
                  accept=".json"
                  className="hidden"
                />
                <div className="flex flex-col gap-3">
                    <button 
                      onClick={() => dataRestoreInputRef.current?.click()}
                      className="w-full py-4 bg-indigo-600 text-white rounded-2xl text-[12px] font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-lg shadow-indigo-900/50 active:scale-95 transition-all"
                    >
                      <FileDown size={18} /> ব্যাকআপ ফাইল আপলোড করুন
                    </button>
                    
                    {/* Request Backup via WhatsApp Button */}
                    <button 
                      onClick={handleRequestBackup}
                      className="w-full py-4 bg-emerald-500 text-white rounded-2xl text-[12px] font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-lg shadow-emerald-900/50 active:scale-95 transition-all"
                    >
                      <MessageCircle size={18} /> ব্যাকআপ ফাইল চাই (WhatsApp)
                    </button>

                    {/* NEW: Download My Entries Backup (Only for Moderators) */}
                    {currentUser.role === 'MODERATOR' && (
                      <div className="space-y-3 pt-3 mt-2 border-t-2 border-indigo-500/20">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center flex items-center justify-center gap-2">
                            <Download size={14} /> মডারেটর এন্ট্রি ব্যাকআপ
                        </p>
                        
                        <div className="grid grid-cols-2 gap-3">
                            <div className="relative group">
                                <select 
                                    value={backupMonth}
                                    onChange={e => setBackupMonth(e.target.value)}
                                    className="w-full px-4 py-3 bg-black/20 border border-indigo-500/30 rounded-2xl text-xs font-bold text-slate-200 outline-none appearance-none shadow-sm focus:border-amber-400 transition-all"
                                >
                                    {MONTH_NAMES.map((m, i) => <option key={i} value={i+1}>{m}</option>)}
                                </select>
                                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            </div>
                            <div className="relative group">
                                <select 
                                    value={backupYear}
                                    onChange={e => setBackupYear(e.target.value)}
                                    className="w-full px-4 py-3 bg-black/20 border border-indigo-500/30 rounded-2xl text-xs font-bold text-slate-200 outline-none appearance-none shadow-sm focus:border-amber-400 transition-all"
                                >
                                    {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                                </select>
                                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            </div>
                        </div>

                        <div className="flex gap-2">
                          <button 
                              onClick={handleDownloadMyEntries}
                              className="flex-1 py-4 bg-slate-600 text-white rounded-2xl text-[12px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all"
                          >
                              <Download size={18} /> ফাইল ডাউনলোড
                          </button>
                          <button 
                              onClick={handleCopyMyEntries}
                              className="flex-1 py-4 bg-amber-500 text-white rounded-2xl text-[12px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all"
                          >
                              <Copy size={18} /> ব্যাকআপ কোড কপি
                          </button>
                        </div>
                      </div>
                    )}
                </div>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="rounded-[3.5rem] shadow-2xl border border-sky-500/20 relative overflow-hidden">
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${sectionBackgroundUrl})` }}></div>
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative z-10 p-9 space-y-7">
            <h3 className="font-black text-slate-100 uppercase tracking-widest text-base">পাসওয়ার্ড পরিবর্তন</h3>

            <div className="space-y-4">
              <div className="relative group">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-400 transition-colors">
                  <KeyRound size={20} strokeWidth={3} />
                </div>
                <input
                  required
                  type={showCurrentPass ? "text" : "password"}
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  className="w-full pl-14 pr-14 py-5 bg-black/20 border border-white/10 focus:border-sky-500/50 rounded-[2rem] outline-none font-bold text-slate-100 text-lg transition-all placeholder:text-slate-400 shadow-inner focus:bg-black/40"
                  placeholder="বর্তমান পাসওয়ার্ড"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPass(!showCurrentPass)}
                  className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 hover:text-sky-300 transition-colors"
                >
                  {showCurrentPass ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              <div className="relative group">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-400 transition-colors">
                  <Lock size={20} strokeWidth={3} />
                </div>
                <input
                  required
                  type={showNewPass ? "text" : "password"}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full pl-14 pr-14 py-5 bg-black/20 border border-white/10 focus:border-sky-500/50 rounded-[2rem] outline-none font-bold text-slate-100 text-lg transition-all placeholder:text-slate-400 shadow-inner focus:bg-black/40"
                  placeholder="নতুন পাসওয়ার্ড"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPass(!showNewPass)}
                  className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 hover:text-sky-300 transition-colors"
                >
                  {showNewPass ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              <div className="relative group">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-400 transition-colors">
                  <Lock size={20} strokeWidth={3} />
                </div>
                <input
                  required
                  type={showNewPass ? "text" : "password"} // Keep consistent with new password visibility
                  value={confirmNewPassword}
                  onChange={e => setConfirmNewPassword(e.target.value)}
                  className="w-full pl-14 pr-14 py-5 bg-black/20 border border-white/10 focus:border-sky-500/50 rounded-[2rem] outline-none font-bold text-slate-100 text-lg transition-all placeholder:text-slate-400 shadow-inner focus:bg-black/40"
                  placeholder="নতুন পাসওয়ার্ড নিশ্চিত করুন"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-6 rounded-[2.5rem] bg-gradient-to-tr from-sky-600 to-blue-500 text-white font-[1000] text-xl shadow-xl shadow-sky-900/50 active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              <Save size={26} strokeWidth={3} /> পাসওয়ার্ড পরিবর্তন করুন
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileSettings;
