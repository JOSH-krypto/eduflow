import React from 'react';
import { X, Plus, Timer, BookOpen } from 'lucide-react';

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
      <div 
        className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <div 
        className="relative w-full max-w-md bg-white dark:bg-[#1C1929] rounded-t-2xl border-t border-slate-200 dark:border-[#2E2A44] shadow-lg p-5 pb-6 z-10 space-y-3"
        role="dialog"
        aria-label="Actions"
      >
        <div className="w-10 h-1 rounded-full bg-slate-200 dark:bg-[#2E2A44] mx-auto -mt-1 mb-2" />

        <div className="flex items-center justify-between pb-1">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Actions
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Select an action to continue your study flow.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors cursor-pointer"
            aria-label="Close actions"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2">
          {/* Action 1: Add task */}
          <button
            onClick={() => {
              onClose();
              onOpenAddTask();
            }}
            className="w-full p-3 rounded-lg bg-slate-50 dark:bg-[#13111C] hover:bg-slate-100 dark:hover:bg-[#252236] border border-slate-200 dark:border-[#2E2A44] flex items-center gap-3 transition-colors text-left cursor-pointer"
          >
            <div className="w-8 h-8 rounded-md bg-white dark:bg-[#1C1929] border border-slate-200 dark:border-[#2E2A44] text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0">
              <Plus className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-xs font-semibold text-slate-900 dark:text-white block">
                Add study task
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Schedule a task into today's plan
              </span>
            </div>
          </button>

          {/* Action 2: Focus timer */}
          <button
            onClick={() => {
              onClose();
              onOpenFocusTimer();
            }}
            className="w-full p-3 rounded-lg bg-slate-50 dark:bg-[#13111C] hover:bg-slate-100 dark:hover:bg-[#252236] border border-slate-200 dark:border-[#2E2A44] flex items-center gap-3 transition-colors text-left cursor-pointer"
          >
            <div className="w-8 h-8 rounded-md bg-white dark:bg-[#1C1929] border border-slate-200 dark:border-[#2E2A44] text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0">
              <Timer className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-xs font-semibold text-slate-900 dark:text-white block">
                Start focus timer
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Timed study session
              </span>
            </div>
          </button>

          {/* Action 3: Document summarizer */}
          <button
            onClick={() => {
              onClose();
              onOpenAiSummarizer();
            }}
            className="w-full p-3 rounded-lg bg-slate-50 dark:bg-[#13111C] hover:bg-slate-100 dark:hover:bg-[#252236] border border-slate-200 dark:border-[#2E2A44] flex items-center gap-3 transition-colors text-left cursor-pointer"
          >
            <div className="w-8 h-8 rounded-md bg-white dark:bg-[#1C1929] border border-slate-200 dark:border-[#2E2A44] text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0">
              <BookOpen className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-xs font-semibold text-slate-900 dark:text-white block">
                Document summarizer
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Summarize study notes and PDF documents
              </span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuickActionsSheet;
