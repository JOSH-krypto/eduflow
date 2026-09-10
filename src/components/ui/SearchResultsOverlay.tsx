import React from 'react';
import { Search, Map, BookOpen, CheckSquare, X, ArrowRight } from 'lucide-react';
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

  // Search phases
  const matchedPhases = course.phases.filter(
    p => p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.topicsCovered.some(t => t.toLowerCase().includes(q))
  );

  // Search agenda tasks
  const matchedTasks = course.agenda.filter(
    t => t.title.toLowerCase().includes(q)
  );

  // Search resources
  const matchedResources = course.resources.filter(
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
        className="absolute right-4 lg:right-24 top-16 w-80 sm:w-96 z-40 rounded-2xl bg-[#141416] border border-white/[0.12] shadow-2xl overflow-hidden animate-scale-in"
        role="region"
        aria-label="Search Results"
      >
        <div className="p-3 bg-[#18181C] border-b border-white/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-[#F5A623]" />
            <span className="text-xs font-bold text-white">Search Results ({totalResults})</span>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white" aria-label="Close search results">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto divide-y divide-white/[0.04] p-1.5">
          {totalResults === 0 ? (
            <div className="p-6 text-center text-xs text-zinc-500">
              No results found for "{query}".
            </div>
          ) : (
            <>
              {/* Matched Phases */}
              {matchedPhases.length > 0 && (
                <div className="p-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block mb-1">
                    Study Phases
                  </span>
                  {matchedPhases.map(p => (
                    <button
                      key={p.id}
                      onClick={() => {
                        onSelectPhase(p);
                        onClose();
                      }}
                      className="w-full text-left p-2 rounded-xl hover:bg-white/[0.04] flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Map className="w-3.5 h-3.5 text-[#2DD4BF] flex-shrink-0" />
                        <span className="text-xs text-zinc-200 group-hover:text-white truncate">
                          Phase {p.phaseNumber}: {p.title}
                        </span>
                      </div>
                      <ArrowRight className="w-3 h-3 text-zinc-500 group-hover:text-white flex-shrink-0" />
                    </button>
                  ))}
                </div>
              )}

              {/* Matched Agenda Tasks */}
              {matchedTasks.length > 0 && (
                <div className="p-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block mb-1">
                    Agenda Tasks
                  </span>
                  {matchedTasks.map(t => (
                    <button
                      key={t.id}
                      onClick={() => {
                        onSelectTask(t);
                        onClose();
                      }}
                      className="w-full text-left p-2 rounded-xl hover:bg-white/[0.04] flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <CheckSquare className="w-3.5 h-3.5 text-[#F5A623] flex-shrink-0" />
                        <span className="text-xs text-zinc-200 group-hover:text-white truncate">
                          {t.title}
                        </span>
                      </div>
                      <span className="text-[10px] text-zinc-500 font-mono">{t.durationMinutes}m</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Matched Resources */}
              {matchedResources.length > 0 && (
                <div className="p-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block mb-1">
                    Library Resources
                  </span>
                  {matchedResources.map(r => (
                    <button
                      key={r.id}
                      onClick={() => {
                        onSelectResource(r);
                        onClose();
                      }}
                      className="w-full text-left p-2 rounded-xl hover:bg-white/[0.04] flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <BookOpen className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                        <span className="text-xs text-zinc-200 group-hover:text-white truncate">
                          {r.title}
                        </span>
                      </div>
                      <span className="text-[10px] text-zinc-500">{r.category}</span>
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
