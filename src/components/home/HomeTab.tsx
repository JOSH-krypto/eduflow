import React from 'react';
import { 
  Play, 
  ArrowRight, 
  Clock, 
  Sparkles, 
  Video, 
  Terminal, 
  FileText, 
  HelpCircle, 
  Code,
  Flame,
  Calendar,
  TrendingUp,
  PlusCircle,
  Compass
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Course, UserProfile, AgendaTask, TaskType, getCategoryTheme } from '../../types/eduflow';
import { CircularProgressRing } from '../common/CircularProgressRing';
import { getDaysUntilExam } from '../../utils/dateUtils';
import { AcademicNewsSection } from '../news/AcademicNewsSection';

interface HomeTabProps {
  course?: Course | null;
  userProfile?: UserProfile;
  onContinueSession: (task: AgendaTask) => void;
  onToggleTask: (taskId: string) => void;
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
  onOpenAllTasks,
  onOpenQuickActions,
  onOpenCreateCourse,
  onLoadSampleTemplate,
  onOpenFullNews,
  searchFilter = '',
}) => {
  // If no course exists at all, render Academic News + First-Run Onboarding
  if (!course) {
    return (
      <div className="w-full max-w-7xl mx-auto py-4 animate-fade-in font-sans space-y-8 select-none">
        {/* Academic News Section */}
        <AcademicNewsSection onOpenFullNews={onOpenFullNews} />

        {/* Onboarding Action Card */}
        <div className="p-8 sm:p-10 rounded-2xl bg-white dark:bg-[#1C1929] border border-slate-200/90 dark:border-[#2E2A44] shadow-sm text-center space-y-4 max-w-3xl mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-slate-900 dark:bg-[#2E2A44] text-amber-400 flex items-center justify-center mx-auto shadow-sm ring-1 ring-white/10">
            <Sparkles className="w-7 h-7" />
          </div>

          <div className="max-w-md mx-auto space-y-1.5">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight font-heading">
              Welcome to Your Exam Prep Command Center
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Track high-yield certification domains, sequential milestone phases, and live academic research.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            {onOpenCreateCourse && (
              <button
                onClick={onOpenCreateCourse}
                className="w-full sm:w-auto px-6 py-3 rounded-full bg-slate-900 dark:bg-[#2E2A44] hover:bg-slate-800 dark:hover:bg-[#3B3759] text-white text-xs sm:text-sm font-semibold shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4 text-amber-400" />
                <span>Create Your Study Plan</span>
              </button>
            )}

            {onLoadSampleTemplate && (
              <button
                onClick={onLoadSampleTemplate}
                className="w-full sm:w-auto px-6 py-3 rounded-full bg-slate-50 dark:bg-[#13111C] hover:bg-slate-100 dark:hover:bg-[#252236] border border-slate-200/90 dark:border-[#2E2A44] text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-semibold shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Compass className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>Try Sample AWS SAA-C03 Track</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Active in-progress phase
  const inProgressPhase = course.phases.find((p) => p.status === 'in_progress') || course.phases[0];

  // Daily agenda tasks
  const agendaTasks = course.agenda || [];
  const completedCount = agendaTasks.filter((t) => t.status === 'completed').length;
  const totalAgenda = agendaTasks.length;
  const dailyProgressPercent = totalAgenda > 0 ? Math.round((completedCount / totalAgenda) * 100) : 0;

  // Active or first task to focus on
  const currentTask = agendaTasks.find((t) => t.status === 'current') || agendaTasks.find((t) => t.status !== 'completed') || agendaTasks[0];

  // Days left
  const daysLeft = course.examDate ? getDaysUntilExam(course.examDate) : null;

  // Filter tasks if search is active
  const filteredAgenda = agendaTasks.filter((t) => {
    if (!searchFilter) return true;
    const q = searchFilter.toLowerCase();
    return t.title.toLowerCase().includes(q) || t.type.toLowerCase().includes(q);
  });

  // Calculate Category breakdown
  const categoryHoursMap: Record<string, number> = {
    study: 0,
    review: 0,
    practice: 0,
    lab: 0,
  };

  agendaTasks.forEach((t) => {
    const hours = (t.durationMinutes || 0) / 60;
    if (t.type === 'video' || t.type === 'reading') categoryHoursMap.study += hours;
    else if (t.type === 'quiz') categoryHoursMap.review += hours;
    else if (t.type === 'practice') categoryHoursMap.practice += hours;
    else if (t.type === 'lab') categoryHoursMap.lab += hours;
  });

  const categoryData = [
    { name: 'Study (Video/Read)', hours: Math.round(categoryHoursMap.study * 10) / 10, color: '#F59E0B' },
    { name: 'Practice & Labs', hours: Math.round((categoryHoursMap.practice + categoryHoursMap.lab) * 10) / 10, color: '#0F766E' },
    { name: 'Review & Quizzes', hours: Math.round(categoryHoursMap.review * 10) / 10, color: '#7C3AED' },
  ].filter((c) => c.hours > 0);

  const totalCategoryHours = categoryData.reduce((acc, c) => acc + c.hours, 0);

  // Icon mapping helper
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

  // Dynamic AI Insight generation based on actual user data
  const hasEnoughHistory = completedCount >= 2 || course.studiedHoursThisWeek > 0;
  const activeFocusTopic = inProgressPhase?.topicsCovered?.[0] || inProgressPhase?.title || currentTask?.title;

  return (
    <div className="w-full max-w-7xl mx-auto animate-fade-in pb-12 font-sans space-y-8 select-none">
      {/* =========================================================================
          ACADEMIC NEWS SECTION
          ========================================================================= */}
      <AcademicNewsSection onOpenFullNews={onOpenFullNews} />

      {/* Divider */}
      <div className="border-t border-slate-200/80 dark:border-[#2E2A44]" />

      {/* Section Header: Active Course Command Center */}
      <div className="flex items-center justify-between px-1 -mb-2">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Active Study Pathway
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight font-heading">
            {course.title}
          </h2>
        </div>

        <button
          onClick={onOpenAllTasks}
          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-slate-200/90 dark:border-[#2E2A44] bg-white dark:bg-[#1C1929] hover:bg-slate-50 dark:hover:bg-[#252236] active:scale-95 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-sm transition cursor-pointer"
        >
          <span>Curriculum View</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Responsive Grid Shell: 1 Column on Mobile/Tablet, 2 Columns (8 + 4) on Desktop ≥1024px */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* =========================================================================
            MAIN COLUMN (lg:col-span-8) : Hero Focus Card + 2-Col Today's Plan
            ========================================================================= */}
        <div className="lg:col-span-8 space-y-6">
          {/* 1. HERO FOCUS CARD */}
          <section 
            className="relative overflow-hidden rounded-2xl bg-white dark:bg-[#1C1929] border border-slate-200/90 dark:border-[#2E2A44] shadow-sm p-5 sm:p-7 transition-all duration-300 hover:shadow-md hover:border-slate-300 dark:hover:border-[#3B3759]"
            aria-labelledby="hero-focus-heading"
          >
            {/* Top Meta Line: Phase Badge + Streak */}
            <div className="flex items-center justify-between gap-2 mb-3 sm:mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-[#2E2A44] text-slate-800 dark:text-slate-200 font-semibold text-xs">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                {inProgressPhase ? `Phase ${inProgressPhase.phaseNumber} · ${inProgressPhase.title}` : 'Getting Started'}
              </span>

              <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 border border-amber-200/60 dark:border-amber-900/60 px-3 py-1 rounded-full font-mono">
                <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                {course.streakDays > 0 ? `${course.streakDays}d Streak` : '0d Streak'}
              </span>
            </div>

            {/* Focus Item Title */}
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Up Next for You
              </span>
              <h3 id="hero-focus-heading" className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight leading-snug font-heading">
                {currentTask ? currentTask.title : 'No tasks scheduled yet'}
              </h3>
            </div>

            {/* Progress Bar & Status Line */}
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-[#2E2A44] space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-sans">
                <span>
                  <strong className="text-slate-900 dark:text-white font-semibold">{completedCount} of {totalAgenda} sessions</strong> completed today
                </span>
                <span className="font-bold text-slate-900 dark:text-white font-mono">
                  {dailyProgressPercent}%
                </span>
              </div>

              <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-[#252236] overflow-hidden">
                <div 
                  className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-500 shadow-sm"
                  style={{ width: `${dailyProgressPercent}%` }}
                />
              </div>
            </div>

            {/* Action Mini-Cards Grid on Larger Screens */}
            {inProgressPhase && (inProgressPhase.nextVideo || inProgressPhase.upcomingLab) && (
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {inProgressPhase.nextVideo && (
                  <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-[#13111C]/80 border border-slate-200/60 dark:border-[#2E2A44] flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-white dark:bg-[#1C1929] border border-slate-200 dark:border-[#2E2A44] text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0">
                        <Video className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                          Next Video
                        </span>
                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate block">
                          {inProgressPhase.nextVideo.title}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-medium text-slate-400 shrink-0 font-mono">
                      {inProgressPhase.nextVideo.duration}
                    </span>
                  </div>
                )}

                {inProgressPhase.upcomingLab && (
                  <div className="p-3 rounded-xl bg-amber-50/30 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/40 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 flex items-center justify-center shrink-0">
                        <Terminal className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 block">
                          Upcoming Lab
                        </span>
                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate block">
                          {inProgressPhase.upcomingLab.title}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-medium text-slate-400 shrink-0 font-mono">
                      {inProgressPhase.upcomingLab.duration}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Main Action Button */}
            <div className="mt-5">
              {currentTask ? (
                <button
                  onClick={() => onContinueSession(currentTask)}
                  className="w-full py-3 px-6 rounded-full bg-slate-900 dark:bg-[#2E2A44] hover:bg-slate-800 dark:hover:bg-[#3B3759] active:scale-[0.99] text-white font-semibold text-xs sm:text-sm shadow-sm transition-all flex items-center justify-center gap-2 group cursor-pointer ring-1 ring-white/10"
                  aria-label="Continue current study session"
                >
                  <Play className="w-4 h-4 fill-amber-400 text-amber-400 group-hover:translate-x-0.5 transition-transform" />
                  <span>Continue Session</span>
                  <ArrowRight className="w-4 h-4 opacity-70 group-hover:translate-x-1 transition-transform" />
                </button>
              ) : (
                <button
                  onClick={onOpenQuickActions}
                  className="w-full py-3 px-6 rounded-full bg-slate-900 dark:bg-[#2E2A44] hover:bg-slate-800 dark:hover:bg-[#3B3759] active:scale-[0.99] text-white font-semibold text-xs sm:text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer ring-1 ring-white/10"
                  aria-label="Schedule your first task"
                >
                  <PlusCircle className="w-4 h-4 text-amber-400" />
                  <span>+ Add Your First Task</span>
                </button>
              )}
            </div>
          </section>

          {/* 2. TODAY'S PLAN SECTION */}
          <section aria-labelledby="todays-plan-heading" className="space-y-3">
            {/* Header + Count Badge + See all */}
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2.5">
                <h3 id="todays-plan-heading" className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight font-heading">
                  Today's Plan
                </h3>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 dark:bg-[#2E2A44] text-slate-800 dark:text-slate-200 font-mono">
                  {completedCount}/{totalAgenda}
                </span>
              </div>

              <button
                onClick={onOpenAllTasks}
                className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 transition cursor-pointer"
              >
                <span>Curriculum</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Task Rows or Genuine Empty State */}
            {filteredAgenda.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-white dark:bg-[#1C1929] border border-slate-200/90 dark:border-[#2E2A44] shadow-sm space-y-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-[#2E2A44] text-slate-400 flex items-center justify-center mx-auto">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Nothing scheduled for today</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Add study topics, video lessons, or hands-on practice to your daily focus list.
                  </p>
                </div>
                {onOpenQuickActions && (
                  <button
                    onClick={onOpenQuickActions}
                    className="px-4 py-2 bg-slate-900 dark:bg-[#2E2A44] text-white font-semibold text-xs rounded-full hover:bg-slate-800 dark:hover:bg-[#3B3759] transition cursor-pointer"
                  >
                    + Add Study Task
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredAgenda.map((task, idx) => {
                  const isDone = task.status === 'completed';
                  const isCurrent = task.status === 'current';
                  const theme = getCategoryTheme(task.type);

                  return (
                    <div
                      key={task.id}
                      className={`p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-[#1C1929] border transition-all duration-200 flex items-center justify-between gap-3 shadow-sm hover:-translate-y-0.5 hover:shadow-md hover:border-slate-300 dark:hover:border-[#3B3759] ${
                        isDone 
                          ? 'border-slate-100 dark:border-[#2E2A44] opacity-75' 
                          : isCurrent
                          ? 'border-amber-300 dark:border-amber-600/60 ring-1 ring-amber-200/60 dark:ring-amber-500/20'
                          : 'border-slate-200/80 dark:border-[#2E2A44]'
                      }`}
                    >
                      {/* Left: Category Icon Badge + Title & Meta */}
                      <div 
                        onClick={() => onContinueSession(task)}
                        className="flex items-start gap-3 min-w-0 flex-1 cursor-pointer group/task"
                        role="button"
                        tabIndex={0}
                        aria-label={`Start task: ${task.title}`}
                      >
                        {/* Task Rank / Category Icon Badge */}
                        <div 
                          className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 transition-transform group-hover/task:scale-105 shadow-sm"
                          style={{ backgroundColor: theme.badgeBg, color: theme.badgeText }}
                        >
                          {getTaskIcon(task.type)}
                        </div>

                        {/* Title & Meta Row */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span className="text-[10px] font-mono font-semibold text-slate-400 dark:text-slate-500">
                              #{idx + 1}
                            </span>
                            <span 
                              className="px-1.5 py-0.2 rounded text-[9px] font-semibold tracking-tight"
                              style={{ 
                                backgroundColor: theme.badgeBg, 
                                color: theme.badgeText,
                              }}
                            >
                              {theme.name}
                            </span>
                          </div>

                          <h4 className={`text-xs font-bold line-clamp-2 leading-snug group-hover/task:text-amber-600 dark:group-hover/task:text-amber-400 transition-colors ${
                            isDone ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-900 dark:text-slate-100'
                          }`}>
                            {task.title}
                          </h4>

                          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                            <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium flex items-center gap-1 font-mono">
                              <Clock className="w-3 h-3 text-slate-400" />
                              {task.durationMinutes}m
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Circular Progress Ring / Check Toggle */}
                      <div className="flex-shrink-0 pl-1">
                        <button
                          type="button"
                          onClick={() => onToggleTask(task.id)}
                          aria-label={`Mark "${task.title}" as ${isDone ? 'incomplete' : 'completed'}`}
                          className="cursor-pointer hover:scale-105 transition-transform"
                        >
                          <CircularProgressRing
                            progress={isDone ? 100 : task.progressPercent || 0}
                            color={isCurrent ? '#F59E0B' : theme.accent}
                            bgColor={theme.badgeBg}
                            size={32}
                          />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Mobile/Tablet AI Tip */}
          <div className="lg:hidden">
            <div className="p-4 rounded-2xl bg-white dark:bg-[#1C1929] border border-slate-200/90 dark:border-[#2E2A44] shadow-sm flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 flex items-center justify-center shrink-0 shadow-sm">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                  AI High-Yield Insight
                </span>
                <p className="text-xs text-slate-700 dark:text-slate-300 mt-0.5 leading-relaxed">
                  {hasEnoughHistory && activeFocusTopic
                    ? `Focus on ${activeFocusTopic} in your next study block to solidify exam retention.`
                    : 'Complete a few study or practice sessions and AI will highlight what to focus on.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            RIGHT COLUMN (lg:col-span-4) : Desktop Quick Widgets Stack (≥1024px)
            ========================================================================= */}
        <div className="hidden lg:flex flex-col gap-5 lg:col-span-4 sticky top-20">
          {/* Widget 1: Exam Countdown & Weekly Schedule */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#1C1929] border border-slate-200/90 dark:border-[#2E2A44] shadow-sm space-y-4 hover:border-slate-300 dark:hover:border-[#3B3759] transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-[#2E2A44] text-slate-700 dark:text-slate-300 flex items-center justify-center">
                  <Calendar className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white font-heading">
                  Exam Readiness
                </h4>
              </div>
              <div className="flex items-center gap-1.5">
                {totalAgenda > 0 ? (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full font-mono ${
                    dailyProgressPercent >= 75
                      ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                      : dailyProgressPercent >= 35
                      ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                      : 'bg-slate-100 dark:bg-[#2E2A44] text-slate-700 dark:text-slate-300'
                  }`}>
                    {dailyProgressPercent >= 75 ? 'Ready' : `${dailyProgressPercent}%`}
                  </span>
                ) : (
                  <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 dark:bg-[#2E2A44] px-2 py-0.5 rounded-full">
                    —
                  </span>
                )}
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-[#2E2A44] px-2.5 py-0.5 rounded-full font-mono">
                  {daysLeft !== null && daysLeft >= 0 ? `${daysLeft}d left` : '—'}
                </span>
              </div>
            </div>

            {totalAgenda === 0 && (
              <p className="text-[11px] text-slate-400 dark:text-slate-500 italic">
                Add topics to calculate readiness
              </p>
            )}

            {/* Weekly Activity Matrix */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                <span>Weekly Schedule</span>
                <span className="text-slate-900 dark:text-white font-bold font-mono">{course.studiedHoursThisWeek || 0} / {course.targetHoursPerWeek || 15}h</span>
              </div>
              <div className="grid grid-cols-7 gap-1.5 pt-1">
                {(course.weeklyActivity && course.weeklyActivity.length === 7
                  ? course.weeklyActivity
                  : [
                      { day: 'M', studied: false, hours: 0 },
                      { day: 'T', studied: false, hours: 0 },
                      { day: 'W', studied: false, hours: 0 },
                      { day: 'T', studied: false, hours: 0 },
                      { day: 'F', studied: false, hours: 0 },
                      { day: 'S', studied: false, hours: 0 },
                      { day: 'S', studied: false, hours: 0 },
                    ]
                ).map((d, i) => (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <div className={`w-full h-8 rounded-xl flex items-center justify-center text-[10px] font-bold transition-all ${
                      d.studied 
                        ? 'bg-slate-900 dark:bg-[#2E2A44] text-amber-400 shadow-sm' 
                        : 'bg-slate-50 dark:bg-[#13111C] text-slate-400 dark:text-slate-500 border border-slate-200/60 dark:border-[#2E2A44]'
                    }`}>
                      {d.studied ? '✓' : ''}
                    </div>
                    <span className="text-[9px] font-semibold text-slate-400 dark:text-slate-500">
                      {d.day.slice(0, 1)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Widget 2: Subject Breakdown Donut Widget */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#1C1929] border border-slate-200/90 dark:border-[#2E2A44] shadow-sm space-y-3 hover:border-slate-300 dark:hover:border-[#3B3759] transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-teal-100 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white font-heading">
                  Study Breakdown
                </h4>
              </div>
              <span className="text-[11px] font-bold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/50 px-2.5 py-0.5 rounded-full font-mono">
                {totalCategoryHours > 0 ? `${totalCategoryHours}h Total` : '0h Total'}
              </span>
            </div>

            {totalCategoryHours === 0 ? (
              <div className="p-4 text-center rounded-xl bg-slate-50 dark:bg-[#13111C] border border-slate-100 dark:border-[#2E2A44] text-slate-500 dark:text-slate-400 space-y-1">
                <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">No study time logged yet</div>
                <div className="text-[10px] text-slate-400 dark:text-slate-500">Complete tasks or timer sessions to see category distribution.</div>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <div className="w-24 h-24 shrink-0 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        innerRadius={28}
                        outerRadius={44}
                        paddingAngle={3}
                        dataKey="hours"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-1.5 flex-1 min-w-0">
                  {categoryData.map((c) => (
                    <div key={c.name} className="flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
                        <span className="text-slate-600 dark:text-slate-300 font-medium truncate">{c.name}</span>
                      </div>
                      <span className="font-bold text-slate-900 dark:text-white font-mono">{c.hours}h</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Widget 3: AI Study Tip Card */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#1C1929] border border-slate-200/90 dark:border-[#2E2A44] shadow-sm space-y-2 hover:border-slate-300 dark:hover:border-[#3B3759] transition-all">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 flex items-center justify-center shadow-sm">
                <Sparkles className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white font-heading">
                AI High-Yield Insight
              </h4>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {hasEnoughHistory && activeFocusTopic
                ? `Based on your course progress, focus on ${activeFocusTopic}. Solidifying this topic will boost your exam confidence.`
                : 'Complete a few study or practice sessions and AI will highlight what to focus on.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeTab;
