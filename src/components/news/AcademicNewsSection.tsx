import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Newspaper, 
  Sparkles, 
  RefreshCw, 
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

  // Fetch news items for the active category
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
          // Check if there are truly new items (different IDs at top)
          const currentTopId = newsItems[0]?.id;
          const newTopId = data.items[0]?.id;
          if (newTopId && currentTopId && newTopId !== currentTopId) {
            // Do NOT shift under user; show "New stories" pill
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
    } catch (err: any) {
      if (!isBackground) {
        setFetchError(err.message || 'Unable to load academic news feeds right now.');
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [newsItems]);

  // Initial load when category changes
  useEffect(() => {
    loadNews(selectedCategory, false);
  }, [selectedCategory]);

  // Page Visibility API & background polling every 3 minutes
  useEffect(() => {
    const handleVisibilityChange = () => {
      isTabVisibleRef.current = !document.hidden;
      if (!document.hidden) {
        // Tab just became visible: refresh quietly
        loadNews(selectedCategory, true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    const intervalId = setInterval(() => {
      if (isTabVisibleRef.current) {
        loadNews(selectedCategory, true);
      }
    }, 3 * 60 * 1000); // 3 minutes

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
    <section className="space-y-4 font-sans select-none" aria-label="Academic News">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
              <Newspaper className="w-4 h-4" />
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight font-heading">
              What's happening in academia
            </h2>
            {lastUpdated && (
              <span className="hidden sm:inline text-[11px] font-mono text-slate-400 dark:text-slate-500">
                · {isRefreshing ? 'Checking updates...' : `Updated ${formatRelativeTime(lastUpdated)}`}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Curated research breakthroughs, higher ed updates, and scholarly insights from verified feeds
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Incoming Stories Pill */}
          {incomingItems && (
            <button
              onClick={applyIncomingStories}
              className="animate-bounce inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-full shadow-md transition cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>New stories available</span>
            </button>
          )}

          {/* Carousel Arrows */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => scrollCarousel('left')}
              className="p-1.5 rounded-full bg-white dark:bg-[#1C1929] border border-slate-200 dark:border-[#2E2A44] hover:bg-slate-50 dark:hover:bg-[#252236] text-slate-600 dark:text-slate-300 transition shadow-xs cursor-pointer"
              aria-label="Scroll news left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scrollCarousel('right')}
              className="p-1.5 rounded-full bg-white dark:bg-[#1C1929] border border-slate-200 dark:border-[#2E2A44] hover:bg-slate-50 dark:hover:bg-[#252236] text-slate-600 dark:text-slate-300 transition shadow-xs cursor-pointer"
              aria-label="Scroll news right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* View All Button */}
          {onOpenFullNews && (
            <button
              onClick={() => onOpenFullNews(selectedCategory)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-900 dark:bg-[#2E2A44] hover:bg-slate-800 dark:hover:bg-[#3B3759] text-white text-xs font-semibold shadow-xs transition cursor-pointer"
            >
              <span>View all</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                isSelected
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                  : 'bg-white dark:bg-[#1C1929] border border-slate-200/90 dark:border-[#2E2A44] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#252236]'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Content Area: Carousel or Empty/Error State */}
      {isLoading ? (
        <div className="flex items-center gap-4 overflow-hidden py-3">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="w-[300px] sm:w-[340px] h-48 bg-white dark:bg-[#1C1929] border border-slate-200/90 dark:border-[#2E2A44] rounded-2xl p-4 animate-pulse flex-shrink-0 space-y-3"
            >
              <div className="h-4 bg-slate-100 dark:bg-[#2E2A44] rounded-full w-24" />
              <div className="h-5 bg-slate-100 dark:bg-[#2E2A44] rounded-md w-full" />
              <div className="h-5 bg-slate-100 dark:bg-[#2E2A44] rounded-md w-3/4" />
              <div className="h-10 bg-slate-100 dark:bg-[#2E2A44] rounded-md w-full mt-4" />
            </div>
          ))}
        </div>
      ) : fetchError ? (
        <div className="p-8 text-center bg-white dark:bg-[#1C1929] border border-slate-200/90 dark:border-[#2E2A44] rounded-2xl space-y-3">
          <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Unable to load feed</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            {fetchError}
          </p>
          <button
            onClick={() => loadNews(selectedCategory, false)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 dark:bg-[#2E2A44] hover:bg-slate-800 dark:hover:bg-[#3B3759] text-white text-xs font-semibold rounded-xl transition cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Connection</span>
          </button>
        </div>
      ) : newsItems.length === 0 ? (
        <div className="p-8 text-center bg-white dark:bg-[#1C1929] border border-slate-200/90 dark:border-[#2E2A44] rounded-2xl space-y-2">
          <Newspaper className="w-8 h-8 text-slate-400 mx-auto" />
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">No recent articles in this category</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Check back shortly or browse other categories.
          </p>
          <button
            onClick={() => setSelectedCategory('Top stories')}
            className="text-xs text-amber-600 dark:text-amber-400 font-semibold hover:underline cursor-pointer"
          >
            Back to Top stories
          </button>
        </div>
      ) : (
        <div
          ref={carouselRef}
          className="flex items-stretch gap-4 overflow-x-auto pb-3 pt-1 scroll-smooth no-scrollbar"
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
