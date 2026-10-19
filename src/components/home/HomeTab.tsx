import React, { useState } from 'react';
import { 
  Play, 
  ArrowRight, 
  Clock, 
  Video, 
  Terminal, 
  FileText, 
  HelpCircle, 
  Code, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Circle, 
  Flame, 
  Sparkles,
  Timer
} from 'lucide-react';
import { Course, UserProfile, AgendaTask, TaskType, getCategoryTheme } from '../../types/eduflow';
import { getDaysUntilExam } from '../../utils/dateUtils';

interface HomeTabProps {
  course?: Course | null;
  userProfile?: UserProfile;
  onContinueSession: (task: AgendaTask) => void;
  onToggleTask: (taskId: string) => void;
  onAddTask?: (task: Omit<AgendaTask, 'id' | 'status'>) => void;
  onDeleteTask?: (taskId: string) => void;
  onOpenAllTasks: () => void;
  onOpenQuickActions?: () => void;
  onOpenCreateCourse?: () => void;
  onLoadSampleTemplate?: () => void;
  onOpenFullNews?: (initialCategory?: string) => void;
  searchFilter?: string;
}

export const HomeTab: React.FC<HomeTabProps> = ({
  course,
  userProfile: _userProfile,
  onContinueSession,
  onToggleTask,
  onAddTask,
  onDeleteTask,
  onOpenAllTasks,
  onOpenQuickActions: _onOpenQuickActions,
  onOpenCreateCourse,
  onLoadSampleTemplate,
  searchFilter = '',
}) => {
  // Inline task addition state
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskType, setNewTaskType] = useState<TaskType>('reading');
  const [newTaskDuration, setNewTaskDuration] = useState<number>(25);
  const [filterMode, setFilterMode] = useState<'all' | 'pending' | 'completed'>('all');

  // If no course exists, show clean empty state
  if (!course) {
    return (
      <div className="w-full max-w-2xl mx-auto py-12 px-4 font-sans text-center space-y-6 select-none">
        <div className="w-12 h-12 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold text-base tracking-tight flex items-center justify-center mx-auto shadow-sm">
          EF
        </div>

        <div className="space-y-1.5">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Study Planner
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Create your study plan to organize daily tasks, set your own goals, and study with focus.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          {onOpenCreateCourse && (
            <button
              onClick={onOpenCreateCourse}
              className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-semibold transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Create study plan</span>
            </button>
          )}

          {onLoadSampleTemplate && (
            <button
              onClick={onLoadSampleTemplate}
              className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-white dark:bg-[#1C1929] hover:bg-slate-50 dark:hover:bg-[#252236] border border-slate-200 dark:border-[#2E2A44] text-slate-700 dark:text-slate-200 text-xs font-medium transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Load sample course</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  const inProgressPhase = course.phases.find((p) => p.status === 'in_progress') || course.phases[0];
  const agendaTasks = course.agenda || [];
  const completedTasks = agendaTasks.filter((t) => t.status === 'completed');
  const pendingTasks = agendaTasks.filter((t) => t.status !== 'completed');
  const completedCount = completedTasks.length;
  const totalAgenda = agendaTasks.length;
  const dailyProgressPercent = totalAgenda > 0 ? Math.round((completedCount / totalAgenda) * 100) : 0;
  
  // Current active task chosen from the user's real agenda
  const currentTask = agendaTasks.find((t) => t.status === 'current') || pendingTasks[0] || null;
  const daysLeft = course.examDate ? getDaysUntilExam(course.examDate) : null;

  // Filter tasks based on search & view filter
  const displayedTasks = agendaTasks.filter((t) => {
    if (searchFilter) {
      const q = searchFilter.toLowerCase();
      if (!t.title.toLowerCase().includes(q) && !t.type.toLowerCase().includes(q)) {
        return false;
      }
    }
    if (filterMode === 'pending') return t.status !== 'completed';
    if (filterMode === 'completed') return t.status === 'completed';
    return true;
  });

  const handleQuickAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !onAddTask) return;

    onAddTask({
      title: newTaskTitle.trim(),
      type: newTaskType,
      durationMinutes: Number(newTaskDuration) || 25,
      phaseId: inProgressPhase?.id,
    });

    setNewTaskTitle('');
  };

  const getTaskIcon = (type: TaskType) => {
    switch (type) {
      case 'video': return <Video className="w-3.5 h-3.5" />;
      case 'lab': return <Terminal className="w-3.5 h-3.5" />;
      case 'reading': return <FileText className="w-3.5 h-3.5" />;
      case 'quiz': return <HelpCircle className="w-3.5 h-3.5" />;
      case 'practice': return <Code className="w-3.5 h-3.5" />;
      default: return <Clock className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto pb-12 font-sans space-y-6 select-none">
      {/* Top Header: Minimal Course Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200/80 dark:border-[#2E2A44]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              {course.code || 'Course'}
            </span>
            {course.streakDays > 0 ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full border border-amber-200/60 dark:border-amber-800/40">
                <Flame className="w-3 h-3 fill-current" />
                <span>{course.streakDays}d streak</span>
              </span>
            ) : (
              <span className="text-[11px] text-slate-400 dark:text-slate-500">
                0d streak
              </span>
            )}
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight mt-0.5">
            {course.title}
          </h1>
        </div>

        <button
          onClick={onOpenAllTasks}
          className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-[#2E2A44] bg-white dark:bg-[#1C1929] hover:bg-slate-50 dark:hover:bg-[#252236] text-xs font-medium text-slate-700 dark:text-slate-200 transition cursor-pointer"
        >
          <span>Curriculum view</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Main Column: Focus Card + Interactive To-Do List */}
        <div className="lg:col-span-8 space-y-5">
          {/* Primary Surface: Current Focus Card (User Driven) */}
          <section 
            className="rounded-xl bg-white dark:bg-[#1C1929] border border-slate-200 dark:border-[#2E2A44] p-5 sm:p-6 transition-all shadow-xs"
            aria-labelledby="hero-focus-heading"
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Current Focus
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                {completedCount} of {totalAgenda} completed ({dailyProgressPercent}%)
              </span>
            </div>

            {currentTask ? (
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 id="hero-focus-heading" className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight leading-snug">
                      {currentTask.title}
                    </h2>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-[#252236] text-[11px] font-medium text-slate-700 dark:text-slate-300">
                        {getTaskIcon(currentTask.type)}
                        <span className="capitalize">{currentTask.type}</span>
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 tabular-nums">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {currentTask.durationMinutes} min
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onToggleTask(currentTask.id)}
                    title="Mark task as complete"
                    className="p-1 rounded-md text-slate-400 hover:text-emerald-500 transition cursor-pointer shrink-0"
                  >
                    <Circle className="w-6 h-6 stroke-[1.5]" />
                  </button>
                </div>

                {/* Progress bar */}
                <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-[#252236] overflow-hidden">
                  <div 
                    className="h-full rounded-full bg-slate-900 dark:bg-slate-100 transition-all duration-300"
                    style={{ width: `${dailyProgressPercent}%` }}
                  />
                </div>

                <div className="pt-1 flex items-center gap-3">
                  <button
                    onClick={() => onContinueSession(currentTask)}
                    className="w-full py-2.5 px-4 rounded-lg bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 font-medium text-xs sm:text-sm transition flex items-center justify-center gap-2 cursor-pointer border border-slate-700/20 dark:border-white/20 shadow-xs"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Start focus session</span>
                  </button>
                </div>
              </div>
            ) : totalAgenda > 0 ? (
              <div className="py-4 text-center space-y-2">
                <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  All done for today! 🎉
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  You completed all {completedCount} tasks planned. Add more tasks below or take a well-deserved break.
                </p>
              </div>
            ) : (
              <div className="py-4 text-center space-y-2">
                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-[#252236] text-slate-400 flex items-center justify-center mx-auto">
                  <Plus className="w-4 h-4" />
                </div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                  No tasks planned yet
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  Add what you want to study today using the input below.
                </p>
              </div>
            )}
          </section>

          {/* User To-Do Section */}
          <section className="space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                  Study To-Do
                </h3>
                <span className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                  ({pendingTasks.length} pending)
                </span>
              </div>

              {/* View filters */}
              <div className="flex items-center bg-slate-100 dark:bg-[#1C1929] border border-slate-200 dark:border-[#2E2A44] p-0.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400">
                <button
                  type="button"
                  onClick={() => setFilterMode('all')}
                  className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                    filterMode === 'all' 
                      ? 'bg-white dark:bg-[#252236] text-slate-900 dark:text-white shadow-xs font-semibold' 
                      : 'hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  All ({totalAgenda})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterMode('pending')}
                  className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                    filterMode === 'pending' 
                      ? 'bg-white dark:bg-[#252236] text-slate-900 dark:text-white shadow-xs font-semibold' 
                      : 'hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  To do ({pendingTasks.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterMode('completed')}
                  className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                    filterMode === 'completed' 
                      ? 'bg-white dark:bg-[#252236] text-slate-900 dark:text-white shadow-xs font-semibold' 
                      : 'hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Done ({completedCount})
                </button>
              </div>
            </div>

            {/* Fast Inline Add Task Input */}
            {onAddTask && (
              <form 
                onSubmit={handleQuickAddTask}
                className="flex flex-col sm:flex-row items-stretch gap-2 p-2 bg-white dark:bg-[#1C1929] rounded-xl border border-slate-200 dark:border-[#2E2A44] shadow-xs"
              >
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="Add a task to do today... (e.g. Read Chapter 3, Solve 10 questions)"
                    className="w-full px-3 py-2 bg-transparent text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-1.5 px-1 self-end sm:self-auto shrink-0">
                  {/* Category select */}
                  <select
                    value={newTaskType}
                    onChange={(e) => setNewTaskType(e.target.value as TaskType)}
                    className="px-2 py-1.5 bg-slate-50 dark:bg-[#13111C] border border-slate-200 dark:border-[#2E2A44] rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
                  >
                    <option value="reading">Reading</option>
                    <option value="practice">Practice</option>
                    <option value="video">Video</option>
                    <option value="lab">Lab</option>
                    <option value="quiz">Quiz</option>
                  </select>

                  {/* Duration select */}
                  <select
                    value={newTaskDuration}
                    onChange={(e) => setNewTaskDuration(Number(e.target.value))}
                    className="px-2 py-1.5 bg-slate-50 dark:bg-[#13111C] border border-slate-200 dark:border-[#2E2A44] rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
                  >
                    <option value={15}>15m</option>
                    <option value={25}>25m</option>
                    <option value={45}>45m</option>
                    <option value={60}>60m</option>
                    <option value={90}>90m</option>
                  </select>

                  <button
                    type="submit"
                    disabled={!newTaskTitle.trim()}
                    className="px-3.5 py-1.5 rounded-lg bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white disabled:opacity-40 text-white dark:text-slate-900 text-xs font-semibold transition flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>
              </form>
            )}

            {/* Tasks List */}
            {displayedTasks.length === 0 ? (
              <div className="p-8 text-center rounded-xl bg-white dark:bg-[#1C1929] border border-slate-200 dark:border-[#2E2A44] text-slate-500 dark:text-slate-400 space-y-1">
                <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  {filterMode === 'completed'
                    ? 'No tasks completed yet.'
                    : filterMode === 'pending'
                    ? 'No pending tasks left!'
                    : 'No tasks found.'}
                </p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500">
                  Add your own tasks above to organize your study session.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {displayedTasks.map((task) => {
                  const isDone = task.status === 'completed';
                  const theme = getCategoryTheme(task.type);

                  return (
                    <div
                      key={task.id}
                      className={`group p-3 sm:p-3.5 rounded-xl bg-white dark:bg-[#1C1929] border transition-colors flex items-center justify-between gap-3 ${
                        isDone 
                          ? 'border-slate-100 dark:border-[#2E2A44] bg-slate-50/50 dark:bg-[#1C1929]/50' 
                          : 'border-slate-200 dark:border-[#2E2A44] hover:border-slate-300 dark:hover:border-[#3B3759]'
                      }`}
                    >
                      {/* Left: Checkbox & Task details */}
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <button
                          type="button"
                          onClick={() => onToggleTask(task.id)}
                          aria-label={`Mark "${task.title}" as ${isDone ? 'incomplete' : 'completed'}`}
                          className="shrink-0 text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400 transition cursor-pointer"
                        >
                          {isDone ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-50 dark:fill-emerald-950" />
                          ) : (
                            <Circle className="w-5 h-5 stroke-[1.5]" />
                          )}
                        </button>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">
                              {theme.name}
                            </span>
                            <span className="text-slate-300 dark:text-slate-600">·</span>
                            <span className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-0.5 tabular-nums">
                              <Clock className="w-3 h-3" />
                              {task.durationMinutes}m
                            </span>
                          </div>

                          <h4 className={`text-xs sm:text-sm font-semibold truncate leading-snug ${
                            isDone 
                              ? 'line-through text-slate-400 dark:text-slate-500 font-normal' 
                              : 'text-slate-900 dark:text-slate-100'
                          }`}>
                            {task.title}
                          </h4>
                        </div>
                      </div>

                      {/* Right: Action Buttons */}
                      <div className="flex items-center gap-1 shrink-0">
                        {!isDone && (
                          <button
                            onClick={() => onContinueSession(task)}
                            title="Start study timer for this task"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#252236] transition cursor-pointer"
                          >
                            <Play className="w-3.5 h-3.5 fill-current" />
                          </button>
                        )}

                        {onDeleteTask && (
                          <button
                            onClick={() => onDeleteTask(task.id)}
                            title="Delete this task"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        {/* Secondary Column: Clean Minimalist Overview */}
        <div className="hidden lg:flex flex-col gap-4 lg:col-span-4 sticky top-20">
          {/* Minimalist Weekly Schedule Card */}
          <div className="p-4 rounded-xl bg-white dark:bg-[#1C1929] border border-slate-200 dark:border-[#2E2A44] space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-slate-900 dark:text-white">
                Weekly Goal
              </h4>
              <span className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                {course.studiedHoursThisWeek || 0} / {course.targetHoursPerWeek || 15}h
              </span>
            </div>

            {/* 7-Day Activity Strip */}
            <div className="grid grid-cols-7 gap-1 pt-1">
              {(course.weeklyActivity && course.weeklyActivity.length === 7
                ? course.weeklyActivity
                : [
                    { day: 'Mon', shortDate: 'M', studied: false },
                    { day: 'Tue', shortDate: 'T', studied: false },
                    { day: 'Wed', shortDate: 'W', studied: false },
                    { day: 'Thu', shortDate: 'T', studied: false },
                    { day: 'Fri', shortDate: 'F', studied: false },
                    { day: 'Sat', shortDate: 'S', studied: false },
                    { day: 'Sun', shortDate: 'S', studied: false },
                  ]
              ).map((d, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <div className={`w-full h-7 rounded-md flex items-center justify-center text-[10px] font-medium transition-colors ${
                    d.studied 
                      ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900' 
                      : 'bg-slate-50 dark:bg-[#13111C] text-slate-400 border border-slate-200 dark:border-[#2E2A44]'
                  }`}>
                    {d.studied ? '✓' : ''}
                  </div>
                  <span className="text-[9px] text-slate-400 dark:text-slate-500">
                    {d.day ? d.day.slice(0, 1) : 'D'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Exam Countdown Card */}
          <div className="p-4 rounded-xl bg-white dark:bg-[#1C1929] border border-slate-200 dark:border-[#2E2A44] space-y-1">
            <h4 className="text-xs font-semibold text-slate-900 dark:text-white">
              Target Exam Date
            </h4>
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-slate-600 dark:text-slate-400">
                {course.examDate ? new Date(course.examDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'No date set'}
              </span>
              <span className="text-xs font-semibold text-slate-900 dark:text-white tabular-nums">
                {daysLeft !== null && daysLeft >= 0 ? `${daysLeft}d left` : '-'}
              </span>
            </div>
          </div>

          {/* Quick Focus Timer Button */}
          <button
            onClick={() => {
              if (currentTask) {
                onContinueSession(currentTask);
              } else {
                onContinueSession({
                  id: 'quick-timer',
                  title: 'Deep Focus Session',
                  type: 'reading',
                  durationMinutes: 25,
                  status: 'current',
                });
              }
            }}
            className="w-full py-2.5 px-3 rounded-xl bg-slate-50 dark:bg-[#1C1929] hover:bg-slate-100 dark:hover:bg-[#252236] border border-slate-200 dark:border-[#2E2A44] text-slate-700 dark:text-slate-200 text-xs font-medium transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Timer className="w-4 h-4 text-slate-500" />
            <span>Quick 25m Focus Timer</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomeTab;
