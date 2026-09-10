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
  loadNotifications, 
  saveNotifications, 
  recalculatePhaseProgress,
  loadResearchSummaries,
  addResearchSummary
} from './services/storage';
import { fireCelebrationConfetti, fireSmallBurst } from './services/confetti';
import { api } from './services/api';

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
  const [activeCourseId, setActiveCourseIdState] = useState<string>('aws-saa-c03');
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
    title: 'Multi-AZ Auto Scaling & ALB Deployment',
    type: 'lab',
    duration: 30,
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
    setActiveCourseIdState(storedActiveId);
    setNotifications(loadedNotifs);
    setSummaries(loadedSummaries);
    setUserProfile(loadedProfile);

    // Test backend connection
    api.healthCheck().then((healthy: boolean) => {
      setIsBackendConnected(healthy);
    });
  }, []);

  // Sync back to storage on state change
  useEffect(() => {
    if (courses.length > 0) {
      saveCourses(courses);
    }
  }, [courses]);

  useEffect(() => {
    saveUserProfile(userProfile);
  }, [userProfile]);

  useEffect(() => {
    saveNotifications(notifications);
  }, [notifications]);

  // Current Active Course
  const activeCourse = courses.find((c) => c.id === activeCourseId) || courses[0];

  const handleSelectCourse = (courseId: string) => {
    setActiveCourseIdState(courseId);
    setActiveCourseId(courseId);
    const selected = courses.find((c) => c.id === courseId);
    if (selected) {
      triggerToast('Course Switched', `Active path: ${selected.title}`, 'info');
    }
  };

  const handleUpdateProfile = (updated: UserProfile) => {
    setUserProfile(updated);
    triggerToast('Profile Updated', 'Your settings and study preferences have been saved.', 'success');
  };

  // Toggle Task Completion
  const handleToggleTask = (taskId: string) => {
    if (!activeCourse) return;

    let justCompleted = false;
    const updatedAgenda = activeCourse.agenda.map((task) => {
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

    const updatedPhases = recalculatePhaseProgress(activeCourse.phases, updatedAgenda);

    const updatedCourse: Course = {
      ...activeCourse,
      agenda: updatedAgenda,
      phases: updatedPhases,
      completedSessionsToday: justCompleted
        ? activeCourse.completedSessionsToday + 1
        : Math.max(0, activeCourse.completedSessionsToday - 1),
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
    if (!activeCourse) return;

    const newTask: AgendaTask = {
      ...newTaskData,
      id: `task-${Date.now()}`,
      status: 'current',
      progressPercent: 0,
    };

    const updatedAgenda = [newTask, ...activeCourse.agenda];
    const updatedPhases = recalculatePhaseProgress(activeCourse.phases, updatedAgenda);

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
      studiedHoursThisWeek: Math.round((activeCourse.studiedHoursThisWeek + addedHours) * 10) / 10,
      completedSessionsToday: activeCourse.completedSessionsToday + 1,
    };

    if (focusSessionData.taskId) {
      updatedCourse.agenda = updatedCourse.agenda.map((t) =>
        t.id === focusSessionData.taskId
          ? { ...t, status: 'completed', progressPercent: 100 }
          : t
      );
      updatedCourse.phases = recalculatePhaseProgress(updatedCourse.phases, updatedCourse.agenda);
    }

    const updatedCourses = courses.map((c) => (c.id === updatedCourse.id ? updatedCourse : c));
    setCourses(updatedCourses);

    setUserProfile((prev) => ({
      ...prev,
      totalHoursStudied: Math.round((prev.totalHoursStudied + addedHours) * 10) / 10,
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

  if (!activeCourse) {
    return (
      <div className="min-h-screen bg-[#F8F7FC] flex items-center justify-center p-4">
        <div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F7FC] text-slate-800 font-sans antialiased selection:bg-violet-200 selection:text-violet-900 flex flex-col md:flex-row">
      {/* =========================================================================
          TABLET SLIM RAIL (md:) & DESKTOP PERSISTENT SIDEBAR (lg:)
          ========================================================================= */}
      <NavigationSidebar
        activeTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab)}
        onOpenAddTask={() => setIsAddTaskOpen(true)}
        onOpenFocusTimer={() => setIsFocusTimerOpen(true)}
        onOpenAiSummarizer={() => setIsAiSummarizerOpen(true)}
        userProfile={userProfile}
        course={activeCourse}
        isBackendConnected={isBackendConnected}
      />

      {/* =========================================================================
          MAIN CONTENT AREA (Spans remaining width)
          ========================================================================= */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen relative pb-20 md:pb-8">
        {/* Responsive Sticky Header */}
        <AppHeader
          userProfile={userProfile}
          course={activeCourse}
          courses={courses}
          onSelectCourse={handleSelectCourse}
          onOpenProfile={() => setActiveTab('profile')}
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
              searchFilter={searchQuery}
            />
          )}

          {activeTab === 'plan' && (
            <PlanTab
              course={activeCourse}
              onOpenPhaseDetail={(phase) => setSelectedPhaseForDetail(phase)}
              onStartStudyTopic={handleStartPlanTopic}
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
              onUpdateProfile={handleUpdateProfile}
              onSignOut={() => setIsAuthModalOpen(true)}
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
          setIsAddTaskOpen(true);
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
      <AddTaskModal
        isOpen={isAddTaskOpen}
        onClose={() => setIsAddTaskOpen(false)}
        onAddTask={handleAddTask}
        phases={activeCourse.phases}
      />

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
        course={activeCourse}
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
          setCourses([...courses, newCourse]);
          handleSelectCourse(newCourse.id);
          setIsCourseModalOpen(false);
        }}
      />

      {/* Auth / Sign In Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={(user) => {
          setUserProfile((prev) => ({
            ...prev,
            name: user.name,
            email: user.email,
            avatar: user.avatar || prev.avatar,
          }));
          triggerToast('Welcome Back!', `Signed in as ${user.name}`, 'success');
        }}
      />
    </div>
  );
};

export default App;
