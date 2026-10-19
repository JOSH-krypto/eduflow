import React from 'react';
import { 
  Check, 
  Lock, 
  ArrowRight, 
  Clock, 
  Plus,
  Play
} from 'lucide-react';
import { Course, Phase, SubTopic } from '../../types/eduflow';
import { getPhaseDynamicDateRange } from '../../utils/dateUtils';

interface PlanTabProps {
  course?: Course | null;
  onOpenPhaseDetail: (phase: Phase) => void;
  onStartStudyTopic: (title: string, phase: Phase, subtopic?: SubTopic) => void;
  onOpenCreateCourse?: () => void;
}

export const PlanTab: React.FC<PlanTabProps> = ({
  course,
  onOpenPhaseDetail,
  onStartStudyTopic,
  onOpenCreateCourse,
}) => {
  if (!course) {
    return (
      <div className="w-full max-w-4xl mx-auto py-8 font-sans space-y-6">
        <div className="p-8 sm:p-10 rounded-xl bg-white dark:bg-[#1C1929] border border-slate-200 dark:border-[#2E2A44] text-center space-y-4">
          <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-[#2E2A44] text-slate-700 dark:text-slate-300 font-bold text-sm tracking-tight flex items-center justify-center mx-auto border border-slate-200 dark:border-[#2E2A44]">
            EF
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              No active study plan
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Create a study plan to generate milestone phases and topic checklists.
            </p>
          </div>
          {onOpenCreateCourse && (
            <button
              onClick={onOpenCreateCourse}
              className="px-4 py-2.5 bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 font-medium rounded-lg text-xs transition cursor-pointer border border-slate-700/20 dark:border-white/20 inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Create study plan</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  const phases = course.phases || [];

  return (
    <div className="w-full max-w-5xl mx-auto space-y-5 pb-16 font-sans select-none">
      {/* Plan Header */}
      <div className="p-5 sm:p-6 rounded-xl bg-white dark:bg-[#1C1929] border border-slate-200 dark:border-[#2E2A44]">
        <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
          Curriculum plan
        </span>
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
          {course.title} study path
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Structured progression and sequential milestones toward your target exam date.
        </p>
      </div>

      {/* Sequential Phases List */}
      {phases.length === 0 ? (
        <div className="p-8 text-center rounded-xl bg-white dark:bg-[#1C1929] border border-slate-200 dark:border-[#2E2A44] space-y-2">
          <h4 className="text-xs font-semibold text-slate-900 dark:text-white">No curriculum phases defined</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Add phases to break down your exam objectives into study weeks.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {phases.map((phase, idx) => {
            const dateRange = getPhaseDynamicDateRange(idx, phases.length, course.examDate);
            const isCompleted = phase.status === 'completed';
            const isInProgress = phase.status === 'in_progress';

            // 1. Completed Phase: Compact row
            if (isCompleted) {
              return (
                <div
                  key={phase.id}
                  onClick={() => onOpenPhaseDetail(phase)}
                  className="p-4 sm:p-5 rounded-xl bg-white dark:bg-[#1C1929] border border-slate-200 dark:border-[#2E2A44] flex items-center justify-between gap-3 cursor-pointer hover:border-slate-300 dark:hover:border-[#3B3759] transition-colors"
                  role="button"
                  tabIndex={0}
                  aria-label={`Review completed phase: ${phase.title}`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-[#2E2A44] text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0">
                      <Check className="w-4 h-4 stroke-[2.5]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400 block tabular-nums">
                        Phase {phase.phaseNumber}: Completed
                      </span>
                      <h4 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white truncate">
                        {phase.title}
                      </h4>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 tabular-nums">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{dateRange}</span>
                    </div>
                    <button className="px-3 py-1 rounded-md bg-slate-100 dark:bg-[#2E2A44] hover:bg-slate-200 dark:hover:bg-[#3B3759] text-xs font-medium text-slate-800 dark:text-slate-200 flex items-center gap-1 transition cursor-pointer">
                      <span>Review</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            }

            // 2. In-Progress Phase: Primary surface
            if (isInProgress) {
              return (
                <div
                  key={phase.id}
                  className="p-5 sm:p-6 rounded-xl bg-white dark:bg-[#1C1929] border border-slate-900 dark:border-slate-400 space-y-4"
                >
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-xs font-medium text-slate-900 dark:text-slate-100 uppercase tracking-wider tabular-nums">
                      Phase {phase.phaseNumber}: In progress
                    </span>

                    <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 tabular-nums">
                      <Clock className="w-3.5 h-3.5" />
                      {dateRange}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                      {phase.title}
                    </h3>
                    {phase.description && (
                      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                        {phase.description}
                      </p>
                    )}
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                      <span>Phase completion</span>
                      <span className="font-semibold text-slate-900 dark:text-white">{phase.progressPercent}%</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-[#252236] overflow-hidden">
                      <div 
                        className="h-full rounded-full bg-slate-900 dark:bg-slate-200 transition-all duration-300" 
                        style={{ width: `${phase.progressPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Subtopics Checklist */}
                  {phase.subtopics && phase.subtopics.length > 0 && (
                    <div className="pt-2">
                      <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-2 tabular-nums">
                        Curriculum units ({phase.subtopics.length})
                      </span>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {phase.subtopics.map((sub) => (
                          <div 
                            key={sub.id} 
                            onClick={() => onStartStudyTopic(sub.title, phase, sub)}
                            className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-[#13111C] hover:bg-slate-100 dark:hover:bg-[#252236] border border-slate-100 dark:border-[#2E2A44] rounded-lg text-xs cursor-pointer transition-colors"
                            role="button"
                            tabIndex={0}
                            title={`Start session: ${sub.title}`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <div className={`w-4 h-4 rounded flex items-center justify-center text-[10px] ${
                                sub.completed ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold' : 'border border-slate-300 dark:border-slate-600'
                              }`}>
                                {sub.completed ? '✓' : ''}
                              </div>
                              <span className={`truncate ${sub.completed ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-800 dark:text-slate-200'}`}>
                                {sub.title}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0 ml-2">
                              <span className="text-[10px] text-slate-400 dark:text-slate-500 tabular-nums">
                                {sub.durationMinutes}m
                              </span>
                              <Play className="w-3 h-3 text-slate-400 hover:text-slate-900 dark:hover:text-white" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-2">
                    <button
                      onClick={() => onOpenPhaseDetail(phase)}
                      className="w-full py-2 px-4 rounded-lg bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-xs font-medium text-white dark:text-slate-900 transition-colors flex items-center justify-center gap-1.5 cursor-pointer border border-slate-700/20 dark:border-white/20"
                    >
                      <span>View phase details and resources</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            }

            // 3. Locked Phase
            return (
              <div
                key={phase.id}
                className="p-4 sm:p-5 rounded-xl bg-slate-50/60 dark:bg-[#1C1929]/40 border border-slate-200/60 dark:border-[#2E2A44]/60 flex items-center justify-between gap-3 text-slate-400 select-none"
                aria-disabled="true"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-[#13111C] text-slate-400 flex items-center justify-center shrink-0">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400 block tabular-nums">
                      Phase {phase.phaseNumber}: Locked
                    </span>
                    <h4 className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 truncate">
                      {phase.title}
                    </h4>
                  </div>
                </div>

                <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 tabular-nums shrink-0">
                  <span>{dateRange}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PlanTab;
