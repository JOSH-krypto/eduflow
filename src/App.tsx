import React, { useState, useEffect } from 'react';
import { 
  Course, 
  UserProfile, 
  NotificationItem, 
  AgendaTask, 
  Phase, 
  TaskType,
  ResearchSummary,
  SubTopic
} from './types/eduflow';
import { 
  loadCourses, 
  saveCourses, 
  getActiveCourseId, 
  setActiveCourseId, 
  loadUserProfile, 
  saveUserProfile, 
  defaultUserProfile,
  clearUserData,
  loadNotifications, 
  saveNotifications, 
  recalculatePhaseProgress,
  loadResearchSummaries,
  addResearchSummary
} from './services/storage';
import { api } from './services/api';
import { applyTheme, ThemeMode, getStoredThemeMode, setStoredThemeMode } from './utils/theme';
import { SAMPLE_AWS_COURSE_TEMPLATE } from './data/sampleCourseTemplate';

// Layout Components
import { AppHeader } from './components/layout/AppHeader';
import { BottomTabBar, TabKey } from './components/layout/BottomTabBar';
import { NavigationSidebar } from './components/layout/NavigationSidebar';

// Tab Views
import { HomeTab } from './components/home/HomeTab';
import { PlanTab } from './components/plan/PlanTab';
import { ProgressTab } from './components/progress/ProgressTab';
import { ProfileTab } from './components/profile/ProfileTab';

// Modals & Sheets
import { QuickActionsSheet } from './components/modals/QuickActionsSheet';
import { AddTaskModal } from './components/modals/AddTaskModal';
import { FocusTimerModal } from './components/modals/FocusTimerModal';
import { ResearchSummarizerModal } from './components/research/ResearchSummarizerModal';
import { AcademicNewsModal } from './components/news/AcademicNewsModal';
import { PhaseDetailModal } from './components/modals/PhaseDetailModal';
import { CourseModal } from './components/modals/CourseModal';
import { AuthModal } from './components/auth/AuthModal';
import { Toast, ToastData } from './components/ui/Toast';

