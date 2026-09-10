import React from 'react';
import { Map, ArrowRight } from 'lucide-react';
import { Phase, TaskType } from '../../types/eduflow';
import { PhaseCard } from './PhaseCard';
import { CompressedPhaseRow } from './CompressedPhaseRow';
import { getPhaseDynamicDateRange } from '../../utils/dateUtils';

interface LearningPathProps {
  phases: Phase[];
  examDate: string;
  onOpenPhaseDetail: (phase: Phase) => void;
  onStartAction: (actionTitle: string, phase: Phase, taskType?: TaskType) => void;
  onViewAllStudyPath?: () => void;
  filterQuery?: string;
}

export const LearningPath: React.FC<LearningPathProps> = ({
  phases,
  examDate,
  onOpenPhaseDetail,
  onStartAction,
  onViewAllStudyPath,
  filterQuery = '',
}) => {
  // Filter phases if search query present
  const filteredPhases = phases.filter((phase) => {
    if (!filterQuery) return true;
    const q = filterQuery.toLowerCase();
    const matchTitle = phase.title.toLowerCase().includes(q);
    const matchDesc = phase.description.toLowerCase().includes(q);
    const matchTopics = phase.topicsCovered.some(t => t.toLowerCase().includes(q));
    return matchTitle || matchDesc || matchTopics;
  });

  return (
    <section className="space-y-4" aria-labelledby="learning-path-heading">
      {/* Section Header */}
      <div className="flex items-center justify-between gap-4 pb-2 border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#F5A623]/10 text-[#F5A623] border border-[#F5A623]/20">
            <Map className="w-4 h-4" />
          </div>
          <div>
            <h3 id="learning-path-heading" className="text-base sm:text-lg font-extrabold text-white font-heading tracking-tight">
              Learning Path
            </h3>
            <p className="text-xs text-zinc-400 font-sans">
              Sequential certification phases & roadmap milestones
            </p>
          </div>
        </div>

        {onViewAllStudyPath && (
          <button
            onClick={onViewAllStudyPath}
            className="flex items-center gap-1.5 text-xs font-bold text-zinc-400 hover:text-[#F5A623] transition-colors py-1 px-2.5 rounded-lg hover:bg-white/[0.04]"
          >
            <span>Full Syllabus</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Compressed Status Progression: Completed (compact) -> In Progress (big) -> Locked (minimal) */}
      <div className="space-y-3 pt-1">
        {filteredPhases.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-[#141416] border border-white/[0.08] text-zinc-400 text-xs font-sans">
            No study phases matching "{filterQuery}".
          </div>
        ) : (
          filteredPhases.map((phase, idx) => {
            const dynamicDateRange = getPhaseDynamicDateRange(idx, phases.length, examDate);

            if (phase.status === 'in_progress') {
              return (
                <div key={phase.id} className="pt-1 pb-1">
                  <PhaseCard
                    phase={phase}
                    onOpenPhaseDetail={onOpenPhaseDetail}
                    onStartAction={onStartAction}
                    dateRange={dynamicDateRange}
                  />
                </div>
              );
            }

            return (
              <CompressedPhaseRow
                key={phase.id}
                phase={phase}
                onOpenPhaseDetail={onOpenPhaseDetail}
                dateRange={dynamicDateRange}
              />
            );
          })
        )}
      </div>
    </section>
  );
};
