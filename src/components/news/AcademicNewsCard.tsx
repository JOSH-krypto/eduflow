import React, { useState } from 'react';
import { ExternalLink, BookOpen, Clock } from 'lucide-react';
import { NewsItemDto } from '../../services/api';

export function formatRelativeTime(dateString: string | Date): string {
  const date = new Date(dateString);
  const diffMs = Date.now() - date.getTime();
  if (isNaN(diffMs) || diffMs < 0) return 'Just now';
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

interface AcademicNewsCardProps {
  item: NewsItemDto;
}

export const AcademicNewsCard: React.FC<AcademicNewsCardProps> = ({ item }) => {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col justify-between w-[300px] sm:w-[340px] flex-shrink-0 bg-white dark:bg-[#1C1929] border border-slate-200/90 dark:border-[#2E2A44] hover:border-slate-300 dark:hover:border-[#3B3759] rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-200 text-left cursor-pointer"
      title={`${item.title} (Opens in new tab)`}
    >
      <div className="space-y-3">
        {/* Optional Image with Fallback */}
        {item.imageUrl && !imageFailed ? (
          <div className="w-full h-36 rounded-xl overflow-hidden bg-slate-100 dark:bg-[#13111C] relative">
            <img
              src={item.imageUrl}
              alt={item.title}
              loading="lazy"
              onError={() => setImageFailed(true)}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-slate-900/80 backdrop-blur-md text-[10px] font-semibold text-white">
              {item.source}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-[#2E2A44] text-slate-800 dark:text-slate-200 font-sans">
              <BookOpen className="w-3 h-3 text-amber-500" />
              {item.source}
            </span>
            <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider font-mono">
              {item.category}
            </span>
          </div>
        )}

        {/* Headline */}
        <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug line-clamp-2 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors font-heading">
          {item.title}
        </h4>

        {/* Excerpt */}
        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
          {item.excerpt}
        </p>
      </div>

      {/* Footer Info & Action */}
      <div className="pt-3 mt-3 border-t border-slate-100 dark:border-[#2E2A44] flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
        <span className="flex items-center gap-1 font-mono">
          <Clock className="w-3 h-3" />
          Updated {formatRelativeTime(item.publishedAt)}
        </span>
        <span className="inline-flex items-center gap-1 font-semibold text-slate-600 dark:text-slate-300 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
          Read <ExternalLink className="w-3 h-3 ml-0.5" />
        </span>
      </div>
    </a>
  );
};
