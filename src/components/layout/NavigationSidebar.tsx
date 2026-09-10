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
  ChevronRight
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
  userProfile: UserProfile;
  course: Course;
  isBackendConnected?: boolean;
}

export const NavigationSidebar: React.FC<NavigationSidebarProps> = ({
  activeTab,
  onSelectTab,
  onOpenAddTask,
  onOpenFocusTimer,
  onOpenAiSummarizer,
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
        className="hidden md:flex lg:hidden flex-col items-center justify-between w-20 bg-white/95 backdrop-blur-xl border-r border-purple-100/80 py-6 sticky top-0 h-screen z-30 flex-shrink-0 select-none shadow-soft"
        aria-label="Tablet Navigation Rail"
      >
        {/* Top: Logo & Pinned Circular Plus Button */}
        <div className="flex flex-col items-center gap-6 w-full px-2">
          {/* App Logo Mark */}
          <div 
            onClick={() => onSelectTab('home')}
            className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-500 text-white flex items-center justify-center shadow-card cursor-pointer hover:scale-105 transition-transform"
            title="EduFlow - Home"
          >
            <Sparkles className="w-5 h-5 text-white" />
          </div>

          {/* Quick Action Circular Primary Button */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsQuickActionsDropdownOpen(!isQuickActionsDropdownOpen)}
              className="w-12 h-12 rounded-full bg-violet-600 hover:bg-violet-700 text-white flex items-center justify-center shadow-float-btn transition-all duration-200 active:scale-95"
              aria-label="Quick Actions Menu"
              title="Add activity / Focus session"
            >
              <Plus className="w-6 h-6 stroke-[2.5]" />
            </button>

            {/* Quick Action Popup Dropdown (Tablet) */}
            {isQuickActionsDropdownOpen && (
              <div className="absolute left-14 top-0 w-64 bg-white rounded-3xl border border-purple-100 shadow-2xl p-3 z-50 animate-slide-up space-y-1.5">
                <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-400 font-heading">
                  Quick Actions
                </div>
                <button
                  onClick={() => {
                    setIsQuickActionsDropdownOpen(false);
                    onOpenAddTask();
                  }}
                  className="w-full p-2.5 rounded-2xl bg-violet-50/60 hover:bg-violet-100/70 text-violet-900 flex items-center gap-3 transition text-left"
                >
                  <div className="w-7 h-7 rounded-xl bg-violet-600 text-white flex items-center justify-center shrink-0">
                    <Plus className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold font-heading">Add Study Task</div>
                    <div className="text-[10px] text-zinc-400">Schedule to today's plan</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setIsQuickActionsDropdownOpen(false);
                    onOpenFocusTimer();
                  }}
                  className="w-full p-2.5 rounded-2xl bg-teal-50/60 hover:bg-teal-100/70 text-teal-900 flex items-center gap-3 transition text-left"
                >
                  <div className="w-7 h-7 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0">
                    <Timer className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold font-heading">Start Focus Timer</div>
                    <div className="text-[10px] text-zinc-400">Pomodoro deep work</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setIsQuickActionsDropdownOpen(false);
                    onOpenAiSummarizer();
                  }}
                  className="w-full p-2.5 rounded-2xl bg-amber-50/60 hover:bg-amber-100/70 text-amber-900 flex items-center gap-3 transition text-left"
                >
                  <div className="w-7 h-7 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold font-heading">AI Summarizer</div>
                    <div className="text-[10px] text-zinc-400">Extract high-yield notes</div>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Navigation Destination Icons */}
          <nav className="flex flex-col items-center gap-2 w-full pt-4 border-t border-purple-50">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              const Icon = item.icon;

              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  title={item.label}
                  className={`relative p-3 rounded-2xl transition-all duration-200 ${
                    isActive
                      ? 'bg-violet-100/80 text-violet-700 shadow-soft scale-105'
                      : 'text-zinc-400 hover:text-zinc-700 hover:bg-purple-50/60'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon className="w-5 h-5 stroke-[2.2]" />
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-violet-600 rounded-r-full" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Avatar */}
        <div 
          onClick={() => onSelectTab('profile')}
          className="cursor-pointer p-1 rounded-full ring-2 ring-purple-100 hover:ring-violet-400 transition"
          title="Student Profile"
        >
          <InitialsAvatar
            name={userProfile.name}
            avatarUrl={userProfile.avatar}
            size="sm"
          />
        </div>
      </aside>

      {/* =========================================================================
          2. DESKTOP PERSISTENT SIDEBAR (≥ 1024px) : lg:flex
          ========================================================================= */}
      <aside 
        className="hidden lg:flex flex-col justify-between w-64 bg-white/95 backdrop-blur-xl border-r border-purple-100/80 p-5 sticky top-0 h-screen z-30 flex-shrink-0 select-none shadow-soft"
        aria-label="Desktop Persistent Sidebar"
      >
        <div className="space-y-6">
          {/* Logo & App Brand Header */}
          <div 
            onClick={() => onSelectTab('home')}
            className="flex items-center gap-3 cursor-pointer group px-1"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-500 text-white flex items-center justify-center shadow-card group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-extrabold text-[#1E1B4B] font-heading tracking-tight group-hover:text-violet-700 transition-colors">
                  EduFlow
                </span>
                <span className="px-1.5 py-0.2 rounded-md bg-violet-100 text-[10px] font-bold text-violet-700">
                  AI
                </span>
              </div>
              <span className="text-[11px] text-zinc-400 font-medium block">
                Focused Study Planner
              </span>
            </div>
          </div>

          {/* Prominent Primary Quick Action Button */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsQuickActionsDropdownOpen(!isQuickActionsDropdownOpen)}
              className="w-full py-3 px-4 bg-violet-600 hover:bg-violet-700 active:scale-[0.98] text-white font-bold rounded-2xl shadow-card transition-all flex items-center justify-between text-xs font-heading"
              aria-label="New Focus Activity"
            >
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-lg bg-white/20 flex items-center justify-center">
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <span>New Activity</span>
              </div>
              <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isQuickActionsDropdownOpen ? 'rotate-90' : ''}`} />
            </button>

            {/* Quick Actions Dropdown Menu (Desktop) */}
            {isQuickActionsDropdownOpen && (
              <div className="absolute left-0 right-0 top-12 bg-white rounded-3xl border border-purple-100 shadow-2xl p-3 z-50 animate-slide-up space-y-1.5">
                <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-400 font-heading">
                  Quick Actions
                </div>
                <button
                  onClick={() => {
                    setIsQuickActionsDropdownOpen(false);
                    onOpenAddTask();
                  }}
                  className="w-full p-2.5 rounded-2xl bg-violet-50/60 hover:bg-violet-100/70 text-violet-900 flex items-center gap-2.5 transition text-left"
                >
                  <div className="w-7 h-7 rounded-xl bg-violet-600 text-white flex items-center justify-center shrink-0">
                    <Plus className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold font-heading">Add Study Task</div>
                    <div className="text-[10px] text-zinc-400">Schedule to today's focus plan</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setIsQuickActionsDropdownOpen(false);
                    onOpenFocusTimer();
                  }}
                  className="w-full p-2.5 rounded-2xl bg-teal-50/60 hover:bg-teal-100/70 text-teal-900 flex items-center gap-2.5 transition text-left"
                >
                  <div className="w-7 h-7 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0">
                    <Timer className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold font-heading">Start Focus Session</div>
                    <div className="text-[10px] text-zinc-400">Pomodoro deep work mode</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setIsQuickActionsDropdownOpen(false);
                    onOpenAiSummarizer();
                  }}
                  className="w-full p-2.5 rounded-2xl bg-amber-50/60 hover:bg-amber-100/70 text-amber-900 flex items-center gap-2.5 transition text-left"
                >
                  <div className="w-7 h-7 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
                    <BookOpen className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold font-heading">AI Research Summarizer</div>
                    <div className="text-[10px] text-zinc-400">Extract high-yield study cards</div>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5" aria-label="Desktop Navigation Links">
            <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-400 font-heading">
              Main Menu
            </div>
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              const Icon = item.icon;

              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold font-heading transition-all duration-200 ${
                    isActive
                      ? 'bg-violet-50/90 text-violet-700 shadow-soft border border-violet-100'
                      : 'text-zinc-500 hover:text-zinc-800 hover:bg-purple-50/40'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-xl transition-colors ${isActive ? 'bg-violet-100 text-violet-700' : 'bg-transparent text-zinc-400'}`}>
                      <Icon className="w-4 h-4 stroke-[2.2]" />
                    </div>
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-violet-100 text-violet-700">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom User Card & Sync Indicator */}
        <div className="pt-4 border-t border-purple-100/80 space-y-3">
          {/* Active Course Track Pill */}
          <div className="p-3 bg-purple-50/50 rounded-2xl border border-purple-100/60">
            <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              Active Target
            </div>
            <div className="text-xs font-bold text-[#1E1B4B] truncate mt-0.5">
              {course.title}
            </div>
            <div className="flex items-center justify-between text-[11px] text-violet-700 font-medium mt-1">
              <span>{course.code}</span>
              <span className="font-bold">{course.streakDays}d Streak 🔥</span>
            </div>
          </div>

          {/* User Mini Profile */}
          <div 
            onClick={() => onSelectTab('profile')}
            className="flex items-center justify-between p-2 rounded-2xl hover:bg-purple-50/50 cursor-pointer transition"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <InitialsAvatar
                name={userProfile.name}
                avatarUrl={userProfile.avatar}
                size="sm"
              />
              <div className="min-w-0">
                <span className="text-xs font-bold text-[#1E1B4B] truncate block font-heading">
                  {userProfile.name}
                </span>
                <span className="text-[10px] text-zinc-400 truncate block">
                  {userProfile.email}
                </span>
              </div>
            </div>

            <div 
              title={isBackendConnected ? 'Cloud Synced' : 'Offline Ready'}
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: isBackendConnected ? '#10B981' : '#8B5CF6' }}
            />
          </div>
        </div>
      </aside>
    </>
  );
};
