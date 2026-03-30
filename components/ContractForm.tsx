
import React, { useState } from 'react';
import { Project, Subcontractor, Contract, UnitType, WorkItem } from '../types';
import { ArrowLeft, Save, Plus, Trash2, FileText, Hash } from 'lucide-react';

interface ContractFormProps {
  projects: Project[];
  subcontractors: Subcontractor[];
  onCancel: () => void;
  onSave: (contract: Contract) => void;
}

const ContractForm: React.FC<ContractFormProps> = ({ projects, subcontractors, onCancel, onSave }) => {
  const [projectId, setProjectId] = useState(projects[0]?.id || '');
  const [subId, setSubId] = useState(subcontractors[0]?.id || '');
  const [title, setTitle] = useState('');
  const [workItems, setWorkItems] = useState<WorkItem[]>([]);

  const handleAddWorkItem = () => {
    setWorkItems([...workItems, { 
      id: Math.random().toString(36).substr(2, 9), 
      pozNo: '',
      description: '', 
      unit: UnitType.M2, 
      unitPrice: 0, 
      contractQuantity: 0, 
      completedQuantity: 0 
    }]);
  };

  const handleSave = () => {
    if (!projectId || !subId || !title || workItems.length === 0) return;
    const totalValue = workItems.reduce((sum, item) => sum + (item.unitPrice * item.contractQuantity), 0);
    
    onSave({
      id: Math.random().toString(36).substr(2, 9),
      projectId,
      subcontractorId: subId,
      title,
      contractDate: new Date().toISOString(),
      totalValue,
      workItems,
      progressPayments: [],
      documents: [],
      status: 'Aktif'
    });
  };

  return (
    <div className="space-y-6 pb-24 animate-in slide-in-from-right duration-500 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onCancel} className="p-2 bg-white rounded-xl shadow-sm border border-slate-100">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <h2 className="text-xl font-bold text-slate-800">Alt Yüklenici Sözleşmesi</h2>
        </div>
        <button 
          onClick={handleSave}
          className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 font-bold shadow-lg shadow-indigo-200 active:scale-95 transition-all"
        >
          <Save className="w-4 h-4" /> Sözleşmeyi Bağla
        </button>
      </div>

      <div className="space-y-4">
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-5">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Sözleşme / İş Tanımı</label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Örn: Viyadük-1 İnce İşler Paketi"
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-bold"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">İlgili Kamu Projesi</label>
              <select 
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {projects.map(p => <option key={p.id} value={p.id}>{p.name} ({p.client})</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Taşeron Firma</label>
              <select 
                value={subId}
                onChange={(e) => setSubId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {subcontractors.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center px-1">
            <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest">Metraj ve Birim Fiyatlar</h3>
            <button 
              onClick={handleAddWorkItem}
              className="bg-indigo-50 text-indigo-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase flex items-center gap-1 shadow-sm"
            >
              <Plus className="w-3 h-3" /> Poz Ekle
            </button>
          </div>

          {workItems.map((item, idx) => (
            <div key={item.id} className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm space-y-4 relative group animate-in zoom-in-95">
              <button 
                onClick={() => setWorkItems(workItems.filter(i => i.id !== item.id))}
                className="absolute top-4 right-4 text-slate-200 hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                   <label className="text-[9px] font-bold text-slate-400 uppercase ml-1">Poz No</label>
                   <input 
                    type="text"
                    value={item.pozNo}
                    onChange={(e) => {
                      const next = [...workItems];
                      next[idx].pozNo = e.target.value;
                      setWorkItems(next);
                    }}
                    placeholder="15.150.1001"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-[9px] font-bold text-slate-400 uppercase ml-1">İş Kalemi Tanımı</label>
                  <input 
                    type="text"
                    value={item.description}
                    onChange={(e) => {
                      const next = [...workItems];
                      next[idx].description = e.target.value;
                      setWorkItems(next);
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase ml-1">Birim</label>
                  <select 
                    value={item.unit}
                    onChange={(e) => {
                      const next = [...workItems];
                      next[idx].unit = e.target.value as UnitType;
                      setWorkItems(next);
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-2 text-[10px] font-black uppercase"
                  >
                    {Object.values(UnitType).map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase ml-1">Teklif Fiyatı</label>
                  <input 
                    type="number"
                    value={item.unitPrice}
                    onChange={(e) => {
                      const next = [...workItems];
                      next[idx].unitPrice = Number(e.target.value);
                      setWorkItems(next);
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-black"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase ml-1">Miktar</label>
                  <input 
                    type="number"
                    value={item.contractQuantity}
                    onChange={(e) => {
                      const next = [...workItems];
                      next[idx].contractQuantity = Number(e.target.value);
                      setWorkItems(next);
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-black"
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

export default ContractForm;
