import React from 'react';
import { Course, UserProfile, Phase, AgendaTask, ResourceItem, TaskType } from '../../types/eduflow';
import { ContinueLearningHero } from './ContinueLearningHero';
import { ExamReadinessCard } from './ExamReadinessCard';
import { LearningPath } from './LearningPath';
import { TodayAgenda } from './TodayAgenda';
import { StatCards } from './StatCards';
import { QuickResources } from './QuickResources';

interface DashboardViewProps {
  course: Course;
  userProfile: UserProfile;
  onResumeTopic: (topicTitle: string, phaseId?: string, taskType?: TaskType) => void;
  onOpenPhaseDetail: (phase: Phase) => void;
  onStartAction: (actionTitle: string, phase: Phase, taskType?: TaskType) => void;
  onToggleTask: (taskId: string) => void;
  onOpenAddTaskModal: () => void;
  onDeleteTask: (taskId: string) => void;
  onPlayTask: (task: AgendaTask) => void;
  onExportCalendar: () => void;
  onOpenResource: (resource: ResourceItem) => void;
  onViewAllResources: () => void;
  onViewAllStudyPath: () => void;
  searchFilter?: string;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  course,
  userProfile,
  onResumeTopic,
  onOpenPhaseDetail,
  onStartAction,
  onToggleTask,
  onOpenAddTaskModal,
  onDeleteTask,
  onPlayTask,
  onExportCalendar,
  onOpenResource,
  onViewAllResources,
  onViewAllStudyPath,
  searchFilter = '',
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
      {/* ================= MAIN COLUMN (~65-70% -> lg:col-span-8) ================= */}
      <div className="lg:col-span-8 space-y-6">
        {/* 1. HERO: CONTINUE LEARNING (Highest visual weight) */}
        <ContinueLearningHero
          course={course}
          onResumeTopic={onResumeTopic}
        />

        {/* 2. EXAM READINESS (Single clear progress metric with breakdown & milestone) */}
        <ExamReadinessCard
          course={course}
          onOpenStudyPath={onViewAllStudyPath}
        />

        {/* 3. LEARNING PATH (Compressed by status: Completed row -> Current card -> Locked row) */}
        <LearningPath
          phases={course.phases}
          examDate={course.examDate}
          onOpenPhaseDetail={onOpenPhaseDetail}
          onStartAction={onStartAction}
          onViewAllStudyPath={onViewAllStudyPath}
          filterQuery={searchFilter}
        />
      </div>

      {/* ================= RIGHT SIDEBAR (~30-35% -> lg:col-span-4) ================= */}
      <div className="lg:col-span-4 space-y-6">
        {/* 4. TODAY'S PLAN (Compact by default, progressive disclosure modal for adding) */}
        <TodayAgenda
          tasks={course.agenda}
          onToggleTask={onToggleTask}
          onOpenAddTaskModal={onOpenAddTaskModal}
          onDeleteTask={onDeleteTask}
          onPlayTask={onPlayTask}
          onExportCalendar={onExportCalendar}
        />

        {/* Weekly Stats & Streak Heatmap */}
        <StatCards
          course={course}
          totalHoursStudied={userProfile.totalHoursStudied}
        />

        {/* Quick Resources / Cheatsheets */}
        <QuickResources
          resources={course.resources}
          onOpenResource={onOpenResource}
          onViewAllResources={onViewAllResources}
        />
      </div>
    </div>
  );
};
