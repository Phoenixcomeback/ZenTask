
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Task, PomodoroSession, AppSettings } from '../types';
import { Icons, CATEGORIES } from '../constants';

interface Props {
  tasks: Task[];
  history: PomodoroSession[];
  settings: AppSettings;
  onUpdateSettings: (s: AppSettings) => void;
  onSelectTask: (task: Task) => void;
}

const Dashboard: React.FC<Props> = ({ tasks, history, settings, onUpdateSettings, onSelectTask }) => {
  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todaySessions = history.filter(s => s.timestamp.startsWith(today) && s.type === 'work');
    const totalTodayHours = todaySessions.reduce((acc, s) => acc + s.duration / 3600, 0);
    const activeTasks = tasks.filter(t => !t.completed);
    
    // Calculate streak
    // Fix: Explicitly using Array.from to ensure proper string[] type inference from Set
    const sortedDates: string[] = Array.from(new Set(history.filter(s => s.type === 'work').map(s => s.timestamp.split('T')[0]))).sort().reverse();
    const now = new Date();
    
    let streak = 0;
    for (let i = 0; i < sortedDates.length; i++) {
      const d = new Date(sortedDates[i]);
      const diff = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
      if (diff === i || diff === i + 1) {
        streak++;
      } else {
        break;
      }
    }

    // Weekly momentum sparkline data
    const last7Days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const ds = d.toISOString().split('T')[0];
      const hours = history
        .filter(s => s.timestamp.startsWith(ds) && s.type === 'work')
        .reduce((acc, s) => acc + s.duration / 3600, 0);
      return Math.min(100, (hours / 4) * 100); // Normalized to 4 hours as "full"
    });

    return {
      todayHours: totalTodayHours.toFixed(1),
      completedToday: todaySessions.length,
      upcomingCount: activeTasks.length,
      progress: Math.min(100, Math.round((totalTodayHours / (settings.monthlyGoalHours / 30)) * 100)),
      streak,
      weeklyMomentum: last7Days,
      recentSessions: history.filter(s => s.type === 'work').slice(0, 3)
    };
  }, [tasks, history, settings.monthlyGoalHours]);

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <div className="space-y-12 pb-20 max-w-7xl mx-auto">
      {/* Executive Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 pt-4">
        <motion.div 
          initial={{ opacity: 0, x: -20 }} 
          animate={{ opacity: 1, x: 0 }}
          className="space-y-2"
        >
          <div className="flex items-center gap-3">
            <span className="text-xs font-black uppercase tracking-[0.3em] text-indigo-500 bg-indigo-500/10 px-3 py-1 rounded-full">Executive Suite</span>
            <div className="h-px w-12 bg-slate-200 dark:bg-slate-800" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
          </div>
          <h1 className="text-5xl font-black tracking-tighter text-black dark:text-white">
            {getTimeGreeting()}, <span className="text-indigo-600">ZenTasker.</span>
          </h1>
          <p className="text-slate-500 text-lg font-medium max-w-xl leading-relaxed">
            You've maintained a <span className="text-black dark:text-white font-bold">{stats.streak} day focus streak.</span> Cognitive performance is currently peak.
          </p>
        </motion.div>

        <div className="flex gap-4">
           <button 
             onClick={() => stats.upcomingCount > 0 && onSelectTask(tasks.filter(t => !t.completed)[0])}
             className="px-8 py-5 bg-black dark:bg-white text-white dark:text-black rounded-[24px] font-black uppercase tracking-widest text-[11px] shadow-2xl shadow-indigo-500/20 active:scale-95 transition-all flex items-center gap-3"
           >
             <Icons.Clock className="w-4 h-4" />
             Initiate Flow
           </button>
        </div>
      </header>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <HeroCard 
          label="Momentum" 
          value={`${stats.streak} Days`} 
          icon={<Icons.Flame />} 
          color="indigo" 
          sparkline={stats.weeklyMomentum}
        />
        <HeroCard 
          label="Focus Hours" 
          value={`${stats.todayHours}h`} 
          subtext="vs 3.2h average"
          icon={<Icons.Clock />} 
          color="slate" 
        />
        <HeroCard 
          label="Registry Depth" 
          value={stats.upcomingCount.toString()} 
          subtext="Pending Items"
          icon={<Icons.Layout />} 
          color="slate" 
        />
        <HeroCard 
          label="Goal Velocity" 
          value={`${stats.progress}%`} 
          subtext="Monthly Target"
          icon={<Icons.Chart />} 
          color="emerald" 
          progress={stats.progress}
        />
      </div>

      {/* Strategic Intelligence Layer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* The Strategic Journal */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="lg:col-span-7 glass rounded-[48px] p-10 shadow-sm flex flex-col relative overflow-hidden group min-h-[400px]"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[80px] -mr-32 -mt-32 pointer-events-none" />
          
          <div className="flex items-center justify-between mb-8 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-600 text-white rounded-[18px] flex items-center justify-center shadow-lg shadow-indigo-600/20">
                <Icons.Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-black tracking-tight">Strategic Journal</h2>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Capture Cognitive Leakage</p>
              </div>
            </div>
          </div>

          <div className="flex-1 relative z-10">
            <textarea 
              value={settings.scratchpad}
              onChange={(e) => onUpdateSettings({ ...settings, scratchpad: e.target.value })}
              placeholder="Dump distracting thoughts, tactical ideas, or session instructions here..."
              className="w-full h-full bg-transparent border-none outline-none resize-none font-medium text-xl text-slate-700 dark:text-slate-300 placeholder:text-slate-300 dark:placeholder:text-slate-700 leading-relaxed scrollbar-hide"
              style={{
                backgroundImage: 'linear-gradient(to bottom, transparent 31px, rgba(0,0,0,0.03) 31px, rgba(0,0,0,0.03) 32px, transparent 32px)',
                backgroundSize: '100% 32px',
                lineHeight: '32px'
              }}
            />
          </div>
        </motion.section>

        {/* Tactical Feed */}
        <div className="lg:col-span-5 space-y-8 flex flex-col">
           <section className="glass rounded-[40px] p-8 shadow-sm flex-1">
             <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-xl font-black">Tactical Queue</h2>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Next Priority Objectives</p>
                </div>
                <Icons.Clock className="w-5 h-5 text-slate-400" />
             </div>
             
             <div className="space-y-4">
                {tasks.filter(t => !t.completed).slice(0, 4).map((task, idx) => (
                  <motion.button 
                    key={task.id}
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + (idx * 0.05) }}
                    onClick={() => onSelectTask(task)}
                    className="w-full flex items-center gap-5 p-5 rounded-[28px] hover:bg-white dark:hover:bg-slate-800 transition-all border border-transparent hover:border-slate-100 dark:hover:border-slate-700 text-left group shadow-sm hover:shadow-md"
                  >
                    <div className="w-12 h-12 rounded-[16px] flex items-center justify-center text-white shrink-0 shadow-lg group-hover:scale-105 transition-transform" style={{ backgroundColor: task.colorTag }}>
                      <Icons.Clock className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-black truncate text-[16px] text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">{task.title}</h4>
                      <p className="text-[10px] font-black uppercase text-slate-400 mt-1 tracking-wider">{task.category} • {task.priority} Priority</p>
                    </div>
                  </motion.button>
                ))}
                {tasks.filter(t => !t.completed).length === 0 && (
                  <div className="text-center py-12">
                    <div className="w-12 h-12 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                      <Icons.Check className="w-6 h-6" />
                    </div>
                    <p className="text-slate-400 font-bold text-sm">Registry cleared. Excellent.</p>
                  </div>
                )}
             </div>
           </section>

           {/* Recent Wins sparker */}
           <section className="glass rounded-[32px] p-6 shadow-sm border-l-[6px] border-emerald-500">
             <div className="flex items-center gap-3 mb-4">
               <Icons.Flame className="w-4 h-4 text-emerald-500" />
               <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Recent Momentum</span>
             </div>
             <div className="flex items-center gap-2">
                {stats.recentSessions.length > 0 ? (
                  <div className="flex -space-x-3">
                    {stats.recentSessions.map((s, i) => (
                      <div key={s.id} className="w-10 h-10 rounded-full border-4 border-white dark:border-slate-900 bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-indigo-500" title={`Completed on ${new Date(s.timestamp).toLocaleTimeString()}`}>
                        <Icons.Check className="w-4 h-4" />
                      </div>
                    ))}
                  </div>
                ) : <span className="text-xs font-bold text-slate-400">Start your first session of the day.</span>}
                {stats.recentSessions.length > 0 && (
                  <span className="text-xs font-black text-slate-600 dark:text-slate-300 ml-4">
                    +{Math.round(stats.recentSessions.reduce((a, b) => a + b.duration/60, 0))}m Focus Today
                  </span>
                )}
             </div>
           </section>
        </div>
      </div>
    </div>
  );
};

