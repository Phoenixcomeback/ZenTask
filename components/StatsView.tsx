import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Task, PomodoroSession, AppSettings } from '../types';
import { CATEGORIES, Icons } from '../constants';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';

interface Props {
  tasks: Task[];
  history: PomodoroSession[];
  settings: AppSettings;
}

const StatsView: React.FC<Props> = ({ tasks, history, settings }) => {
  // Weekly aggregation for the 'Daily Focus Time' chart
  const weeklyData = useMemo(() => {
    const today = new Date();
    const currentDay = today.getDay(); // 0 is Sunday
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - currentDay);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      
      const daySessions = history.filter(s => s.timestamp.startsWith(dateStr) && s.type === 'work');
      const hours = daySessions.reduce((acc, s) => acc + s.duration / 3600, 0);
      
      days.push({
        name: d.toLocaleDateString('en-US', { weekday: 'short' }),
        hours: parseFloat(hours.toFixed(1))
      });
    }
    return days;
  }, [history]);

  // 30-day trajectory for 'Monthly Focus Time' aggregation
  const monthlyTrajectory = useMemo(() => {
    const dates = [...Array(30)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    return dates.map(date => {
      const daySessions = history.filter(s => s.timestamp.startsWith(date) && s.type === 'work');
      const hours = daySessions.reduce((acc, s) => acc + s.duration / 3600, 0);
      return { 
        name: new Date(date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' }), 
        hours: parseFloat(hours.toFixed(1)) 
      };
    });
  }, [history]);

  const categoryData = useMemo(() => {
    const map: Record<string, number> = {};
    history.filter(s => s.type === 'work').forEach(s => {
      const task = tasks.find(t => t.id === s.taskId);
      const cat = task ? task.category : 'General';
      map[cat] = (map[cat] || 0) + (s.duration / 3600);
    });
    return Object.entries(map).map(([name, value]) => ({ name, value: parseFloat(value.toFixed(1)) }));
  }, [history, tasks]);

  const totalMonthlyHours = useMemo(() => {
    const now = new Date();
    return history
      .filter(s => s.type === 'work' && new Date(s.timestamp).getMonth() === now.getMonth())
      .reduce((acc, s) => acc + s.duration / 3600, 0);
  }, [history]);

  const tickStyle = {
    fill: settings.theme === 'dark' ? '#94a3b8' : '#000000',
    fontSize: 10,
    fontWeight: 800
  };

  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-4xl font-extrabold tracking-tight text-black dark:text-white">Focus Analytics</h1>
        <p className="text-slate-500 font-medium">Quantify your cognitive throughput.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Daily Focus - Current Week */}
        <div className="glass rounded-[40px] p-8 shadow-sm">
           <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold text-black dark:text-white">Weekly Daily Summary</h3>
              <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600">
                <Icons.Clock className="w-4 h-4" />
              </div>
           </div>
           <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" strokeOpacity={settings.theme === 'dark' ? 0.2 : 0.8} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={tickStyle} />
                    <YAxis axisLine={false} tickLine={false} tick={tickStyle} />
                    <Tooltip 
                      cursor={{fill: 'rgba(99, 102, 241, 0.05)'}}
                      contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 'bold'}} 
                    />
                    <Bar dataKey="hours" fill="#000000" className="dark:fill-indigo-600" radius={[8, 8, 0, 0]} barSize={32} />
                 </BarChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* Monthly Trend */}
        <div className="glass rounded-[40px] p-8 shadow-sm">
           <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold text-black dark:text-white">30-Day Focus Volume</h3>
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Monthly Trajectory</span>
           </div>
           <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={monthlyTrajectory}>
                    <defs>
                       <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                       </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" strokeOpacity={settings.theme === 'dark' ? 0.2 : 0.8} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={tickStyle} hide={window.innerWidth < 640} />
                    <YAxis axisLine={false} tickLine={false} tick={tickStyle} />
                    <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 'bold'}} />
                    <Area type="monotone" dataKey="hours" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorHours)" />
                 </AreaChart>
              </ResponsiveContainer>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="glass rounded-[40px] p-8 flex flex-col items-center col-span-1">
           <h3 className="text-xl font-bold self-start mb-8 text-black dark:text-white">Focus Allocation</h3>
           <div className="h-[200px] w-full mb-6">
              <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                    <Pie data={categoryData} innerRadius={60} outerRadius={80} paddingAngle={8} dataKey="value">
                       {categoryData.map((entry, idx) => (
                         <Cell key={`cell-${idx}`} fill={CATEGORIES.find(c => c.name === entry.name)?.color || '#000000'} />
                       ))}
                    </Pie>
                    <Tooltip />
                 </PieChart>
              </ResponsiveContainer>
           </div>
           <div className="w-full space-y-3">
              {categoryData.slice(0, 4).map(d => (
                <div key={d.name} className="flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: CATEGORIES.find(c => c.name === d.name)?.color || '#000000' }} />
                      <span className="text-[13px] font-bold text-slate-900 dark:text-slate-400">{d.name}</span>
                   </div>
                   <span className="text-[13px] font-black text-black dark:text-white tabular-nums">{d.value}h</span>
                </div>
              ))}
           </div>
        </div>

        <div className="glass rounded-[40px] p-10 bg-black text-white dark:bg-gradient-to-br dark:from-indigo-900 dark:to-purple-900 relative overflow-hidden flex flex-col items-center justify-center gap-6 col-span-1 lg:col-span-2 shadow-2xl">
           <div className="absolute top-0 right-0 p-10 opacity-10">
              <Icons.Chart className="w-64 h-64" />
           </div>
           <div className="relative z-10 text-center space-y-2">
              <h3 className="text-3xl font-extrabold tracking-tight">Monthly Mastery</h3>
              <p className="text-slate-300 dark:text-indigo-100 font-medium">Achieve your {settings.monthlyGoalHours}h milestone.</p>
           </div>
           <div className="relative shrink-0 flex items-center justify-center">
              <svg className="w-40 h-40 -rotate-90">
                 <circle cx="80" cy="80" r="70" className="stroke-white/10 fill-none" strokeWidth="10" />
                 <motion.circle 
                   cx="80" cy="80" r="70" 
                   className="stroke-white fill-none" 
                   strokeWidth="10" 
                   strokeLinecap="round"
                   strokeDasharray="100 100"
                   initial={{ strokeDashoffset: 100 }}
                   animate={{ strokeDashoffset: 100 - Math.min(100, (totalMonthlyHours / settings.monthlyGoalHours) * 100) }}
                   transition={{ duration: 1.5, ease: "easeOut" }}
                 />
              </svg>
              <div className="absolute flex flex-col items-center">
                 <span className="text-4xl font-black">{Math.round((totalMonthlyHours / settings.monthlyGoalHours) * 100)}%</span>
              </div>
           </div>
           <div className="relative z-10 bg-white/10 px-6 py-3 rounded-2xl backdrop-blur-md border border-white/20">
             <span className="text-sm font-bold">{totalMonthlyHours.toFixed(1)} / {settings.monthlyGoalHours} Focus Hours</span>
           </div>
        </div>
      </div>
    </div>
  );
};

export default StatsView;