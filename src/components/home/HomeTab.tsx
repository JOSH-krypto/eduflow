import React from 'react';
import { 
  Play, 
  Sparkles, 
  ArrowRight, 
  Clock, 
  Flame, 
  Video, 
  Terminal, 
  BookOpen, 
  HelpCircle,
  Calendar,
  TrendingUp,
  PlusCircle,
  Compass
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Course, UserProfile, AgendaTask, TaskType, getCategoryTheme } from '../../types/eduflow';
import { CircularProgressRing } from '../common/CircularProgressRing';
import { getDaysUntilExam } from '../../utils/dateUtils';

import { KaggleBenchmarksSection } from '../benchmarks/KaggleBenchmarksSection';

interface HomeTabProps {
  course?: Course | null;
  userProfile?: UserProfile;
  onContinueSession: (task: AgendaTask) => void;
  onToggleTask: (taskId: string) => void;
  onOpenAllTasks: () => void;
  onOpenQuickActions?: () => void;
  onOpenCreateCourse?: () => void;
  onLoadSampleTemplate?: () => void;
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
  searchFilter = '',
}) => {
  // If no course exists at all, render Kaggle Benchmarks Showcase + First-Run Onboarding
  if (!course) {
    return (
      <div className="w-full max-w-7xl mx-auto py-4 animate-fade-in font-sans space-y-8">
        {/* Kaggle Benchmark Showcase Section */}
        <KaggleBenchmarksSection
          course={null}
          onSelectBenchmarkAction={() => onLoadSampleTemplate && onLoadSampleTemplate()}
          onOpenCurriculum={onOpenAllTasks}
        />

        {/* Onboarding Action Card */}
        <div className="p-8 sm:p-10 rounded-2xl bg-white border border-slate-200/90 shadow-sm text-center space-y-4 max-w-3xl mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-slate-900 text-amber-400 flex items-center justify-center mx-auto shadow-sm">
            <Sparkles className="w-7 h-7" />
          </div>

          <div className="max-w-md mx-auto space-y-1.5">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Welcome to Your Exam Prep Command Center
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Track high-yield certification domains, sequential milestone phases, and AI research grounding benchmarks.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            {onOpenCreateCourse && (
              <button
                onClick={onOpenCreateCourse}
                className="w-full sm:w-auto px-6 py-3 bg-slate-900 hover:bg-slate-800 active:scale-95 text-white font-semibold rounded-full shadow-sm transition flex items-center justify-center gap-2 text-xs sm:text-sm cursor-pointer"
              >
                <PlusCircle className="w-4 h-4 text-amber-400" />
                <span>Create your first study plan</span>
              </button>
            )}

            {onLoadSampleTemplate && (
              <button
                onClick={onLoadSampleTemplate}
                className="w-full sm:w-auto px-5 py-3 bg-white hover:bg-slate-50 active:scale-95 text-slate-700 font-semibold rounded-full border border-slate-200/90 transition flex items-center justify-center gap-2 text-xs cursor-pointer"
                title="Loads an optional AWS Architecture course that you can delete anytime in one click"
              >
                <Compass className="w-4 h-4 text-slate-500" />
                <span>Try a sample course (optional demo)</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Find current active task & phase
  const currentTask = course.agenda?.find((t) => t.status === 'current') || course.agenda?.[0];
  const inProgressPhase = course.phases?.find((p) => p.status === 'in_progress') || course.phases?.[0];

  const completedCount = course.agenda?.filter((t) => t.status === 'completed').length || 0;
  const totalAgenda = course.agenda?.length || 0;
  const dailyProgressPercent = totalAgenda > 0 ? Math.round((completedCount / totalAgenda) * 100) : 0;
  const daysLeft = course.examDate ? getDaysUntilExam(course.examDate) : null;

  // Filter tasks if search query provided
  const filteredAgenda = searchFilter
    ? (course.agenda || []).filter(
        (t) =>
          t.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
          t.type.toLowerCase().includes(searchFilter.toLowerCase())
      )
    : course.agenda || [];

  const getTaskIcon = (type: TaskType) => {
    switch (type) {
      case 'video':
        return <Video className="w-3.5 h-3.5" />;
      case 'lab':
        return <Terminal className="w-3.5 h-3.5" />;
      case 'reading':
        return <BookOpen className="w-3.5 h-3.5" />;
      case 'quiz':
      case 'practice':
        return <HelpCircle className="w-3.5 h-3.5" />;
      default:
        return <Play className="w-3.5 h-3.5" />;
    }
  };

  // Compute Category Breakdown dynamically from actual user tasks
  const categoryHoursMap: Record<string, { name: string; hours: number; color: string }> = {
    video: { name: 'Study & Lecture', hours: 0, color: '#7C3AED' },
    reading: { name: 'Review & Notes', hours: 0, color: '#0F766E' },
    quiz: { name: 'Practice & Quizzes', hours: 0, color: '#047857' },
    lab: { name: 'Hands-on Labs', hours: 0, color: '#C2410C' },
  };

  (course.agenda || []).forEach((t) => {
    const key = t.type === 'practice' ? 'quiz' : t.type in categoryHoursMap ? t.type : 'video';
    const hrs = (t.durationMinutes || 30) / 60;
    categoryHoursMap[key].hours = Math.round((categoryHoursMap[key].hours + hrs) * 10) / 10;
  });

  const categoryData = Object.values(categoryHoursMap).filter((c) => c.hours > 0);
  const totalCategoryHours = categoryData.reduce((acc, c) => acc + c.hours, 0);

  // Dynamic AI Insight generation based on actual user data
  const hasEnoughHistory = completedCount >= 2 || course.studiedHoursThisWeek > 0;
  const activeFocusTopic = inProgressPhase?.topicsCovered?.[0] || inProgressPhase?.title || currentTask?.title;

  return (
    <div className="w-full max-w-7xl mx-auto animate-fade-in pb-12 font-sans space-y-8">
      {/* =========================================================================
          KAGGLE BENCHMARKS SHOWCASE SECTION (Matching Screenshot)
          ========================================================================= */}
      <KaggleBenchmarksSection
        course={course}
        onOpenCurriculum={onOpenAllTasks}
        onSelectBenchmarkAction={onOpenAllTasks}
      />

      {/* Divider */}
      <div className="border-t border-slate-200/80" />

      {/* Section Header: Active Course Command Center */}
      <div className="flex items-center justify-between px-1 -mb-2">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Active Study Pathway
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {course.title}
          </h2>
        </div>

        <button
          onClick={onOpenAllTasks}
          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-slate-200/90 bg-white hover:bg-slate-50 active:scale-95 text-xs font-semibold text-slate-700 shadow-sm transition cursor-pointer"
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
          {/* 1. HERO FOCUS CARD (Kaggle Benchmark Card Aesthetic) */}
          <section 
            className="relative overflow-hidden rounded-2xl bg-white border border-slate-200/90 shadow-sm p-5 sm:p-7 transition-all duration-300 hover:shadow-md hover:border-slate-300"
            aria-labelledby="hero-focus-heading"
          >
            {/* Top Meta Line: Phase Badge + Streak */}
            <div className="flex items-center justify-between gap-2 mb-3 sm:mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-800 font-semibold text-xs">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                {inProgressPhase ? `Phase ${inProgressPhase.phaseNumber} · ${inProgressPhase.title}` : 'Getting Started'}
              </span>

              <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200/60 px-3 py-1 rounded-full font-mono">
                <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                {course.streakDays > 0 ? `${course.streakDays}d Streak` : '0d Streak'}
              </span>
            </div>

            {/* Focus Item Title */}
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Up Next for You
              </span>
              <h3 id="hero-focus-heading" className="text-lg sm:text-2xl font-bold text-slate-900 tracking-tight leading-snug">
                {currentTask ? currentTask.title : 'No tasks scheduled yet'}
              </h3>
            </div>

            {/* Progress Bar & Status Line: Standout Amber Bar matching Kaggle Benchmark #1 */}
            <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500 font-sans">
                <span>
                  <strong className="text-slate-900 font-semibold">{completedCount} of {totalAgenda} sessions</strong> completed today
                </span>
                <span className="font-bold text-slate-900 font-mono">
                  {dailyProgressPercent}%
                </span>
              </div>

              <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
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
                  <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/60 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-slate-700 flex items-center justify-center shrink-0">
                        <Video className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 block">
                          Next Video
                        </span>
                        <span className="text-xs font-semibold text-slate-800 truncate block">
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
                  <div className="p-3 rounded-xl bg-amber-50/30 border border-amber-200/50 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                        <Terminal className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-amber-700 block">
                          Upcoming Lab
                        </span>
                        <span className="text-xs font-semibold text-slate-800 truncate block">
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

            {/* Main Action Button (Kaggle Pill Button) */}
            <div className="mt-5">
              {currentTask ? (
                <button
                  onClick={() => onContinueSession(currentTask)}
                  className="w-full py-3 px-6 rounded-full bg-slate-900 hover:bg-slate-800 active:scale-[0.99] text-white font-semibold text-xs sm:text-sm shadow-sm transition-all flex items-center justify-center gap-2 group cursor-pointer"
                  aria-label="Continue current study session"
                >
                  <Play className="w-4 h-4 fill-amber-400 text-amber-400 group-hover:translate-x-0.5 transition-transform" />
                  <span>Continue Session</span>
                  <ArrowRight className="w-4 h-4 opacity-70 group-hover:translate-x-1 transition-transform" />
                </button>
              ) : (
                <button
                  onClick={onOpenQuickActions}
                  className="w-full py-3 px-6 rounded-full bg-slate-900 hover:bg-slate-800 active:scale-[0.99] text-white font-semibold text-xs sm:text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
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
                <h3 id="todays-plan-heading" className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                  Today's Plan
                </h3>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-800 font-mono">
                  {completedCount}/{totalAgenda}
                </span>
              </div>

              <button
                onClick={onOpenAllTasks}
                className="text-xs font-semibold text-slate-500 hover:text-slate-900 flex items-center gap-1 transition cursor-pointer"
              >
                <span>Curriculum</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Task Rows or Genuine Empty State */}
            {filteredAgenda.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Nothing scheduled for today</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Add study topics, video lessons, or hands-on practice to your daily focus list.
                  </p>
                </div>
                {onOpenQuickActions && (
                  <button
                    onClick={onOpenQuickActions}
                    className="px-4 py-2 bg-slate-900 text-white font-semibold text-xs rounded-full hover:bg-slate-800 transition cursor-pointer"
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
                      className={`p-3.5 sm:p-4 rounded-2xl bg-white border transition-all duration-200 flex items-center justify-between gap-3 shadow-sm hover:-translate-y-0.5 hover:shadow-md hover:border-slate-300 ${
                        isDone 
                          ? 'border-slate-100 opacity-75' 
                          : isCurrent
                          ? 'border-amber-300 ring-1 ring-amber-200/60'
                          : 'border-slate-200/80'
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
                            <span className="text-[10px] font-mono font-semibold text-slate-400">
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

                          <h4 className={`text-xs font-bold line-clamp-2 leading-snug group-hover/task:text-amber-600 transition-colors ${
                            isDone ? 'line-through text-slate-400' : 'text-slate-900'
                          }`}>
                            {task.title}
                          </h4>

                          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                            <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1 font-mono">
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
            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 shadow-sm">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                  AI High-Yield Insight
                </span>
                <p className="text-xs text-slate-700 mt-0.5 leading-relaxed">
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
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-4 hover:border-slate-300 transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
                  <Calendar className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-slate-900">
                  Exam Readiness
                </h4>
              </div>
              <div className="flex items-center gap-1.5">
                {totalAgenda > 0 ? (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full font-mono ${
                    dailyProgressPercent >= 75
                      ? 'bg-emerald-100 text-emerald-800'
                      : dailyProgressPercent >= 35
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-slate-100 text-slate-700'
                  }`}>
                    {dailyProgressPercent >= 75 ? 'Ready' : `${dailyProgressPercent}%`}
                  </span>
                ) : (
                  <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                    —
                  </span>
                )}
                <span className="text-xs font-semibold text-slate-800 bg-slate-100 px-2.5 py-0.5 rounded-full font-mono">
                  {daysLeft !== null && daysLeft >= 0 ? `${daysLeft}d left` : '—'}
                </span>
              </div>
            </div>

            {totalAgenda === 0 && (
              <p className="text-[11px] text-slate-400 italic">
                Add topics to calculate readiness
              </p>
            )}

            {/* Weekly Activity Matrix */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px] text-slate-500 font-semibold">
                <span>Weekly Schedule</span>
                <span className="text-slate-900 font-bold font-mono">{course.studiedHoursThisWeek || 0} / {course.targetHoursPerWeek || 15}h</span>
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
                        ? 'bg-slate-900 text-amber-400 shadow-sm' 
                        : 'bg-slate-50 text-slate-400 border border-slate-200/60'
                    }`}>
                      {d.studied ? '✓' : ''}
                    </div>
                    <span className="text-[9px] font-semibold text-slate-400">
                      {d.day.slice(0, 1)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Widget 2: Subject Breakdown Donut Widget */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-3 hover:border-slate-300 transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-slate-900">
                  Study Breakdown
                </h4>
              </div>
              <span className="text-[11px] font-bold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full font-mono">
                {totalCategoryHours > 0 ? `${totalCategoryHours}h Total` : '0h Total'}
              </span>
            </div>

            {totalCategoryHours === 0 ? (
              <div className="p-4 text-center rounded-xl bg-slate-50 border border-slate-100 text-slate-500 space-y-1">
                <div className="text-xs font-semibold">No study time logged yet</div>
                <div className="text-[10px] text-slate-400">Complete tasks or timer sessions to see category distribution.</div>
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
                        <span className="text-slate-600 font-medium truncate">{c.name}</span>
                      </div>
                      <span className="font-bold text-slate-900 font-mono">{c.hours}h</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Widget 3: AI Study Tip Card */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-2 hover:border-slate-300 transition-all">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shadow-sm">
                <Sparkles className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-slate-900">
                AI High-Yield Insight
              </h4>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
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
