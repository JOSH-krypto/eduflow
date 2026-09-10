import React, { useState, useEffect, useRef } from 'react';
import { ExamPlan, PlanEntry, StudyMode } from '../../types/plan';
import { formatDate } from '../../data/sampleExams';
import { RootNode } from './RootNode';
import { PhaseColumn } from './PhaseColumn';
import { EntryColumn } from './EntryColumn';
import { SessionColumn } from './SessionColumn';
import { SvgConnectors } from './SvgConnectors';
import { ZoomIn, ZoomOut, RotateCcw, Layers, Sparkles } from 'lucide-react';

interface MindMapCanvasProps {
  exam: ExamPlan;
  onToggleComplete: (sessionId: string, hours: number, completed: boolean) => void;
  onAddSession: (entryId: string, data: { topic: string; hours: number; mode: StudyMode }) => void;
  onDeleteSession: (sessionId: string) => void;
}

export const MindMapCanvas: React.FC<MindMapCanvasProps> = ({
  exam,
  onToggleComplete,
  onAddSession,
  onDeleteSession,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const todayStr = formatDate(new Date());

  // Accordion state:
  // selectedPhaseId: 'today' | string (phase id)
  // selectedEntryId: string (entry id)
  const [selectedPhaseId, setSelectedPhaseId] = useState<string | null>(null);
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  // Initialize selected branch to 'today' (if today has sessions) or the first phase
  useEffect(() => {
    if (!exam.phases || exam.phases.length === 0) return;

    // Check if there are sessions scheduled for today
    let hasTodaySessions = false;
    let todayEntryId: string | null = null;

    for (const phase of exam.phases) {
      for (const entry of phase.entries) {
        if (entry.date === todayStr) {
          hasTodaySessions = true;
          todayEntryId = entry.id;
          break;
        }
      }
      if (hasTodaySessions) break;
    }

    if (hasTodaySessions) {
      setSelectedPhaseId('today');
      setSelectedEntryId(todayEntryId);
    } else {
      const firstPhase = exam.phases[0];
      setSelectedPhaseId(firstPhase.id);
      setSelectedEntryId(firstPhase.entries[0]?.id || null);
    }
  }, [exam.id]);

  // Compute active entries for column 2 based on selectedPhaseId
  let activeEntries: PlanEntry[] = [];
  let isTodayMode = false;

  if (selectedPhaseId === 'today') {
    isTodayMode = true;
    const allTodayEntries: PlanEntry[] = [];
    exam.phases.forEach((phase) => {
      phase.entries.forEach((entry) => {
        if (entry.date === todayStr) {
          allTodayEntries.push(entry);
        }
      });
    });
    activeEntries = allTodayEntries;
  } else if (selectedPhaseId) {
    const foundPhase = exam.phases.find((p) => p.id === selectedPhaseId);
    if (foundPhase) {
      activeEntries = foundPhase.entries;
    }
  }

  // Handle selecting a phase branch (accordion: automatically select first entry)
  const handleSelectPhase = (phaseId: string) => {
    setSelectedPhaseId(phaseId);
    if (phaseId === 'today') {
      const allTodayEntries: PlanEntry[] = [];
      exam.phases.forEach((p) => {
        p.entries.forEach((e) => {
          if (e.date === todayStr) allTodayEntries.push(e);
        });
      });
      setSelectedEntryId(allTodayEntries[0]?.id || null);
    } else {
      const p = exam.phases.find((item) => item.id === phaseId);
      setSelectedEntryId(p?.entries[0]?.id || null);
    }
  };

  // Handle selecting an entry
  const handleSelectEntry = (entryId: string) => {
    setSelectedEntryId(entryId);
  };

  // Get active entry for column 3
  const activeEntry = activeEntries.find((e) => e.id === selectedEntryId) || null;

  const currentEntryIds = activeEntries.map((e) => e.id);
  const currentSessionIds = activeEntry ? activeEntry.sessions.map((s) => s.id) : [];

  return (
    <div className="relative w-full h-[calc(100vh-62px)] flex flex-col bg-chalkboard-bg overflow-hidden select-none">
      
      {/* Canvas Header / Instruction Bar */}
      <div className="no-print px-6 py-2.5 bg-chalkboard-darkest/60 border-b border-chalkboard-border flex items-center justify-between z-10">
        <div className="flex items-center gap-2 text-xs text-chalk-muted font-sans">
          <Layers className="w-3.5 h-3.5 text-accent-gold" />
          <span>Interactive Mind Map:</span>
          <span className="text-chalk-white font-medium">Root</span>
          <span className="text-chalk-muted">→</span>
          <span className="text-accent-gold font-medium">Phase</span>
          <span className="text-chalk-muted">→</span>
          <span className="text-accent-teal font-medium">Daily Focus</span>
          <span className="text-chalk-muted">→</span>
          <span className="text-accent-blue font-medium">Sessions</span>
        </div>

        {/* Zoom & View Controls */}
        <div className="flex items-center gap-1.5 bg-chalkboard-surface border border-chalkboard-border px-2 py-1 rounded-lg">
          <button
            onClick={() => setZoomLevel((prev) => Math.max(0.75, prev - 0.1))}
            className="p-1 rounded text-chalk-muted hover:text-chalk-white hover:bg-chalkboard-bg transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[11px] font-mono text-chalk-white px-1">
            {Math.round(zoomLevel * 100)}%
          </span>
          <button
            onClick={() => setZoomLevel((prev) => Math.min(1.3, prev + 0.1))}
            className="p-1 rounded text-chalk-muted hover:text-chalk-white hover:bg-chalkboard-bg transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <div className="w-px h-3 bg-chalkboard-border mx-0.5" />
          <button
            onClick={() => setZoomLevel(1)}
            className="p-1 rounded text-chalk-muted hover:text-chalk-white hover:bg-chalkboard-bg transition-colors"
            title="Reset Zoom"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Mind Map Scrollable Canvas */}
      <div
        ref={containerRef}
        className="relative flex-1 overflow-x-auto overflow-y-auto p-8 md:p-12 transition-all cursor-grab active:cursor-grabbing"
      >
        <div
          className="relative min-w-max flex items-start gap-12 md:gap-16 transition-transform duration-200 origin-top-left"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          {/* Dynamic SVG Bezier Connector Curves Overlay */}
          <SvgConnectors
            containerRef={containerRef}
            selectedPhaseId={selectedPhaseId}
            selectedEntryId={selectedEntryId}
            entryIds={currentEntryIds}
            sessionIds={currentSessionIds}
          />

          {/* Root Node (Center-Left) */}
          <div className="relative z-10 pt-4">
            <RootNode exam={exam} />
          </div>

          {/* First-Level Branches (Column 1: Today + Phase Nodes) */}
          <div className="relative z-10">
            <PhaseColumn
              exam={exam}
              selectedPhaseId={selectedPhaseId}
              onSelectPhase={handleSelectPhase}
            />
          </div>

          {/* Second-Level Branches (Column 2: Days & Focus Blocks) */}
          <div className="relative z-10">
            <EntryColumn
              entries={activeEntries}
              selectedEntryId={selectedEntryId}
              onSelectEntry={handleSelectEntry}
              exam={exam}
              isTodayMode={isTodayMode}
            />
          </div>

          {/* Third-Level Leaves (Column 3: Study Sessions with Checkboxes & +Add) */}
          <div className="relative z-10">
            <SessionColumn
              entry={activeEntry}
              completedSessionIds={exam.completedSessionIds || {}}
              onToggleComplete={onToggleComplete}
              onAddSession={onAddSession}
              onDeleteSession={onDeleteSession}
            />
          </div>
        </div>
      </div>

      {/* Bottom Hint Strip */}
      <div className="no-print px-6 py-2 bg-chalkboard-darkest/90 border-t border-chalkboard-border text-[11px] text-chalk-muted flex items-center justify-between z-10">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-accent-gold" />
          <span>Click any phase or day to expand branches with smooth bezier links.</span>
        </div>
        <div className="hidden sm:block text-chalk-subtle">
          Horizontal scroll supported on trackpad / shift + mouse wheel
        </div>
      </div>

    </div>
  );
};
