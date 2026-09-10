import React from 'react';
import { 
  BookOpen, 
  ExternalLink, 
  FileText, 
  Terminal, 
  HelpCircle, 
  ArrowUpRight,
  Sparkles
} from 'lucide-react';
import { ResourceItem } from '../../types/eduflow';

interface QuickResourcesProps {
  resources: ResourceItem[];
  onOpenResource: (resource: ResourceItem) => void;
  onViewAllResources: () => void;
}

export const QuickResources: React.FC<QuickResourcesProps> = ({
  resources,
  onOpenResource,
  onViewAllResources,
}) => {
  // Top 3-4 quick resources
  const quickItems = resources.slice(0, 4);

  const getIcon = (type: ResourceItem['type']) => {
    switch (type) {
      case 'cheatsheet':
        return <FileText className="w-4 h-4 text-[#F5A623]" />;
      case 'lab':
        return <Terminal className="w-4 h-4 text-[#2DD4BF]" />;
      case 'quiz':
        return <HelpCircle className="w-4 h-4 text-purple-400" />;
      default:
        return <BookOpen className="w-4 h-4 text-sky-400" />;
    }
  };

  return (
    <div className="rounded-2xl bg-[#141416] border border-white/[0.08] shadow-card overflow-hidden">
      <div className="p-4 sm:p-5 border-b border-white/[0.06] flex items-center justify-between bg-[#18181C]">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#F5A623]" />
          <h3 className="text-sm font-bold text-white font-display uppercase tracking-wider">
            Quick Resources
          </h3>
        </div>
        <button
          onClick={onViewAllResources}
          className="text-xs font-semibold text-zinc-400 hover:text-[#F5A623] transition-colors flex items-center gap-1"
        >
          <span>View Library</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="p-3 divide-y divide-white/[0.04]">
        {quickItems.map((res) => (
          <button
            key={res.id}
            onClick={() => onOpenResource(res)}
            className="w-full group p-2.5 rounded-xl hover:bg-white/[0.04] transition-all flex items-center justify-between gap-3 text-left"
            aria-label={`Open resource: ${res.title}`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2 rounded-lg bg-white/[0.04] group-hover:bg-white/[0.08] transition-colors flex-shrink-0">
                {getIcon(res.type)}
              </div>
              <div className="min-w-0">
                <span className="text-xs font-semibold text-zinc-200 group-hover:text-white truncate block transition-colors">
                  {res.title}
                </span>
                <span className="text-[10px] text-zinc-400 mt-0.5 block">
                  {res.category} · {res.estimatedTime}
                </span>
              </div>
            </div>

            <ExternalLink className="w-3.5 h-3.5 text-zinc-600 group-hover:text-zinc-300 transition-colors flex-shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
};
