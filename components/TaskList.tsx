
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Task, Priority } from '../types';
import { Icons, CATEGORIES, PRIORITY_COLORS } from '../constants';

interface Props {
  tasks: Task[];
  onAddTask: (task: any) => void;
  onUpdateTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  onStartTask: (task: Task) => void;
}

const TaskList: React.FC<Props> = ({ tasks, onAddTask, onUpdateTask, onDeleteTask, onStartTask }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [formData, setFormData] = useState({ 
    title: '', 
    category: CATEGORIES[0].name, 
    priority: 'medium' as Priority,
    customDuration: 25,
    notes: ''
  });
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = filterCategory === 'All' || t.category === filterCategory;
      return matchesSearch && matchesCategory;
    });
  }, [tasks, searchQuery, filterCategory]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;
    onAddTask({ 
      ...formData, 
      id: crypto.randomUUID(),
      deadline: new Date().toISOString().split('T')[0], 
      targetPomodoros: Math.ceil(formData.customDuration / 25),
      completedPomodoros: 0,
      completed: false,
      subtasks: [], 
      tags: [],
      createdAt: new Date().toISOString(),
      colorTag: CATEGORIES.find(c => c.name === formData.category)?.color || '#6366f1'
    });
    setFormData({ title: '', category: CATEGORIES[0].name, priority: 'medium', customDuration: 25, notes: '' });
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-black dark:text-white">Registry</h1>
          <p className="text-slate-500 font-medium">Manage your tactical objectives.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-4 bg-indigo-600 text-white rounded-3xl font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20 active:scale-95"
        >
          <Icons.Plus className="w-5 h-5" />
          <span>New Task</span>
        </button>
      </header>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <Icons.Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Search registry..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-6 py-4 bg-slate-100 dark:bg-slate-900 border-none rounded-[20px] font-bold text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>
        <select 
          value={filterCategory} 
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-6 py-4 bg-slate-100 dark:bg-slate-900 border-none rounded-[20px] font-bold text-sm focus:ring-2 focus:ring-indigo-500 outline-none min-w-[160px]"
        >
          <option value="All">All Categories</option>
          {CATEGORIES.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
        </select>
      </div>

      <div className="space-y-4">
        {filteredTasks.map((task, idx) => (
          <motion.div 
            key={task.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.03 }}
            className={`group glass rounded-[32px] overflow-hidden transition-all duration-300 ${task.completed ? 'opacity-50 grayscale' : 'hover:shadow-lg'}`}
          >
            <div className="p-6 flex items-center gap-5">
              <button 
                onClick={() => onUpdateTask({ ...task, completed: !task.completed })}
                className={`w-8 h-8 rounded-full border-2 shrink-0 flex items-center justify-center transition-all ${task.completed ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300 dark:border-slate-600'}`}
              >
                {task.completed && <Icons.Check className="w-4 h-4 text-white" />}
              </button>
              
              <div className="flex-1 min-w-0" onClick={() => setExpandedId(expandedId === task.id ? null : task.id)}>
                 <div className="flex items-center gap-3 mb-1 cursor-pointer">
                   <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800" style={{ color: task.colorTag }}>{task.category}</span>
                   <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: (PRIORITY_COLORS as any)[task.priority] }}>{task.priority}</span>
                 </div>
                 <h3 className={`text-lg font-bold leading-tight truncate cursor-pointer ${task.completed ? 'line-through' : ''}`}>{task.title}</h3>
              </div>

              <div className="flex items-center gap-2">
                 {!task.completed && (
                   <button onClick={() => onStartTask(task)} className="p-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all">
                     <Icons.Clock className="w-5 h-5" />
                   </button>
                 )}
                 <button onClick={() => onDeleteTask(task.id)} className="p-3 text-slate-300 hover:text-rose-500 transition-colors">
                    <Icons.Plus className="w-5 h-5 rotate-45" />
                 </button>
              </div>
            </div>

            <AnimatePresence>
              {expandedId === task.id && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="bg-slate-50/50 dark:bg-slate-800/20 border-t border-slate-100 dark:border-slate-800">
                  <div className="p-8 space-y-6">
                    <div>
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Instructions & Context</h4>
                      <textarea 
                        className="w-full bg-white dark:bg-slate-900/50 rounded-2xl p-4 text-sm font-medium border-none outline-none focus:ring-1 focus:ring-indigo-500 min-h-[100px] resize-none"
                        value={task.notes || ''}
                        placeholder="Add specific details or links for this task..."
                        onChange={(e) => onUpdateTask({ ...task, notes: e.target.value })}
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
        {filteredTasks.length === 0 && (
          <div className="text-center py-20 text-slate-400 font-medium">No tasks match your filter.</div>
        )}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative w-full max-w-lg glass p-10 rounded-[40px] shadow-2xl">
              <h2 className="text-3xl font-extrabold mb-8">Add Objective</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                 <div>
                    <label className="block text-[11px] font-black uppercase text-slate-400 tracking-widest mb-2">Task Title</label>
                    <input autoFocus className="w-full bg-slate-100 dark:bg-slate-800/50 border-none rounded-2xl px-5 py-4 text-lg font-bold focus:ring-2 focus:ring-indigo-500" placeholder="Focus point..." value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-black uppercase text-slate-400 tracking-widest mb-2">Category</label>
                      <select className="w-full bg-slate-100 dark:bg-slate-800/50 border-none rounded-2xl px-5 py-4 font-bold" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                        {CATEGORIES.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-black uppercase text-slate-400 tracking-widest mb-2">Priority</label>
                      <select className="w-full bg-slate-100 dark:bg-slate-800/50 border-none rounded-2xl px-5 py-4 font-bold" value={formData.priority} onChange={e => setFormData({ ...formData, priority: e.target.value as Priority })}>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                 </div>
                 <div className="flex gap-4 pt-6">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 font-black uppercase text-xs tracking-widest text-slate-500">Cancel</button>
                    <button type="submit" className="flex-[2] py-4 bg-indigo-600 text-white rounded-3xl font-black uppercase text-xs tracking-[0.2em] shadow-xl">Create Registry Item</button>
                 </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TaskList;