const HeroCard = ({ label, value, subtext, icon, color, sparkline, progress }: any) => {
  const colors: any = {
    indigo: 'bg-indigo-600 text-indigo-600',
    slate: 'bg-slate-900 dark:bg-white text-slate-900 dark:text-white',
    emerald: 'bg-emerald-600 text-emerald-600',
    orange: 'bg-orange-500 text-orange-500'
  };

  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="glass p-8 rounded-[40px] shadow-sm flex flex-col h-full relative overflow-hidden"
    >
      <div className="flex items-center justify-between mb-6">
        <div className={`w-12 h-12 rounded-[18px] flex items-center justify-center shadow-lg ${colors[color]} text-white dark:text-black`}>
          <div className="w-6 h-6">{icon}</div>
        </div>
        
        {/* Momentum Sparkline Mini-Viz */}
        {sparkline && (
          <div className="flex items-end gap-1 h-8">
            {sparkline.map((val: number, i: number) => (
              <div 
                key={i} 
                className={`w-1 rounded-full transition-all duration-1000 ${i === 6 ? 'bg-indigo-500 h-full' : 'bg-slate-200 dark:bg-slate-700'}`} 
                style={{ height: `${Math.max(20, val)}%` }}
              />
            ))}
          </div>
        )}
      </div>

      <div className="space-y-1">
        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{label}</p>
        <h3 className="text-4xl font-black tabular-nums tracking-tighter">{value}</h3>
      </div>

      {subtext && <p className="text-[11px] font-bold text-slate-500 mt-4 flex items-center gap-1">
        <div className="w-1 h-1 rounded-full bg-slate-300" />
        {subtext}
      </p>}

      {/* Progress Bar for Goal Card */}
      {progress !== undefined && (
        <div className="mt-6 h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }} 
            animate={{ width: `${progress}%` }} 
            className="h-full bg-emerald-500" 
          />
        </div>
      )}
    </motion.div>
  );
};

export default Dashboard;
