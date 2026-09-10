import React, { useState } from 'react';
import { 
  Map, 
  Check, 
  Play, 
  BookOpen, 
  Video, 
  Terminal, 
  HelpCircle, 
  ChevronDown, 
  ChevronRight,
  Filter 
} from 'lucide-react';
import { Course, Phase, SubTopic, TaskType } from '../../types/eduflow';

interface StudyPathViewProps {
  course: Course;
  onToggleSubTopic: (phaseId: string, subTopicId: string) => void;
  onStartStudyTopic: (title: string, phase: Phase, subtopic?: SubTopic) => void;
}

export const StudyPathView: React.FC<StudyPathViewProps> = ({
  course,
  onToggleSubTopic,
  onStartStudyTopic,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'in_progress' | 'completed' | 'locked'>('all');
  const [expandedPhases, setExpandedPhases] = useState<Record<string, boolean>>({
    'aws-phase-1': true,
    'aws-phase-2': true,
    'aws-phase-3': false,
    'aws-phase-4': false,
  });

  const togglePhaseExpand = (phaseId: string) => {
    setExpandedPhases(prev => ({ ...prev, [phaseId]: !prev[phaseId] }));
  };

  const getTopicIcon = (type?: TaskType) => {
    switch (type) {
      case 'video':
        return <Video className="w-3.5 h-3.5 text-sky-400" />;
      case 'lab':
        return <Terminal className="w-3.5 h-3.5 text-[#F5A623]" />;
      case 'quiz':
      case 'practice':
        return <HelpCircle className="w-3.5 h-3.5 text-[#2DD4BF]" />;
      default:
        return <BookOpen className="w-3.5 h-3.5 text-purple-400" />;
    }
  };

  const filteredPhases = course.phases.filter(phase => {
    if (selectedStatus === 'all') return true;
    return phase.status === selectedStatus;
  });

  const totalLessons = course.phases.reduce((acc, p) => acc + p.subtopics.length, 0);
  const completedLessons = course.phases.reduce(
    (acc, p) => acc + p.subtopics.filter(s => s.completed).length,
    0
  );
  const totalCourseProgress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Page Header Banner */}
      <div className="p-6 sm:p-7 rounded-2xl bg-gradient-to-r from-[#141416] via-[#17171C] to-[#121817] border border-white/[0.08] shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#F5A623]/10 border border-[#F5A623]/25 mb-2">
              <Map className="w-3.5 h-3.5 text-[#F5A623]" />
              <span className="text-[11px] font-semibold text-[#F5A623] uppercase tracking-wider">
                Full Curriculum Roadmap
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white font-display">
              {course.title} Syllabus & Study Path
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Master every domain requirement with structured video lectures, hands-on labs, and practice drills.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-[#18181C] p-3.5 rounded-xl border border-white/[0.06] flex-shrink-0">
            <div className="text-right">
              <span className="text-[11px] uppercase font-bold text-zinc-400 block">
                Total Modules
              </span>
              <span className="text-lg font-bold text-white font-mono">
                {completedLessons}/{totalLessons} <span className="text-xs text-[#2DD4BF]">({totalCourseProgress}%)</span>
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-[#2DD4BF]/10 flex items-center justify-center text-[#2DD4BF] font-extrabold text-sm border border-[#2DD4BF]/25">
              {totalCourseProgress}%
            </div>
          </div>
        </div>

        {/* Filter Navigation Chips */}
        <div className="flex flex-wrap items-center gap-2 mt-6 pt-5 border-t border-white/[0.06]">
          <span className="text-xs font-semibold text-zinc-400 mr-2 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5" />
            Filter Phases:
          </span>
          {(['all', 'in_progress', 'completed', 'locked'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
                selectedStatus === status
                  ? 'bg-[#F5A623] text-black shadow-md'
                  : 'bg-white/[0.05] hover:bg-white/[0.1] text-zinc-300'
              }`}
            >
              {status.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Full Phases Accordion List */}
      <div className="space-y-4">
        {filteredPhases.map((phase) => {
          const isExpanded = expandedPhases[phase.id] ?? false;
          const isCompleted = phase.status === 'completed';
          const isInProgress = phase.status === 'in_progress';

          return (
            <div
              key={phase.id}
              className={`rounded-2xl border transition-all overflow-hidden ${
                isCompleted
                  ? 'bg-[#141416] border-white/[0.08]'
                  : isInProgress
                  ? 'bg-[#141416] border-[#2DD4BF]/40 shadow-lg shadow-[#2DD4BF]/5'
                  : 'bg-[#121214]/60 border-white/[0.04] opacity-75'
              }`}
            >
              {/* Phase Accordion Header */}
              <div
                onClick={() => togglePhaseExpand(phase.id)}
                className="p-5 flex items-center justify-between gap-4 cursor-pointer hover:bg-white/[0.02] transition-colors select-none"
                role="button"
                tabIndex={0}
                aria-expanded={isExpanded}
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-xs ${
                      isCompleted
                        ? 'bg-[#2DD4BF] text-black'
                        : isInProgress
                        ? 'bg-[#2DD4BF] text-black ring-2 ring-[#2DD4BF]/30'
                        : 'bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : phase.phaseNumber}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                        Phase {phase.phaseNumber} · {phase.dateRange}
                      </span>
                      {isInProgress && (
                        <span className="px-1.5 py-0.2 rounded bg-[#2DD4BF]/20 text-[#2DD4BF] text-[10px] font-bold">
                          ACTIVE
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-white font-display truncate mt-0.5">
                      {phase.title}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-4 flex-shrink-0">
                  <div className="hidden sm:flex flex-col items-end">
                    <span className="text-xs font-bold text-white font-mono">{phase.progressPercent}%</span>
                    <span className="text-[10px] text-zinc-500">
                      {phase.subtopics.filter(s => s.completed).length}/{phase.subtopics.length} done
                    </span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-white/[0.04] text-zinc-400">
                    {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </div>
                </div>
              </div>

              {/* Expanded Lesson Subtopic Checklist */}
              {isExpanded && (
                <div className="px-5 pb-5 pt-1 border-t border-white/[0.04] space-y-2.5">
                  <p className="text-xs text-zinc-400 py-1">{phase.description}</p>

                  <div className="divide-y divide-white/[0.04]">
                    {phase.subtopics.map((subtopic) => (
                      <div
                        key={subtopic.id}
                        className="py-2.5 px-2 flex items-center justify-between gap-3 hover:bg-white/[0.02] rounded-xl transition-colors group"
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <button
                            onClick={() => onToggleSubTopic(phase.id, subtopic.id)}
                            className={`w-4 h-4 rounded flex items-center justify-center transition-all ${
                              subtopic.completed
                                ? 'bg-[#2DD4BF] text-black'
                                : 'border border-zinc-600 hover:border-zinc-400'
                            }`}
                            aria-label={subtopic.completed ? 'Mark subtopic incomplete' : 'Mark subtopic complete'}
                          >
                            {subtopic.completed && <Check className="w-3 h-3 stroke-[3]" />}
                          </button>

                          <span
                            onClick={() => onToggleSubTopic(phase.id, subtopic.id)}
                            className={`text-xs cursor-pointer select-none truncate ${
                              subtopic.completed ? 'line-through text-zinc-500' : 'text-zinc-200 group-hover:text-white'
                            }`}
                          >
                            {subtopic.title}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 flex-shrink-0">
                          <span className="flex items-center gap-1 text-[11px] text-zinc-400">
                            {getTopicIcon(subtopic.type)}
                            <span className="capitalize">{subtopic.type || 'Lesson'}</span>
                          </span>
                          <span className="text-[11px] text-zinc-400 font-mono">
                            {subtopic.durationMinutes}m
                          </span>
                          <button
                            onClick={() => onStartStudyTopic(subtopic.title, phase, subtopic)}
                            className="p-1.5 rounded-lg bg-white/[0.05] hover:bg-[#F5A623] hover:text-black text-zinc-300 transition-colors"
                            title="Start study session for this topic"
                            aria-label={`Start study session for ${subtopic.title}`}
                          >
                            <Play className="w-3 h-3 fill-current" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
