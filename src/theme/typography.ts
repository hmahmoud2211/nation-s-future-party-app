import type { TextStyle } from 'react-native';

/**
 * Arabic text: Noto Sans Arabic — the closest bundleable match to the design's lettering
 * (SF Arabic, which can't ship on Android / web).
 */
export const fontFamily = {
  regular: 'NotoSansArabic_400Regular',
  medium: 'NotoSansArabic_500Medium',
  semibold: 'NotoSansArabic_600SemiBold',
  bold: 'NotoSansArabic_700Bold',
  extrabold: 'NotoSansArabic_800ExtraBold',
} as const;

/**
 * Numbers and Latin text are set in Poppins at the same weight, exactly as in the design
 * (22/11/2026, 63, 9:36PM, "FUTURE OF THE NATION"). AppText applies this automatically to
 * Latin runs inside Arabic text.
 */
export const latinFonts: Readonly<Record<string, string>> = {
  [fontFamily.regular]: 'Poppins_400Regular',
  [fontFamily.medium]: 'Poppins_500Medium',
  [fontFamily.semibold]: 'Poppins_600SemiBold',
  [fontFamily.bold]: 'Poppins_700Bold',
  [fontFamily.extrabold]: 'Poppins_700Bold',
};

/**
 * Numeral style for every number in the UI. The design uses Western digits (22/11/2026, 63, 80%);
 * switch to 'arabic' for Arabic-Indic digits (٢٢/١١/٢٠٢٦) — `localizeDigits()` and AppText follow it.
 */
export const NUMERAL_STYLE: 'latin' | 'arabic' = 'latin';

/**
 * One knob for the size of all text in the app (1 = the 430pt Figma reference sizes written below).
 * Line heights scale with it so Arabic marks keep their room.
 */
export const TYPE_SCALE = 0.9;
/** Smallest rendered size — chart axes and count badges stay readable. */
const MIN_FONT_SIZE = 9;
/** Reference font size → rendered size (rounded to 0.5pt). */
const fs = (size: number) => Math.max(MIN_FONT_SIZE, Math.round(size * TYPE_SCALE * 2) / 2);
/** Reference line height → rendered line height (whole points). */
const lh = (height: number) => Math.round(height * TYPE_SCALE);

/**
 * Typography hierarchy (Noto Sans Arabic + Poppins). Reference sizes (×TYPE_SCALE when rendered):
 * section headings 16 bold · card labels 15 · body 14 · secondary 12–13.
 * Arabic needs room for marks, so line heights are ~1.6×. Device text scaling is respected
 * (capped by MAX_FONT_SCALE). Never set `fontWeight` with these families (breaks Android).
 */
export const typography = {
  display: { fontFamily: fontFamily.bold, fontSize: fs(24), lineHeight: lh(38) },
  screenTitle: { fontFamily: fontFamily.bold, fontSize: fs(19), lineHeight: lh(30) },
  sectionTitle: { fontFamily: fontFamily.bold, fontSize: fs(16), lineHeight: lh(26) },
  subheading: { fontFamily: fontFamily.semibold, fontSize: fs(15), lineHeight: lh(24) },
  cardTitle: { fontFamily: fontFamily.semibold, fontSize: fs(14.5), lineHeight: lh(23) },
  body: { fontFamily: fontFamily.regular, fontSize: fs(14), lineHeight: lh(23) },
  /** Long-form reading text (announcement bodies). */
  bodyLoose: { fontFamily: fontFamily.regular, fontSize: fs(14), lineHeight: lh(26) },
  bodyMedium: { fontFamily: fontFamily.medium, fontSize: fs(14), lineHeight: lh(23) },
  bodyBold: { fontFamily: fontFamily.semibold, fontSize: fs(14), lineHeight: lh(23) },
  caption: { fontFamily: fontFamily.regular, fontSize: fs(13), lineHeight: lh(21) },
  captionMedium: { fontFamily: fontFamily.medium, fontSize: fs(13), lineHeight: lh(21) },
  meta: { fontFamily: fontFamily.regular, fontSize: fs(12), lineHeight: lh(19) },
  /** Medium-size badge label. */
  badgeLabel: { fontFamily: fontFamily.regular, fontSize: fs(12.5), lineHeight: lh(19) },
  micro: { fontFamily: fontFamily.regular, fontSize: fs(10), lineHeight: lh(15) },
  stat: { fontFamily: fontFamily.semibold, fontSize: fs(20), lineHeight: lh(30) },
  /** Day number inside a calendar date block. */
  dateDay: { fontFamily: fontFamily.bold, fontSize: fs(20), lineHeight: lh(28) },
  /** Total inside the slate count pill. */
  pillValue: { fontFamily: fontFamily.medium, fontSize: fs(18), lineHeight: lh(26) },
  button: { fontFamily: fontFamily.semibold, fontSize: fs(14), lineHeight: lh(22) },
  label: { fontFamily: fontFamily.medium, fontSize: fs(13), lineHeight: lh(21) },
  input: { fontFamily: fontFamily.regular, fontSize: fs(14.5), lineHeight: lh(22) },
  /** Compact inputs (search, composer, dialog prompt). */
  inputCompact: { fontFamily: fontFamily.regular, fontSize: fs(14), lineHeight: lh(22) },
  /** Multiline input line height. */
  inputMultiline: { fontFamily: fontFamily.regular, fontSize: fs(14.5), lineHeight: lh(23) },
  navLabel: { fontFamily: fontFamily.semibold, fontSize: fs(10.5), lineHeight: lh(15) },
  /** Count inside a filter chip. */
  chipCount: { fontFamily: fontFamily.regular, fontSize: fs(10.5), lineHeight: lh(17) },
  /** Notification count bubble on icon buttons. */
  countBadge: { fontFamily: fontFamily.regular, fontSize: fs(10), lineHeight: lh(14) },
  /** Smaller count bubble on tab bar icons. */
  countBadgeSmall: { fontFamily: fontFamily.regular, fontSize: fs(9.5), lineHeight: lh(12) },
  /** Chart axis labels. */
  chartLabel: { fontFamily: fontFamily.regular, fontSize: fs(9.5), lineHeight: lh(15) },
  /** Wide-tracked English tagline under the emblem (size scales with the emblem). */
  tagline: { fontFamily: fontFamily.bold, lineHeight: lh(12), letterSpacing: 1.6 },
} satisfies Record<string, TextStyle>;

export type TypographyVariant = keyof typeof typography;

/** Max font scale so large accessibility sizes don't break layouts. */
export const MAX_FONT_SCALE = 1.3;
