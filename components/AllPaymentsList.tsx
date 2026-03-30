
import React, { useState, useMemo } from 'react';
import { Subcontractor, ProgressPayment, Contract } from '../types';
import { Search, FileText, Calendar, ArrowRight, Wallet, UserCircle, Download, FileSpreadsheet } from 'lucide-react';

interface AllPaymentsListProps {
  contracts: Contract[];
  subcontractors: Subcontractor[];
  onSelectContract: (id: string) => void;
}

const AllPaymentsList: React.FC<AllPaymentsListProps> = ({ contracts, subcontractors, onSelectContract }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const allPayments = useMemo(() => {
    return contracts.flatMap(contract => {
      const sub = subcontractors.find(s => s.id === contract.subcontractorId);
      return contract.progressPayments.map(p => ({
        ...p,
        subName: sub?.name || 'Bilinmeyen Taşeron',
        subTrade: sub?.trade || 'Genel',
        contractTitle: contract.title,
        contractId: contract.id
      }));
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [contracts, subcontractors]);

  const filteredPayments = allPayments.filter(p => 
    p.subName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.contractTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.number.toString().includes(searchTerm) ||
    new Date(p.date).toLocaleDateString('tr-TR').includes(searchTerm)
  );

  const handleExportAllToCSV = () => {
    if (allPayments.length === 0) return;
    
    // CSV Headers
    const headers = ["Tarih", "Taseron", "Sozlesme", "Hakedis No", "Durum", "Net Odenecek (TL)"];
    
    // Data Rows
    const rows = allPayments.map(p => [
      new Date(p.date).toLocaleDateString('tr-TR').replace(/\//g, '.'), // Standardize date format
      `"${p.subName.replace(/"/g, '""')}"`, // Escape quotes for CSV
      `"${p.contractTitle.replace(/"/g, '""')}"`,
      p.number,
      p.status === 'Approved' ? 'Onayli' : 'Beklemede',
      p.summary.netPayable.toFixed(2).replace('.', ',') // Locale-friendly decimal
    ]);

    // Construct CSV Content
    const csvContent = [headers, ...rows].map(e => e.join(";")).join("\n");
    
    // Add BOM for Excel UTF-8 support
    const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    const safeDate = new Date().toISOString().split('T')[0];
    link.setAttribute("href", url);
    link.setAttribute("download", `Tum_Hakedis_Icmali_${safeDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 pb-24 animate-in fade-in duration-500">
      <div className="flex justify-between items-center px-1">
        <div>
          <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Hakediş Kayıtları</h1>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Şantiye Genel Ödeme Listesi</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleExportAllToCSV}
            className="bg-emerald-50 text-emerald-600 p-2.5 rounded-2xl shadow-sm border border-emerald-100 hover:bg-emerald-100 active:scale-90 transition-all no-print flex items-center gap-2 group"
            title="Tüm Listeyi Excel Olarak İndir"
          >
            <FileSpreadsheet className="w-5 h-5" />
            <span className="hidden md:inline text-[9px] font-black uppercase">Dışa Aktar</span>
          </button>
          <div className="bg-blue-600 text-white text-[10px] font-black px-4 py-2 rounded-2xl shadow-lg shadow-blue-200 uppercase tracking-widest flex items-center">
            {allPayments.length} Kayıt
          </div>
        </div>
      </div>

      <div className="relative no-print">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
        <input 
          type="text" 
          placeholder="Taşeron, hakediş no veya tarih..." 
          className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-[2rem] focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all text-sm font-medium"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {filteredPayments.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-[2.5rem] border border-dashed border-slate-200">
          <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="text-slate-300 w-10 h-10" />
          </div>
          <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">Kayıt Bulunamadı</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPayments.map((p) => (
            <button
              key={p.id}
              onClick={() => onSelectContract(p.contractId)}
              className="w-full bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col gap-4 active:scale-[0.98] transition-all hover:border-blue-200 text-left relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:scale-125 transition-transform">
                <Wallet className="w-20 h-20" />
              </div>
              
              <div className="flex justify-between items-start relative z-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                    <UserCircle className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-800 text-sm leading-tight uppercase tracking-tight">
                      {p.subName}
                    </h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">{p.contractTitle}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-tighter ${p.status === 'Approved' ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'}`}>
                    HAKEDİŞ #{p.number}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-end border-t border-slate-50 pt-4 mt-2 relative z-10">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-[9px] text-slate-400 font-bold uppercase">
                    <Calendar className="w-3 h-3" />
                    {new Date(p.date).toLocaleDateString('tr-TR')}
                  </div>
                  <div>
                    <p className={`text-xl font-black ${p.status === 'Approved' ? 'text-green-600' : 'text-orange-600'}`}>
                      {p.summary.netPayable.toLocaleString('tr-TR')} <span className="text-xs">TL</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-black text-blue-500 bg-blue-50 px-4 py-2 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-all uppercase tracking-widest no-print">
                  DETAY <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default AllPaymentsList;
