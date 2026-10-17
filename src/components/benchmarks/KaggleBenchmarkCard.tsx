import React, { useState } from 'react';
import { ChevronUp, CheckCircle2, ExternalLink, ArrowRight, X } from 'lucide-react';
import { fireSmallBurst } from '../../services/confetti';

export interface BenchmarkRankItem {
  rank: number;
  name: string;
  score: string | number;
  highlight?: boolean; // golden amber bar for #1 or standout items
  progressWidth?: number; // percentage width for the progress bar (e.g. 85)
  provider?: 'google' | 'openai' | 'anthropic' | 'aws' | 'kaggle' | 'meta' | 'custom';
  providerIcon?: React.ReactNode;
  details?: string;
}

export interface BenchmarkPublisher {
  name: string;
  logoType: 'google' | 'kaggle' | 'ibm' | 'llamaindex' | 'aws' | 'eduflow';
  membersCount?: string;
  verified?: boolean;
  tagline?: string;
}

export interface KaggleBenchmarkCardProps {
  id: string;
  title: string;
  description: string;
  publisher: BenchmarkPublisher;
  rankings: BenchmarkRankItem[];
  moreItemsCount?: number;
  updatedAgo: string;
  initialVotes?: number;
  category?: string;
  onExplore?: () => void;
  onActionClick?: (item: BenchmarkRankItem) => void;
}

// Brand Logo SVGs matching Kaggle & Google styling
export const BrandIcon: React.FC<{ type: BenchmarkPublisher['logoType']; size?: number }> = ({ type, size = 20 }) => {
  switch (type) {
    case 'google':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" className="shrink-0">
          <path
            fill="#4285F4"
            d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.87c2.26-2.09 3.675-5.17 3.675-9.15z"
          />
          <path
            fill="#34A853"
            d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.87-3.05c-1.08.72-2.45 1.16-4.06 1.16-3.13 0-5.78-2.11-6.73-4.96H1.26v3.15C3.26 21.36 7.33 24 12 24z"
          />
          <path
            fill="#FBBC05"
            d="M5.27 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.61H1.26C.46 8.21 0 10.05 0 12s.46 3.79 1.26 5.39l4.01-3.15z"
          />
          <path
            fill="#EA4335"
            d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.26 6.61l4.01 3.15c.95-2.85 3.6-4.96 6.73-4.96z"
          />
        </svg>
      );
    case 'kaggle':
      return (
        <div 
          className="rounded-full bg-[#18181B] text-[#20BEFF] flex items-center justify-center font-black select-none shrink-0"
          style={{ width: size, height: size, fontSize: size * 0.6 }}
        >
          <span className="text-[#20BEFF] font-sans">k</span>
        </div>
      );
    case 'ibm':
      return (
        <div 
          className="rounded-full bg-[#0043CE] text-white flex items-center justify-center font-bold tracking-tighter select-none shrink-0"
          style={{ width: size, height: size, fontSize: size * 0.4 }}
        >
          IBM
        </div>
      );
    case 'llamaindex':
      return (
        <div 
          className="rounded-full bg-[#0F172A] text-pink-400 flex items-center justify-center font-bold select-none shrink-0 border border-slate-700"
          style={{ width: size, height: size, fontSize: size * 0.55 }}
        >
          🦙
        </div>
      );
    case 'aws':
      return (
        <div 
          className="rounded-full bg-[#232F3E] text-[#FF9900] flex items-center justify-center font-extrabold select-none shrink-0"
          style={{ width: size, height: size, fontSize: size * 0.45 }}
        >
          AWS
        </div>
      );
    case 'eduflow':
    default:
      return (
        <div 
          className="rounded-full bg-[#18181B] text-amber-400 flex items-center justify-center font-bold select-none shrink-0"
          style={{ width: size, height: size, fontSize: size * 0.55 }}
        >
          ⚡
        </div>
      );
  }
};

