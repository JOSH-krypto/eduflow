import React, { useState } from 'react';
import { X, PlusCircle, Video, Terminal, BookOpen, CheckCircle } from 'lucide-react';
import { AgendaTask, TaskType, Phase, getCategoryTheme } from '../../types/eduflow';

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

  const typeOptions: { id: TaskType; label: string; icon: any; categoryKey: string }[] = [
    { id: 'video', label: 'Video Lecture', icon: Video, categoryKey: 'study' },
    { id: 'reading', label: 'Review & Reading', icon: BookOpen, categoryKey: 'review' },
    { id: 'practice', label: 'Practice Quiz', icon: CheckCircle, categoryKey: 'practice' },
    { id: 'lab', label: 'Hands-on Lab', icon: Terminal, categoryKey: 'lab' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/70 backdrop-blur-sm animate-fade-in font-sans select-none">
      <div 
        className="w-full max-w-md bg-white dark:bg-[#1C1929] rounded-3xl shadow-2xl border border-slate-100 dark:border-[#2E2A44] overflow-hidden animate-slide-up"
        role="dialog"
        aria-label="Add Study Task"
      >
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-violet-50/70 to-teal-50/40 dark:from-[#13111C] dark:to-[#1C1929] border-b border-slate-100 dark:border-[#2E2A44] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-slate-900 dark:bg-[#2E2A44] text-amber-400 flex items-center justify-center shadow-soft">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800 dark:text-white font-heading">
                Add Study Task
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Schedule a focus activity into today's plan
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
              Task Title / Focus Subject
            </label>
            <input
              type="text"
              placeholder="e.g. Master Consensus Protocol & Raft Leader Election"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#13111C] border border-slate-200/80 dark:border-[#2E2A44] rounded-2xl text-xs font-medium text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              required
              autoFocus
            />
          </div>

          {/* Activity Category Selection */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
              Activity Category
            </label>
            <div className="grid grid-cols-2 gap-2">
              {typeOptions.map((opt) => {
                const theme = getCategoryTheme(opt.categoryKey);
                const isSelected = type === opt.id;
                const Icon = opt.icon;

                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setType(opt.id)}
                    className={`p-2.5 rounded-2xl border text-left flex items-center gap-2 transition cursor-pointer ${
                      isSelected
                        ? 'border-amber-400 shadow-soft'
                        : 'border-slate-100 dark:border-[#2E2A44] bg-slate-50/70 dark:bg-[#13111C]/70 hover:bg-slate-100/70 dark:hover:bg-[#252236]'
                    }`}
                    style={
                      isSelected
                        ? { backgroundColor: theme.badgeBg, color: theme.badgeText }
                        : undefined
                    }
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="text-xs font-bold">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Duration in Minutes */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Estimated Duration</label>
              <span className="text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-full font-mono">
                {durationMinutes} mins
              </span>
            </div>
            <div className="flex gap-2">
              {[15, 30, 45, 60].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setDurationMinutes(mins)}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-xl border transition cursor-pointer ${
                    durationMinutes === mins
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-sm'
                      : 'bg-slate-50 dark:bg-[#13111C] text-slate-600 dark:text-slate-300 border-slate-200/80 dark:border-[#2E2A44] hover:bg-slate-100 dark:hover:bg-[#252236]'
                  }`}
                >
                  {mins}m
                </button>
              ))}
            </div>
          </div>

          {/* Phase Link (Optional) */}
          {phases.length > 0 && (
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                Assign to Phase (Optional)
              </label>
              <select
                value={phaseId}
                onChange={(e) => setPhaseId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#13111C] border border-slate-200/80 dark:border-[#2E2A44] rounded-2xl text-xs font-medium text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
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
              className="flex-1 py-3 bg-slate-100 dark:bg-[#13111C] hover:bg-slate-200 dark:hover:bg-[#252236] text-slate-600 dark:text-slate-300 font-semibold rounded-2xl text-xs transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-slate-900 dark:bg-[#2E2A44] hover:bg-slate-800 dark:hover:bg-[#3B3759] text-white font-bold rounded-2xl text-xs shadow-card transition flex items-center justify-center gap-1.5 cursor-pointer ring-1 ring-white/10"
            >
              <PlusCircle className="w-4 h-4 text-amber-400" />
              <span>Add to Plan</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTaskModal;
