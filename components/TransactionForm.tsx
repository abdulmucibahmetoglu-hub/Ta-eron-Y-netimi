
import React, { useState } from 'react';
import { Transaction, Project } from '../types';
import { ArrowLeft, Save, Wallet, Briefcase, Info } from 'lucide-react';

interface TransactionFormProps {
  projects: Project[];
  onCancel: () => void;
  onSave: (transaction: Transaction) => void;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ projects, onCancel, onSave }) => {
  const [projectId, setProjectId] = useState(projects[0]?.id || '');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [category, setCategory] = useState<Transaction['category']>('Diğer');
  const [amount, setAmount] = useState<number>(0);
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSave = () => {
    if (!projectId || amount <= 0 || !description) return;
    onSave({
      id: Math.random().toString(36).substr(2, 9),
      projectId,
      type,
      category,
      amount,
      description,
      date
    });
  };

  const categories = type === 'income' 
    ? ['Hakediş Tahsilatı', 'Diğer'] 
    : ['Taşeron Hakedişi', 'Akaryakıt', 'Malzeme', 'Personel', 'Kira', 'Vergi', 'Diğer'];

  return (
    <div className="space-y-6 pb-20 animate-in slide-in-from-right duration-500 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onCancel} className="p-2 bg-white rounded-xl shadow-sm border border-slate-100">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <h2 className="text-xl font-bold text-slate-800">Yeni Finansal Kayıt</h2>
        </div>
        <button 
          onClick={handleSave}
          className="bg-slate-900 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 font-bold active:scale-95 transition-all shadow-lg"
        >
          <Save className="w-4 h-4" /> Kaydet
        </button>
      </div>

      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
        <div className="flex p-1 bg-slate-100 rounded-2xl">
          <button 
            onClick={() => { setType('expense'); setCategory('Diğer'); }}
            className={`flex-1 py-3 rounded-xl text-xs font-black uppercase transition-all ${type === 'expense' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-400'}`}
          >
            GİDER
          </button>
          <button 
            onClick={() => { setType('income'); setCategory('Hakediş Tahsilatı'); }}
            className={`flex-1 py-3 rounded-xl text-xs font-black uppercase transition-all ${type === 'income' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'}`}
          >
            GELİR
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">İlgili Proje</label>
            <select 
              value={projectId} 
              onChange={(e) => setProjectId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 text-xs font-bold outline-none focus:ring-2 focus:ring-slate-400"
            >
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Kategori</label>
            <select 
              value={category} 
              onChange={(e) => setCategory(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 text-xs font-bold outline-none focus:ring-2 focus:ring-slate-400"
            >
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">İşlem Tutarı (TL)</label>
          <div className="relative">
            <Wallet className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input 
              type="number" 
              value={amount || ''}
              onChange={(e) => setAmount(Number(e.target.value))}
              placeholder="0.00"
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-14 pr-5 py-5 text-2xl font-black text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">İşlem Detayı / Açıklama</label>
          <div className="relative">
            <Info className="absolute left-5 top-5 text-slate-400 w-5 h-5" />
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="İşlemle ilgili notunuz..."
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-14 pr-5 py-4 text-sm font-bold min-h-[100px] focus:outline-none focus:ring-2 focus:ring-slate-400"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">İşlem Tarihi</label>
          <input 
            type="date" 
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold uppercase outline-none focus:ring-2 focus:ring-slate-400"
          />
        </div>
      </div>
    </div>
  );
};

export default TransactionForm;
