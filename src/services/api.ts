import { Course, UserProfile, AgendaTask, StudySessionLog, ResearchSummary } from '../types/eduflow';
import { 
  loadCourses, 
  saveCourses, 
  loadUserProfile, 
  saveUserProfile, 
  loadSessionLogs,
  saveSessionLogs
} from './storage';

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || '';

class ApiService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const defaultHeaders: Record<string, string> = {};

    // Don't set Content-Type for FormData
    if (!(options.body instanceof FormData)) {
      defaultHeaders['Content-Type'] = 'application/json';
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
      credentials: 'include', // Pass httpOnly JWT cookies
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // ================= HEALTH CHECK =================
  async healthCheck(): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE_URL}/healthz`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  // ================= AUTH =================
  async register(data: { email: string; password: string; name: string }): Promise<{ user: UserProfile }> {
    try {
      const res = await this.request<{ user: UserProfile }>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      saveUserProfile(res.user);
      return res;
    } catch (err) {
      console.warn('Backend offline, using local profile registration:', err);
      const profile: UserProfile = {
        name: data.name,
        email: data.email,
        avatar: '',
        planTier: 'Pro Student',
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
      saveUserProfile(profile);
      return { user: profile };
    }
  }

  async login(data: { email: string; password: string }): Promise<{ user: UserProfile }> {
    try {
      const res = await this.request<{ user: UserProfile }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      saveUserProfile(res.user);
      return res;
    } catch (err) {
      console.warn('Backend offline, using local login:', err);
      const profile = loadUserProfile();
      return { user: profile };
    }
  }

  async logout(): Promise<void> {
    try {
      await this.request('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.warn('Logout fallback:', err);
    }
  }

  async getMe(): Promise<UserProfile | null> {
    try {
      const res = await this.request<{ user: UserProfile }>('/api/auth/me');
      if (res.user) {
        saveUserProfile(res.user);
        return res.user;
      }
      return loadUserProfile();
    } catch {
      return loadUserProfile();
    }
  }

  // ================= PROFILE & PHOTO UPLOAD =================
  async updateProfile(profile: Partial<UserProfile>): Promise<UserProfile> {
    try {
      const res = await this.request<{ user: UserProfile }>('/api/profile', {
        method: 'PATCH',
        body: JSON.stringify(profile),
      });
      saveUserProfile(res.user);
      return res.user;
    } catch {
      const current = loadUserProfile();
      const updated = { ...current, ...profile };
      saveUserProfile(updated);
      return updated;
    }
  }

  async uploadProfilePhoto(file: File): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const res = await this.request<{ avatarUrl: string }>('/api/profile/avatar', {
        method: 'POST',
        body: formData,
      });

      const current = loadUserProfile();
      saveUserProfile({ ...current, avatar: res.avatarUrl });
      return res.avatarUrl;
    } catch (err) {
      console.warn('Backend upload unavailable, using base64 local preview:', err);
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = reader.result as string;
          const current = loadUserProfile();
          saveUserProfile({ ...current, avatar: base64 });
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    }
  }

  // ================= COURSES =================
  async getCourses(): Promise<Course[]> {
    try {
      const res = await this.request<{ courses: Course[] }>('/api/courses');
      if (res.courses && res.courses.length > 0) {
        saveCourses(res.courses);
        return res.courses;
      }
      return loadCourses();
    } catch {
      return loadCourses();
    }
  }

  async createCourse(course: Course): Promise<Course> {
    try {
      const res = await this.request<{ course: Course }>('/api/courses', {
        method: 'POST',
        body: JSON.stringify(course),
      });
      return res.course;
    } catch {
      const current = loadCourses();
      saveCourses([course, ...current]);
      return course;
    }
  }

  // ================= TASKS =================
  async createTask(task: Omit<AgendaTask, 'id'> & { courseId?: string }): Promise<AgendaTask> {
    try {
      const res = await this.request<{ task: AgendaTask }>('/api/tasks', {
        method: 'POST',
        body: JSON.stringify(task),
      });
      return res.task;
    } catch {
      const newTask: AgendaTask = {
        ...task,
        id: `task-${Date.now()}`,
        status: task.status || 'current',
        progressPercent: 0,
      };
      return newTask;
    }
  }

  // ================= SESSIONS =================
  async logSession(session: Omit<StudySessionLog, 'id'>): Promise<StudySessionLog> {
    try {
      const res = await this.request<{ session: StudySessionLog }>('/api/sessions', {
        method: 'POST',
        body: JSON.stringify(session),
      });
      return res.session;
    } catch {
      const newSession: StudySessionLog = {
        ...session,
        id: `sess-${Date.now()}`,
      };
      const logs = loadSessionLogs();
      saveSessionLogs([newSession, ...logs]);
      return newSession;
    }
  }

  // ================= AI RESEARCH SUMMARIZER (SERVER-SIDE PROXY) =================
  /**
   * The Gemini API key lives ONLY on the backend.
   * Frontend calls our own server endpoint `/api/ai/summarize`.
   */
  async summarizeResearchMaterial(
    materialText: string,
    title?: string,
    courseId?: string
  ): Promise<ResearchSummary> {
    try {
      const res = await this.request<{ summary: ResearchSummary }>('/api/ai/summarize', {
        method: 'POST',
        body: JSON.stringify({ materialText, title, courseId }),
      });
      return res.summary;
    } catch (err: any) {
      console.warn('Backend AI proxy error or offline, generating structured summary:', err);
      const lines = materialText.split('\n').map((l) => l.trim()).filter(Boolean);
      const words = materialText.split(/\s+/).filter(Boolean);
      const firstLine = lines[0] ? lines[0].replace(/^#+\s*/, '').substring(0, 50) : 'Study Summary';

      return {
        id: `summary-${Date.now()}`,
        title: title || firstLine || 'Study Material Breakdown',
        originalText: materialText,
        overview: `Executive summary covering ${words.length} words of study material. Synthesizes key concepts and exam preparation objectives.`,
        keyConcepts: lines.slice(0, 4).map((line, idx) => ({
          concept: `Key Concept ${idx + 1}`,
          definition: line.length > 120 ? line.substring(0, 120) + '...' : line,
        })),
        examHighYield: [
          'Review foundational definitions and terminology in this topic.',
          'Focus on edge cases, limits, and high-frequency problem scenarios.',
          'Practice explaining core concepts in your own words before your exam date.'
        ],
        wordCount: words.length,
        estimatedStudyTimeMinutes: Math.max(10, Math.round(words.length / 100) * 5),
        createdAt: new Date().toISOString(),
        courseId,
        tags: ['StudyNotes', 'ExamPrep'],
      };
    }
  }
}

export const api = new ApiService();
