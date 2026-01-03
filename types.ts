
export type Priority = 'low' | 'medium' | 'high';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  estimatedMinutes?: number;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  category: string;
  colorTag: string;
  priority: Priority;
  deadline: string;
  targetPomodoros: number;
  completedPomodoros: number;
  completed: boolean;
  subtasks: Subtask[];
  tags: string[];
  createdAt: string;
  customDuration?: number; // Minutes
  notes?: string;
}

export type SoundscapeType = 'none' | 'lofi' | 'rain' | 'cafe' | 'white-noise';

export interface PomodoroSession {
  id: string;
  taskId?: string;
  duration: number; // in seconds
  type: 'work' | 'short-break' | 'long-break';
  timestamp: string;
}

export interface FocusChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface FocusFolder {
  id: string;
  name: string;
  items: FocusChecklistItem[];
}

export interface PlannerWorkspace {
  today: FocusChecklistItem[];
  next7Days: { date: string; items: FocusChecklistItem[] }[];
  subjects: FocusFolder[];
}

export interface AppSettings {
  workDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  longBreakInterval: number;
  autoStartBreaks: boolean;
  autoStartWork: boolean;
  theme: 'light' | 'dark';
  monthlyGoalHours: number;
  accentColor: string;
  defaultSoundscape: SoundscapeType;
  plannerWorkspace: PlannerWorkspace;
  scratchpad: string;
}

export interface ProductivityStats {
  totalHours: number;
  completedPomodoros: number;
  taskDistribution: { name: string; value: number }[];
  dailyProgress: { date: string; hours: number }[];
  streak: number;
}
