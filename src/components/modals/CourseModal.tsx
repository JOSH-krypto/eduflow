import React, { useState } from 'react';
import { X, Award, Plus, Check, Sparkles } from 'lucide-react';
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

    const courseId = `custom-cert-${Date.now()}`;
    const newCourse: Course = {
      id: courseId,
      title: title.trim(),
      code: code.trim().toUpperCase() || 'CERT',
      category: category.trim() || 'General',
      examDate,
      targetHoursPerWeek: Number(targetHours) || 15,
      studiedHoursThisWeek: 0,
      streakDays: 1,
      completedSessionsToday: 0,
      phases: [
        {
          id: `${courseId}-p1`,
          phaseNumber: 1,
          title: 'Core Fundamentals & Key Concepts',
          description: `Master foundational syllabus topics and core domain patterns for ${title}.`,
          status: 'in_progress',
          dateRange: 'Week 1 – Week 3',
          progressPercent: 0,
          topicsCovered: ['Fundamentals', 'Domain Architecture', 'Key Services', 'Security'],
          nextVideo: {
            type: 'video',
            label: 'NEXT VIDEO',
            title: `${title} Architecture Overview`,
            duration: '18m',
          },
          upcomingLab: {
            type: 'lab',
            label: 'HANDS-ON LAB',
            title: `Hands-on Sandbox Setup & Verification`,
            duration: '35m',
          },
          subtopics: [
            { id: `${courseId}-s1`, title: 'Core Architecture Overview & Mental Model', durationMinutes: 25, completed: false, type: 'video' },
            { id: `${courseId}-s2`, title: 'High-Yield Domain Principles & Pitfalls', durationMinutes: 30, completed: false, type: 'reading' },
            { id: `${courseId}-s3`, title: 'Hands-on Practice Sandbox Lab', durationMinutes: 45, completed: false, type: 'lab' },
            { id: `${courseId}-s4`, title: 'Checkpoint Knowledge Quiz', durationMinutes: 15, completed: false, type: 'quiz' },
          ],
        },
        {
          id: `${courseId}-p2`,
          phaseNumber: 2,
          title: 'Advanced Implementation & Edge Cases',
          description: `Deep dive into complex scenarios, performance optimization, and reliability principles.`,
          status: 'locked',
          dateRange: 'Week 4 – Week 6',
          progressPercent: 0,
          topicsCovered: ['Resilience', 'Cost Optimization', 'Troubleshooting', 'Automation'],
          subtopics: [
            { id: `${courseId}-s5`, title: 'Complex Trade-off Analysis & Patterns', durationMinutes: 35, completed: false, type: 'video' },
            { id: `${courseId}-s6`, title: 'Hands-on Troubleshooting Scenarios', durationMinutes: 50, completed: false, type: 'lab' },
          ],
        },
        {
          id: `${courseId}-p3`,
          phaseNumber: 3,
          title: 'Exam Readiness & Timed Mock Exams',
          description: `Full-length mock exam simulations, timed practice blocks, and weak-point remediation.`,
          status: 'locked',
          dateRange: 'Week 7 – Week 8',
          progressPercent: 0,
          topicsCovered: ['Full Mock Exams', 'Weak Spot Remediation', 'Speed Drills'],
          subtopics: [
            { id: `${courseId}-s7`, title: 'Timed Practice Exam (65 Questions)', durationMinutes: 90, completed: false, type: 'practice' },
            { id: `${courseId}-s8`, title: 'Final High-Yield Review & Formula Sheet', durationMinutes: 30, completed: false, type: 'reading' },
          ],
        },
      ],
      agenda: [
        {
          id: `${courseId}-a1`,
          title: `${title} Architecture Overview`,
          type: 'video',
          durationMinutes: 25,
          status: 'current',
          progressPercent: 0,
          phaseId: `${courseId}-p1`,
        },
        {
          id: `${courseId}-a2`,
          title: 'High-Yield Domain Principles & Pitfalls',
          type: 'reading',
          durationMinutes: 30,
          status: 'locked',
          progressPercent: 0,
          phaseId: `${courseId}-p1`,
        },
        {
          id: `${courseId}-a3`,
          title: 'Hands-on Sandbox Setup & Verification',
          type: 'lab',
          durationMinutes: 45,
          status: 'locked',
          progressPercent: 0,
          phaseId: `${courseId}-p1`,
        },
      ],
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
        { topic: 'Core Architecture', masteryPercent: 0, totalQuestions: 10, correctQuestions: 0 },
        { topic: 'High-Yield Principles', masteryPercent: 0, totalQuestions: 10, correctQuestions: 0 },
        { topic: 'Hands-on Labs', masteryPercent: 0, totalQuestions: 10, correctQuestions: 0 },
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/70 backdrop-blur-sm animate-fade-in font-sans select-none">
      <div 
        className="w-full max-w-md bg-white dark:bg-[#1C1929] rounded-3xl shadow-2xl border border-slate-100 dark:border-[#2E2A44] overflow-hidden animate-slide-up flex flex-col"
        role="dialog"
        aria-label="Manage Study Tracks"
      >
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-violet-50/70 to-teal-50/40 dark:from-[#13111C] dark:to-[#1C1929] border-b border-slate-100 dark:border-[#2E2A44] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-slate-900 dark:bg-[#2E2A44] text-amber-400 flex items-center justify-center shadow-soft">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800 dark:text-white font-heading">
                Study Tracks & Roadmaps
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Switch active target or create a new curriculum roadmap
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white dark:bg-[#2E2A44] hover:bg-slate-100 dark:hover:bg-[#3B3759] text-slate-400 dark:text-slate-300 hover:text-slate-700 dark:hover:text-white flex items-center justify-center transition shadow-sm cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Toggle */}
        <div className="px-5 pt-3 pb-1 flex gap-2 border-b border-slate-100 dark:border-[#2E2A44] bg-slate-50/50 dark:bg-[#13111C]/50">
          <button
            onClick={() => setMode('switch')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              mode === 'switch'
                ? 'bg-white dark:bg-[#2E2A44] text-slate-900 dark:text-white shadow-sm border border-slate-200/60 dark:border-[#3B3759]'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            <span>My Tracks ({courses.length})</span>
          </button>
          <button
            onClick={() => setMode('create')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              mode === 'create'
                ? 'bg-white dark:bg-[#2E2A44] text-slate-900 dark:text-white shadow-sm border border-slate-200/60 dark:border-[#3B3759]'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Study Plan</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-5 max-h-[60vh] overflow-y-auto">
          {mode === 'switch' ? (
            <div className="space-y-2.5">
              {courses.length === 0 && (
                <div className="p-8 text-center text-slate-400 dark:text-slate-500 space-y-2">
                  <p className="text-xs">No study tracks created yet.</p>
                  <button
                    onClick={() => setMode('create')}
                    className="px-4 py-2 bg-slate-900 dark:bg-[#2E2A44] hover:bg-slate-800 text-white rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    + Create Your First Plan
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
                    className={`p-3.5 rounded-2xl border transition flex items-center justify-between cursor-pointer ${
                      isActive
                        ? 'bg-slate-100 dark:bg-[#2E2A44] border-slate-300 dark:border-[#3B3759] shadow-sm'
                        : 'bg-slate-50 dark:bg-[#13111C] border-slate-100 dark:border-[#2E2A44] hover:bg-slate-100/70 dark:hover:bg-[#252236]'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-800 dark:text-white">{c.title}</span>
                        <span className="px-2 py-0.2 rounded text-[10px] font-mono font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
                          {c.code}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 dark:text-slate-400">
                        Exam: {c.examDate || 'No date set'} • {c.targetHoursPerWeek}h/wk target
                      </p>
                    </div>

                    {isActive && (
                      <div className="w-6 h-6 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center shrink-0">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Exam / Certification Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Distributed Systems Architecture or AP Biology"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#13111C] border border-slate-200/80 dark:border-[#2E2A44] rounded-2xl text-xs font-medium text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Exam Code
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. CS-401"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#13111C] border border-slate-200/80 dark:border-[#2E2A44] rounded-2xl text-xs font-medium text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Target Exam Date
                  </label>
                  <input
                    type="date"
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#13111C] border border-slate-200/80 dark:border-[#2E2A44] rounded-2xl text-xs font-medium text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Category Domain
                  </label>
                  <input
                    type="text"
                    list="category-domain-suggestions"
                    placeholder="e.g. Computer Science, Medicine, Law"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#13111C] border border-slate-200/80 dark:border-[#2E2A44] rounded-2xl text-xs font-medium text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                  <datalist id="category-domain-suggestions">
                    <option value="Computer Science" />
                    <option value="Cloud Architecture" />
                    <option value="Artificial Intelligence" />
                    <option value="Cybersecurity" />
                    <option value="Software Engineering" />
                    <option value="Data Science" />
                    <option value="Medicine & Health" />
                    <option value="Biochemistry" />
                    <option value="Business & Management" />
                    <option value="Finance & Accounting" />
                    <option value="Law & Legal Studies" />
                    <option value="Mathematics" />
                  </datalist>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Weekly Goal (hrs)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="80"
                    value={targetHours}
                    onChange={(e) => setTargetHours(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#13111C] border border-slate-200/80 dark:border-[#2E2A44] rounded-2xl text-xs font-medium text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 bg-slate-100 dark:bg-[#13111C] hover:bg-slate-200 dark:hover:bg-[#252236] text-slate-600 dark:text-slate-300 font-semibold rounded-2xl text-xs transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-slate-900 dark:bg-[#2E2A44] hover:bg-slate-800 dark:hover:bg-[#3B3759] text-white font-bold rounded-2xl text-xs shadow-card transition flex items-center justify-center gap-1.5 cursor-pointer ring-1 ring-white/10"
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Create Track</span>
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
