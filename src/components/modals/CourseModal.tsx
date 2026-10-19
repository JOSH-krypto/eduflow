import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { Course } from '../../types/eduflow';

interface CourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  courses?: Course[];
  activeCourseId?: string;
  onSelectCourse?: (courseId: string) => void;
  onCreateCourse?: (newCourse: Course) => void;
  onSaveCourse?: (newCourse: Course) => void;
}

export const CourseModal: React.FC<CourseModalProps> = ({
  isOpen,
  onClose,
  courses = [],
  activeCourseId,
  onSelectCourse,
  onCreateCourse,
  onSaveCourse,
}) => {
  if (!isOpen) return null;

  const [mode, setMode] = useState<'switch' | 'create'>(courses.length > 0 ? 'switch' : 'create');
  const [title, setTitle] = useState('');
  const [code, setCode] = useState('');
  const [category, setCategory] = useState('');
  const [examDate, setExamDate] = useState('2026-11-20');
  const [targetHours, setTargetHours] = useState(15);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const courseId = `course-${Date.now()}`;
    const newCourse: Course = {
      id: courseId,
      title: title.trim(),
      code: code.trim().toUpperCase() || 'COURSE',
      category: category.trim() || 'General',
      examDate,
      targetHoursPerWeek: Number(targetHours) || 15,
      studiedHoursThisWeek: 0,
      streakDays: 0,
      completedSessionsToday: 0,
      phases: [
        {
          id: `${courseId}-p1`,
          phaseNumber: 1,
          title: 'Core fundamentals',
          description: `Foundational syllabus topics and core domain patterns for ${title}.`,
          status: 'in_progress',
          dateRange: 'Week 1 - Week 3',
          progressPercent: 0,
          topicsCovered: ['Fundamentals', 'Architecture', 'Key services'],
          subtopics: [
            { id: `${courseId}-s1`, title: 'Core architecture overview', durationMinutes: 25, completed: false, type: 'video' },
            { id: `${courseId}-s2`, title: 'Domain principles and review notes', durationMinutes: 30, completed: false, type: 'reading' },
            { id: `${courseId}-s3`, title: 'Hands-on practice sandbox', durationMinutes: 45, completed: false, type: 'lab' },
            { id: `${courseId}-s4`, title: 'Knowledge checkpoint quiz', durationMinutes: 15, completed: false, type: 'quiz' },
          ],
        },
        {
          id: `${courseId}-p2`,
          phaseNumber: 2,
          title: 'Advanced topics and implementation',
          description: 'Detailed scenarios, performance optimization, and reliability.',
          status: 'locked',
          dateRange: 'Week 4 - Week 6',
          progressPercent: 0,
          topicsCovered: ['Optimization', 'Troubleshooting', 'Automation'],
          subtopics: [
            { id: `${courseId}-s5`, title: 'Trade-off analysis and patterns', durationMinutes: 35, completed: false, type: 'video' },
            { id: `${courseId}-s6`, title: 'Troubleshooting scenarios', durationMinutes: 50, completed: false, type: 'lab' },
          ],
        },
        {
          id: `${courseId}-p3`,
          phaseNumber: 3,
          title: 'Exam review and practice tests',
          description: 'Full-length practice questions, timed drills, and review.',
          status: 'locked',
          dateRange: 'Week 7 - Week 8',
          progressPercent: 0,
          topicsCovered: ['Practice tests', 'Review notes', 'Mock exams'],
          subtopics: [
            { id: `${courseId}-s7`, title: 'Timed practice test', durationMinutes: 90, completed: false, type: 'practice' },
            { id: `${courseId}-s8`, title: 'Final formula and concept review', durationMinutes: 30, completed: false, type: 'reading' },
          ],
        },
      ],
      agenda: [],
      resources: [],
      weeklyActivity: [
        { day: 'Mon', shortDate: 'M', hours: 0, targetHours: 3, studied: false },
        { day: 'Tue', shortDate: 'T', hours: 0, targetHours: 3, studied: false },
        { day: 'Wed', shortDate: 'W', hours: 0, targetHours: 3, studied: false },
        { day: 'Thu', shortDate: 'T', hours: 0, targetHours: 3, studied: false },
        { day: 'Fri', shortDate: 'F', hours: 0, targetHours: 3, studied: false },
        { day: 'Sat', shortDate: 'S', hours: 0, targetHours: 3, studied: false },
        { day: 'Sun', shortDate: 'S', hours: 0, targetHours: 3, studied: false },
      ],
      topicMastery: [
        { topic: 'Core architecture', masteryPercent: 0, totalQuestions: 10, correctQuestions: 0 },
        { topic: 'Key principles', masteryPercent: 0, totalQuestions: 10, correctQuestions: 0 },
        { topic: 'Practice labs', masteryPercent: 0, totalQuestions: 10, correctQuestions: 0 },
      ],
    };

    if (onCreateCourse) {
      onCreateCourse(newCourse);
    } else if (onSaveCourse) {
      onSaveCourse(newCourse);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/70 backdrop-blur-xs font-sans select-none">
      <div 
        className="w-full max-w-md bg-white dark:bg-[#1C1929] rounded-xl shadow-lg border border-slate-200 dark:border-[#2E2A44] overflow-hidden flex flex-col"
        role="dialog"
        aria-label="Courses"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-[#2E2A44] flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Courses
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Switch course or create a new study plan.
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-md bg-slate-100 dark:bg-[#2E2A44] hover:bg-slate-200 dark:hover:bg-[#3B3759] text-slate-500 dark:text-slate-300 flex items-center justify-center transition cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Toggle */}
        <div className="px-4 pt-2.5 pb-1 flex gap-2 border-b border-slate-200 dark:border-[#2E2A44] bg-slate-50 dark:bg-[#13111C]">
          <button
            onClick={() => setMode('switch')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition cursor-pointer tabular-nums ${
              mode === 'switch'
                ? 'bg-white dark:bg-[#2E2A44] text-slate-900 dark:text-white border border-slate-200 dark:border-[#3B3759]'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Courses ({courses.length})
          </button>
          <button
            onClick={() => setMode('create')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition cursor-pointer ${
              mode === 'create'
                ? 'bg-white dark:bg-[#2E2A44] text-slate-900 dark:text-white border border-slate-200 dark:border-[#3B3759]'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            New course
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 max-h-[60vh] overflow-y-auto">
          {mode === 'switch' ? (
            <div className="space-y-2">
              {courses.length === 0 && (
                <div className="p-6 text-center text-slate-500 dark:text-slate-400 space-y-2">
                  <p className="text-xs">No courses created yet.</p>
                  <button
                    onClick={() => setMode('create')}
                    className="px-3.5 py-1.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-lg text-xs font-medium cursor-pointer"
                  >
                    Create a course
                  </button>
                </div>
              )}
              {courses.map((c) => {
                const isActive = c.id === activeCourseId;
                return (
                  <div
                    key={c.id}
                    onClick={() => {
                      if (onSelectCourse) onSelectCourse(c.id);
                      onClose();
                    }}
                    className={`p-3 rounded-lg border transition-colors flex items-center justify-between cursor-pointer ${
                      isActive
                        ? 'bg-slate-100 dark:bg-[#2E2A44] border-slate-900 dark:border-slate-100'
                        : 'bg-white dark:bg-[#13111C] border-slate-200 dark:border-[#2E2A44] hover:bg-slate-50 dark:hover:bg-[#252236]'
                    }`}
                  >
                    <div className="space-y-0.5 min-w-0 flex-1 pr-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-900 dark:text-white truncate">{c.title}</span>
                        <span className="text-[10px] text-slate-500 tabular-nums">
                          {c.code}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
                        Exam: {c.examDate || 'No date set'} · {c.targetHoursPerWeek}h/week target
                      </p>
                    </div>

                    {isActive && (
                      <div className="w-5 h-5 rounded-full bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 stroke-[2.5]" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">
                  Course or exam title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Distributed Systems"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#13111C] border border-slate-200 dark:border-[#2E2A44] rounded-lg text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-slate-400"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">
                    Course code
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. CS-401"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#13111C] border border-slate-200 dark:border-[#2E2A44] rounded-lg text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-slate-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">
                    Target exam date
                  </label>
                  <input
                    type="date"
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#13111C] border border-slate-200 dark:border-[#2E2A44] rounded-lg text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-slate-400"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Computer Science"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#13111C] border border-slate-200 dark:border-[#2E2A44] rounded-lg text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-slate-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">
                    Weekly target (hours)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="80"
                    value={targetHours}
                    onChange={(e) => setTargetHours(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#13111C] border border-slate-200 dark:border-[#2E2A44] rounded-lg text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-slate-400"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2 bg-slate-100 dark:bg-[#13111C] hover:bg-slate-200 dark:hover:bg-[#252236] text-slate-700 dark:text-slate-300 font-medium rounded-lg text-xs transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 font-medium rounded-lg text-xs transition cursor-pointer border border-slate-700/20 dark:border-white/20"
                >
                  Create course
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseModal;
