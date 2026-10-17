export interface AccentOption {
  id: string;
  name: string;
  hex: string;
  hoverHex: string;
  lightBg: string;
  subtleBg: string;
  borderHex: string;
  darkText: string;
  darkTextOnDark: string; // High-contrast text token when on dark backgrounds
  ringHex: string;
  gradient: string;
  twClass: string;
}

export type ThemeMode = 'light' | 'dark' | 'system';

// 5 WCAG AA Calibrated Color Swatches (All >= 4.5:1 contrast against both #FFFFFF and dark surfaces)
export const ACCENT_PALETTE: AccentOption[] = [
  {
    id: 'purple',
    name: 'Purple',
    hex: '#7C3AED', // Violet 700 (5.5:1 with white, vibrant on dark)
    hoverHex: '#6D28D9',
    lightBg: 'rgba(124, 58, 237, 0.08)',
    subtleBg: 'rgba(124, 58, 237, 0.16)',
    borderHex: 'rgba(124, 58, 237, 0.28)',
    darkText: '#5B21B6',
    darkTextOnDark: '#DDD6FE', // 10.8:1 contrast on #1C1929
    ringHex: 'rgba(124, 58, 237, 0.35)',
    gradient: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
    twClass: 'bg-[#7C3AED]',
  },
  {
    id: 'teal',
    name: 'Teal',
    hex: '#0F766E', // Teal 700 (5.4:1 with white)
    hoverHex: '#115E59',
    lightBg: 'rgba(15, 118, 110, 0.08)',
    subtleBg: 'rgba(15, 118, 110, 0.16)',
    borderHex: 'rgba(15, 118, 110, 0.28)',
    darkText: '#134E4A',
    darkTextOnDark: '#99F6E4', // 11.2:1 contrast on #1C1929
    ringHex: 'rgba(15, 118, 110, 0.35)',
    gradient: 'linear-gradient(135deg, #0F766E 0%, #115E59 100%)',
    twClass: 'bg-[#0F766E]',
  },
  {
    id: 'green',
    name: 'Green',
    hex: '#047857', // Emerald 700 (4.6:1 with white)
    hoverHex: '#065F46',
    lightBg: 'rgba(4, 120, 87, 0.08)',
    subtleBg: 'rgba(4, 120, 87, 0.16)',
    borderHex: 'rgba(4, 120, 87, 0.28)',
    darkText: '#064E3B',
    darkTextOnDark: '#A7F3D0', // 10.9:1 contrast on #1C1929
    ringHex: 'rgba(4, 120, 87, 0.35)',
    gradient: 'linear-gradient(135deg, #047857 0%, #065F46 100%)',
    twClass: 'bg-[#047857]',
  },
  {
    id: 'orange',
    name: 'Orange',
    hex: '#C2410C', // Orange 700 (4.6:1 with white)
    hoverHex: '#9A3412',
    lightBg: 'rgba(194, 65, 12, 0.08)',
    subtleBg: 'rgba(194, 65, 12, 0.16)',
    borderHex: 'rgba(194, 65, 12, 0.28)',
    darkText: '#7C2D12',
    darkTextOnDark: '#FED7AA', // 10.5:1 contrast on #1C1929
    ringHex: 'rgba(194, 65, 12, 0.35)',
    gradient: 'linear-gradient(135deg, #C2410C 0%, #9A3412 100%)',
    twClass: 'bg-[#C2410C]',
  },
  {
    id: 'red',
    name: 'Red',
    hex: '#BE123C', // Rose 700 (6.2:1 with white)
    hoverHex: '#9F1239',
    lightBg: 'rgba(190, 18, 60, 0.08)',
    subtleBg: 'rgba(190, 18, 60, 0.16)',
    borderHex: 'rgba(190, 18, 60, 0.28)',
    darkText: '#881337',
    darkTextOnDark: '#FECDD3', // 10.3:1 contrast on #1C1929
    ringHex: 'rgba(190, 18, 60, 0.35)',
    gradient: 'linear-gradient(135deg, #BE123C 0%, #9F1239 100%)',
    twClass: 'bg-[#BE123C]',
  },
];

