import React, { useState } from 'react';
import { 
  Library as LibraryIcon, 
  Search, 
  Bookmark, 
  FileText, 
  Terminal, 
  HelpCircle, 
  BookOpen, 
  ExternalLink 
} from 'lucide-react';
import { ResourceItem, ResourceType } from '../../types/eduflow';
import { ResourceViewer } from './ResourceViewer';

interface LibraryViewProps {
  resources: ResourceItem[];
  onToggleBookmark: (resourceId: string) => void;
  onStartFocusOnResource: (resource: ResourceItem) => void;
  searchQuery?: string;
}

export const LibraryView: React.FC<LibraryViewProps> = ({
  resources,
  onToggleBookmark,
  onStartFocusOnResource,
  searchQuery = '',
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [onlyBookmarked, setOnlyBookmarked] = useState<boolean>(false);
  const [localSearch, setLocalSearch] = useState<string>('');
  const [viewingResource, setViewingResource] = useState<ResourceItem | null>(null);

  // Extract unique categories
  const categories = ['all', ...Array.from(new Set(resources.map(r => r.category)))];

  const query = (searchQuery || localSearch).toLowerCase();

  const filteredResources = resources.filter((res) => {
    if (selectedCategory !== 'all' && res.category !== selectedCategory) {
      return false;
    }
    if (onlyBookmarked && !res.isBookmarked) {
      return false;
    }
    if (query) {
      const matchTitle = res.title.toLowerCase().includes(query);
      const matchDesc = res.description.toLowerCase().includes(query);
      const matchTags = res.tags.some(t => t.toLowerCase().includes(query));
      return matchTitle || matchDesc || matchTags;
    }
    return true;
  });

  const getIcon = (type: ResourceType) => {
    switch (type) {
      case 'cheatsheet':
        return <FileText className="w-5 h-5 text-[#F5A623]" />;
      case 'lab':
        return <Terminal className="w-5 h-5 text-[#2DD4BF]" />;
      case 'quiz':
        return <HelpCircle className="w-5 h-5 text-purple-400" />;
      default:
        return <BookOpen className="w-5 h-5 text-sky-400" />;
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="p-6 sm:p-7 rounded-2xl bg-gradient-to-r from-[#141416] via-[#17171C] to-[#121817] border border-white/[0.08] shadow-card flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#F5A623]/10 border border-[#F5A623]/25 mb-2">
            <LibraryIcon className="w-3.5 h-3.5 text-[#F5A623]" />
            <span className="text-[11px] font-semibold text-[#F5A623] uppercase tracking-wider">
              Study Library & Flashcards
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white font-display">
            High-Yield Exam Resources & Guides
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Access curated cheat sheets, lab walkthroughs, official documentation, and interactive flashcards.
          </p>
        </div>

        {/* Local Search and Bookmark Filter */}
        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search library..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-[#18181C] border border-white/[0.1] rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-[#F5A623]"
            />
          </div>

          <button
            onClick={() => setOnlyBookmarked(!onlyBookmarked)}
            className={`p-2.5 rounded-xl border flex items-center gap-1.5 text-xs font-semibold transition-all ${
              onlyBookmarked
                ? 'bg-[#F5A623]/20 border-[#F5A623] text-[#F5A623]'
                : 'bg-[#18181C] border-white/[0.08] text-zinc-400 hover:text-white'
            }`}
            aria-label="Filter only bookmarked resources"
          >
            <Bookmark className={`w-4 h-4 ${onlyBookmarked ? 'fill-current' : ''}`} />
            <span className="hidden sm:inline">Saved</span>
          </button>
        </div>
      </div>

      {/* Category Pills Filter */}
      <div className="flex flex-wrap items-center gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
              selectedCategory === cat
                ? 'bg-[#F5A623] text-black shadow-md'
                : 'bg-[#141416] border border-white/[0.08] hover:border-white/[0.15] text-zinc-300'
            }`}
          >
            {cat === 'all' ? 'All Resources' : cat}
          </button>
        ))}
      </div>

      {/* Resource Grid */}
      {filteredResources.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[#141416] border border-white/[0.08] text-zinc-400 text-sm">
          No resources found matching your current filter.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredResources.map((res) => (
            <div
              key={res.id}
              className="p-5 rounded-2xl bg-[#141416] border border-white/[0.08] hover:border-white/[0.16] shadow-card flex flex-col justify-between group transition-all duration-200"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="p-2.5 rounded-xl bg-white/[0.04] group-hover:bg-white/[0.08] transition-colors">
                    {getIcon(res.type)}
                  </div>
                  <button
                    onClick={() => onToggleBookmark(res.id)}
                    className={`p-1.5 rounded-lg transition-colors ${
                      res.isBookmarked ? 'text-[#F5A623]' : 'text-zinc-600 hover:text-zinc-300'
                    }`}
                    aria-label={res.isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
                  >
                    <Bookmark className={`w-4 h-4 ${res.isBookmarked ? 'fill-current' : ''}`} />
                  </button>
                </div>

                <div className="flex items-center gap-2 text-[10px] text-zinc-400 uppercase font-bold tracking-wider mb-1.5">
                  <span>{res.category}</span>
                  <span>·</span>
                  <span>{res.estimatedTime}</span>
                </div>

                <h3 className="text-sm font-bold text-white group-hover:text-[#F5A623] transition-colors line-clamp-2">
                  {res.title}
                </h3>

                <p className="text-xs text-zinc-400 mt-2 leading-relaxed line-clamp-3">
                  {res.description}
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-white/[0.06] flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {res.tags.slice(0, 2).map((t, idx) => (
                    <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-white/[0.04] text-zinc-400">
                      #{t}
                    </span>
                  ))}
                </div>

                <button
                  onClick={() => setViewingResource(res)}
                  className="px-3.5 py-1.5 rounded-xl bg-white/[0.06] hover:bg-[#F5A623] hover:text-black text-xs font-semibold text-zinc-200 transition-all duration-150 flex items-center gap-1"
                >
                  <span>Open</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Resource Viewer Modal */}
      <ResourceViewer
        isOpen={!!viewingResource}
        onClose={() => setViewingResource(null)}
        resource={viewingResource}
        onToggleBookmark={onToggleBookmark}
        onStartFocusOnResource={onStartFocusOnResource}
      />
    </div>
  );
};
