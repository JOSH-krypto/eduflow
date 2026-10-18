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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/70 backdrop-blur-xs font-sans select-none">
      <div 
        className="w-full max-w-lg max-h-[85vh] bg-white dark:bg-[#1C1929] rounded-xl shadow-lg border border-slate-200 dark:border-[#2E2A44] flex flex-col overflow-hidden"
        role="dialog"
        aria-label={`Phase ${phase.phaseNumber} details`}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-[#2E2A44] flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1 tabular-nums">
              <span className={`text-xs font-medium uppercase tracking-wider ${
                isCompleted
                  ? 'text-emerald-700 dark:text-emerald-300'
                  : isInProgress
                  ? 'text-slate-900 dark:text-white'
                  : 'text-slate-500'
              }`}>
                Phase {phase.phaseNumber}: {phase.status.replace('_', ' ')}
              </span>
              <span className="text-xs text-slate-400">· {phase.dateRange}</span>
            </div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              {phase.title}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{phase.description}</p>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-md bg-slate-100 dark:bg-[#2E2A44] hover:bg-slate-200 dark:hover:bg-[#3B3759] text-slate-500 dark:text-slate-300 flex items-center justify-center transition shrink-0 cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-4 py-2.5 bg-slate-50 dark:bg-[#13111C] border-b border-slate-200 dark:border-[#2E2A44] flex items-center justify-between tabular-nums">
          <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Phase completion</span>
          <div className="flex items-center gap-2.5">
            <div className="w-24 h-1.5 bg-slate-200 dark:bg-[#252236] rounded-full overflow-hidden">
              <div
                className="h-full bg-slate-900 dark:bg-slate-100 rounded-full transition-all"
                style={{ width: `${phase.progressPercent}%` }}
              />
            </div>
            <span className="text-xs font-medium text-slate-900 dark:text-white">{phase.progressPercent}%</span>
          </div>
        </div>

        {/* Subtopics List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-2">
          <h3 className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 tabular-nums">
            Curriculum modules ({phase.subtopics?.length || 0})
          </h3>

          {phase.subtopics?.map((sub) => {
            const theme = getCategoryTheme(sub.type || 'study');
            return (
              <div
                key={sub.id}
                className="p-3 bg-white dark:bg-[#13111C] border border-slate-200 dark:border-[#2E2A44] rounded-lg flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`w-6 h-6 rounded flex items-center justify-center shrink-0 ${
                    sub.completed
                      ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900'
                      : 'border border-slate-300 dark:border-slate-600 text-slate-400'
                  }`}>
                    {sub.completed ? <Check className="w-3.5 h-3.5" /> : <Clock className="w-3 h-3" />}
                  </div>

                  <div className="min-w-0">
                    <p className={`text-xs font-medium truncate ${sub.completed ? 'text-slate-400 line-through' : 'text-slate-900 dark:text-slate-100'}`}>
                      {sub.title}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5 tabular-nums">
                      <span className="text-[10px] text-slate-500">
                        {theme.name}
                      </span>
                      <span className="text-[10px] text-slate-400">· {sub.durationMinutes} mins</span>
                    </div>
                  </div>
                </div>

                {onStartTopic && !sub.completed && (
                  <button
                    onClick={() => onStartTopic(sub)}
                    className="px-2.5 py-1 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-md text-[11px] font-medium flex items-center gap-1 shrink-0 transition cursor-pointer"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>Study</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 dark:bg-[#13111C] border-t border-slate-200 dark:border-[#2E2A44] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-100 dark:bg-[#2E2A44] hover:bg-slate-200 dark:hover:bg-[#3B3759] text-slate-700 dark:text-slate-200 font-medium rounded-lg text-xs transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default PhaseDetailModal;
