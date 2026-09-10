import { Phase, SubTopic } from '../types/eduflow';

/**
 * Compute the number of days remaining until the exam date
 */
export function getDaysUntilExam(examDateStr: string): number {
  if (!examDateStr) return 14;
  const examDate = new Date(examDateStr);
  const today = new Date();
  
  // Set both to start of day for clean day comparison
  const examDay = new Date(examDate.getFullYear(), examDate.getMonth(), examDate.getDate());
  const todayDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  
  const diffTime = examDay.getTime() - todayDay.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

/**
 * Format a calendar date string (e.g. "Sep 24, 2026")
 */
export function formatExamDate(examDateStr: string): string {
  if (!examDateStr) return 'Oct 15, 2026';
  try {
    const d = new Date(examDateStr);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(d);
  } catch {
    return examDateStr;
  }
}

/**
 * Format today's date for display (e.g. "Thursday, Sep 10")
 */
export function getTodayFormatted(): string {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  }).format(new Date());
}

/**
 * Format short month day (e.g. "Sep 10")
 */
export function formatShortMonthDay(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(date);
}

/**
 * Generate dynamically computed date ranges for each phase
 * based on the real current date and user-entered exam date.
 */
export function getPhaseDynamicDateRange(
  phaseIndex: number, // 0-indexed
  totalPhases: number,
  examDateStr: string
): string {
  const today = new Date();
  const examDate = examDateStr ? new Date(examDateStr) : new Date(today.getTime() + 28 * 86400000);
  
  const totalDays = Math.max(7, Math.ceil((examDate.getTime() - today.getTime()) / 86400000));
  const daysPerPhase = Math.max(4, Math.floor(totalDays / (totalPhases || 1)));

  // If phase is completed (phaseIndex 0 when we are in phase 2), show past window
  if (phaseIndex === 0) {
    const start = new Date(today.getTime() - 14 * 86400000);
    const end = new Date(today.getTime() - 1 * 86400000);
    return `${formatShortMonthDay(start)} – ${formatShortMonthDay(end)}`;
  }

  // If current phase (phaseIndex 1)
  if (phaseIndex === 1) {
    const start = today;
    const end = new Date(today.getTime() + daysPerPhase * 86400000);
    return `${formatShortMonthDay(start)} – ${formatShortMonthDay(end)}`;
  }

  // Future phases
  const startOffset = daysPerPhase * (phaseIndex - 1);
  const endOffset = daysPerPhase * phaseIndex;
  const start = new Date(today.getTime() + startOffset * 86400000);
  const end = phaseIndex === totalPhases - 1 ? examDate : new Date(today.getTime() + endOffset * 86400000);

  return `${formatShortMonthDay(start)} – ${formatShortMonthDay(end)}`;
}

/**
 * Calculate detailed breakdown counts for Exam Readiness block
 */
export function getBreakdownCounts(phases: Phase[]): {
  topicsCompleted: number;
  topicsTotal: number;
  labsCompleted: number;
  labsTotal: number;
  practiceCompleted: number;
  practiceTotal: number;
  overallPercent: number;
} {
  const allSubtopics: SubTopic[] = phases.flatMap(p => p.subtopics || []);
  
  const topics = allSubtopics.filter(s => !s.type || s.type === 'video' || s.type === 'reading');
  const labs = allSubtopics.filter(s => s.type === 'lab');
  const practice = allSubtopics.filter(s => s.type === 'quiz' || s.type === 'practice');

  const topicsCompleted = topics.filter(s => s.completed).length;
  const labsCompleted = labs.filter(s => s.completed).length;
  const practiceCompleted = practice.filter(s => s.completed).length;

  const allCompleted = allSubtopics.filter(s => s.completed).length;
  const overallPercent = allSubtopics.length > 0 
    ? Math.round((allCompleted / allSubtopics.length) * 100) 
    : 0;

  return {
    topicsCompleted,
    topicsTotal: topics.length,
    labsCompleted,
    labsTotal: labs.length,
    practiceCompleted,
    practiceTotal: practice.length,
    overallPercent,
  };
}

/**
 * Generate human-friendly Next Milestone string for Exam Readiness
 * e.g., "Complete Phase 2 — 4 labs remaining, ~3h20m"
 */
export function getMilestoneSummary(phases: Phase[]): string {
  const inProgressPhase = phases.find(p => p.status === 'in_progress') || phases[0];
  if (!inProgressPhase) return 'Curriculum Completed! 🎉 Ready for exam.';

  const remainingSubtopics = inProgressPhase.subtopics.filter(s => !s.completed);
  if (remainingSubtopics.length === 0) {
    return `Phase ${inProgressPhase.phaseNumber} complete — Ready to advance to Phase ${inProgressPhase.phaseNumber + 1}!`;
  }

  const remainingLabs = remainingSubtopics.filter(s => s.type === 'lab').length;
  const totalMinutes = remainingSubtopics.reduce((acc, s) => acc + (s.durationMinutes || 30), 0);
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  const timeStr = hours > 0 ? `${hours}h${mins > 0 ? `${mins}m` : ''}` : `${mins}m`;

  const itemsPhrase = remainingLabs > 0 
    ? `${remainingLabs} ${remainingLabs === 1 ? 'lab' : 'labs'} remaining`
    : `${remainingSubtopics.length} ${remainingSubtopics.length === 1 ? 'topic' : 'topics'} remaining`;

  return `Complete Phase ${inProgressPhase.phaseNumber} — ${itemsPhrase}, ~${timeStr}`;
}
