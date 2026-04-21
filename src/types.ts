export type TaskStatus = 'pending' | 'in_progress' | 'completed';
export type TaskPriority = 'baixa' | 'media' | 'alta';

export interface Task {
  id: string;
  title: string;
  description?: string;
  deadline?: string;
  createdAt: number;
  status: TaskStatus;
  priority: TaskPriority;
  isArchived?: boolean;
}

export type TimerMode = 'work' | 'break';

export interface LogEntry {
  id: string;
  timestamp: number;
  message: string;
  type: 'work' | 'break' | 'system';
  duration?: number; // Total session time (seconds)
  elapsed?: number;  // Actual time spent (seconds)
  taskId?: string;
}
