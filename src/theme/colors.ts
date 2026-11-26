/**
 * Colour tokens — derived from the «مستقبل وطن» Home Page Figma references (deep navy headings, slate-indigo
 * tiles, blue / teal / violet data gradients), set on Apple-style glass: frosted translucent panes with a bright
 * rim over a softly coloured backdrop (see `glass.ts`).
 */

// ───────────── Raw palette (do not use directly outside src/theme) ─────────────

const palette = {
  navy900: '#0B1450',
  navy800: '#0F1963',
  navy700: '#1C2160',
  navy600: '#232A6E',
  navy500: '#2D3A7B',
  navy400: '#334079',
  slate600: '#4A5F94',
  slate500: '#5A6293',
  slate400: '#6370A0',
  slate300: '#777FCD',
  slate100: '#E6E7F0',
  slate50: '#F1F2F7',
  blue600: '#156EC7',
  blue500: '#2F7BEA',
  blue300: '#6892D8',
  blue100: '#E7EEFC',
  violet500: '#6A5AF0',
  sky400: '#5EB2F1',
  cyan300: '#56CCF2',
  teal500: '#1FBFB2',
  teal300: '#58C6C0',
  gray500: '#656988',
  gray400: '#9A9DB4',
  gray300: '#A0A0B6',
  gray200: '#DCDEEA',
  gray100: '#E8E9F1',
} as const;

// ───────────── Semantic colours ─────────────

export const colors = {
  // Brand
  primary: palette.navy800,
  primaryDark: palette.navy900,
  primaryLight: palette.navy400,
  /** Navy-tinted glass wash — soft buttons, icon wells, the primary tone. */
  primarySoft: 'rgba(15,25,99,0.07)',
  /** Slate indigo — dropdowns, icon tiles, count pills, navigation. */
  secondary: palette.slate500,
  secondaryDark: palette.slate600,
  secondaryLight: palette.slate400,
  /** Bright blue used for links, focus and data highlights. */
  accent: palette.blue500,
  accentStrong: palette.blue600,
  /** Light periwinkle — readable on navy surfaces, soft borders on light ones. */
  accentLight: '#B9C6F4',
  accentSoft: palette.blue100,
  violet: palette.violet500,
  teal: palette.teal500,

  // Surfaces
  background: '#F3F4F8',
  surface: '#FFFFFF',
  /** Card background: frosted glass (the backdrop shows through, softened). */
  card: 'rgba(255,255,255,0.58)',
  cardSolid: '#FFFFFF',
  /** Neutral tinted surface (disabled inputs, icon wells, panels inside cards). */
  tint: 'rgba(241,243,252,0.72)',

  // Glass — frosted fills and the bright rim of a glass pane
  /** Cards and panels. */
  frost: 'rgba(255,255,255,0.58)',
  /** Fields, chips and panes nested in cards (brighter than the card under them). */
  frostStrong: 'rgba(255,255,255,0.74)',
  frostSubtle: 'rgba(255,255,255,0.34)',
  /** The light edge every glass pane carries. */
  rim: 'rgba(255,255,255,0.92)',
  rimSoft: 'rgba(255,255,255,0.6)',

  // Text
  text: palette.navy800,
  textSecondary: palette.gray500,
  textMuted: palette.gray400,
  placeholder: '#A7AAC0',
  onPrimary: '#FFFFFF',
  onPrimaryMuted: 'rgba(255,255,255,0.74)',

  // Lines
  /** Card outline — the bright rim of the glass pane. */
  cardBorder: 'rgba(255,255,255,0.92)',
  /** Hairlines are translucent navy, so they read on any glass tint. */
  border: 'rgba(15,25,99,0.12)',
  borderStrong: 'rgba(15,25,99,0.22)',
  divider: 'rgba(15,25,99,0.07)',

  // States
  active: palette.navy800,
  inactive: palette.gray400,
  disabled: '#C9CBD9',
  pressed: 'rgba(15,25,99,0.06)',

  // Feedback
  success: '#159A82',
  successSoft: '#E2F5F1',
  warning: '#D9921A',
  warningSoft: '#FCF2DF',
  warningText: '#B0700C',
  error: '#D9434F',
  errorSoft: '#FCE9EB',
  errorBorder: '#F3CACA',
  info: palette.blue500,
  infoSoft: palette.blue100,
  infoBorder: '#CFDDF8',
  purple: palette.violet500,
  purpleSoft: '#EEEBFD',
  neutralSoft: 'rgba(15,25,99,0.06)',

  // Glass (controls and panels on navy surfaces)
  glassFaint: 'rgba(255,255,255,0.07)',
  glass: 'rgba(255,255,255,0.10)',
  glassStrong: 'rgba(255,255,255,0.16)',
  glassActive: 'rgba(255,255,255,0.28)',
  glassBorderSoft: 'rgba(255,255,255,0.14)',
  glassBorder: 'rgba(255,255,255,0.22)',
  /** Secondary text / icons on navy surfaces. */
  onPrimarySubtle: 'rgba(255,255,255,0.62)',
  /** Decorative rings on navy backgrounds (login). */
  decorRing: 'rgba(185,198,244,0.20)',
  decorFill: 'rgba(185,198,244,0.07)',

  /** Weather sun glyph in the header. */
  sun: '#F6C445',

  white: '#FFFFFF',
  black: '#000000',
  /** Scrim behind sheets and dialogs — light, so the blurred screen still reads through the glass. */
  overlay: 'rgba(11,20,80,0.32)',
  /** Full-screen video call background. */
  callBackground: '#0A1240',
} as const;

