import React from 'react';
import { X, PlusCircle, Timer, Sparkles } from 'lucide-react';

interface QuickActionsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAddTask: () => void;
  onOpenFocusTimer: () => void;
  onOpenAiSummarizer: () => void;
}

export const QuickActionsSheet: React.FC<QuickActionsSheetProps> = ({
  isOpen,
  onClose,
  onOpenAddTask,
  onOpenFocusTimer,
  onOpenAiSummarizer,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center animate-fade-in font-sans select-none">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Bottom Sheet Card */}
      <div 
        className="relative w-full max-w-md bg-white dark:bg-[#1C1929] rounded-t-4xl border-t border-slate-200 dark:border-[#2E2A44] shadow-sheet p-6 pb-8 z-10 animate-slide-up space-y-4"
        role="dialog"
        aria-label="Quick Actions"
      >
        {/* Drag Pill Handle */}
        <div className="w-12 h-1.5 rounded-full bg-slate-200 dark:bg-[#2E2A44] mx-auto -mt-2 mb-3" />

        <div className="flex items-center justify-between pb-2">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white font-heading">
              Quick Actions
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-400 font-sans">
              Choose an action to log your study flow
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-100 dark:bg-[#2E2A44] text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors cursor-pointer"
            aria-label="Close quick actions"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 3 Quick Action Tiles */}
        <div className="space-y-2.5">
          {/* Action 1: Add study task */}
          <button
            onClick={() => {
              onClose();
              onOpenAddTask();
            }}
            className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-[#13111C] hover:bg-slate-100 dark:hover:bg-[#252236] border border-slate-200/60 dark:border-[#2E2A44] flex items-center gap-3.5 transition-all group text-left cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-200/70 dark:bg-[#2E2A44] text-slate-800 dark:text-white flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <PlusCircle className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-sm font-bold text-slate-900 dark:text-white font-heading block group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                Add Study Task
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-sans">
                Schedule a lesson, lab, or quiz for today
              </span>
            </div>
          </button>

          {/* Action 2: Log study session / timer */}
          <button
            onClick={() => {
              onClose();
              onOpenFocusTimer();
            }}
            className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-[#13111C] hover:bg-teal-50/60 dark:hover:bg-teal-950/30 border border-slate-200/60 dark:border-[#2E2A44] flex items-center gap-3.5 transition-all group text-left cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <Timer className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-sm font-bold text-slate-900 dark:text-white font-heading block group-hover:text-teal-600 dark:group-hover:text-teal-300 transition-colors">
                Start Focus Session
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-sans">
                Launch the Pomodoro timer & track streak
              </span>
            </div>
          </button>

          {/* Action 3: AI Summarizer */}
          <button
            onClick={() => {
              onClose();
              onOpenAiSummarizer();
            }}
            className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-[#13111C] hover:bg-amber-50/60 dark:hover:bg-amber-950/30 border border-slate-200/60 dark:border-[#2E2A44] flex items-center gap-3.5 transition-all group text-left cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-sm font-bold text-slate-900 dark:text-white font-heading block group-hover:text-amber-600 dark:group-hover:text-amber-300 transition-colors">
                AI Research Notes
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-sans">
                Summarize study guides, slides & PDFs
              </span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuickActionsSheet;
