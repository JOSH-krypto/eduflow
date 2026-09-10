import React from 'react';
import { 
  LayoutDashboard, 
  Map, 
  FileText,
  Library as LibraryIcon, 
  BarChart3, 
  Flame,
  Settings
} from 'lucide-react';
import { UserProfile } from '../../types/eduflow';
import { ProgressGauge } from './ProgressGauge';

export type ActiveTab = 'dashboard' | 'study-path' | 'research-notes' | 'library' | 'analytics';

interface NavSection {
  title: string;
  items: {
    id: ActiveTab;
    label: string;
    icon: any;
    badge?: string | null;
  }[];
}

interface SidebarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  userProfile: UserProfile;
  overallProgress: number;
  streakDays: number;
  onOpenFocusTimer: () => void;
  onOpenProfileModal?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  userProfile,
  overallProgress,
  streakDays,
  onOpenFocusTimer,
  onOpenProfileModal,
}) => {
  const navSections: NavSection[] = [
    {
      title: 'LEARN',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: null },
        { id: 'study-path', label: 'Study Path', icon: Map, badge: null },
        { id: 'library', label: 'Library', icon: LibraryIcon, badge: '5' },
      ],
    },
    {
      title: 'RESEARCH',
      items: [
        { id: 'research-notes', label: 'Research Notes', icon: FileText, badge: 'AI' },
      ],
    },
    {
      title: 'INSIGHTS',
      items: [
        { id: 'analytics', label: 'Analytics', icon: BarChart3, badge: null },
      ],
    },
  ];

  return (
    <aside 
      className="fixed top-0 left-0 bottom-0 z-30 w-[72px] lg:w-[230px] bg-[#0D0D0F] border-r border-white/[0.08] flex flex-col justify-between transition-all duration-300 select-none"
      aria-label="Sidebar Navigation"
    >
      {/* Top Header & Brand */}
      <div className="flex flex-col flex-1 overflow-y-auto">
        {/* Brand Logo */}
        <div className="h-16 flex items-center px-4 lg:px-5 border-b border-white/[0.06] flex-shrink-0">
          <div className="flex items-center gap-3 w-full">
            <div className="w-9 h-9 rounded-xl bg-[#F5A623] flex items-center justify-center shadow-lg shadow-[#F5A623]/20 flex-shrink-0">
              <svg 
                className="w-5 h-5 text-[#0D0D0F]" 
                viewBox="0 0 24 24" 
                fill="currentColor"
              >
                <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3z M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z"/>
              </svg>
            </div>
            <div className="hidden lg:flex flex-col">
              <span className="font-heading font-extrabold text-[19px] tracking-tight text-white leading-none">
                EduFlow
              </span>
              <span className="text-[10px] text-zinc-400 font-medium tracking-wider uppercase mt-1">
                Exam Accelerator
              </span>
            </div>
          </div>
        </div>

        {/* ================= GROUP: FOCUS ================= */}
        <div className="px-2 lg:px-3 pt-4 pb-2">
          <span className="hidden lg:block px-2 mb-1.5 text-[10px] font-extrabold uppercase tracking-widest text-zinc-500 font-heading">
            FOCUS
          </span>
          <button
            onClick={onOpenFocusTimer}
            aria-label="Start Study Timer Focus Mode"
            className="w-full group relative overflow-hidden flex items-center justify-center lg:justify-start gap-2.5 px-3 py-2.5 rounded-xl bg-gradient-to-r from-[#F5A623]/15 to-[#F5A623]/5 border border-[#F5A623]/30 hover:border-[#F5A623] hover:from-[#F5A623]/25 hover:to-[#F5A623]/15 text-[#F5A623] transition-all duration-200"
          >
            <Flame className="w-4 h-4 flex-shrink-0 text-[#F5A623] animate-pulse-subtle" />
            <span className="hidden lg:inline text-xs font-bold font-heading tracking-wide">
              Focus Mode
            </span>
            <span className="hidden lg:flex ml-auto text-[10px] px-1.5 py-0.5 rounded bg-[#F5A623]/20 text-[#F5A623] font-mono font-bold">
              {streakDays}d 🔥
            </span>
          </button>
        </div>

        {/* ================= GROUPED SECTIONS (LEARN, RESEARCH, INSIGHTS) ================= */}
        <nav className="px-2 lg:px-3 py-2 space-y-4" aria-label="Main Menu">
          {navSections.map((section) => (
            <div key={section.title} className="space-y-1">
              <span className="hidden lg:block px-2 text-[10px] font-extrabold uppercase tracking-widest text-zinc-500 font-heading">
                {section.title}
              </span>

              {section.items.map((item) => {
                const isActive = activeTab === item.id;
                const Icon = item.icon;

                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectTab(item.id)}
                    aria-current={isActive ? 'page' : undefined}
                    aria-label={item.label}
                    className={`relative w-full flex items-center justify-center lg:justify-start gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm transition-all duration-150 group font-sans ${
                      isActive
                        ? 'text-[#F5A623] bg-[#F5A623]/[0.12] font-bold shadow-sm'
                        : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.04] font-medium'
                    }`}
                  >
                    {/* Active Left Accent Bar */}
                    {isActive && (
                      <span 
                        className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-[#F5A623]"
                        aria-hidden="true" 
                      />
                    )}

                    <Icon 
                      className={`w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 transition-transform group-hover:scale-105 ${
                        isActive ? 'text-[#F5A623]' : 'text-zinc-400 group-hover:text-zinc-200'
                      }`} 
                    />

                    <span className="hidden lg:inline truncate">
                      {item.label}
                    </span>

                    {item.badge && (
                      <span className="hidden lg:inline-flex ml-auto text-[10px] font-extrabold px-1.5 py-0.5 rounded-md bg-white/[0.08] text-zinc-300 group-hover:text-white font-heading">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>
      </div>

      {/* Bottom Pinned: Progress Mini-Card & Clickable User Profile */}
      <div className="p-3 lg:p-4 space-y-3 border-t border-white/[0.06] bg-[#0D0D0F] flex-shrink-0">
        {/* Overall Progress Mini Gauge */}
        <div className="hidden lg:flex items-center justify-between p-3 rounded-2xl bg-[#141416] border border-white/[0.08]">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-wider font-bold text-zinc-400 font-heading">
              Readiness
            </span>
            <span className="text-xs text-zinc-300 mt-0.5 font-sans">
              Overall Track
            </span>
          </div>
          <ProgressGauge percentage={overallProgress} size={44} strokeWidth={4} />
        </div>

        {/* User Profile Card (Clickable to open ProfileModal) */}
        <div 
          onClick={onOpenProfileModal}
          className="flex items-center gap-3 p-2 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.04] hover:border-white/[0.1] transition-all cursor-pointer group"
          role="button"
          tabIndex={0}
          aria-label="Edit Profile & Exam Settings"
          title="Click to edit profile"
        >
          <div className="relative flex-shrink-0">
            <img
              src={userProfile.avatar}
              alt={userProfile.name}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover ring-2 ring-white/10 group-hover:ring-[#F5A623]/60 transition-all"
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#2DD4BF] ring-2 ring-[#0D0D0F]" />
          </div>

          <div className="hidden lg:flex flex-col min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-200 truncate group-hover:text-white font-heading">
                {userProfile.name}
              </span>
              <Settings className="w-3.5 h-3.5 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
            </div>
            <span className="text-[10px] text-zinc-400 font-medium">
              {userProfile.planTier}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};
