import React, { useState, useRef } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { KaggleBenchmarkCard, KaggleBenchmarkCardProps } from './KaggleBenchmarkCard';
import { Course } from '../../types/eduflow';

interface KaggleBenchmarksSectionProps {
  course?: Course | null;
  onSelectBenchmarkAction?: (title: string) => void;
  onOpenCurriculum?: () => void;
}

export const KaggleBenchmarksSection: React.FC<KaggleBenchmarksSectionProps> = ({
  course,
  onSelectBenchmarkAction,
  onOpenCurriculum,
}) => {
  const [activeFilter, setActiveFilter] = useState<'trending' | 'recent' | 'arena' | 'exam' | 'all'>('trending');
  const [isExpandedGrid, setIsExpandedGrid] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -360 : 360;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Benchmarks Dataset: Exact Kaggle Models + Integrated EduFlow Exam Prep Benchmarks
  const allBenchmarks: (KaggleBenchmarkCardProps & { filterCategory: string[] })[] = [
    {
      id: 'game-arena',
      title: 'Game Arena',
      description: 'Measuring the frontier of model capabilities through dynamic game simulations and agent evaluations.',
      publisher: {
        name: 'Kaggle',
        logoType: 'kaggle',
        membersCount: '150k Members',
        verified: true,
        tagline: 'World largest data science & machine learning community.',
      },
      rankings: [
        { rank: 1, name: 'GPT-6 Astra', score: '492', highlight: true, progressWidth: 92, provider: 'openai', details: 'Top Elo in dynamic decision gaming' },
        { rank: 2, name: 'Claude Opus 5', score: '437', progressWidth: 84, provider: 'anthropic', details: 'Exceptional strategic reasoning' },
        { rank: 3, name: 'GPT-6.1 Sol', score: '434', progressWidth: 81, provider: 'openai', details: 'Fast zero-shot tactical execution' },
      ],
      moreItemsCount: 35,
      updatedAgo: 'Updated 2d ago',
      initialVotes: 173,
      filterCategory: ['trending', 'arena', 'all'],
    },
    {
      id: 'enterprise-ops',
      title: 'Enterprise Operations Bench',
      description: 'Evaluates LLMs against real world, domain-specific enterprise operational workflows and logic.',
      publisher: {
        name: 'IBM Research',
        logoType: 'ibm',
        membersCount: '42 Researchers',
        verified: true,
        tagline: 'Leading exploratory enterprise AI & cloud systems architecture.',
      },
      rankings: [
        { rank: 1, name: 'Gemini 3 Pro Preview', score: '63%', highlight: true, progressWidth: 78, provider: 'google', details: 'State-of-the-art enterprise multi-modal reasoning' },
        { rank: 2, name: 'o3', score: '59%', progressWidth: 70, provider: 'openai', details: 'Deep reasoning chain verification' },
        { rank: 3, name: 'GPT-5', score: '59%', progressWidth: 70, provider: 'openai', details: 'Autonomous agent operation' },
      ],
      moreItemsCount: 10,
      updatedAgo: 'Updated 17d ago',
      initialVotes: 419,
      filterCategory: ['trending', 'recent', 'all'],
    },
    {
      id: 'facts-grounding',
      title: 'FACTS Grounding',
      description: 'FACTS is a novel benchmark from Google DeepMind and Google Research evaluating grounded AI synthesis.',
      publisher: {
        name: 'Google',
        logoType: 'google',
        membersCount: '25 Members',
        verified: true,
        tagline: 'Google DeepMind & Google Research Frontier Benchmarking Labs.',
      },
      rankings: [
        { rank: 1, name: 'Gemini 3 Pro Preview', score: '85%', highlight: true, progressWidth: 90, provider: 'google', details: 'Near-zero hallucination on technical retrieval' },
        { rank: 2, name: 'GPT-6.1 Sol', score: '82%', progressWidth: 84, provider: 'openai', details: 'High-density citation attribution' },
        { rank: 3, name: 'GPT-6 Astra', score: '79%', progressWidth: 79, provider: 'openai', details: 'Fast cross-reference verification' },
      ],
      moreItemsCount: 53,
      updatedAgo: 'Updated 3d ago',
      initialVotes: 79,
      filterCategory: ['trending', 'arena', 'all'],
    },
    {
      id: 'parse-bench',
      title: 'ParseBench: Doc OCR for AI agents',
      description: 'ParseBench is a benchmark for evaluating document parsing systems, complex tables, and diagrams.',
      publisher: {
        name: 'LlamaIndex',
        logoType: 'llamaindex',
        membersCount: '18 Members',
        verified: true,
        tagline: 'The leading data framework for LLM applications and retrieval.',
      },
      rankings: [
        { rank: 1, name: 'GPT-6.1 Sol', score: '80%', highlight: true, progressWidth: 85, provider: 'openai', details: 'Flawless nested table extraction' },
        { rank: 2, name: 'Claude 3.6 Sol', score: '80%', highlight: true, progressWidth: 85, provider: 'anthropic', details: 'Technical schema preservation' },
        { rank: 3, name: 'GPT-6 Astra', score: '79%', progressWidth: 82, provider: 'openai', details: 'Architectural diagram OCR' },
      ],
      moreItemsCount: 30,
      updatedAgo: 'Updated 4d ago',
      initialVotes: 233,
      filterCategory: ['trending', 'recent', 'all'],
    },
    {
      id: 'curriculum-domain-bench',
      title: course ? `${course.code || course.title} Mastery Arena` : 'Comprehensive Exam Reasoning Benchmark',
      description: course 
        ? `Domain readiness and topic mastery tracking for ${course.title}.`
        : 'Cross-domain diagnostic evaluation testing analytical reasoning, scenario decision trees, and knowledge retention.',
      publisher: {
        name: course ? `${course.code || 'Track'} Study Guild` : 'Open Academic Arena',
        logoType: 'eduflow',
        membersCount: '1.2k Students',
        verified: true,
        tagline: 'Collaborative peer cohort and milestone ranking engine.',
      },
      rankings: course && course.phases && course.phases.length > 0
        ? course.phases.slice(0, 3).map((p, idx) => ({
            rank: idx + 1,
            name: p.title,
            score: `${p.progressPercent || 0}%`,
            highlight: idx === 0,
            progressWidth: Math.max(10, p.progressPercent || 0),
            provider: 'custom',
            details: p.description || `${(p.topicsCovered || []).length} key concepts`,
          }))
        : [
            { rank: 1, name: 'Core Foundations & Conceptual Syntax', score: '92%', highlight: true, progressWidth: 92, provider: 'custom', details: 'Fundamental terminology & baseline principles' },
            { rank: 2, name: 'Applied Scenario Problem Solving', score: '86%', progressWidth: 86, provider: 'custom', details: 'Case studies, decision matrices, and best practices' },
            { rank: 3, name: 'Diagnostic Review & Mock Assessment', score: '81%', progressWidth: 81, provider: 'custom', details: 'Full-length timed evaluation and error analysis' },
          ],
      moreItemsCount: course?.phases?.length ? Math.max(0, course.phases.length - 3) : 12,
      updatedAgo: 'Updated today',
      initialVotes: 489,
      filterCategory: ['trending', 'exam', 'all'],
    },
    {
      id: 'practice-arena',
      title: 'Exam Simulation Arena',
      description: 'Timed full-length scenario mock exams, high-pressure question banks, and troubleshooting drills.',
      publisher: {
        name: 'EduFlow Labs',
        logoType: 'eduflow',
        membersCount: '12k Students',
        verified: true,
        tagline: 'Precision pacing and spaced repetition exam simulation engines.',
      },
      rankings: [
        { rank: 1, name: 'Timed Full Simulation Exam 1', score: '89%', highlight: true, progressWidth: 89, provider: 'custom', details: '65 Questions · 130 min timed mode' },
        { rank: 2, name: 'Scenario Architecture Rapid Quiz', score: '84%', progressWidth: 84, provider: 'custom', details: 'High-yield architectural trade-off questions' },
        { rank: 3, name: 'Hands-on VPC Sandbox Lab', score: '79%', progressWidth: 79, provider: 'aws', details: 'Interactive Cloud Sandbox with verification test' },
      ],
      moreItemsCount: 14,
      updatedAgo: 'Updated 6h ago',
      initialVotes: 318,
      filterCategory: ['arena', 'exam', 'recent', 'all'],
    },
  ];

  // Filter items
  const filteredBenchmarks = allBenchmarks.filter((b) => {
    if (activeFilter === 'all') return true;
    return b.filterCategory.includes(activeFilter);
  });

  return (
    <section className="w-full space-y-4 font-sans select-none">
      {/* 1. Header Bar: Discover title + Subtitle + View All Button */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pt-2">
        <div className="space-y-1">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight leading-snug">
            Discover the state-of-the-art in AI & Exam Prep
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-normal">
            Top benchmarks from leading labs, researchers, and certification bodies.
          </p>
        </div>

        <button
          onClick={() => setIsExpandedGrid(!isExpandedGrid)}
          className="self-start sm:self-auto inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-slate-200/90 bg-white hover:bg-slate-50 active:scale-95 text-xs font-semibold text-slate-700 hover:text-slate-900 shadow-sm transition-all cursor-pointer"
        >
          <span>{isExpandedGrid ? 'Carousel view' : 'View all'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 2. Filter Pills Segmented Control */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-none">
        <button
          onClick={() => setActiveFilter('trending')}
          className={`px-4 py-1.5 text-xs rounded-full transition-all duration-200 cursor-pointer shrink-0 ${
            activeFilter === 'trending' ? 'kaggle-pill-active' : 'kaggle-pill-inactive'
          }`}
        >
          Trending
        </button>

        <button
          onClick={() => setActiveFilter('recent')}
          className={`px-4 py-1.5 text-xs rounded-full transition-all duration-200 cursor-pointer shrink-0 ${
            activeFilter === 'recent' ? 'kaggle-pill-active' : 'kaggle-pill-inactive'
          }`}
        >
          Recently added
        </button>

        <button
          onClick={() => setActiveFilter('arena')}
          className={`px-4 py-1.5 text-xs rounded-full transition-all duration-200 cursor-pointer shrink-0 ${
            activeFilter === 'arena' ? 'kaggle-pill-active' : 'kaggle-pill-inactive'
          }`}
        >
          Game Arena
        </button>

        <button
          onClick={() => setActiveFilter('exam')}
          className={`px-4 py-1.5 text-xs rounded-full transition-all duration-200 cursor-pointer shrink-0 ${
            activeFilter === 'exam' ? 'kaggle-pill-active' : 'kaggle-pill-inactive'
          }`}
        >
          Exam Benchmarks
        </button>

        <button
          onClick={() => setActiveFilter('all')}
          className={`px-4 py-1.5 text-xs rounded-full transition-all duration-200 cursor-pointer shrink-0 ${
            activeFilter === 'all' ? 'kaggle-pill-active' : 'kaggle-pill-inactive'
          }`}
        >
          All Benchmarks ({allBenchmarks.length})
        </button>
      </div>

      {/* 3. Cards Display: Horizontal Scroll or Responsive Multi-Column Grid */}
      {isExpandedGrid ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in pt-1">
          {filteredBenchmarks.map((bench) => (
            <div key={bench.id} className="min-h-[380px]">
              <KaggleBenchmarkCard
                {...bench}
                onExplore={() => {
                  if (onSelectBenchmarkAction) onSelectBenchmarkAction(bench.title);
                  if (bench.id.includes('aws') || bench.id.includes('exam')) {
                    if (onOpenCurriculum) onOpenCurriculum();
                  }
                }}
                onActionClick={(item) => {
                  if (onSelectBenchmarkAction) onSelectBenchmarkAction(item.name);
                }}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="relative group/carousel pt-1">
          {/* Scroll Navigation Buttons */}
          <button
            onClick={() => scroll('left')}
            className="hidden sm:flex absolute -left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white border border-slate-200/90 shadow-md items-center justify-center text-slate-700 hover:text-slate-900 hover:scale-105 active:scale-95 transition-all opacity-0 group-hover/carousel:opacity-100 cursor-pointer"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            onClick={() => scroll('right')}
            className="hidden sm:flex absolute -right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white border border-slate-200/90 shadow-md items-center justify-center text-slate-700 hover:text-slate-900 hover:scale-105 active:scale-95 transition-all opacity-0 group-hover/carousel:opacity-100 cursor-pointer"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Scrollable Container */}
          <div 
            ref={scrollContainerRef}
            className="flex gap-4 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory scroll-smooth no-scrollbar"
          >
            {filteredBenchmarks.map((bench) => (
              <div 
                key={bench.id} 
                className="w-[280px] sm:w-[320px] lg:w-[340px] shrink-0 snap-start min-h-[380px]"
              >
                <KaggleBenchmarkCard
                  {...bench}
                  onExplore={() => {
                    if (onSelectBenchmarkAction) onSelectBenchmarkAction(bench.title);
                    if (bench.id.includes('aws') || bench.id.includes('exam')) {
                      if (onOpenCurriculum) onOpenCurriculum();
                    }
                  }}
                  onActionClick={(item) => {
                    if (onSelectBenchmarkAction) onSelectBenchmarkAction(item.name);
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};
