
import React, { useState } from 'react';
import { Project } from '../types';
import { ArrowLeft, Save, Building2, MapPin, Calendar, Hash, Landmark, Wallet } from 'lucide-react';

interface ProjectFormProps {
  onCancel: () => void;
  onSave: (project: Project) => void;
}

const ProjectForm: React.FC<ProjectFormProps> = ({ onCancel, onSave }) => {
  const [name, setName] = useState('');
  const [ikn, setIkn] = useState('');
  const [client, setClient] = useState('');
  const [location, setLocation] = useState('');
  const [budget, setBudget] = useState<number>(0);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSave = () => {
    if (!name || !client) return;
    onSave({
      id: Math.random().toString(36).substr(2, 9),
      ikn,
      name,
      client,
      location,
      totalBudget: budget,
      startDate,
      status: 'Devam Ediyor'
    });
  };

  return (
    <div className="space-y-6 pb-20 animate-in slide-in-from-right duration-500 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onCancel} className="p-2 bg-white rounded-xl shadow-sm border border-slate-100">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <h2 className="text-xl font-bold text-slate-800">Kamu Taahhüt Projesi</h2>
        </div>
        <button 
          onClick={handleSave}
          className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 font-bold shadow-lg shadow-indigo-200 active:scale-95 transition-all"
        >
          <Save className="w-4 h-4" /> Projeyi Başlat
        </button>
      </div>

      <div className="space-y-4">
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                <Hash className="w-3 h-3" /> İhale Kayıt No (İKN)
              </label>
              <input 
                type="text" 
                value={ikn}
                onChange={(e) => setIkn(e.target.value)}
                placeholder="Örn: 2024/123456"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-bold"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                <Landmark className="w-3 h-3" /> İdare Adı
              </label>
              <input 
                type="text" 
                value={client}
                onChange={(e) => setClient(e.target.value)}
                placeholder="Örn: Karayolları 1. Bölge"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-bold"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1">
              <Building2 className="w-3 h-3" /> İşin Adı
            </label>
            <textarea 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Sözleşmedeki tam iş adı..."
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-bold min-h-[80px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                <Wallet className="w-3 h-3" /> Sözleşme Bedeli (TL)
              </label>
              <input 
                type="number" 
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-bold"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Yer Teslim Tarihi
              </label>
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-bold uppercase"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1">
              <MapPin className="w-3 h-3" /> İşin Yeri
            </label>
            <input 
              type="text" 
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Şehir / İlçe"
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-bold"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectForm;
