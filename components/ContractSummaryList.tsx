
import React, { useState, useMemo } from 'react';
import { Project, Subcontractor, Contract } from '../types';
import { 
  ArrowUpDown, 
  ChevronUp, 
  ChevronDown, 
  Search, 
  FileSpreadsheet, 
  ArrowRight,
  Filter,
  TrendingUp,
  Landmark
} from 'lucide-react';

interface ContractSummaryListProps {
  contracts: Contract[];
  projects: Project[];
  subcontractors: Subcontractor[];
  onSelectContract: (id: string) => void;
}

type SortKey = 'projectName' | 'subName' | 'title' | 'totalValue' | 'paidAmount' | 'progress';
type SortOrder = 'asc' | 'desc';

const ContractSummaryList: React.FC<ContractSummaryListProps> = ({ contracts, projects, subcontractors, onSelectContract }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('totalValue');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const consolidatedData = useMemo(() => {
    return contracts.map(c => {
      const project = projects.find(p => p.id === c.projectId);
      const sub = subcontractors.find(s => s.id === c.subcontractorId);
      const approvedPayments = c.progressPayments.filter(p => p.status === 'Approved');
      const paidAmount = approvedPayments[approvedPayments.length - 1]?.summary.cumulativeTotal || 0;
      const progress = c.totalValue > 0 ? (paidAmount / c.totalValue) * 100 : 0;
      const balance = c.totalValue - paidAmount;

      return {
        id: c.id,
        projectName: project?.name || 'Bilinmeyen Proje',
        subName: sub?.name || 'Bilinmeyen Taşeron',
        title: c.title,
        totalValue: c.totalValue,
        paidAmount: paidAmount,
        balance: balance,
        progress: progress
      };
    });
  }, [contracts, projects, subcontractors]);

  const filteredAndSortedData = useMemo(() => {
    let data = consolidatedData.filter(item => 
      item.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.subName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return data.sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortOrder === 'asc' 
          ? aVal.localeCompare(bVal) 
          : bVal.localeCompare(aVal);
      }
      
      return sortOrder === 'asc' 
        ? (aVal as number) - (bVal as number) 
        : (bVal as number) - (aVal as number);
    });
  }, [consolidatedData, searchTerm, sortKey, sortOrder]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('desc');
    }
  };

  const SortIndicator = ({ k }: { k: SortKey }) => {
    if (sortKey !== k) return <ArrowUpDown className="w-3 h-3 text-slate-300" />;
    return sortOrder === 'asc' ? <ChevronUp className="w-3 h-3 text-orange-600" /> : <ChevronDown className="w-3 h-3 text-orange-600" />;
  };

  const handleExportCSV = () => {
    const headers = ["Proje", "Taseron", "Sozlesme", "Bedel", "Odenen", "Ilerleme(%)"];
    const rows = filteredAndSortedData.map(d => [
      d.projectName,
      d.subName,
      d.title,
      d.totalValue.toString(),
      d.paidAmount.toString(),
      d.progress.toFixed(2)
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(";")).join("\n");
    const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `Sozlesme_Icmali_${new Date().toISOString().split('T')[0]}.csv`);
    link.click();
  };

  const getProgressColor = (percent: number) => {
    if (percent >= 100) return 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]';
    if (percent >= 30) return 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)]';
    return 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.4)]';
  };

  const getProgressTextColor = (percent: number) => {
    if (percent >= 100) return 'text-emerald-600';
    if (percent >= 30) return 'text-blue-600';
    return 'text-orange-600';
  };

  const globalStats = useMemo(() => {
    const totalValue = filteredAndSortedData.reduce((sum, i) => sum + i.totalValue, 0);
    const totalPaid = filteredAndSortedData.reduce((sum, i) => sum + i.paidAmount, 0);
    const avgProgress = totalValue > 0 ? (totalPaid / totalValue) * 100 : 0;
    return { totalValue, totalPaid, avgProgress };
  }, [filteredAndSortedData]);

  return (
    <div className="space-y-6 pb-24 animate-in fade-in duration-500">
      <div className="flex justify-between items-end px-1">
        <div>
          <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Sözleşme İcmali</h1>
          <p className="text-[10px] text-orange-600 font-bold uppercase tracking-widest mt-1">Merkezi Taşeron Takip Listesi</p>
        </div>
        <button 
          onClick={handleExportCSV}
          className="bg-emerald-50 text-emerald-600 p-2.5 rounded-2xl shadow-sm border border-emerald-100 hover:bg-emerald-100 active:scale-90 transition-all no-print"
        >
          <FileSpreadsheet className="w-5 h-5" />
        </button>
      </div>

      <div className="relative no-print">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
        <input 
          type="text" 
          placeholder="Proje, taşeron veya sözleşme ara..." 
          className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-[2rem] focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-sm transition-all text-sm font-medium"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th onClick={() => handleSort('projectName')} className="p-5 cursor-pointer hover:bg-slate-100 transition-colors group">
                  <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-wider group-hover:text-slate-600">
                    Proje Adı <SortIndicator k="projectName" />
                  </div>
                </th>
                <th onClick={() => handleSort('subName')} className="p-5 cursor-pointer hover:bg-slate-100 transition-colors group">
                  <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-wider group-hover:text-slate-600">
                    Taşeron <SortIndicator k="subName" />
                  </div>
                </th>
                <th onClick={() => handleSort('title')} className="p-5 cursor-pointer hover:bg-slate-100 transition-colors group">
                  <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-wider group-hover:text-slate-600">
                    Sözleşme <SortIndicator k="title" />
                  </div>
                </th>
                <th onClick={() => handleSort('totalValue')} className="p-5 text-right cursor-pointer hover:bg-slate-100 transition-colors group">
                  <div className="flex items-center justify-end gap-2 text-[10px] font-black text-slate-400 uppercase tracking-wider group-hover:text-slate-600">
                    Bedel <SortIndicator k="totalValue" />
                  </div>
                </th>
                <th onClick={() => handleSort('paidAmount')} className="p-5 text-right cursor-pointer hover:bg-slate-100 transition-colors group">
                  <div className="flex items-center justify-end gap-2 text-[10px] font-black text-slate-400 uppercase tracking-wider group-hover:text-slate-600">
                    Onaylı <SortIndicator k="paidAmount" />
                  </div>
                </th>
                <th onClick={() => handleSort('progress')} className="p-5 text-left cursor-pointer hover:bg-slate-100 transition-colors group w-32">
                  <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-wider group-hover:text-slate-600">
                    İlerleme <SortIndicator k="progress" />
                  </div>
                </th>
                <th className="p-5 no-print"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredAndSortedData.map((item, idx) => (
                <tr key={item.id} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/20'} hover:bg-orange-50/30 transition-colors`}>
                  <td className="p-5 text-[11px] font-bold text-slate-600 uppercase">{item.projectName}</td>
                  <td className="p-5 text-[11px] font-black text-slate-800 uppercase">{item.subName}</td>
                  <td className="p-5 text-[10px] font-medium text-slate-500 uppercase">{item.title}</td>
                  <td className="p-5 text-right text-[11px] font-mono font-bold text-slate-700">
                    {item.totalValue.toLocaleString('tr-TR')} TL
                  </td>
                  <td className="p-5 text-right text-[11px] font-mono font-black text-emerald-600">
                    {item.paidAmount.toLocaleString('tr-TR')} TL
                  </td>
                  <td className="p-5">
                    <div className="min-w-[120px] space-y-1.5">
                      <div className="flex justify-between items-center px-0.5">
                         <span className={`text-[10px] font-black ${getProgressTextColor(item.progress)}`}>
                           %{item.progress.toFixed(1)}
                         </span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-50 shadow-inner">
                        <div 
                          className={`h-full rounded-full transition-all duration-1000 ease-out ${getProgressColor(item.progress)}`} 
                          style={{ width: `${Math.min(100, item.progress)}%` }} 
                        />
                      </div>
                    </div>
                  </td>
                  <td className="p-5 text-right no-print">
                    <button 
                      onClick={() => onSelectContract(item.id)}
                      className="p-2.5 bg-slate-900 text-white rounded-xl shadow-lg shadow-slate-200 active:scale-90 transition-all group"
                    >
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredAndSortedData.length === 0 && (
          <div className="text-center py-20 bg-white">
            <Filter className="w-12 h-12 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">Arama sonucu bulunamadı</p>
          </div>
        )}
      </div>

      <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl no-print border-t-4 border-orange-600">
        <div className="absolute top-0 right-0 p-10 opacity-10">
          <TrendingUp className="w-32 h-32" />
        </div>
        <div className="relative z-10">
          <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-orange-500 mb-6">Şantiye Genel Finansal İcmali</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-2xl font-black tracking-tight">{globalStats.totalValue.toLocaleString('tr-TR')} TL</p>
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">Toplam Taahhüt Bedeli</p>
              </div>
              <div>
                <p className="text-2xl font-black text-emerald-400 tracking-tight">{globalStats.totalPaid.toLocaleString('tr-TR')} TL</p>
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">Onaylı Toplam Ödeme</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em]">
                <span className="text-slate-400">Genel İmalat Seviyesi</span>
                <span className="text-orange-500 text-sm">%{globalStats.avgProgress.toFixed(1)}</span>
              </div>
              <div className="w-full bg-white/5 h-3.5 rounded-full overflow-hidden border border-white/5 shadow-inner">
                <div 
                  className="bg-orange-600 h-full rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(234,88,12,0.4)]" 
                  style={{ width: `${Math.min(100, globalStats.avgProgress)}%` }} 
                />
              </div>
              <p className="text-[8px] text-slate-500 font-bold uppercase text-right">BEDEL AĞIRLIKLI ORTALAMA</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractSummaryList;
