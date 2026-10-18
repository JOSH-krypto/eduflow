import React, { useState, useEffect } from 'react';
import { 
  X, 
  Search, 
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

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

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
      .catch((err: unknown) => {
        if (!isMounted) return;
        const msg = err instanceof Error ? err.message : 'Failed to fetch academic news';
        setError(msg);
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
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 dark:bg-black/70 backdrop-blur-xs font-sans"
    >
      <div 
        className="fixed inset-0" 
        onClick={onClose} 
        aria-hidden="true" 
      />

      <div className="relative w-full max-w-5xl max-h-[90vh] flex flex-col bg-white dark:bg-[#13111C] rounded-xl border border-slate-200 dark:border-[#2E2A44] shadow-lg overflow-hidden z-10">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-200 dark:border-[#2E2A44]">
          <div>
            <h2
              id="academic-news-title"
              className="text-base sm:text-lg font-bold text-slate-900 dark:text-white"
            >
              Academic news
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Direct feeds from academic publishers and research journals.
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

        {/* Filter Bar */}
        <div className="p-3.5 sm:px-5 bg-slate-50 dark:bg-[#1C1929] border-b border-slate-200 dark:border-[#2E2A44] space-y-2.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search headlines or topics..."
                className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-[#13111C] border border-slate-200 dark:border-[#2E2A44] rounded-lg text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-slate-400 transition"
              />
            </div>

            {lastUpdated && (
              <div className="text-xs tabular-nums text-slate-400 flex items-center gap-1.5 self-end sm:self-auto">
                <Clock className="w-3.5 h-3.5" />
                <span>Updated {formatRelativeTime(lastUpdated)}</span>
              </div>
            )}
          </div>

          {/* Categories */}
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
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition cursor-pointer whitespace-nowrap ${
                    isSelected
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                      : 'bg-white dark:bg-[#13111C] border border-slate-200 dark:border-[#2E2A44] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="h-44 rounded-lg bg-slate-100 dark:bg-[#1C1929] animate-pulse border border-slate-200 dark:border-[#2E2A44]"
                />
              ))}
            </div>
          ) : error ? (
            <div className="p-4 rounded-lg bg-slate-50 dark:bg-[#1C1929] border border-slate-200 dark:border-[#2E2A44] text-xs text-slate-600 dark:text-slate-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-slate-400 shrink-0" />
              <span>{error}</span>
            </div>
          ) : newsItems.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500 rounded-lg bg-slate-50 dark:bg-[#1C1929] border border-slate-200 dark:border-[#2E2A44]">
              No articles found. Try another search or category.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {newsItems.map((item) => (
                <div key={item.id} className="flex">
                  <AcademicNewsCard item={item} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-3 border-t border-slate-200 dark:border-[#2E2A44] bg-slate-50 dark:bg-[#1C1929] flex items-center justify-between text-xs tabular-nums">
            <span className="text-slate-500 dark:text-slate-400">
              Showing page {page} of {totalPages} ({totalCount} articles)
            </span>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-2.5 py-1 rounded-md bg-white dark:bg-[#13111C] border border-slate-200 dark:border-[#2E2A44] hover:bg-slate-50 dark:hover:bg-[#252236] disabled:opacity-40 transition flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-2.5 py-1 rounded-md bg-white dark:bg-[#13111C] border border-slate-200 dark:border-[#2E2A44] hover:bg-slate-50 dark:hover:bg-[#252236] disabled:opacity-40 transition flex items-center gap-1 cursor-pointer"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AcademicNewsModal;
