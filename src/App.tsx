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
import { fireCelebrationConfetti, fireSmallBurst } from './services/confetti';
import { api } from './services/api';
import { applyTheme } from './utils/theme';
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

  // Floating Toast
  const [toast, setToast] = useState<ToastData | null>(null);

  // Modals & Bottom Sheets
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState<boolean>(false);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState<boolean>(false);
  const [isFocusTimerOpen, setIsFocusTimerOpen] = useState<boolean>(false);
  const [isAiSummarizerOpen, setIsAiSummarizerOpen] = useState<boolean>(false);
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
    applyTheme(loadedProfile.preferences?.accentColor);

    // Test backend connection and synchronize authenticated session
    api.healthCheck().then((healthy: boolean) => {
      setIsBackendConnected(healthy);
      if (healthy) {
        api.getMe().then((me) => {
          if (me && me.email) {
            setUserProfile(me);
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
      applyTheme(userProfile.preferences.accentColor);
    }
  }, [userProfile]);

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
      triggerToast('Course Switched', `Active path: ${selected.title}`, 'info');
    }
  };

  const handleLoadSampleTemplate = () => {
    const existing = courses.find((c) => c.id === SAMPLE_AWS_COURSE_TEMPLATE.id);
    if (existing) {
      handleSelectCourse(existing.id);
      triggerToast('Sample Course Selected', 'Sample AWS Solutions Architect track activated.', 'info');
      return;
    }
    const updated = [SAMPLE_AWS_COURSE_TEMPLATE, ...courses];
    setCourses(updated);
    handleSelectCourse(SAMPLE_AWS_COURSE_TEMPLATE.id);
    triggerToast('Sample Course Added', 'Sample AWS course ready. You can delete it anytime in 1-click.', 'success');
  };

  const handleDeleteCourse = async (courseId: string) => {
    await api.deleteCourse(courseId);
    const updated = courses.filter((c) => c.id !== courseId);
    setCourses(updated);
    if (activeCourseId === courseId) {
      const nextId = updated[0]?.id || '';
      setActiveCourseIdState(nextId);
      setActiveCourseId(nextId);
    }
    triggerToast('Course Removed', 'Study plan track removed successfully.', 'info');
  };

  const handleSignOut = async () => {
    try {
      await api.logout();
    } catch (err) {
      console.warn('Logout fallback:', err);
    }
    clearUserData();
    setUserProfile(defaultUserProfile);
    setCourses([]);
    setActiveCourseIdState('');
    setIsAuthModalOpen(true);
    triggerToast('Signed Out', 'You have been signed out successfully.', 'info');
  };

  const handleUpdateProfile = (updated: UserProfile) => {
    setUserProfile(updated);
    triggerToast('Profile Updated', 'Your settings and study preferences have been saved.', 'success');
  };

  // Toggle Task Completion
  const handleToggleTask = (taskId: string) => {
    if (!activeCourse) return;

    let justCompleted = false;
    const updatedAgenda = (activeCourse.agenda || []).map((task) => {
      if (task.id === taskId) {
        const newStatus = task.status === 'completed' ? 'current' : 'completed';
        if (newStatus === 'completed') {
          justCompleted = true;
        }
        return {
          ...task,
          status: newStatus as any,
          progressPercent: newStatus === 'completed' ? 100 : 0,
          completedAt: newStatus === 'completed' ? new Date().toISOString() : undefined,
        };
      }
      return task;
    });

    const updatedPhases = recalculatePhaseProgress(activeCourse.phases || [], updatedAgenda);

    const updatedCourse: Course = {
      ...activeCourse,
      agenda: updatedAgenda,
      phases: updatedPhases,
      completedSessionsToday: justCompleted
        ? (activeCourse.completedSessionsToday || 0) + 1
        : Math.max(0, (activeCourse.completedSessionsToday || 0) - 1),
    };

    const updatedCourses = courses.map((c) => (c.id === updatedCourse.id ? updatedCourse : c));
    setCourses(updatedCourses);

    if (justCompleted) {
      fireSmallBurst();
      triggerToast('Task Completed! 🎉', 'Streak maintained. Keep up the momentum!', 'success');
    }
  };

  // Add Task to Agenda
  const handleAddTask = (newTaskData: Omit<AgendaTask, 'id' | 'status'>) => {
    if (!activeCourse) {
      triggerToast('Create a Plan First', 'Please create a study course before scheduling tasks.', 'info');
      setIsCourseModalOpen(true);
      return;
    }

    const newTask: AgendaTask = {
      ...newTaskData,
      id: `task-${Date.now()}`,
      status: 'current',
      progressPercent: 0,
    };

    const updatedAgenda = [newTask, ...(activeCourse.agenda || [])];
    const updatedPhases = recalculatePhaseProgress(activeCourse.phases || [], updatedAgenda);

    const updatedCourse: Course = {
      ...activeCourse,
      agenda: updatedAgenda,
      phases: updatedPhases,
    };

    const updatedCourses = courses.map((c) => (c.id === updatedCourse.id ? updatedCourse : c));
    setCourses(updatedCourses);
    triggerToast('Task Scheduled', `"${newTask.title}" added to today's focus plan.`, 'success');
  };

  // Start Focus Session for a Task
  const handleStartFocusSession = (task: AgendaTask) => {
    setFocusSessionData({
      title: task.title,
      type: task.type,
      duration: task.durationMinutes,
      taskId: task.id,
    });
    setIsFocusTimerOpen(true);
  };

  // Start Focus Topic from Plan Tab
  const handleStartPlanTopic = (title: string, _phase: Phase, subtopic?: SubTopic) => {
    setFocusSessionData({
      title,
      type: subtopic?.type || 'video',
      duration: subtopic?.durationMinutes || 30,
      taskId: subtopic?.id,
    });
    setIsFocusTimerOpen(true);
  };

  // Focus Session Completed
  const handleCompleteFocusSession = (durationMinutes: number, _taskTitle: string) => {
    if (!activeCourse) return;

    const addedHours = Math.round((durationMinutes / 60) * 10) / 10;
    const updatedCourse: Course = {
      ...activeCourse,
      studiedHoursThisWeek: Math.round(((activeCourse.studiedHoursThisWeek || 0) + addedHours) * 10) / 10,
      completedSessionsToday: (activeCourse.completedSessionsToday || 0) + 1,
    };

    if (focusSessionData.taskId) {
      updatedCourse.agenda = (updatedCourse.agenda || []).map((t) =>
        t.id === focusSessionData.taskId
          ? { ...t, status: 'completed', progressPercent: 100 }
          : t
      );
      updatedCourse.phases = recalculatePhaseProgress(updatedCourse.phases || [], updatedCourse.agenda);
    }

    const updatedCourses = courses.map((c) => (c.id === updatedCourse.id ? updatedCourse : c));
    setCourses(updatedCourses);

    setUserProfile((prev) => ({
      ...prev,
      totalHoursStudied: Math.round(((prev.totalHoursStudied || 0) + addedHours) * 10) / 10,
    }));

    fireCelebrationConfetti();
    triggerToast('Session Logged! 🚀', `+${durationMinutes} mins recorded toward your weekly goal.`, 'success');
  };

  // Add Summary to Library
  const handleSaveSummary = (summary: ResearchSummary) => {
    const updated = addResearchSummary(summary);
    setSummaries(updated);
    triggerToast('Summary Saved', `"${summary.title}" added to your research library.`, 'success');
  };

  // Notifications
  const handleMarkAllNotifsRead = () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    setNotifications(updated);
    triggerToast('All Read', 'Notifications cleared.', 'info');
  };

  const handleSelectNotification = (item: NotificationItem) => {
    const updated = notifications.map((n) => (n.id === item.id ? { ...n, read: true } : n));
    setNotifications(updated);
    if (item.linkTab) {
      setActiveTab(item.linkTab as TabKey);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-900 font-sans antialiased selection:bg-amber-100 selection:text-amber-900 flex flex-col md:flex-row">
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
          triggerToast('Study Plan Created! 🚀', `"${newCourse.title}" is now active.`, 'success');
        }}
      />

      {/* Auth / Sign In Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={(user) => {
          setUserProfile(user);
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
          triggerToast(`Welcome, ${user.name}! 👋`, `Signed in as ${user.email}`, 'success');
        }}
      />
    </div>
  );
};

export default App;
