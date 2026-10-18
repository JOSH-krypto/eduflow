import React, { useState } from 'react';
import { ExternalLink, Clock } from 'lucide-react';
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
      className="group flex flex-col justify-between w-[300px] sm:w-[340px] shrink-0 bg-white dark:bg-[#1C1929] border border-slate-200 dark:border-[#2E2A44] hover:border-slate-400 dark:hover:border-slate-600 rounded-xl p-4 transition-colors text-left cursor-pointer"
      title={`${item.title} (Opens in new tab)`}
    >
      <div className="space-y-2.5">
        {/* Optional Image */}
        {item.imageUrl && !imageFailed ? (
          <div className="w-full h-36 rounded-lg overflow-hidden bg-slate-100 dark:bg-[#13111C] relative">
            <img
              src={item.imageUrl}
              alt={item.title}
              loading="lazy"
              onError={() => setImageFailed(true)}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-slate-900/80 text-[10px] font-medium text-white">
              {item.source}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300">
              {item.source}
            </span>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider">
              {item.category}
            </span>
          </div>
        )}

        {/* Headline */}
        <h4 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 leading-snug line-clamp-2 group-hover:text-slate-700 dark:group-hover:text-white transition-colors">
          {item.title}
        </h4>

        {/* Excerpt */}
        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
          {item.excerpt}
        </p>
      </div>

      {/* Footer */}
      <div className="pt-3 mt-3 border-t border-slate-100 dark:border-[#2E2A44] flex items-center justify-between text-[11px] text-slate-400 tabular-nums">
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {formatRelativeTime(item.publishedAt)}
        </span>
        <span className="inline-flex items-center gap-1 font-medium text-slate-600 dark:text-slate-300">
          Read <ExternalLink className="w-3 h-3 ml-0.5" />
        </span>
      </div>
    </a>
  );
};
