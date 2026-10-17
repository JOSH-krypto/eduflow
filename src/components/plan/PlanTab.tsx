import React from 'react';
import { 
  Check, 
  Lock, 
  Video, 
  Terminal, 
  ArrowRight, 
  Clock, 
  Compass
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
      <div className="w-full max-w-4xl mx-auto py-8 animate-fade-in font-sans space-y-6">
        <div className="p-8 sm:p-12 rounded-3xl bg-white dark:bg-[#1C1929] border border-slate-200/90 dark:border-[#2E2A44] shadow-card text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto shadow-soft">
            <Compass className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white font-heading">
              No Active Study Plan
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Create a study plan to generate sequential milestone phases and study topics.
            </p>
          </div>
          {onOpenCreateCourse && (
            <button
              onClick={onOpenCreateCourse}
              className="px-5 py-3 bg-slate-900 dark:bg-[#2E2A44] hover:bg-slate-800 dark:hover:bg-[#3B3759] text-white font-bold rounded-2xl text-xs shadow-card transition cursor-pointer"
            >
              + Create Your Study Plan
            </button>
          )}
        </div>
      </div>
    );
  }

  const phases = course.phases || [];

  return (
    <div className="w-full max-w-5xl mx-auto space-y-5 animate-fade-in pb-16 font-sans select-none">
      {/* Plan Header */}
      <div className="p-5 sm:p-7 rounded-2xl bg-white dark:bg-[#1C1929] border border-slate-200/90 dark:border-[#2E2A44] shadow-sm">
        <div className="flex items-center gap-2 mb-1.5">
          <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-[#2E2A44] text-slate-700 dark:text-slate-300 flex items-center justify-center">
            <Compass className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono">
            Curriculum Roadmap
          </span>
        </div>
        <h2 className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight font-heading">
          {course.title} Study Path
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Structured progression and sequential milestones toward your target exam date.
        </p>
      </div>

      {/* Sequential Phases List or Empty State */}
      {phases.length === 0 ? (
        <div className="p-8 text-center rounded-2xl bg-white dark:bg-[#1C1929] border border-slate-200/90 dark:border-[#2E2A44] shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-[#2E2A44] text-slate-400 flex items-center justify-center mx-auto">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">No curriculum phases defined</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Add phases to break down your exam objectives into manageable study weeks.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {phases.map((phase, idx) => {
            const dateRange = getPhaseDynamicDateRange(idx, phases.length, course.examDate);
            const isCompleted = phase.status === 'completed';
            const isInProgress = phase.status === 'in_progress';

            // 1. COMPLETED PHASE: Compact row
            if (isCompleted) {
              return (
                <div
                  key={phase.id}
                  onClick={() => onOpenPhaseDetail(phase)}
                  className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#1C1929] border border-slate-200/90 dark:border-[#2E2A44] shadow-sm flex items-center justify-between gap-3 cursor-pointer hover:border-slate-300 dark:hover:border-[#3B3759] hover:shadow-md transition-all"
                  role="button"
                  tabIndex={0}
                  aria-label={`Review completed phase: ${phase.title}`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-900/60 flex items-center justify-center flex-shrink-0 font-bold shadow-sm">
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 block font-mono">
                        Phase {phase.phaseNumber} · Completed
                      </span>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                        {phase.title}
                      </h4>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 flex-shrink-0">
                    <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 font-mono">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{dateRange}</span>
                    </div>
                    <button className="px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-[#2E2A44] hover:bg-slate-200 dark:hover:bg-[#3B3759] text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1 transition cursor-pointer">
                      <span>Review</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            }

            // 2. CURRENT IN-PROGRESS PHASE: Dominant full-size card
            if (isInProgress) {
              return (
                <div
                  key={phase.id}
                  className="p-5 sm:p-7 rounded-2xl bg-white dark:bg-[#1C1929] border-2 border-amber-400/80 dark:border-amber-500/80 shadow-md space-y-5 relative overflow-hidden"
                >
                  {/* Header Row */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/50 border border-amber-200/70 dark:border-amber-900/60 text-amber-800 dark:text-amber-300 text-[11px] font-semibold uppercase tracking-wider flex items-center gap-1.5 font-mono">
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                      Phase {phase.phaseNumber} · Current Sprint
                    </span>

                    <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 flex items-center gap-1 font-mono">
                      <Clock className="w-3.5 h-3.5" />
                      {dateRange}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="text-base sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight font-heading">
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
                    <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                      <span>Overall Phase Mastery</span>
                      <span className="font-bold text-slate-900 dark:text-white font-mono">{phase.progressPercent}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-[#252236] overflow-hidden">
                      <div 
                        className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-500 shadow-sm" 
                        style={{ width: `${phase.progressPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Action Mini-Cards side-by-side */}
                  {(phase.nextVideo || phase.upcomingLab) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      {phase.nextVideo && (
                        <div 
                          onClick={() => onStartStudyTopic(phase.nextVideo!.title, phase)}
                          className="p-3.5 sm:p-4 rounded-xl bg-slate-50/80 dark:bg-[#13111C]/80 border border-slate-200/70 dark:border-[#2E2A44] hover:border-slate-300 dark:hover:border-[#3B3759] transition-all flex items-center justify-between gap-3 cursor-pointer group shadow-sm hover:-translate-y-0.5"
                          role="button"
                          tabIndex={0}
                          aria-label={`Watch: ${phase.nextVideo.title}`}
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className="w-8 h-8 rounded-lg bg-white dark:bg-[#1C1929] border border-slate-200 dark:border-[#2E2A44] text-slate-700 dark:text-slate-300 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                              <Video className="w-4 h-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                                {phase.nextVideo.label || 'Next Video'}
                              </span>
                              <h5 className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                                {phase.nextVideo.title}
                              </h5>
                            </div>
                          </div>
                          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 font-mono flex-shrink-0">
                            {phase.nextVideo.duration}
                          </span>
                        </div>
                      )}

                      {phase.upcomingLab && (
                        <div 
                          onClick={() => onStartStudyTopic(phase.upcomingLab!.title, phase)}
                          className="p-3.5 sm:p-4 rounded-xl bg-amber-50/30 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 hover:border-amber-300 dark:hover:border-amber-700 transition-all flex items-center justify-between gap-3 cursor-pointer group shadow-sm hover:-translate-y-0.5"
                          role="button"
                          tabIndex={0}
                          aria-label={`Start Lab: ${phase.upcomingLab.title}`}
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                              <Terminal className="w-4 h-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <span className="text-[9px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 block">
                                {phase.upcomingLab.label || 'Upcoming Lab'}
                              </span>
                              <h5 className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-amber-700 dark:group-hover:text-amber-300 transition-colors">
                                {phase.upcomingLab.title}
                              </h5>
                            </div>
                          </div>
                          <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 font-mono flex-shrink-0">
                            {phase.upcomingLab.duration}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Subtopics Checklist Grid */}
                  {phase.subtopics && phase.subtopics.length > 0 && (
                    <div className="pt-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-2 font-mono">
                        Curriculum Units ({phase.subtopics.length})
                      </span>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                        {phase.subtopics.map((sub) => (
                          <div 
                            key={sub.id} 
                            className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-[#13111C] border border-slate-100 dark:border-[#2E2A44] rounded-xl text-xs"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <div className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] ${
                                sub.completed ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold' : 'bg-white dark:bg-[#1C1929] text-slate-400 border border-slate-200 dark:border-[#2E2A44]'
                              }`}>
                                {sub.completed ? '✓' : ''}
                              </div>
                              <span className={`truncate font-medium ${sub.completed ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-800 dark:text-slate-200'}`}>
                                {sub.title}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono shrink-0 ml-2">
                              {sub.durationMinutes}m
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* View Details Button */}
                  <div className="pt-2">
                    <button
                      onClick={() => onOpenPhaseDetail(phase)}
                      className="w-full py-2.5 rounded-full bg-slate-900 dark:bg-[#2E2A44] hover:bg-slate-800 dark:hover:bg-[#3B3759] text-xs font-semibold text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
                    >
                      <span>View Phase Modules & Study Resources</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            }

            // 3. LOCKED PHASE: Minimal dimmed row
            return (
              <div
                key={phase.id}
                className="p-4 sm:p-5 rounded-2xl bg-white/70 dark:bg-[#1C1929]/50 border border-slate-200/50 dark:border-[#2E2A44]/50 flex items-center justify-between gap-3 opacity-65 select-none"
                aria-disabled="true"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-[#13111C] text-slate-400 flex items-center justify-center flex-shrink-0">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block font-mono">
                      Phase {phase.phaseNumber} · Locked
                    </span>
                    <h4 className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400 truncate">
                      {phase.title}
                    </h4>
                  </div>
                </div>

                <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 font-mono flex-shrink-0">
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
