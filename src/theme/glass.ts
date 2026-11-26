/**
 * Glass materials — the app's surface language, after Apple's glass: translucent panes with a bright rim and a
 * soft top sheen, floating over a softly coloured backdrop.
 *
 * - Panes that sit on the static backdrop (cards, fields, chips) use the frosted fills in `colors` (`frost*`, `rim*`):
 *   the backdrop is already soft, so a translucent fill reads exactly like blur and costs nothing in long lists.
 * - Floating chrome that content scrolls under (tab bar, sheets, dialogs, toasts, action bars) uses a real blur
 *   (`GlassBackdrop`), and Apple's native Liquid Glass on iOS 26+.
 */
import type { Gradient } from '@/theme/colors';

export type GlassMaterial = 'chrome' | 'sheet' | 'dark';

/** Blur strength (expo-blur `intensity`, 1–100) and the tint laid over it, per material. */
export const glassMaterials: Record<GlassMaterial, { blur: number; tint: 'light' | 'dark'; fill: string; fillOpaque: string; sheen: Gradient }> = {
  /** Tab bar, action bars, input bars. */
  chrome: {
    blur: 40,
    tint: 'light',
    fill: 'rgba(255,255,255,0.46)',
    // Where live blur is unavailable (Android, Reduce Transparency) the pane is nearly opaque so text stays legible.
    fillOpaque: 'rgba(250,251,255,0.94)',
    sheen: ['rgba(255,255,255,0.75)', 'rgba(255,255,255,0)'],
  },
  /** Bottom sheets and dialogs. */
  sheet: {
    blur: 60,
    tint: 'light',
    fill: 'rgba(244,246,253,0.66)',
    fillOpaque: 'rgba(244,246,253,0.97)',
    sheen: ['rgba(255,255,255,0.8)', 'rgba(255,255,255,0)'],
  },
  /** Toasts and glass controls on navy headers. */
  dark: {
    blur: 30,
    tint: 'dark',
    fill: 'rgba(20,28,96,0.62)',
    fillOpaque: 'rgba(20,28,96,0.94)',
    sheen: ['rgba(255,255,255,0.22)', 'rgba(255,255,255,0)'],
  },
};

/** Share of a pane's height the top sheen covers. */
export const SHEEN_DEPTH = '55%';

/**
 * The page backdrop: a cool light base with large soft colour orbs from the brand palette, so the glass above it
 * has colour to pick up. Positions are fractions of the screen (cx / cy) and of its longer side (r).
 */
export const backdrop = {
  base: ['#F4F6FE', '#E9EDFA', '#E2E7F7'] as Gradient,
  orbs: [
    { color: '#5EB2F1', opacity: 0.55, cx: 0.92, cy: 0.06, r: 0.55 },
    { color: '#6A5AF0', opacity: 0.32, cx: 0.04, cy: 0.38, r: 0.5 },
    { color: '#56CCF2', opacity: 0.45, cx: 0.12, cy: 0.94, r: 0.55 },
    { color: '#2F7BEA', opacity: 0.28, cx: 0.98, cy: 0.7, r: 0.45 },
  ],
} as const;
