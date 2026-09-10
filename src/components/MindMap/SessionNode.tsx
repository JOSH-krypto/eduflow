import React from 'react';
import { StudySession } from '../../types/plan';
import { Check, X, Clock } from 'lucide-react';

interface SessionNodeProps {
  session: StudySession;
  isCompleted: boolean;
  onToggleComplete: (sessionId: string, hours: number, completed: boolean) => void;
  onDelete: (sessionId: string) => void;
}

export const SessionNode: React.FC<SessionNodeProps> = ({
  session,
  isCompleted,
  onToggleComplete,
  onDelete,
}) => {
  const getModeBadgeClass = (mode: string) => {
    switch (mode) {
      case 'practice':
        return 'bg-accent-teal/20 text-accent-teal border-accent-teal/40';
      case 'revise':
        return 'bg-accent-gold/20 text-accent-gold border-accent-gold/40';
      case 'learn':
      default:
        return 'bg-accent-blue/20 text-accent-blue border-accent-blue/40';
    }
  };

  return (
    <div
      id={`session-node-${session.id}`}
      className={`relative p-3 rounded-xl transition-all duration-200 border text-left group flex items-center justify-between gap-3 ${
        isCompleted
          ? 'bg-chalkboard-surface/70 border-accent-teal/40 shadow-sm opacity-85'
          : 'bg-chalkboard-surface hover:bg-chalkboard-surfaceHover border-chalkboard-border shadow-chalk hover:border-chalkboard-borderStrong'
      }`}
    >
      {/* Left connector anchor dot */}
      <div className={`absolute -left-1.5 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full border-2 border-chalkboard-bg transition-colors ${
        isCompleted ? 'bg-accent-teal' : 'bg-chalk-muted'
      }`} />

      {/* Checkbox + Topic text */}
      <div className="flex items-center gap-2.5 flex-1 min-w-0">
        
        {/* Custom Chalk Checkbox */}
        <button
          type="button"
          onClick={() => onToggleComplete(session.id, session.hours, !isCompleted)}
          className={`w-5 h-5 rounded-md flex items-center justify-center transition-all flex-shrink-0 border ${
            isCompleted
              ? 'bg-accent-teal border-accent-teal text-chalkboard-darkest shadow-sm'
              : 'border-chalk-muted/60 hover:border-accent-teal/80 bg-chalkboard-bg'
          }`}
          title={isCompleted ? 'Mark as incomplete' : 'Mark as completed'}
        >
          {isCompleted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
        </button>

        {/* Topic Title */}
        <div className="min-w-0 flex-1">
          <p className={`text-xs font-medium truncate transition-colors ${
            isCompleted ? 'line-through text-chalk-muted' : 'text-chalk-white group-hover:text-chalk-white'
          }`}>
            {session.topic}
          </p>
          {session.isCustom && (
            <span className="text-[9px] text-accent-gold font-mono uppercase">
              Custom
            </span>
          )}
        </div>
      </div>

      {/* Right Side: Hours + Mode Badge + Delete Button */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        
        {/* Hours Badge */}
        <span className="flex items-center gap-1 text-[11px] font-mono px-1.5 py-0.5 rounded bg-chalkboard-bg border border-chalkboard-border text-chalk-muted">
          <Clock className="w-2.5 h-2.5 text-accent-gold" />
          <span>{session.hours}h</span>
        </span>

        {/* Mode Tag */}
        <span className={`text-[9px] font-mono uppercase font-bold px-1.5 py-0.5 rounded border ${getModeBadgeClass(session.mode)}`}>
          {session.mode}
        </span>

        {/* Delete Session "×" Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(session.id);
          }}
          className="w-5 h-5 rounded flex items-center justify-center text-chalk-subtle hover:text-accent-red hover:bg-accent-red/15 transition-colors opacity-0 group-hover:opacity-100"
          title="Delete study session"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
