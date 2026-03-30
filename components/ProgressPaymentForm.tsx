
import React, { useState, useMemo } from 'react';
import { Subcontractor, ProgressPayment, UnitType } from '../types';
import { ArrowLeft, Save, AlertCircle, Calculator, Percent, ShieldCheck, ChevronDown, ChevronUp, ReceiptText, Landmark, Wallet2 } from 'lucide-react';

interface ProgressPaymentFormProps {
  subcontractor: Subcontractor;
  onCancel: () => void;
  onSave: (payment: ProgressPayment) => void;
}

const ProgressPaymentForm: React.FC<ProgressPaymentFormProps> = ({ subcontractor, onCancel, onSave }) => {
  const [quantities, setQuantities] = useState<Record<string, number>>(
    (subcontractor.workItems || []).reduce((acc, item) => ({ ...acc, [item.id]: 0 }), {})
  );

  const [vatRate, setVatRate] = useState(20);
  const [retentionRate, setRetentionRate] = useState(5); 
  const [showBreakdown, setShowBreakdown] = useState(false);
  const STAMP_DUTY_RATE = 0.00948;

  // Calculate the next available payment number based on existing payments
  const nextNumber = useMemo(() => {
    if (!subcontractor.progressPayments || subcontractor.progressPayments.length === 0) {
      return 1;
    }
    const maxNum = Math.max(...subcontractor.progressPayments.map(p => p.number));
    return maxNum + 1;
  }, [subcontractor.progressPayments]);

  const itemProgress = useMemo(() => {
    return (subcontractor.workItems || []).map(item => {
      const prevTotal = (subcontractor.progressPayments || [])
        .filter(p => p.status === 'Approved')
        .reduce((sum, p) => {
          const pItem = p.items.find(i => i.workItemId === item.id);
          return sum + (pItem?.thisPeriodQuantity || 0);
        }, 0);

      const thisPeriod = quantities[item.id] || 0;
      const cumulative = prevTotal + thisPeriod;
      const amount = thisPeriod * item.unitPrice;
      const remaining = item.contractQuantity - prevTotal;
      const isExceeding = cumulative > item.contractQuantity;

      return {
        ...item,
        prevTotal,
        thisPeriod,
        cumulative,
        amount,
        remaining,
        isExceeding
      };
    });
  }, [subcontractor, quantities]);

  const summary = useMemo(() => {
    const currentTotal = itemProgress.reduce((sum, i) => sum + i.amount, 0);
    const lastApprovedPayment = [...(subcontractor.progressPayments || [])].reverse().find(p => p.status === 'Approved');
    const previousTotal = lastApprovedPayment?.summary.cumulativeTotal || 0;
    const cumulativeTotal = previousTotal + currentTotal;
    
    const retentionAmount = (currentTotal * retentionRate) / 100;
    const stampDutyAmount = currentTotal * STAMP_DUTY_RATE;
    const totalDeductions = retentionAmount + stampDutyAmount;
    const vatAmount = (currentTotal * vatRate) / 100;
    const netPayable = currentTotal - totalDeductions + vatAmount;

    return {
      previousTotal,
      currentTotal,
      cumulativeTotal,
      retentionAmount,
      stampDutyAmount,
      totalDeductions,
      vatAmount,
      netPayable
    };
  }, [itemProgress, retentionRate, vatRate, subcontractor.progressPayments]);

  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleOpenConfirm = () => {
    setShowConfirmModal(true);
  };

  const handleConfirmSave = () => {
    const newPayment: ProgressPayment = {
      id: Math.random().toString(36).substr(2, 9),
      number: nextNumber,
      date: new Date().toISOString(),
      contractId: '', 
      status: 'Pending',
      items: itemProgress.map(i => ({
        workItemId: i.id,
        thisPeriodQuantity: i.thisPeriod,
        cumulativeQuantity: i.cumulative
      })),
      summary: {
        previousTotal: summary.previousTotal,
        currentTotal: summary.currentTotal,
        cumulativeTotal: summary.cumulativeTotal,
        retentionAmount: summary.retentionAmount,
        stampDutyAmount: summary.stampDutyAmount,
        vatAmount: summary.vatAmount,
        netPayable: summary.netPayable
      }
    };
    onSave(newPayment);
    setShowConfirmModal(false);
  };

  return (
    <div className="space-y-6 pb-32 animate-in slide-in-from-bottom duration-500 max-w-3xl mx-auto px-4">
      <div className="flex items-center justify-between sticky top-0 bg-slate-50/80 backdrop-blur-md z-20 py-4 -mx-4 px-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <button onClick={onCancel} className="p-2 bg-white rounded-xl shadow-sm border border-slate-200 hover:bg-slate-50 transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div>
            <h2 className="text-lg md:text-xl font-black text-slate-900 tracking-tight">Hakediş Hazırla #{nextNumber}</h2>
            <p className="text-[10px] text-orange-600 font-black uppercase tracking-[0.2em] leading-none">{subcontractor.name}</p>
          </div>
        </div>
        <button 
          onClick={handleOpenConfirm}
          className="bg-orange-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 font-black shadow-lg shadow-orange-200 active:scale-95 transition-all uppercase text-[11px] tracking-widest"
        >
          <Check className="w-4 h-4" /> ONAYLA
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-3">
          <div className="p-2 bg-orange-50 rounded-2xl"><Percent className="w-4 h-4 text-orange-600" /></div>
          <div className="flex-1">
            <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">KDV Oranı</p>
            <select value={vatRate} onChange={(e) => setVatRate(Number(e.target.value))} className="w-full text-xs font-black text-slate-900 bg-transparent focus:outline-none appearance-none cursor-pointer">
              <option value={0}>%0 (Muaf)</option>
              <option value={10}>%10</option>
              <option value={20}>%20</option>
            </select>
          </div>
        </div>
        <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-3">
          <div className="p-2 bg-slate-50 rounded-2xl"><ShieldCheck className="w-4 h-4 text-slate-600" /></div>
          <div className="flex-1">
            <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Teminat (%)</p>
            <select value={retentionRate} onChange={(e) => setRetentionRate(Number(e.target.value))} className="w-full text-xs font-black text-slate-900 bg-transparent focus:outline-none appearance-none cursor-pointer">
              <option value={0}>%0</option>
              <option value={3}>%3</option>
              <option value={5}>%5</option>
              <option value={10}>%10</option>
            </select>
          </div>
        </div>
        <div className="col-span-2 bg-slate-900 p-4 rounded-3xl flex items-center gap-4 text-white">
          <div className="p-2 bg-white/10 rounded-2xl"><Calculator className="w-5 h-5 text-orange-400" /></div>
          <div>
            <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Brüt Hakediş Tutarı</p>
            <p className="text-lg font-black">{summary.currentTotal.toLocaleString('tr-TR')} TL</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {itemProgress.map((item, index) => (
          <div key={item.id} className={`bg-white rounded-[2rem] border transition-all ${item.isExceeding ? 'border-orange-200 bg-orange-50/20' : 'border-slate-100 shadow-sm'} overflow-hidden group`}>
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[9px] font-black bg-slate-900 text-white px-2 py-0.5 rounded-lg uppercase tracking-widest">POZ: {item.pozNo || index + 1}</span>
                    <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight">{item.description}</h4>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Birim Fiyat: <span className="text-slate-700 font-black">{item.unitPrice.toLocaleString('tr-TR')} TL / {item.unit}</span></p>
                    <span className="w-1 h-1 bg-slate-200 rounded-full" />
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Sözleşme: <span className="text-slate-700 font-black">{item.contractQuantity} {item.unit}</span></p>
                  </div>
                </div>
                {item.isExceeding && (
                  <div className="bg-orange-600 p-1.5 rounded-full text-white animate-pulse" title="Sözleşme Miktarı Aşıldı">
                    <AlertCircle className="w-4 h-4" />
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Önceki Toplam</label>
                  <div className="bg-white p-2.5 rounded-xl text-xs font-bold text-slate-500 border border-slate-100">{item.prevTotal}</div>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-orange-600 uppercase tracking-widest block">Bu Dönem</label>
                  <input 
                    type="number" 
                    value={item.thisPeriod || ''} 
                    onChange={(e) => setQuantities({ ...quantities, [item.id]: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-white border-2 border-orange-200 rounded-xl p-2 text-sm font-black text-orange-700 focus:border-orange-600 outline-none transition-all shadow-sm"
                    placeholder="0"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-900 uppercase tracking-widest block">Yeni Küm.</label>
                  <div className="bg-slate-900 p-2.5 rounded-xl text-xs font-black text-white">{item.cumulative}</div>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Kalan</label>
                  <div className={`p-2.5 rounded-xl text-xs font-bold border ${item.remaining < 0 ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-white text-slate-400 border-slate-100'}`}>
                    {item.remaining.toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-50 flex justify-between items-center">
                 <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">BU DÖNEM SATIR TUTARI</span>
                 <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-slate-800">{item.amount.toLocaleString('tr-TR')} TL</span>
                    <div className={`w-2 h-2 rounded-full ${item.thisPeriod > 0 ? 'bg-emerald-500 animate-pulse' : 'bg-slate-200'}`} />
                 </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Financial Summary Card */}
      <div className="fixed bottom-6 left-4 right-4 max-w-3xl mx-auto z-40 bg-slate-900 text-white rounded-[2.5rem] p-6 shadow-2xl relative overflow-hidden border-t-4 border-orange-600">
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] rotate-12">
          <ReceiptText className="w-48 h-48" />
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col items-center md:items-start">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-[9px] font-black text-orange-500 uppercase tracking-[0.4em]">Tahakkuk Bekleyen Net</p>
              <button 
                onClick={() => setShowBreakdown(!showBreakdown)}
                className="p-1 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
              >
                <ChevronDown className={`w-3 h-3 transition-transform ${showBreakdown ? 'rotate-180' : ''}`} />
              </button>
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-4xl font-black text-white tracking-tighter">{summary.netPayable.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}</p>
              <p className="text-lg font-bold text-slate-500">,{(summary.netPayable % 1).toFixed(2).substring(2)} TL</p>
            </div>
          </div>

          <div className="flex gap-2 w-full md:w-auto">
             <div className="flex-1 bg-white/5 border border-white/5 rounded-2xl p-3 text-center">
                <p className="text-[8px] text-slate-500 font-black uppercase">Kesintiler</p>
                <p className="text-xs font-bold text-rose-400">-{summary.totalDeductions.toLocaleString('tr-TR')} TL</p>
             </div>
             <div className="flex-1 bg-white/5 border border-white/5 rounded-2xl p-3 text-center">
                <p className="text-[8px] text-slate-500 font-black uppercase">KDV %{vatRate}</p>
                <p className="text-xs font-bold text-blue-400">+{summary.vatAmount.toLocaleString('tr-TR')} TL</p>
             </div>
          </div>
        </div>

        {showBreakdown && (
          <div className="mt-6 pt-6 border-t border-white/5 space-y-3 animate-in slide-in-from-top duration-300 relative z-10">
            <div className="flex justify-between items-center text-[10px] text-slate-400 uppercase tracking-widest">
              <span>Teminat Kesintisi (%{retentionRate})</span>
              <span className="text-rose-400">-{summary.retentionAmount.toLocaleString('tr-TR')} TL</span>
            </div>
            <div className="flex justify-between items-center text-[10px] text-slate-400 uppercase tracking-widest">
              <span>Damga Vergisi (0,00948)</span>
              <span className="text-rose-400">-{summary.stampDutyAmount.toLocaleString('tr-TR')} TL</span>
            </div>
            <div className="flex justify-between items-center text-[10px] text-slate-400 uppercase tracking-widest">
              <span>Kümülatif Toplam (Sözleşme Sonu)</span>
              <span className="text-white font-black">{summary.cumulativeTotal.toLocaleString('tr-TR')} TL</span>
            </div>
          </div>
        )}
      </div>
      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-6 border-b border-slate-100">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-orange-100 text-orange-600 rounded-xl">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-black text-slate-800">Hakedişi Onayla</h3>
              </div>
              <p className="text-sm text-slate-500 font-medium">
                Hakediş #{nextNumber} için son incelemeyi yapıp onaylayın.
              </p>
            </div>
            
            <div className="p-6 bg-slate-50/50 space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-slate-200/60">
                <span className="text-sm text-slate-500 font-bold">Toplam Tutar</span>
                <span className="text-sm font-black text-slate-800">{summary.currentTotal.toLocaleString('tr-TR')} TL</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-200/60">
                <span className="text-sm text-slate-500 font-bold">Kesintiler</span>
                <span className="text-sm font-black text-rose-500">-{summary.totalDeductions.toLocaleString('tr-TR')} TL</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-200/60">
                <span className="text-sm text-slate-500 font-bold">KDV (%{vatRate})</span>
                <span className="text-sm font-black text-blue-500">+{summary.vatAmount.toLocaleString('tr-TR')} TL</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-base text-slate-800 font-black">Net Ödenecek</span>
                <span className="text-xl font-black text-emerald-600">{summary.netPayable.toLocaleString('tr-TR')} TL</span>
              </div>
            </div>

            <div className="p-6 flex gap-3 bg-white border-t border-slate-100">
              <button 
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-3 px-4 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                İptal Et
              </button>
              <button 
                onClick={handleConfirmSave}
                className="flex-1 py-3 px-4 rounded-xl font-bold text-white bg-orange-600 hover:bg-orange-700 shadow-lg shadow-orange-200 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <Check className="w-5 h-5" />
                Onayla
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressPaymentForm;
