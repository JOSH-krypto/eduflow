import React, { useState } from 'react';
import { StudyMode } from '../../types/plan';
import { X, Check } from 'lucide-react';

interface AddSessionFormProps {
  onAdd: (data: { topic: string; hours: number; mode: StudyMode }) => void;
  onCancel: () => void;
}

export const AddSessionForm: React.FC<AddSessionFormProps> = ({ onAdd, onCancel }) => {
  const [topic, setTopic] = useState('');
  const [hours, setHours] = useState(1);
  const [mode, setMode] = useState<StudyMode>('practice');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;
    onAdd({
      topic: topic.trim(),
      hours: Math.max(0.5, hours),
      mode,
    });
  };

  return (
    <form 
      onSubmit={handleSubmit}
      className="p-3.5 rounded-xl bg-chalkboard-surface border border-accent-gold/50 shadow-chalkActive animate-node-in space-y-3 font-sans text-xs"
    >
      <div className="flex items-center justify-between">
        <span className="font-chalk font-bold text-accent-gold text-sm">
          Add Custom Session
        </span>
        <button
          type="button"
          onClick={onCancel}
          className="p-1 rounded text-chalk-muted hover:text-chalk-white hover:bg-chalkboard-bg"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div>
        <input
          type="text"
          value={topic}
          onChange={e => setTopic(e.target.value)}
          placeholder="Topic name (e.g. Cell Membrane Drill)"
          className="w-full px-2.5 py-1.5 rounded-lg bg-chalkboard-bg border border-chalkboard-border text-xs text-chalk-white placeholder-chalk-muted focus:outline-none focus:border-accent-gold transition-colors"
          autoFocus
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-[10px] text-chalk-muted mb-1">Duration (hours)</label>
          <input
            type="number"
            min="0.25"
            max="8"
            step="0.25"
            value={hours}
            onChange={e => setHours(parseFloat(e.target.value) || 1)}
            className="w-full px-2 py-1 rounded-lg bg-chalkboard-bg border border-chalkboard-border text-xs text-chalk-white focus:outline-none focus:border-accent-gold font-mono"
          />
        </div>

        <div>
          <label className="block text-[10px] text-chalk-muted mb-1">Study Mode</label>
          <select
            value={mode}
            onChange={e => setMode(e.target.value as StudyMode)}
            className="w-full px-2 py-1 rounded-lg bg-chalkboard-bg border border-chalkboard-border text-xs text-chalk-white focus:outline-none focus:border-accent-gold"
          >
            <option value="learn">Learn (Blue)</option>
            <option value="revise">Revise (Gold)</option>
            <option value="practice">Practice (Teal)</option>
          </select>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="px-2.5 py-1 rounded-md text-[11px] text-chalk-muted hover:text-chalk-white"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex items-center gap-1 px-3 py-1 rounded-md bg-accent-gold hover:bg-accent-gold/90 text-chalkboard-darkest font-bold text-xs shadow-sm transition-transform active:scale-95"
        >
          <Check className="w-3 h-3" />
          <span>Save</span>
        </button>
      </div>
    </form>
  );
};