// Mini Provider Icons for Rank Rows
export const ProviderMiniIcon: React.FC<{ provider?: BenchmarkRankItem['provider'] }> = ({ provider }) => {
  switch (provider) {
    case 'google':
      return <BrandIcon type="google" size={14} />;
    case 'openai':
      return (
        <div className="w-3.5 h-3.5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[8px] font-bold shrink-0">
          ✹
        </div>
      );
    case 'anthropic':
      return (
        <div className="w-3.5 h-3.5 rounded-full bg-[#CC785C] text-white flex items-center justify-center text-[8px] font-bold shrink-0">
          A
        </div>
      );
    case 'aws':
      return (
        <div className="w-3.5 h-3.5 rounded-full bg-[#232F3E] text-[#FF9900] flex items-center justify-center text-[7px] font-extrabold shrink-0">
          a
        </div>
      );
    case 'kaggle':
      return (
        <div className="w-3.5 h-3.5 rounded-full bg-black text-[#20BEFF] flex items-center justify-center text-[8px] font-black shrink-0">
          k
        </div>
      );
    default:
      return null;
  }
};

export const KaggleBenchmarkCard: React.FC<KaggleBenchmarkCardProps> = ({
  id: _id,
  title,
  description,
  publisher,
  rankings,
  moreItemsCount = 10,
  updatedAgo,
  initialVotes = 173,
  category: _category,
  onExplore,
  onActionClick,
}) => {
  const [votes, setVotes] = useState(initialVotes);
  const [hasVoted, setHasVoted] = useState(false);
  const [isPublisherHovered, setIsPublisherHovered] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const handleVote = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!hasVoted) {
      setVotes((prev) => prev + 1);
      setHasVoted(true);
      fireSmallBurst();
    } else {
      setVotes((prev) => prev - 1);
      setHasVoted(false);
    }
  };

  return (
    <>
      <div 
        className="group relative rounded-2xl bg-white border border-slate-200/90 p-5 shadow-sm hover:shadow-xl hover:border-slate-300 transition-all duration-300 flex flex-col justify-between h-full font-sans select-none"
      >
        {/* Top Header: Title & Description */}
        <div className="space-y-1.5">
          <h3 
            onClick={onExplore}
            className="text-[15px] font-bold text-slate-900 tracking-tight leading-snug line-clamp-1 group-hover:text-amber-600 transition-colors cursor-pointer"
            title={title}
          >
            {title}
          </h3>
          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed min-h-[34px]">
            {description}
          </p>
        </div>

        {/* Publisher Row with Interactive Hover Popover */}
        <div className="relative mt-3.5 mb-4">
          <div
            onMouseEnter={() => setIsPublisherHovered(true)}
            onMouseLeave={() => setIsPublisherHovered(false)}
            className="inline-flex items-center gap-2 cursor-pointer group/pub"
          >
            <div className="transition-transform group-hover/pub:scale-110">
              <BrandIcon type={publisher.logoType} size={22} />
            </div>
            <span className="text-xs font-semibold text-slate-800 group-hover/pub:text-slate-950 transition-colors">
              {publisher.name}
            </span>
          </div>

          {/* Floating Hover Popover (Exact Kaggle UX) */}
          {isPublisherHovered && (
            <div 
              onMouseEnter={() => setIsPublisherHovered(true)}
              onMouseLeave={() => setIsPublisherHovered(false)}
              className="absolute left-0 bottom-full mb-2 z-50 w-64 p-4 rounded-2xl bg-white border border-slate-200/90 kaggle-popover-shadow animate-scale-in"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-sm font-bold text-slate-900 truncate">
                      {publisher.name}
                    </h4>
                    {publisher.verified !== false && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    )}
                  </div>
                  <span className="text-xs text-slate-500 font-medium block mt-0.5">
                    {publisher.membersCount || '25 Members'}
                  </span>
                </div>

                <div className="w-12 h-12 rounded-full p-2 bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 shadow-sm">
                  <BrandIcon type={publisher.logoType} size={32} />
                </div>
              </div>

              {publisher.tagline && (
                <p className="text-[11px] text-slate-600 mt-2.5 pt-2 border-t border-slate-100 line-clamp-2">
                  {publisher.tagline}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Rankings / Leaderboard List */}
        <div className="space-y-3 pt-1 border-t border-slate-100">
          {rankings.slice(0, 3).map((item) => {
            const isStandout = item.rank === 1 || item.highlight;
            const progressValue = item.progressWidth ?? (typeof item.score === 'number' ? Math.min(item.score, 100) : 80);

            return (
              <div 
                key={item.rank} 
                className="space-y-1.5 cursor-pointer group/row"
                onClick={() => onActionClick && onActionClick(item)}
              >
                {/* Ranking Title & Score Row */}
                <div className="flex items-center justify-between text-xs font-sans">
                  <div className="flex items-center gap-2 min-w-0 pr-2">
                    <span className="font-semibold text-slate-400 font-mono text-[11px] shrink-0">
                      #{item.rank}
                    </span>
                    <span className="font-semibold text-slate-800 truncate group-hover/row:text-amber-600 transition-colors">
                      {item.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="font-bold text-slate-900 font-mono text-xs">
                      {item.score}
                    </span>
                    {item.provider && <ProviderMiniIcon provider={item.provider} />}
                  </div>
                </div>

                {/* Progress Bar: Amber Glowing Line for #1, Neutral Slate for #2 & #3 */}
                <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      isStandout
                        ? 'bg-gradient-to-r from-amber-400 to-amber-500 shadow-sm'
                        : 'bg-slate-300'
                    }`}
                    style={{ width: `${progressValue}%` }}
                  />
                </div>
              </div>
            );
          })}

          {/* "+ X more models / modules" Expand Link */}
          {moreItemsCount > 0 && (
            <button
              onClick={() => setIsDetailsModalOpen(true)}
              className="text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-1 pt-1.5 cursor-pointer"
            >
              <span>+ {moreItemsCount} more models</span>
              <ArrowRight className="w-3 h-3 opacity-60" />
            </button>
          )}
        </div>

        {/* Card Footer: Updated Date & Pill Upvote Button */}
        <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs font-normal text-slate-400">
            {updatedAgo}
          </span>

          <button
            onClick={handleVote}
            className={`px-3 py-1 rounded-full border text-xs font-semibold flex items-center gap-1.5 transition-all duration-200 cursor-pointer active:scale-95 ${
              hasVoted
                ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                : 'bg-white text-slate-700 border-slate-200/90 hover:bg-slate-50 hover:border-slate-300'
            }`}
            aria-label="Upvote this benchmark"
          >
            <ChevronUp className={`w-3.5 h-3.5 stroke-[2.5] ${hasVoted ? 'text-amber-400' : 'text-slate-500'}`} />
            <span className="font-mono">{votes}</span>
          </button>
        </div>
      </div>

      {/* Expanded Leaderboard Modal */}
      {isDetailsModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in font-sans"
          onClick={() => setIsDetailsModalOpen(false)}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 space-y-5 animate-scale-in max-h-[85vh] flex flex-col"
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <BrandIcon type={publisher.logoType} size={20} />
                  <span className="text-xs font-semibold text-slate-500">{publisher.name}</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  {title}
                </h3>
                <p className="text-xs text-slate-500">{description}</p>
              </div>

              <button
                onClick={() => setIsDetailsModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Complete Rankings List */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {rankings.map((item) => (
                <div
                  key={item.rank}
                  className="p-3 rounded-2xl bg-slate-50/80 border border-slate-100 flex items-center justify-between gap-3 hover:bg-slate-100 transition"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold font-mono ${
                      item.rank === 1 ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-700'
                    }`}>
                      #{item.rank}
                    </span>
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-slate-900 block truncate">
                        {item.name}
                      </span>
                      {item.details && (
                        <span className="text-[11px] text-slate-500 block truncate">
                          {item.details}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-bold text-slate-900 font-mono">
                      {item.score}
                    </span>
                    {item.provider && <ProviderMiniIcon provider={item.provider} />}
                  </div>
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                {updatedAgo} · {votes} Upvotes
              </span>
              <button
                onClick={() => {
                  setIsDetailsModalOpen(false);
                  if (onExplore) onExplore();
                }}
                className="px-5 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition cursor-pointer flex items-center gap-1.5"
              >
                <span>Launch Bench Arena</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
