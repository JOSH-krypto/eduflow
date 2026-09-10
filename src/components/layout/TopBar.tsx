import React, { useState } from 'react';
import { 
  Search, 
  Bell, 
  ChevronDown, 
  Plus, 
  Download,
  Menu,
  X,
  Check,
  Calendar,
  Clock
} from 'lucide-react';
import { Course, NotificationItem } from '../../types/eduflow';
import { NotificationPanel } from '../modals/NotificationPanel';
import { getDaysUntilExam, formatExamDate } from '../../utils/dateUtils';

interface TopBarProps {
  courses: Course[];
  activeCourse: Course;
  onSelectCourse: (courseId: string) => void;
  onOpenNewCourseModal: () => void;
  onOpenFocusTimer?: () => void;
  onOpenExportModal: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  notifications: NotificationItem[];
  onMarkAllNotificationsRead: () => void;
  onSelectNotification: (item: NotificationItem) => void;
  onToggleMobileNav: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  courses,
  activeCourse,
  onSelectCourse,
  onOpenNewCourseModal,
  onOpenExportModal,
  searchQuery,
  onSearchChange,
  notifications,
  onMarkAllNotificationsRead,
  onSelectNotification,
  onToggleMobileNav,
}) => {
  const [isCourseDropdownOpen, setIsCourseDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Real computed countdown and formatted date
  const daysLeft = getDaysUntilExam(activeCourse.examDate);
  const formattedExamDate = formatExamDate(activeCourse.examDate);
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="sticky top-0 z-20 h-16 bg-[#0D0D0F]/90 backdrop-blur-md border-b border-white/[0.08] px-4 lg:px-8 flex items-center justify-between gap-4">
      {/* Left: Mobile Nav Toggle + Course Title with Switcher */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onToggleMobileNav}
          className="lg:hidden p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors"
          aria-label="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Course Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsCourseDropdownOpen(!isCourseDropdownOpen)}
            className="flex items-center gap-2 px-2.5 py-1.5 -ml-2.5 rounded-xl hover:bg-white/[0.04] transition-colors group text-left"
            aria-expanded={isCourseDropdownOpen}
            aria-label="Switch Certification Course"
          >
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h1 className="text-base lg:text-lg font-bold text-white font-heading tracking-tight truncate max-w-[200px] sm:max-w-[320px] md:max-w-[420px]">
                  {activeCourse.title}
                </h1>
                <span className="hidden sm:inline-flex text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-white/[0.08] text-zinc-400 group-hover:text-zinc-200 font-heading">
                  {activeCourse.code}
                </span>
                <ChevronDown className="w-4 h-4 text-zinc-400 group-hover:text-zinc-200 transition-transform flex-shrink-0" />
              </div>

              {/* Subtitle with Real Dynamic Countdown & Date */}
              <p className="text-xs text-zinc-400 font-medium flex items-center gap-1.5 mt-0.5 font-sans">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-zinc-500" />
                  Target: {formattedExamDate}
                </span>
                <span className="text-zinc-600 font-bold">•</span>
                <span className="text-[#F5A623] font-bold bg-[#F5A623]/10 px-1.5 py-0.2 rounded inline-flex items-center gap-1 font-heading">
                  <Clock className="w-3 h-3" />
                  {daysLeft} days left
                </span>
              </p>
            </div>
          </button>

          {/* Course Switcher Dropdown Menu */}
          {isCourseDropdownOpen && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setIsCourseDropdownOpen(false)}
                aria-hidden="true" 
              />
              <div className="absolute left-0 top-14 w-72 sm:w-80 z-50 rounded-2xl bg-[#141416] border border-white/[0.12] shadow-2xl overflow-hidden animate-scale-in">
                <div className="px-3.5 py-2.5 bg-[#18181C] border-b border-white/[0.06] flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 font-heading">
                    Switch Certification
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#F5A623]/20 text-[#F5A623] font-semibold">
                    {courses.length} Active
                  </span>
                </div>

                <div className="p-1.5 max-h-64 overflow-y-auto space-y-1">
                  {courses.map((course) => {
                    const isSelected = course.id === activeCourse.id;
                    return (
                      <button
                        key={course.id}
                        onClick={() => {
                          onSelectCourse(course.id);
                          setIsCourseDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs transition-colors ${
                          isSelected 
                            ? 'bg-[#F5A623]/15 text-[#F5A623] font-semibold' 
                            : 'text-zinc-300 hover:bg-white/[0.04]'
                        }`}
                      >
                        <div className="flex flex-col min-w-0 pr-2">
                          <span className="truncate text-white font-medium font-sans">
                            {course.title}
                          </span>
                          <span className="text-[10px] text-zinc-400 mt-0.5">
                            {course.code} · {course.phases.length} Phases · {getDaysUntilExam(course.examDate)}d left
                          </span>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-[#F5A623] flex-shrink-0" />}
                      </button>
                    );
                  })}
                </div>

                <div className="p-2 bg-[#18181C] border-t border-white/[0.06]">
                  <button
                    onClick={() => {
                      setIsCourseDropdownOpen(false);
                      onOpenNewCourseModal();
                    }}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-white/[0.06] hover:bg-[#F5A623] hover:text-black text-xs font-bold text-zinc-200 transition-all duration-200 font-heading"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Add New Certification</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Right: Live Search Input + Export Button + Notification Bell */}
      <div className="flex items-center gap-2.5 sm:gap-3 flex-shrink-0">
        {/* Live Search Bar */}
        <div className="relative hidden md:block w-48 lg:w-64">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search topics, labs, notes..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#141416] border border-white/[0.08] hover:border-white/[0.15] focus:border-[#F5A623] rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-[#F5A623] transition-all font-sans"
            aria-label="Search topics across study path and library"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Quick Export Button */}
        <button
          onClick={onOpenExportModal}
          className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-[#141416] border border-white/[0.08] hover:border-white/[0.16] text-zinc-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all font-sans"
          aria-label="Export Study Schedule as iCal or PDF"
          title="Export Study Schedule (.ics / PDF)"
        >
          <Download className="w-4 h-4 text-zinc-400" />
          <span className="hidden sm:inline">Export</span>
        </button>

        {/* Notification Bell Button */}
        <div className="relative">
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="relative p-2 rounded-xl bg-[#141416] border border-white/[0.08] hover:border-[#F5A623]/50 text-zinc-300 hover:text-white transition-all"
            aria-label="Open notifications"
            aria-expanded={isNotificationsOpen}
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#F5A623] text-black text-[9px] font-extrabold flex items-center justify-center ring-2 ring-[#0D0D0F] animate-pulse-subtle">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notification Dropdown Panel */}
          <NotificationPanel
            isOpen={isNotificationsOpen}
            onClose={() => setIsNotificationsOpen(false)}
            notifications={notifications}
            onMarkAllRead={onMarkAllNotificationsRead}
            onSelectNotification={(item) => {
              onSelectNotification(item);
              setIsNotificationsOpen(false);
            }}
          />
        </div>
      </div>
    </header>
  );
};
