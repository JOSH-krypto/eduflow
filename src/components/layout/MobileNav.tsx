import React from 'react';
import { 
  X, 
  LayoutDashboard, 
  Map, 
  FileText,
  Library as LibraryIcon, 
  BarChart3, 
  Flame,
  Settings
} from 'lucide-react';
import { UserProfile } from '../../types/eduflow';
import { ActiveTab } from './Sidebar';

interface MobileNavItem {
  id: ActiveTab;
  label: string;
  icon: any;
  badge?: string | null;
}

interface MobileNavSection {
  title: string;
  items: MobileNavItem[];
}

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  userProfile: UserProfile;
  overallProgress: number;
  streakDays: number;
  onOpenFocusTimer: () => void;
  onOpenProfileModal?: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  isOpen,
  onClose,
  activeTab,
  onSelectTab,
  userProfile,
  streakDays,
  onOpenFocusTimer,
  onOpenProfileModal,
}) => {
  if (!isOpen) return null;

  const navSections: MobileNavSection[] = [
    {
      title: 'LEARN',
      items: [
        { id: 'dashboard' as ActiveTab, label: 'Dashboard', icon: LayoutDashboard },
        { id: 'study-path' as ActiveTab, label: 'Study Path', icon: Map },
        { id: 'library' as ActiveTab, label: 'Library', icon: LibraryIcon },
      ],
    },
    {
      title: 'RESEARCH',
      items: [
        { id: 'research-notes' as ActiveTab, label: 'Research Notes', icon: FileText, badge: 'AI' },
      ],
    },
    {
      title: 'INSIGHTS',
      items: [
        { id: 'analytics' as ActiveTab, label: 'Analytics', icon: BarChart3 },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-md animate-fade-in"
        onClick={onClose}
        aria-hidden="true" 
      />

      {/* Drawer */}
      <div 
        className="fixed top-0 bottom-0 left-0 w-72 bg-[#0D0D0F] border-r border-white/[0.08] flex flex-col justify-between p-4 z-10 animate-scale-in"
        role="dialog"
        aria-label="Mobile Navigation Menu"
      >
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#F5A623] flex items-center justify-center text-black font-extrabold text-sm">
                EF
              </div>
              <span className="font-heading font-bold text-lg text-white">
                EduFlow
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-zinc-400 hover:text-white"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* FOCUS Group */}
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-500 px-2 font-heading">
              FOCUS
            </span>
            <button
              onClick={() => {
                onClose();
                onOpenFocusTimer();
              }}
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[#F5A623]/10 border border-[#F5A623]/30 text-[#F5A623] font-bold text-xs"
            >
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-[#F5A623]" />
                <span>Focus Mode</span>
              </div>
              <span className="px-1.5 py-0.5 rounded bg-[#F5A623]/20 text-[10px] font-mono">
                {streakDays}d 🔥
              </span>
            </button>
          </div>

          {/* Grouped Nav Items */}
          <div className="space-y-4 pt-1">
            {navSections.map((sec) => (
              <div key={sec.title} className="space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-500 px-2 font-heading">
                  {sec.title}
                </span>

                {sec.items.map((item) => {
                  const isActive = activeTab === item.id;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onSelectTab(item.id);
                        onClose();
                      }}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs sm:text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-[#F5A623]/15 text-[#F5A623] font-bold'
                          : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="px-1.5 py-0.2 rounded bg-white/[0.08] text-[10px] font-bold text-zinc-300">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* User Card at bottom */}
        <div 
          onClick={() => {
            onClose();
            if (onOpenProfileModal) onOpenProfileModal();
          }}
          className="p-3 rounded-2xl bg-[#141416] border border-white/[0.08] flex items-center justify-between gap-3 cursor-pointer hover:border-white/[0.15]"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src={userProfile.avatar}
              alt={userProfile.name}
              className="w-9 h-9 rounded-full object-cover ring-2 ring-[#F5A623]"
            />
            <div className="min-w-0">
              <span className="text-xs font-bold text-white block truncate font-heading">
                {userProfile.name}
              </span>
              <span className="text-[10px] text-zinc-400">
                {userProfile.planTier}
              </span>
            </div>
          </div>
          <Settings className="w-4 h-4 text-zinc-400" />
        </div>
      </div>
    </div>
  );
};