export type ColorKey = keyof typeof colors;

/**
 * Identity colours given to committees and member avatars (data, not UI chrome). Mock data and
 * the committee colour picker pick from this palette.
 */
export const identityColors = {
  navy: '#0B2B68',
  indigo: '#3D4FB0',
  forest: '#2E6B5B',
  plum: '#9E3D5A',
  amber: '#B5782A',
  ocean: '#1F5A8A',
  bronze: '#5B4A2E',
  slate: '#4A4A6A',
  teal: '#2A7F9E',
  olive: '#7A5C1F',
  green: '#3E8A4A',
  violet: '#6B4FBB',
} as const;

/** The identity colours in their canonical order. */
export const identityPalette: readonly string[] = Object.values(identityColors);

// ───────────── Gradients ─────────────

export type Gradient = readonly [string, string, ...string[]];

export const gradients = {
  /** Hero / header surface (top → bottom). */
  header: ['#2C4285', '#2D3A7B', '#23245F', '#1C2160'] as Gradient,
  /** Navy tile (quick actions). */
  tile: [palette.navy400, '#222D6F'] as Gradient,
  /** Slate tile (icon tiles, pills). */
  slate: ['#6A72A6', palette.slate500] as Gradient,
  /** Chart columns (top → bottom). */
  chartBar: [palette.violet500, palette.sky400] as Gradient,
  /** Rating / progress fill (start → end of the fill). */
  progress: ['#5A2BFF', '#1F7BEA', palette.cyan300] as Gradient,
  /** Section divider (fades out at both ends). */
  divider: ['rgba(90,98,147,0)', 'rgba(90,98,147,0.85)', 'rgba(90,98,147,0)'] as Gradient,
  /** Progress ring arcs. */
  ringBlue: [palette.blue600, palette.blue300] as Gradient,
  ringNavy: ['#1E3E92', '#5B8BD0'] as Gradient,
  ringTeal: [palette.teal500, palette.teal300] as Gradient,
  /** Soft light behind the header emblem (centre → edge, radial). */
  headerGlow: ['rgba(98,132,220,0.42)', 'rgba(98,132,220,0)'] as Gradient,
  /** Placeholder brand emblem disc (centre → edge, radial). */
  brandDisc: ['#7CC8F2', '#2E8FD6'] as Gradient,
  /** Progress ring centre (edge → centre, radial). */
  ringCore: ['#142068', '#5A6090'] as Gradient,
};

// ───────────── Tones ─────────────

/** Tones used by badges / stat cards / icons. */
export type Tone = 'primary' | 'accent' | 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'purple';

export const toneColors: Record<Tone, { fg: string; bg: string }> = {
  primary: { fg: colors.primary, bg: colors.primarySoft },
  accent: { fg: colors.accentStrong, bg: colors.accentSoft },
  success: { fg: colors.success, bg: colors.successSoft },
  warning: { fg: colors.warningText, bg: colors.warningSoft },
  error: { fg: colors.error, bg: colors.errorSoft },
  info: { fg: colors.info, bg: colors.infoSoft },
  neutral: { fg: colors.textSecondary, bg: colors.neutralSoft },
  purple: { fg: colors.purple, bg: colors.purpleSoft },
};

/** Categorical series colours for charts, in order, all drawn from the palette above. */
export const chartPalette: readonly string[] = [colors.primary, colors.accent, colors.teal, colors.violet, colors.secondary, colors.warning, colors.error, colors.success];

// ───────────── Tints ─────────────

/** Opacity steps (2-digit hex alpha) for translucent wells behind identity / tone colours. */
export const tintAlpha = {
  /** ≈ 8% — report section icon wells. */
  faint: '14',
  /** ≈ 9% — committee icon wells. */
  soft: '18',
} as const;

/** `#RRGGBB` + a `tintAlpha` step → `#RRGGBBAA`, e.g. a translucent well in a committee's colour. */
export function withAlpha(hex: string, alpha: string): string {
  return `${hex}${alpha}`;
}
