import React, { useState, useEffect } from 'react';
import { ExamPlan } from '../types/plan';
import { formatDate, addDays } from '../data/sampleExams';
import { Sparkles, X, Info, Calendar, BookOpen, Clock, AlertCircle } from 'lucide-react';

interface ExamFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: {
    title: string;
    examDate: string;
    syllabus: string;
    studyDays: number[];
    hoursPerDay: number;
  }) => Promise<void>;
  initialData?: ExamPlan | null;
  isGenerating: boolean;
  apiKeyPresent: boolean;
}

const DAYS_OF_WEEK = [
  { label: 'Mon', value: 1 },
  { label: 'Tue', value: 2 },
  { label: 'Wed', value: 3 },
  { label: 'Thu', value: 4 },
  { label: 'Fri', value: 5 },
  { label: 'Sat', value: 6 },
  { label: 'Sun', value: 0 },
];

export const ExamFormModal: React.FC<ExamFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isGenerating,
  apiKeyPresent,
}) => {
  const todayStr = formatDate(new Date());
  const defaultExamDate = formatDate(addDays(new Date(), 21));

  const [title, setTitle] = useState('');
  const [examDate, setExamDate] = useState(defaultExamDate);
  const [syllabus, setSyllabus] = useState('');
  const [studyDays, setStudyDays] = useState<number[]>([1, 2, 3, 4, 5, 6]);
  const [hoursPerDay, setHoursPerDay] = useState(3);
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setExamDate(initialData.examDate);
      setSyllabus(initialData.syllabus);
      setStudyDays(initialData.studyDays || [1, 2, 3, 4, 5, 6]);
      setHoursPerDay(initialData.hoursPerDay || 3);
    } else {
      setTitle('');
      setExamDate(defaultExamDate);
      setSyllabus(
        `Calculus & Differential Equations (hard)\nLinear Algebra & Eigenvalues\nProbability & Bayes Theorem\nStatistical Inference & Hypothesis Testing (hard)\nOptimization & Gradient Descent\nRegression Models & Error Analysis`
      );
      setStudyDays([1, 2, 3, 4, 5, 6]);
      setHoursPerDay(3);
    }
    setValidationError('');
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const toggleDay = (dayVal: number) => {
    if (studyDays.includes(dayVal)) {
      if (studyDays.length === 1) return; // Must have at least 1 study day
      setStudyDays(studyDays.filter(d => d !== dayVal));
    } else {
      setStudyDays([...studyDays, dayVal].sort());
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    if (!title.trim()) {
      setValidationError('Please enter an exam title.');
      return;
    }

    if (!examDate || examDate <= todayStr) {
      setValidationError('Exam date must be in the future.');
      return;
    }

    const validTopics = syllabus.split('\n').map(t => t.trim()).filter(t => t.length > 0);
    if (validTopics.length === 0) {
      setValidationError('Please provide at least one topic in your syllabus.');
      return;
    }

    if (studyDays.length === 0) {
      setValidationError('Please select at least one day of the week to study.');
      return;
    }

    await onSubmit({
      title: title.trim(),
      examDate,
      syllabus: syllabus.trim(),
      studyDays,
      hoursPerDay,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-chalkboard-darkest/80 backdrop-blur-sm overflow-y-auto">
      <div 
        className="relative w-full max-w-2xl bg-chalkboard-surface border border-chalkboard-borderStrong rounded-2xl shadow-2xl p-6 my-8 text-chalk-white animate-node-in"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-chalkboard-border">
          <div>
            <h2 className="font-chalk text-2xl font-bold text-accent-gold">
              {initialData ? 'Edit Exam Details' : 'Design New Study Plan'}
            </h2>
            <p className="text-xs text-chalk-muted font-sans mt-0.5">
              Powered by Gemini AI. Generates an interactive horizontal mind map.
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isGenerating}
            className="p-1.5 rounded-lg text-chalk-muted hover:text-chalk-white hover:bg-chalkboard-surfaceHover transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4 font-sans">
          
          {validationError && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-accent-red/15 border border-accent-red/30 text-accent-red text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Exam Title */}
          <div>
            <label className="block text-xs font-semibold text-chalk-white mb-1.5 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-accent-gold" />
              Exam / Course Name
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. MCAT Biochemistry, Organic Chemistry Final, AWS Solutions Architect"
              className="w-full px-3.5 py-2.5 rounded-xl bg-chalkboard-bg border border-chalkboard-border text-sm text-chalk-white placeholder-chalk-muted focus:outline-none focus:border-accent-gold transition-colors"
              disabled={isGenerating}
              required
            />
          </div>

          {/* Exam Date & Daily Hours */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-chalk-white mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-accent-blue" />
                Exam Date
              </label>
              <input
                type="date"
                min={todayStr}
                value={examDate}
                onChange={e => setExamDate(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-chalkboard-bg border border-chalkboard-border text-sm text-chalk-white focus:outline-none focus:border-accent-gold transition-colors"
                disabled={isGenerating}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-chalk-white mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-accent-teal" />
                  Hours Available per Study Day
                </span>
                <span className="text-accent-teal font-bold">{hoursPerDay} hrs</span>
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0.5"
                  max="10"
                  step="0.5"
                  value={hoursPerDay}
                  onChange={e => setHoursPerDay(parseFloat(e.target.value))}
                  className="w-full accent-accent-teal cursor-pointer"
                  disabled={isGenerating}
                />
              </div>
            </div>
          </div>

          {/* Days of week chip toggles */}
          <div>
            <label className="block text-xs font-semibold text-chalk-white mb-1.5">
              Which days of the week can you study?
            </label>
            <div className="flex flex-wrap gap-2">
              {DAYS_OF_WEEK.map(day => {
                const isSelected = studyDays.includes(day.value);
                return (
                  <button
                    key={day.value}
                    type="button"
                    onClick={() => toggleDay(day.value)}
                    disabled={isGenerating}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      isSelected
                        ? 'bg-accent-teal/20 text-accent-teal border-accent-teal/50 shadow-sm font-semibold scale-105'
                        : 'bg-chalkboard-bg text-chalk-muted border-chalkboard-border hover:border-chalk-muted/50'
                    }`}
                  >
                    {day.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Syllabus Textarea */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-chalk-white">
                Syllabus & Topics (one topic per line)
              </label>
              <span className="text-[11px] text-accent-gold/80 flex items-center gap-1">
                <Info className="w-3 h-3" />
                Add &quot;(hard)&quot; to allocate extra focus
              </span>
            </div>
            <textarea
              rows={6}
              value={syllabus}
              onChange={e => setSyllabus(e.target.value)}
              placeholder={`Membrane Biology\nCellular Respiration (hard)\nPhotosynthesis\nDNA Replication (hard)\nGenetics & Heredity`}
              className="w-full px-3.5 py-2.5 rounded-xl bg-chalkboard-bg border border-chalkboard-border text-sm text-chalk-white placeholder-chalk-muted focus:outline-none focus:border-accent-gold transition-colors font-mono text-xs leading-relaxed"
              disabled={isGenerating}
              required
            />
          </div>

          {/* API Key Status Notice */}
          {!apiKeyPresent && (
            <div className="p-3 rounded-xl bg-chalkboard-bg border border-accent-gold/30 text-xs text-chalk-muted flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-accent-gold flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-accent-gold font-semibold">Gemini API Key missing or not configured: </span>
                A realistic study plan will be generated via our built-in algorithmic engine. You can configure your Gemini key anytime in the navbar.
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-chalkboard-border">
            <button
              type="button"
              onClick={onClose}
              disabled={isGenerating}
              className="px-4 py-2 rounded-xl text-xs font-medium text-chalk-muted hover:text-chalk-white hover:bg-chalkboard-surfaceHover transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isGenerating}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent-gold hover:bg-accent-gold/90 text-chalkboard-darkest font-bold text-xs shadow-lg transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Sparkles className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>{isGenerating ? 'Synthesizing Plan...' : initialData ? 'Update & Re-plan' : 'Generate Mind Map Plan'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
