import React from 'react';
import { Play, Clock, ArrowRight, Video, Terminal, BookOpen, HelpCircle } from 'lucide-react';
import { Course, TaskType } from '../../types/eduflow';
import { getDaysUntilExam } from '../../utils/dateUtils';

interface ContinueLearningHeroProps {
  course: Course;
  onResumeTopic: (topicTitle: string, phaseId?: string, taskType?: TaskType) => void;
}

export const ContinueLearningHero: React.FC<ContinueLearningHeroProps> = ({
  course,
  onResumeTopic,
}) => {
  // Find current active item from agenda or the in_progress phase
  const currentTask = course.agenda.find(t => t.status === 'current');
  const inProgressPhase = course.phases.find(p => p.status === 'in_progress') || course.phases[0];

  // Resolve the actual next item
  let nextItemTitle = 'Multi-AZ Auto Scaling & ALB Deployment';
  let nextItemType: TaskType = 'lab';
  let nextItemDuration = 45;
  let phaseNumber = inProgressPhase?.phaseNumber || 2;
  let phaseId = inProgressPhase?.id;

  if (currentTask) {
    nextItemTitle = currentTask.title;
    nextItemType = currentTask.type || 'lab';
    nextItemDuration = currentTask.durationMinutes || 45;
    if (currentTask.phaseId) {
      const p = course.phases.find(phase => phase.id === currentTask.phaseId);
      if (p) {
        phaseNumber = p.phaseNumber;
        phaseId = p.id;
      }
    }
  } else if (inProgressPhase?.upcomingLab) {
    nextItemTitle = inProgressPhase.upcomingLab.title;
    nextItemType = inProgressPhase.upcomingLab.type || 'lab';
    nextItemDuration = parseInt(inProgressPhase.upcomingLab.duration, 10) || 45;
  } else if (inProgressPhase?.nextVideo) {
    nextItemTitle = inProgressPhase.nextVideo.title;
    nextItemType = inProgressPhase.nextVideo.type || 'video';
    nextItemDuration = parseInt(inProgressPhase.nextVideo.duration, 10) || 30;
  }

  // Format type name for display and button
  const typeDisplay = nextItemType === 'video' 
    ? 'Video' 
    : nextItemType === 'lab' 
    ? 'Lab' 
    : nextItemType === 'reading' 
    ? 'Reading' 
    : 'Practice';

  const actionButtonText = `▶ Continue ${typeDisplay}`;

  const daysUntilExam = getDaysUntilExam(course.examDate);

  const getTypeIcon = (type: TaskType) => {
    switch (type) {
      case 'video':
        return <Video className="w-4 h-4 text-sky-400" />;
      case 'lab':
        return <Terminal className="w-4 h-4 text-[#F5A623]" />;
      case 'reading':
        return <BookOpen className="w-4 h-4 text-purple-400" />;
      case 'quiz':
      case 'practice':
        return <HelpCircle className="w-4 h-4 text-[#2DD4BF]" />;
      default:
        return <Play className="w-4 h-4 text-[#F5A623]" />;
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#18181C] via-[#141416] to-[#0F1413] border border-[#F5A623]/30 shadow-2xl p-6 sm:p-8 transition-all duration-300 hover:border-[#F5A623]/50">
      {/* Ambient subtle warm glow */}
      <div 
        className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-[#F5A623]/10 blur-3xl pointer-events-none" 
        aria-hidden="true" 
      />
      <div 
        className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-[#2DD4BF]/5 blur-3xl pointer-events-none" 
        aria-hidden="true" 
      />

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        {/* Main Content Area */}
        <div className="flex-1 max-w-2xl space-y-3.5">
          {/* Top Line: Course name + Days Until Exam */}
          <div className="flex items-center gap-2 flex-wrap text-xs text-zinc-400 font-sans">
            <span className="font-semibold text-zinc-200">
              {course.title}
            </span>
            <span className="text-zinc-600 font-bold">•</span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#F5A623]/15 border border-[#F5A623]/30 text-[#F5A623] font-bold text-[11px] font-heading">
              <Clock className="w-3 h-3 text-[#F5A623]" />
              {daysUntilExam} days until exam
            </span>
          </div>

          {/* Continue where you left off label */}
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#2DD4BF] font-heading block">
              Continue where you left off
            </span>
            {/* The actual next item's title */}
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white font-heading tracking-tight mt-1 leading-snug">
              {nextItemTitle}
            </h2>
          </div>

          {/* Type · Duration · Phase Subtitle */}
          <div className="flex items-center gap-2.5 text-xs text-zinc-300 font-sans pt-0.5">
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/[0.06] border border-white/[0.08]">
              {getTypeIcon(nextItemType)}
              <span className="font-semibold text-white">{typeDisplay}</span>
            </div>
            <span className="text-zinc-600 font-bold">•</span>
            <span className="font-medium">{nextItemDuration} min</span>
            <span className="text-zinc-600 font-bold">•</span>
            <span className="text-zinc-400">Phase {phaseNumber}</span>
          </div>
        </div>

        {/* Primary Action Button — Single prominent primary button */}
        <div className="flex-shrink-0 w-full sm:w-auto self-stretch sm:self-center">
          <button
            onClick={() => onResumeTopic(nextItemTitle, phaseId, nextItemType)}
            className="group relative w-full sm:w-auto flex items-center justify-center gap-3 px-7 py-4 rounded-xl bg-[#F5A623] hover:bg-[#E09215] text-[#0A0A0C] font-extrabold text-sm sm:text-base font-heading shadow-lg shadow-[#F5A623]/25 hover:shadow-[#F5A623]/40 transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0"
            aria-label={`${actionButtonText}: ${nextItemTitle}`}
          >
            <div className="w-6 h-6 rounded-full bg-black/15 flex items-center justify-center flex-shrink-0">
              <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
            </div>
            <span className="tracking-tight">{actionButtonText}</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </div>
  );
};
