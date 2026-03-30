
import React, { useState, useRef } from 'react';
import { Subcontractor, WorkItem, UnitType, ContractDocument } from '../types';
import { ArrowLeft, Save, Plus, Trash2, Sparkles, FileUp, Image as ImageIcon, X } from 'lucide-react';
import { parseWorkItemsFromText } from '../services/geminiService';

interface AddSubcontractorFormProps {
  onCancel: () => void;
  onSave: (sub: Subcontractor) => void;
}

const AddSubcontractorForm: React.FC<AddSubcontractorFormProps> = ({ onCancel, onSave }) => {
  const [name, setName] = useState('');
  const [trade, setTrade] = useState('');
  const [workItems, setWorkItems] = useState<Partial<WorkItem>[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [parseText, setParseText] = useState('');
  const [contractDocuments, setContractDocuments] = useState<ContractDocument[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddWorkItem = () => {
    setWorkItems([...workItems, { id: Math.random().toString(36).substr(2, 9), description: '', unit: UnitType.M2, unitPrice: 0, contractQuantity: 0 }]);
  };

  const handleRemoveWorkItem = (id: string) => {
    setWorkItems(workItems.filter(item => item.id !== id));
  };

  const handleSmartParse = async () => {
    if (!parseText) return;
    setIsParsing(true);
    try {
      const items = await parseWorkItemsFromText(parseText);
      const itemsWithIds = items.map((i: any) => ({ ...i, id: Math.random().toString(36).substr(2, 9) }));
      setWorkItems([...workItems, ...itemsWithIds]);
      setParseText('');
    } catch (e) {
      alert("İş kalemleri ayrıştırılırken hata oluştu.");
    } finally {
      setIsParsing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newDoc: ContractDocument = {
          id: Math.random().toString(36).substr(2, 9),
          url: reader.result as string,
          name: file.name,
          uploadDate: new Date().toISOString()
        };
        setContractDocuments([...contractDocuments, newDoc]);
      };
      reader.readAsDataURL(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveDoc = (id: string) => {
    setContractDocuments(contractDocuments.filter(d => d.id !== id));
  };

  const handleSave = () => {
    const sub: Subcontractor = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      trade,
      contractDate: new Date().toISOString(),
      totalContractValue: workItems.reduce((sum, item) => sum + (item.unitPrice! * item.contractQuantity!), 0),
      workItems: workItems as WorkItem[],
      progressPayments: [],
      contractDocuments
    };
    onSave(sub);
  };

  return (
    <div className="space-y-6 pb-20 animate-in slide-in-from-right duration-500 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onCancel} className="p-2 bg-white rounded-xl shadow-sm border border-slate-100"><ArrowLeft className="w-5 h-5 text-slate-600" /></button>
          <h2 className="text-xl font-bold text-slate-800">Yeni Taşeron Kaydı</h2>
        </div>
        <button 
          onClick={handleSave}
          disabled={!name || !trade || workItems.length === 0}
          className="bg-blue-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-bold shadow-lg shadow-blue-200 active:scale-95 disabled:opacity-50 transition-all"
        >
          <Save className="w-4 h-4" /> Kaydet
        </button>
      </div>

      <div className="space-y-4">
        {/* Basic Info */}
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">Firma / Usta Adı</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Örn: ABC İnşaat Ltd Şti"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">Branş / İş Kolu</label>
            <input 
              type="text" 
              value={trade}
              onChange={(e) => setTrade(e.target.value)}
              placeholder="Örn: Kaba Yapı, Elektrik Tesisat..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
        </div>

        {/* Contract Document Upload Gallery */}
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-3">
           <div className="flex justify-between items-center mb-1">
             <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Sözleşme Belgeleri</label>
             {contractDocuments.length > 0 && (
               <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{contractDocuments.length} Belge</span>
             )}
           </div>
           
           <div className="flex flex-wrap gap-2">
             {contractDocuments.map((doc) => (
               <div key={doc.id} className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-200 group">
                 <img src={doc.url} alt={doc.name} className="w-full h-full object-cover" />
                 <button 
                  onClick={() => handleRemoveDoc(doc.id)}
                  className="absolute inset-0 bg-red-600/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                 >
                   <Trash2 className="w-4 h-4" />
                 </button>
               </div>
             ))}
             <button 
              onClick={() => fileInputRef.current?.click()}
              className="w-16 h-16 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center text-slate-400 hover:border-blue-400 hover:bg-blue-50 transition-all"
             >
                <Plus className="w-5 h-5" />
             </button>
           </div>
           <input 
             type="file" 
             ref={fileInputRef} 
             onChange={handleFileUpload} 
             className="hidden" 
             accept="image/*"
           />
        </div>

        {/* AI Smart Parse */}
        <div className="bg-indigo-50 p-5 rounded-[2rem] border border-indigo-100 space-y-3 shadow-inner">
           <div className="flex items-center gap-2 text-indigo-700 font-black uppercase text-[10px] tracking-widest">
             <Sparkles className="w-4 h-4" /> Yapay Zeka ile İş Kalemi Oluştur
           </div>
           <textarea 
            placeholder="Örn: 200 m2 şap işi m2'si 150 TL'den, 50 mt süpürgelik mt'si 40 TL'den..."
            className="w-full bg-white border border-indigo-200 rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[100px] shadow-sm transition-all"
            value={parseText}
            onChange={(e) => setParseText(e.target.value)}
           />
           <button 
             onClick={handleSmartParse}
             disabled={isParsing || !parseText}
             className="w-full bg-indigo-600 text-white py-3 rounded-2xl text-xs font-black uppercase tracking-widest active:scale-[0.98] transition-all disabled:opacity-50 shadow-lg shadow-indigo-200"
           >
             {isParsing ? 'Veriler Analiz Ediliyor...' : 'İş Kalemlerini Ayrıştır'}
           </button>
        </div>

        {/* Work Items List */}
        <div className="space-y-3">
           <div className="flex justify-between items-center px-1">
             <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">İş Kalemleri Detayı</h3>
             <button 
              onClick={handleAddWorkItem} 
              className="text-blue-600 text-[10px] font-black uppercase flex items-center gap-1.5 bg-blue-50 px-4 py-2 rounded-full active:scale-95 transition-all shadow-sm"
             >
               <Plus className="w-3 h-3" /> Yeni Kalem
             </button>
           </div>

           {workItems.length === 0 && (
             <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] p-10 text-center">
                <p className="text-xs text-slate-400 font-medium">Henüz iş kalemi eklenmedi. Manuel ekleyebilir veya yukarıdaki yapay zeka aracını kullanabilirsiniz.</p>
             </div>
           )}

           {workItems.map((item, idx) => (
             <div key={item.id} className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm space-y-4 relative group animate-in slide-in-from-right duration-300">
                <button 
                  onClick={() => handleRemoveWorkItem(item.id!)}
                  className="absolute top-5 right-5 text-slate-200 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1.5 ml-1">İş Tanımı</label>
                  <input 
                    type="text" 
                    value={item.description}
                    onChange={(e) => {
                      const newItems = [...workItems];
                      newItems[idx].description = e.target.value;
                      setWorkItems(newItems);
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1.5 ml-1">Birim</label>
                    <select 
                      value={item.unit}
                      onChange={(e) => {
                        const newItems = [...workItems];
                        newItems[idx].unit = e.target.value as UnitType;
                        setWorkItems(newItems);
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-[10px] font-bold uppercase"
                    >
                      {Object.values(UnitType).map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1.5 ml-1">Birim Fiyat</label>
                    <input 
                      type="number" 
                      value={item.unitPrice}
                      onChange={(e) => {
                        const newItems = [...workItems];
                        newItems[idx].unitPrice = Number(e.target.value);
                        setWorkItems(newItems);
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-black text-slate-700"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1.5 ml-1">Miktar</label>
                    <input 
                      type="number" 
                      value={item.contractQuantity}
                      onChange={(e) => {
                        const newItems = [...workItems];
                        newItems[idx].contractQuantity = Number(e.target.value);
                        setWorkItems(newItems);
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-black text-slate-700"
                    />
                  </div>
                </div>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
};

export default AddSubcontractorForm;
