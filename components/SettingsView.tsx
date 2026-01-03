
import React, { useRef } from 'react';
import { AppSettings } from '../types';

interface Props {
  settings: AppSettings;
  onUpdate: (settings: AppSettings) => void;
  onImportData: (data: string) => void;
}

const SettingsView: React.FC<Props> = ({ settings, onUpdate, onImportData }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (key: keyof AppSettings, value: any) => {
    onUpdate({ ...settings, [key]: value });
  };

  const handleExport = () => {
    const storageKey = 'zentask_ai_premium_v5';
    const data = localStorage.getItem(storageKey);
    if (!data) return;
    
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `zentask_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        onImportData(content);
        alert('Workspace successfully restored!');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-3xl pb-20">
      <header>
        <h1 className="text-4xl font-extrabold tracking-tight text-black dark:text-white">System Settings</h1>
        <p className="text-slate-500 font-medium">Configure your personal focus environment.</p>
      </header>

      <div className="space-y-8">
        <section className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-200 dark:border-slate-800 shadow-sm space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xl font-bold text-black dark:text-white">Interface Theme</h4>
              <p className="text-sm text-slate-500 mt-1">
                Current: <span className="font-bold text-indigo-600 uppercase">{settings.theme}</span>
              </p>
            </div>
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700">
               <button 
                onClick={() => handleChange('theme', 'light')}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${settings.theme === 'light' ? 'bg-white text-black shadow-md' : 'text-slate-400'}`}
               >
                 Light
               </button>
               <button 
                onClick={() => handleChange('theme', 'dark')}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${settings.theme === 'dark' ? 'bg-slate-700 text-white shadow-md' : 'text-slate-400'}`}
               >
                 Dark
               </button>
            </div>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800 pt-8 space-y-6">
            <h3 className="text-lg font-bold text-black dark:text-white">Data Management</h3>
            <p className="text-sm text-slate-500 leading-relaxed">Your data is stored locally in this browser. Export a backup to save your tasks elsewhere.</p>
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={handleExport}
                className="px-6 py-3 bg-black text-white dark:bg-white dark:text-black rounded-2xl font-bold text-sm hover:opacity-80 transition-all shadow-lg"
              >
                Export Backup (.json)
              </button>
              <button 
                onClick={handleImportClick}
                className="px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-2xl font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
              >
                Import Backup
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept=".json"
              />
            </div>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800 pt-8 space-y-6">
            <h3 className="text-lg font-bold text-black dark:text-white">Timer Defaults</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-[11px] font-black uppercase text-slate-400 tracking-widest mb-2">Focus (Min)</label>
                <input 
                  type="number" 
                  value={settings.workDuration}
                  onChange={e => handleChange('workDuration', parseInt(e.target.value))}
                  className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl font-bold focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-black uppercase text-slate-400 tracking-widest mb-2">Short Break</label>
                <input 
                  type="number" 
                  value={settings.shortBreakDuration}
                  onChange={e => handleChange('shortBreakDuration', parseInt(e.target.value))}
                  className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl font-bold focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-black uppercase text-slate-400 tracking-widest mb-2">Long Break</label>
                <input 
                  type="number" 
                  value={settings.longBreakDuration}
                  onChange={e => handleChange('longBreakDuration', parseInt(e.target.value))}
                  className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl font-bold focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default SettingsView;
