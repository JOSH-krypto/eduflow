import React from 'react';
import { Play, Flame, ArrowRight, Target, Clock, BookCheck } from 'lucide-react';
import { Course, UserProfile } from '../../types/eduflow';

interface WelcomeCardProps {
  userProfile: UserProfile;
  course: Course;
  onResumeTopic: (topicTitle: string, phaseId?: string) => void;
}

export const WelcomeCard: React.FC<WelcomeCardProps> = ({
  userProfile,
  course,
  onResumeTopic,
}) => {
  // Find current active task from agenda or in_progress phase
  const currentTask = course.agenda.find(t => t.status === 'current');
  const inProgressPhase = course.phases.find(p => p.status === 'in_progress');
  
  const resumeTopicTitle = currentTask 
    ? currentTask.title 
    : inProgressPhase?.upcomingLab?.title || inProgressPhase?.nextVideo?.title || 'Next Scheduled Topic';

  const completedSessions = course.completedSessionsToday || 3;
  const streak = course.streakDays || 7;
  const examDaysLeft = course.examDate 
    ? Math.max(0, Math.ceil((new Date(course.examDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
    : 18;
  const overallProgress = course.phases.length > 0 
    ? Math.round(course.phases.reduce((acc, p) => acc + p.progressPercent, 0) / course.phases.length)
    : 0;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-[#141416] border border-white/[0.08] p-6 lg:p-7 shadow-xl">
      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        {/* Left: Greetings & Streak Motivation */}
        <div className="flex-1 max-w-xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#F5A623]/10 border border-[#F5A623]/25 mb-3">
            <Flame className="w-3.5 h-3.5 text-[#F5A623]" />
            <span className="text-[11px] font-bold text-[#F5A623] tracking-wider uppercase font-heading">
              {streak}-Day Active Streak
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white font-heading tracking-tight leading-tight">
            Welcome back, {userProfile.name.split(' ')[0]}!
          </h2>

          <p className="text-xs sm:text-sm text-zinc-300 mt-2 font-sans leading-relaxed">
            You've completed <span className="text-white font-semibold">{completedSessions} sessions</span> today. You're on a <span className="text-[#2DD4BF] font-semibold">{streak}-day streak</span>—keep the momentum going!
          </p>

          {/* Solid Amber Resume Button */}
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onResumeTopic(resumeTopicTitle, inProgressPhase?.id)}
              className="group/btn relative flex items-center gap-2.5 px-5 py-3 rounded-xl bg-[#F5A623] hover:bg-[#E09215] text-[#0D0D0F] font-bold text-xs sm:text-sm font-heading shadow-md shadow-[#F5A623]/20 hover:shadow-[#F5A623]/35 transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0"
              aria-label={`Resume study topic: ${resumeTopicTitle}`}
            >
              <div className="w-5 h-5 rounded-full bg-black/15 flex items-center justify-center">
                <Play className="w-3 h-3 fill-current ml-0.5" />
              </div>
              <span className="truncate max-w-[220px] sm:max-w-[320px]">
                Resume: {resumeTopicTitle}
              </span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
            </button>
          </div>
        </div>

        {/* Right: Clean Exam Metrics Box */}
        <div className="hidden sm:grid grid-cols-2 gap-3 flex-shrink-0 self-center bg-[#0D0D0F] border border-white/[0.06] rounded-xl p-3.5 min-w-[240px]">
          <div className="flex flex-col gap-1 p-2 rounded-lg bg-[#141416]/70 border border-white/[0.04]">
            <div className="flex items-center gap-1.5 text-zinc-400 text-[11px]">
              <Clock className="w-3.5 h-3.5 text-[#F5A623]" />
              <span className="font-sans">Countdown</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-extrabold text-white font-heading">{examDaysLeft}</span>
              <span className="text-[10px] text-zinc-500 font-sans">days left</span>
            </div>
          </div>

          <div className="flex flex-col gap-1 p-2 rounded-lg bg-[#141416]/70 border border-white/[0.04]">
            <div className="flex items-center gap-1.5 text-zinc-400 text-[11px]">
              <Target className="w-3.5 h-3.5 text-[#2DD4BF]" />
              <span className="font-sans">Overall Goal</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-extrabold text-white font-heading">{overallProgress}%</span>
              <span className="text-[10px] text-zinc-500 font-sans">completed</span>
            </div>
          </div>

          <div className="col-span-2 flex items-center justify-between px-2 py-1.5 rounded-lg bg-[#2DD4BF]/5 border border-[#2DD4BF]/15 text-[11px] text-[#2DD4BF]">
            <span className="flex items-center gap-1 font-medium font-sans">
              <BookCheck className="w-3.5 h-3.5" /> Next: {inProgressPhase?.title?.split(':')[0] || 'Phase 2'}
            </span>
            <span className="font-bold font-heading">{inProgressPhase?.progressPercent || 42}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};
