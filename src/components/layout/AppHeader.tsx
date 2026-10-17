import React, { useState, useEffect } from 'react';
import { Bell, ChevronDown, Search, X, Plus, Trash2 } from 'lucide-react';
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
  onDeleteCourse?: (courseId: string) => void;
  onLoadSampleCourse?: () => void;
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
  onDeleteCourse,
  onLoadSampleCourse,
  notifications,
  onMarkAllNotificationsRead,
  onSelectNotification,
  searchQuery = '',
  onSearchChange,
}) => {
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isCoursePickerOpen, setIsCoursePickerOpen] = useState(false);

  // Close dropdown on Escape key
  useEffect(() => {
    if (!isCoursePickerOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsCoursePickerOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCoursePickerOpen]);

  const daysLeft = course?.examDate ? getDaysUntilExam(course.examDate) : null;
  const unreadNotifs = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md px-4 sm:px-6 lg:px-8 py-3 border-b border-slate-200/80 w-full transition-all font-sans select-none">
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
            className="ring-2 ring-slate-100 group-hover:ring-slate-900 transition-all shadow-sm"
          />

          <div className="min-w-0">
            <span className="text-[11px] text-slate-400 font-medium block leading-none">
              Welcome back,
            </span>
            <span className="text-sm sm:text-base font-bold text-slate-900 truncate block mt-0.5 group-hover:text-amber-600 transition-colors">
              {userProfile.name || 'Student'}
            </span>
          </div>
        </div>

        {/* Center: Search Bar (Desktop ≥1024px) */}
        {onSearchChange && (
          <div className="hidden lg:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search benchmarks, modules, tasks, research papers..."
                className="w-full pl-9 pr-8 py-2 bg-slate-50 hover:bg-white border border-slate-200/90 rounded-full text-xs font-medium text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 shadow-sm transition-all"
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
          <div className="relative">
            {course ? (
              <button
                onClick={() => setIsCoursePickerOpen(!isCoursePickerOpen)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-slate-200/90 shadow-sm hover:border-slate-300 hover:bg-slate-50 text-xs font-semibold text-slate-800 transition-all cursor-pointer"
                aria-label="Switch Course track"
                aria-expanded={isCoursePickerOpen}
              >
                <span className="truncate max-w-[85px] sm:max-w-[140px] font-bold">
                  {course.code || course.title}
                </span>
                {daysLeft !== null && daysLeft >= 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-slate-100 text-[10px] font-bold text-slate-700 font-mono">
                    {daysLeft}d
                  </span>
                )}
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>
            ) : (
              <button
                onClick={() => setIsCoursePickerOpen(!isCoursePickerOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200/90 shadow-sm hover:border-slate-300 hover:bg-slate-100 text-xs font-semibold text-slate-600 transition-all cursor-pointer"
                aria-label="No active track. Open track selector"
                aria-expanded={isCoursePickerOpen}
              >
                <span className="truncate max-w-[110px] text-slate-500 font-medium">No active track</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>
            )}

            {/* Course Switcher Popover (Clean position below button, z-50, Escape to dismiss) */}
            {isCoursePickerOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setIsCoursePickerOpen(false)}
                  aria-hidden="true" 
                />
                <div 
                  role="dialog"
                  aria-label="Active Tracks Menu"
                  className="absolute right-0 top-full mt-2 w-72 sm:w-80 z-50 rounded-2xl bg-white border border-slate-200/90 shadow-2xl p-2.5 animate-slide-up space-y-1"
                >
                  <div className="flex items-center justify-between px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <span>Active Tracks ({courses.length})</span>
                    {onOpenCreateCourse && (
                      <button
                        onClick={() => {
                          setIsCoursePickerOpen(false);
                          onOpenCreateCourse();
                        }}
                        className="text-slate-900 font-semibold hover:underline flex items-center gap-0.5 text-[10px] cursor-pointer"
                      >
                        <Plus className="w-3 h-3 text-amber-500" />
                        <span>+ New</span>
                      </button>
                    )}
                  </div>

                  {courses.length === 0 ? (
                    <div className="p-3 text-center space-y-2.5">
                      <p className="text-xs text-slate-400">No active tracks yet.</p>
                      {onOpenCreateCourse && (
                        <button
                          onClick={() => {
                            setIsCoursePickerOpen(false);
                            onOpenCreateCourse();
                          }}
                          className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5 text-amber-400" />
                          <span>Create First Study Plan</span>
                        </button>
                      )}
                      {onLoadSampleCourse && (
                        <button
                          onClick={() => {
                            setIsCoursePickerOpen(false);
                            onLoadSampleCourse();
                          }}
                          className="w-full py-1.5 text-[11px] text-slate-500 hover:text-slate-800 underline transition cursor-pointer"
                        >
                          Try a sample course
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-1 max-h-60 overflow-y-auto">
                      {courses.map((c) => {
                        const isSelected = course && c.id === course.id;
                        return (
                          <div 
                            key={c.id} 
                            className={`flex items-center justify-between rounded-xl transition group ${
                              isSelected ? 'bg-slate-100 text-slate-900 font-bold' : 'hover:bg-slate-50 text-slate-700'
                            }`}
                          >
                            <button
                              onClick={() => {
                                onSelectCourse(c.id);
                                setIsCoursePickerOpen(false);
                              }}
                              className="flex-1 flex items-center justify-between p-2.5 text-xs text-left cursor-pointer"
                            >
                              <span className="truncate font-sans font-medium">{c.title}</span>
                              {c.examDate && (
                                <span className="text-[10px] text-slate-400 font-mono ml-2 shrink-0">
                                  {getDaysUntilExam(c.examDate)}d
                                </span>
                              )}
                            </button>
                            {onDeleteCourse && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDeleteCourse(c.id);
                                }}
                                className="p-1.5 mr-1 text-slate-300 hover:text-rose-500 rounded-lg hover:bg-rose-50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                title="Delete track"
                                aria-label={`Delete ${c.title}`}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

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
