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
 * Typography hierarchy (Noto Sans Arabic + Poppins). Sizes follow the Figma reference at 430pt:
 * section headings 16 bold · card labels 15 · body 14 · secondary 12–13.
 * Arabic needs room for marks, so line heights are ~1.6×. Device text scaling is respected
 * (capped by MAX_FONT_SCALE). Never set `fontWeight` with these families (breaks Android).
 */
export const typography = {
  display: { fontFamily: fontFamily.bold, fontSize: 24, lineHeight: 38 },
  screenTitle: { fontFamily: fontFamily.bold, fontSize: 19, lineHeight: 30 },
  sectionTitle: { fontFamily: fontFamily.bold, fontSize: 16, lineHeight: 26 },
  subheading: { fontFamily: fontFamily.semibold, fontSize: 15, lineHeight: 24 },
  cardTitle: { fontFamily: fontFamily.semibold, fontSize: 14.5, lineHeight: 23 },
  body: { fontFamily: fontFamily.regular, fontSize: 14, lineHeight: 23 },
  /** Long-form reading text (announcement bodies). */
  bodyLoose: { fontFamily: fontFamily.regular, fontSize: 14, lineHeight: 26 },
  bodyMedium: { fontFamily: fontFamily.medium, fontSize: 14, lineHeight: 23 },
  bodyBold: { fontFamily: fontFamily.semibold, fontSize: 14, lineHeight: 23 },
  caption: { fontFamily: fontFamily.regular, fontSize: 13, lineHeight: 21 },
  captionMedium: { fontFamily: fontFamily.medium, fontSize: 13, lineHeight: 21 },
  meta: { fontFamily: fontFamily.regular, fontSize: 12, lineHeight: 19 },
  /** Medium-size badge label. */
  badgeLabel: { fontFamily: fontFamily.regular, fontSize: 12.5, lineHeight: 19 },
  micro: { fontFamily: fontFamily.regular, fontSize: 10, lineHeight: 15 },
  stat: { fontFamily: fontFamily.semibold, fontSize: 20, lineHeight: 30 },
  /** Day number inside a calendar date block. */
  dateDay: { fontFamily: fontFamily.bold, fontSize: 20, lineHeight: 28 },
  /** Total inside the slate count pill. */
  pillValue: { fontFamily: fontFamily.medium, fontSize: 18, lineHeight: 26 },
  button: { fontFamily: fontFamily.semibold, fontSize: 14, lineHeight: 22 },
  label: { fontFamily: fontFamily.medium, fontSize: 13, lineHeight: 21 },
  input: { fontFamily: fontFamily.regular, fontSize: 14.5, lineHeight: 22 },
  /** Compact inputs (search, composer, dialog prompt). */
  inputCompact: { fontFamily: fontFamily.regular, fontSize: 14, lineHeight: 22 },
  /** Multiline input line height. */
  inputMultiline: { fontFamily: fontFamily.regular, fontSize: 14.5, lineHeight: 23 },
  navLabel: { fontFamily: fontFamily.semibold, fontSize: 10.5, lineHeight: 15 },
  /** Count inside a filter chip. */
  chipCount: { fontFamily: fontFamily.regular, fontSize: 10.5, lineHeight: 17 },
  /** Notification count bubble on icon buttons. */
  countBadge: { fontFamily: fontFamily.regular, fontSize: 10, lineHeight: 14 },
  /** Smaller count bubble on tab bar icons. */
  countBadgeSmall: { fontFamily: fontFamily.regular, fontSize: 9.5, lineHeight: 12 },
  /** Chart axis labels. */
  chartLabel: { fontFamily: fontFamily.regular, fontSize: 9.5, lineHeight: 15 },
  /** Clock / weather text in the brand header. */
  headerMeta: { fontFamily: fontFamily.regular, fontSize: 11, lineHeight: 16 },
  headerMetaCompact: { fontFamily: fontFamily.regular, fontSize: 10, lineHeight: 15 },
  /** Wide-tracked English tagline under the emblem (size scales with the emblem). */
  tagline: { fontFamily: fontFamily.bold, lineHeight: 12, letterSpacing: 1.6 },
  /** Dashboard highlight card (meeting cards): label, weekday, date — and compact phone variants. */
  highlightLabel: { fontFamily: fontFamily.medium, fontSize: 15, lineHeight: 24 },
  highlightLabelCompact: { fontFamily: fontFamily.medium, fontSize: 14, lineHeight: 22 },
  highlightWeekday: { fontFamily: fontFamily.regular, fontSize: 14.5, lineHeight: 24 },
  highlightWeekdayCompact: { fontFamily: fontFamily.regular, fontSize: 13.5, lineHeight: 24 },
  highlightDate: { fontFamily: fontFamily.regular, fontSize: 16, lineHeight: 24 },
  highlightDateCompact: { fontFamily: fontFamily.regular, fontSize: 14.5, lineHeight: 24 },
} satisfies Record<string, TextStyle>;

export type TypographyVariant = keyof typeof typography;

/** Max font scale so large accessibility sizes don't break layouts. */
export const MAX_FONT_SCALE = 1.3;
