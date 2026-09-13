import React from 'react';
import { ExamPlan } from '../../types/plan';
import { formatDate } from '../../utils/dateUtils';
import { Clock, Award } from 'lucide-react';

interface RootNodeProps {
  exam: ExamPlan;
  rootRef?: React.RefObject<HTMLDivElement>;
}

export const RootNode: React.FC<RootNodeProps> = ({ exam, rootRef }) => {
  const today = new Date();
  const examDate = new Date(exam.examDate);
  const diffTime = examDate.getTime() - today.getTime();
  const diffDays = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  // Calculate metrics
  let totalSessions = 0;
  let completedSessions = 0;
  let totalHours = 0;
  let completedHours = 0;

  exam.phases.forEach(phase => {
    phase.entries.forEach(entry => {
      entry.sessions.forEach(session => {
        totalSessions++;
        totalHours += session.hours;
        if (exam.completedSessionIds?.[session.id]) {
          completedSessions++;
          completedHours += session.hours;
        }
      });
    });
  });

  const percent = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0;
  
  // SVG Circle calculations
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  return (
    <div
      ref={rootRef}
      id="mindmap-root-node"
      className="relative w-80 flex-shrink-0 bg-chalkboard-surface border border-accent-gold/40 rounded-2xl p-5 shadow-chalk active:shadow-chalkActive transition-all"
    >
      {/* Chalkboard Card Glow accent */}
      <div className="absolute -top-px left-8 right-8 h-px bg-gradient-to-r from-transparent via-accent-gold to-transparent" />
      
      {/* Node Tag */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-mono uppercase tracking-widest text-accent-gold font-bold px-2 py-0.5 rounded bg-accent-gold/15 border border-accent-gold/30">
          Target Exam
        </span>
        <span className="text-[11px] font-mono text-chalk-muted">
          {formatDate(today)}
        </span>
      </div>

      {/* Exam Title */}
      <h2 className="font-chalk text-xl font-bold text-chalk-white leading-tight line-clamp-2 mt-1" title={exam.title}>
        {exam.title}
      </h2>

      {/* Hero Countdown Number in Kalam font */}
      <div className="my-4 p-3.5 rounded-xl bg-chalkboard-bg/90 border border-chalkboard-border flex items-center justify-between">
        <div>
          <div className="text-[10px] text-chalk-muted uppercase tracking-wider font-semibold">Countdown</div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-chalk text-3xl font-bold text-accent-gold leading-none">
              {diffDays}
            </span>
            <span className="text-xs text-chalk-white font-medium">
              {diffDays === 1 ? 'day until exam' : 'days until exam'}
            </span>
          </div>
          <div className="text-[10px] text-chalk-muted font-mono mt-0.5">
            Date: {exam.examDate}
          </div>
        </div>

        {/* Circular Progress Ring */}
        <div className="relative w-20 h-20 flex items-center justify-center flex-shrink-0">
          <svg className="w-20 h-20 -rotate-90 transform">
            <circle
              cx="40"
              cy="40"
              r={radius}
              stroke="rgba(236, 231, 218, 0.08)"
              strokeWidth="6"
              fill="transparent"
            />
            <circle
              cx="40"
              cy="40"
              r={radius}
              stroke="#6FB8AA"
              strokeWidth="6"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-500 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-xs font-bold text-accent-teal leading-none">
              {percent}%
            </span>
            <span className="text-[9px] text-chalk-muted leading-none mt-0.5">
              done
            </span>
          </div>
        </div>
      </div>

      {/* Progress Stats Summary */}
      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-chalkboard-border text-xs">
        <div className="flex items-center gap-1.5 text-chalk-muted">
          <Award className="w-3.5 h-3.5 text-accent-gold" />
          <span>
            <strong className="text-chalk-white">{completedSessions}</strong>/{totalSessions} sessions
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-chalk-muted">
          <Clock className="w-3.5 h-3.5 text-accent-teal" />
          <span>
            <strong className="text-chalk-white">{Math.round(completedHours * 10) / 10}</strong>/{Math.round(totalHours * 10) / 10} hrs
          </span>
        </div>
      </div>

      {/* Right Connector Anchor Dot */}
      <div 
        id="root-connector-anchor"
        className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-accent-gold border-2 border-chalkboard-bg shadow-sm z-10" 
      />
    </div>
  );
};
