import React from 'react';
import { Home, Compass, BarChart2, User, Plus } from 'lucide-react';

export type TabKey = 'home' | 'plan' | 'progress' | 'profile';

interface BottomTabBarProps {
  activeTab: TabKey;
  onSelectTab: (tab: TabKey) => void;
  onOpenQuickActions: () => void;
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({
  activeTab,
  onSelectTab,
  onOpenQuickActions,
}) => {
  const tabs: { id: TabKey; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'plan', label: 'Plan', icon: Compass },
    { id: 'progress', label: 'Progress', icon: BarChart2 },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <nav 
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-[#13111C] border-t border-slate-200 dark:border-[#2E2A44] select-none font-sans transition-colors"
      aria-label="Bottom navigation"
    >
      <div className="max-w-md mx-auto px-4 h-14 flex items-center justify-between relative">
        <div className="flex items-center justify-around flex-1 pr-6">
          {tabs.slice(0, 2).map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;

            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`flex flex-col items-center justify-center gap-0.5 py-1 px-3 rounded-lg transition-colors cursor-pointer ${
                  isActive
                    ? 'text-slate-900 dark:text-white font-medium'
                    : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
                aria-current={isActive ? 'page' : undefined}
                aria-label={tab.label}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px]">
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>

        <div className="absolute left-1/2 -top-4 -translate-x-1/2 flex items-center justify-center">
          <button
            onClick={onOpenQuickActions}
            className="w-10 h-10 rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 flex items-center justify-center border border-slate-700/20 dark:border-white/20 transition-transform active:scale-95 cursor-pointer shadow-sm"
            aria-label="Open quick actions"
            title="Add task, start session, or summarize"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center justify-around flex-1 pl-6">
          {tabs.slice(2, 4).map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;

            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`flex flex-col items-center justify-center gap-0.5 py-1 px-3 rounded-lg transition-colors cursor-pointer ${
                  isActive
                    ? 'text-slate-900 dark:text-white font-medium'
                    : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
                aria-current={isActive ? 'page' : undefined}
                aria-label={tab.label}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px]">
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default BottomTabBar;
