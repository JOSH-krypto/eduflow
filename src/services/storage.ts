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
import { seedCourses, initialUserProfile, initialNotifications } from '../data/seedData';

const STORAGE_KEYS = {
  COURSES: 'eduflow_courses_data',
  ACTIVE_COURSE_ID: 'eduflow_active_course_id',
  USER_PROFILE: 'eduflow_user_profile',
  NOTIFICATIONS: 'eduflow_notifications',
  SESSION_LOGS: 'eduflow_session_logs',
  RESEARCH_SUMMARIES: 'eduflow_research_summaries',
};

// Course Data
export function loadCourses(): Course[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.COURSES);
    if (!data) {
      saveCourses(seedCourses);
      return seedCourses;
    }
    return JSON.parse(data);
  } catch {
    return seedCourses;
  }
}

export function saveCourses(courses: Course[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(courses));
  } catch (err) {
    console.error('Failed to save courses', err);
  }
}

// Active Course ID
export function getActiveCourseId(): string {
  return localStorage.getItem(STORAGE_KEYS.ACTIVE_COURSE_ID) || 'aws-saa-c03';
}

export function setActiveCourseId(id: string): void {
  localStorage.setItem(STORAGE_KEYS.ACTIVE_COURSE_ID, id);
}

// User Profile
export function loadUserProfile(): UserProfile {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    if (!data) {
      saveUserProfile(initialUserProfile);
      return initialUserProfile;
    }
    return JSON.parse(data);
  } catch {
    return initialUserProfile;
  }
}

export function saveUserProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
  } catch (err) {
    console.error('Failed to save user profile', err);
  }
}

// Notifications
export function loadNotifications(): NotificationItem[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    if (!data) {
      saveNotifications(initialNotifications);
      return initialNotifications;
    }
    return JSON.parse(data);
  } catch {
    return initialNotifications;
  }
}

export function saveNotifications(notifications: NotificationItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  } catch (err) {
    console.error('Failed to save notifications', err);
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
  } catch (err) {
    console.error('Failed to save session logs', err);
  }
}

const defaultSeedSummaries: ResearchSummary[] = [
  {
    id: 'sum-seed-1',
    title: 'VPC Peering vs Transit Gateway Hub-and-Spoke',
    originalText: 'VPC peering connection is a networking connection between two VPCs that enables you to route traffic between them using private IPv4 or IPv6 addresses. No transitive peering. Transit Gateway acts as a cloud router connecting VPCs and on-premises networks.',
    fileName: 'vpc-peering-notes.md',
    fileType: 'markdown',
    overview: 'Compares point-to-point VPC peering topologies with scalable hub-and-spoke AWS Transit Gateway architectures, highlighting transitive routing limitations and bandwidth limits.',
    keyConcepts: [
      { concept: 'VPC Peering', definition: 'Non-transitive point-to-point connection between 2 VPCs with zero bandwidth bottleneck and lowest cost.' },
      { concept: 'Transit Gateway', definition: 'Regional hub router managing thousands of VPCs and VPN/Direct Connect connections with centralized routing policies.' },
      { concept: 'Transitive Routing', definition: 'Traffic cannot pass through a peered VPC to reach another VPC; requires Transit Gateway to route transitively.' }
    ],
    examHighYield: [
      'VPC Peering has NO bandwidth limit and NO hourly gateway cost; use for simple 2-VPC private communication.',
      'Transit Gateway supports multicast and simplifies network architecture when connecting > 5 VPCs.',
      'Exam trap: VPC A <-> VPC B <-> VPC C does NOT allow VPC A to talk to VPC C without direct peering or Transit Gateway.'
    ],
    createdAt: '2026-09-08T14:30:00Z',
    wordCount: 320,
    estimatedStudyTimeMinutes: 20,
    courseId: 'aws-saa-c03',
    tags: ['VPC', 'Networking', 'TransitGateway', 'SAA-C03']
  }
];

export function loadResearchSummaries(): ResearchSummary[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.RESEARCH_SUMMARIES);
    if (!data) {
      saveResearchSummaries(defaultSeedSummaries);
      return defaultSeedSummaries;
    }
    return JSON.parse(data);
  } catch {
    return defaultSeedSummaries;
  }
}

export function saveResearchSummaries(summaries: ResearchSummary[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.RESEARCH_SUMMARIES, JSON.stringify(summaries));
  } catch (err) {
    console.error('Failed to save research summaries', err);
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
