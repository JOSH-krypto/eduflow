import React from 'react';
import { ExamPlan } from '../types/plan';
import { formatDate } from '../data/sampleExams';
import { Printer, ArrowLeft, CheckSquare, Square, Sparkles } from 'lucide-react';

interface PrintViewProps {
  exam: ExamPlan;
  onBackToMindMap: () => void;
  onPrint: () => void;
}

export const PrintView: React.FC<PrintViewProps> = ({
  exam,
  onBackToMindMap,
  onPrint,
}) => {
  const todayStr = formatDate(new Date());

  // Calculate stats
  let totalSessions = 0;
  let completedCount = 0;
  let totalHours = 0;
  let completedHours = 0;

  exam.phases.forEach(phase => {
    phase.entries.forEach(entry => {
      entry.sessions.forEach(session => {
        totalSessions++;
        totalHours += session.hours;
        if (exam.completedSessionIds?.[session.id]) {
          completedCount++;
          completedHours += session.hours;
        }
      });
    });
  });

  const percentComplete = totalSessions > 0 ? Math.round((completedCount / totalSessions) * 100) : 0;

  return (
    <div className="min-h-screen bg-chalkboard-bg text-chalk-white p-4 md:p-8">
      
      {/* On-screen Toolbar (Hidden during print) */}
      <div className="no-print max-w-4xl mx-auto mb-6 flex items-center justify-between bg-chalkboard-surface border border-chalkboard-border rounded-xl p-4 shadow-lg">
        <button
          onClick={onBackToMindMap}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-chalkboard-bg hover:bg-chalkboard-surfaceHover text-chalk-white border border-chalkboard-border text-xs font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-accent-gold" />
          <span>Back to Mind Map</span>
        </button>

        <div className="flex items-center gap-3">
          <div className="text-xs text-chalk-muted">
            Flat outline optimized for physical study binder or PDF export.
          </div>
          <button
            onClick={onPrint}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-accent-gold hover:bg-accent-gold/90 text-chalkboard-darkest text-xs font-bold shadow-md transition-transform active:scale-95"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save as PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Sheet Container */}
      <div className="max-w-4xl mx-auto bg-chalkboard-surface print:bg-white print:text-black print:shadow-none print:border-none border border-chalkboard-border rounded-2xl p-6 md:p-10 shadow-2xl">
        
        {/* Document Header */}
        <div className="border-b border-chalkboard-border print:border-gray-300 pb-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div>
              <span className="text-xs uppercase tracking-widest text-accent-gold print:text-gray-600 font-semibold">
                Exam Preparation Study Plan
              </span>
              <h1 className="font-chalk text-3xl font-bold text-chalk-white print:text-black mt-1">
                {exam.title}
              </h1>
              <p className="text-xs text-chalk-muted print:text-gray-600 mt-1">
                Generated: {todayStr} • Target Exam: <span className="font-semibold text-accent-gold print:text-black">{exam.examDate}</span>
              </p>
            </div>

            {/* Quick Progress Metrics */}
            <div className="flex items-center gap-4 bg-chalkboard-bg print:bg-gray-100 p-3.5 rounded-xl border border-chalkboard-border print:border-gray-300 text-xs">
              <div>
                <div className="text-chalk-muted print:text-gray-500 text-[10px] uppercase font-semibold">Progress</div>
                <div className="font-bold text-accent-gold print:text-black text-sm">{percentComplete}% Done</div>
              </div>
              <div className="h-6 w-px bg-chalkboard-border print:bg-gray-300" />
              <div>
                <div className="text-chalk-muted print:text-gray-500 text-[10px] uppercase font-semibold">Sessions</div>
                <div className="font-bold text-chalk-white print:text-black text-sm">{completedCount} / {totalSessions}</div>
              </div>
              <div className="h-6 w-px bg-chalkboard-border print:bg-gray-300" />
              <div>
                <div className="text-chalk-muted print:text-gray-500 text-[10px] uppercase font-semibold">Total Time</div>
                <div className="font-bold text-accent-teal print:text-black text-sm">{completedHours}h / {totalHours}h</div>
              </div>
            </div>
          </div>
        </div>

        {/* Outline Body */}
        <div className="space-y-8">
          {exam.phases.map((phase, pIdx) => (
            <div key={phase.id || pIdx} className="print-phase">
              
              {/* Phase Header */}
              <div className="flex items-center justify-between pb-2 border-b border-chalkboard-border print:border-gray-300 mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-accent-gold/20 print:bg-gray-200 text-accent-gold print:text-black font-chalk font-bold text-xs flex items-center justify-center">
                    {pIdx + 1}
                  </span>
                  <h2 className="font-chalk text-xl font-bold text-chalk-white print:text-black">
                    {phase.label}
                  </h2>
                </div>
                {phase.dateRange && (
                  <span className="text-xs font-mono text-accent-teal print:text-gray-600 bg-chalkboard-bg print:bg-transparent px-2.5 py-1 rounded-md border border-chalkboard-border print:border-none">
                    {phase.dateRange}
                  </span>
                )}
              </div>

              {/* Entries */}
              <div className="space-y-4 pl-2 md:pl-4">
                {phase.entries.map((entry, eIdx) => (
                  <div 
                    key={entry.id || eIdx}
                    className="p-3.5 rounded-xl bg-chalkboard-bg/70 print:bg-gray-50 border border-chalkboard-border print:border-gray-200"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-accent-gold print:text-black font-sans">
                          {entry.label}
                        </span>
                        {entry.date && (
                          <span className="text-[11px] text-chalk-muted print:text-gray-500 font-mono">
                            ({entry.date})
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-chalk-muted print:text-gray-600 italic">
                        {entry.focus}
                      </span>
                    </div>

                    {/* Sessions list */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                      {entry.sessions.map((session, sIdx) => {
                        const isDone = exam.completedSessionIds?.[session.id];
                        return (
                          <div
                            key={session.id || sIdx}
                            className={`flex items-center justify-between p-2 rounded-lg border text-xs ${
                              isDone
                                ? 'bg-accent-teal/10 border-accent-teal/30 print:bg-gray-100 print:border-gray-300'
                                : 'bg-chalkboard-surface print:bg-white border-chalkboard-border print:border-gray-200'
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate pr-2">
                              {isDone ? (
                                <CheckSquare className="w-4 h-4 text-accent-teal print:text-black flex-shrink-0" />
                              ) : (
                                <Square className="w-4 h-4 text-chalk-muted print:text-gray-400 flex-shrink-0" />
                              )}
                              <span className={`truncate font-medium ${isDone ? 'line-through text-chalk-muted print:text-gray-500' : 'text-chalk-white print:text-black'}`}>
                                {session.topic}
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5 flex-shrink-0">
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-chalkboard-bg print:bg-gray-200 text-chalk-muted print:text-gray-700">
                                {session.hours}h
                              </span>
                              <span className={`text-[9px] uppercase px-1.5 py-0.5 rounded font-semibold ${
                                session.mode === 'practice'
                                  ? 'bg-accent-teal/20 text-accent-teal print:text-black print:bg-gray-200'
                                  : session.mode === 'revise'
                                  ? 'bg-accent-gold/20 text-accent-gold print:text-black print:bg-gray-200'
                                  : 'bg-accent-blue/20 text-accent-blue print:text-black print:bg-gray-200'
                              }`}>
                                {session.mode}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

            </div>
          ))}
        </div>

        {/* Curated Tips Section */}
        {exam.tips && exam.tips.length > 0 && (
          <div className="mt-8 pt-6 border-t border-chalkboard-border print:border-gray-300">
            <h3 className="font-chalk text-lg font-bold text-accent-gold print:text-black flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4" />
              Strategic Study Guidelines
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {exam.tips.map((tip, idx) => (
                <div 
                  key={idx}
                  className="p-3 rounded-xl bg-chalkboard-bg print:bg-gray-50 border border-chalkboard-border print:border-gray-200 text-xs text-chalk-muted print:text-gray-700 leading-relaxed"
                >
                  <span className="font-semibold text-accent-gold print:text-black mr-1.5">#{idx + 1}</span>
                  {tip}
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
