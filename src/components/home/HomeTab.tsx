import React from 'react';
import { 
  Play, 
  ArrowRight, 
  Clock, 
  Video, 
  Terminal, 
  FileText, 
  HelpCircle, 
  Code,
  Calendar,
  Plus
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
  // If no course exists, show news and a clear empty state
  if (!course) {
    return (
      <div className="w-full max-w-7xl mx-auto py-4 font-sans space-y-8 select-none">
        <AcademicNewsSection onOpenFullNews={onOpenFullNews} />

        <div className="p-8 sm:p-10 rounded-xl bg-white dark:bg-[#1C1929] border border-slate-200 dark:border-[#2E2A44] text-center space-y-4 max-w-2xl mx-auto">
          <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-[#2E2A44] text-slate-700 dark:text-slate-300 font-bold text-sm tracking-tight flex items-center justify-center mx-auto border border-slate-200 dark:border-[#2E2A44]">
            EF
          </div>

          <div className="max-w-md mx-auto space-y-1">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              Get started with EduFlow
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Create a course plan to track daily study tasks, review schedules, and monitor progress.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            {onOpenCreateCourse && (
              <button
                onClick={onOpenCreateCourse}
                className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-semibold transition flex items-center justify-center gap-2 cursor-pointer border border-slate-700/20 dark:border-white/20"
              >
                <Plus className="w-4 h-4" />
                <span>Create study plan</span>
              </button>
            )}

            {onLoadSampleTemplate && (
              <button
                onClick={onLoadSampleTemplate}
                className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-slate-50 dark:bg-[#13111C] hover:bg-slate-100 dark:hover:bg-[#252236] border border-slate-200 dark:border-[#2E2A44] text-slate-700 dark:text-slate-200 text-xs font-medium transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Load sample AWS course</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const inProgressPhase = course.phases.find((p) => p.status === 'in_progress') || course.phases[0];
  const agendaTasks = course.agenda || [];
  const completedCount = agendaTasks.filter((t) => t.status === 'completed').length;
  const totalAgenda = agendaTasks.length;
  const dailyProgressPercent = totalAgenda > 0 ? Math.round((completedCount / totalAgenda) * 100) : 0;
  const currentTask = agendaTasks.find((t) => t.status === 'current') || agendaTasks.find((t) => t.status !== 'completed') || agendaTasks[0];
  const daysLeft = course.examDate ? getDaysUntilExam(course.examDate) : null;

  const filteredAgenda = agendaTasks.filter((t) => {
    if (!searchFilter) return true;
    const q = searchFilter.toLowerCase();
    return t.title.toLowerCase().includes(q) || t.type.toLowerCase().includes(q);
  });

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
    { name: 'Study', hours: Math.round(categoryHoursMap.study * 10) / 10, color: '#475569' },
    { name: 'Practice and labs', hours: Math.round((categoryHoursMap.practice + categoryHoursMap.lab) * 10) / 10, color: '#0D9488' },
    { name: 'Review and quizzes', hours: Math.round(categoryHoursMap.review * 10) / 10, color: '#6366F1' },
  ].filter((c) => c.hours > 0);

  const totalCategoryHours = categoryData.reduce((acc, c) => acc + c.hours, 0);

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

  const hasEnoughHistory = completedCount >= 2 || course.studiedHoursThisWeek > 0;
  const activeFocusTopic = inProgressPhase?.topicsCovered?.[0] || inProgressPhase?.title || currentTask?.title;

  return (
    <div className="w-full max-w-7xl mx-auto pb-12 font-sans space-y-8 select-none">
      <AcademicNewsSection onOpenFullNews={onOpenFullNews} />

      <div className="border-t border-slate-200 dark:border-[#2E2A44]" />

      <div className="flex items-center justify-between px-1 -mb-2">
        <div>
          <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Active course
          </span>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            {course.title}
          </h2>
        </div>

        <button
          onClick={onOpenAllTasks}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-[#2E2A44] bg-white dark:bg-[#1C1929] hover:bg-slate-50 dark:hover:bg-[#252236] text-xs font-medium text-slate-700 dark:text-slate-200 transition cursor-pointer"
        >
          <span>Curriculum view</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Main Column */}
        <div className="lg:col-span-8 space-y-6">
          {/* Primary surface: Hero focus card */}
          <section 
            className="rounded-xl bg-white dark:bg-[#1C1929] border border-slate-200 dark:border-[#2E2A44] p-5 sm:p-6 transition-colors"
            aria-labelledby="hero-focus-heading"
          >
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                {inProgressPhase ? `Phase ${inProgressPhase.phaseNumber}: ${inProgressPhase.title}` : 'Overview'}
              </span>

              <span className="text-xs text-slate-600 dark:text-slate-400 tabular-nums">
                {course.streakDays > 0 ? `${course.streakDays}d streak` : '0d streak'}
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Up next
              </span>
              <h3 id="hero-focus-heading" className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight leading-snug">
                {currentTask ? currentTask.title : 'No tasks scheduled'}
              </h3>
            </div>

            {/* Progress bar */}
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-[#2E2A44] space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-sans tabular-nums">
                <span>
                  <strong className="text-slate-900 dark:text-white font-medium">{completedCount} of {totalAgenda} tasks</strong> completed today
                </span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {dailyProgressPercent}%
                </span>
              </div>

              <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-[#252236] overflow-hidden">
                <div 
                  className="h-full rounded-full bg-slate-900 dark:bg-slate-200 transition-all duration-300"
                  style={{ width: `${dailyProgressPercent}%` }}
                />
              </div>
            </div>

            {/* Upcoming items */}
            {inProgressPhase && (inProgressPhase.nextVideo || inProgressPhase.upcomingLab) && (
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {inProgressPhase.nextVideo && (
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#13111C] border border-slate-200 dark:border-[#2E2A44] flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-md bg-white dark:bg-[#1C1929] border border-slate-200 dark:border-[#2E2A44] text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0">
                        <Video className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                          Next video
                        </span>
                        <span className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate block">
                          {inProgressPhase.nextVideo.title}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-500 shrink-0 tabular-nums">
                      {inProgressPhase.nextVideo.duration}
                    </span>
                  </div>
                )}

                {inProgressPhase.upcomingLab && (
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#13111C] border border-slate-200 dark:border-[#2E2A44] flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-md bg-white dark:bg-[#1C1929] border border-slate-200 dark:border-[#2E2A44] text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0">
                        <Terminal className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                          Upcoming lab
                        </span>
                        <span className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate block">
                          {inProgressPhase.upcomingLab.title}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-500 shrink-0 tabular-nums">
                      {inProgressPhase.upcomingLab.duration}
                    </span>
                  </div>
                )}
              </div>
            )}

            <div className="mt-5">
              {currentTask ? (
                <button
                  onClick={() => onContinueSession(currentTask)}
                  className="w-full py-2.5 px-4 rounded-lg bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 font-medium text-xs sm:text-sm transition flex items-center justify-center gap-2 cursor-pointer border border-slate-700/20 dark:border-white/20"
                  aria-label="Continue current study session"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Continue session</span>
                </button>
              ) : (
                <button
                  onClick={onOpenQuickActions}
                  className="w-full py-2.5 px-4 rounded-lg bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 font-medium text-xs sm:text-sm transition flex items-center justify-center gap-2 cursor-pointer"
                  aria-label="Schedule your first task"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add study task</span>
                </button>
              )}
            </div>
          </section>

          {/* Today's Plan Section */}
          <section aria-labelledby="todays-plan-heading" className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <h3 id="todays-plan-heading" className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                  Today's plan
                </h3>
                <span className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                  ({completedCount}/{totalAgenda})
                </span>
              </div>

              <button
                onClick={onOpenAllTasks}
                className="text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 transition cursor-pointer"
              >
                <span>Curriculum</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {filteredAgenda.length === 0 ? (
              <div className="p-6 text-center rounded-xl bg-white dark:bg-[#1C1929] border border-slate-200 dark:border-[#2E2A44] space-y-3">
                <div className="w-8 h-8 rounded-md bg-slate-100 dark:bg-[#2E2A44] text-slate-400 flex items-center justify-center mx-auto">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-900 dark:text-white">No tasks scheduled for today</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Add study topics or practice sessions to your daily list.
                  </p>
                </div>
                {onOpenQuickActions && (
                  <button
                    onClick={onOpenQuickActions}
                    className="px-3.5 py-1.5 bg-slate-900 dark:bg-[#2E2A44] text-white font-medium text-xs rounded-lg hover:bg-slate-800 dark:hover:bg-[#3B3759] transition cursor-pointer"
                  >
                    Add study task
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
                      className={`p-3.5 rounded-xl bg-white dark:bg-[#1C1929] border transition-colors flex items-center justify-between gap-3 ${
                        isDone 
                          ? 'border-slate-100 dark:border-[#2E2A44] opacity-75' 
                          : isCurrent
                          ? 'border-slate-900 dark:border-slate-400'
                          : 'border-slate-200 dark:border-[#2E2A44]'
                      }`}
                    >
                      <div 
                        onClick={() => onContinueSession(task)}
                        className="flex items-start gap-3 min-w-0 flex-1 cursor-pointer"
                        role="button"
                        tabIndex={0}
                        aria-label={`Start task: ${task.title}`}
                      >
                        <div 
                          className="w-7 h-7 rounded-md flex items-center justify-center shrink-0 mt-0.5 text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-[#2E2A44]"
                        >
                          {getTaskIcon(task.type)}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 mb-0.5 tabular-nums">
                            <span className="text-[10px] text-slate-400 dark:text-slate-500">
                              #{idx + 1}
                            </span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400">
                              {theme.name}
                            </span>
                          </div>

                          <h4 className={`text-xs font-semibold line-clamp-2 leading-snug ${
                            isDone ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-900 dark:text-slate-100'
                          }`}>
                            {task.title}
                          </h4>

                          <div className="flex items-center gap-2 mt-1 tabular-nums">
                            <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-400" />
                              {task.durationMinutes}m
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0 pl-1">
                        <button
                          type="button"
                          onClick={() => onToggleTask(task.id)}
                          aria-label={`Mark "${task.title}" as ${isDone ? 'incomplete' : 'completed'}`}
                          className="cursor-pointer"
                        >
                          <CircularProgressRing
                            progress={isDone ? 100 : task.progressPercent || 0}
                            color={isCurrent ? '#0F172A' : '#64748B'}
                            bgColor="#F1F5F9"
                            size={28}
                          />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Mobile Topics to review */}
          <div className="lg:hidden">
            <div className="p-4 rounded-xl bg-white dark:bg-[#1C1929] border border-slate-200 dark:border-[#2E2A44] space-y-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                Topics to review
              </span>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                {hasEnoughHistory && activeFocusTopic
                  ? `Focus on ${activeFocusTopic} in your next study block to solidify exam retention.`
                  : 'Complete a few study or practice sessions to receive review suggestions.'}
              </p>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 block pt-1">
                Generated suggestion based on course activity.
              </span>
            </div>
          </div>
        </div>

        {/* Desktop Secondary Column (lg:col-span-4) */}
        <div className="hidden lg:flex flex-col gap-5 lg:col-span-4 sticky top-20">
          {/* Widget 1: Schedule and days left */}
          <div className="p-4 rounded-xl bg-white dark:bg-[#1C1929] border border-slate-200 dark:border-[#2E2A44] space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-slate-900 dark:text-white">
                Exam readiness
              </h4>
              <div className="flex items-center gap-1.5 tabular-nums text-xs text-slate-600 dark:text-slate-400">
                {totalAgenda > 0 ? (
                  <span>{dailyProgressPercent}%</span>
                ) : (
                  <span>-</span>
                )}
                <span>·</span>
                <span>{daysLeft !== null && daysLeft >= 0 ? `${daysLeft}d left` : 'No date set'}</span>
              </div>
            </div>

            {totalAgenda === 0 && (
              <p className="text-[11px] text-slate-400 dark:text-slate-500">
                Add topics to view daily readiness metrics.
              </p>
            )}

            <div className="space-y-1.5 pt-1 border-t border-slate-100 dark:border-[#2E2A44]">
              <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
                <span>Weekly schedule</span>
                <span className="text-slate-900 dark:text-white font-medium">{course.studiedHoursThisWeek || 0} / {course.targetHoursPerWeek || 15}h</span>
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
                    <div className={`w-full h-7 rounded-md flex items-center justify-center text-[10px] font-medium transition-colors ${
                      d.studied 
                        ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900' 
                        : 'bg-slate-50 dark:bg-[#13111C] text-slate-400 border border-slate-200 dark:border-[#2E2A44]'
                    }`}>
                      {d.studied ? '✓' : ''}
                    </div>
                    <span className="text-[9px] text-slate-400 dark:text-slate-500">
                      {d.day.slice(0, 1)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Widget 2: Study Breakdown */}
          <div className="p-4 rounded-xl bg-white dark:bg-[#1C1929] border border-slate-200 dark:border-[#2E2A44] space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-slate-900 dark:text-white">
                Study breakdown
              </h4>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
                {totalCategoryHours > 0 ? `${totalCategoryHours}h total` : '0h total'}
              </span>
            </div>

            {totalCategoryHours === 0 ? (
              <div className="p-3 text-center rounded-lg bg-slate-50 dark:bg-[#13111C] border border-slate-100 dark:border-[#2E2A44] text-slate-500 dark:text-slate-400 space-y-1">
                <div className="text-xs font-medium text-slate-700 dark:text-slate-300">No study time logged yet</div>
                <div className="text-[10px] text-slate-400 dark:text-slate-500">Completed tasks will populate category distribution.</div>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 shrink-0 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        innerRadius={24}
                        outerRadius={36}
                        paddingAngle={2}
                        dataKey="hours"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-1 flex-1 min-w-0 tabular-nums">
                  {categoryData.map((c) => (
                    <div key={c.name} className="flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
                        <span className="text-slate-600 dark:text-slate-300 truncate">{c.name}</span>
                      </div>
                      <span className="font-medium text-slate-900 dark:text-white">{c.hours}h</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Widget 3: Topics to review */}
          <div className="p-4 rounded-xl bg-white dark:bg-[#1C1929] border border-slate-200 dark:border-[#2E2A44] space-y-1.5">
            <h4 className="text-xs font-semibold text-slate-900 dark:text-white">
              Topics to review
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {hasEnoughHistory && activeFocusTopic
                ? `Based on your course progress, focus on ${activeFocusTopic}.`
                : 'Complete a few study sessions to receive automated topic review suggestions.'}
            </p>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 block pt-1">
              Generated summary based on course activity.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeTab;
