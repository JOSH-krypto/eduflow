import React from 'react';
import { Target, Sparkles, ArrowUpRight } from 'lucide-react';
import { Course } from '../../types/eduflow';
import { getBreakdownCounts, getMilestoneSummary } from '../../utils/dateUtils';

interface ExamReadinessCardProps {
  course: Course;
  onOpenStudyPath?: () => void;
}

export const ExamReadinessCard: React.FC<ExamReadinessCardProps> = ({
  course,
  onOpenStudyPath,
}) => {
  const breakdown = getBreakdownCounts(course.phases);
  const milestone = getMilestoneSummary(course.phases);

  return (
    <div className="rounded-2xl bg-[#141416] border border-white/[0.08] shadow-card p-5 sm:p-6 transition-all hover:border-white/[0.14]">
      {/* Top Header: Readiness Label & Percentage */}
      <div className="flex items-center justify-between gap-4 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#2DD4BF]/10 text-[#2DD4BF] border border-[#2DD4BF]/20">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider font-heading">
              Exam Readiness
            </h3>
            <span className="text-xs text-zinc-300 font-medium">
              Curriculum completion & mastery
            </span>
          </div>
        </div>

        {/* Big percentage number */}
        <div className="flex items-baseline gap-1">
          <span className="text-3xl sm:text-4xl font-extrabold text-white font-heading tracking-tight">
            {breakdown.overallPercent}%
          </span>
        </div>
      </div>

      {/* Sleek Progress Bar */}
      <div className="h-3 w-full rounded-full bg-white/[0.06] overflow-hidden p-0.5 relative my-3">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#2DD4BF] via-[#14B8A6] to-[#F5A623] transition-all duration-700 shadow-sm"
          style={{ width: `${breakdown.overallPercent}%` }}
        />
      </div>

      {/* Breakdown Row underneath (explains the number) */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/[0.06] text-xs font-sans">
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap text-zinc-300 font-medium">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-sky-400" />
            <span>Topics <strong className="text-white font-mono">{breakdown.topicsCompleted}/{breakdown.topicsTotal}</strong></span>
          </span>
          <span className="text-zinc-600">•</span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#F5A623]" />
            <span>Labs <strong className="text-white font-mono">{breakdown.labsCompleted}/{breakdown.labsTotal}</strong></span>
          </span>
          <span className="text-zinc-600">•</span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#2DD4BF]" />
            <span>Practice <strong className="text-white font-mono">{breakdown.practiceCompleted}/{breakdown.practiceTotal}</strong></span>
          </span>
        </div>

        {onOpenStudyPath && (
          <button
            onClick={onOpenStudyPath}
            className="text-[11px] font-semibold text-[#2DD4BF] hover:text-[#14B8A6] flex items-center gap-1 transition-colors"
          >
            <span>Full Syllabus</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Next Milestone Line underneath to make progress feel like a path */}
      <div className="mt-3.5 px-3 py-2 rounded-xl bg-[#2DD4BF]/[0.06] border border-[#2DD4BF]/15 flex items-center gap-2 text-xs text-[#2DD4BF]">
        <Sparkles className="w-3.5 h-3.5 flex-shrink-0 text-[#2DD4BF]" />
        <span className="font-medium text-zinc-200 truncate flex-1">
          <strong className="text-[#2DD4BF]">Next milestone:</strong> {milestone}
        </span>
      </div>
    </div>
  );
};
