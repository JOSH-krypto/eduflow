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
  TrendingUp
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Course, UserProfile, AgendaTask, TaskType, getCategoryTheme } from '../../types/eduflow';
import { CircularProgressRing } from '../common/CircularProgressRing';
import { getDaysUntilExam } from '../../utils/dateUtils';

interface HomeTabProps {
  course: Course;
  userProfile?: UserProfile;
  onContinueSession: (task: AgendaTask) => void;
  onToggleTask: (taskId: string) => void;
  onOpenAllTasks: () => void;
  onOpenQuickActions?: () => void;
  searchFilter?: string;
}

export const HomeTab: React.FC<HomeTabProps> = ({
  course,
  onContinueSession,
  onToggleTask,
  onOpenAllTasks,
  searchFilter = '',
}) => {
  // Find current active task
  const currentTask = course.agenda.find((t) => t.status === 'current') || course.agenda[0];
  const inProgressPhase = course.phases.find((p) => p.status === 'in_progress') || course.phases[0];

  const completedCount = course.agenda.filter((t) => t.status === 'completed').length;
  const totalAgenda = course.agenda.length || 1;
  const dailyProgressPercent = Math.round((completedCount / totalAgenda) * 100);
  const daysLeft = getDaysUntilExam(course.examDate);

  // Filter tasks if search query provided
  const filteredAgenda = searchFilter
    ? course.agenda.filter(
        (t) =>
          t.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
          t.type.toLowerCase().includes(searchFilter.toLowerCase())
      )
    : course.agenda;

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

  // Mini Category Donut Data for Desktop Widget
  const categoryData = [
    { name: 'Study', value: 22.5, color: '#8B5CF6' },
    { name: 'Review', value: 12.0, color: '#0D9488' },
    { name: 'Practice', value: 8.5, color: '#10B981' },
    { name: 'Lab', value: 15.5, color: '#F59E0B' },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto animate-fade-in pb-12 font-sans">
      {/* Responsive Grid Shell: 1 Column on Mobile/Tablet, 2 Columns (8 + 4) on Desktop ≥1024px */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* =========================================================================
            MAIN COLUMN (lg:col-span-8) : Hero Focus Card + 2-Col Today's Plan
            ========================================================================= */}
        <div className="lg:col-span-8 space-y-6">
          {/* 1. HERO FOCUS CARD (Dominant Visual Weight) */}
          <section 
            className="relative overflow-hidden rounded-3xl bg-white border border-purple-100/90 shadow-card p-5 sm:p-7 transition-all duration-200 hover:shadow-card-hover"
            aria-labelledby="hero-focus-heading"
          >
            {/* Top Meta Line: Phase Badge + Streak */}
            <div className="flex items-center justify-between gap-2 mb-3 sm:mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F3E8FF] text-[#6D28D9] font-bold text-[11px] font-heading">
                <span className="w-2 h-2 rounded-full bg-[#8B5CF6] animate-pulse" />
                Phase {inProgressPhase?.phaseNumber || 2} · In Progress
              </span>

              <span className="inline-flex items-center gap-1 text-xs font-bold text-[#B45309] bg-[#FEF3C7] px-2.5 py-1 rounded-full font-mono">
                <Flame className="w-3.5 h-3.5 text-[#F59E0B]" />
                {course.streakDays}d Streak
              </span>
            </div>

            {/* Focus Item Title */}
            <div className="space-y-1 sm:space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 font-heading">
                Up Next for You
              </span>
              <h2 id="hero-focus-heading" className="text-lg sm:text-2xl font-extrabold text-[#1E1B4B] font-heading tracking-tight leading-snug">
                {currentTask ? currentTask.title : 'VPC Peering & Transit Gateway Deep Dive'}
              </h2>
            </div>

            {/* Progress Bar & Status Line */}
            <div className="mt-4 pt-3 border-t border-purple-50 space-y-2">
              <div className="flex items-center justify-between text-xs text-zinc-500 font-sans">
                <span>
                  <strong className="text-[#1E1B4B] font-bold">{completedCount} of {totalAgenda} sessions</strong> completed today
                </span>
                <span className="font-bold text-[#6D28D9] font-mono">
                  {dailyProgressPercent}%
                </span>
              </div>

              <div className="h-2.5 w-full rounded-full bg-[#F3E8FF] overflow-hidden">
                <div 
                  className="h-full rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#A78BFA] transition-all duration-500"
                  style={{ width: `${dailyProgressPercent}%` }}
                />
              </div>
            </div>

            {/* Action Mini-Cards Grid (Next Video & Upcoming Lab) on Larger Screens */}
            {inProgressPhase && (inProgressPhase.nextVideo || inProgressPhase.upcomingLab) && (
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {inProgressPhase.nextVideo && (
                  <div className="p-3 rounded-2xl bg-purple-50/50 border border-purple-100/60 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center shrink-0">
                        <Video className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-violet-600 block">
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
              <button
                onClick={() => currentTask && onContinueSession(currentTask)}
                className="w-full py-3.5 px-6 rounded-2xl bg-[#8B5CF6] hover:bg-[#7C3AED] active:scale-[0.99] text-white font-bold text-xs sm:text-sm font-heading shadow-card transition-all flex items-center justify-center gap-2 group cursor-pointer"
                aria-label="Continue current study session"
              >
                <Play className="w-4 h-4 fill-white group-hover:translate-x-0.5 transition-transform" />
                <span>Continue Session</span>
                <ArrowRight className="w-4 h-4 opacity-70 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </section>

          {/* 2. TODAY'S PLAN SECTION (Responsive 2-column grid on tablet/desktop) */}
          <section aria-labelledby="todays-plan-heading" className="space-y-3">
            {/* Header + Count Badge + See all */}
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2.5">
                <h3 id="todays-plan-heading" className="text-base sm:text-lg font-bold text-[#1E1B4B] font-heading">
                  Today's Plan
                </h3>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#EDE9FE] text-[#6D28D9] font-mono">
                  {completedCount}/{totalAgenda}
                </span>
              </div>

              <button
                onClick={onOpenAllTasks}
                className="text-xs font-bold text-[#8B5CF6] hover:text-[#6D28D9] flex items-center gap-1 transition cursor-pointer"
              >
                <span>Curriculum</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Task Rows (1 column on mobile, 2 columns on tablet & desktop) */}
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
                      {/* Pastel Category Icon Badge */}
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
                          {/* Category Badge */}
                          <span 
                            className="px-2 py-0.2 rounded-md text-[10px] font-bold tracking-tight font-heading"
                            style={{ 
                              backgroundColor: theme.badgeBg, 
                              color: theme.badgeText,
                            }}
                          >
                            {theme.name}
                          </span>

                          {/* Duration */}
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
          </section>

          {/* Mobile/Tablet Fallback for AI Tip card when right sidebar is hidden */}
          <div className="lg:hidden">
            <div className="p-4 rounded-3xl bg-gradient-to-r from-purple-50/70 to-teal-50/40 border border-purple-100/80 shadow-card flex items-start gap-3">
              <div className="w-8 h-8 rounded-2xl bg-violet-600 text-white flex items-center justify-center shrink-0 shadow-soft">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-violet-700 font-heading block">
                  AI Study Tip of the Day
                </span>
                <p className="text-xs text-slate-700 mt-0.5 leading-relaxed">
                  Focus on <strong>VPC Route Tables and Transit Gateway attachment policies</strong> today. Exam questions consistently test transitive routing boundaries.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            RIGHT COLUMN (lg:col-span-4) : Desktop Quick Widgets Stack (≥1024px)
            ========================================================================= */}
        <div className="hidden lg:flex flex-col gap-5 lg:col-span-4 sticky top-20">
          {/* Widget 1: Exam Countdown & Weekly Streak Heatmap */}
          <div className="p-5 rounded-3xl bg-white border border-purple-100/90 shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center">
                  <Calendar className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-[#1E1B4B] font-heading">
                  Exam Readiness
                </h4>
              </div>
              <span className="text-xs font-bold text-violet-700 bg-violet-50 px-2.5 py-0.5 rounded-full">
                {daysLeft} days left
              </span>
            </div>

            {/* Weekly Activity 7-day Mini Matrix */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px] text-zinc-500 font-semibold">
                <span>Weekly Schedule</span>
                <span className="text-violet-700 font-bold">{course.studiedHoursThisWeek} / {course.targetHoursPerWeek}h</span>
              </div>
              <div className="grid grid-cols-7 gap-1.5 pt-1">
                {(course.weeklyActivity || [
                  { day: 'M', studied: true, hours: 2.5 },
                  { day: 'T', studied: true, hours: 3.0 },
                  { day: 'W', studied: true, hours: 2.0 },
                  { day: 'T', studied: true, hours: 2.0 },
                  { day: 'F', studied: false, hours: 0 },
                  { day: 'S', studied: false, hours: 0 },
                  { day: 'S', studied: false, hours: 0 },
                ]).map((d, i) => (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <div className={`w-full h-8 rounded-xl flex items-center justify-center text-[10px] font-bold transition-all ${
                      d.studied 
                        ? 'bg-violet-600 text-white shadow-soft' 
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

          {/* Widget 2: Mini Subject Breakdown Donut Widget */}
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
                58.5h Total
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-24 h-24 shrink-0 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      innerRadius={28}
                      outerRadius={44}
                      paddingAngle={3}
                      dataKey="value"
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
                      <span className="text-slate-600 font-medium">{c.name}</span>
                    </div>
                    <span className="font-bold text-slate-800">{c.value}h</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Widget 3: AI Study Tip Card */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-violet-50/80 via-purple-50/40 to-teal-50/40 border border-purple-100/80 shadow-card space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-violet-600 text-white flex items-center justify-center shadow-soft">
                <Sparkles className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-violet-900 font-heading">
                AI High-Yield Insight
              </h4>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              Based on your practice questions, review <strong>KMS Key Policies & Envelope Encryption</strong>. Questions testing cross-account KMS permissions have a 78% appearance probability.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
