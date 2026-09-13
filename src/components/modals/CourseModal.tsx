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
            title: `${title} High-Yield Overview`,
            duration: '35 min',
          },
          upcomingLab: {
            type: 'lab',
            label: 'UPCOMING LAB',
            title: 'Initial Setup & Hands-on Sandbox',
            duration: '45 min',
          },
          subtopics: [
            { id: `${courseId}-s1`, title: 'Domain Overview & Structure', durationMinutes: 30, completed: false, type: 'video' },
            { id: `${courseId}-s2`, title: 'Core Terminology & High-Yield Specs', durationMinutes: 45, completed: false, type: 'reading' },
            { id: `${courseId}-s3`, title: 'Foundational Sandbox Exercise', durationMinutes: 45, completed: false, type: 'lab' },
          ],
        },
      ],
      agenda: [
        {
          id: `${courseId}-a1`,
          title: `Start Module 1: ${title} Foundations`,
          type: 'video',
          durationMinutes: 30,
          status: 'current',
          progressPercent: 0,
        },
      ],
      resources: [],
      weeklyActivity: [
        { day: 'Mon', shortDate: '09/07', hours: 0, targetHours: 2.5, studied: false },
        { day: 'Tue', shortDate: '09/08', hours: 0, targetHours: 2.5, studied: false },
        { day: 'Wed', shortDate: '09/09', hours: 0, targetHours: 2.5, studied: false },
        { day: 'Thu', shortDate: '09/10', hours: 0, targetHours: 2.5, studied: false },
        { day: 'Fri', shortDate: '09/11', hours: 0, targetHours: 2.5, studied: false },
        { day: 'Sat', shortDate: '09/12', hours: 0, targetHours: 2.5, studied: false },
        { day: 'Sun', shortDate: '09/13', hours: 0, targetHours: 2.5, studied: false },
      ],
      topicMastery: [
        { topic: 'Core Concepts', masteryPercent: 0, totalQuestions: 20, correctQuestions: 0, category: 'study' },
        { topic: 'Practical Implementation', masteryPercent: 0, totalQuestions: 20, correctQuestions: 0, category: 'lab' },
      ],
    };

    if (onCreateCourse) onCreateCourse(newCourse);
    else if (onSaveCourse) onSaveCourse(newCourse);

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-slide-up flex flex-col"
        role="dialog"
        aria-label="Course Management"
      >
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-violet-50/70 to-teal-50/40 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-violet-600 text-white flex items-center justify-center shadow-soft">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">
                {mode === 'switch' ? 'Select Exam Target' : 'Create Custom Track'}
              </h2>
              <p className="text-xs text-slate-500">
                {mode === 'switch' ? 'Switch between your active study paths' : 'Set up a new certification timeline'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/80 hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition shadow-sm"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Toggle if courses exist */}
        {courses.length > 0 && (
          <div className="px-5 pt-3 pb-1 flex gap-2 border-b border-slate-100 bg-slate-50/60">
            <button
              onClick={() => setMode('switch')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                mode === 'switch'
                  ? 'bg-white text-violet-700 shadow-sm border border-slate-200/60'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <span>Active Paths ({courses.length})</span>
            </button>
            <button
              onClick={() => setMode('create')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                mode === 'create'
                  ? 'bg-white text-violet-700 shadow-sm border border-slate-200/60'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New Target</span>
            </button>
          </div>
        )}

        {/* Content */}
        <div className="p-5 overflow-y-auto max-h-[70vh]">
          {mode === 'switch' ? (
            <div className="space-y-2.5">
              {courses.map((course) => {
                const isActive = course.id === activeCourseId;
                return (
                  <div
                    key={course.id}
                    onClick={() => {
                      if (onSelectCourse) onSelectCourse(course.id);
                      onClose();
                    }}
                    className={`p-3.5 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                      isActive
                        ? 'bg-violet-50/70 border-violet-300 shadow-soft'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-100'
                    }`}
                  >
                    <div className="min-w-0 pr-3">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-violet-100 text-violet-700">
                          {course.code}
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium">
                          Exam: {course.examDate}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-800 mt-1 truncate">
                        {course.title}
                      </h4>
                    </div>

                    {isActive && (
                      <div className="w-6 h-6 rounded-full bg-violet-600 text-white flex items-center justify-center shrink-0">
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
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Exam / Certification Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Distributed Systems Architecture or AP Biology"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-400/30 focus:border-violet-400"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Exam Code
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. CS-401"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-400/30 focus:border-violet-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Target Exam Date
                  </label>
                  <input
                    type="date"
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-400/30 focus:border-violet-400"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Category Domain
                  </label>
                  <input
                    type="text"
                    list="category-domain-suggestions"
                    placeholder="e.g. Computer Science, Medicine, Law"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-400/30 focus:border-violet-400"
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
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Weekly Goal (hrs)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="80"
                    value={targetHours}
                    onChange={(e) => setTargetHours(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-400/30 focus:border-violet-400"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold rounded-2xl text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-2xl text-xs shadow-card transition flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4" />
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
