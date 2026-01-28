import React from 'react';
import { MosqueState } from '../types';
import { 
  Bell, 
  ShieldCheck, 
  CircleDollarSign, 
  ChevronRight, 
  CalendarDays,
  CheckCircle2,
  AlertCircle,
  Clock
} from 'lucide-react';

interface Props {
  state: MosqueState;
  // FIX: Added 'VIEWER' to the role union type to match the type of the currentUser state from App.tsx.
  currentUser: { role: 'ADMIN' | 'MODERATOR' | 'MEMBER' | 'VIEWER', id: string, name: string };
  onNavigate: (tab: string) => void;
}

const backgroundUrl = "https://i.postimg.cc/htcx8sjV/feliz-noche.gif";

const NotificationMenu: React.FC<Props> = ({ state, currentUser, onNavigate }) => {
  const getNotifications = () => {
    const notifications = [];
    const today = new Date();
    const day = today.getDate();
    const monthName = today.toLocaleDateString('bn-BD', { month: 'long' });

    // Admin Notifications: Pending Moderator Entries
    if (currentUser.role === 'ADMIN') {
      const pending = state.transactions.filter(t => t.status === 'PENDING');
      if (pending.length > 0) {
        notifications.push({
          id: 'admin_pending',
          title: 'মডারেটর এন্ট্রি এপ্রুভাল',
          description: `${pending.length}টি নতুন এন্ট্রি আপনার অনুমোদনের অপেক্ষায় আছে।`,
          icon: ShieldCheck,
          color: 'text-amber-300',
          bg: 'bg-amber-500/10',
          action: () => onNavigate('moderator_entries'),
          time: 'এখনই চেক করুন'
        });
      }
    }

    // User/Moderator Notifications: Subscription Reminder (Day 1-5)
    if (currentUser.role !== 'ADMIN') {
      if (day >= 1 && day <= 5) {
        notifications.push({
          id: 'monthly_reminder',
          title: 'মাসিক চাঁদা রিমাইন্ডার',
          description: `${monthName} মাসের চাঁদা পরিশোধের সময় হয়েছে। অনুগ্রহ করে চাঁদা পরিশোধ করুন।`,
          icon: CircleDollarSign,
          color: 'text-emerald-300',
          bg: 'bg-emerald-500/10',
          action: () => onNavigate('subscription'),
          time: `${monthName} ১-৫ তারিখ`
        });
      }
    }

    // Generic Welcome Notification if no others
    if (notifications.length === 0) {
      notifications.push({
        id: 'welcome',
        title: 'মসজিদ অ্যাপে স্বাগতম',
        description: `আসসালামু আলাইকুম, ${currentUser.name}! অ্যাপে বর্তমানে কোনো নতুন নোটিফিকেশন নেই।`,
        icon: Bell,
        color: 'text-blue-300',
        bg: 'bg-blue-500/10',
        action: null,
        time: 'আজ'
      });
    }

    return notifications;
  };

  const notifications = getNotifications();

  return (
    <div className="relative rounded-t-[2.5rem] overflow-hidden -mt-4">
      <div className="absolute inset-0 bg-cover bg-center z-0" style={{ backgroundImage: `url(${backgroundUrl})` }}></div>
      <div className="absolute inset-0 bg-black/20 z-0"></div>
      <div className="relative z-10 p-6 space-y-8 pb-32">
        <div className="flex justify-between items-end mb-4 text-white">
          <div>
            <h2 className="text-3xl font-[1000] tracking-tighter leading-none">নোটিফিকেশন</h2>
            <p className="text-[11px] text-blue-300 font-[1000] uppercase tracking-widest mt-2">আপনার গুরুত্বপূর্ণ আপডেট সমূহ</p>
          </div>
          <div className="w-16 h-16 bg-blue-500/10 rounded-[1.75rem] flex items-center justify-center text-blue-300 shadow-inner border border-blue-500/20">
            <Bell size={32} strokeWidth={2.5} />
          </div>
        </div>

        <div className="space-y-4">
          {notifications.map((n) => (
            <button
              key={n.id}
              onClick={() => n.action && n.action()}
              className={`w-full text-left bg-black/20 backdrop-blur-xl p-6 rounded-[2.75rem] shadow-xl border border-white/10 flex items-start gap-5 transition-all active:scale-[0.98] group relative overflow-hidden ${n.action ? 'hover:border-blue-500/30' : ''}`}
            >
              <div className={`p-4 rounded-2xl shrink-0 ${n.bg} ${n.color}`}>
                <n.icon size={24} strokeWidth={2.5} />
              </div>
              <div className="flex-1 space-y-1 pt-1">
                <div className="flex justify-between items-center">
                  <h4 className="font-black text-slate-100 text-sm">{n.title}</h4>
                  <span className="text-[9px] font-bold text-slate-400 uppercase">{n.time}</span>
                </div>
                <p className="text-[12px] font-bold text-slate-300 leading-tight">
                  {n.description}
                </p>
                {n.action && (
                  <div className="flex items-center gap-1 text-[10px] font-black text-blue-400 uppercase pt-2">
                    বিস্তারিত দেখুন <ChevronRight size={12} strokeWidth={3} />
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>

        <div className="p-7 bg-blue-900/20 rounded-[2.5rem] border-2 border-blue-500/20 flex gap-4 animate-in slide-in-from-bottom-4 duration-1000">
          <div className="p-2 bg-black/20 rounded-xl text-blue-400 shadow-sm shrink-0">
            <CalendarDays size={20} />
          </div>
          <p className="text-[12px] font-bold text-blue-100 leading-tight">
            টিপস: নিয়মিত নোটিফিকেশন চেক করুন এবং প্রতি মাসের ৫ তারিখের মধ্যে মাসিক চাঁদা পরিশোধ করে মসজিদ ফান্ড সমৃদ্ধ করুন।
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotificationMenu;