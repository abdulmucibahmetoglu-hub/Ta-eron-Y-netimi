
import React, { useState, useMemo } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Legend, Cell 
} from 'recharts';
import { Subcontractor, Transaction, Contract, Project } from '../types';
import { 
  Calendar, 
  TrendingUp, 
  PieChart as PieChartIcon, 
  Sparkles, 
  CheckCircle2, 
  BarChart3, 
  Wallet, 
  Table as TableIcon,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
  PlusCircle,
  Download,
  FileSpreadsheet
} from 'lucide-react';
import { analyzeProjectHealth } from '../services/geminiService';

interface ReportsProps {
  subcontractors: Subcontractor[];
  transactions: Transaction[];
  contracts: Contract[];
  projects: Project[];
  onNewPayment: (contractId: string) => void;
}

type Range = '30d' | '90d' | 'all';
type SortKey = 'projectName' | 'subName' | 'title' | 'totalValue' | 'paidAmount';
type SortOrder = 'asc' | 'desc';

const Reports: React.FC<ReportsProps> = ({ subcontractors, transactions, contracts, projects, onNewPayment }) => {
  const [range, setRange] = useState<Range>('all');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>('totalValue');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const filteredData = useMemo(() => {
    const now = new Date();
    const rangeLimit = range === '30d' ? 30 : range === '90d' ? 90 : Infinity;

    const allPayments = subcontractors.flatMap(s => 
      (s.progressPayments || [])
        .filter(p => p.status === 'Approved')
        .map(p => ({
          ...p,
          subName: s.name,
          dateObj: new Date(p.date)
        }))
    ).filter(p => {
      if (range === 'all') return true;
      const diffDays = (now.getTime() - p.dateObj.getTime()) / (1000 * 3600 * 24);
      return diffDays <= rangeLimit;
    });

    return allPayments.sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());
  }, [subcontractors, range]);

  const stats = useMemo(() => {
    const totalPaid = filteredData.reduce((sum, p) => sum + p.summary.currentTotal, 0);
    const totalRetention = filteredData.reduce((sum, p) => sum + p.summary.retentionAmount, 0);
    const paymentCount = filteredData.length;
    return { totalPaid, totalRetention, paymentCount };
  }, [filteredData]);

  const financialTrendData = useMemo(() => {
    const now = new Date();
    const rangeLimit = range === '30d' ? 30 : range === '90d' ? 90 : Infinity;
    
    const filteredTransactions = transactions.filter(t => {
      if (range === 'all') return true;
      const date = new Date(t.date);
      const diffDays = (now.getTime() - date.getTime()) / (1000 * 3600 * 24);
      return diffDays <= rangeLimit;
    });

    const groups: Record<string, { income: number; expense: number }> = {};
    
    filteredTransactions.forEach(t => {
      const month = new Date(t.date).toLocaleDateString('tr-TR', { month: 'short', year: '2-digit' });
      if (!groups[month]) groups[month] = { income: 0, expense: 0 };
      if (t.type === 'income') groups[month].income += t.amount;
      else groups[month].expense += t.amount;
    });

    return Object.entries(groups).map(([name, data]) => ({
      name,
      Gelir: data.income,
      Gider: data.expense
    }));
  }, [transactions, range]);

  const subProgressData = useMemo(() => {
    return subcontractors.map(sub => {
      const totalContractValue = sub.totalContractValue || 0;
      const approvedPayments = (sub.progressPayments || []).filter(p => p.status === 'Approved');
      const completedValue = approvedPayments.length > 0 
        ? approvedPayments[approvedPayments.length - 1].summary.cumulativeTotal 
        : 0;
      
      const completionPercentage = totalContractValue > 0 
        ? (completedValue / totalContractValue) * 100 
        : 0;

      return {
        name: sub.name,
        totalValue: totalContractValue,
        completedValue: completedValue,
        completionPercentage: parseFloat(completionPercentage.toFixed(2))
      };
    }).filter(data => data.totalValue > 0);
  }, [subcontractors]);

  const consolidatedContracts = useMemo(() => {
    const data = contracts.map(c => {
      const project = projects.find(p => p.id === c.projectId);
      const sub = subcontractors.find(s => s.id === c.subcontractorId);
      const approved = c.progressPayments.filter(p => p.status === 'Approved');
      const paidAmount = approved[approved.length - 1]?.summary.cumulativeTotal || 0;
      
      return {
        id: c.id,
        projectName: project?.name || 'Bilinmeyen Proje',
        subName: sub?.name || 'Bilinmeyen Taşeron',
        title: c.title,
        totalValue: c.totalValue,
        paidAmount: paidAmount,
        progress: c.totalValue > 0 ? (paidAmount / c.totalValue) * 100 : 0
      };
    });

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
  }, [contracts, projects, subcontractors, sortKey, sortOrder]);

  const handleExportToCSV = () => {
    const headers = ["Proje", "Taşeron", "Sözleşme", "Sözleşme Bedeli", "Onaylı Hakediş", "İlerleme (%)"];
    const rows = consolidatedContracts.map(c => [
      c.projectName,
      c.subName,
      c.title,
      c.totalValue.toString(),
      c.paidAmount.toString(),
      c.progress.toFixed(2)
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(";")).join("\n");
    const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `Sozlesme_Icmali_${new Date().toLocaleDateString('tr-TR')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleProjectAnalysis = async () => {
    setIsAnalyzing(true);
    const result = await analyzeProjectHealth(subcontractors);
    setAiInsight(result);
    setIsAnalyzing(false);
  };

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

  return (
    <div className="space-y-6 pb-24 animate-in fade-in duration-500">
      <div className="flex justify-between items-center px-1">
        <div>
          <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Rapor Analiz</h1>
          <p className="text-[10px] text-orange-600 font-bold uppercase tracking-widest mt-1">Onaylı İlerleme ve Mali Göstergeler</p>
        </div>
        <div className="flex bg-white border border-slate-200 p-1 rounded-2xl shadow-sm no-print">
          {(['30d', '90d', 'all'] as Range[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1.5 text-[9px] font-black rounded-xl transition-all ${range === r ? 'bg-orange-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
            >
              {r === '30d' ? '30 GÜN' : r === '90d' ? '90 GÜN' : 'TÜMÜ'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Onaylı Hakediş</p>
          <p className="text-xl font-black text-orange-600">{stats.totalPaid.toLocaleString('tr-TR')} TL</p>
          <div className="flex items-center gap-1 mt-1 text-[9px] text-emerald-500 font-bold uppercase">
            <CheckCircle2 className="w-3 h-3" /> {stats.paymentCount} Onaylı
          </div>
        </div>
        <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Emanet Teminat</p>
          <p className="text-xl font-black text-slate-800">{stats.totalRetention.toLocaleString('tr-TR')} TL</p>
          <p className="text-[9px] text-orange-400 mt-1 font-medium uppercase tracking-tighter italic">Onaylılardan Kesilen</p>
        </div>
      </div>

      <div className="bg-gradient-to-br from-orange-600 to-orange-900 p-6 rounded-[2.5rem] shadow-xl text-white relative overflow-hidden group no-print">
        <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12 group-hover:rotate-45 transition-transform duration-700">
           <Sparkles className="w-24 h-24" />
        </div>
        <div className="relative z-10 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-orange-200" />
              <h3 className="text-xs font-black uppercase tracking-widest">Yapay Zeka Analizi</h3>
            </div>
            <button 
              onClick={handleProjectAnalysis}
              disabled={isAnalyzing}
              className="bg-white/10 hover:bg-white/20 disabled:opacity-50 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest backdrop-blur-md border border-white/10 transition-all"
            >
              {isAnalyzing ? 'Analiz Ediliyor...' : 'Analiz Et'}
            </button>
          </div>
          
          {aiInsight ? (
            <div className="text-sm leading-relaxed text-orange-50/90 whitespace-pre-wrap animate-in fade-in duration-500">
              {aiInsight}
            </div>
          ) : (
            <div className="text-sm text-orange-200/60 italic">
              Onaylı veriler üzerinden mali risk analizi için butona tıklayın.
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden animate-in fade-in duration-500">
          <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <TableIcon className="w-4 h-4" /> Onaylı Sözleşme İcmali
            </h3>
            <button 
              onClick={handleExportToCSV}
              className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all shadow-sm active:scale-95 no-print"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" /> Excel'e Aktar
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-slate-50/50">
                  <th onClick={() => handleSort('projectName')} className="p-4 cursor-pointer hover:bg-slate-100 transition-colors">
                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase">
                      Proje <SortIndicator k="projectName" />
                    </div>
                  </th>
                  <th onClick={() => handleSort('subName')} className="p-4 cursor-pointer hover:bg-slate-100 transition-colors">
                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase">
                      Taşeron <SortIndicator k="subName" />
                    </div>
                  </th>
                  <th onClick={() => handleSort('title')} className="p-4 cursor-pointer hover:bg-slate-100 transition-colors">
                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase">
                      Sözleşme <SortIndicator k="title" />
                    </div>
                  </th>
                  <th onClick={() => handleSort('totalValue')} className="p-4 text-right cursor-pointer hover:bg-slate-100 transition-colors">
                    <div className="flex items-center justify-end gap-2 text-[10px] font-black text-slate-500 uppercase">
                      Bedel <SortIndicator k="totalValue" />
                    </div>
                  </th>
                  <th onClick={() => handleSort('paidAmount')} className="p-4 text-right cursor-pointer hover:bg-slate-100 transition-colors">
                    <div className="flex items-center justify-end gap-2 text-[10px] font-black text-slate-500 uppercase">
                      Onaylı <SortIndicator k="paidAmount" />
                    </div>
                  </th>
                  <th className="p-4 text-center text-[10px] font-black text-slate-500 uppercase no-print">
                    İşlem
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {consolidatedContracts.map((c, idx) => (
                  <tr key={c.id} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/20'} hover:bg-orange-50/30 transition-colors`}>
                    <td className="p-4 text-[11px] font-bold text-slate-600">{c.projectName}</td>
                    <td className="p-4 text-[11px] font-black text-slate-800">{c.subName}</td>
                    <td className="p-4 text-[10px] font-medium text-slate-500 uppercase tracking-tight">{c.title}</td>
                    <td className="p-4 text-right text-[11px] font-mono font-bold text-slate-700">{c.totalValue.toLocaleString('tr-TR')} TL</td>
                    <td className={`p-4 text-right text-[11px] font-mono font-black ${c.progress >= 100 ? 'text-emerald-600' : c.progress >= 30 ? 'text-blue-600' : 'text-orange-600'}`}>
                      <div className="flex flex-col items-end gap-1">
                        <span>{c.paidAmount.toLocaleString('tr-TR')} TL</span>
                        <div className="w-16 bg-slate-100 h-1 rounded-full overflow-hidden">
                          <div className={`h-full ${c.progress >= 100 ? 'bg-emerald-500' : c.progress >= 30 ? 'bg-blue-500' : 'bg-orange-500'}`} style={{ width: `${Math.min(100, c.progress)}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-center no-print">
                      <button 
                        onClick={() => onNewPayment(c.id)}
                        className="bg-orange-600 text-white p-2 rounded-xl shadow-md shadow-orange-100 hover:bg-orange-700 active:scale-90 transition-all group"
                        title="Yeni Hakediş Hazırla"
                      >
                        <PlusCircle className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Onaylı Nakıt Akışı</h3>
              <Wallet className="w-4 h-4 text-slate-200" />
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={financialTrendData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} />
                  <YAxis fontSize={10} axisLine={false} tickLine={false} tickFormatter={(value) => `${value/1000}k`} />
                  <Tooltip cursor={{fill: '#f8fafc'}} />
                  <Legend iconType="circle" wrapperStyle={{fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', paddingTop: '10px'}} />
                  <Bar dataKey="Gelir" fill="#ea580c" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Gider" fill="#0f172a" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Taşeron İlerleme Durumu</h3>
              <PieChartIcon className="w-4 h-4 text-slate-200" />
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={subProgressData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                  <XAxis type="number" domain={[0, 100]} tickFormatter={(value) => `%${value}`} fontSize={10} axisLine={false} tickLine={false} />
                  <YAxis dataKey="name" type="category" fontSize={10} axisLine={false} tickLine={false} width={80} />
                  <Tooltip 
                    cursor={{fill: '#f8fafc'}} 
                    formatter={(value: number, name: string, props: any) => {
                      if (name === 'completionPercentage') return [`%${value}`, 'İlerleme'];
                      return [value, name];
                    }}
                  />
                  <Bar dataKey="completionPercentage" name="İlerleme (%)" fill="#ea580c" radius={[0, 4, 4, 0]}>
                    {subProgressData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.completionPercentage >= 100 ? '#10b981' : entry.completionPercentage >= 30 ? '#3b82f6' : '#ea580c'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
