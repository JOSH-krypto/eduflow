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
  const tabs: { id: TabKey; label: string; icon: any }[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'plan', label: 'Plan', icon: Compass },
    { id: 'progress', label: 'Progress', icon: BarChart2 },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <nav 
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-xl border-t border-purple-100/80 shadow-tab-bar select-none font-sans"
      aria-label="Bottom Navigation"
    >
      <div className="max-w-md mx-auto px-4 h-16 sm:h-[70px] flex items-center justify-between relative">
        {/* Left Tabs (Home & Plan) */}
        <div className="flex items-center justify-around flex-1 pr-6">
          {tabs.slice(0, 2).map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;

            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-2xl transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'text-theme-dark font-bold scale-105'
                    : 'text-zinc-400 hover:text-zinc-600 font-medium'
                }`}
                aria-current={isActive ? 'page' : undefined}
                aria-label={tab.label}
              >
                <div className={`p-1 rounded-xl transition-colors ${isActive ? 'bg-theme-light' : 'bg-transparent'}`}>
                  <Icon className="w-5 h-5 stroke-[2.2]" />
                </div>
                <span className="text-[10px] tracking-tight font-heading">
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Center Raised Circular Plus Button */}
        <div className="absolute left-1/2 -top-5 -translate-x-1/2 flex items-center justify-center">
          <button
            onClick={onOpenQuickActions}
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-theme-accent text-white flex items-center justify-center shadow-float-btn hover:shadow-lg hover:scale-110 active:scale-95 transition-all duration-200 ring-4 ring-[#F8F7FC] focus:outline-none cursor-pointer"
            aria-label="Open Quick Actions Sheet"
            title="Create Task, Log Session, or AI Summarize"
          >
            <Plus className="w-6 h-6 stroke-[2.8]" />
          </button>
        </div>

        {/* Right Tabs (Progress & Profile) */}
        <div className="flex items-center justify-around flex-1 pl-6">
          {tabs.slice(2, 4).map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;

            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-2xl transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'text-theme-dark font-bold scale-105'
                    : 'text-zinc-400 hover:text-zinc-600 font-medium'
                }`}
                aria-current={isActive ? 'page' : undefined}
                aria-label={tab.label}
              >
                <div className={`p-1 rounded-xl transition-colors ${isActive ? 'bg-theme-light' : 'bg-transparent'}`}>
                  <Icon className="w-5 h-5 stroke-[2.2]" />
                </div>
                <span className="text-[10px] tracking-tight font-heading">
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
