
import React from 'react';
import { Transaction, Category, Member } from '../types';

interface Props {
  month: string;
  year: string;
  transactions: Transaction[];
  members: Member[];
}

const MONTH_NAMES = ["জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন", "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"];

const PrintableReport: React.FC<Props> = ({ month, year, transactions, members }) => {
  const selectedPeriod = `${year}-${month.padStart(2, '0')}`;
  const filtered = transactions.filter(t => (t.calculationDate || t.date).startsWith(selectedPeriod));
  
  const totalIncome = filtered.filter(t => t.type === 'INCOME').reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = filtered.filter(t => t.type === 'EXPENSE').reduce((sum, t) => sum + t.amount, 0);
  const balance = totalIncome - totalExpense;

  const formatDateToBengali = (dateStr: string) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return date.toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    <div id="printable-report" className="hidden print:block p-10 bg-white text-slate-900 font-sans">
      <style>{`
        @media print {
          @page { size: A4; margin: 1cm; }
          body { -webkit-print-color-adjust: exact; }
          .no-print { display: none; }
        }
      `}</style>

      {/* Header */}
      <div className="text-center border-b-4 border-emerald-600 pb-6 mb-8">
        <h1 className="text-4xl font-bold text-emerald-800 mb-1">পুরিয়া জামে মসজিদ</h1>
        <p className="text-lg text-slate-600 font-bold uppercase tracking-widest">মাসিক আয়-ব্যয় প্রতিবেদন</p>
        <div className="mt-4 inline-block bg-slate-100 px-6 py-2 rounded-full font-bold text-slate-700">
          মাস: {MONTH_NAMES[parseInt(month) - 1]}, {year} ইং
        </div>
      </div>

      {/* Summary Section */}
      <div className="grid grid-cols-3 gap-6 mb-10">
        <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100 text-center">
          <p className="text-xs font-bold text-emerald-600 uppercase mb-1">মোট আয়</p>
          <p className="text-3xl font-black text-emerald-800">৳ {totalIncome.toLocaleString()}</p>
        </div>
        <div className="bg-rose-50 p-6 rounded-3xl border border-rose-100 text-center">
          <p className="text-xs font-bold text-rose-600 uppercase mb-1">মোট ব্যয়</p>
          <p className="text-3xl font-black text-rose-800">৳ {totalExpense.toLocaleString()}</p>
        </div>
        <div className={`${balance >= 0 ? 'bg-blue-50 border-blue-100 text-blue-800' : 'bg-amber-50 border-amber-100 text-amber-800'} p-6 rounded-3xl border text-center`}>
          <p className="text-xs font-bold uppercase mb-1">অবশিষ্ট ব্যালেন্স</p>
          <p className="text-3xl font-black">৳ {balance.toLocaleString()}</p>
        </div>
      </div>

      {/* Details Table */}
      <div className="space-y-8">
        <div>
          <h3 className="text-xl font-bold text-emerald-700 mb-4 flex items-center gap-2">
            <span className="w-2 h-6 bg-emerald-500 rounded-full"></span>
            আয়ের বিবরণ
          </h3>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-100 text-left">
                <th className="p-4 border border-slate-200">তারিখ</th>
                <th className="p-4 border border-slate-200">রশিদ</th>
                <th className="p-4 border border-slate-200">খাত</th>
                <th className="p-4 border border-slate-200">বিবরণ</th>
                <th className="p-4 border border-slate-200 text-right">টাকা</th>
              </tr>
            </thead>
            <tbody>
              {filtered.filter(t => t.type === 'INCOME').map((t, idx) => (
                <tr key={idx} className="border-b border-slate-100">
                  <td className="p-4 border border-slate-200 text-sm whitespace-nowrap">{formatDateToBengali(t.date)}</td>
                  <td className="p-4 border border-slate-200 text-sm font-bold text-slate-500">{t.receiptNo || '-'}</td>
                  <td className="p-4 border border-slate-200 font-bold">{t.category}</td>
                  <td className="p-4 border border-slate-200 text-sm text-slate-600">{t.description || '-'}</td>
                  <td className="p-4 border border-slate-200 text-right font-bold text-emerald-700">৳ {t.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div>
          <h3 className="text-xl font-bold text-rose-700 mb-4 flex items-center gap-2">
            <span className="w-2 h-6 bg-rose-500 rounded-full"></span>
            ব্যয়ের বিবরণ
          </h3>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-100 text-left">
                <th className="p-4 border border-slate-200">তারিখ</th>
                <th className="p-4 border border-slate-200">রশিদ</th>
                <th className="p-4 border border-slate-200">খাত</th>
                <th className="p-4 border border-slate-200">বিবরণ</th>
                <th className="p-4 border border-slate-200 text-right">টাকা</th>
              </tr>
            </thead>
            <tbody>
              {filtered.filter(t => t.type === 'EXPENSE').map((t, idx) => (
                <tr key={idx} className="border-b border-slate-100">
                  <td className="p-4 border border-slate-200 text-sm whitespace-nowrap">{formatDateToBengali(t.date)}</td>
                  <td className="p-4 border border-slate-200 text-sm font-bold text-slate-500">{t.receiptNo || '-'}</td>
                  <td className="p-4 border border-slate-200 font-bold">{t.category}</td>
                  <td className="p-4 border border-slate-200 text-sm text-slate-600">{t.description || '-'}</td>
                  <td className="p-4 border border-slate-200 text-right font-bold text-rose-700">৳ {t.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Signature */}
      <div className="mt-20 flex justify-between px-10">
        <div className="text-center">
          <div className="w-48 border-t border-slate-400 pt-2 font-bold text-slate-600">কোষাধ্যক্ষ</div>
        </div>
        <div className="text-center">
          <div className="w-48 border-t border-slate-400 pt-2 font-bold text-slate-600">সভাপতি / সেক্রেটারি</div>
        </div>
      </div>
      
      <div className="mt-12 text-center text-[10px] text-slate-400 uppercase tracking-widest italic">
        Generated by Puria Jame Masjid Management System • {new Date().toLocaleString('bn-BD')}
      </div>
    </div>
  );
};

export default PrintableReport;
