
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlannerWorkspace, FocusChecklistItem, FocusFolder } from '../types';
import { Icons } from '../constants';

interface Props {
  workspace: PlannerWorkspace;
  onUpdateWorkspace: (workspace: PlannerWorkspace) => void;
}

const Planner: React.FC<Props> = ({ workspace, onUpdateWorkspace }) => {
  const [activeTab, setActiveTab] = useState<'today' | 'seven' | 'subjects'>('today');

  const updateToday = (items: FocusChecklistItem[]) => onUpdateWorkspace({ ...workspace, today: items });
  const updateSubjects = (subjects: FocusFolder[]) => onUpdateWorkspace({ ...workspace, subjects });
  const updateSevenDays = (seven: PlannerWorkspace['next7Days']) => onUpdateWorkspace({ ...workspace, next7Days: seven });

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-2">Workspace Planner</h1>
          <p className="text-slate-500 font-medium">Strategic planning from daily tactics to long-term folders.</p>
        </div>
        
        <div className="flex bg-slate-100 dark:bg-slate-800/50 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800">
          <TabButton active={activeTab === 'today'} onClick={() => setActiveTab('today')} label="Today" icon={<Icons.Clock className="w-4 h-4" />} />
          <TabButton active={activeTab === 'seven'} onClick={() => setActiveTab('seven')} label="Next 7 Days" icon={<Icons.Calendar className="w-4 h-4" />} />
          <TabButton active={activeTab === 'subjects'} onClick={() => setActiveTab('subjects')} label="Folders" icon={<Icons.Layout className="w-4 h-4" />} />
        </div>
      </header>

      <main className="min-h-[600px]">
        <AnimatePresence mode="wait">
          {activeTab === 'today' && (
            <motion.div key="today" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6 max-w-2xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black">Daily Checklist</h2>
                <button onClick={() => updateToday([{ id: crypto.randomUUID(), text: '', completed: false }, ...workspace.today])} className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-500/30 hover:scale-105 transition-all">
                  <Icons.Plus className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                {workspace.today.map(item => (
                  <CheckItem 
                    key={item.id} 
                    item={item} 
                    onUpdate={(updated) => updateToday(workspace.today.map(i => i.id === item.id ? updated : i))}
                    onDelete={() => updateToday(workspace.today.filter(i => i.id !== item.id))}
                  />
                ))}
                {workspace.today.length === 0 && <EmptyState text="Your daily list is clear. Add an objective to begin." />}
              </div>
            </motion.div>
          )}

          {activeTab === 'seven' && (
            <motion.div key="seven" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {workspace.next7Days.map((day, idx) => (
                  <div key={day.date} className="glass p-6 rounded-[32px] border border-slate-100 dark:border-slate-800 flex flex-col min-h-[300px]">
                    <div className="flex items-center justify-between mb-4">
                       <h3 className="font-black text-xs uppercase tracking-widest text-slate-400">
                         {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' })}
                       </h3>
                       <button 
                        onClick={() => {
                          const newSeven = [...workspace.next7Days];
                          newSeven[idx].items.push({ id: crypto.randomUUID(), text: '', completed: false });
                          updateSevenDays(newSeven);
                        }}
                        className="text-indigo-600 hover:scale-125 transition-transform"
                       >
                         <Icons.Plus className="w-4 h-4" />
                       </button>
                    </div>
                    <div className="space-y-3 flex-1">
                      {day.items.map(item => (
                        <CheckItem 
                          key={item.id} 
                          compact
                          item={item} 
                          onUpdate={(updated) => {
                            const newSeven = [...workspace.next7Days];
                            newSeven[idx].items = newSeven[idx].items.map(i => i.id === item.id ? updated : i);
                            updateSevenDays(newSeven);
                          }}
                          onDelete={() => {
                            const newSeven = [...workspace.next7Days];
                            newSeven[idx].items = newSeven[idx].items.filter(i => i.id !== item.id);
                            updateSevenDays(newSeven);
                          }}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'subjects' && (
            <motion.div key="subjects" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-10">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black">Folders & Projects</h2>
                <button 
                  onClick={() => updateSubjects([{ id: crypto.randomUUID(), name: 'New Folder', items: [] }, ...workspace.subjects])}
                  className="px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all"
                >
                  Create Folder
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {workspace.subjects.map(subject => (
                  <div key={subject.id} className="glass p-8 rounded-[40px] border border-slate-100 dark:border-slate-800 flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                      <input 
                        className="bg-transparent border-none outline-none font-black text-xl text-indigo-600 w-3/4"
                        value={subject.name}
                        onChange={e => updateSubjects(workspace.subjects.map(s => s.id === subject.id ? { ...s, name: e.target.value } : s))}
                      />
                      <button onClick={() => updateSubjects(workspace.subjects.filter(s => s.id !== subject.id))} className="p-2 text-slate-300 hover:text-rose-500">
                        <Icons.Plus className="w-4 h-4 rotate-45" />
                      </button>
                    </div>

                    <div className="space-y-4 mb-6 flex-1">
                      {subject.items.map(item => (
                        <CheckItem 
                          key={item.id} 
                          compact
                          item={item} 
                          onUpdate={(updated) => {
                            const newItems = subject.items.map(i => i.id === item.id ? updated : i);
                            updateSubjects(workspace.subjects.map(s => s.id === subject.id ? { ...s, items: newItems } : s));
                          }}
                          onDelete={() => {
                            const newItems = subject.items.filter(i => i.id !== item.id);
                            updateSubjects(workspace.subjects.map(s => s.id === subject.id ? { ...s, items: newItems } : s));
                          }}
                        />
                      ))}
                    </div>

                    <button 
                      onClick={() => {
                        const newItems = [...subject.items, { id: crypto.randomUUID(), text: '', completed: false }];
                        updateSubjects(workspace.subjects.map(s => s.id === subject.id ? { ...s, items: newItems } : s));
                      }}
                      className="w-full py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 text-slate-400 font-bold text-xs uppercase tracking-widest hover:text-indigo-600 transition-colors border border-slate-100 dark:border-slate-800"
                    >
                      Add Item
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  label: string;
  icon: React.ReactNode;
}

const TabButton: React.FC<TabButtonProps> = ({ active, onClick, label, icon }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
      active ? 'bg-white dark:bg-slate-700 text-black dark:text-white shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
    }`}
  >
    {icon}
    {label}
  </button>
);

interface CheckItemProps {
  item: FocusChecklistItem;
  onUpdate: (i: FocusChecklistItem) => void;
  onDelete: () => void;
  compact?: boolean;
}

const CheckItem: React.FC<CheckItemProps> = ({ item, onUpdate, onDelete, compact }) => (
  <div className={`flex items-center gap-4 group ${compact ? 'py-1' : 'glass p-4 rounded-2xl shadow-sm border border-slate-50 dark:border-slate-800'}`}>
    <button 
      onClick={() => onUpdate({ ...item, completed: !item.completed })}
      className={`rounded-lg border-2 flex items-center justify-center transition-all shrink-0 ${compact ? 'w-4 h-4' : 'w-6 h-6'} ${item.completed ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300 dark:border-slate-600'}`}
    >
      {item.completed && <Icons.Check className={compact ? "w-2.5 h-2.5 text-white" : "w-3 h-3 text-white"} />}
    </button>
    <input 
      className={`bg-transparent border-none outline-none font-bold flex-1 ${compact ? 'text-xs' : 'text-sm'} ${item.completed ? 'line-through opacity-40 text-slate-400' : 'text-slate-800 dark:text-white'}`}
      value={item.text}
      placeholder={compact ? "..." : "New objective..."}
      onChange={e => onUpdate({ ...item, text: e.target.value })}
    />
    <button onClick={onDelete} className="opacity-0 group-hover:opacity-100 p-1 text-slate-300 hover:text-rose-500 transition-opacity">
      <Icons.Plus className="w-4 h-4 rotate-45" />
    </button>
  </div>
);

const EmptyState: React.FC<{ text: string }> = ({ text }) => (
  <div className="py-20 flex flex-col items-center justify-center text-center">
    <div className="w-16 h-16 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center text-slate-300 mb-4">
      <Icons.Layout className="w-8 h-8" />
    </div>
    <p className="text-slate-400 font-medium max-w-[200px]">{text}</p>
  </div>
);

export default Planner;
