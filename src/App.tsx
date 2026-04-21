import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Plus, 
  ChevronRight, 
  CheckCircle2, 
  ClipboardList, 
  Clock, 
  Download, 
  Terminal,
  Moon,
  Sun,
  Trash2,
  ExternalLink,
  ChefHat,
  Settings,
  AlertCircle,
  Calendar,
  Zap,
  Coffee,
  Timer,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronDown,
  Archive,
  X,
  Info,
  CalendarDays
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Task, TaskStatus, TimerMode, LogEntry, TaskPriority } from './types';

const INITIAL_WORK_TIME = 25 * 60;
const INITIAL_BREAK_TIME = 5 * 60;

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [timerRemaining, setTimerRemaining] = useState(INITIAL_WORK_TIME);
  const [workTimeLimit, setWorkTimeLimit] = useState(25); // in minutes
  const [breakTimeLimit, setBreakTimeLimit] = useState(5); // in minutes
  const [timerMode, setTimerMode] = useState<TimerMode>('work');
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showArchived, setShowArchived] = useState(false);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [showActiveTaskDetails, setShowActiveTaskDetails] = useState(false);

  // Timer logic
  useEffect(() => {
    let interval: number | undefined;
    if (isTimerRunning && timerRemaining > 0) {
      interval = window.setInterval(() => {
        setTimerRemaining((prev) => prev - 1);
      }, 1000);
    } else if (timerRemaining === 0) {
      handleTimerComplete();
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerRemaining]);

  // Dark mode class toggle
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleTimerComplete = () => {
    setIsTimerRunning(false);
    const completedMode = timerMode;
    const totalDuration = completedMode === 'work' ? workTimeLimit * 60 : breakTimeLimit * 60;
    
    addLog(
      completedMode === 'work' ? 'Estudo Finalizado' : 'Descanso Finalizado', 
      completedMode, 
      totalDuration,
      totalDuration,
      activeTaskId || undefined
    );
    
    setSessionStartTime(null);
    // Auto switch mode
    const nextMode = timerMode === 'work' ? 'break' : 'work';
    setTimerMode(nextMode);
    setTimerRemaining(nextMode === 'work' ? workTimeLimit * 60 : breakTimeLimit * 60);
  };

  const addLog = (message: string, type: 'work' | 'break' | 'system', duration?: number, elapsed?: number, taskId?: string) => {
    setLogs((prev) => [
      {
        id: Math.random().toString(36).substr(2, 9),
        timestamp: Date.now(),
        message,
        type,
        duration,
        elapsed,
        taskId: taskId || activeTaskId || undefined
      },
      ...prev
    ]);
  };

  const addTask = (title: string, priority: TaskPriority = 'media', description?: string, deadline?: string) => {
    const newTask: Task = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      description,
      deadline,
      createdAt: Date.now(),
      status: 'pending',
      priority
    };
    setTasks([...tasks, newTask]);
    setActiveTaskId(newTask.id);
    addLog(`Atividade criada: ${title}`, 'system', undefined, undefined, newTask.id);
  };

  const moveTask = (taskId: string, newStatus: TaskStatus) => {
    setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    const task = tasks.find(t => t.id === taskId);
    
    if (newStatus === 'completed') {
      addLog(`Atividade ${task?.title} finalizada`, 'system', undefined, undefined, taskId);
    } else {
      addStatusLog(task?.title || '', newStatus, taskId);
    }
  };

  const addStatusLog = (title: string, status: string, taskId: string) => {
    const statusMap: any = {
      'pending': 'Pendente',
      'in_progress': 'Em Andamento',
      'completed': 'Concluído'
    };
    addLog(`Atividade ${title} marcada como ${statusMap[status] || status}`, 'system', undefined, undefined, taskId);
  };

  const deleteTask = (taskId: string) => {
    setTasks(tasks.filter(t => t.id !== taskId));
    if (activeTaskId === taskId) setActiveTaskId(null);
  };

  const archiveTask = (taskId: string) => {
    setTasks(tasks.map(t => t.id === taskId ? { ...t, isArchived: true } : t));
    if (activeTaskId === taskId) setActiveTaskId(null);
    const task = tasks.find(t => t.id === taskId);
    addLog(`Atividade arquivada: ${task?.title}`, 'system', undefined, undefined, taskId);
  };

  const archiveCompletedTasks = () => {
    const completedCount = tasks.filter(t => t.status === 'completed' && !t.isArchived).length;
    if (completedCount === 0) return;
    
    setTasks(tasks.map(t => t.status === 'completed' ? { ...t, isArchived: true } : t));
    const activeIsCompleted = tasks.find(t => t.id === activeTaskId)?.status === 'completed';
    if (activeIsCompleted) setActiveTaskId(null);
    
    addLog(`${completedCount} atividades concluídas foram arquivadas`, 'system');
  };

  const toggleTimer = () => {
    if (!isTimerRunning) {
      if (!sessionStartTime) {
        setSessionStartTime(Date.now());
      }
      addLog(`Iniciando ${timerMode === 'work' ? 'Foco' : 'Descanso'}`, timerMode, undefined, undefined, activeTaskId || undefined);
    } else {
      const totalPlanned = timerMode === 'work' ? workTimeLimit * 60 : breakTimeLimit * 60;
      const elapsedSinceStart = sessionStartTime ? Math.floor((Date.now() - sessionStartTime) / 1000) : 0;
      
      addLog(
        `Pausa no ${timerMode === 'work' ? 'Foco' : 'Descanso'}`, 
        'system', 
        totalPlanned,
        elapsedSinceStart,
        activeTaskId || undefined
      );
    }
    setIsTimerRunning(!isTimerRunning);
  };

  const adjustTimer = (minutes: number) => {
    const newSeconds = Math.max(60, timerRemaining + minutes * 60);
    setTimerRemaining(newSeconds);
    if (timerMode === 'work') setWorkTimeLimit(Math.ceil(newSeconds / 60));
    else setBreakTimeLimit(Math.ceil(newSeconds / 60));
  };

  const resetTimer = () => {
    setIsTimerRunning(false);
    setTimerRemaining(timerMode === 'work' ? workTimeLimit * 60 : breakTimeLimit * 60);
    addLog(`Timer reiniciado`, 'system', undefined, undefined, undefined);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const exportToCSV = () => {
    const headers = ['Timestamp', 'Message', 'Type', 'Duration_Sec'];
    const rows = logs.map(log => [
      new Date(log.timestamp).toLocaleString(),
      log.message,
      log.type,
      log.duration || ''
    ]);
    
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `focus_kitchen_log_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const activeTask = tasks.find(t => t.id === activeTaskId);

  return (    <div className="min-h-screen kitchen-grid font-sans">
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
          />
        )}
      </AnimatePresence>

      <div className="content-wrapper relative">
        {/* SIDEBAR: TASK LIST */}
        <aside className={`sidebar-area flex flex-col p-6 overflow-hidden ${!isSidebarOpen ? 'collapsed' : ''}`}>
          <div className="flex justify-between items-start mb-8">
            <div className="flex flex-col gap-1">
              <h2 className="text-xs font-bold uppercase tracking-[3px] text-accent">Atividades</h2>
              <button 
                onClick={() => setShowArchived(!showArchived)}
                className={`text-[9px] font-mono uppercase tracking-widest text-left transition-colors ${showArchived ? 'text-accent' : 'text-zinc-500 hover:text-text-primary'}`}
              >
                {showArchived ? '[ Ver Ativas ]' : '[ Ver Arquivadas ]'}
              </button>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setIsNewTaskModalOpen(true)}
                className="p-1 hover:text-accent transition-colors hidden lg:block"
                title="Nova Atividade"
              >
                <Plus size={20} />
              </button>
              
              {/* MOBILE CLOSE */}
              <button 
                onClick={() => setIsSidebarOpen(false)}
                className="lg:hidden p-1.5 bg-card-bg border border-border rounded-lg text-zinc-500 hover:text-text-primary transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {!showArchived && (
            <button 
              onClick={() => setIsNewTaskModalOpen(true)}
              className="lg:hidden w-full mb-6 py-2 bg-accent/20 border border-accent/30 rounded flex items-center justify-center gap-2 text-[10px] font-bold text-accent uppercase tracking-widest hover:bg-accent/30 transition-all shadow-sm"
            >
              <Plus size={14} /> Nova Atividade
            </button>
          )}

          <div className="flex-1 overflow-y-auto space-y-3 pr-2 terminal-scroll">
            {tasks
              .filter(t => showArchived ? t.isArchived : !t.isArchived)
              .sort((a, b) => {
                // Sorting order: Completed at the bottom
                if (a.status === 'completed' && b.status !== 'completed') return 1;
                if (a.status !== 'completed' && b.status === 'completed') return -1;
                return b.createdAt - a.createdAt;
              })
              .map(task => (
                <motion.div
                layout
                key={task.id}
                onClick={() => {
                  setActiveTaskId(task.id);
                  if (window.innerWidth < 1024) setIsSidebarOpen(false);
                }}
                className={`
                  p-4 rounded-lg border cursor-pointer transition-all group relative overflow-hidden
                  ${activeTaskId === task.id ? 'bg-card-bg border-accent shadow-lg shadow-accent/5' : 'bg-transparent border-border hover:border-zinc-500'}
                `}
              >
                {activeTaskId === task.id && (
                  <div className="absolute top-0 right-0 w-1 h-full bg-accent" />
                )}
                
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider
                      ${task.priority === 'alta' ? 'bg-red-500/20 text-red-500' : 
                        task.priority === 'media' ? 'bg-accent/20 text-accent' : 
                        'bg-zinc-500/20 text-zinc-500'}
                    `}>
                      {task.priority}
                    </span>
                    <span className="font-mono text-[8px] text-zinc-600">
                      {new Date(task.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={(e) => { e.stopPropagation(); archiveTask(task.id); }}
                      className="text-zinc-600 hover:text-accent transition-colors p-1"
                      title="Arquivar Atividade"
                    >
                      <Archive size={12} />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); deleteTask(task.id); }}
                      className="text-zinc-600 hover:text-red-400 transition-opacity p-1"
                      title="Excluir Atividade"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>

                <h3 className={`text-sm font-medium mb-1 transition-colors ${activeTaskId === task.id ? 'text-text-primary' : 'text-zinc-500'}`}>
                  {task.title}
                </h3>

                {task.description && (
                  <p className="text-[10px] text-zinc-500 line-clamp-1 mb-2 italic transition-colors">
                    {task.description}
                  </p>
                )}

                {task.deadline && (
                  <div className="flex items-center gap-1 text-[9px] text-orange-500/70 font-mono mb-2">
                    <Calendar size={10} /> {new Date(task.deadline).toLocaleDateString('pt-BR')}
                  </div>
                )}
                
                  <div className="flex items-center justify-between">
                    <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full
                      ${task.status === 'completed' ? 'bg-status-completed-bg text-status-completed-text' : 
                        task.status === 'in_progress' ? 'bg-status-progress-bg text-status-progress-text' : 
                        'bg-status-pending-bg text-status-pending-text'}
                    `}>
                      {task.status === 'completed' ? 'CONCLUÍDO' : 
                      task.status === 'in_progress' ? 'EM ANDAMENTO' : 
                      'PENDENTE'}
                    </span>
                    {task.status === 'completed' && <CheckCircle2 size={10} className="text-status-completed-text" />}
                  </div>
              </motion.div>
            ))}
            {tasks.filter(t => showArchived ? t.isArchived : !t.isArchived).length === 0 && (
              <div className="text-center py-20 opacity-20 flex flex-col items-center">
                <ClipboardList size={32} />
                <p className="mt-2 text-[10px] font-mono uppercase">
                  {showArchived ? 'Sem Arquivadas' : 'Sem Atividades'}
                </p>
              </div>
            )}
          </div>

          <div className="mt-6 pt-6 border-t border-border space-y-2">
            <button 
              onClick={exportToCSV}
              className="w-full py-2 bg-main border border-border rounded text-[10px] font-bold text-text-primary uppercase tracking-widest hover:border-accent transition-colors"
            >
              Exportar CSV
            </button>
            <button 
              onClick={() => setIsSettingsModalOpen(true)}
              className="w-full py-2 border border-border rounded text-[10px] font-bold text-zinc-500 uppercase tracking-widest hover:text-text-primary transition-colors hover:bg-main/50"
            >
              Configurações
            </button>

            <div className="pt-4 space-y-2">
              <button 
                onClick={() => setIsTimerRunning(false)}
                className="w-full py-2 border border-border rounded text-[10px] font-bold text-zinc-500 uppercase tracking-widest hover:text-text-primary transition-colors bg-main/30"
              >
                Pausar Tudo
              </button>
              <button 
                onClick={archiveCompletedTasks}
                className="w-full py-2 border border-border rounded text-[10px] font-bold text-zinc-500 uppercase tracking-widest hover:border-accent hover:text-accent transition-all bg-main/30"
              >
                Arquivar Concluídos
              </button>
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT Area */}
        <main className="main-content flex flex-col relative">
          {/* SIDEBAR TOGGLE */}
          <div className="absolute top-6 left-6 z-10 flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 text-zinc-500 hover:text-accent transition-all bg-card-bg/60 backdrop-blur border border-border rounded-lg hover:border-accent/40 shadow-xl"
              title={isSidebarOpen ? "Fechar Sidebar" : "Abrir Sidebar"}
            >
              {isSidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
            </button>

            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 text-zinc-500 hover:text-accent transition-all bg-card-bg/60 backdrop-blur border border-border rounded-lg hover:border-accent/40 shadow-xl"
              title={isDarkMode ? "Modo Claro" : "Modo Escuro"}
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            
            {!isSidebarOpen && activeTask && (
              <motion.div 
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest bg-card-bg px-3 py-2 rounded-lg border border-border transition-colors transition-shadow"
              >
                Foco: <span className="text-text-primary font-bold">{activeTask.title}</span>
              </motion.div>
            )}
          </div>

          <div className={`flex-1 flex flex-col pt-12 transition-all duration-300 ${isSidebarOpen ? 'px-4' : 'px-4 md:px-16 lg:px-24'}`}>
            {/* ACTIVE TASK TITLE */}
            <div className="mb-12 flex flex-col gap-6">
              <div className="w-full">
                <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-[4px] mb-4">Em Foco Agora</div>
                <div className="flex flex-col gap-6">
                  <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black uppercase tracking-tighter text-text-primary leading-tight md:leading-none break-words transition-colors">
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={activeTaskId || 'none'}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -20, opacity: 0 }}
                        className="block"
                      >
                        {activeTask ? activeTask.title : 'SELECIONE UMA ATIVIDADE'}
                      </motion.span>
                    </AnimatePresence>
                  </h1>

                  <div className="flex flex-wrap items-center gap-4">
                    {activeTask && activeTask.status === 'pending' && (
                      <button 
                        onClick={() => {
                          moveTask(activeTask.id, 'in_progress');
                          if (!isTimerRunning) toggleTimer();
                        }}
                        className="bg-accent text-white dark:text-black px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-[3px] shadow-xl shadow-accent/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
                      >
                        <Play size={18} fill="currentColor" /> INICIAR ATIVIDADE
                      </button>
                    )}

                    {activeTask && activeTask.status === 'in_progress' && (
                      <button 
                        onClick={() => moveTask(activeTask.id, 'completed')}
                        className="bg-accent text-white dark:text-black px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-[2px] shadow-xl shadow-accent/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                      >
                        <CheckCircle2 size={16} /> Finalizar Atividade
                      </button>
                    )}

                    {activeTask && (
                      <button 
                        onClick={() => setShowActiveTaskDetails(!showActiveTaskDetails)}
                        className={`flex items-center gap-2 px-4 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all ${
                          showActiveTaskDetails 
                            ? 'bg-accent/20 border-accent/40 text-accent' 
                            : 'bg-card-bg border-border text-zinc-500 hover:text-text-primary shadow-sm'
                        }`}
                      >
                        <Info size={16} /> 
                        {showActiveTaskDetails ? 'Ocultar Detalhes' : 'Ver Detalhes'}
                      </button>
                    )}
                  </div>
                </div>

                <AnimatePresence>
                  {showActiveTaskDetails && activeTask && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-8 p-6 bg-card-bg border border-border rounded-2xl space-y-6 transition-colors shadow-sm">
                        {activeTask.description && (
                          <div className="space-y-2">
                            <div className="text-[10px] font-mono text-zinc-400 dark:text-zinc-600 uppercase tracking-widest">Descrição</div>
                            <p className="text-text-primary/70 text-sm leading-relaxed">{activeTask.description}</p>
                          </div>
                        )}
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-border/50">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-main rounded-lg text-zinc-400">
                              <CalendarDays size={14} />
                            </div>
                            <div>
                              <div className="text-[9px] font-mono text-zinc-400 dark:text-zinc-600 uppercase tracking-widest">Prazo</div>
                              <div className="text-xs text-text-primary/80">{activeTask.deadline || 'Sem prazo'}</div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${
                              activeTask.priority === 'alta' ? 'bg-red-500/10 text-red-500' :
                              activeTask.priority === 'media' ? 'bg-accent/10 text-accent' :
                              'bg-zinc-500/10 text-zinc-500'
                            }`}>
                              <AlertCircle size={14} />
                            </div>
                            <div>
                              <div className="text-[9px] font-mono text-zinc-400 dark:text-zinc-600 uppercase tracking-widest">Prioridade</div>
                              <div className="text-xs text-text-primary/80 uppercase tracking-wider">
                                {activeTask.priority === 'alta' ? 'Alta' : activeTask.priority === 'media' ? 'Média' : 'Baixa'}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* TIMELINE SECTION */}
            <div className="flex-1 max-w-3xl overflow-hidden flex flex-col">
              <h2 className="text-xs font-bold uppercase tracking-[2px] text-text-dim mb-6 flex items-center gap-2">
                <Zap size={14} className="text-accent" /> Linha do Tempo de Foco
              </h2>
              
              <div className="flex-1 space-y-6 overflow-y-auto terminal-scroll pr-4 pb-72 lg:pb-20">
                {activeTaskId ? (
                  logs.filter(l => l.taskId === activeTaskId).length > 0 ? (
                    logs.filter(l => l.taskId === activeTaskId).map(log => {
                      const isSystem = log.type === 'system';
                      if (isSystem && !log.elapsed) return null; // Skip non-time system logs
                      
                      return (
                        <motion.div 
                          initial={{ x: -10, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          key={log.id} 
                          className="flex items-center gap-6 group relative"
                        >
                          <div className="font-mono text-3xl font-bold text-text-primary w-28 tabular-nums tracking-tighter">
                            {log.elapsed ? formatTime(log.elapsed) : formatTime(log.duration || 0)}
                          </div>
                          <div className="flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mb-1">
                              <span className={`text-[10px] font-bold uppercase tracking-[2px] ${
                                log.type === 'work' ? 'text-accent' : 
                                log.type === 'break' ? 'text-blue-400' : 
                                'text-zinc-500'
                              }`}>
                                {log.type === 'work' ? 'Trabalho' : log.type === 'break' ? 'Pausa' : 'Sessão Pausada'}
                              </span>
                              <span className="text-[10px] font-mono text-zinc-600">
                                {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <div className="text-zinc-400 text-xs italic opacity-70">
                              {log.duration && log.elapsed && log.elapsed >= log.duration ? (
                                <span className="text-accent font-bold">[OK] Ciclo Completo de {Math.floor(log.duration / 60)}m</span>
                              ) : log.duration ? (
                                <span>Meta: {Math.floor(log.duration / 60)}m — {Math.floor(((log.elapsed || 0) / log.duration) * 100)}% concluído</span>
                              ) : log.message}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })
                  ) : (
                    <div className="text-zinc-700 font-mono text-[10px] uppercase italic opacity-50">Nenhuma sessão registrada. Inicie o cronômetro para trackear.</div>
                  )
                ) : (
                  <div className="text-zinc-700 font-mono text-[10px] uppercase italic opacity-50 flex flex-col items-center justify-center py-20">
                    <Terminal size={24} className="mb-4" />
                    Selecione uma atividade para ver o histórico de foco
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* BOTTOM TIMER CONTROL */}
          <div className="fixed lg:absolute bottom-4 sm:bottom-8 lg:bottom-12 left-1/2 -translate-x-1/2 lg:left-auto lg:translate-x-0 lg:right-12 flex flex-col items-center lg:items-end gap-3 sm:gap-6 glass-card p-4 sm:p-6 rounded-[2.5rem] z-30 w-[calc(100vw-2rem)] sm:w-auto">
            <div className="timer-accent-glow" />
            <div className="flex flex-col lg:flex-row items-center gap-2 lg:gap-3 w-full lg:w-auto">
              <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
                {[5, 15, 25, 45].map(min => (
                  <button
                    key={min}
                    onClick={() => {
                      setTimerRemaining(min * 60);
                      if (timerMode === 'work') setWorkTimeLimit(min);
                      else setBreakTimeLimit(min);
                    }}
                    className="px-4 py-1.5 bg-main/40 dark:bg-main/20 border border-border rounded-xl text-[10px] font-bold text-zinc-500 uppercase hover:text-accent hover:border-accent hover:bg-card-bg transition-all shadow-sm active:scale-95"
                  >
                    {min}m
                  </button>
                ))}
              </div>
              
              <div className="hidden lg:block w-px bg-border/50 h-4 mx-1" />

              <div className="flex gap-2 w-full lg:w-auto">
                <button 
                  onClick={() => adjustTimer(1)} 
                  className="flex-1 lg:flex-none h-8 px-3 flex items-center justify-center bg-main/40 dark:bg-main/20 border border-border rounded-xl text-xs text-zinc-500 hover:text-text-primary transition-all shadow-sm active:scale-95"
                >
                  +
                </button>
                <button 
                  onClick={() => adjustTimer(-1)} 
                  className="flex-1 lg:flex-none h-8 px-3 flex items-center justify-center bg-main/40 dark:bg-main/20 border border-border rounded-xl text-xs text-zinc-500 hover:text-text-primary transition-all shadow-sm active:scale-95"
                >
                  -
                </button>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row items-center lg:items-end gap-4 lg:gap-10 w-full lg:w-auto">
              <div className="flex flex-col items-center lg:items-end w-full lg:w-auto">
                <div className="flex items-center justify-center lg:justify-end mb-3 w-full">
                  <div className="flex bg-main/50 p-1 rounded-2xl border border-border shadow-inner">
                    <button 
                      onClick={() => {
                        setTimerMode('work');
                        setTimerRemaining(workTimeLimit * 60);
                      }}
                      className={`text-[10px] font-bold uppercase tracking-widest px-8 py-2.5 rounded-xl transition-all duration-300 ${timerMode === 'work' ? 'bg-card-bg text-accent shadow-[0_2px_10px_rgba(0,0,0,0.05)] dark:shadow-[0_2px_10px_rgba(0,0,0,0.3)]' : 'text-zinc-500 hover:text-text-primary'}`}
                    >
                      Foco
                    </button>
                    <button 
                      onClick={() => {
                        setTimerMode('break');
                        setTimerRemaining(breakTimeLimit * 60);
                      }}
                      className={`text-[10px] font-bold uppercase tracking-widest px-8 py-2.5 rounded-xl transition-all duration-300 ${timerMode === 'break' ? 'bg-card-bg text-blue-500 shadow-[0_2px_10px_rgba(0,0,0,0.05)] dark:shadow-[0_2px_10px_rgba(0,0,0,0.3)]' : 'text-zinc-500 hover:text-text-primary'}`}
                    >
                      Pausa
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="text-6xl sm:text-7xl md:text-8xl font-mono text-text-primary tabular-nums tracking-tighter leading-none font-black transition-colors drop-shadow-sm">
                    {formatTime(timerRemaining)}
                  </div>
                  <div className="flex flex-col gap-2 sm:gap-3">
                      <button 
                        onClick={toggleTimer}
                        className={`w-14 h-14 sm:w-20 sm:h-20 flex items-center justify-center rounded-[2rem] transition-all shadow-xl hover:scale-105 active:scale-95 border-b-4 ${isTimerRunning ? 'bg-status-pending-bg text-status-pending-text border-orange-200' : 'bg-accent text-white dark:text-black border-accent/30'}`}
                      >
                        {isTimerRunning ? <Pause size={28} className="w-8 h-8 sm:w-10 sm:h-10" fill="currentColor" /> : <Play size={28} className="w-8 h-8 sm:w-10 sm:h-10 ml-1" fill="currentColor" />}
                      </button>
                    <button 
                      onClick={resetTimer}
                      className="w-14 h-14 sm:w-20 sm:h-20 flex items-center justify-center border border-border bg-main/50 text-zinc-500 rounded-[2rem] hover:text-text-primary hover:border-accent transition-all shadow-sm group"
                    >
                      <RotateCcw size={22} className="w-6 h-6 sm:w-8 sm:h-8 group-active:rotate-[-180deg] transition-transform duration-500" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* FOOTER: SYSTEM INFO */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.footer 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="footer-area overflow-hidden"
          >
            <div className="flex items-center gap-4 ml-auto">
              <span className="font-mono text-[9px] text-zinc-700 uppercase tracking-widest">
                OS // FOCUSBOARD_v1.2 // SESSION_ID_{Math.random().toString(36).substr(2, 5).toUpperCase()}
              </span>
              <div className="w-px h-4 bg-border" />
              <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest hidden sm:inline">
                BACKUP: {new Date().toISOString().split('T')[0]}.CSV
              </span>
              <button 
                onClick={exportToCSV}
                className="flex items-center gap-2 px-4 py-2 bg-accent/5 border border-accent/20 rounded text-[9px] font-bold text-accent uppercase hover:bg-accent/10 transition-all"
              >
                <Download size={12} /> EXPORTAR DADOS
              </button>
            </div>
          </motion.footer>
        )}
      </AnimatePresence>

      {/* MODALS */}
      <AnimatePresence>
        {isNewTaskModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsNewTaskModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-card-bg w-full max-w-md rounded-2xl p-8 border border-border shadow-2xl transition-colors"
            >
              <h2 className="text-2xl font-black uppercase italic mb-6 text-text-primary tracking-widest transition-colors">Nova Atividade</h2>
              <form onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const titleEl = form.elements.namedItem('title') as HTMLInputElement;
                const descEl = form.elements.namedItem('description') as HTMLTextAreaElement;
                const deadlineEl = form.elements.namedItem('deadline') as HTMLInputElement;
                const priorityEl = form.elements.namedItem('priority') as HTMLSelectElement;

                const title = titleEl.value;
                const description = descEl?.value;
                const deadline = deadlineEl?.value;
                const priority = (priorityEl?.value as TaskPriority) || 'media';
                
                if (title) {
                  addTask(title, priority, description, deadline);
                  setIsNewTaskModalOpen(false);
                  setShowMoreOptions(false);
                }
              }}>
                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-bold uppercase text-text-dim mb-2 block tracking-widest">O que você vai realizar?</label>
                    <input 
                      name="title" 
                      autoFocus
                      required
                      className="w-full bg-main border border-border rounded-lg p-4 text-text-primary focus:border-accent outline-none transition-colors"
                      placeholder="EX: DEFINIR ESTRUTURA DO API..."
                      autoComplete="off"
                    />
                  </div>

                  <button 
                    type="button"
                    onClick={() => setShowMoreOptions(!showMoreOptions)}
                    className="flex items-center gap-2 text-[10px] font-bold uppercase text-zinc-500 hover:text-accent transition-colors"
                  >
                    {showMoreOptions ? 'Ocultar Detalhes' : 'Adicionar Detalhes'}
                    <ChevronDown size={14} className={`transition-transform ${showMoreOptions ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {showMoreOptions && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden space-y-4"
                      >
                        <div>
                          <label className="text-[10px] font-bold uppercase text-text-dim mb-2 block tracking-widest">Descrição Curta</label>
                          <textarea 
                            name="description"
                            rows={2}
                            className="w-full bg-main border border-border rounded-lg p-4 text-text-primary focus:border-accent outline-none transition-colors resize-none"
                            placeholder="Breve comentário sobre o foco..."
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-[10px] font-bold uppercase text-text-dim mb-2 block tracking-widest">Prazo (Deadline)</label>
                            <input 
                              type="date"
                              name="deadline"
                              className="w-full bg-main border border-border rounded-lg p-4 text-text-primary focus:border-accent outline-none transition-colors"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold uppercase text-text-dim mb-2 block tracking-widest">Prioridade</label>
                            <select 
                              name="priority"
                              defaultValue="media"
                              className="w-full bg-main border border-border rounded-lg p-4 text-text-primary focus:border-accent outline-none transition-colors appearance-none"
                            >
                              <option value="baixa">Baixa</option>
                              <option value="media">Média</option>
                              <option value="alta">Alta</option>
                            </select>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <button 
                    type="submit"
                    className="w-full py-4 bg-accent text-black rounded-lg font-black text-sm uppercase tracking-widest shadow-xl shadow-accent/10 hover:opacity-90 transition-opacity"
                  >
                    INICIAR AGORA
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {isSettingsModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSettingsModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-card-bg w-full max-w-md rounded-2xl p-8 border border-border shadow-2xl transition-colors"
            >
              <h2 className="text-2xl font-black uppercase italic mb-6 text-text-primary uppercase tracking-tighter transition-colors">Receita do Timer</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-bold uppercase text-text-dim mb-3 block tracking-widest flex justify-between">
                    Tempo de Foco (MIN)
                    <span className="text-accent">{workTimeLimit}m</span>
                  </label>
                  <input 
                    type="range"
                    min="1"
                    max="60"
                    value={workTimeLimit}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      setWorkTimeLimit(val);
                      if (!isTimerRunning && timerMode === 'work') {
                        setTimerRemaining(val * 60);
                      }
                    }}
                    className="w-full h-1 bg-border rounded-lg appearance-none cursor-pointer accent-accent"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase text-text-dim mb-3 block tracking-widest flex justify-between">
                    Tempo de Pausa (MIN)
                    <span className="text-accent">{breakTimeLimit}m</span>
                  </label>
                  <input 
                    type="range"
                    min="1"
                    max="30"
                    value={breakTimeLimit}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      setBreakTimeLimit(val);
                      if (!isTimerRunning && timerMode === 'break') {
                        setTimerRemaining(val * 60);
                      }
                    }}
                    className="w-full h-1 bg-border rounded-lg appearance-none cursor-pointer accent-accent"
                  />
                </div>

                <div className="pt-4 flex gap-3">
                  <button 
                    onClick={() => setIsSettingsModalOpen(false)}
                    className="flex-1 py-4 bg-accent text-black rounded-lg font-black text-sm uppercase tracking-widest shadow-xl shadow-accent/10 hover:opacity-90 transition-opacity"
                  >
                    SALVAR RECEITA
                  </button>
                </div>

                <p className="text-[10px] font-mono text-zinc-600 text-center uppercase">
                  # CONFIG_v1.0 // FOCUS_kitchen
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
