import React from 'react';
import { 
  Play, 
  Video, 
  Terminal, 
  ArrowRight, 
  Clock 
} from 'lucide-react';
import { Phase, TaskType } from '../../types/eduflow';

interface PhaseCardProps {
  phase: Phase;
  onOpenPhaseDetail: (phase: Phase) => void;
  onStartAction: (actionTitle: string, phase: Phase, taskType?: TaskType) => void;
  dateRange: string;
}

export const PhaseCard: React.FC<PhaseCardProps> = ({
  phase,
  onOpenPhaseDetail,
  onStartAction,
  dateRange,
}) => {
  return (
    <div className="relative rounded-2xl bg-gradient-to-b from-[#18181C] via-[#141416] to-[#101514] border border-[#2DD4BF]/40 shadow-xl shadow-[#2DD4BF]/5 ring-1 ring-[#2DD4BF]/20 p-5 sm:p-6 transition-all duration-300 hover:border-[#2DD4BF]/60">
      {/* Glow accent */}
      <div 
        className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-[#2DD4BF]/10 blur-2xl pointer-events-none" 
        aria-hidden="true" 
      />

      {/* Phase Meta Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#2DD4BF]/20 text-[#2DD4BF] text-[11px] font-extrabold tracking-wider uppercase font-heading">
            <span className="w-2 h-2 rounded-full bg-[#2DD4BF] animate-ping" />
            PHASE {phase.phaseNumber} · CURRENT IN PROGRESS
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-medium font-sans">
          <Clock className="w-3.5 h-3.5 text-zinc-500" />
          <span>{dateRange || phase.dateRange}</span>
        </div>
      </div>

      {/* Phase Title & Description */}
      <h3 className="text-lg sm:text-xl font-extrabold text-white font-heading tracking-tight">
        {phase.title}
      </h3>
      <p className="text-xs sm:text-sm text-zinc-300 mt-1.5 leading-relaxed font-sans">
        {phase.description}
      </p>

      {/* Two Action Mini-Cards: NEXT VIDEO & UPCOMING LAB */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
        {/* Mini-Card 1: NEXT VIDEO */}
        {phase.nextVideo && (
          <div 
            onClick={() => onStartAction(phase.nextVideo!.title, phase, 'video')}
            className="p-3.5 rounded-xl bg-[#141418] border border-white/[0.08] hover:border-[#2DD4BF]/50 hover:bg-[#181820] transition-all cursor-pointer group flex items-start justify-between gap-3"
            role="button"
            tabIndex={0}
            aria-label={`Start Next Video: ${phase.nextVideo.title}`}
          >
            <div className="flex items-start gap-3 min-w-0">
              <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400 group-hover:bg-sky-500 group-hover:text-black transition-colors flex-shrink-0">
                <Video className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-extrabold text-sky-400 uppercase tracking-wider block font-heading">
                  {phase.nextVideo.label}
                </span>
                <h4 className="text-xs font-bold text-white truncate mt-0.5 group-hover:text-sky-300 transition-colors font-sans">
                  {phase.nextVideo.title}
                </h4>
                <span className="text-[10px] text-zinc-400 mt-1 block">
                  Duration: {phase.nextVideo.duration}
                </span>
              </div>
            </div>
            <div className="w-6 h-6 rounded-full bg-white/[0.05] group-hover:bg-sky-400/20 flex items-center justify-center flex-shrink-0">
              <Play className="w-3 h-3 text-sky-400 fill-current ml-0.5" />
            </div>
          </div>
        )}

        {/* Mini-Card 2: UPCOMING LAB */}
        {phase.upcomingLab && (
          <div 
            onClick={() => onStartAction(phase.upcomingLab!.title, phase, 'lab')}
            className="p-3.5 rounded-xl bg-[#141418] border border-white/[0.08] hover:border-[#F5A623]/50 hover:bg-[#181820] transition-all cursor-pointer group flex items-start justify-between gap-3"
            role="button"
            tabIndex={0}
            aria-label={`Start Upcoming Lab: ${phase.upcomingLab.title}`}
          >
            <div className="flex items-start gap-3 min-w-0">
              <div className="p-2 rounded-lg bg-[#F5A623]/10 text-[#F5A623] group-hover:bg-[#F5A623] group-hover:text-black transition-colors flex-shrink-0">
                <Terminal className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-extrabold text-[#F5A623] uppercase tracking-wider block font-heading">
                  {phase.upcomingLab.label}
                </span>
                <h4 className="text-xs font-bold text-white truncate mt-0.5 group-hover:text-[#F5A623] transition-colors font-sans">
                  {phase.upcomingLab.title}
                </h4>
                <span className="text-[10px] text-zinc-400 mt-1 block">
                  Hands-on: {phase.upcomingLab.duration}
                </span>
              </div>
            </div>
            <div className="w-6 h-6 rounded-full bg-white/[0.05] group-hover:bg-[#F5A623]/20 flex items-center justify-center flex-shrink-0">
              <Play className="w-3 h-3 text-[#F5A623] fill-current ml-0.5" />
            </div>
          </div>
        )}
      </div>

      {/* Progress Bar & Phase Action Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 mt-2 border-t border-white/[0.06]">
        <div className="flex items-center gap-3 flex-1 max-w-md">
          <div className="h-2 w-full rounded-full bg-white/[0.06] overflow-hidden relative">
            <div 
              className="h-full rounded-full bg-gradient-to-r from-[#2DD4BF] to-[#14B8A6] transition-all duration-500" 
              style={{ width: `${phase.progressPercent}%` }}
            />
          </div>
          <span className="text-xs font-extrabold text-[#2DD4BF] flex-shrink-0 font-mono">
            {phase.progressPercent}%
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onOpenPhaseDetail(phase)}
            className="px-3.5 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-xs font-semibold text-zinc-300 hover:text-white transition-colors"
          >
            Curriculum ({phase.subtopics.length} Lessons)
          </button>
          
          <button
            onClick={() => onStartAction(phase.upcomingLab?.title || phase.title, phase, 'lab')}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[#2DD4BF] hover:bg-[#14B8A6] text-[#0A0A0C] font-extrabold text-xs font-heading shadow-md shadow-[#2DD4BF]/20 transition-all hover:-translate-y-0.5"
            aria-label={`Continue Phase ${phase.phaseNumber}`}
          >
            <span>Continue Phase</span>
            <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>
        </div>
      </div>
    </div>
  );
};