export const App: React.FC = () => {
  // Main Data States
  const [courses, setCourses] = useState<Course[]>([]);
  const [activeCourseId, setActiveCourseIdState] = useState<string>('');
  const [userProfile, setUserProfile] = useState<UserProfile>(loadUserProfile());
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [summaries, setSummaries] = useState<ResearchSummary[]>([]);
  const [activeTab, setActiveTab] = useState<TabKey>('home');
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [themeMode, setThemeModeState] = useState<ThemeMode>(getStoredThemeMode());

  // Floating Toast
  const [toast, setToast] = useState<ToastData | null>(null);

  // Modals & Bottom Sheets
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState<boolean>(false);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState<boolean>(false);
  const [isFocusTimerOpen, setIsFocusTimerOpen] = useState<boolean>(false);
  const [isAiSummarizerOpen, setIsAiSummarizerOpen] = useState<boolean>(false);
  const [isAcademicNewsModalOpen, setIsAcademicNewsModalOpen] = useState<boolean>(false);
  const [academicNewsCategory, setAcademicNewsCategory] = useState<string>('All');
  const [isCourseModalOpen, setIsCourseModalOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [selectedPhaseForDetail, setSelectedPhaseForDetail] = useState<Phase | null>(null);

  const [focusSessionData, setFocusSessionData] = useState<{
    title: string;
    type?: TaskType;
    duration?: number;
    taskId?: string;
  }>({
    title: 'Deep Focus Session',
    type: 'video',
    duration: 25,
  });

  // Show floating toast
  const triggerToast = (title: string, message: string, type: ToastData['type'] = 'success') => {
    setToast({
      id: `toast-${Date.now()}`,
      title,
      message,
      type,
    });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Handle Theme Change
  const handleThemeModeChange = (newMode: ThemeMode) => {
    setThemeModeState(newMode);
    setStoredThemeMode(newMode);
    applyTheme(userProfile.preferences?.accentColor, newMode);
    setUserProfile((prev) => ({
      ...prev,
      preferences: {
        ...prev.preferences!,
        themeMode: newMode,
      },
    }));
    if (isBackendConnected) {
      api
        .updateProfile({
          preferences: {
            preferredStudyDays: [1, 2, 3, 4, 5],
            preferredStudyTime: 'evening',
            streakReminders: true,
            examCountdownAlerts: true,
            newResourceAlerts: false,
            accentColor: '#8B5CF6',
            ...userProfile.preferences,
            themeMode: newMode,
          },
        })
        .catch(() => {});
    }
  };

  // Initial Load from Storage and check backend health
  useEffect(() => {
    const loadedCourses = loadCourses();
    const storedActiveId = getActiveCourseId();
    const loadedNotifs = loadNotifications();
    const loadedSummaries = loadResearchSummaries();
    const loadedProfile = loadUserProfile();

    setCourses(loadedCourses);
    setActiveCourseIdState(storedActiveId || (loadedCourses[0]?.id ?? ''));
    setNotifications(loadedNotifs);
    setSummaries(loadedSummaries);
    setUserProfile(loadedProfile);

    // Apply active theme tokens
    const initialMode = loadedProfile.preferences?.themeMode || getStoredThemeMode();
    setThemeModeState(initialMode);
    applyTheme(loadedProfile.preferences?.accentColor, initialMode);

    // Test backend connection and synchronize authenticated session
    api.healthCheck().then((healthy: boolean) => {
      setIsBackendConnected(healthy);
      if (healthy) {
        api.getMe().then((me) => {
          if (me && me.email) {
            setUserProfile(me);
            if (me.preferences?.themeMode) {
              setThemeModeState(me.preferences.themeMode);
              setStoredThemeMode(me.preferences.themeMode);
              applyTheme(me.preferences?.accentColor, me.preferences.themeMode);
            }
            api.getCourses().then((serverCourses) => {
              if (serverCourses) {
                setCourses(serverCourses);
                if (serverCourses.length > 0 && !storedActiveId) {
                  setActiveCourseIdState(serverCourses[0].id);
                  setActiveCourseId(serverCourses[0].id);
                }
              }
            });
          }
        });
      }
    });
  }, []);

  // Sync back to storage on state change
  useEffect(() => {
    saveCourses(courses);
  }, [courses]);

  useEffect(() => {
    saveUserProfile(userProfile);
    if (userProfile.preferences?.accentColor) {
      applyTheme(userProfile.preferences.accentColor, themeMode);
    }
  }, [userProfile, themeMode]);

  useEffect(() => {
    saveNotifications(notifications);
  }, [notifications]);

  // Current Active Course
  const activeCourse = courses.find((c) => c.id === activeCourseId) || courses[0] || null;

  const handleSelectCourse = (courseId: string) => {
    setActiveCourseIdState(courseId);
    setActiveCourseId(courseId);
    const selected = courses.find((c) => c.id === courseId);
    if (selected) {
      triggerToast('Course switched', 'Selected course is active.', 'info');
    }
  };

  const handleLoadSampleTemplate = () => {
    const existing = courses.find((c) => c.id === SAMPLE_AWS_COURSE_TEMPLATE.id);
    if (existing) {
      handleSelectCourse(existing.id);
      triggerToast('Course selected', 'Sample course is active.', 'info');
      return;
    }
    const updated = [SAMPLE_AWS_COURSE_TEMPLATE, ...courses];
    setCourses(updated);
    handleSelectCourse(SAMPLE_AWS_COURSE_TEMPLATE.id);
    triggerToast('Course added', 'Sample course is ready.', 'success');
  };

  const handleDeleteCourse = async (courseId: string) => {
    const updated = courses.filter((c) => c.id !== courseId);
    setCourses(updated);

    if (activeCourseId === courseId) {
      const nextActiveId = updated[0]?.id || '';
      setActiveCourseIdState(nextActiveId);
      setActiveCourseId(nextActiveId);
    }

    if (isBackendConnected) {
      try {
        await api.deleteCourse(courseId);
      } catch {
        // Silently handle backend sync error
      }
    }

    triggerToast(
      'Course deleted',
      'Course removed from list.',
      'info'
    );
  };

  // Toggle Agenda Task status
  const handleToggleTask = async (taskId: string) => {
    if (!activeCourse) return;

    let justCompleted = false;

    const updatedAgenda = activeCourse.agenda.map((task) => {
      if (task.id === taskId) {
        const nextStatus = task.status === 'completed' ? 'current' : 'completed';
        if (nextStatus === 'completed') {
          justCompleted = true;
        }
        return {
          ...task,
          status: nextStatus as any,
          progressPercent: nextStatus === 'completed' ? 100 : 0,
        };
      }
      return task;
    });

    const updatedPhases = recalculatePhaseProgress(activeCourse.phases, updatedAgenda);

    const updatedCourse: Course = {
      ...activeCourse,
      agenda: updatedAgenda,
      phases: updatedPhases,
    };

    const newCourses = courses.map((c) => (c.id === activeCourse.id ? updatedCourse : c));
    setCourses(newCourses);

    if (justCompleted) {
      triggerToast('Task completed', 'Marked done in agenda.', 'success');
    }

    if (isBackendConnected) {
      try {
        const taskToUpdate = updatedAgenda.find((t) => t.id === taskId);
        if (taskToUpdate) {
          await api.updateTask(taskId, {
            status: taskToUpdate.status,
            progressPercent: taskToUpdate.progressPercent,
          });
        }
      } catch {
        // Backend sync fallback handled gracefully
      }
    }
  };

  // Start Focus session from Agenda task
  const handleStartFocusSession = (task: AgendaTask) => {
    setFocusSessionData({
      title: task.title,
      type: task.type,
      duration: task.durationMinutes,
      taskId: task.id,
    });
    setIsFocusTimerOpen(true);
  };

  // Start study topic from Plan Roadmap
  const handleStartPlanTopic = (topicName: string, phase: Phase, subtopic?: SubTopic) => {
    setFocusSessionData({
      title: `${phase.title}: ${topicName}`,
      type: (subtopic?.type as TaskType) || 'reading',
      duration: subtopic?.durationMinutes || 25,
      taskId: subtopic?.id,
    });
    setIsFocusTimerOpen(true);
  };

  // Complete a focus timer block
  const handleCompleteFocusSession = async (log: any) => {
    if (activeCourse) {
      const updatedCourse: Course = {
        ...activeCourse,
        studiedHoursThisWeek: Number(
          ((activeCourse.studiedHoursThisWeek || 0) + log.durationMinutes / 60).toFixed(1)
        ),
      };

      if (focusSessionData.taskId) {
        updatedCourse.agenda = updatedCourse.agenda.map((t) =>
          t.id === focusSessionData.taskId
            ? { ...t, status: 'completed' as const, progressPercent: 100 }
            : t
        );
        updatedCourse.phases = recalculatePhaseProgress(
          updatedCourse.phases,
          updatedCourse.agenda
        );
      }

      setCourses(courses.map((c) => (c.id === activeCourse.id ? updatedCourse : c)));
    }

    if (isBackendConnected) {
      try {
        await api.logStudySession({
          courseId: activeCourse?.id || 'default',
          taskTitle: log.taskTitle,
          taskType: log.taskType,
          durationMinutes: log.durationMinutes,
          completedAt: new Date().toISOString(),
          notes: log.notes,
        });
      } catch {
        // Backend sync fallback handled gracefully
      }
    }

    triggerToast('Study session recorded', `${log.durationMinutes} minutes logged.`, 'success');
  };

  // Add a new task to agenda
  const handleAddTask = async (newTaskData: Omit<AgendaTask, 'id' | 'status'>) => {
    if (!activeCourse) return;

    const newTask: AgendaTask = {
      ...newTaskData,
      id: `task-${Date.now()}`,
      status: 'current',
      progressPercent: 0,
    };

    const updatedCourse: Course = {
      ...activeCourse,
      agenda: [newTask, ...activeCourse.agenda],
    };

    setCourses(courses.map((c) => (c.id === activeCourse.id ? updatedCourse : c)));
    triggerToast('Task added', 'Added to study agenda.', 'success');

    if (isBackendConnected) {
      try {
        await api.createTask({
          title: newTask.title,
          type: newTask.type,
          durationMinutes: newTask.durationMinutes,
          phaseId: newTask.phaseId,
        });
      } catch {
        // Backend sync fallback handled gracefully
      }
    }
  };

  // Save AI Research Summary
  const handleSaveSummary = (summary: ResearchSummary) => {
    const updated = addResearchSummary(summary);
    setSummaries(updated);
    triggerToast('Summary saved', 'Stored in research history.', 'success');
  };

  // Update profile
  const handleUpdateProfile = (updated: UserProfile) => {
    setUserProfile(updated);
    triggerToast('Profile updated', 'Account preferences were saved.', 'success');
  };

  // Sign out handler
  const handleSignOut = async () => {
    try {
      await api.logout();
    } catch {}
    clearUserData();
    setUserProfile(defaultUserProfile);
    setCourses([]);
    setActiveCourseIdState('');
    setActiveTab('home');
    setIsAuthModalOpen(true);
    triggerToast('Signed out', 'Session ended successfully.', 'info');
  };

  // Notifications Handlers
  const handleMarkAllNotifsRead = () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    setNotifications(updated);
  };

  const handleSelectNotification = (item: NotificationItem) => {
    const updated = notifications.map((n) => (n.id === item.id ? { ...n, read: true } : n));
    setNotifications(updated);
    if (item.linkTab) {
      setActiveTab(item.linkTab as TabKey);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#13111C] text-slate-900 dark:text-slate-100 font-sans antialiased selection:bg-amber-100 dark:selection:bg-amber-950 selection:text-amber-900 dark:selection:text-amber-200 flex flex-col md:flex-row transition-colors">
      {/* Tablet Slim Rail & Desktop Persistent Sidebar */}
      <NavigationSidebar
        activeTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab)}
        onOpenAddTask={() => {
          if (!activeCourse) {
            setIsCourseModalOpen(true);
          } else {
            setIsAddTaskOpen(true);
          }
        }}
        onOpenFocusTimer={() => setIsFocusTimerOpen(true)}
        onOpenAiSummarizer={() => setIsAiSummarizerOpen(true)}
        onOpenAcademicNews={() => {
          setAcademicNewsCategory('All');
          setIsAcademicNewsModalOpen(true);
        }}
        userProfile={userProfile}
        course={activeCourse}
        isBackendConnected={isBackendConnected}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen relative pb-20 md:pb-8">
        {/* Responsive Sticky Header */}
        <AppHeader
          userProfile={userProfile}
          course={activeCourse}
          courses={courses}
          onSelectCourse={handleSelectCourse}
          onOpenProfile={() => setActiveTab('profile')}
          onOpenCreateCourse={() => setIsCourseModalOpen(true)}
          onDeleteCourse={handleDeleteCourse}
          onLoadSampleCourse={handleLoadSampleTemplate}
          notifications={notifications}
          onMarkAllNotificationsRead={handleMarkAllNotifsRead}
          onSelectNotification={handleSelectNotification}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          themeMode={themeMode}
          onThemeModeChange={handleThemeModeChange}
        />

        {/* Tab Views Content */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 pt-4 pb-8 w-full max-w-7xl mx-auto">
          {activeTab === 'home' && (
            <HomeTab
              course={activeCourse}
              userProfile={userProfile}
              onContinueSession={handleStartFocusSession}
              onToggleTask={handleToggleTask}
              onOpenAllTasks={() => setActiveTab('plan')}
              onOpenQuickActions={() => setIsQuickActionsOpen(true)}
              onOpenCreateCourse={() => setIsCourseModalOpen(true)}
              onLoadSampleTemplate={handleLoadSampleTemplate}
              onOpenFullNews={(initialCat) => {
                setAcademicNewsCategory(initialCat || 'All');
                setIsAcademicNewsModalOpen(true);
              }}
              searchFilter={searchQuery}
            />
          )}

          {activeTab === 'plan' && (
            <PlanTab
              course={activeCourse}
              onOpenPhaseDetail={(phase) => setSelectedPhaseForDetail(phase)}
              onStartStudyTopic={handleStartPlanTopic}
              onOpenCreateCourse={() => setIsCourseModalOpen(true)}
            />
          )}

          {activeTab === 'progress' && (
            <ProgressTab
              course={activeCourse}
              userProfile={userProfile}
            />
          )}

          {activeTab === 'profile' && (
            <ProfileTab
              profile={userProfile}
              courses={courses}
              onUpdateProfile={handleUpdateProfile}
              onSignOut={handleSignOut}
              isBackendConnected={isBackendConnected}
              themeMode={themeMode}
              onThemeModeChange={handleThemeModeChange}
            />
          )}
        </main>

        {/* Mobile Fixed Bottom Tab Bar (< 768px only) */}
        <BottomTabBar
          activeTab={activeTab}
          onSelectTab={(tab) => setActiveTab(tab)}
          onOpenQuickActions={() => setIsQuickActionsOpen(true)}
        />
      </div>

      {/* Floating Toast Notification */}
      {toast && <Toast toast={toast} onClose={() => setToast(null)} />}

      {/* Quick Actions Bottom Sheet (Mobile) */}
      <QuickActionsSheet
        isOpen={isQuickActionsOpen}
        onClose={() => setIsQuickActionsOpen(false)}
        onOpenAddTask={() => {
          setIsQuickActionsOpen(false);
          if (!activeCourse) {
            setIsCourseModalOpen(true);
          } else {
            setIsAddTaskOpen(true);
          }
        }}
        onOpenFocusTimer={() => {
          setIsQuickActionsOpen(false);
          setIsFocusTimerOpen(true);
        }}
        onOpenAiSummarizer={() => {
          setIsQuickActionsOpen(false);
          setIsAiSummarizerOpen(true);
        }}
      />

      {/* Add Task Modal */}
      {activeCourse && (
        <AddTaskModal
          isOpen={isAddTaskOpen}
          onClose={() => setIsAddTaskOpen(false)}
          onAddTask={handleAddTask}
          phases={activeCourse.phases || []}
        />
      )}

      {/* Focus Timer Modal */}
      <FocusTimerModal
        isOpen={isFocusTimerOpen}
        onClose={() => setIsFocusTimerOpen(false)}
        taskTitle={focusSessionData.title}
        taskType={focusSessionData.type}
        defaultDurationMinutes={focusSessionData.duration || 25}
        onCompleteSession={handleCompleteFocusSession}
      />

      {/* AI Research Summarizer Modal */}
      <ResearchSummarizerModal
        isOpen={isAiSummarizerOpen}
        onClose={() => setIsAiSummarizerOpen(false)}
        course={activeCourse || undefined as any}
        summaries={summaries}
        onSaveSummary={handleSaveSummary}
        onAddTaskToAgenda={handleAddTask}
      />

      {/* Academic News Modal */}
      <AcademicNewsModal
        isOpen={isAcademicNewsModalOpen}
        onClose={() => setIsAcademicNewsModalOpen(false)}
        initialCategory={academicNewsCategory}
      />

      {/* Phase Detail Modal */}
      {selectedPhaseForDetail && (
        <PhaseDetailModal
          isOpen={!!selectedPhaseForDetail}
          onClose={() => setSelectedPhaseForDetail(null)}
          phase={selectedPhaseForDetail}
          onStartTopic={(subtopic) => {
            handleStartPlanTopic(subtopic.title, selectedPhaseForDetail, subtopic);
            setSelectedPhaseForDetail(null);
          }}
        />
      )}

      {/* Course Switch / Create Modal */}
      <CourseModal
        isOpen={isCourseModalOpen}
        onClose={() => setIsCourseModalOpen(false)}
        courses={courses}
        activeCourseId={activeCourseId}
        onSelectCourse={handleSelectCourse}
        onCreateCourse={(newCourse) => {
          const updated = [newCourse, ...courses];
          setCourses(updated);
          handleSelectCourse(newCourse.id);
          setIsCourseModalOpen(false);
          triggerToast('Course created', 'Course is now active.', 'success');
        }}
      />

      {/* Auth / Sign In Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={(user) => {
          setUserProfile(user);
          if (user.preferences?.themeMode) {
            setThemeModeState(user.preferences.themeMode);
            setStoredThemeMode(user.preferences.themeMode);
            applyTheme(user.preferences?.accentColor, user.preferences.themeMode);
          }
          setIsAuthModalOpen(false);
          api.getCourses().then((serverCourses) => {
            const list = serverCourses || [];
            setCourses(list);
            if (list.length > 0) {
              setActiveCourseIdState(list[0].id);
              setActiveCourseId(list[0].id);
            } else {
              setActiveCourseIdState('');
              setActiveCourseId('');
            }
          });
          triggerToast('Signed in', `Signed in as ${user.email}.`, 'success');
        }}
      />
    </div>
  );
};

export default App;
