
import React, { useState } from 'react';
import { Project, Contract, Transaction } from '../types';
import { Plus, Building2, MapPin, ChevronRight, Calendar, Wallet, Activity, CheckCircle2 } from 'lucide-react';

interface ProjectListProps {
  projects: Project[];
  contracts: Contract[];
  transactions: Transaction[];
  onSelect: (id: string) => void;
  onAdd: () => void;
}

const ProjectList: React.FC<ProjectListProps> = ({ projects, contracts, transactions, onSelect, onAdd }) => {
  // Fix: import useState from react to avoid "Cannot find name 'useState'" error
  const [search, setSearch] = useState('');

  const filtered = projects.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6 pb-24 animate-in fade-in duration-500">
      <div className="flex justify-between items-center px-1">
        <div>
          <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Projeler</h1>
          <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-widest mt-1">Aktif Şantiye Portföyü</p>
        </div>
        <button 
          onClick={onAdd}
          className="bg-indigo-600 text-white p-3 rounded-2xl shadow-lg shadow-indigo-100 active:scale-95 transition-all flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          <span className="hidden md:inline text-xs font-black uppercase tracking-widest">Yeni Proje</span>
        </button>
      </div>

      <div className="relative">
        <input 
          type="text" 
          placeholder="Proje ismine göre ara..." 
          className="w-full pl-6 pr-4 py-4 bg-white border border-slate-200 rounded-[2rem] focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm text-sm font-medium"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-[3rem] border border-dashed border-slate-200">
          <Building2 className="w-16 h-16 text-slate-100 mx-auto mb-4" />
          <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">Henüz proje eklenmemiş</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(p => {
            const projectContracts = contracts.filter(c => c.projectId === p.id);
            const projectExpenses = transactions.filter(t => t.projectId === p.id && t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
            const subCosts = projectContracts.reduce((sum, c) => {
              const approved = c.progressPayments.filter(pay => pay.status === 'Approved');
              return sum + (approved[approved.length-1]?.summary.cumulativeTotal || 0);
            }, 0);
            const totalSpent = projectExpenses + subCosts;
            const spendRatio = p.totalBudget > 0 ? (totalSpent / p.totalBudget) * 100 : 0;

            return (
              <button
                key={p.id}
                onClick={() => onSelect(p.id)}
                className="w-full text-left bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col gap-5 active:scale-[0.98] transition-all group hover:border-indigo-400 hover:shadow-xl relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-125 transition-transform">
                  <Activity className="w-24 h-24" />
                </div>

                <div className="flex items-start justify-between relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                      <Building2 className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="font-black text-slate-800 text-sm uppercase tracking-tight line-clamp-1">{p.name}</h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{p.client}</p>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${p.status === 'Devam Ediyor' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                    {p.status}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 relative z-10">
                   <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100/50">
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Sözleşme Bedeli</p>
                      <p className="text-xs font-black text-slate-700">{p.totalBudget.toLocaleString('tr-TR')} TL</p>
                   </div>
                   <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100/50">
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Toplam Harcama</p>
                      <p className="text-xs font-black text-rose-600">{totalSpent.toLocaleString('tr-TR')} TL</p>
                   </div>
                </div>

                <div className="space-y-2 relative z-10">
                  <div className="flex justify-between text-[9px] font-black uppercase tracking-widest">
                    <span className="text-slate-400">Bütçe Kullanımı</span>
                    <span className={spendRatio > 90 ? 'text-rose-600' : 'text-indigo-600'}>%{spendRatio.toFixed(1)}</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-1000 ${spendRatio > 90 ? 'bg-rose-500' : 'bg-indigo-600'}`} 
                      style={{ width: `${Math.min(100, spendRatio)}%` }} 
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-50 relative z-10">
                  <div className="flex items-center gap-3">
                    <span className="text-[9px] font-bold text-slate-400 flex items-center gap-1 uppercase tracking-tighter">
                      <MapPin className="w-3 h-3" /> {p.location}
                    </span>
                    <span className="text-[9px] font-bold text-slate-400 flex items-center gap-1 uppercase tracking-tighter">
                      <Calendar className="w-3 h-3" /> {new Date(p.startDate).toLocaleDateString('tr-TR')}
                    </span>
                  </div>
                  <ChevronRight className="text-slate-300 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProjectList;
