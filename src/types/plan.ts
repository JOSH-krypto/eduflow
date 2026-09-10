export type StudyMode = 'learn' | 'revise' | 'practice';

export interface StudySession {
  id: string;
  topic: string;
  hours: number;
  mode: StudyMode;
  completed?: boolean;
  isCustom?: boolean;
}

export interface PlanEntry {
  id: string;
  label: string;
  date?: string; // YYYY-MM-DD (required for daily entries)
  focus: string;
  sessions: StudySession[];
}

export interface Phase {
  id: string;
  type: 'daily' | 'weekly';
  label: string;
  dateRange: string;
  entries: PlanEntry[];
}

export interface ExamPlan {
  id: string;
  title: string;
  examDate: string; // YYYY-MM-DD
  syllabus: string;
  studyDays: number[]; // 1 = Mon, 2 = Tue, 3 = Wed, 4 = Thu, 5 = Fri, 6 = Sat, 0 = Sun
  hoursPerDay: number;
  createdAt: string;
  updatedAt?: string;
  phases: Phase[];
  tips: string[];
  completedSessionIds: Record<string, boolean>; // session.id -> true
}

export interface GlobalStats {
  totalHoursStudied: number;
  currentStreak: number;
  lastStudiedDate: string | null; // YYYY-MM-DD
}

export interface GeminiPlanResponse {
  phases: {
    type: 'daily' | 'weekly';
    label: string;
    dateRange: string;
    entries: {
      label: string;
      date?: string;
      focus: string;
      sessions: {
        topic: string;
        hours: number;
        mode: 'learn' | 'revise' | 'practice';
      }[];
    }[];
  }[];
  tips: string[];
}
