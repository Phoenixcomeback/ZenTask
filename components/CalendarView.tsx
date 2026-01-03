
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Task } from '../types';
import { Icons, PRIORITY_COLORS } from '../constants';

interface Props {
  tasks: Task[];
}

const CalendarView: React.FC<Props> = ({ tasks }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const daysInMonth = endOfMonth.getDate();
  const firstDayOfMonth = startOfMonth.getDay();

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const monthName = currentDate.toLocaleString('default', { month: 'long' });

  // Filter tasks that have a deadline in the currently viewed month
  const getTasksForDay = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    return tasks.filter(t => t.deadline === dateStr);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-black dark:text-white">Strategic Timeline</h1>
          <p className="text-slate-500 font-medium">Visualizing your path to mastery.</p>
        </div>
        
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900/50 p-1.5 rounded-[24px] border border-slate-200 dark:border-slate-800">
          <button onClick={prevMonth} className="p-2.5 hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-all">
            <Icons.Plus className="w-5 h-5 rotate-[225deg]" />
          </button>
          <div className="px-6 font-black uppercase text-xs tracking-widest min-w-[160px] text-center">
            {monthName} {currentDate.getFullYear()}
          </div>
          <button onClick={nextMonth} className="p-2.5 hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-all">
            <Icons.Plus className="w-5 h-5 rotate-45" />
          </button>
        </div>
      </header>

      <div className="glass rounded-[40px] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xl">
        <div className="grid grid-cols-7 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="py-4 text-center text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {[...Array(firstDayOfMonth)].map((_, i) => (
            <div key={`empty-${i}`} className="h-32 lg:h-40 border-r border-b border-slate-50 dark:border-slate-800/50 bg-slate-50/30 dark:bg-slate-900/10" />
          ))}
          
          {[...Array(daysInMonth)].map((_, i) => {
            const day = i + 1;
            const dayTasks = getTasksForDay(day);
            const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();

            return (
              <div key={day} className={`h-32 lg:h-40 border-r border-b border-slate-50 dark:border-slate-800 p-3 hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-all group relative ${isToday ? 'bg-indigo-50/30 dark:bg-indigo-900/10' : ''}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-black ${isToday ? 'text-indigo-600' : 'text-slate-400 opacity-50 group-hover:opacity-100'}`}>
                    {day.toString().padStart(2, '0')}
                  </span>
                  {isToday && <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse" />}
                </div>

                <div className="space-y-1.5 overflow-y-auto max-h-[70%] scrollbar-hide">
                  <AnimatePresence>
                    {dayTasks.map((t, tidx) => (
                      <motion.div 
                        initial={{ opacity: 0, x: -5 }}
                        animate={{ opacity: 1, x: 0 }}
                        key={t.id} 
                        className="px-2 py-1 rounded-lg border flex items-center gap-2 cursor-pointer hover:scale-[1.02] transition-transform"
                        style={{ 
                          backgroundColor: `${t.colorTag}15`, 
                          borderColor: `${t.colorTag}30`,
                          color: t.colorTag 
                        }}
                      >
                        <div className="w-1 h-1 rounded-full shrink-0" style={{ backgroundColor: t.colorTag }} />
                        <span className="text-[10px] font-black truncate uppercase tracking-tighter">{t.title}</span>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="flex items-center justify-center gap-10 py-6 border-t border-slate-100 dark:border-slate-800">
        <LegendItem label="High Priority" color={PRIORITY_COLORS.high} />
        <LegendItem label="Medium" color={PRIORITY_COLORS.medium} />
        <LegendItem label="Low" color={PRIORITY_COLORS.low} />
      </div>
    </div>
  );
};

const LegendItem = ({ label, color }: { label: string, color: string }) => (
  <div className="flex items-center gap-2">
    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</span>
  </div>
);

export default CalendarView;
