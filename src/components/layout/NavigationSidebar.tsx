import React, { useState, useRef, useEffect } from 'react';
import { 
  Home, 
  Compass, 
  BarChart2, 
  User, 
  Plus, 
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

  const navItems: { id: TabKey; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'plan', label: 'Study plan', icon: Compass },
    { id: 'progress', label: 'Analytics', icon: BarChart2 },
    { id: 'profile', label: 'Profile', icon: User },
  ];

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
      {/* Tablet Slim Rail (768px - 1023px) */}
      <aside 
        className="hidden md:flex lg:hidden flex-col items-center justify-between w-20 bg-white dark:bg-[#13111C] border-r border-slate-200 dark:border-[#2E2A44] py-6 sticky top-0 h-screen z-30 flex-shrink-0 select-none transition-colors"
        aria-label="Tablet navigation rail"
      >
        <div className="flex flex-col items-center gap-6 w-full px-2">
          {/* Logo mark: clean geometric letterform */}
          <div 
            onClick={() => onSelectTab('home')}
            className="w-10 h-10 rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold text-sm tracking-tight flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity border border-slate-700/20 dark:border-white/20"
            title="EduFlow home"
          >
            EF
          </div>

          {/* Quick action button */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsQuickActionsDropdownOpen(!isQuickActionsDropdownOpen)}
              className="w-10 h-10 rounded-lg bg-slate-900 dark:bg-[#2E2A44] hover:bg-slate-800 dark:hover:bg-[#3B3759] text-white flex items-center justify-center transition-all cursor-pointer border border-slate-700/30 dark:border-white/10"
              aria-label="Quick actions menu"
              title="Add task, start session, or summarize"
            >
              <Plus className="w-5 h-5 text-white" />
            </button>

            {isQuickActionsDropdownOpen && (
              <div className="absolute left-12 top-0 w-60 bg-white dark:bg-[#1C1929] rounded-xl border border-slate-200 dark:border-[#2E2A44] shadow-lg p-2 z-50 space-y-1">
                <div className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Actions
                </div>
                <button
                  onClick={() => {
                    setIsQuickActionsDropdownOpen(false);
                    onOpenAddTask();
                  }}
                  className="w-full p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-[#252236] text-slate-900 dark:text-slate-100 flex items-center gap-2.5 transition text-left cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-slate-500 shrink-0" />
                  <div>
                    <div className="text-xs font-semibold">Add study task</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">Schedule to today's plan</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setIsQuickActionsDropdownOpen(false);
                    onOpenFocusTimer();
                  }}
                  className="w-full p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-[#252236] text-slate-900 dark:text-slate-100 flex items-center gap-2.5 transition text-left cursor-pointer"
                >
                  <Timer className="w-4 h-4 text-slate-500 shrink-0" />
                  <div>
                    <div className="text-xs font-semibold">Start focus timer</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">Timed study session</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setIsQuickActionsDropdownOpen(false);
                    onOpenAiSummarizer();
                  }}
                  className="w-full p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-[#252236] text-slate-900 dark:text-slate-100 flex items-center gap-2.5 transition text-left cursor-pointer"
                >
                  <BookOpen className="w-4 h-4 text-slate-500 shrink-0" />
                  <div>
                    <div className="text-xs font-semibold">Document summarizer</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">Summarize notes or PDF</div>
                  </div>
                </button>

                {onOpenAcademicNews && (
                  <button
                    onClick={() => {
                      setIsQuickActionsDropdownOpen(false);
                      onOpenAcademicNews();
                    }}
                    className="w-full p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-[#252236] text-slate-900 dark:text-slate-100 flex items-center gap-2.5 transition text-left cursor-pointer"
                  >
                    <Newspaper className="w-4 h-4 text-slate-500 shrink-0" />
                    <div>
                      <div className="text-xs font-semibold">Academic news</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">Research feeds</div>
                    </div>
                  </button>
                )}
              </div>
            )}
          </div>

          <nav className="flex flex-col items-center gap-1.5 w-full pt-4 border-t border-slate-200 dark:border-[#2E2A44]">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              const Icon = item.icon;

              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  title={item.label}
                  className={`p-2.5 rounded-lg transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-slate-100 dark:bg-[#2E2A44] text-slate-900 dark:text-white font-medium'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#252236]'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon className="w-5 h-5" />
                </button>
              );
            })}
          </nav>
        </div>

        <div 
          onClick={() => onSelectTab('profile')}
          className="cursor-pointer p-0.5 rounded-full hover:opacity-80 transition-opacity"
          title="Profile"
        >
          <InitialsAvatar
            name={userProfile.name || 'User'}
            avatarUrl={userProfile.avatar}
            size="sm"
          />
        </div>
      </aside>

      {/* Desktop Persistent Sidebar (>= 1024px) */}
      <aside 
        className="hidden lg:flex flex-col justify-between w-64 bg-white dark:bg-[#13111C] border-r border-slate-200 dark:border-[#2E2A44] p-5 sticky top-0 h-screen z-30 flex-shrink-0 select-none font-sans transition-colors"
        aria-label="Sidebar navigation"
      >
        <div className="space-y-6">
          {/* Logo & wordmark */}
          <div 
            onClick={() => onSelectTab('home')}
            className="flex items-center gap-3 cursor-pointer px-1"
          >
            <div className="w-8 h-8 rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs tracking-tight flex items-center justify-center border border-slate-700/20 dark:border-white/20">
              EF
            </div>
            <div>
              <span className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                EduFlow
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                Study planner
              </span>
            </div>
          </div>

          {/* New session button */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsQuickActionsDropdownOpen(!isQuickActionsDropdownOpen)}
              className="w-full py-2 px-3 bg-slate-900 dark:bg-[#2E2A44] hover:bg-slate-800 dark:hover:bg-[#3B3759] text-white font-medium rounded-lg transition-colors flex items-center justify-between text-xs cursor-pointer border border-slate-700/30 dark:border-white/10"
              aria-label="Quick actions menu"
            >
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-white" />
                <span>New session</span>
              </div>
              <ChevronRight className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isQuickActionsDropdownOpen ? 'rotate-90' : ''}`} />
            </button>

            {isQuickActionsDropdownOpen && (
              <div className="absolute left-0 right-0 top-11 bg-white dark:bg-[#1C1929] rounded-xl border border-slate-200 dark:border-[#2E2A44] shadow-lg p-2 z-50 space-y-1">
                <div className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Actions
                </div>
                <button
                  onClick={() => {
                    setIsQuickActionsDropdownOpen(false);
                    onOpenAddTask();
                  }}
                  className="w-full p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-[#252236] text-slate-900 dark:text-slate-100 flex items-center gap-2.5 transition text-left cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-slate-500 shrink-0" />
                  <div>
                    <div className="text-xs font-semibold">Add study task</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">Schedule to today's plan</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setIsQuickActionsDropdownOpen(false);
                    onOpenFocusTimer();
                  }}
                  className="w-full p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-[#252236] text-slate-900 dark:text-slate-100 flex items-center gap-2.5 transition text-left cursor-pointer"
                >
                  <Timer className="w-4 h-4 text-slate-500 shrink-0" />
                  <div>
                    <div className="text-xs font-semibold">Start focus timer</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">Timed study session</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setIsQuickActionsDropdownOpen(false);
                    onOpenAiSummarizer();
                  }}
                  className="w-full p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-[#252236] text-slate-900 dark:text-slate-100 flex items-center gap-2.5 transition text-left cursor-pointer"
                >
                  <BookOpen className="w-4 h-4 text-slate-500 shrink-0" />
                  <div>
                    <div className="text-xs font-semibold">Document summarizer</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">Summarize notes or PDF</div>
                  </div>
                </button>

                {onOpenAcademicNews && (
                  <button
                    onClick={() => {
                      setIsQuickActionsDropdownOpen(false);
                      onOpenAcademicNews();
                    }}
                    className="w-full p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-[#252236] text-slate-900 dark:text-slate-100 flex items-center gap-2.5 transition text-left cursor-pointer"
                  >
                    <Newspaper className="w-4 h-4 text-slate-500 shrink-0" />
                    <div>
                      <div className="text-xs font-semibold">Academic news</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">Research feeds</div>
                    </div>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            <div className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Menu
            </div>
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              const Icon = item.icon;

              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-slate-100 dark:bg-[#2E2A44] text-slate-900 dark:text-white'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-[#252236]'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                    <span>{item.label}</span>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom course card & user summary */}
        <div className="pt-4 border-t border-slate-200 dark:border-[#2E2A44] space-y-3">
          <div className="p-3 bg-slate-50 dark:bg-[#1C1929] rounded-lg border border-slate-200 dark:border-[#2E2A44]">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Active course
            </div>
            <div className="text-xs font-semibold text-slate-900 dark:text-white truncate mt-0.5">
              {course ? course.title : 'No active course'}
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400 mt-1 tabular-nums font-sans">
              <span>{course ? course.code : '-'}</span>
              <span>
                {course && course.streakDays > 0 ? `${course.streakDays}d streak` : '0d streak'}
              </span>
            </div>
          </div>

          <div 
            onClick={() => onSelectTab('profile')}
            className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-[#252236] cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <InitialsAvatar
                name={userProfile.name || 'User'}
                avatarUrl={userProfile.avatar}
                size="sm"
              />
              <div className="min-w-0">
                <span className="text-xs font-semibold text-slate-900 dark:text-white truncate block">
                  {userProfile.name || 'User'}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate block">
                  Settings & preferences
                </span>
              </div>
            </div>

            <div 
              title={isBackendConnected ? 'Connected' : 'Offline'}
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: isBackendConnected ? '#10B981' : '#94A3B8' }}
            />
          </div>
        </div>
      </aside>
    </>
  );
};

export default NavigationSidebar;
