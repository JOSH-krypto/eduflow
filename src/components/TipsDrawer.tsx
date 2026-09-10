import React from 'react';
import { Lightbulb, X, Sparkles } from 'lucide-react';

interface TipsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  tips: string[];
  examTitle: string;
}

export const TipsDrawer: React.FC<TipsDrawerProps> = ({
  isOpen,
  onClose,
  tips,
  examTitle,
}) => {
  if (!isOpen) return null;

  return (
    <aside 
      aria-label="High-Yield Study Tips"
      className="no-print fixed top-16 right-4 z-40 w-80 md:w-96 bg-chalkboard-surface/95 backdrop-blur border border-accent-gold/40 rounded-2xl shadow-2xl p-5 text-chalk-white animate-node-in"
    >
      <div className="flex items-center justify-between pb-3 border-b border-chalkboard-border">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-accent-gold/20 text-accent-gold">
            <Lightbulb className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-chalk text-base font-bold text-accent-gold leading-tight">
              High-Yield Study Tips
            </h2>
            <p className="text-[10px] text-chalk-muted truncate max-w-[180px]">
              {examTitle}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-chalk-muted hover:text-chalk-white hover:bg-chalkboard-surfaceHover transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="mt-3 space-y-2.5 max-h-[70vh] overflow-y-auto pr-1">
        {tips.map((tip, index) => (
          <div
            key={index}
            className="p-3 rounded-xl bg-chalkboard-bg/90 border border-chalkboard-border text-xs leading-relaxed text-chalk-white/90 relative group hover:border-accent-gold/40 transition-colors"
          >
            <div className="flex items-start gap-2.5">
              <span className="font-chalk text-accent-gold font-bold text-sm leading-none mt-0.5">
                #{index + 1}
              </span>
              <p className="font-sans text-xs">{tip}</p>
            </div>
          </div>
        ))}

        <div className="pt-2 flex items-center justify-center gap-1.5 text-[11px] text-accent-teal font-sans">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Curated for active recall & spaced practice</span>
        </div>
      </div>
    </aside>
  );
};
