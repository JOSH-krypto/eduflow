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
  course: Course;
  onOpenPhaseDetail: (phase: Phase) => void;
  onStartStudyTopic: (title: string, phase: Phase, subtopic?: SubTopic) => void;
}

export const PlanTab: React.FC<PlanTabProps> = ({
  course,
  onOpenPhaseDetail,
  onStartStudyTopic,
}) => {
  return (
    <div className="w-full max-w-5xl mx-auto space-y-5 animate-fade-in pb-16 font-sans">
      {/* Plan Header */}
      <div className="p-5 sm:p-7 rounded-3xl bg-white border border-purple-100/90 shadow-card">
        <div className="flex items-center gap-2 mb-1.5">
          <div className="w-7 h-7 rounded-xl bg-[#EDE9FE] text-[#7C3AED] flex items-center justify-center">
            <Compass className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-bold text-[#6D28D9] uppercase tracking-wider font-heading">
            Curriculum Roadmap
          </span>
        </div>
        <h2 className="text-lg sm:text-2xl font-extrabold text-[#1E1B4B] font-heading tracking-tight">
          {course.title} Study Path
        </h2>
        <p className="text-xs sm:text-sm text-zinc-500 mt-1">
          Structured progression from core cloud foundations to multi-region architectures and mock simulations.
        </p>
      </div>

      {/* Sequential Phases List */}
      <div className="space-y-4">
        {course.phases.map((phase, idx) => {
          const dateRange = getPhaseDynamicDateRange(idx, course.phases.length, course.examDate);
          const isCompleted = phase.status === 'completed';
          const isInProgress = phase.status === 'in_progress';

          // 1. COMPLETED PHASE: Compact row
          if (isCompleted) {
            return (
              <div
                key={phase.id}
                onClick={() => onOpenPhaseDetail(phase)}
                className="p-4 sm:p-5 rounded-3xl bg-white border border-purple-100/80 shadow-card flex items-center justify-between gap-3 cursor-pointer hover:border-purple-200 hover:shadow-card-hover transition-all"
                role="button"
                tabIndex={0}
                aria-label={`Review completed phase: ${phase.title}`}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-9 h-9 rounded-2xl bg-[#D1FAE5] text-[#047857] flex items-center justify-center flex-shrink-0 font-bold shadow-soft">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#047857] font-heading block">
                      Phase {phase.phaseNumber} · Completed
                    </span>
                    <h4 className="text-xs sm:text-sm font-bold text-[#1E1B4B] truncate font-heading">
                      {phase.title}
                    </h4>
                  </div>
                </div>

                <div className="flex items-center gap-4 flex-shrink-0">
                  <div className="hidden sm:flex items-center gap-1.5 text-xs text-zinc-400">
                    <Clock className="w-3.5 h-3.5 text-zinc-400" />
                    <span>{dateRange}</span>
                  </div>
                  <button className="px-3 py-1.5 rounded-xl bg-purple-50 text-xs font-bold text-[#7C3AED] hover:bg-purple-100 font-heading flex items-center gap-1 transition">
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
                className="p-5 sm:p-7 rounded-3xl bg-white border-2 border-[#8B5CF6]/40 shadow-card space-y-5 relative overflow-hidden"
              >
                {/* Header Row */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="px-3 py-1 rounded-full bg-[#F3E8FF] text-[#6D28D9] text-[11px] font-bold uppercase tracking-wider font-heading flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#8B5CF6] animate-pulse" />
                    Phase {phase.phaseNumber} · In Progress
                  </span>

                  <span className="text-xs font-semibold text-zinc-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {dateRange}
                  </span>
                </div>

                {/* Title & Description */}
                <div>
                  <h3 className="text-base sm:text-xl font-extrabold text-[#1E1B4B] font-heading">
                    {phase.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-500 mt-1 leading-relaxed">
                    {phase.description}
                  </p>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-zinc-500">
                    <span>Overall Phase Mastery</span>
                    <span className="font-bold text-[#6D28D9] font-mono">{phase.progressPercent}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-[#F3E8FF] overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-[#8B5CF6] transition-all duration-500" 
                      style={{ width: `${phase.progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Two Action Mini-Cards side-by-side in grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {/* Mini-Card 1: Next Video */}
                  {phase.nextVideo && (
                    <div 
                      onClick={() => onStartStudyTopic(phase.nextVideo!.title, phase)}
                      className="p-3.5 sm:p-4 rounded-2xl bg-[#F8F7FC] border border-purple-100/70 hover:border-purple-200 transition-all flex items-center justify-between gap-3 cursor-pointer group shadow-soft hover:-translate-y-0.5"
                      role="button"
                      tabIndex={0}
                      aria-label={`Watch: ${phase.nextVideo.title}`}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-8 h-8 rounded-xl bg-[#EDE9FE] text-[#7C3AED] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                          <Video className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-[#7C3AED] font-heading block">
                            {phase.nextVideo.label}
                          </span>
                          <h5 className="text-xs font-bold text-[#1E1B4B] truncate font-heading group-hover:text-[#6D28D9] transition-colors">
                            {phase.nextVideo.title}
                          </h5>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-zinc-400 font-mono flex-shrink-0">
                        {phase.nextVideo.duration}
                      </span>
                    </div>
                  )}

                  {/* Mini-Card 2: Upcoming Lab */}
                  {phase.upcomingLab && (
                    <div 
                      onClick={() => onStartStudyTopic(phase.upcomingLab!.title, phase)}
                      className="p-3.5 sm:p-4 rounded-2xl bg-[#FEF3C7]/30 border border-[#FDE68A]/80 hover:border-[#FCD34D] transition-all flex items-center justify-between gap-3 cursor-pointer group shadow-soft hover:-translate-y-0.5"
                      role="button"
                      tabIndex={0}
                      aria-label={`Start Lab: ${phase.upcomingLab.title}`}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-8 h-8 rounded-xl bg-[#FEF3C7] text-[#D97706] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                          <Terminal className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-[#B45309] font-heading block">
                            {phase.upcomingLab.label}
                          </span>
                          <h5 className="text-xs font-bold text-[#1E1B4B] truncate font-heading group-hover:text-[#B45309] transition-colors">
                            {phase.upcomingLab.title}
                          </h5>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-[#B45309] font-mono flex-shrink-0">
                        {phase.upcomingLab.duration}
                      </span>
                    </div>
                  )}
                </div>

                {/* Subtopics Checklist Grid (2-columns on tablet/desktop) */}
                {phase.subtopics && phase.subtopics.length > 0 && (
                  <div className="pt-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 font-heading block mb-2">
                      Curriculum Units ({phase.subtopics.length})
                    </span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                      {phase.subtopics.map((sub) => (
                        <div 
                          key={sub.id} 
                          className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-100 rounded-2xl text-xs"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <div className={`w-5 h-5 rounded-lg flex items-center justify-center text-[10px] ${
                              sub.completed ? 'bg-emerald-100 text-emerald-600 font-bold' : 'bg-white text-slate-400 border border-slate-200'
                            }`}>
                              {sub.completed ? '✓' : ''}
                            </div>
                            <span className={`truncate font-medium ${sub.completed ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                              {sub.title}
                            </span>
                          </div>
                          <span className="text-[10px] text-zinc-400 font-mono shrink-0 ml-2">
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
                    className="w-full py-3 rounded-2xl bg-purple-50 hover:bg-purple-100 text-xs font-bold text-[#6D28D9] font-heading transition-all flex items-center justify-center gap-1.5 cursor-pointer"
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
              className="p-4 sm:p-5 rounded-3xl bg-white/70 border border-purple-100/50 flex items-center justify-between gap-3 opacity-65 select-none"
              aria-disabled="true"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-9 h-9 rounded-2xl bg-zinc-100 text-zinc-400 flex items-center justify-center flex-shrink-0">
                  <Lock className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 font-heading block">
                    Phase {phase.phaseNumber} · Locked
                  </span>
                  <h4 className="text-xs sm:text-sm font-bold text-zinc-500 truncate font-heading">
                    {phase.title}
                  </h4>
                </div>
              </div>

              <div className="hidden sm:flex items-center gap-1.5 text-xs text-zinc-400 font-mono flex-shrink-0">
                <span>{dateRange}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
