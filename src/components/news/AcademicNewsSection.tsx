import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  ArrowUpRight,
  AlertCircle
} from 'lucide-react';
import { api, NewsItemDto } from '../../services/api';
import { AcademicNewsCard, formatRelativeTime } from './AcademicNewsCard';

const CATEGORIES = [
  'Top stories',
  'Latest',
  'Science',
  'Technology',
  'Health & Medicine',
  'Humanities',
  'Arts',
  'Social Sciences',
  'Education',
];

interface AcademicNewsSectionProps {
  onOpenFullNews?: (initialCategory?: string) => void;
}

export const AcademicNewsSection: React.FC<AcademicNewsSectionProps> = ({ onOpenFullNews }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Top stories');
  const [newsItems, setNewsItems] = useState<NewsItemDto[]>([]);
  const [incomingItems, setIncomingItems] = useState<NewsItemDto[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const carouselRef = useRef<HTMLDivElement>(null);
  const isTabVisibleRef = useRef<boolean>(true);

  const loadNews = useCallback(async (category: string, isBackground: boolean = false) => {
    if (!isBackground) {
      setIsLoading(true);
      setFetchError(null);
    } else {
      setIsRefreshing(true);
    }

    try {
      const data = await api.getNews({
        category: category === 'Top stories' || category === 'Latest' ? undefined : category,
        limit: 15,
      });

      if (data && data.items) {
        if (isBackground) {
          const currentTopId = newsItems[0]?.id;
          const newTopId = data.items[0]?.id;
          if (newTopId && currentTopId && newTopId !== currentTopId) {
            setIncomingItems(data.items);
          }
        } else {
          setNewsItems(data.items);
          setIncomingItems(null);
        }
        if (data.lastUpdated) {
          setLastUpdated(data.lastUpdated);
        }
      }
    } catch (err: unknown) {
      if (!isBackground) {
        const message = err instanceof Error ? err.message : 'Unable to load academic news feeds right now.';
        setFetchError(message);
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [newsItems]);

  useEffect(() => {
    loadNews(selectedCategory, false);
  }, [selectedCategory]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      isTabVisibleRef.current = !document.hidden;
      if (!document.hidden) {
        loadNews(selectedCategory, true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    const intervalId = setInterval(() => {
      if (isTabVisibleRef.current) {
        loadNews(selectedCategory, true);
      }
    }, 3 * 60 * 1000);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(intervalId);
    };
  }, [selectedCategory, loadNews]);

  const applyIncomingStories = () => {
    if (incomingItems) {
      setNewsItems(incomingItems);
      setIncomingItems(null);
      if (carouselRef.current) {
        carouselRef.current.scrollTo({ left: 0, behavior: 'smooth' });
      }
    }
  };

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = 360;
      carouselRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section className="space-y-4 font-sans select-none" aria-label="Academic news">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
              Academic news
            </h2>
            {lastUpdated && (
              <span className="hidden sm:inline text-xs tabular-nums text-slate-400 dark:text-slate-500">
                · {isRefreshing ? 'Checking updates...' : `Updated ${formatRelativeTime(lastUpdated)}`}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Research papers and updates from academic publications.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {incomingItems && (
            <button
              onClick={applyIncomingStories}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-medium rounded-md transition cursor-pointer"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>New stories available</span>
            </button>
          )}

          <div className="flex items-center gap-1">
            <button
              onClick={() => scrollCarousel('left')}
              className="p-1.5 rounded-md bg-white dark:bg-[#1C1929] border border-slate-200 dark:border-[#2E2A44] hover:bg-slate-50 dark:hover:bg-[#252236] text-slate-600 dark:text-slate-300 transition cursor-pointer"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scrollCarousel('right')}
              className="p-1.5 rounded-md bg-white dark:bg-[#1C1929] border border-slate-200 dark:border-[#2E2A44] hover:bg-slate-50 dark:hover:bg-[#252236] text-slate-600 dark:text-slate-300 transition cursor-pointer"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {onOpenFullNews && (
            <button
              onClick={() => onOpenFullNews(selectedCategory)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-slate-900 dark:bg-[#2E2A44] hover:bg-slate-800 dark:hover:bg-[#3B3759] text-white text-xs font-medium transition cursor-pointer border border-slate-700/20 dark:border-white/10"
            >
              <span>View all</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1 rounded-md text-xs font-medium transition cursor-pointer shrink-0 ${
              selectedCategory === cat
                ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900'
                : 'bg-white dark:bg-[#1C1929] border border-slate-200 dark:border-[#2E2A44] text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-[#252236]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Carousel */}
      {isLoading ? (
        <div className="flex gap-4 overflow-hidden py-1">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="w-[300px] sm:w-[340px] shrink-0 h-44 rounded-xl bg-slate-100 dark:bg-[#1C1929] animate-pulse border border-slate-200/60 dark:border-[#2E2A44]"
            />
          ))}
        </div>
      ) : fetchError ? (
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#1C1929] border border-slate-200 dark:border-[#2E2A44] text-xs text-slate-600 dark:text-slate-400 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-slate-400 shrink-0" />
          <span>{fetchError}</span>
        </div>
      ) : newsItems.length === 0 ? (
        <div className="p-6 text-center text-xs text-slate-500 rounded-xl bg-slate-50 dark:bg-[#1C1929] border border-slate-200 dark:border-[#2E2A44]">
          No news articles found in this category.
        </div>
      ) : (
        <div
          ref={carouselRef}
          className="flex gap-4 overflow-x-auto py-1 scroll-smooth no-scrollbar"
        >
          {newsItems.map((item) => (
            <AcademicNewsCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </section>
  );
};

export default AcademicNewsSection;
