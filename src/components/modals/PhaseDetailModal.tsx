import React from 'react';
import { 
  X, 
  Check, 
  Play, 
  Clock 
} from 'lucide-react';
import { Phase, SubTopic, getCategoryTheme } from '../../types/eduflow';

interface PhaseDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  phase: Phase | null;
  onStartTopic?: (subtopic: SubTopic) => void;
}

export const PhaseDetailModal: React.FC<PhaseDetailModalProps> = ({
  isOpen,
  onClose,
  phase,
  onStartTopic,
}) => {
  if (!isOpen || !phase) return null;

  const isCompleted = phase.status === 'completed';
  const isInProgress = phase.status === 'in_progress';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/70 backdrop-blur-sm animate-fade-in font-sans select-none">
      <div 
        className="w-full max-w-lg max-h-[85vh] bg-white dark:bg-[#1C1929] rounded-3xl shadow-2xl border border-slate-100 dark:border-[#2E2A44] flex flex-col overflow-hidden animate-slide-up"
        role="dialog"
        aria-label={`Phase ${phase.phaseNumber} Details`}
      >
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-violet-50/70 to-teal-50/40 dark:from-[#13111C] dark:to-[#1C1929] border-b border-slate-100 dark:border-[#2E2A44] flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider font-mono ${
                isCompleted
                  ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                  : isInProgress
                  ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                  : 'bg-slate-100 dark:bg-[#2E2A44] text-slate-500 dark:text-slate-400'
              }`}>
                Phase {phase.phaseNumber} • {phase.status.replace('_', ' ')}
              </span>
              <span className="text-[11px] text-slate-400 dark:text-slate-400 font-mono">{phase.dateRange}</span>
            </div>
            <h2 className="text-base font-bold text-slate-800 dark:text-white font-heading">
              {phase.title}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{phase.description}</p>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white dark:bg-[#2E2A44] hover:bg-slate-100 dark:hover:bg-[#3B3759] text-slate-400 dark:text-slate-300 hover:text-slate-700 dark:hover:text-white flex items-center justify-center transition shadow-sm shrink-0 cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-5 py-3 bg-slate-50 dark:bg-[#13111C] border-b border-slate-100 dark:border-[#2E2A44] flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Phase Completion</span>
          <div className="flex items-center gap-2.5">
            <div className="w-28 h-2 bg-slate-200 dark:bg-[#252236] rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500 rounded-full transition-all"
                style={{ width: `${phase.progressPercent}%` }}
              />
            </div>
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 font-mono">{phase.progressPercent}%</span>
          </div>
        </div>

        {/* Subtopics List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-2.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2 font-mono">
            Curriculum Modules ({phase.subtopics?.length || 0})
          </h3>

          {phase.subtopics?.map((sub) => {
            const theme = getCategoryTheme(sub.type || 'study');
            return (
              <div
                key={sub.id}
                className="p-3 bg-slate-50 dark:bg-[#13111C] hover:bg-slate-100/70 dark:hover:bg-[#252236] border border-slate-100 dark:border-[#2E2A44] rounded-2xl flex items-center justify-between gap-3 transition"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                    sub.completed
                      ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-300'
                      : 'bg-white dark:bg-[#1C1929] border border-slate-200 dark:border-[#2E2A44] text-slate-400'
                  }`}>
                    {sub.completed ? <Check className="w-4 h-4" /> : <Clock className="w-3.5 h-3.5" />}
                  </div>

                  <div className="min-w-0">
                    <p className={`text-xs font-bold truncate ${sub.completed ? 'text-slate-400 dark:text-slate-500 line-through' : 'text-slate-800 dark:text-slate-100'}`}>
                      {sub.title}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span
                        className="px-2 py-0.2 rounded-md text-[9px] font-bold"
                        style={{ backgroundColor: theme.badgeBg, color: theme.badgeText }}
                      >
                        {theme.name}
                      </span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">{sub.durationMinutes} mins</span>
                    </div>
                  </div>
                </div>

                {onStartTopic && !sub.completed && (
                  <button
                    onClick={() => onStartTopic(sub)}
                    className="px-2.5 py-1.5 bg-slate-900 dark:bg-[#2E2A44] hover:bg-slate-800 dark:hover:bg-[#3B3759] text-white rounded-xl text-[11px] font-semibold flex items-center gap-1 shrink-0 shadow-sm transition active:scale-95 cursor-pointer"
                  >
                    <Play className="w-3 h-3 fill-white" />
                    <span>Study</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-[#13111C] border-t border-slate-100 dark:border-[#2E2A44] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-200 dark:bg-[#2E2A44] hover:bg-slate-300 dark:hover:bg-[#3B3759] text-slate-700 dark:text-slate-200 font-semibold rounded-2xl text-xs transition cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default PhaseDetailModal;
