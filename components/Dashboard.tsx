
import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { Subcontractor, Project, Contract, Transaction } from '../types';
import { TrendingUp, Activity, Wallet, DollarSign, HardHat, ShieldCheck, Database, Zap, ArrowUpRight } from 'lucide-react';

interface DashboardProps {
  subcontractors: Subcontractor[];
  projects: Project[];
  contracts: Contract[];
  transactions: Transaction[];
}

const Dashboard: React.FC<DashboardProps> = ({ subcontractors, projects, contracts, transactions }) => {
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  
  const subCosts = contracts.reduce((sum, c) => {
    const approvedPayments = c.progressPayments.filter(p => p.status === 'Approved');
    const lastPayment = approvedPayments[approvedPayments.length - 1];
    return sum + (lastPayment?.summary.cumulativeTotal || 0);
  }, 0);
  
  const miscExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const totalCost = subCosts + miscExpenses;
  const balance = totalIncome - totalCost;

  const chartData = projects.map(p => {
    const projIncome = transactions.filter(t => t.projectId === p.id && t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const projContracts = contracts.filter(c => c.projectId === p.id);
    const projSubCosts = projContracts.reduce((sum, c) => {
      const approved = c.progressPayments.filter(pay => pay.status === 'Approved');
      const last = approved[approved.length-1];
      return sum + (last?.summary.cumulativeTotal || 0);
    }, 0);
    const projMiscCosts = transactions.filter(t => t.projectId === p.id && t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    
    return {
      name: p.name.length > 12 ? p.name.substring(0, 12) + '...' : p.name,
      Gelir: projIncome,
      Maliyet: projSubCosts + projMiscCosts,
    };
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20 md:pb-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Finansal Kontrol Paneli</h1>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.3em] mt-2">Saha Verileri ve Analiz Merkezi</p>
        </div>
        <div className="flex gap-3">
          <div className="px-5 py-3 bg-white border border-slate-100 rounded-3xl shadow-sm flex items-center gap-3">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-black uppercase text-slate-500">Sistem Çevrimiçi</span>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-emerald-50 rounded-2xl group-hover:bg-emerald-500 group-hover:text-white transition-colors">
              <Activity className="w-6 h-6" />
            </div>
            <ArrowUpRight className="w-5 h-5 text-slate-200 group-hover:text-emerald-500 transition-colors" />
          </div>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Onaylı Tahsilat</p>
          <p className="text-2xl font-black text-slate-800 mt-1">{totalIncome.toLocaleString('tr-TR')} TL</p>
        </div>

        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-rose-50 rounded-2xl group-hover:bg-rose-500 group-hover:text-white transition-colors">
              <Wallet className="w-6 h-6" />
            </div>
            <ArrowUpRight className="w-5 h-5 text-slate-200 group-hover:text-rose-500 transition-colors" />
          </div>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Onaylı Maliyet</p>
          <p className="text-2xl font-black text-rose-600 mt-1">{totalCost.toLocaleString('tr-TR')} TL</p>
        </div>

        <div className={`lg:col-span-2 p-8 rounded-[3rem] shadow-2xl flex flex-col justify-center text-white relative overflow-hidden group transition-all duration-500 ${balance >= 0 ? 'bg-slate-900' : 'bg-rose-900'}`}>
          <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:rotate-12 transition-transform duration-700">
            <TrendingUp className="w-32 h-32" />
          </div>
          <div className="relative z-10 space-y-3">
            <p className="text-xs text-slate-400 font-black uppercase tracking-[0.3em]">Net Kasa Dengesi (Kar / Zarar)</p>
            <div className="flex items-baseline gap-3">
              <h2 className="text-5xl font-black tracking-tighter">{balance.toLocaleString('tr-TR')}</h2>
              <span className="text-xl font-bold text-slate-500">TL</span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${balance >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/10 text-white'}`}>
                {balance >= 0 ? 'Karlılık Pozitif' : 'Bütçe Aşımı'}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100 flex flex-col h-[450px]">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">Projeler Nakıt Akış Analizi</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Sözleşme ve Tahsilat Dengesi</p>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-orange-600 rounded-full" />
                <span className="text-[9px] font-black uppercase text-slate-400">Gelir</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-slate-900 rounded-full" />
                <span className="text-[9px] font-black uppercase text-slate-400">Gider</span>
              </div>
            </div>
          </div>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} />
                <YAxis fontSize={10} axisLine={false} tickLine={false} tickFormatter={(val) => `${val/1000}k`} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}} 
                  contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', padding: '15px' }}
                />
                <Bar dataKey="Gelir" fill="#ea580c" radius={[8, 8, 0, 0]} barSize={32} />
                <Bar dataKey="Maliyet" fill="#0f172a" radius={[8, 8, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="bg-blue-600 rounded-[3rem] p-8 text-white relative overflow-hidden shadow-xl group border-t-8 border-blue-400 flex-1 flex flex-col justify-center">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
              <Database className="w-32 h-32" />
            </div>
            <div className="relative z-10 space-y-4">
              <div className="p-3 bg-white/10 w-fit rounded-2xl backdrop-blur-md">
                <ShieldCheck className="w-6 h-6 text-blue-200" />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase tracking-tight mb-2">Web Veritabanı Aktif</h3>
                <p className="text-[10px] text-blue-100 leading-relaxed font-medium">
                  Cihazınızda saklanan tüm veriler, tarayıcınız her açıldığında otomatik olarak senkronize edilir. 
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                <span className="text-[9px] font-black uppercase tracking-widest text-blue-200">Yerel Kayıt Optimize Edildi</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col justify-center gap-4 flex-1">
             <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-50 rounded-2xl text-orange-600">
                  <Zap className="w-6 h-6" />
                </div>
                <div>
                   <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Toplam Proje</h4>
                   <p className="text-3xl font-black text-slate-900 mt-1">{projects.length}</p>
                </div>
             </div>
             <div className="w-full h-1 bg-slate-50 rounded-full" />
             <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-50 rounded-2xl text-blue-600">
                  <HardHat className="w-6 h-6" />
                </div>
                <div>
                   <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Aktif Taşeron</h4>
                   <p className="text-3xl font-black text-slate-900 mt-1">{subcontractors.length}</p>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
