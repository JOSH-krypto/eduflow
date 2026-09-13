import React from 'react';
import { PlanEntry, ExamPlan } from '../../types/plan';
import { formatDate } from '../../utils/dateUtils';
import { ChevronRight, Calendar, CheckCircle2, Target, Sparkles } from 'lucide-react';

interface EntryColumnProps {
  entries: PlanEntry[];
  selectedEntryId: string | null;
  onSelectEntry: (entryId: string) => void;
  exam: ExamPlan;
  isTodayMode?: boolean;
}

export const EntryColumn: React.FC<EntryColumnProps> = ({
  entries,
  selectedEntryId,
  onSelectEntry,
  exam,
  isTodayMode,
}) => {
  const todayStr = formatDate(new Date());

  if (entries.length === 0) {
    return (
      <div className="flex flex-col gap-3 w-80 flex-shrink-0 animate-node-in">
        <div className="text-xs font-mono uppercase tracking-wider text-chalk-muted font-semibold px-1">
          Days &amp; Focus Blocks
        </div>
        <div className="p-6 rounded-2xl bg-chalkboard-surface border border-chalkboard-border text-center text-chalk-muted text-xs">
          <Sparkles className="w-6 h-6 text-accent-teal mx-auto mb-2 opacity-60" />
          <p className="font-semibold text-chalk-white">No sessions scheduled for today</p>
          <p className="mt-1 text-[11px]">Select a Phase branch from the left to view planned study days.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 w-80 flex-shrink-0 animate-node-in">
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-mono uppercase tracking-wider text-chalk-muted font-semibold">
          {isTodayMode ? "Today's Schedule" : 'Days & Focus Blocks'}
        </span>
        <span className="text-[11px] text-chalk-subtle">
          {entries.length} {entries.length === 1 ? 'block' : 'blocks'}
        </span>
      </div>

      {entries.map((entry) => {
        const isSelected = selectedEntryId === entry.id;
        const isEntryToday = entry.date === todayStr;

        // Calculate completed count for this entry
        let totalSessions = entry.sessions.length;
        let doneSessions = 0;
        let totalEntryHours = 0;

        entry.sessions.forEach(s => {
          totalEntryHours += s.hours;
          if (exam.completedSessionIds?.[s.id]) {
            doneSessions++;
          }
        });

        const isAllDone = totalSessions > 0 && doneSessions === totalSessions;

        return (
          <div
            key={entry.id}
            id={`entry-node-${entry.id}`}
            onClick={() => onSelectEntry(entry.id)}
            className={`relative p-3.5 rounded-xl cursor-pointer transition-all duration-200 border text-left group ${
              isSelected
                ? 'bg-accent-gold/15 border-accent-gold shadow-chalkActive scale-[1.02]'
                : isAllDone
                ? 'bg-chalkboard-surface hover:bg-chalkboard-surfaceHover border-accent-teal/40 opacity-90 shadow-chalk'
                : 'bg-chalkboard-surface hover:bg-chalkboard-surfaceHover border-chalkboard-border shadow-chalk'
            }`}
          >
            {/* Header: Label + Date */}
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className={`text-xs font-bold font-sans ${isSelected ? 'text-accent-gold' : 'text-chalk-white'}`}>
                    {entry.label}
                  </span>
                  {isEntryToday && (
                    <span className="text-[9px] font-mono px-1.5 py-0.2 bg-accent-gold/20 text-accent-gold font-bold rounded">
                      TODAY
                    </span>
                  )}
                </div>

                {entry.date && (
                  <div className="text-[10px] text-chalk-muted font-mono flex items-center gap-1 mt-0.5">
                    <Calendar className="w-2.5 h-2.5 text-accent-blue" />
                    <span>{entry.date}</span>
                  </div>
                )}
              </div>

              <ChevronRight className={`w-4 h-4 transition-transform ${isSelected ? 'text-accent-gold translate-x-0.5' : 'text-chalk-muted group-hover:text-chalk-white'}`} />
            </div>

            {/* Focus subtitle */}
            <div className="mt-2 text-xs text-chalk-white/90 flex items-start gap-1.5">
              <Target className="w-3.5 h-3.5 text-accent-teal flex-shrink-0 mt-0.5" />
              <span className="line-clamp-2 font-medium leading-snug">{entry.focus}</span>
            </div>

            {/* Footer metrics */}
            <div className="mt-2.5 pt-2 border-t border-chalkboard-border flex items-center justify-between text-[11px] text-chalk-muted">
              <span>{totalSessions} {totalSessions === 1 ? 'session' : 'sessions'} • {totalEntryHours}h</span>
              <span className={`font-semibold flex items-center gap-1 ${isAllDone ? 'text-accent-teal' : 'text-chalk-white'}`}>
                {isAllDone && <CheckCircle2 className="w-3 h-3 text-accent-teal" />}
                {doneSessions}/{totalSessions} done
              </span>
            </div>

            {/* Anchors for SVG connector curves */}
            <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-chalk-muted border-2 border-chalkboard-bg" />
            {isSelected && (
              <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-accent-gold border-2 border-chalkboard-bg shadow-sm" />
            )}
          </div>
        );
      })}
    </div>
  );
};
