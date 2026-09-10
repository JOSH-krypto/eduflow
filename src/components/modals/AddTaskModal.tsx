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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-slide-up"
        role="dialog"
        aria-label="Add Study Task"
      >
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-violet-50/70 to-teal-50/40 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-violet-600 text-white flex items-center justify-center shadow-soft">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800">
                Add Study Task
              </h2>
              <p className="text-xs text-slate-500">
                Schedule a focus activity into today's plan
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              Task Title / Focus Subject
            </label>
            <input
              type="text"
              placeholder="e.g. Master Consensus Protocol & Raft Leader Election"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-400/30 focus:border-violet-400"
              required
              autoFocus
            />
          </div>

          {/* Activity Category Selection */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
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
                    className={`p-2.5 rounded-2xl border text-left flex items-center gap-2 transition ${
                      isSelected
                        ? 'border-violet-400 shadow-soft'
                        : 'border-slate-100 bg-slate-50/70 hover:bg-slate-100/70'
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
              <label className="text-xs font-bold text-slate-700">Estimated Duration</label>
              <span className="text-xs font-bold text-violet-700 bg-violet-50 px-2 py-0.5 rounded-full">
                {durationMinutes} mins
              </span>
            </div>
            <div className="flex gap-2">
              {[15, 30, 45, 60].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setDurationMinutes(mins)}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-xl border transition ${
                    durationMinutes === mins
                      ? 'bg-violet-600 text-white border-violet-600 shadow-sm'
                      : 'bg-slate-50 text-slate-600 border-slate-200/80 hover:bg-slate-100'
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
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Assign to Phase (Optional)
              </label>
              <select
                value={phaseId}
                onChange={(e) => setPhaseId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-400/30 focus:border-violet-400"
              >
                {phases.map((p) => (
                  <option key={p.id} value={p.id}>
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
              className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold rounded-2xl text-xs transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-2xl text-xs shadow-card transition flex items-center justify-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add to Plan</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
