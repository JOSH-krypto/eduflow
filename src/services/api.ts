import { Course, UserProfile, AgendaTask, StudySessionLog, ResearchSummary } from '../types/eduflow';
import {
  loadCourses,
  saveCourses,
  loadUserProfile,
  saveUserProfile,
  loadSessionLogs,
  saveSessionLogs
} from './storage';

const getBaseUrl = (): string => {
  const envUrl = (import.meta as any).env?.API_URL_PROD || (import.meta as any).env?.VITE_API_URL;
  if (envUrl) return envUrl;
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
      return 'http://localhost:4000';
    }
  }
  return 'https://eduflow-gg3y.onrender.com';
};

const API_BASE_URL = getBaseUrl();

class ApiService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const defaultHeaders: Record<string, string> = {};

    if (!(options.body instanceof FormData)) {
      defaultHeaders['Content-Type'] = 'application/json';
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...defaultHeaders,
          ...options.headers,
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `API error: ${response.status} ${response.statusText}`);
      }

      return response.json();
    } catch (err: any) {
      if (err.name === 'TypeError' || err.message === 'Failed to fetch') {
        throw new Error('Unable to connect to the server. Check your connection or verify the backend is running.');
      }
      throw err;
    }
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
    const normalizedEmail = data.email.trim().toLowerCase();
    const res = await this.request<{ user: UserProfile }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: normalizedEmail,
        password: data.password,
        name: data.name.trim(),
      }),
    });
    saveUserProfile(res.user);
    return res;
  }

  async login(data: { email: string; password: string }): Promise<{ user: UserProfile }> {
    const normalizedEmail = data.email.trim().toLowerCase();
    const res = await this.request<{ user: UserProfile }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: normalizedEmail,
        password: data.password,
      }),
    });
    saveUserProfile(res.user);
    return res;
  }

  async logout(): Promise<void> {
    try {
      await this.request('/api/auth/logout', { method: 'POST' });
    } catch {
      // Local session cleared
    }
  }

  async getMe(): Promise<UserProfile | null> {
    try {
      const res = await this.request<{ user: UserProfile }>('/api/auth/me');
      if (res.user) {
        saveUserProfile(res.user);
        return res.user;
      }
      return null;
    } catch {
      return null;
    }
  }

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
    } catch {
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
      if (res.courses && Array.isArray(res.courses)) {
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

  async deleteCourse(courseId: string): Promise<void> {
    try {
      await this.request(`/api/courses/${courseId}`, {
        method: 'DELETE',
      });
    } catch {
      // Local fallback handled
    }
    const current = loadCourses();
    const updated = current.filter((c) => c.id !== courseId);
    saveCourses(updated);
  }

  async createTask(
    task: Partial<AgendaTask> & { title: string; type: AgendaTask['type']; durationMinutes: number; courseId?: string }
  ): Promise<AgendaTask> {
    try {
      const res = await this.request<{ task: AgendaTask }>('/api/tasks', {
        method: 'POST',
        body: JSON.stringify({
          status: 'current',
          progressPercent: 0,
          ...task,
        }),
      });
      return res.task;
    } catch {
      const newTask: AgendaTask = {
        status: 'current',
        progressPercent: 0,
        ...task,
        id: `task-${Date.now()}`,
      };
      return newTask;
    }
  }

  async updateTask(taskId: string, updates: Partial<AgendaTask>): Promise<void> {
    try {
      await this.request(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });
    } catch {
      // Local fallback handled
    }
  }

  async deleteTask(taskId: string): Promise<void> {
    try {
      await this.request(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      });
    } catch {
      // Local fallback handled
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

  async logStudySession(session: Omit<StudySessionLog, 'id'>): Promise<StudySessionLog> {
    return this.logSession(session);
  }

  // ================= AI RESEARCH SUMMARIZER (SERVER-SIDE PROXY) =================
  /**
   * The Gemini API key lives ONLY on the backend.
   * Frontend calls our own server endpoint `/api/ai/summarize`.
   */
  async summarizeDocument(params: {
    file?: File;
    materialText?: string;
    title?: string;
    courseId?: string;
    focusArea?: string;
  }): Promise<ResearchSummary> {
    return this.summarizeResearchMaterial(params);
  }
  async summarizeResearchMaterial(
    input: string | { file?: File; materialText?: string; title?: string; courseId?: string; focusArea?: string },
    legacyTitle?: string,
    legacyCourseId?: string
  ): Promise<ResearchSummary> {
    let file: File | undefined;
    let materialText: string | undefined;
    let title: string | undefined;
    let courseId: string | undefined;
    let focusArea: string | undefined;

    if (typeof input === 'string') {
      materialText = input;
      title = legacyTitle;
      courseId = legacyCourseId;
    } else {
      file = input.file;
      materialText = input.materialText;
      title = input.title;
      courseId = input.courseId;
      focusArea = input.focusArea;
    }

    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('File exceeds maximum size of 10 MB. Please upload a smaller document.');
      }

      if (file.name.toLowerCase().endsWith('.pdf')) {
        const headerBuffer = await file.slice(0, 5).arrayBuffer();
        const headerStr = new TextDecoder('ascii').decode(headerBuffer);
        if (!headerStr.startsWith('%PDF-')) {
          throw new Error('Corrupted or invalid PDF. Document is missing %PDF- header magic bytes.');
        }
      }

      const formData = new FormData();
      formData.append('file', file);
      if (title) formData.append('title', title);
      if (courseId) formData.append('courseId', courseId);
      if (focusArea) formData.append('customPromptFocus', focusArea);

      const res = await this.request<{ summary: ResearchSummary }>('/api/ai/summarize', {
        method: 'POST',
        body: formData,
      });
      return res.summary;
    }

    if (!materialText || !materialText.trim()) {
      throw new Error('Please enter study notes or upload a document to summarize.');
    }

    const res = await this.request<{ summary: ResearchSummary }>('/api/ai/summarize', {
      method: 'POST',
      body: JSON.stringify({ materialText, title, courseId, customPromptFocus: focusArea }),
    });
    return res.summary;
  }

  async getNews(params?: { category?: string; search?: string; page?: number; limit?: number }): Promise<NewsResponse> {
    const query = new URLSearchParams();
    if (params?.category) query.set('category', params.category);
    if (params?.search) query.set('search', params.search);
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));

    const qs = query.toString();
    return this.request<NewsResponse>(`/api/news${qs ? `?${qs}` : ''}`);
  }
}

export interface NewsItemDto {
  id: string;
  title: string;
  excerpt: string;
  url: string;
  source: string;
  category: string;
  imageUrl?: string | null;
  publishedAt: string;
}

export interface NewsResponse {
  items: NewsItemDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  lastUpdated: string;
  categories: string[];
}

export const api = new ApiService();
