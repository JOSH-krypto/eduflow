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
    <div className="fixed inset-0 z-50 flex items-end justify-center animate-fade-in">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Bottom Sheet Card */}
      <div 
        className="relative w-full max-w-md bg-white rounded-t-4xl border-t border-purple-100 shadow-sheet p-6 pb-8 z-10 animate-slide-up space-y-4"
        role="dialog"
        aria-label="Quick Actions"
      >
        {/* Drag Pill Handle */}
        <div className="w-12 h-1.5 rounded-full bg-zinc-200 mx-auto -mt-2 mb-3" />

        <div className="flex items-center justify-between pb-2">
          <div>
            <h3 className="text-base font-bold text-[#1E1B4B] font-heading">
              Quick Actions
            </h3>
            <p className="text-xs text-zinc-400 font-sans">
              Choose an action to log your study flow
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-zinc-100 text-zinc-400 hover:text-zinc-600 transition-colors"
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
            className="w-full p-4 rounded-2xl bg-[#F8F7FC] hover:bg-[#F3E8FF] border border-purple-100/60 flex items-center gap-3.5 transition-all group text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-[#EDE9FE] text-[#7C3AED] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <PlusCircle className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-sm font-bold text-[#1E1B4B] font-heading block group-hover:text-[#6D28D9]">
                Add Study Task
              </span>
              <span className="text-xs text-zinc-500 font-sans">
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
            className="w-full p-4 rounded-2xl bg-[#F8F7FC] hover:bg-[#FEF3C7] border border-amber-100/60 flex items-center gap-3.5 transition-all group text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-[#FEF3C7] text-[#D97706] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <Timer className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-sm font-bold text-[#1E1B4B] font-heading block group-hover:text-[#B45309]">
                Start Focus Session
              </span>
              <span className="text-xs text-zinc-500 font-sans">
                Launch the Pomodoro timer & track streak
              </span>
            </div>
          </button>

          {/* Action 3: Summarize research notes */}
          <button
            onClick={() => {
              onClose();
              onOpenAiSummarizer();
            }}
            className="w-full p-4 rounded-2xl bg-[#F8F7FC] hover:bg-[#CCFBF1] border border-teal-100/60 flex items-center gap-3.5 transition-all group text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-[#CCFBF1] text-[#0D9488] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-sm font-bold text-[#1E1B4B] font-heading block group-hover:text-[#0F766E]">
                Summarize Research Material
              </span>
              <span className="text-xs text-zinc-500 font-sans">
                Extract high-yield exam takeaways with AI
              </span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
