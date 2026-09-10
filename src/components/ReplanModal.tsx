import React from 'react';
import { ExamPlan } from '../types/plan';
import { Sparkles, X, CheckCircle2, Circle, AlertCircle, Calendar } from 'lucide-react';
import { formatDate } from '../data/sampleExams';

interface ReplanModalProps {
  isOpen: boolean;
  onClose: () => void;
  exam: ExamPlan;
  onConfirmReplan: () => Promise<void>;
  isReplanning: boolean;
}

export const ReplanModal: React.FC<ReplanModalProps> = ({
  isOpen,
  onClose,
  exam,
  onConfirmReplan,
  isReplanning,
}) => {
  if (!isOpen) return null;

  const todayStr = formatDate(new Date());

  // Extract completed topics vs outstanding topics
  const completedTopicsList: string[] = [];
  const outstandingTopicsList: string[] = [];

  const rawSyllabusTopics = exam.syllabus
    .split('\n')
    .map(t => t.trim())
    .filter(t => t.length > 0);

  // Check which sessions were checked
  const checkedTopics = new Set<string>();
  exam.phases.forEach(phase => {
    phase.entries.forEach(entry => {
      entry.sessions.forEach(session => {
        if (exam.completedSessionIds?.[session.id]) {
          checkedTopics.add(session.topic.toLowerCase());
        }
      });
    });
  });

  rawSyllabusTopics.forEach(topic => {
    const clean = topic.replace(/\(hard\)/i, '').trim().toLowerCase();
    const isCompleted = Array.from(checkedTopics).some(ct => ct.includes(clean) || clean.includes(ct));
    if (isCompleted) {
      completedTopicsList.push(topic);
    } else {
      outstandingTopicsList.push(topic);
    }
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-chalkboard-darkest/80 backdrop-blur-sm">
      <div 
        className="relative w-full max-w-xl bg-chalkboard-surface border border-chalkboard-borderStrong rounded-2xl shadow-2xl p-6 text-chalk-white animate-node-in font-sans"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-chalkboard-border">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-accent-gold/20 text-accent-gold border border-accent-gold/30">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-chalk text-xl font-bold text-chalk-white">
                Replan Remaining Days
              </h2>
              <p className="text-[11px] text-chalk-muted">
                Dynamic AI rescheduling tailored to your actual progress
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isReplanning}
            className="p-1.5 rounded-lg text-chalk-muted hover:text-chalk-white hover:bg-chalkboard-surfaceHover transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 space-y-4 text-xs">
          
          <div className="p-3 rounded-xl bg-chalkboard-bg border border-chalkboard-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-accent-blue" />
              <div>
                <span className="text-chalk-muted">Today: </span>
                <span className="font-semibold text-chalk-white">{todayStr}</span>
              </div>
            </div>
            <div>
              <span className="text-chalk-muted">Target Exam: </span>
              <span className="font-semibold text-accent-gold">{exam.examDate}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Completed Topics summary */}
            <div className="p-3 rounded-xl bg-chalkboard-bg border border-accent-teal/30">
              <div className="flex items-center gap-1.5 font-semibold text-accent-teal mb-2">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Completed ({completedTopicsList.length})</span>
              </div>
              <ul className="space-y-1 max-h-32 overflow-y-auto text-[11px] text-chalk-muted">
                {completedTopicsList.length > 0 ? (
                  completedTopicsList.map((t, idx) => (
                    <li key={idx} className="line-through truncate text-chalk-muted/80">
                      ✓ {t}
                    </li>
                  ))
                ) : (
                  <li className="italic text-chalk-muted/60">No completed topics yet</li>
                )}
              </ul>
            </div>

            {/* Remaining Topics summary */}
            <div className="p-3 rounded-xl bg-chalkboard-bg border border-accent-gold/30">
              <div className="flex items-center gap-1.5 font-semibold text-accent-gold mb-2">
                <Circle className="w-3.5 h-3.5" />
                <span>Remaining ({outstandingTopicsList.length})</span>
              </div>
              <ul className="space-y-1 max-h-32 overflow-y-auto text-[11px] text-chalk-white">
                {outstandingTopicsList.length > 0 ? (
                  outstandingTopicsList.map((t, idx) => (
                    <li key={idx} className="truncate">
                      • {t}
                    </li>
                  ))
                ) : (
                  <li className="italic text-accent-teal">All topics mastered!</li>
                )}
              </ul>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-accent-gold/10 border border-accent-gold/30 text-chalk-white text-[11px] flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-accent-gold flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-accent-gold">Preserved Records:</p>
              <p className="text-chalk-muted mt-0.5">
                Your daily study streak and all-time total hours studied will remain strictly intact. Only the remaining upcoming schedule nodes will be regenerated by AI.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isReplanning}
              className="px-4 py-2 rounded-xl text-xs font-medium text-chalk-muted hover:text-chalk-white"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={onConfirmReplan}
              disabled={isReplanning}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent-gold hover:bg-accent-gold/90 text-chalkboard-darkest font-bold text-xs shadow-lg transition-transform active:scale-95 disabled:opacity-50"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isReplanning ? 'animate-spin' : ''}`} />
              <span>{isReplanning ? 'Optimizing Schedule...' : 'Confirm Replan'}</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
