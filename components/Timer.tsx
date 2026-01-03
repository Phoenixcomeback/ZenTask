
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppSettings, PomodoroSession, Task, SoundscapeType, PlannerWorkspace, FocusFolder, FocusChecklistItem } from '../types';
import { Icons } from '../constants';

interface Props {
  settings: AppSettings;
  onUpdateSettings: (s: AppSettings) => void;
  onComplete: (session: PomodoroSession) => void;
  selectedTask: Task | null;
  onTaskClear: () => void;
  isFocusMode?: boolean;
  onToggleFocus?: () => void;
  onUpdateWorkspace?: (workspace: PlannerWorkspace) => void;
}

const SOUNDS = {
  rain: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', // Placeholder for actual audio loops
  lofi: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
  cafe: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
  'white-noise': 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3'
};

const Timer: React.FC<Props> = ({ settings, onUpdateSettings, onComplete, selectedTask, onTaskClear, isFocusMode, onToggleFocus, onUpdateWorkspace }) => {
  const [mode, setMode] = useState<'work' | 'short-break' | 'long-break'>('work');
  const [timeLeft, setTimeLeft] = useState(settings.workDuration * 60);
  const [isActive, setIsActive] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);
  const [volume, setVolume] = useState(0.5);

  const timerRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const workspace = settings.plannerWorkspace || { today: [], subjects: [], next7Days: [] };

  const currentDuration = useMemo(() => {
    if (mode === 'work') return (selectedTask?.customDuration || settings.workDuration) * 60;
    return (mode === 'short-break' ? settings.shortBreakDuration : settings.longBreakDuration) * 60;
  }, [mode, selectedTask, settings]);

  const resetTimer = useCallback(() => {
    setIsActive(false);
    if (timerRef.current) clearInterval(timerRef.current);
    setTimeLeft(currentDuration);
  }, [currentDuration]);

  useEffect(() => {
    resetTimer();
  }, [mode, settings, resetTimer]);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = window.setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else {
      if (timeLeft === 0) handleComplete();
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isActive, timeLeft]);

  // Audio Engine
  useEffect(() => {
    if (isActive && settings.defaultSoundscape !== 'none' && SOUNDS[settings.defaultSoundscape as keyof typeof SOUNDS]) {
      if (!audioRef.current) {
        audioRef.current = new Audio(SOUNDS[settings.defaultSoundscape as keyof typeof SOUNDS]);
        audioRef.current.loop = true;
      }
      audioRef.current.volume = volume;
      audioRef.current.play().catch(console.error);
    } else {
      audioRef.current?.pause();
    }
  }, [isActive, settings.defaultSoundscape, volume]);

  const handleComplete = () => {
    setIsActive(false);
    audioRef.current?.pause();
    
    onComplete({
      id: crypto.randomUUID(),
      taskId: selectedTask?.id,
      duration: mode === 'work' ? currentDuration : 0,
      type: mode,
      timestamp: new Date().toISOString()
    });

    if (mode === 'work') {
      const nextCount = sessionCount + 1;
      setSessionCount(nextCount);
      setMode(nextCount % settings.longBreakInterval === 0 ? 'long-break' : 'short-break');
    } else {
      setMode('work');
    }
  };

  const updateToday = (items: FocusChecklistItem[]) => {
    onUpdateWorkspace?.({ ...workspace, today: items });
  };

  const formatTime = (s: number) => {
    const mm = Math.floor(s / 60).toString().padStart(2, '0');
    const ss = (s % 60).toString().padStart(2, '0');
    return `${mm}:${ss}`;
  };

  return (
    <div className={`relative flex transition-all duration-1000 w-full h-full overflow-hidden ${isFocusMode ? 'items-stretch bg-white dark:bg-black text-black dark:text-white' : 'flex-col items-center justify-center'}`}>
      
      {isFocusMode && (
        <motion.div 
          initial={{ x: -100, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
          className="relative z-10 w-80 lg:w-96 border-r border-black dark:border-white bg-white dark:bg-black overflow-y-auto p-12"
        >
          <div className="space-y-12">
            <div>
              <h2 className="text-3xl font-black tracking-tight mb-2">Today</h2>
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500">{workspace.today.filter(i => i.completed).length}/{workspace.today.length} Completed</span>
            </div>
            
            <div className="space-y-5">
              {workspace.today.map(item => (
                <div key={item.id} className="flex items-center gap-4 group">
                  <button 
                    onClick={() => updateToday(workspace.today.map(i => i.id === item.id ? { ...i, completed: !i.completed } : i))}
                    className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${item.completed ? 'bg-indigo-600 border-indigo-600' : 'border-black dark:border-white'}`}
                  >
                    {item.completed && <Icons.Check className="w-3 h-3 text-white" />}
                  </button>
                  <input 
                    className={`bg-transparent border-none outline-none font-black text-sm flex-1 ${item.completed ? 'line-through opacity-30' : ''}`}
                    value={item.text}
                    placeholder="Objective..."
                    onChange={e => updateToday(workspace.today.map(i => i.id === item.id ? { ...i, text: e.target.value } : i))}
                  />
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      <div className={`relative z-10 flex flex-col items-center justify-center flex-1 transition-all ${isFocusMode ? 'px-8 bg-white dark:bg-black' : ''}`}>
        <div className="flex bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl p-1.5 rounded-[24px] shadow-sm border border-slate-200 dark:border-slate-800 mb-8">
          {(['work', 'short-break', 'long-break'] as const).map(m => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-6 py-2.5 rounded-[20px] text-xs font-black uppercase tracking-widest transition-all ${mode === m ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
            >
              {m.replace('-', ' ')}
            </button>
          ))}
        </div>

        <div className="relative mb-12">
          {!isFocusMode && <div className={`absolute inset-0 rounded-full blur-[100px] opacity-10 transition-colors duration-1000 ${isActive ? (mode === 'work' ? 'bg-indigo-500' : 'bg-emerald-500') : 'bg-slate-400'}`} />}
          <div className={`relative flex items-center justify-center transition-all duration-700 ${isFocusMode ? 'w-[400px] h-[400px] lg:w-[480px] lg:h-[480px] bg-white dark:bg-black border-[3px] border-black dark:border-white rounded-full' : 'w-80 h-80 lg:w-96 lg:h-96 glass rounded-full shadow-2xl border-black/10 dark:border-white/10'}`}>
             <div className="text-center">
               <motion.div key={timeLeft} initial={{ scale: 0.98, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className={`font-black tracking-tighter tabular-nums text-black dark:text-white ${isFocusMode ? 'text-[120px] lg:text-[160px]' : 'text-8xl'}`}>
                 {formatTime(timeLeft)}
               </motion.div>
               <div className={`text-xs font-black uppercase tracking-[0.3em] mt-2 ${isFocusMode ? 'opacity-100' : 'text-slate-400'}`}>
                 {isActive ? (mode === 'work' ? 'In Flow' : 'Resting') : 'Paused'}
               </div>
             </div>
          </div>
        </div>

        <div className="w-full max-w-sm space-y-6">
          {/* Ambient Controls */}
          <div className="glass p-4 rounded-3xl border border-black/5 dark:border-white/5 flex items-center justify-between gap-4">
             <div className="flex items-center gap-3">
               <Icons.Music className="w-5 h-5 text-indigo-500" />
               <select 
                value={settings.defaultSoundscape}
                onChange={(e) => onUpdateSettings({ ...settings, defaultSoundscape: e.target.value as any })}
                className="bg-transparent border-none outline-none font-bold text-xs uppercase tracking-widest text-slate-500"
               >
                 <option value="none">Silence</option>
                 <option value="rain">Rainfall</option>
                 <option value="lofi">Lofi Beats</option>
                 <option value="cafe">Busy Cafe</option>
                 <option value="white-noise">White Noise</option>
               </select>
             </div>
             <input type="range" min="0" max="1" step="0.1" value={volume} onChange={e => setVolume(parseFloat(e.target.value))} className="w-20 accent-indigo-500" />
          </div>

          <div className="flex flex-col gap-4 w-full">
             <div className="flex gap-4 w-full">
               <button onClick={resetTimer} className="flex-1 py-5 glass rounded-[28px] font-black uppercase text-xs tracking-widest text-slate-500 hover:bg-white dark:hover:bg-slate-800 transition-all border border-slate-200 dark:border-slate-700">Reset</button>
               <button onClick={() => setIsActive(!isActive)} className={`flex-[2] py-5 rounded-[28px] font-black uppercase text-xs tracking-[0.2em] text-white shadow-2xl transition-all transform active:scale-95 ${isActive ? 'bg-rose-500' : 'bg-indigo-600'}`}>
                 {isActive ? 'Pause' : 'Start'}
               </button>
             </div>
             <button onClick={onToggleFocus} className={`w-full py-4 rounded-2xl font-bold text-xs tracking-widest transition-all ${isFocusMode ? 'bg-black text-white dark:bg-white dark:text-black border-2 border-black dark:border-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>
               {isFocusMode ? 'Exit Focus Mode' : 'Enter Focus Mode'}
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Timer;
