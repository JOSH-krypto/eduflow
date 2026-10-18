import React, { useState } from 'react';
import { X, Video, Terminal, BookOpen, CheckCircle } from 'lucide-react';
import { AgendaTask, TaskType, Phase } from '../../types/eduflow';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTask: (task: Omit<AgendaTask, 'id' | 'status'>) => void;
  phases?: Phase[];
}

export const AddTaskModal: React.FC<AddTaskModalProps> = ({
  isOpen,
  onClose,
  onAddTask,
  phases = [],
}) => {
  if (!isOpen) return null;

  const [title, setTitle] = useState('');
  const [type, setType] = useState<TaskType>('lab');
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [phaseId, setPhaseId] = useState<string>(phases[0]?.id || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddTask({
      title: title.trim(),
      type,
      durationMinutes: Number(durationMinutes) || 30,
      phaseId: phaseId || undefined,
      progressPercent: 0,
    });

    setTitle('');
    setDurationMinutes(30);
    onClose();
  };

  const typeOptions: { id: TaskType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'video', label: 'Video lecture', icon: Video },
    { id: 'reading', label: 'Review and reading', icon: BookOpen },
    { id: 'practice', label: 'Practice quiz', icon: CheckCircle },
    { id: 'lab', label: 'Hands-on lab', icon: Terminal },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/70 backdrop-blur-xs font-sans select-none">
      <div 
        className="w-full max-w-md bg-white dark:bg-[#1C1929] rounded-xl shadow-lg border border-slate-200 dark:border-[#2E2A44] overflow-hidden"
        role="dialog"
        aria-label="Add study task"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-[#2E2A44] flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Add study task
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Schedule a task into today's study plan.
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-3.5">
          <div>
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">
              Task title
            </label>
            <input
              type="text"
              placeholder="e.g. Master Consensus Protocol"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-[#13111C] border border-slate-200 dark:border-[#2E2A44] rounded-lg text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-slate-400"
              required
              autoFocus
            />
          </div>

          {/* Activity Category Selection */}
          <div>
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">
              Task category
            </label>
            <div className="grid grid-cols-2 gap-2">
              {typeOptions.map((opt) => {
                const isSelected = type === opt.id;
                const Icon = opt.icon;

                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setType(opt.id)}
                    className={`p-2.5 rounded-lg border text-left flex items-center gap-2 transition-colors cursor-pointer ${
                      isSelected
                        ? 'border-slate-900 dark:border-slate-100 bg-slate-100 dark:bg-[#2E2A44] text-slate-900 dark:text-white font-medium'
                        : 'border-slate-200 dark:border-[#2E2A44] bg-slate-50 dark:bg-[#13111C] text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#252236]'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0 text-slate-500" />
                    <span className="text-xs">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Duration in Minutes */}
          <div>
            <div className="flex items-center justify-between mb-1 tabular-nums">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Estimated duration</label>
              <span className="text-xs text-slate-500">
                {durationMinutes} mins
              </span>
            </div>
            <div className="flex gap-2">
              {[15, 30, 45, 60].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setDurationMinutes(mins)}
                  className={`flex-1 py-1.5 text-xs rounded-lg border transition-colors cursor-pointer tabular-nums ${
                    durationMinutes === mins
                      ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-medium border-slate-900 dark:border-slate-100'
                      : 'bg-slate-50 dark:bg-[#13111C] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-[#2E2A44] hover:bg-slate-100 dark:hover:bg-[#252236]'
                  }`}
                >
                  {mins}m
                </button>
              ))}
            </div>
          </div>

          {/* Phase Link */}
          {phases.length > 0 && (
            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">
                Assign to phase (optional)
              </label>
              <select
                value={phaseId}
                onChange={(e) => setPhaseId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-[#13111C] border border-slate-200 dark:border-[#2E2A44] rounded-lg text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-slate-400"
              >
                {phases.map((p) => (
                  <option key={p.id} value={p.id} className="dark:bg-[#1C1929]">
                    Phase {p.phaseNumber}: {p.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Action Buttons */}
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
              Add task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTaskModal;
