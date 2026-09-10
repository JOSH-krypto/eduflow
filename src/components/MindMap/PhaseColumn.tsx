import React from 'react';
import { ExamPlan } from '../../types/plan';
import { formatDate } from '../../data/sampleExams';
import { Sparkles, Calendar, ChevronRight, CheckCircle2 } from 'lucide-react';

interface PhaseColumnProps {
  exam: ExamPlan;
  selectedPhaseId: string | null; // 'today' or phase.id
  onSelectPhase: (phaseId: string) => void;
}

export const PhaseColumn: React.FC<PhaseColumnProps> = ({
  exam,
  selectedPhaseId,
  onSelectPhase,
}) => {
  const todayStr = formatDate(new Date());

  // Count how many sessions are scheduled for today
  let todaySessionsCount = 0;
  let todayDoneCount = 0;

  exam.phases.forEach(phase => {
    phase.entries.forEach(entry => {
      if (entry.date === todayStr) {
        entry.sessions.forEach(session => {
          todaySessionsCount++;
          if (exam.completedSessionIds?.[session.id]) {
            todayDoneCount++;
          }
        });
      }
    });
  });

  const isTodaySelected = selectedPhaseId === 'today';

  return (
    <div className="flex flex-col gap-3 w-72 flex-shrink-0">
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-mono uppercase tracking-wider text-chalk-muted font-semibold">
          Branches (Phases)
        </span>
        <span className="text-[11px] text-chalk-subtle">
          1 active branch
        </span>
      </div>

      {/* Special "Today" Branch Node */}
      <div
        id="phase-node-today"
        onClick={() => onSelectPhase('today')}
        className={`relative p-3.5 rounded-xl cursor-pointer transition-all duration-200 border text-left group ${
          isTodaySelected
            ? 'bg-accent-teal/20 border-accent-teal shadow-chalkTeal scale-[1.02]'
            : 'bg-chalkboard-surface hover:bg-chalkboard-surfaceHover border-accent-teal/40 shadow-chalk'
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg ${isTodaySelected ? 'bg-accent-teal text-chalkboard-darkest' : 'bg-accent-teal/20 text-accent-teal'}`}>
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-chalk text-base font-bold text-accent-teal">
                  Today&apos;s Focus
                </span>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-accent-teal/20 text-accent-teal font-semibold">
                  LIVE
                </span>
              </div>
              <div className="text-[11px] text-chalk-muted font-mono">
                {todayStr}
              </div>
            </div>
          </div>
          <ChevronRight className={`w-4 h-4 transition-transform ${isTodaySelected ? 'text-accent-teal translate-x-0.5' : 'text-chalk-muted group-hover:text-chalk-white'}`} />
        </div>

        <div className="mt-2 pt-2 border-t border-chalkboard-border flex items-center justify-between text-xs text-chalk-muted">
          <span>{todaySessionsCount} {todaySessionsCount === 1 ? 'session' : 'sessions'} due</span>
          {todaySessionsCount > 0 && (
            <span className={`text-[11px] font-semibold ${todayDoneCount === todaySessionsCount ? 'text-accent-teal' : 'text-accent-gold'}`}>
              {todayDoneCount}/{todaySessionsCount} done
            </span>
          )}
        </div>

        {/* Anchors for SVG curves */}
        <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-chalk-muted border-2 border-chalkboard-bg" />
        {isTodaySelected && (
          <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-accent-teal border-2 border-chalkboard-bg shadow-sm" />
        )}
      </div>

      {/* Standard Phase Branch Nodes */}
      {exam.phases.map((phase, pIdx) => {
        const isSelected = selectedPhaseId === phase.id;

        // Calculate phase progress
        let phaseTotal = 0;
        let phaseDone = 0;
        let phaseHours = 0;

        phase.entries.forEach(e => {
          e.sessions.forEach(s => {
            phaseTotal++;
            phaseHours += s.hours;
            if (exam.completedSessionIds?.[s.id]) {
              phaseDone++;
            }
          });
        });

        const isPhaseComplete = phaseTotal > 0 && phaseDone === phaseTotal;

        return (
          <div
            key={phase.id}
            id={`phase-node-${phase.id}`}
            onClick={() => onSelectPhase(phase.id)}
            className={`relative p-3.5 rounded-xl cursor-pointer transition-all duration-200 border text-left group ${
              isSelected
                ? 'bg-accent-gold/15 border-accent-gold shadow-chalkActive scale-[1.02]'
                : isPhaseComplete
                ? 'bg-chalkboard-surface hover:bg-chalkboard-surfaceHover border-accent-teal/30 shadow-chalk opacity-90'
                : 'bg-chalkboard-surface hover:bg-chalkboard-surfaceHover border-chalkboard-border shadow-chalk'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-chalk font-bold text-xs ${
                  isSelected 
                    ? 'bg-accent-gold text-chalkboard-darkest' 
                    : isPhaseComplete
                    ? 'bg-accent-teal/20 text-accent-teal'
                    : 'bg-chalkboard-bg text-chalk-muted'
                }`}>
                  {pIdx + 1}
                </span>
                <div>
                  <h3 className={`font-chalk text-sm font-bold truncate max-w-[170px] ${
                    isSelected ? 'text-accent-gold' : 'text-chalk-white'
                  }`}>
                    {phase.label}
                  </h3>
                  {phase.dateRange && (
                    <div className="text-[10px] text-chalk-muted font-mono flex items-center gap-1 mt-0.5">
                      <Calendar className="w-2.5 h-2.5 text-accent-blue" />
                      <span>{phase.dateRange}</span>
                    </div>
                  )}
                </div>
              </div>

              <ChevronRight className={`w-4 h-4 transition-transform ${isSelected ? 'text-accent-gold translate-x-0.5' : 'text-chalk-muted group-hover:text-chalk-white'}`} />
            </div>

            <div className="mt-2 pt-2 border-t border-chalkboard-border flex items-center justify-between text-[11px] text-chalk-muted">
              <span>{phase.entries.length} {phase.entries.length === 1 ? 'entry' : 'entries'} • {phaseHours}h</span>
              <span className={`font-semibold flex items-center gap-1 ${isPhaseComplete ? 'text-accent-teal' : 'text-chalk-white'}`}>
                {isPhaseComplete && <CheckCircle2 className="w-3 h-3 text-accent-teal" />}
                {phaseDone}/{phaseTotal}
              </span>
            </div>

            {/* Anchors for SVG curves */}
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
