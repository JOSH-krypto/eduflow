import React, { useState } from 'react';
import { Bell, ChevronDown, Search, X, Plus } from 'lucide-react';
import { UserProfile, Course, NotificationItem } from '../../types/eduflow';
import { InitialsAvatar } from '../common/InitialsAvatar';
import { getDaysUntilExam } from '../../utils/dateUtils';
import { NotificationPanel } from '../modals/NotificationPanel';

interface AppHeaderProps {
  userProfile: UserProfile;
  course?: Course | null;
  courses: Course[];
  onSelectCourse: (courseId: string) => void;
  onOpenProfile: () => void;
  onOpenCreateCourse?: () => void;
  notifications: NotificationItem[];
  onMarkAllNotificationsRead: () => void;
  onSelectNotification: (item: NotificationItem) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  userProfile,
  course,
  courses,
  onSelectCourse,
  onOpenProfile,
  onOpenCreateCourse,
  notifications,
  onMarkAllNotificationsRead,
  onSelectNotification,
  searchQuery = '',
  onSearchChange,
}) => {
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isCoursePickerOpen, setIsCoursePickerOpen] = useState(false);

  const daysLeft = course?.examDate ? getDaysUntilExam(course.examDate) : null;
  const unreadNotifs = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-20 bg-[#F8F7FC]/90 backdrop-blur-md px-4 sm:px-6 lg:px-8 py-3 border-b border-purple-100/50 w-full transition-all font-sans">
      <div className="w-full max-w-7xl mx-auto flex items-center justify-between gap-3 sm:gap-6">
        {/* Left: User Avatar + Name Greeting */}
        <div 
          onClick={onOpenProfile}
          className="flex items-center gap-3 cursor-pointer group shrink-0"
          role="button"
          tabIndex={0}
          aria-label="View Profile & Settings"
        >
          <InitialsAvatar
            name={userProfile.name || 'Student'}
            avatarUrl={userProfile.avatar}
            size="md"
            className="ring-2 ring-purple-100 group-hover:ring-theme-accent transition-all"
          />

          <div className="min-w-0">
            <span className="text-[11px] text-zinc-400 font-medium block leading-none">
              Welcome back,
            </span>
            <span className="text-sm sm:text-base font-bold text-[#1E1B4B] font-heading truncate block mt-0.5 group-hover:text-theme-dark transition-colors">
              {userProfile.name || 'Student'}
            </span>
          </div>
        </div>

        {/* Center: Search Bar (Desktop ≥1024px) */}
        {onSearchChange && (
          <div className="hidden lg:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search modules, tasks, research summaries..."
                className="w-full pl-9 pr-8 py-2 bg-white border border-purple-100/80 rounded-2xl text-xs font-medium text-slate-800 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-theme-accent/30 focus:border-theme-accent shadow-soft transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-slate-100 text-slate-400 cursor-pointer"
                  aria-label="Clear search"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Right: Course / Streak Pill + Notification Bell */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Course Switcher / Countdown Pill */}
          {course ? (
            <div className="relative">
              <button
                onClick={() => setIsCoursePickerOpen(!isCoursePickerOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-purple-100/80 shadow-sm hover:border-purple-200 text-xs font-semibold text-theme-dark transition-all cursor-pointer"
                aria-label="Switch Course track"
              >
                <span className="truncate max-w-[85px] sm:max-w-[140px] font-heading font-bold">
                  {course.code || course.title}
                </span>
                {daysLeft !== null && daysLeft >= 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-theme-light text-[10px] font-bold text-theme-dark font-mono">
                    {daysLeft}d
                  </span>
                )}
                <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
              </button>

              {/* Course Switcher Dropdown */}
              {isCoursePickerOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setIsCoursePickerOpen(false)}
                    aria-hidden="true" 
                  />
                  <div className="absolute right-0 top-11 w-64 z-50 rounded-3xl bg-white border border-purple-100 shadow-2xl p-2.5 animate-slide-up space-y-1">
                    <div className="flex items-center justify-between px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-400 font-heading">
                      <span>Active Tracks</span>
                      {onOpenCreateCourse && (
                        <button
                          onClick={() => {
                            setIsCoursePickerOpen(false);
                            onOpenCreateCourse();
                          }}
                          className="text-theme-dark hover:underline flex items-center gap-0.5 text-[10px]"
                        >
                          <Plus className="w-3 h-3" />
                          <span>New</span>
                        </button>
                      )}
                    </div>
                    {courses.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => {
                          onSelectCourse(c.id);
                          setIsCoursePickerOpen(false);
                        }}
                        className={`w-full flex items-center justify-between p-2.5 rounded-2xl text-xs text-left transition-colors cursor-pointer ${
                          c.id === course.id
                            ? 'bg-theme-light text-theme-dark font-bold shadow-soft'
                            : 'text-zinc-600 hover:bg-zinc-50'
                        }`}
                      >
                        <span className="truncate font-sans font-medium">{c.title}</span>
                        {c.examDate && (
                          <span className="text-[10px] text-zinc-400 font-mono ml-2">
                            {getDaysUntilExam(c.examDate)}d
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          ) : (
            onOpenCreateCourse && (
              <button
                onClick={onOpenCreateCourse}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-theme-accent hover:opacity-90 text-white shadow-sm text-xs font-semibold transition-all cursor-pointer font-heading"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Study Plan</span>
              </button>
            )
          )}

          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="relative p-2 rounded-full bg-white border border-purple-100/80 shadow-sm hover:border-purple-200 text-zinc-600 hover:text-theme-dark transition-all cursor-pointer"
              aria-label="Open notifications"
            >
              <Bell className="w-4 h-4 stroke-[2.2]" />
              {unreadNotifs > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-theme-accent text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-white shadow-sm font-mono">
                  {unreadNotifs}
                </span>
              )}
            </button>

            <NotificationPanel
              isOpen={isNotifOpen}
              onClose={() => setIsNotifOpen(false)}
              notifications={notifications}
              onMarkAllRead={onMarkAllNotificationsRead}
              onSelectNotification={(item) => {
                onSelectNotification(item);
                setIsNotifOpen(false);
              }}
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
