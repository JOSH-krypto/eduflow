import React, { useState, useRef, useEffect } from 'react';
import { 
  Home, 
  Compass, 
  BarChart2, 
  User, 
  Plus, 
  Sparkles, 
  BookOpen, 
  Timer, 
  ChevronRight,
  Newspaper
} from 'lucide-react';
import { TabKey } from './BottomTabBar';
import { UserProfile, Course } from '../../types/eduflow';
import { InitialsAvatar } from '../common/InitialsAvatar';

interface NavigationSidebarProps {
  activeTab: TabKey;
  onSelectTab: (tab: TabKey) => void;
  onOpenAddTask: () => void;
  onOpenFocusTimer: () => void;
  onOpenAiSummarizer: () => void;
  onOpenAcademicNews?: () => void;
  userProfile: UserProfile;
  course?: Course | null;
  isBackendConnected?: boolean;
}

export const NavigationSidebar: React.FC<NavigationSidebarProps> = ({
  activeTab,
  onSelectTab,
  onOpenAddTask,
  onOpenFocusTimer,
  onOpenAiSummarizer,
  onOpenAcademicNews,
  userProfile,
  course,
  isBackendConnected = false,
}) => {
  const [isQuickActionsDropdownOpen, setIsQuickActionsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const navItems: { id: TabKey; label: string; icon: any; badge?: string }[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'plan', label: 'Study Plan', icon: Compass, badge: 'Roadmap' },
    { id: 'progress', label: 'Analytics', icon: BarChart2 },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsQuickActionsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      {/* =========================================================================
          1. TABLET SLIM RAIL (768px - 1023px) : md:flex lg:hidden
          ========================================================================= */}
      <aside 
        className="hidden md:flex lg:hidden flex-col items-center justify-between w-20 bg-white/95 dark:bg-[#13111C]/95 backdrop-blur-xl border-r border-slate-200/80 dark:border-[#2E2A44] py-6 sticky top-0 h-screen z-30 flex-shrink-0 select-none shadow-soft transition-colors"
        aria-label="Tablet Navigation Rail"
      >
        {/* Top: Logo & Pinned Circular Plus Button */}
        <div className="flex flex-col items-center gap-6 w-full px-2">
          {/* App Logo Mark */}
          <div 
            onClick={() => onSelectTab('home')}
            className="w-11 h-11 rounded-2xl bg-slate-900 dark:bg-[#2E2A44] text-amber-400 flex items-center justify-center shadow-card cursor-pointer hover:scale-105 transition-transform"
            title="EduFlow - Home"
          >
            <Sparkles className="w-5 h-5 text-amber-400" />
          </div>

          {/* Quick Action Circular Primary Button */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsQuickActionsDropdownOpen(!isQuickActionsDropdownOpen)}
              className="w-12 h-12 rounded-full bg-slate-900 dark:bg-[#2E2A44] hover:bg-slate-800 dark:hover:bg-[#3B3759] text-white flex items-center justify-center shadow-float-btn transition-all duration-200 active:scale-95 cursor-pointer ring-1 ring-white/10"
              aria-label="Quick Actions Menu"
              title="Add activity / Focus session / AI Notes"
            >
              <Plus className="w-6 h-6 stroke-[2.5] text-amber-400" />
            </button>

            {/* Quick Action Popup Dropdown (Tablet) */}
            {isQuickActionsDropdownOpen && (
              <div className="absolute left-14 top-0 w-64 bg-white dark:bg-[#1C1929] rounded-3xl border border-slate-200 dark:border-[#2E2A44] shadow-2xl p-3 z-50 animate-slide-up space-y-1.5">
                <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 font-heading">
                  Quick Actions
                </div>
                <button
                  onClick={() => {
                    setIsQuickActionsDropdownOpen(false);
                    onOpenAddTask();
                  }}
                  className="w-full p-2.5 rounded-2xl hover:bg-slate-100 dark:hover:bg-[#252236] text-slate-900 dark:text-slate-100 flex items-center gap-3 transition text-left cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-xl bg-slate-100 dark:bg-[#2E2A44] text-slate-900 dark:text-white flex items-center justify-center shrink-0">
                    <Plus className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold font-heading">Add Study Task</div>
                    <div className="text-[10px] text-slate-400">Schedule to today's plan</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setIsQuickActionsDropdownOpen(false);
                    onOpenFocusTimer();
                  }}
                  className="w-full p-2.5 rounded-2xl hover:bg-teal-50 dark:hover:bg-teal-950/40 text-slate-900 dark:text-slate-100 flex items-center gap-3 transition text-left cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-xl bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-300 flex items-center justify-center shrink-0">
                    <Timer className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold font-heading">Start Focus Timer</div>
                    <div className="text-[10px] text-slate-400">Pomodoro deep work</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setIsQuickActionsDropdownOpen(false);
                    onOpenAiSummarizer();
                  }}
                  className="w-full p-2.5 rounded-2xl hover:bg-amber-50 dark:hover:bg-amber-950/40 text-slate-900 dark:text-slate-100 flex items-center gap-3 transition text-left cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 flex items-center justify-center shrink-0">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold font-heading">AI Research Notes</div>
                    <div className="text-[10px] text-slate-400">Summarize PDF / text</div>
                  </div>
                </button>

                {onOpenAcademicNews && (
                  <button
                    onClick={() => {
                      setIsQuickActionsDropdownOpen(false);
                      onOpenAcademicNews();
                    }}
                    className="w-full p-2.5 rounded-2xl hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-900 dark:text-slate-100 flex items-center gap-3 transition text-left cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-xl bg-indigo-100 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-300 flex items-center justify-center shrink-0">
                      <Newspaper className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold font-heading">Academic News</div>
                      <div className="text-[10px] text-slate-400">Live feeds & research</div>
                    </div>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Navigation Destination Icons */}
          <nav className="flex flex-col items-center gap-2 w-full pt-4 border-t border-slate-100 dark:border-[#2E2A44]">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              const Icon = item.icon;

              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  title={item.label}
                  className={`relative p-3 rounded-2xl transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-slate-100 dark:bg-[#2E2A44] text-slate-900 dark:text-white shadow-soft scale-105'
                      : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#252236]'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon className="w-5 h-5 stroke-[2.2]" />
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-amber-500 rounded-r-full" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Avatar */}
        <div 
          onClick={() => onSelectTab('profile')}
          className="cursor-pointer p-1 rounded-full ring-2 ring-slate-100 dark:ring-[#2E2A44] hover:ring-amber-500 transition"
          title="Student Profile"
        >
          <InitialsAvatar
            name={userProfile.name || 'Student'}
            avatarUrl={userProfile.avatar}
            size="sm"
          />
        </div>
      </aside>

      {/* =========================================================================
          2. DESKTOP PERSISTENT SIDEBAR (≥ 1024px) : lg:flex
          ========================================================================= */}
      <aside 
        className="hidden lg:flex flex-col justify-between w-64 bg-white/95 dark:bg-[#13111C]/95 backdrop-blur-xl border-r border-slate-200/80 dark:border-[#2E2A44] p-5 sticky top-0 h-screen z-30 flex-shrink-0 select-none font-sans transition-colors"
        aria-label="Desktop Persistent Sidebar"
      >
        <div className="space-y-6">
          {/* Logo & App Brand Header */}
          <div 
            onClick={() => onSelectTab('home')}
            className="flex items-center gap-3 cursor-pointer group px-1"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-[#2E2A44] text-amber-400 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform ring-1 ring-white/10">
              <Sparkles className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-bold text-slate-900 dark:text-white tracking-tight group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                  EduFlow
                </span>
                <span className="px-1.5 py-0.2 rounded-md bg-amber-100 dark:bg-amber-950/60 text-[10px] font-bold text-amber-800 dark:text-amber-300 font-mono">
                  AI
                </span>
              </div>
              <span className="text-[11px] text-slate-400 dark:text-slate-400 font-medium block">
                Focused Study Planner
              </span>
            </div>
          </div>

          {/* Prominent Primary Quick Action Button */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsQuickActionsDropdownOpen(!isQuickActionsDropdownOpen)}
              className="w-full py-2.5 px-4 bg-slate-900 dark:bg-[#2E2A44] hover:bg-slate-800 dark:hover:bg-[#3B3759] active:scale-[0.98] text-white font-semibold rounded-full shadow-sm transition-all flex items-center justify-between text-xs cursor-pointer ring-1 ring-white/10"
              aria-label="New Focus Activity"
            >
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                  <Plus className="w-3.5 h-3.5 stroke-[3] text-amber-400" />
                </div>
                <span>New Activity</span>
              </div>
              <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isQuickActionsDropdownOpen ? 'rotate-90' : ''}`} />
            </button>

            {/* Quick Actions Dropdown Menu (Desktop) */}
            {isQuickActionsDropdownOpen && (
              <div className="absolute left-0 right-0 top-12 bg-white dark:bg-[#1C1929] rounded-2xl border border-slate-200/90 dark:border-[#2E2A44] shadow-2xl p-2.5 z-50 animate-slide-up space-y-1">
                <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">
                  Quick Actions
                </div>
                <button
                  onClick={() => {
                    setIsQuickActionsDropdownOpen(false);
                    onOpenAddTask();
                  }}
                  className="w-full p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-[#252236] text-slate-800 dark:text-slate-200 flex items-center gap-2.5 transition text-left cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-[#2E2A44] text-slate-700 dark:text-slate-200 flex items-center justify-center shrink-0">
                    <Plus className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">Add Study Task</div>
                    <div className="text-[10px] text-slate-400">Schedule to today's focus plan</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setIsQuickActionsDropdownOpen(false);
                    onOpenFocusTimer();
                  }}
                  className="w-full p-2.5 rounded-xl hover:bg-teal-50 dark:hover:bg-teal-950/40 text-slate-800 dark:text-slate-200 flex items-center gap-2.5 transition text-left cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-lg bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-300 flex items-center justify-center shrink-0">
                    <Timer className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">Start Focus Timer</div>
                    <div className="text-[10px] text-slate-400">Pomodoro focus sprint</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setIsQuickActionsDropdownOpen(false);
                    onOpenAiSummarizer();
                  }}
                  className="w-full p-2.5 rounded-xl hover:bg-amber-50 dark:hover:bg-amber-950/40 text-slate-800 dark:text-slate-200 flex items-center gap-2.5 transition text-left cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 flex items-center justify-center shrink-0">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">AI Research Notes</div>
                    <div className="text-[10px] text-slate-400">Summarize PDF / text</div>
                  </div>
                </button>

                {onOpenAcademicNews && (
                  <button
                    onClick={() => {
                      setIsQuickActionsDropdownOpen(false);
                      onOpenAcademicNews();
                    }}
                    className="w-full p-2.5 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-800 dark:text-slate-200 flex items-center gap-2.5 transition text-left cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-300 flex items-center justify-center shrink-0">
                      <Newspaper className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">Academic News</div>
                      <div className="text-[10px] text-slate-400">Live feeds & research</div>
                    </div>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Desktop Navigation Link Items List */}
          <nav className="space-y-1">
            <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Main Menu
            </div>
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              const Icon = item.icon;

              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-slate-100 dark:bg-[#2E2A44] text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-[#252236]'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-1 rounded-md transition-colors ${isActive ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
                      <Icon className="w-4 h-4 stroke-[2.2]" />
                    </div>
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-mono">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom User Card & Sync Indicator */}
        <div className="pt-4 border-t border-slate-200/80 dark:border-[#2E2A44] space-y-3">
          {/* Active Course Track Pill */}
          <div className="p-3 bg-slate-50 dark:bg-[#1C1929] rounded-xl border border-slate-200/70 dark:border-[#2E2A44]">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Active Target
            </div>
            <div className="text-xs font-bold text-slate-900 dark:text-white truncate mt-0.5">
              {course ? course.title : 'No active track'}
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400 font-medium mt-1">
              <span className="font-mono">{course ? course.code : '—'}</span>
              <span className="font-bold text-amber-600 dark:text-amber-400">
                {course && course.streakDays > 0 ? `${course.streakDays}d Streak 🔥` : '0d Streak'}
              </span>
            </div>
          </div>

          {/* User Mini Profile */}
          <div 
            onClick={() => onSelectTab('profile')}
            className="flex items-center justify-between p-2 rounded-2xl hover:bg-slate-100 dark:hover:bg-[#252236] cursor-pointer transition"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <InitialsAvatar
                name={userProfile.name || 'Student'}
                avatarUrl={userProfile.avatar}
                size="sm"
              />
              <div className="min-w-0">
                <span className="text-xs font-bold text-slate-900 dark:text-white truncate block font-heading">
                  {userProfile.name || 'Student'}
                </span>
                <span className="text-[10px] text-slate-400 truncate block">
                  {userProfile.email || 'Free Account'}
                </span>
              </div>
            </div>

            <div 
              title={isBackendConnected ? 'Cloud Synced' : 'Offline Ready'}
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: isBackendConnected ? '#10B981' : 'var(--theme-accent)' }}
            />
          </div>
        </div>
      </aside>
    </>
  );
};

export default NavigationSidebar;
