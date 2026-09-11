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
  userProfile,
  onContinueSession,
  onToggleTask,
  onOpenAllTasks,
  onOpenQuickActions,
  onOpenCreateCourse,
  onLoadSampleTemplate,
  searchFilter = '',
}) => {
  // If no course exists at all, render First-Run Onboarding Empty State
  if (!course) {
    return (
      <div className="w-full max-w-4xl mx-auto py-8 animate-fade-in font-sans space-y-6">
        <div className="p-8 sm:p-12 rounded-3xl bg-white border border-purple-100/90 shadow-card text-center space-y-5">
          <div className="w-16 h-16 rounded-3xl bg-theme-light text-theme-accent flex items-center justify-center mx-auto shadow-soft">
            <Sparkles className="w-8 h-8" />
          </div>

          <div className="max-w-md mx-auto space-y-2">
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#1E1B4B] font-heading">
              Welcome to EduFlow!
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Create your first study roadmap to begin tracking high-yield milestones, daily agenda tasks, and exam readiness.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            {onOpenCreateCourse && (
              <button
                onClick={onOpenCreateCourse}
                className="w-full sm:w-auto px-6 py-3.5 bg-theme-accent hover:opacity-90 active:scale-[0.98] text-white font-bold rounded-2xl shadow-card transition flex items-center justify-center gap-2 text-xs sm:text-sm font-heading cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Create Your Study Plan</span>
              </button>
            )}

            {onLoadSampleTemplate && (
              <button
                onClick={onLoadSampleTemplate}
                className="w-full sm:w-auto px-5 py-3.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold rounded-2xl border border-slate-200/80 transition flex items-center justify-center gap-2 text-xs font-heading cursor-pointer"
              >
                <Compass className="w-4 h-4 text-theme-accent" />
                <span>Try Sample AWS Course</span>
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

  // Fallback empty donut data if no hours logged yet
  const emptyDonutData = [{ name: 'No Data', value: 1, color: '#E2E8F0' }];

  // Dynamic AI Insight generation based on actual user data
  const hasEnoughHistory = completedCount >= 2 || course.studiedHoursThisWeek > 0;
  const activeFocusTopic = inProgressPhase?.topicsCovered?.[0] || inProgressPhase?.title || currentTask?.title;

  return (
    <div className="w-full max-w-7xl mx-auto animate-fade-in pb-12 font-sans">
      {/* Responsive Grid Shell: 1 Column on Mobile/Tablet, 2 Columns (8 + 4) on Desktop ≥1024px */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* =========================================================================
            MAIN COLUMN (lg:col-span-8) : Hero Focus Card + 2-Col Today's Plan
            ========================================================================= */}
        <div className="lg:col-span-8 space-y-6">
          {/* 1. HERO FOCUS CARD */}
          <section 
            className="relative overflow-hidden rounded-3xl bg-white border border-purple-100/90 shadow-card p-5 sm:p-7 transition-all duration-200 hover:shadow-card-hover"
            aria-labelledby="hero-focus-heading"
          >
            {/* Top Meta Line: Phase Badge + Streak */}
            <div className="flex items-center justify-between gap-2 mb-3 sm:mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-theme-light text-theme-dark font-bold text-[11px] font-heading">
                <span className="w-2 h-2 rounded-full bg-theme-accent animate-pulse" />
                {inProgressPhase ? `Phase ${inProgressPhase.phaseNumber} · ${inProgressPhase.title}` : 'Getting Started'}
              </span>

              <span className="inline-flex items-center gap-1 text-xs font-bold text-[#B45309] bg-[#FEF3C7] px-2.5 py-1 rounded-full font-mono">
                <Flame className="w-3.5 h-3.5 text-[#F59E0B]" />
                {course.streakDays > 0 ? `${course.streakDays}d Streak` : '0d Streak'}
              </span>
            </div>

            {/* Focus Item Title */}
            <div className="space-y-1 sm:space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 font-heading">
                Up Next for You
              </span>
              <h2 id="hero-focus-heading" className="text-lg sm:text-2xl font-extrabold text-[#1E1B4B] font-heading tracking-tight leading-snug">
                {currentTask ? currentTask.title : 'No tasks scheduled yet'}
              </h2>
            </div>

            {/* Progress Bar & Status Line */}
            <div className="mt-4 pt-3 border-t border-purple-50 space-y-2">
              <div className="flex items-center justify-between text-xs text-zinc-500 font-sans">
                <span>
                  <strong className="text-[#1E1B4B] font-bold">{completedCount} of {totalAgenda} sessions</strong> completed today
                </span>
                <span className="font-bold text-theme-dark font-mono">
                  {dailyProgressPercent}%
                </span>
              </div>

              <div className="h-2.5 w-full rounded-full bg-purple-50 overflow-hidden">
                <div 
                  className="h-full rounded-full bg-theme-accent transition-all duration-500"
                  style={{ width: `${dailyProgressPercent}%` }}
                />
              </div>
            </div>

            {/* Action Mini-Cards Grid on Larger Screens */}
            {inProgressPhase && (inProgressPhase.nextVideo || inProgressPhase.upcomingLab) && (
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {inProgressPhase.nextVideo && (
                  <div className="p-3 rounded-2xl bg-purple-50/50 border border-purple-100/60 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-xl bg-theme-light text-theme-accent flex items-center justify-center shrink-0">
                        <Video className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-theme-accent block">
                          Next Video
                        </span>
                        <span className="text-xs font-bold text-slate-800 truncate block">
                          {inProgressPhase.nextVideo.title}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold text-zinc-400 shrink-0">
                      {inProgressPhase.nextVideo.duration}
                    </span>
                  </div>
                )}

                {inProgressPhase.upcomingLab && (
                  <div className="p-3 rounded-2xl bg-amber-50/40 border border-amber-100/60 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                        <Terminal className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-amber-600 block">
                          Upcoming Lab
                        </span>
                        <span className="text-xs font-bold text-slate-800 truncate block">
                          {inProgressPhase.upcomingLab.title}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold text-zinc-400 shrink-0">
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
                  className="w-full py-3.5 px-6 rounded-2xl bg-theme-accent hover:opacity-90 active:scale-[0.99] text-white font-bold text-xs sm:text-sm font-heading shadow-card transition-all flex items-center justify-center gap-2 group cursor-pointer"
                  aria-label="Continue current study session"
                >
                  <Play className="w-4 h-4 fill-white group-hover:translate-x-0.5 transition-transform" />
                  <span>Continue Session</span>
                  <ArrowRight className="w-4 h-4 opacity-70 group-hover:translate-x-1 transition-transform" />
                </button>
              ) : (
                <button
                  onClick={onOpenQuickActions}
                  className="w-full py-3.5 px-6 rounded-2xl bg-theme-accent hover:opacity-90 active:scale-[0.99] text-white font-bold text-xs sm:text-sm font-heading shadow-card transition-all flex items-center justify-center gap-2 cursor-pointer"
                  aria-label="Schedule your first task"
                >
                  <PlusCircle className="w-4 h-4" />
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
                <h3 id="todays-plan-heading" className="text-base sm:text-lg font-bold text-[#1E1B4B] font-heading">
                  Today's Plan
                </h3>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-theme-light text-theme-dark font-mono">
                  {completedCount}/{totalAgenda}
                </span>
              </div>

              <button
                onClick={onOpenAllTasks}
                className="text-xs font-bold text-theme-accent hover:opacity-80 flex items-center gap-1 transition cursor-pointer"
              >
                <span>Curriculum</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Task Rows or Genuine Empty State */}
            {filteredAgenda.length === 0 ? (
              <div className="p-8 text-center rounded-3xl bg-white border border-purple-100/90 shadow-card space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800 font-heading">Nothing scheduled for today</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Add study topics, video lessons, or hands-on practice to your daily focus list.
                  </p>
                </div>
                {onOpenQuickActions && (
                  <button
                    onClick={onOpenQuickActions}
                    className="px-4 py-2 bg-theme-light text-theme-dark font-bold text-xs rounded-xl hover:bg-theme-subtle transition"
                  >
                    + Add Study Task
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredAgenda.map((task) => {
                  const isDone = task.status === 'completed';
                  const isCurrent = task.status === 'current';
                  const theme = getCategoryTheme(task.type);

                  return (
                    <div
                      key={task.id}
                      className={`p-3.5 sm:p-4 rounded-3xl bg-white border transition-all duration-200 flex items-center justify-between gap-3 shadow-card hover:-translate-y-0.5 hover:shadow-card-hover ${
                        isDone 
                          ? 'border-purple-50 opacity-85' 
                          : isCurrent
                          ? 'border-purple-200 ring-1 ring-purple-100'
                          : 'border-purple-100/70'
                      }`}
                    >
                      {/* Left: Category Icon Badge + Title & Meta */}
                      <div 
                        onClick={() => onContinueSession(task)}
                        className="flex items-start gap-3 min-w-0 flex-1 cursor-pointer"
                        role="button"
                        tabIndex={0}
                        aria-label={`Start task: ${task.title}`}
                      >
                        {/* Category Icon Badge */}
                        <div 
                          className="w-8 h-8 rounded-2xl flex items-center justify-center flex-shrink-0 mt-0.5 transition-transform group-hover:scale-105"
                          style={{ backgroundColor: theme.badgeBg, color: theme.badgeText }}
                        >
                          {getTaskIcon(task.type)}
                        </div>

                        {/* Title & Meta Row */}
                        <div className="min-w-0 flex-1">
                          <h4 className={`text-xs font-bold line-clamp-2 font-heading leading-snug ${
                            isDone ? 'line-through text-zinc-400' : 'text-[#1E1B4B]'
                          }`}>
                            {task.title}
                          </h4>

                          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                            <span 
                              className="px-2 py-0.2 rounded-md text-[10px] font-bold tracking-tight font-heading"
                              style={{ 
                                backgroundColor: theme.badgeBg, 
                                color: theme.badgeText,
                              }}
                            >
                              {theme.name}
                            </span>

                            <span className="text-[11px] text-zinc-400 font-medium flex items-center gap-1">
                              <Clock className="w-3 h-3" />
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
                            color={theme.accent}
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
            <div className="p-4 rounded-3xl bg-theme-light border border-theme-border shadow-card flex items-start gap-3">
              <div className="w-8 h-8 rounded-2xl bg-theme-accent text-white flex items-center justify-center shrink-0 shadow-soft">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-theme-dark font-heading block">
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
          <div className="p-5 rounded-3xl bg-white border border-purple-100/90 shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-theme-light text-theme-accent flex items-center justify-center">
                  <Calendar className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-[#1E1B4B] font-heading">
                  Exam Readiness
                </h4>
              </div>
              <span className="text-xs font-bold text-theme-dark bg-theme-light px-2.5 py-0.5 rounded-full">
                {daysLeft !== null && daysLeft >= 0 ? `${daysLeft} days left` : '—'}
              </span>
            </div>

            {/* Weekly Activity Matrix */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px] text-zinc-500 font-semibold">
                <span>Weekly Schedule</span>
                <span className="text-theme-dark font-bold">{course.studiedHoursThisWeek || 0} / {course.targetHoursPerWeek || 15}h</span>
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
                        ? 'bg-theme-accent text-white shadow-soft' 
                        : 'bg-purple-50/80 text-zinc-400 border border-purple-100/50'
                    }`}>
                      {d.studied ? '✓' : ''}
                    </div>
                    <span className="text-[9px] font-semibold text-zinc-400">
                      {d.day.slice(0, 1)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Widget 2: Subject Breakdown Donut Widget */}
          <div className="p-5 rounded-3xl bg-white border border-purple-100/90 shadow-card space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-[#1E1B4B] font-heading">
                  Study Breakdown
                </h4>
              </div>
              <span className="text-[11px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full">
                {totalCategoryHours > 0 ? `${totalCategoryHours}h Total` : '0h Total'}
              </span>
            </div>

            {totalCategoryHours === 0 ? (
              <div className="p-4 text-center rounded-2xl bg-slate-50 border border-slate-100 text-slate-500 space-y-1">
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
                      <span className="font-bold text-slate-800">{c.hours}h</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Widget 3: AI Study Tip Card */}
          <div className="p-5 rounded-3xl bg-theme-light border border-theme-border shadow-card space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-theme-accent text-white flex items-center justify-center shadow-soft">
                <Sparkles className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-theme-dark font-heading">
                AI High-Yield Insight
              </h4>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
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