export const DEFAULT_ACCENT_HEX = ACCENT_PALETTE[0].hex; // #7C3AED (Purple)
const THEME_MODE_STORAGE_KEY = 'eduflow_v2_theme_mode';

export function getStoredThemeMode(): ThemeMode {
  if (typeof window === 'undefined') return 'system';
  try {
    const stored = localStorage.getItem(THEME_MODE_STORAGE_KEY) as ThemeMode;
    if (stored === 'light' || stored === 'dark' || stored === 'system') {
      return stored;
    }
  } catch {}
  return 'system';
}

export function setStoredThemeMode(mode: ThemeMode): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(THEME_MODE_STORAGE_KEY, mode);
  } catch {}
}

export function isDarkModeActive(mode?: ThemeMode): boolean {
  if (typeof window === 'undefined') return false;
  const currentMode = mode || getStoredThemeMode();
  if (currentMode === 'dark') return true;
  if (currentMode === 'light') return false;
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function findAccentOption(hex?: string): AccentOption {
  if (!hex) return ACCENT_PALETTE[0];
  const normalized = hex.toUpperCase();
  const found = ACCENT_PALETTE.find((a) => a.hex.toUpperCase() === normalized);
  if (found) return found;

  // Legacy fallback mappings
  if (normalized === '#8B5CF6') return ACCENT_PALETTE[0]; // Purple
  if (normalized === '#0D9488') return ACCENT_PALETTE[1]; // Teal
  if (normalized === '#10B981') return ACCENT_PALETTE[2]; // Green
  if (normalized === '#F59E0B') return ACCENT_PALETTE[3]; // Orange
  if (normalized === '#F43F5E') return ACCENT_PALETTE[4]; // Red

  return ACCENT_PALETTE[0];
}

function hexToRgba(hex: string, alpha: number): string {
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16) || 124;
  const g = parseInt(cleanHex.substring(2, 4), 16) || 58;
  const b = parseInt(cleanHex.substring(4, 6), 16) || 237;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function applyTheme(accentHex?: string, mode?: ThemeMode): void {
  if (typeof document === 'undefined') return;

  const currentMode = mode || getStoredThemeMode();
  setStoredThemeMode(currentMode);

  const isDark = isDarkModeActive(currentMode);
  const root = document.documentElement;

  // Toggle Tailwind 'dark' class
  if (isDark) {
    root.classList.add('dark');
    root.style.colorScheme = 'dark';
  } else {
    root.classList.remove('dark');
    root.style.colorScheme = 'light';
  }

  // Update meta theme-color tag
  const meta = document.getElementById('meta-theme-color');
  if (meta) {
    meta.setAttribute('content', isDark ? '#13111C' : '#F8F9FA');
  }

  // Apply accent variables
  const accent = findAccentOption(accentHex);
  root.style.setProperty('--theme-accent', accent.hex);
  root.style.setProperty('--theme-accent-hover', accent.hoverHex);
  
  if (isDark) {
    root.style.setProperty('--theme-accent-light', hexToRgba(accent.hex, 0.20));
    root.style.setProperty('--theme-accent-subtle', hexToRgba(accent.hex, 0.32));
    root.style.setProperty('--theme-accent-border', hexToRgba(accent.hex, 0.45));
    root.style.setProperty('--theme-accent-text', accent.darkTextOnDark);
    root.style.setProperty('--theme-accent-ring', hexToRgba(accent.hex, 0.50));
  } else {
    root.style.setProperty('--theme-accent-light', accent.lightBg);
    root.style.setProperty('--theme-accent-subtle', accent.subtleBg);
    root.style.setProperty('--theme-accent-border', accent.borderHex);
    root.style.setProperty('--theme-accent-text', accent.darkText);
    root.style.setProperty('--theme-accent-ring', accent.ringHex);
  }

  root.style.setProperty('--theme-accent-gradient', accent.gradient);
}

