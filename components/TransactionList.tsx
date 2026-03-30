
import React, { useState } from 'react';
import { Transaction, Project } from '../types';
import { Plus, Search, TrendingUp, TrendingDown, Wallet, Calendar, Tag, ArrowRightLeft, Landmark, DollarSign } from 'lucide-react';

interface TransactionListProps {
  transactions: Transaction[];
  projects: Project[];
  onAdd: () => void;
}

const TransactionList: React.FC<TransactionListProps> = ({ transactions, projects, onAdd }) => {
  const [filter, setFilter] = useState('');

  const sorted = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const filtered = sorted.filter(t => 
    t.description.toLowerCase().includes(filter.toLowerCase()) ||
    t.category.toLowerCase().includes(filter.toLowerCase())
  );

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const netBalance = totalIncome - totalExpense;

  return (
    <div className="space-y-6 pb-24 animate-in fade-in duration-500 max-w-5xl mx-auto">
      <div className="flex justify-between items-center px-1">
        <div>
          <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Proje Kasası</h1>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Nakit Akış Yönetimi</p>
        </div>
        <button 
          onClick={onAdd}
          className="bg-slate-900 text-white p-3 md:px-6 rounded-2xl shadow-xl active:scale-95 transition-all flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          <span className="hidden md:inline text-xs font-black uppercase tracking-widest">Kayıt Ekle</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-emerald-600 p-6 rounded-[2.5rem] shadow-lg shadow-emerald-100 text-white relative overflow-hidden group">
          <DollarSign className="absolute -right-2 -bottom-2 w-20 h-20 opacity-10 group-hover:scale-125 transition-transform" />
          <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-70 mb-2">Toplam Tahsilat</p>
          <p className="text-2xl font-black">{totalIncome.toLocaleString('tr-TR')} TL</p>
        </div>
        <div className="bg-rose-600 p-6 rounded-[2.5rem] shadow-lg shadow-rose-100 text-white relative overflow-hidden group">
          <TrendingDown className="absolute -right-2 -bottom-2 w-20 h-20 opacity-10 group-hover:scale-125 transition-transform" />
          <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-70 mb-2">Toplam Harcama</p>
          <p className="text-2xl font-black">{totalExpense.toLocaleString('tr-TR')} TL</p>
        </div>
        <div className={`p-6 rounded-[2.5rem] shadow-lg text-white relative overflow-hidden group ${netBalance >= 0 ? 'bg-slate-900 shadow-slate-100' : 'bg-orange-600 shadow-orange-100'}`}>
          <ArrowRightLeft className="absolute -right-2 -bottom-2 w-20 h-20 opacity-10 group-hover:scale-125 transition-transform" />
          <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-70 mb-2">Net Durum</p>
          <p className="text-2xl font-black">{netBalance.toLocaleString('tr-TR')} TL</p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
        <input 
          type="text" 
          placeholder="İşlem tanımı, kategori veya proje ara..." 
          className="w-full pl-14 pr-4 py-5 bg-white border border-slate-200 rounded-[2rem] focus:outline-none focus:ring-2 focus:ring-slate-900 shadow-sm text-sm font-medium"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-[3rem] border border-dashed border-slate-200">
            <Wallet className="w-16 h-16 text-slate-100 mx-auto mb-4" />
            <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">Kayıt bulunamadı</p>
          </div>
        ) : (
          filtered.map(t => {
            const project = projects.find(p => p.id === t.projectId);
            return (
              <div key={t.id} className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5 hover:border-slate-300 transition-all group">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${t.type === 'income' ? 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white' : 'bg-rose-50 text-rose-600 group-hover:bg-rose-600 group-hover:text-white'}`}>
                  {t.type === 'income' ? <TrendingUp className="w-7 h-7" /> : <TrendingDown className="w-7 h-7" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-sm font-black text-slate-800 truncate uppercase tracking-tight">{t.description}</h4>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{project?.name}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-base font-black whitespace-nowrap ${t.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {t.type === 'income' ? '+' : '-'}{t.amount.toLocaleString('tr-TR')} TL
                      </p>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{t.category}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-50">
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-bold uppercase tracking-tighter">
                      <Calendar className="w-3.5 h-3.5" /> {new Date(t.date).toLocaleDateString('tr-TR')}
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-bold uppercase tracking-tighter">
                      <Landmark className="w-3.5 h-3.5" /> {t.category === 'Hakediş Tahsilatı' ? 'Banker Hesabı' : 'Şantiye Kasası'}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default TransactionList;
