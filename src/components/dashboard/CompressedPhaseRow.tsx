import React from 'react';
import { Check, Lock, ArrowRight, Clock } from 'lucide-react';
import { Phase } from '../../types/eduflow';

interface CompressedPhaseRowProps {
  phase: Phase;
  onOpenPhaseDetail: (phase: Phase) => void;
  dateRange: string;
}

export const CompressedPhaseRow: React.FC<CompressedPhaseRowProps> = ({
  phase,
  onOpenPhaseDetail,
  dateRange,
}) => {
  const isCompleted = phase.status === 'completed';
  const isLocked = phase.status === 'locked';

  if (isCompleted) {
    return (
      <div 
        onClick={() => onOpenPhaseDetail(phase)}
        className="group relative flex items-center justify-between gap-4 p-3.5 sm:p-4 rounded-xl bg-[#141416]/80 border border-white/[0.06] hover:border-[#2DD4BF]/40 transition-all duration-200 cursor-pointer"
        role="button"
        tabIndex={0}
        aria-label={`Review completed Phase ${phase.phaseNumber}: ${phase.title}`}
      >
        {/* Left: Checkmark + Title */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-6 h-6 rounded-full bg-[#2DD4BF]/20 text-[#2DD4BF] flex items-center justify-center flex-shrink-0">
            <Check className="w-3.5 h-3.5 stroke-[3]" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#2DD4BF] font-heading">
                Phase {phase.phaseNumber} · Completed
              </span>
            </div>
            <h4 className="text-xs sm:text-sm font-semibold text-zinc-200 truncate group-hover:text-white transition-colors font-sans">
              {phase.title}
            </h4>
          </div>
        </div>

        {/* Center/Right: Thin full progress bar + Date Range + Review button */}
        <div className="flex items-center gap-3 sm:gap-5 flex-shrink-0">
          {/* Thin 100% progress bar */}
          <div className="hidden md:flex items-center gap-2 w-28 lg:w-36">
            <div className="h-1.5 w-full rounded-full bg-white/[0.06] overflow-hidden">
              <div className="h-full rounded-full bg-[#2DD4BF] w-full" />
            </div>
            <span className="text-[10px] font-bold text-[#2DD4BF] font-mono">100%</span>
          </div>

          {/* Date range */}
          <div className="hidden sm:flex items-center gap-1 text-[11px] text-zinc-400 font-sans">
            <Clock className="w-3 h-3 text-zinc-500" />
            <span>{dateRange || phase.dateRange}</span>
          </div>

          {/* Review link */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenPhaseDetail(phase);
            }}
            className="flex items-center gap-1 text-xs font-bold text-zinc-400 group-hover:text-[#2DD4BF] transition-colors py-1 px-2.5 rounded-lg hover:bg-white/[0.04]"
          >
            <span>Review</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>
    );
  }

  // Locked Phase: Minimal dimmed row
  if (isLocked) {
    return (
      <div 
        onClick={() => onOpenPhaseDetail(phase)}
        className="flex items-center justify-between gap-4 p-3 rounded-xl bg-[#101012]/50 border border-white/[0.03] text-zinc-500 cursor-pointer hover:border-white/[0.08] hover:text-zinc-400 transition-colors"
        role="button"
        tabIndex={0}
        aria-label={`Locked Phase ${phase.phaseNumber}: ${phase.title}`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-6 h-6 rounded-full bg-zinc-800/40 text-zinc-600 flex items-center justify-center flex-shrink-0">
            <Lock className="w-3 h-3" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 font-heading">
                Phase {phase.phaseNumber}
              </span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-zinc-800/80 text-zinc-400 font-medium">
                Locked
              </span>
            </div>
            <span className="text-xs text-zinc-400 truncate block mt-0.5 font-sans font-medium">
              {phase.title}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0 text-[11px] text-zinc-600">
          <span className="hidden sm:inline">{phase.unlockRequirement || `Unlocks after Phase ${phase.phaseNumber - 1}`}</span>
          <Lock className="w-3.5 h-3.5" />
        </div>
      </div>
    );
  }

  return null;
};
