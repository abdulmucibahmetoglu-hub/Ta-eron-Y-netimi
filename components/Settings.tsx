
import React, { useState, useEffect } from 'react';
import { 
  User, 
  Settings as SettingsIcon, 
  Database, 
  Download, 
  Upload, 
  Trash2, 
  ShieldAlert, 
  Bell, 
  Info,
  Building2,
  Briefcase,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';

interface SettingsProps {
  onResetData: () => void;
  onImportData: (data: any) => void;
  allData: any;
}

const Settings: React.FC<SettingsProps> = ({ onResetData, onImportData, allData }) => {
  const [userName, setUserName] = useState(localStorage.getItem('user_name') || '');
  const [companyName, setCompanyName] = useState(localStorage.getItem('company_name') || '');
  const [role, setRole] = useState(localStorage.getItem('user_role') || 'Proje Müdürü');
  const [isSaved, setIsSaved] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleSaveProfile = () => {
    localStorage.setItem('user_name', userName);
    localStorage.setItem('company_name', companyName);
    localStorage.setItem('user_role', role);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleExportData = () => {
    const dataStr = JSON.stringify(allData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Santiye_Pro_Yedek_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (confirm('Mevcut verileriniz silinecek ve yedek yüklenecek. Onaylıyor musunuz?')) {
          onImportData(json);
          alert('Veriler başarıyla yüklendi!');
        }
      } catch (err) {
        alert('Geçersiz yedek dosyası.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="px-1">
        <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Kullanıcı & Ayarlar</h1>
        <p className="text-[10px] text-orange-600 font-bold uppercase tracking-widest mt-1">Sistem ve Profil Tercihleri</p>
      </div>

      {/* Profile Section */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 bg-slate-50/50 border-b border-slate-100 flex items-center gap-3">
          <div className="p-2 bg-slate-900 rounded-xl text-white">
            <User className="w-5 h-5" />
          </div>
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Kullanıcı Profili</h3>
        </div>
        <div className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Ad Soyad</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
              <input 
                type="text" 
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Örn: Ahmet Yılmaz"
                className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-orange-500 outline-none transition-all"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Şirket / Firma Adı</label>
            <div className="relative">
              <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
              <input 
                type="text" 
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Örn: Ahmetoğlu İnşaat A.Ş."
                className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-orange-500 outline-none transition-all"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Görev / Unvan</label>
            <div className="relative">
              <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
              <select 
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-orange-500 outline-none transition-all appearance-none"
              >
                <option value="Proje Müdürü">Proje Müdürü</option>
                <option value="Şantiye Şefi">Şantiye Şefi</option>
                <option value="Hakediş Mühendisi">Hakediş Mühendisi</option>
                <option value="Firma Sahibi">Firma Sahibi</option>
              </select>
            </div>
          </div>
          <button 
            onClick={handleSaveProfile}
            className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 ${isSaved ? 'bg-emerald-500 text-white' : 'bg-orange-600 text-white shadow-lg shadow-orange-200 active:scale-95'}`}
          >
            {isSaved ? <><CheckCircle2 className="w-4 h-4" /> Güncellendi</> : 'Değişiklikleri Kaydet'}
          </button>
        </div>
      </div>

      {/* Data Operations */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 bg-slate-50/50 border-b border-slate-100 flex items-center gap-3">
          <div className="p-2 bg-slate-900 rounded-xl text-white">
            <Database className="w-5 h-5" />
          </div>
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Veri Yönetimi</h3>
        </div>
        <div className="p-6 space-y-3">
          <button 
            onClick={handleExportData}
            className="w-full p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl flex items-center justify-between group transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg shadow-sm group-hover:bg-blue-50 transition-colors">
                <Download className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-left">
                <p className="text-xs font-black text-slate-800 uppercase">Tüm Verileri Yedekle</p>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">JSON Formatında İndir</p>
              </div>
            </div>
            <RefreshCw className="w-4 h-4 text-slate-200 group-hover:rotate-180 transition-transform duration-500" />
          </button>

          <label className="w-full p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl flex items-center justify-between group transition-all cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg shadow-sm group-hover:bg-emerald-50 transition-colors">
                <Upload className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-left">
                <p className="text-xs font-black text-slate-800 uppercase">Yedek Dosyası Yükle</p>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">Cihazdan JSON Dosyası Seç</p>
              </div>
            </div>
            <input type="file" className="hidden" accept=".json" onChange={handleImportFile} />
          </label>

          <div className="pt-4 mt-2 border-t border-slate-50">
            {showResetConfirm ? (
              <div className="bg-rose-50 p-4 rounded-2xl border border-rose-100 animate-in zoom-in-95 duration-200">
                <div className="flex items-start gap-3 mb-4">
                  <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
                  <p className="text-[11px] font-bold text-rose-700 leading-relaxed uppercase">
                    Tüm projeleriniz, taşeronlarınız ve hakedişleriniz kalıcı olarak silinecektir. Bu işlem geri alınamaz!
                  </p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => { onResetData(); setShowResetConfirm(false); }}
                    className="flex-1 bg-rose-600 text-white py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-rose-200"
                  >
                    Evet, Her Şeyi Sil
                  </button>
                  <button 
                    onClick={() => setShowResetConfirm(false)}
                    className="flex-1 bg-white text-slate-600 py-2.5 rounded-xl text-[10px] font-black uppercase border border-slate-200"
                  >
                    Vazgeç
                  </button>
                </div>
              </div>
            ) : (
              <button 
                onClick={() => setShowResetConfirm(true)}
                className="w-full p-4 text-rose-600 bg-rose-50/50 hover:bg-rose-50 rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all"
              >
                <Trash2 className="w-4 h-4" /> Fabrika Ayarlarına Dön
              </button>
            )}
          </div>
        </div>
      </div>

      {/* App Info */}
      <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <SettingsIcon className="w-32 h-32" />
        </div>
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-orange-600 rounded-2xl flex items-center justify-center shadow-2xl mb-4">
            <Info className="w-8 h-8 text-white" />
          </div>
          <h4 className="text-sm font-black uppercase tracking-[0.3em]">Ahmetoğlu Şantiye Pro</h4>
          <p className="text-[9px] text-slate-500 font-bold uppercase mt-2">Versiyon 1.4.2 (Stabil)</p>
          <div className="mt-6 pt-6 border-t border-white/5 w-full grid grid-cols-2 gap-4">
            <div className="text-left">
              <p className="text-[8px] text-slate-500 font-black uppercase mb-1">Geliştirici</p>
              <p className="text-[10px] font-bold">Ahmetoğlu Yazılım</p>
            </div>
            <div className="text-left">
              <p className="text-[8px] text-slate-500 font-black uppercase mb-1">Lisans</p>
              <p className="text-[10px] font-bold">Kurumsal Sınırsız</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
