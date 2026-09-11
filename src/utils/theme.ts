export interface AccentOption {
  id: string;
  name: string;
  hex: string;
  hoverHex: string;
  lightBg: string;
  subtleBg: string;
  borderHex: string;
  darkText: string;
  ringHex: string;
  gradient: string;
  twClass: string;
}

// 5 WCAG AA Calibrated Color Swatches (All >= 4.5:1 contrast against #FFFFFF)
export const ACCENT_PALETTE: AccentOption[] = [
  {
    id: 'purple',
    name: 'Purple',
    hex: '#7C3AED', // Violet 700 (5.5:1 with white)
    hoverHex: '#6D28D9',
    lightBg: 'rgba(124, 58, 237, 0.08)',
    subtleBg: 'rgba(124, 58, 237, 0.14)',
    borderHex: 'rgba(124, 58, 237, 0.25)',
    darkText: '#5B21B6',
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
    subtleBg: 'rgba(15, 118, 110, 0.14)',
    borderHex: 'rgba(15, 118, 110, 0.25)',
    darkText: '#134E4A',
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
    subtleBg: 'rgba(4, 120, 87, 0.14)',
    borderHex: 'rgba(4, 120, 87, 0.25)',
    darkText: '#064E3B',
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
    subtleBg: 'rgba(194, 65, 12, 0.14)',
    borderHex: 'rgba(194, 65, 12, 0.25)',
    darkText: '#7C2D12',
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
    subtleBg: 'rgba(190, 18, 60, 0.14)',
    borderHex: 'rgba(190, 18, 60, 0.25)',
    darkText: '#881337',
    ringHex: 'rgba(190, 18, 60, 0.35)',
    gradient: 'linear-gradient(135deg, #BE123C 0%, #9F1239 100%)',
    twClass: 'bg-[#BE123C]',
  },
];

export const DEFAULT_ACCENT_HEX = ACCENT_PALETTE[0].hex; // #7C3AED (Purple)

export function findAccentOption(hex?: string): AccentOption {
  if (!hex) return ACCENT_PALETTE[0];
  const normalized = hex.toUpperCase();
  // Check exact match or legacy color mapping
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

export function applyTheme(accentHex?: string): void {
  const accent = findAccentOption(accentHex);
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  root.style.setProperty('--theme-accent', accent.hex);
  root.style.setProperty('--theme-accent-hover', accent.hoverHex);
  root.style.setProperty('--theme-accent-light', accent.lightBg);
  root.style.setProperty('--theme-accent-subtle', accent.subtleBg);
  root.style.setProperty('--theme-accent-border', accent.borderHex);
  root.style.setProperty('--theme-accent-text', accent.darkText);
  root.style.setProperty('--theme-accent-ring', accent.ringHex);
  root.style.setProperty('--theme-accent-gradient', accent.gradient);
}
