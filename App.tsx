
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icons, CATEGORIES } from './constants';
import { Task, AppSettings, PomodoroSession, PlannerWorkspace, FocusChecklistItem } from './types';
import Dashboard from './components/Dashboard';
import Planner from './components/Planner';
import CalendarView from './components/CalendarView';
import StatsView from './components/StatsView';
import Timer from './components/Timer';
import SettingsView from './components/SettingsView';
import TaskList from './components/TaskList';

const STORAGE_KEY = 'zentask_ai_premium_v6'; 

const INITIAL_PLANNER_WORKSPACE: PlannerWorkspace = {
  today: [],
  next7Days: Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1);
    return { date: d.toISOString().split('T')[0], items: [] };
  }),
  subjects: []
};

const INITIAL_SETTINGS: AppSettings = {
  workDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  longBreakInterval: 4,
  autoStartBreaks: false,
  autoStartWork: false,
  theme: 'dark', 
  monthlyGoalHours: 80,
  accentColor: '#6366f1',
  defaultSoundscape: 'none',
  plannerWorkspace: INITIAL_PLANNER_WORKSPACE,
  scratchpad: ""
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'tasks' | 'timer' | 'planner' | 'calendar' | 'stats' | 'settings'>('dashboard');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [history, setHistory] = useState<PomodoroSession[]>([]);
  const [settings, setSettings] = useState<AppSettings>(INITIAL_SETTINGS);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isFocusMode, setIsFocusMode] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setTasks(parsed.tasks || []);
        setHistory(parsed.history || []);
        setSettings({ ...INITIAL_SETTINGS, ...parsed.settings });
      }
    } catch (e) {
      console.error("Storage load error", e);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ tasks, history, settings }));
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [tasks, history, settings]);

  const updatePlannerWorkspace = (workspace: PlannerWorkspace) => {
    setSettings(prev => ({ ...prev, plannerWorkspace: workspace }));
  };

  const handleImportData = (data: string) => {
    try {
      const parsed = JSON.parse(data);
      if (parsed.tasks) setTasks(parsed.tasks);
      if (parsed.history) setHistory(parsed.history);
      if (parsed.settings) setSettings(parsed.settings);
    } catch (e) {
      console.error("Failed to parse import data", e);
    }
  };

  return (
    <div className={`min-h-screen selection:bg-indigo-100 dark:selection:bg-indigo-900/40 ${settings.theme === 'dark' ? 'dark' : 'light'}`}>
      <div className="flex h-screen bg-white dark:bg-black text-black dark:text-white overflow-hidden transition-colors duration-500">
        
        {!isFocusMode && (
          <nav className="w-24 lg:w-72 flex-shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 backdrop-blur-xl flex flex-col items-center lg:items-stretch py-8 z-20 transition-all duration-500 pt-10">
            <div className="px-6 mb-8 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-500/30">
                  <Icons.Clock className="w-6 h-6" />
                </div>
                <span className="hidden lg:block text-2xl font-extrabold tracking-tight">ZenTask</span>
              </div>
            </div>
            
            <div className="flex-1 px-4 space-y-1.5">
              <NavItem active={activeTab === 'dashboard'} icon={<Icons.Layout />} label="Dashboard" onClick={() => setActiveTab('dashboard')} />
              <NavItem active={activeTab === 'tasks'} icon={<Icons.Calendar />} label="Registry" onClick={() => setActiveTab('tasks')} />
              <NavItem active={activeTab === 'planner'} icon={<Icons.Check />} label="Planner" onClick={() => setActiveTab('planner')} />
              <NavItem active={activeTab === 'timer'} icon={<Icons.Clock />} label="Focus" onClick={() => setActiveTab('timer')} />
              <NavItem active={activeTab === 'calendar'} icon={<Icons.Calendar />} label="Timeline" onClick={() => setActiveTab('calendar')} />
              <NavItem active={activeTab === 'stats'} icon={<Icons.Chart />} label="Analytics" onClick={() => setActiveTab('stats')} />
            </div>

            <div className="px-4 mt-auto space-y-2">
              <NavItem active={activeTab === 'settings'} icon={<Icons.More />} label="Settings" onClick={() => setActiveTab('settings')} />
            </div>
          </nav>
        )}

        <main className={`flex-1 relative overflow-y-auto overflow-x-hidden flex flex-col transition-all duration-500 ${isFocusMode ? 'bg-white dark:bg-black' : 'bg-slate-50 dark:bg-[#050810]'}`}>
          
          <div className={`flex-1 w-full h-full transition-all duration-500 ${isFocusMode ? 'p-0 flex items-stretch overflow-hidden' : 'max-w-6xl mx-auto px-6 py-10'}`}>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab + (isFocusMode ? '-focus' : '')}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="w-full h-full"
              >
                {activeTab === 'dashboard' && (
                  <Dashboard 
                    tasks={tasks} 
                    history={history} 
                    settings={settings} 
                    onUpdateSettings={setSettings}
                    onSelectTask={(t) => { setSelectedTask(t); setActiveTab('timer'); }} 
                  />
                )}
                {activeTab === 'tasks' && (
                  <TaskList 
                    tasks={tasks} 
                    onAddTask={(t) => setTasks([t, ...tasks])} 
                    onUpdateTask={(updated) => setTasks(tasks.map(t => t.id === updated.id ? updated : t))}
                    onDeleteTask={(id) => setTasks(tasks.filter(t => t.id !== id))}
                    onStartTask={(t) => { setSelectedTask(t); setActiveTab('timer'); }}
                  />
                )}
                {activeTab === 'planner' && (
                  <Planner 
                    workspace={settings.plannerWorkspace} 
                    onUpdateWorkspace={updatePlannerWorkspace} 
                  />
                )}
                {activeTab === 'timer' && (
                  <Timer 
                    settings={settings} 
                    onUpdateSettings={setSettings}
                    onComplete={(session) => {
                      setHistory(prev => [session, ...prev]);
                      if (session.taskId && session.type === 'work') {
                        setTasks(prev => prev.map(t => t.id === session.taskId ? { ...t, completedPomodoros: t.completedPomodoros + 1 } : t));
                      }
                    }} 
                    selectedTask={selectedTask} 
                    onTaskClear={() => setSelectedTask(null)} 
                    isFocusMode={isFocusMode}
                    onToggleFocus={() => setIsFocusMode(!isFocusMode)}
                    onUpdateWorkspace={(ws) => updatePlannerWorkspace({ ...settings.plannerWorkspace, today: ws.today, subjects: ws.subjects })}
                  />
                )}
                {activeTab === 'calendar' && <CalendarView tasks={tasks} />}
                {activeTab === 'stats' && <StatsView tasks={tasks} history={history} settings={settings} />}
                {activeTab === 'settings' && <SettingsView settings={settings} onUpdate={setSettings} onImportData={handleImportData} />}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
};

const NavItem = ({ active, icon, label, onClick }: { active: boolean, icon: any, label: string, onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`w-full group flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 ${
      active 
        ? 'bg-black text-white dark:bg-white dark:text-black shadow-lg shadow-black/10' 
        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-black dark:hover:text-white'
    }`}
  >
    <div className={`w-6 h-6 transition-transform duration-300 group-hover:scale-110 ${active ? '' : 'text-slate-400 group-hover:text-black dark:group-hover:text-white'}`}>
      {icon}
    </div>
    <span className="hidden lg:block font-bold text-[15px]">{label}</span>
  </button>
);

export default App;
