
import React, { useState } from 'react';
import { Subcontractor } from '../types';
import { Search, Plus, UserCircle, ChevronRight, TrendingUp } from 'lucide-react';

interface SubcontractorListProps {
  subcontractors: Subcontractor[];
  onSelect: (id: string) => void;
  onAdd: () => void;
}

const SubcontractorList: React.FC<SubcontractorListProps> = ({ subcontractors, onSelect, onAdd }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = subcontractors.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.trade.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getProgressColor = (percent: number) => {
    if (percent >= 100) return 'bg-emerald-500';
    if (percent >= 30) return 'bg-blue-500';
    return 'bg-orange-500';
  };

  const getProgressTextColor = (percent: number) => {
    if (percent >= 100) return 'text-emerald-600';
    if (percent >= 30) return 'text-blue-600';
    return 'text-orange-600';
  };

  return (
    <div className="space-y-4 pb-24 animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Taşeronlar</h1>
        <button 
          onClick={onAdd}
          className="bg-blue-600 text-white p-3 rounded-2xl shadow-lg shadow-blue-200 active:scale-95 hover:bg-blue-700 transition-all flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          <span className="text-xs font-bold uppercase tracking-wider">Ekle</span>
        </button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
        <input 
          type="text" 
          placeholder="İsim veya branş ara..." 
          className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-[2rem] focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all text-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-[2.5rem] border border-dashed border-slate-200">
          <UserCircle className="w-12 h-12 text-slate-200 mx-auto mb-3" />
          <p className="text-slate-400 text-sm font-medium">Taşeron bulunamadı.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(sub => {
            const lastPayment = sub.progressPayments[sub.progressPayments.length - 1];
            const cumulativeTotal = lastPayment?.summary.cumulativeTotal || 0;
            const progress = sub.totalContractValue > 0 
              ? (cumulativeTotal / sub.totalContractValue) * 100 
              : 0;

            return (
              <button
                key={sub.id}
                onClick={() => onSelect(sub.id)}
                className="w-full text-left bg-white p-5 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col gap-4 active:scale-[0.98] transition-all hover:border-blue-100 group"
              >
                <div className="flex items-center gap-4 w-full">
                  <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                    <UserCircle className="w-10 h-10" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-black text-slate-800 text-sm truncate uppercase tracking-tight">{sub.name}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{sub.trade}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-200" />
                      <span className="text-[10px] font-bold text-blue-600 uppercase">{sub.progressPayments.length} Hakediş</span>
                    </div>
                  </div>
                  <ChevronRight className="text-slate-300 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </div>

                <div className="space-y-2 w-full pt-2 border-t border-slate-50">
                  <div className="flex justify-between items-end">
                    <div className="flex items-center gap-1.5">
                      <TrendingUp className="w-3 h-3 text-slate-400" />
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">İş İlerlemesi</span>
                    </div>
                    <span className={`text-xs font-black ${getProgressTextColor(progress)}`}>
                      %{progress.toFixed(1)}
                    </span>
                  </div>
                  
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-50">
                    <div 
                      className={`${getProgressColor(progress)} h-full rounded-full transition-all duration-1000 ease-out shadow-sm`} 
                      style={{ width: `${Math.min(100, progress)}%` }}
                    />
                  </div>
                  
                  <div className="flex justify-between items-center text-[9px] font-bold text-slate-400 uppercase tracking-tight pt-1">
                    <span>{cumulativeTotal.toLocaleString('tr-TR')} TL Ödenen</span>
                    <span>Hedef: {sub.totalContractValue.toLocaleString('tr-TR')} TL</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SubcontractorList;
