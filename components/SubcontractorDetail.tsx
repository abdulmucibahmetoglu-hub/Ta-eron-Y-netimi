
import React, { useState, useRef } from 'react';
import { Subcontractor, ProgressPayment, ContractDocument, WorkItem } from '../types';
import { ArrowLeft, Plus, Sparkles, FileText, Info, TrendingUp, Calendar, Edit2, Check, X, FileUp, Eye, Trash2, Image as ImageIcon, ZoomIn, ListFilter, Calculator, AlertCircle, CheckCircle2, Clock, Landmark, ShieldCheck, Gavel, Download, FileSpreadsheet, Printer, UploadCloud, Loader2 } from 'lucide-react';
import { analyzeProgress } from '../services/geminiService';

interface SubcontractorDetailProps {
  subcontractor: Subcontractor;
  onBack: () => void;
  onNewPayment: () => void;
  onApprovePayment: (id: string) => void;
  onUpdate: (updatedSub: Subcontractor) => void;
}

const SubcontractorDetail: React.FC<SubcontractorDetailProps> = ({ subcontractor, onBack, onNewPayment, onApprovePayment, onUpdate }) => {
  const [activeTab, setActiveTab] = useState<'items' | 'payments' | 'docs'>('items');
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isEditingDate, setIsEditingDate] = useState(false);
  const [tempDate, setTempDate] = useState(subcontractor.contractDate ? subcontractor.contractDate.split('T')[0] : '');
  const [previewDoc, setPreviewDoc] = useState<ContractDocument | null>(null);
  const [approvingPayment, setApprovingPayment] = useState<ProgressPayment | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    const report = await analyzeProgress(subcontractor);
    setAiReport(report || "Analiz yapılamadı.");
    setIsAnalyzing(false);
  };

  const handleExportPayments = () => {
    if (!subcontractor.progressPayments || subcontractor.progressPayments.length === 0) return;
    
    const headers = ["No", "Tarih", "Durum", "Onceki Toplam", "Bu Donem", "Kumulatif Toplam", "Kesintiler", "Net Odenecek"];
    const rows = subcontractor.progressPayments.map(p => [
      p.number,
      new Date(p.date).toLocaleDateString('tr-TR'),
      p.status === 'Approved' ? 'Onayli' : 'Beklemede',
      p.summary.previousTotal.toString(),
      p.summary.currentTotal.toString(),
      p.summary.cumulativeTotal.toString(),
      (p.summary.retentionAmount + p.summary.stampDutyAmount).toString(),
      p.summary.netPayable.toString()
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(";")).join("\n");
    const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${subcontractor.name}_Hakedis_Icmali.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveDate = () => {
    onUpdate({
      ...subcontractor,
      contractDate: new Date(tempDate).toISOString()
    });
    setIsEditingDate(false);
  };

  const processFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    setIsUploading(true);
    
    try {
      const newDocs: ContractDocument[] = [];
      const validFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
      
      if (validFiles.length !== files.length) {
        alert("Sadece görsel dosyaları (PNG, JPG, JPEG) yüklenebilir.");
      }

      if (validFiles.length === 0) {
        setIsUploading(false);
        return;
      }

      // Simulate a small delay for visual feedback
      await new Promise(resolve => setTimeout(resolve, 800));

      const readPromises = validFiles.map(file => {
        return new Promise<ContractDocument>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve({
              id: Math.random().toString(36).substr(2, 9),
              url: reader.result as string,
              name: file.name,
              uploadDate: new Date().toISOString()
            });
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      });

      const processedDocs = await Promise.all(readPromises);
      
      onUpdate({
        ...subcontractor,
        contractDocuments: [...(subcontractor.contractDocuments || []), ...processedDocs]
      });
    } catch (error) {
      console.error("Dosya yükleme hatası:", error);
      alert("Dosyalar yüklenirken bir hata oluştu.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(e.target.files);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    processFiles(e.dataTransfer.files);
  };

  const handleRemoveDoc = (docId: string) => {
    if (confirm("Bu belgeyi silmek istediğinize emin misiniz?")) {
      onUpdate({
        ...subcontractor,
        contractDocuments: (subcontractor.contractDocuments || []).filter(d => d.id !== docId)
      });
    }
  };

  const lastApprovedPayment = [...(subcontractor.progressPayments || [])].reverse().find(p => p.status === 'Approved');
  const totalPaid = lastApprovedPayment?.summary.cumulativeTotal || 0;
  const progressPercent = subcontractor.totalContractValue > 0 ? (totalPaid / subcontractor.totalContractValue) * 100 : 0;

  return (
    <div className="space-y-6 pb-24 animate-in fade-in duration-500 max-w-4xl mx-auto relative">
      {/* Approval Confirmation Modal */}
      {approvingPayment && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-300 no-print">
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="bg-orange-600 p-6 text-white">
              <div className="flex items-center gap-3 mb-2">
                <ShieldCheck className="w-6 h-6" />
                <h3 className="text-lg font-black uppercase tracking-tight">Hakediş Onayı</h3>
              </div>
              <p className="text-orange-100 text-[10px] font-bold uppercase tracking-widest">Aşağıdaki icmali kontrol edip onaylayınız</p>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-bold uppercase">Hakediş No</span>
                  <span className="text-slate-900 font-black">#{approvingPayment.number}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-bold uppercase">Dönem İmalat</span>
                  <span className="text-slate-900 font-black">{approvingPayment.summary.currentTotal.toLocaleString('tr-TR')} TL</span>
                </div>
                <div className="flex justify-between items-center text-xs text-rose-500">
                  <span className="font-bold uppercase">Toplam Kesinti</span>
                  <span className="font-black">-{ (approvingPayment.summary.retentionAmount + approvingPayment.summary.stampDutyAmount).toLocaleString('tr-TR') } TL</span>
                </div>
                <div className="pt-3 border-t border-slate-100 flex justify-between items-end">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ödenecek Net</span>
                  <span className="text-xl font-black text-orange-600">{approvingPayment.summary.netPayable.toLocaleString('tr-TR')} TL</span>
                </div>
              </div>
              <div className="flex flex-col gap-2 pt-4">
                <button 
                  onClick={() => {
                    onApprovePayment(approvingPayment.id);
                    setApprovingPayment(null);
                  }}
                  className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-slate-200 active:scale-95 transition-all"
                >
                  Onayla ve Maliyete İşle
                </button>
                <button 
                  onClick={() => setApprovingPayment(null)}
                  className="w-full bg-slate-50 text-slate-400 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-slate-100 transition-all"
                >
                  Vazgeç
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Image Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/95 animate-in fade-in duration-300 p-4 no-print">
          <button 
            onClick={() => setPreviewDoc(null)}
            className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="w-full max-w-4xl h-[80vh] flex items-center justify-center">
            <img 
              src={previewDoc.url} 
              alt={previewDoc.name} 
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            />
          </div>
          <div className="mt-6 text-center">
            <p className="text-white font-bold text-lg">{previewDoc.name}</p>
            <p className="text-white/50 text-xs mt-1">Yükleme: {new Date(previewDoc.uploadDate).toLocaleDateString('tr-TR')}</p>
          </div>
        </div>
      )}

      {/* Top Bar */}
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-2 bg-white rounded-xl shadow-sm border border-slate-100 hover:bg-slate-50 transition-colors no-print">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-slate-800">{subcontractor.name}</h2>
          <div className="flex items-center flex-wrap gap-2 mt-1">
            <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">{subcontractor.trade}</span>
            <div className="flex items-center gap-1.5">
              {isEditingDate ? (
                <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-1 animate-in zoom-in-95 duration-200 no-print">
                  <input 
                    type="date" 
                    value={tempDate}
                    onChange={(e) => setTempDate(e.target.value)}
                    className="text-[10px] font-bold text-slate-700 outline-none bg-transparent px-1"
                  />
                  <button onClick={handleSaveDate} className="text-green-600 p-0.5 hover:bg-green-50 rounded">
                    <Check className="w-3 h-3" />
                  </button>
                  <button onClick={() => setIsEditingDate(false)} className="text-red-600 p-0.5 hover:bg-red-50 rounded">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => setIsEditingDate(true)}
                  className="flex items-center gap-1 group text-[10px] text-slate-400 font-medium hover:text-blue-600 transition-colors no-print"
                >
                  <Calendar className="w-3 h-3" />
                  <span>Sözleşme: {subcontractor.contractDate ? new Date(subcontractor.contractDate).toLocaleDateString('tr-TR') : '-'}</span>
                  <Edit2 className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              )}
            </div>
          </div>
        </div>
        <button 
          onClick={() => window.print()}
          className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-600 hover:bg-slate-50 shadow-sm active:scale-90 transition-all no-print"
          title="Yazdır / PDF Olarak Kaydet"
        >
          <Printer className="w-5 h-5" />
        </button>
      </div>

      {/* Summary Card */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12 group-hover:rotate-45 transition-transform duration-700">
           <TrendingUp className="w-32 h-32" />
        </div>
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1 text-indigo-300">Onaylı İmalat Bedeli</p>
              <p className="text-2xl font-black">{totalPaid.toLocaleString('tr-TR')} <span className="text-sm font-bold text-slate-500">TL</span></p>
            </div>
            <div className="bg-white/10 p-2.5 rounded-2xl backdrop-blur-md border border-white/10">
              <Calculator className="w-5 h-5 text-blue-400" />
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Onaylı İlerleme</p>
                <p className="text-lg font-bold text-blue-400">{subcontractor.totalContractValue?.toLocaleString('tr-TR')} TL Hedef</p>
              </div>
              <span className="text-2xl font-black text-white">%{progressPercent.toFixed(1)}</span>
            </div>
            <div className="w-full bg-white/10 h-3 rounded-full overflow-hidden border border-white/5">
              <div 
                className={`h-full transition-all duration-1000 ease-out ${progressPercent >= 100 ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]' : progressPercent >= 30 ? 'bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'bg-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.5)]'}`} 
                style={{ width: `${Math.min(100, progressPercent)}%` }} 
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-white p-1.5 rounded-[1.5rem] border border-slate-200 shadow-sm overflow-x-auto no-scrollbar no-print">
        <button 
          onClick={() => setActiveTab('items')}
          className={`flex-1 min-w-[100px] py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'items' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
        >
          İş Kalemleri
        </button>
        <button 
          onClick={() => setActiveTab('payments')}
          className={`flex-1 min-w-[100px] py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'payments' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
        >
          Hakedişler
        </button>
        <button 
          onClick={() => setActiveTab('docs')}
          className={`flex-1 min-w-[100px] py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'docs' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
        >
          Belgeler ({(subcontractor.contractDocuments || []).length})
        </button>
      </div>

      {/* Content Area */}
      <div className="space-y-4">
        {activeTab === 'items' && (
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden animate-in fade-in duration-500">
            <div className="p-5 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                <ListFilter className="w-4 h-4" /> Metraj ve Birim Fiyat Tablosu
              </h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-tighter">Poz No</th>
                    <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-tighter">İş Kalemi Tanımı</th>
                    <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-tighter text-center">Birim</th>
                    <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-tighter text-right">Birim Fiyat</th>
                    <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-tighter text-right">Sözleşme Metrajı</th>
                    <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-tighter text-right">Yapılan Metraj</th>
                    <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-tighter text-right">Toplam Tutar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {subcontractor.workItems?.map((item, idx) => {
                    const completedQty = (subcontractor.progressPayments || [])
                      .filter(p => p.status === 'Approved')
                      .reduce((sum, p) => {
                        const pItem = p.items.find(i => i.workItemId === item.id);
                        return sum + (pItem?.thisPeriodQuantity || 0);
                      }, 0);
                    const totalValue = completedQty * item.unitPrice;
                    const isExceeding = completedQty > item.contractQuantity;

                    return (
                      <tr key={item.id} className={`hover:bg-blue-50/30 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}>
                        <td className="p-4 text-[11px] font-bold text-slate-400">
                          {item.pozNo || idx + 1}
                        </td>
                        <td className="p-4">
                          <p className="text-xs font-bold text-slate-800 line-clamp-2 max-w-[250px]">{item.description}</p>
                        </td>
                        <td className="p-4 text-center">
                          <span className="text-[10px] font-black text-slate-500 bg-slate-100 px-2 py-0.5 rounded uppercase">{item.unit}</span>
                        </td>
                        <td className="p-4 text-right text-[11px] font-mono font-bold text-slate-600">
                          {item.unitPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-4 text-right text-[11px] font-mono font-bold text-slate-400">
                          {item.contractQuantity.toLocaleString('tr-TR')}
                        </td>
                        <td className={`p-4 text-right text-[11px] font-mono font-black ${isExceeding ? 'text-rose-600' : 'text-blue-600'}`}>
                          <div className="flex items-center justify-end gap-1">
                            {isExceeding && <AlertCircle className="w-3 h-3 animate-pulse" />}
                            {completedQty.toLocaleString('tr-TR')}
                          </div>
                        </td>
                        <td className="p-4 text-right text-[11px] font-mono font-black text-slate-800 bg-slate-50/50">
                          {totalValue.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-900 text-white">
                    <td colSpan={6} className="p-4 text-[10px] font-black uppercase tracking-[0.2em] text-right">Onaylı Sözleşme İcmali:</td>
                    <td className="p-4 text-right text-xs font-black font-mono">
                      {totalPaid.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'payments' && (
          <div className="space-y-4 animate-in slide-in-from-right duration-300">
             <div className="flex justify-between items-center no-print">
               <button 
                  onClick={onNewPayment}
                  className="flex-1 py-6 border-2 border-dashed border-orange-200 bg-orange-50/20 rounded-[2rem] text-orange-600 font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-orange-50 active:scale-95 transition-all group mr-4"
                >
                  <div className="p-2 bg-orange-600 rounded-xl text-white group-hover:scale-110 transition-transform">
                    <Plus className="w-5 h-5" />
                  </div>
                  YENİ HAKEDİŞ HAZIRLA
                </button>
                <button 
                  onClick={handleExportPayments}
                  disabled={!subcontractor.progressPayments || subcontractor.progressPayments.length === 0}
                  className="p-5 bg-white border border-slate-200 rounded-[2rem] text-emerald-600 hover:bg-emerald-50 active:scale-95 transition-all disabled:opacity-50 shadow-sm"
                  title="Hakediş İcmalini Excel Olarak İndir"
                >
                  <FileSpreadsheet className="w-6 h-6" />
                </button>
             </div>

              {!subcontractor.progressPayments || subcontractor.progressPayments.length === 0 ? (
                <div className="text-center py-12 px-6 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm">
                   <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FileText className="text-slate-300 w-8 h-8" />
                   </div>
                   <p className="text-slate-400 text-sm font-medium">Henüz bir hakediş kaydı bulunmuyor.</p>
                </div>
              ) : (
                [...subcontractor.progressPayments].sort((a,b) => b.number - a.number).map(p => (
                  <div key={p.id} className={`bg-white p-5 rounded-[2rem] border relative overflow-hidden group transition-all text-left ${p.status === 'Pending' ? 'border-orange-200 shadow-orange-50' : 'border-slate-100 shadow-sm hover:border-green-100'}`}>
                    {p.status === 'Pending' && (
                      <div className="absolute top-0 left-0 w-1.5 h-full bg-orange-500" />
                    )}
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                       <FileText className="w-16 h-16" />
                    </div>
                    <div className="flex justify-between items-center mb-5 relative z-10">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-2xl border ${p.status === 'Pending' ? 'bg-orange-50 border-orange-100' : 'bg-green-50 border-green-100'}`}>
                           <FileText className={`${p.status === 'Pending' ? 'text-orange-600' : 'text-green-600'} w-6 h-6`} />
                        </div>
                        <div>
                           <div className="flex items-center gap-2">
                             <p className="text-sm font-black text-slate-800">Hakediş #{p.number}</p>
                             {p.status === 'Pending' ? (
                               <span className="flex items-center gap-1 text-[8px] font-black bg-orange-500 text-white px-2 py-0.5 rounded-full uppercase">
                                 <Clock className="w-2 h-2" /> Onay Bekliyor
                               </span>
                             ) : (
                               <span className="flex items-center gap-1 text-[8px] font-black bg-emerald-500 text-white px-2 py-0.5 rounded-full uppercase">
                                 <CheckCircle2 className="w-2 h-2" /> Onaylı
                               </span>
                             )}
                           </div>
                           <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase mt-0.5">
                             <Calendar className="w-3 h-3" />
                             {new Date(p.date).toLocaleDateString('tr-TR')}
                           </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-lg font-black ${p.status === 'Pending' ? 'text-orange-600' : 'text-green-600'}`}>{p.summary.netPayable.toLocaleString('tr-TR')} TL</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase">NET TUTAR</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 bg-slate-50/80 p-3 rounded-2xl relative z-10 border border-slate-100/50 mb-4">
                      <div className="text-center">
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">Önceki</p>
                        <p className="text-[11px] font-bold text-slate-600">{p.summary.previousTotal.toLocaleString('tr-TR')} TL</p>
                      </div>
                      <div className="text-center border-x border-slate-200">
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">Bu Dönem</p>
                        <p className="text-[11px] font-black text-blue-600">{p.summary.currentTotal.toLocaleString('tr-TR')} TL</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">Kümülatif</p>
                        <p className="text-[11px] font-black text-slate-800">{p.summary.cumulativeTotal.toLocaleString('tr-TR')} TL</p>
                      </div>
                    </div>

                    {p.status === 'Pending' && (
                      <div className="flex gap-2 relative z-10 no-print">
                        <button 
                          onClick={() => setApprovingPayment(p)}
                          className="flex-1 bg-orange-600 text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-orange-100 active:scale-95 transition-all"
                        >
                          <ShieldCheck className="w-4 h-4" /> İncele ve Onayla
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
          </div>
        )}

        {activeTab === 'docs' && (
          <div className="space-y-6 animate-in slide-in-from-bottom duration-300 pb-10">
            <div className="flex justify-between items-center px-1 no-print">
              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-widest">Belge Galerisi</h3>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                className="hidden" 
                accept="image/*"
                multiple
              />
            </div>
            
            {/* Multi-purpose Drop Zone / Upload Area */}
            <div 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => !isUploading && fileInputRef.current?.click()}
              className={`
                relative overflow-hidden transition-all duration-300
                bg-white border-2 border-dashed rounded-[2.5rem] p-10
                flex flex-col items-center text-center gap-4 no-print shadow-sm
                ${isUploading ? 'cursor-not-allowed opacity-70 border-slate-200' : 'cursor-pointer'}
                ${isDragging && !isUploading ? 'border-blue-600 bg-blue-50/50 scale-[1.02]' : (!isUploading ? 'border-slate-200 hover:border-blue-400 hover:bg-blue-50/10' : '')}
              `}
            >
              <div className={`
                p-5 rounded-[2rem] transition-all duration-300
                ${isDragging && !isUploading ? 'bg-blue-600 text-white rotate-12 scale-110' : 'bg-slate-50 text-slate-400'}
                ${isUploading ? 'bg-blue-50 text-blue-600' : ''}
              `}>
                {isUploading ? (
                  <Loader2 className="w-10 h-10 animate-spin" />
                ) : (
                  <UploadCloud className="w-10 h-10" />
                )}
              </div>
              <div className="space-y-1">
                <p className="text-sm font-black text-slate-800 uppercase tracking-tight">
                  {isUploading ? 'Belgeler Yükleniyor...' : (isDragging ? 'Dosyaları Buraya Bırakın' : 'Belge Yüklemek İçin Tıklayın veya Sürükleyin')}
                </p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                  PNG, JPG veya JPEG Formatında Görseller
                </p>
              </div>
              
              {/* Floating notification for dragging */}
              {isDragging && !isUploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-blue-600/10 backdrop-blur-[1px] pointer-events-none">
                  <span className="bg-blue-600 text-white px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest animate-bounce shadow-xl">
                    BIRAKINIZ
                  </span>
                </div>
              )}
            </div>
            
            {(subcontractor.contractDocuments && subcontractor.contractDocuments.length > 0) ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 animate-in fade-in duration-500">
                {subcontractor.contractDocuments.map((doc) => (
                  <div 
                    key={doc.id} 
                    className="bg-white p-2 rounded-[2rem] border border-slate-100 shadow-sm group relative animate-in zoom-in-95 duration-200"
                  >
                    <div className="aspect-square rounded-2xl overflow-hidden bg-slate-50 relative">
                      <img 
                        src={doc.url} 
                        alt={doc.name} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px] gap-3 no-print">
                        <button 
                          onClick={(e) => { e.stopPropagation(); setPreviewDoc(doc); }}
                          className="p-2.5 bg-white text-slate-800 rounded-full hover:bg-blue-50 transition-colors shadow-lg"
                        >
                          <ZoomIn className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleRemoveDoc(doc.id); }}
                          className="p-2.5 bg-white text-red-600 rounded-full hover:bg-red-50 transition-colors shadow-lg"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                    <div className="p-2 pt-3">
                      <p className="text-[10px] font-black text-slate-700 truncate uppercase tracking-tight">{doc.name}</p>
                      <p className="text-[8px] text-slate-400 font-bold mt-0.5 uppercase tracking-widest">{new Date(doc.uploadDate).toLocaleDateString('tr-TR')}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
};

export default SubcontractorDetail;
