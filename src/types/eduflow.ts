export type TaskType = 'video' | 'lab' | 'reading' | 'quiz' | 'practice';
export type TaskStatus = 'completed' | 'current' | 'locked';
export type CategoryKey = 'study' | 'review' | 'practice' | 'lab';

export interface CategoryTheme {
  name: string;
  key: CategoryKey;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  accent: string;
  iconName: string;
}

export interface AgendaTask {
  id: string;
  title: string;
  type: TaskType;
  durationMinutes: number;
  status: TaskStatus;
  progressPercent?: number; // 0 to 100 for circular progress ring
  phaseId?: string;
  subtopicId?: string;
  completedAt?: string;
  date?: string; // YYYY-MM-DD
}

export interface SubTopic {
  id: string;
  title: string;
  durationMinutes: number;
  completed: boolean;
  type?: TaskType;
}

export type PhaseStatus = 'completed' | 'in_progress' | 'locked';

export interface ActionMiniCard {
  type: 'video' | 'lab' | 'reading' | 'quiz';
  label: string;
  title: string;
  duration: string;
  iconName?: string;
}

export interface Phase {
  id: string;
  phaseNumber: number;
  title: string;
  description: string;
  status: PhaseStatus;
  dateRange: string;
  progressPercent: number;
  topicsCovered: string[];
  nextVideo?: ActionMiniCard;
  upcomingLab?: ActionMiniCard;
  subtopics: SubTopic[];
  unlockRequirement?: string;
}

export type ResourceType = 'cheatsheet' | 'lab' | 'doc' | 'video' | 'quiz' | 'flashcard';

export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  tag: string;
}

export interface ResourceItem {
  id: string;
  title: string;
  type: ResourceType;
  category: string;
  url?: string;
  estimatedTime: string;
  isBookmarked: boolean;
  description: string;
  contentMarkdown?: string;
  tags: string[];
  flashcards?: Flashcard[];
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'deadline' | 'streak' | 'resource' | 'system';
  timestamp: string;
  read: boolean;
  linkTab?: string;
}

export interface WeeklyActivity {
  day: string; // "Mon", "Tue", ...
  shortDate: string; // "06/03"
  hours: number;
  targetHours: number;
  studied: boolean;
}

export interface TopicMastery {
  topic: string;
  masteryPercent: number;
  totalQuestions: number;
  correctQuestions: number;
  hoursSpent?: number;
  category?: CategoryKey;
}

export interface Course {
  id: string;
  title: string;
  code: string;
  category: string;
  examDate: string; // YYYY-MM-DD
  targetHoursPerWeek: number;
  studiedHoursThisWeek: number;
  streakDays: number;
  completedSessionsToday: number;
  phases: Phase[];
  agenda: AgendaTask[];
  resources: ResourceItem[];
  weeklyActivity: WeeklyActivity[];
  topicMastery: TopicMastery[];
}

export interface UserPreferences {
  preferredStudyDays: number[]; // [1, 2, 3, 4, 5]
  preferredStudyTime: 'morning' | 'afternoon' | 'evening' | 'night';
  streakReminders: boolean;
  examCountdownAlerts: boolean;
  newResourceAlerts: boolean;
  accentColor: string; // hex or token
}

export interface UserProfile {
  id?: string;
  name: string;
  email: string;
  avatar: string; // URL or empty for initials
  planTier: string;
  activeCourseId: string;
  totalHoursStudied: number;
  totalCertifications: number;
  weeklyTargetHours: number;
  preferences?: UserPreferences;
}

export interface StudySessionLog {
  id: string;
  courseId: string;
  taskTitle: string;
  taskType: TaskType;
  durationMinutes: number;
  completedAt: string;
  notes?: string;
}

export interface ResearchSummary {
  id: string;
  title: string;
  originalText: string;
  fileName?: string;
  fileType?: 'text' | 'markdown' | 'pdf';
  overview: string;
  keyConcepts: { concept: string; definition: string }[];
  examHighYield: string[];
  createdAt: string;
  wordCount: number;
  estimatedStudyTimeMinutes: number;
  courseId?: string;
  tags: string[];
}

// Category palette helper for pastel styling
export function getCategoryTheme(type: TaskType | CategoryKey | string): CategoryTheme {
  const normalized = (type || '').toLowerCase();
  
  if (normalized.includes('lab') || normalized === 'lab') {
    return {
      name: 'Lab & Coding',
      key: 'lab',
      badgeBg: '#FEF3C7',
      badgeText: '#B45309',
      badgeBorder: '#FDE68A',
      accent: '#F59E0B',
      iconName: 'Terminal',
    };
  }
  
  if (normalized.includes('quiz') || normalized.includes('prac') || normalized === 'practice') {
    return {
      name: 'Practice & Quizzes',
      key: 'practice',
      badgeBg: '#D1FAE5',
      badgeText: '#047857',
      badgeBorder: '#A7F3D0',
      accent: '#10B981',
      iconName: 'CheckCircle',
    };
  }
  
  if (normalized.includes('read') || normalized.includes('note') || normalized === 'review') {
    return {
      name: 'Review & Notes',
      key: 'review',
      badgeBg: '#CCFBF1',
      badgeText: '#0F766E',
      badgeBorder: '#99F6E4',
      accent: '#0D9488',
      iconName: 'BookOpen',
    };
  }
  
  // Default to Video / Study
  return {
    name: 'Study & Lecture',
    key: 'study',
    badgeBg: '#F3E8FF',
    badgeText: '#6D28D9',
    badgeBorder: '#E9D5FF',
    accent: '#8B5CF6',
    iconName: 'Video',
  };
}
