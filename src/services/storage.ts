import { 
  Course, 
  UserProfile, 
  NotificationItem, 
  StudySessionLog, 
  ResearchSummary,
  Phase,
  AgendaTask,
  SubTopic 
} from '../types/eduflow';

const STORAGE_KEYS = {
  COURSES: 'eduflow_v2_courses',
  ACTIVE_COURSE_ID: 'eduflow_v2_active_course_id',
  USER_PROFILE: 'eduflow_v2_user_profile',
  NOTIFICATIONS: 'eduflow_v2_notifications',
  SESSION_LOGS: 'eduflow_v2_session_logs',
  RESEARCH_SUMMARIES: 'eduflow_v2_research_summaries',
};

// Legacy keys from earlier prototypes to flush completely
const LEGACY_KEYS = [
  'eduflow_courses_data',
  'eduflow_active_course_id',
  'eduflow_user_profile',
  'eduflow_notifications',
  'eduflow_session_logs',
  'eduflow_research_summaries',
  'exam_prep_user_profile',
  'exam_prep_exams',
];

export function purgeLegacyStorage(): void {
  try {
    if (typeof localStorage === 'undefined') return;
    LEGACY_KEYS.forEach((key) => {
      localStorage.removeItem(key);
    });
  } catch {
    // Ignore storage availability errors
  }
}

// Automatically clear legacy prototype keys on load
if (typeof window !== 'undefined') {
  purgeLegacyStorage();
}

export const defaultUserProfile: UserProfile = {
  name: 'Student',
  avatar: '',
  planTier: 'Student',
  email: '',
  activeCourseId: '',
  totalHoursStudied: 0,
  totalCertifications: 0,
  weeklyTargetHours: 15,
  preferences: {
    preferredStudyDays: [1, 2, 3, 4, 5],
    preferredStudyTime: 'morning',
    streakReminders: true,
    examCountdownAlerts: true,
    newResourceAlerts: true,
    accentColor: '#7C3AED',
  },
};

import { SAMPLE_AWS_COURSE_TEMPLATE } from '../data/sampleCourseTemplate';

export function getSampleCourse(): Course {
  return JSON.parse(JSON.stringify(SAMPLE_AWS_COURSE_TEMPLATE));
}

// Course Data: Always defaults to empty array for fresh real user account
export function loadCourses(): Course[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.COURSES);
    if (!data) {
      return [];
    }
    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed)) return [];

    // Strip legacy synthetic nextVideo & upcomingLab suggestions from existing saved courses
    return parsed.map((course: Course) => ({
      ...course,
      phases: (course.phases || []).map((phase) => {
        const { nextVideo: _nv, upcomingLab: _ul, ...cleanPhase } = phase;
        return cleanPhase as Phase;
      }),
    }));
  } catch {
    return [];
  }
}

export function saveCourses(courses: Course[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(courses));
  } catch {
    // Ignore storage quota error
  }
}

// Active Course ID
export function getActiveCourseId(): string {
  return localStorage.getItem(STORAGE_KEYS.ACTIVE_COURSE_ID) || '';
}

export function setActiveCourseId(id: string): void {
  localStorage.setItem(STORAGE_KEYS.ACTIVE_COURSE_ID, id);
}

// User Profile
export function loadUserProfile(): UserProfile {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    if (!data) {
      return defaultUserProfile;
    }
    return JSON.parse(data);
  } catch {
    return defaultUserProfile;
  }
}

export function saveUserProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
  } catch {
    // Ignore storage quota error
  }
}

// Clear all active user data on Sign Out
export function clearUserData(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.COURSES);
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_COURSE_ID);
    localStorage.removeItem(STORAGE_KEYS.USER_PROFILE);
    localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
    localStorage.removeItem(STORAGE_KEYS.SESSION_LOGS);
    localStorage.removeItem(STORAGE_KEYS.RESEARCH_SUMMARIES);
  } catch {
    // Ignore storage quota error
  }
}

// Live stats computation: derived accurately from real courses and session logs
export function computeRealUserStats(courses: Course[], sessionLogs: StudySessionLog[] = []) {
  let minutes = 0;
  courses.forEach((c) => {
    (c.agenda || []).forEach((t) => {
      if (t.status === 'completed') {
        minutes += t.durationMinutes || 30;
      }
    });
  });
  sessionLogs.forEach((s) => {
    minutes += s.durationMinutes || 0;
  });
  const totalHoursStudied = Math.round((minutes / 60) * 10) / 10;
  const totalCertifications = courses.length;
  return { totalHoursStudied, totalCertifications };
}

// Notifications
export function loadNotifications(): NotificationItem[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    if (!data) {
      return [];
    }
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export function saveNotifications(notifications: NotificationItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  } catch {
    // Ignore storage quota error
  }
}

// Study Session Logs
export function loadSessionLogs(): StudySessionLog[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SESSION_LOGS);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveSessionLogs(logs: StudySessionLog[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SESSION_LOGS, JSON.stringify(logs));
  } catch {
    // Ignore storage quota error
  }
}

export function loadResearchSummaries(): ResearchSummary[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.RESEARCH_SUMMARIES);
    if (!data) {
      return [];
    }
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export function saveResearchSummaries(summaries: ResearchSummary[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.RESEARCH_SUMMARIES, JSON.stringify(summaries));
  } catch {
    // Ignore storage quota error
  }
}

export function addResearchSummary(summary: ResearchSummary): ResearchSummary[] {
  const current = loadResearchSummaries();
  const updated = [summary, ...current.filter(s => s.id !== summary.id)];
  saveResearchSummaries(updated);
  return updated;
}

export function deleteResearchSummary(summaryId: string): ResearchSummary[] {
  const current = loadResearchSummaries();
  const updated = current.filter(s => s.id !== summaryId);
  saveResearchSummaries(updated);
  return updated;
}

// API Key for Gemini integration
export function getStoredApiKey(): string {
  return localStorage.getItem('eduflow_gemini_api_key') || '';
}

export function setStoredApiKey(key: string): void {
  localStorage.setItem('eduflow_gemini_api_key', key);
}

// Helper: Recalculate Phase progress from subtopics & agenda
export function recalculatePhaseProgress(phases: Phase[], _agenda?: AgendaTask[]): Phase[] {
  return phases.map((phase) => {
    if (!phase.subtopics || phase.subtopics.length === 0) {
      return phase;
    }
    const completedCount = phase.subtopics.filter((s) => s.completed).length;
    const progressPercent = Math.round((completedCount / phase.subtopics.length) * 100);
    const status = progressPercent === 100 ? 'completed' : progressPercent > 0 ? 'in_progress' : phase.status;
    return {
      ...phase,
      progressPercent,
      status: status as any,
    };
  });
}

// Helper: Calculate single subtopics array percent
export function calculateSubtopicsProgress(subtopics: SubTopic[]): number {
  if (!subtopics || subtopics.length === 0) return 0;
  const completed = subtopics.filter(s => s.completed).length;
  return Math.round((completed / subtopics.length) * 100);
}

// Helper: Reset all data to factory seed
export function resetAllData(): void {
  localStorage.removeItem(STORAGE_KEYS.COURSES);
  localStorage.removeItem(STORAGE_KEYS.ACTIVE_COURSE_ID);
  localStorage.removeItem(STORAGE_KEYS.USER_PROFILE);
  localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
  localStorage.removeItem(STORAGE_KEYS.SESSION_LOGS);
  localStorage.removeItem(STORAGE_KEYS.RESEARCH_SUMMARIES);
}
