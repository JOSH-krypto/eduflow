import React, { useState, useEffect } from 'react';
import { 
  X, 
  Search, 
  Newspaper, 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  AlertCircle
} from 'lucide-react';
import { api, NewsItemDto } from '../../services/api';
import { AcademicNewsCard, formatRelativeTime } from './AcademicNewsCard';

const CATEGORIES = [
  'All',
  'Science',
  'Technology',
  'Health & Medicine',
  'Humanities',
  'Arts',
  'Social Sciences',
  'Education',
];

interface AcademicNewsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCategory?: string;
}

export const AcademicNewsModal: React.FC<AcademicNewsModalProps> = ({
  isOpen,
  onClose,
  initialCategory = 'All',
}) => {
  const [category, setCategory] = useState<string>(
    initialCategory === 'Top stories' || initialCategory === 'Latest' ? 'All' : initialCategory
  );
  const [search, setSearch] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [newsItems, setNewsItems] = useState<NewsItemDto[]>([]);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1); // Reset to page 1 on new query
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Fetch news
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setIsLoading(true);
    setError(null);

    api
      .getNews({
        category: category === 'All' ? undefined : category,
        search: debouncedSearch || undefined,
        page,
        limit: 12,
      })
      .then((res) => {
        if (!isMounted) return;
        setNewsItems(res.items || []);
        setTotalPages(res.totalPages || 1);
        setTotalCount(res.total || 0);
        if (res.lastUpdated) {
          setLastUpdated(res.lastUpdated);
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err.message || 'Failed to fetch academic news');
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, category, debouncedSearch, page]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="academic-news-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 dark:bg-black/70 backdrop-blur-sm animate-fade-in font-sans"
    >
      <div 
        className="fixed inset-0" 
        onClick={onClose} 
        aria-hidden="true" 
      />

      <div className="relative w-full max-w-5xl max-h-[92vh] flex flex-col bg-white dark:bg-[#13111C] rounded-3xl border border-slate-200/90 dark:border-[#2E2A44] shadow-2xl overflow-hidden z-10 animate-scale-in">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-slate-200/80 dark:border-[#2E2A44]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-sm">
              <Newspaper className="w-5 h-5" />
            </div>
            <div>
              <h2
                id="academic-news-title"
                className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white font-heading"
              >
                Academic Research & Higher Ed News
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Direct RSS feeds from Nature, MIT, ScienceDaily, The Conversation, and leading journals
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-[#252236] text-slate-400 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white transition cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Controls Bar */}
        <div className="p-4 sm:px-6 bg-slate-50/70 dark:bg-[#1C1929]/70 border-b border-slate-200/80 dark:border-[#2E2A44] space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search headlines or topics (e.g. quantum, climate, biology)..."
                className="w-full pl-9 pr-4 py-2 bg-white dark:bg-[#13111C] border border-slate-200/90 dark:border-[#2E2A44] rounded-full text-xs font-medium text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition"
              />
            </div>

            {/* Freshness Badge */}
            {lastUpdated && (
              <div className="text-[11px] font-mono text-slate-400 dark:text-slate-500 flex items-center gap-1.5 self-end sm:self-auto">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                <span>Feed freshness: Updated {formatRelativeTime(lastUpdated)}</span>
              </div>
            )}
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {CATEGORIES.map((cat) => {
              const isSelected = category === cat;
              return (
                <button
                  key={cat}
                  onClick={() => {
                    setCategory(cat);
                    setPage(1);
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                      : 'bg-white dark:bg-[#13111C] border border-slate-200/90 dark:border-[#2E2A44] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Body: Grid of Articles */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div
                  key={n}
                  className="h-48 bg-slate-50 dark:bg-[#1C1929] border border-slate-200/90 dark:border-[#2E2A44] rounded-2xl p-4 animate-pulse space-y-3"
                >
                  <div className="h-4 bg-slate-200 dark:bg-[#2E2A44] rounded-full w-24" />
                  <div className="h-5 bg-slate-200 dark:bg-[#2E2A44] rounded-md w-full" />
                  <div className="h-4 bg-slate-200 dark:bg-[#2E2A44] rounded-md w-3/4" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="p-8 text-center bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 rounded-2xl space-y-2">
              <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">Unable to load news</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">{error}</p>
            </div>
          ) : newsItems.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <Newspaper className="w-10 h-10 text-slate-400 mx-auto" />
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">No matching articles found</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Try searching for another topic or selecting another category.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {newsItems.map((item) => (
                <AcademicNewsCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>

        {/* Footer with Pagination */}
        <div className="p-4 sm:px-6 bg-slate-50 dark:bg-[#1C1929] border-t border-slate-200/80 dark:border-[#2E2A44] flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Showing <strong className="text-slate-800 dark:text-slate-200">{newsItems.length}</strong> of {totalCount} articles
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-1.5 rounded-xl border border-slate-200 dark:border-[#2E2A44] bg-white dark:bg-[#13111C] hover:bg-slate-50 dark:hover:bg-[#252236] disabled:opacity-40 disabled:cursor-not-allowed text-slate-600 dark:text-slate-300 transition cursor-pointer"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold font-mono px-2 text-slate-700 dark:text-slate-300">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-1.5 rounded-xl border border-slate-200 dark:border-[#2E2A44] bg-white dark:bg-[#13111C] hover:bg-slate-50 dark:hover:bg-[#252236] disabled:opacity-40 disabled:cursor-not-allowed text-slate-600 dark:text-slate-300 transition cursor-pointer"
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AcademicNewsModal;
