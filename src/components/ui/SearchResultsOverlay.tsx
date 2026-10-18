import React from 'react';
import { Map, BookOpen, CheckSquare, X, ArrowRight } from 'lucide-react';
import { Course, ResourceItem, Phase, AgendaTask } from '../../types/eduflow';

interface SearchResultsOverlayProps {
  query: string;
  course: Course;
  onClose: () => void;
  onSelectPhase: (phase: Phase) => void;
  onSelectResource: (resource: ResourceItem) => void;
  onSelectTask: (task: AgendaTask) => void;
}

export const SearchResultsOverlay: React.FC<SearchResultsOverlayProps> = ({
  query,
  course,
  onClose,
  onSelectPhase,
  onSelectResource,
  onSelectTask,
}) => {
  if (!query.trim()) return null;

  const q = query.toLowerCase();

  const matchedPhases = course.phases.filter(
    p => p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.topicsCovered.some(t => t.toLowerCase().includes(q))
  );

  const matchedTasks = (course.agenda || []).filter(
    t => t.title.toLowerCase().includes(q)
  );

  const matchedResources = (course.resources || []).filter(
    r => r.title.toLowerCase().includes(q) || r.description.toLowerCase().includes(q) || r.tags.some(t => t.toLowerCase().includes(q))
  );

  const totalResults = matchedPhases.length + matchedTasks.length + matchedResources.length;

  return (
    <>
      <div 
        className="fixed inset-0 z-30 bg-black/40" 
        onClick={onClose}
        aria-hidden="true" 
      />
      <div 
        className="absolute right-4 lg:right-24 top-16 w-80 sm:w-96 z-40 rounded-xl bg-white dark:bg-[#1C1929] border border-slate-200 dark:border-[#2E2A44] shadow-lg overflow-hidden font-sans select-none"
        role="region"
        aria-label="Search results"
      >
        <div className="p-3 bg-slate-50 dark:bg-[#13111C] border-b border-slate-200 dark:border-[#2E2A44] flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-900 dark:text-white tabular-nums">
            Search results ({totalResults})
          </span>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1" aria-label="Close search results">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-[#2E2A44] p-1.5">
          {totalResults === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500">
              No results found for "{query}".
            </div>
          ) : (
            <>
              {matchedPhases.length > 0 && (
                <div className="p-2 space-y-1">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                    Phases
                  </span>
                  {matchedPhases.map(p => (
                    <button
                      key={p.id}
                      onClick={() => {
                        onSelectPhase(p);
                        onClose();
                      }}
                      className="w-full text-left p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-[#252236] flex items-center justify-between group cursor-pointer"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Map className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span className="text-xs text-slate-800 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white truncate">
                          Phase {p.phaseNumber}: {p.title}
                        </span>
                      </div>
                      <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
                    </button>
                  ))}
                </div>
              )}

              {matchedTasks.length > 0 && (
                <div className="p-2 space-y-1">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                    Tasks
                  </span>
                  {matchedTasks.map(t => (
                    <button
                      key={t.id}
                      onClick={() => {
                        onSelectTask(t);
                        onClose();
                      }}
                      className="w-full text-left p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-[#252236] flex items-center justify-between group cursor-pointer tabular-nums"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <CheckSquare className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span className="text-xs text-slate-800 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white truncate">
                          {t.title}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400">{t.durationMinutes}m</span>
                    </button>
                  ))}
                </div>
              )}

              {matchedResources.length > 0 && (
                <div className="p-2 space-y-1">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                    Resources
                  </span>
                  {matchedResources.map(r => (
                    <button
                      key={r.id}
                      onClick={() => {
                        onSelectResource(r);
                        onClose();
                      }}
                      className="w-full text-left p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-[#252236] flex items-center justify-between group cursor-pointer"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <BookOpen className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span className="text-xs text-slate-800 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white truncate">
                          {r.title}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400">{r.category}</span>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default SearchResultsOverlay;
