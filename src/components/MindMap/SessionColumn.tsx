import React, { useState } from 'react';
import { PlanEntry, StudyMode } from '../../types/plan';
import { SessionNode } from './SessionNode';
import { AddSessionForm } from './AddSessionForm';
import { Plus } from 'lucide-react';

interface SessionColumnProps {
  entry: PlanEntry | null;
  completedSessionIds: Record<string, boolean>;
  onToggleComplete: (sessionId: string, hours: number, completed: boolean) => void;
  onAddSession: (entryId: string, data: { topic: string; hours: number; mode: StudyMode }) => void;
  onDeleteSession: (sessionId: string) => void;
}

export const SessionColumn: React.FC<SessionColumnProps> = ({
  entry,
  completedSessionIds,
  onToggleComplete,
  onAddSession,
  onDeleteSession,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);

  if (!entry) {
    return (
      <div className="flex flex-col gap-3 w-80 flex-shrink-0 animate-node-in">
        <div className="text-xs font-mono uppercase tracking-wider text-chalk-muted font-semibold px-1">
          Study Sessions (Leaves)
        </div>
        <div className="p-6 rounded-2xl bg-chalkboard-surface border border-chalkboard-border text-center text-chalk-muted text-xs">
          <p className="font-semibold text-chalk-white">No day selected</p>
          <p className="mt-1 text-[11px]">Click a day or block in the middle column to inspect and check off study sessions.</p>
        </div>
      </div>
    );
  }

  const handleAdd = (data: { topic: string; hours: number; mode: StudyMode }) => {
    onAddSession(entry.id, data);
    setShowAddForm(false);
  };

  return (
    <div className="flex flex-col gap-2.5 w-80 flex-shrink-0 animate-node-in">
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-mono uppercase tracking-wider text-chalk-muted font-semibold">
          Study Sessions (Leaves)
        </span>
        <span className="text-[11px] text-chalk-subtle">
          {entry.sessions.length} {entry.sessions.length === 1 ? 'task' : 'tasks'}
        </span>
      </div>

      {/* Session Leaf Nodes */}
      <div className="space-y-2">
        {entry.sessions.map((session) => (
          <SessionNode
            key={session.id}
            session={session}
            isCompleted={!!completedSessionIds[session.id]}
            onToggleComplete={onToggleComplete}
            onDelete={onDeleteSession}
          />
        ))}
      </div>

      {/* Inline "+ Add Session" form or trigger */}
      {showAddForm ? (
        <AddSessionForm onAdd={handleAdd} onCancel={() => setShowAddForm(false)} />
      ) : (
        <button
          type="button"
          onClick={() => setShowAddForm(true)}
          className="w-full py-2.5 px-3 rounded-xl chalk-border-dashed bg-chalkboard-surface/40 hover:bg-chalkboard-surfaceHover/80 text-chalk-muted hover:text-accent-gold text-xs font-medium flex items-center justify-center gap-1.5 transition-all group"
        >
          <Plus className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
          <span>Add Custom Session</span>
        </button>
      )}
    </div>
  );
};
