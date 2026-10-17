import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { ThemeMode } from '../../utils/theme';

interface ThemeModeToggleProps {
  currentMode: ThemeMode;
  onChange: (mode: ThemeMode) => void;
  size?: 'sm' | 'md';
}

export const ThemeModeToggle: React.FC<ThemeModeToggleProps> = ({
  currentMode,
  onChange,
  size = 'md',
}) => {
  const options: { mode: ThemeMode; label: string; icon: React.ReactNode }[] = [
    { mode: 'light', label: 'Light', icon: <Sun className={size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} /> },
    { mode: 'dark', label: 'Dark', icon: <Moon className={size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} /> },
    { mode: 'system', label: 'System', icon: <Monitor className={size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} /> },
  ];

  return (
    <div
      className="inline-flex items-center p-0.5 rounded-full bg-slate-100 dark:bg-[#1C1929] border border-slate-200 dark:border-[#2E2A44] select-none"
      role="radiogroup"
      aria-label="Theme selection"
    >
      {options.map((opt) => {
        const isActive = currentMode === opt.mode;
        return (
          <button
            key={opt.mode}
            type="button"
            role="radio"
            aria-checked={isActive}
            onClick={() => onChange(opt.mode)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full font-sans transition-all cursor-pointer ${
              size === 'sm' ? 'text-[11px]' : 'text-xs'
            } font-semibold ${
              isActive
                ? 'bg-white dark:bg-[#2E2A44] text-slate-900 dark:text-white shadow-sm ring-1 ring-slate-200/50 dark:ring-[#3B3759]'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
            title={`Switch to ${opt.label} theme`}
          >
            {opt.icon}
            <span className={size === 'sm' ? 'hidden sm:inline' : 'inline'}>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default ThemeModeToggle;
