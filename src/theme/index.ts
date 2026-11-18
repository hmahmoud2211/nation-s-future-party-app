import { Platform, type TextStyle, type ViewStyle } from 'react-native';

/**
 * نظام التصميم المركزي — Design tokens.
 * All components must read colors / spacing / typography from here.
 */
export const colors = {
  navy: '#061B49',
  navy2: '#0B2B68',
  navy3: '#163A80',
  navySoft: '#E9EDF5',
  navyTint: '#F2F4F9',

  gold: '#C69A35',
  goldDark: '#A57E22',
  goldLight: '#E9D5A3',
  goldSoft: '#F8F1E1',

  bg: '#F7F8FA',
  card: '#FFFFFF',
  text: '#15213B',
  textSecondary: '#758198',
  textMuted: '#A3ACBD',
  border: '#E8EBF1',
  borderStrong: '#D7DCE6',

  success: '#24866C',
  successSoft: '#E5F3EE',
  warning: '#D69525',
  warningSoft: '#FCF2E0',
  error: '#D64545',
  errorSoft: '#FBEAEA',
  info: '#2F6BD8',
  infoSoft: '#E8F0FD',
  purple: '#6B4FBB',
  purpleSoft: '#EFEBFA',

  white: '#FFFFFF',
  black: '#000000',
  overlay: 'rgba(6, 27, 73, 0.45)',
} as const;

export type ColorKey = keyof typeof colors;

export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
} as const;

/** Horizontal gutter used by every screen. */
export const GUTTER = 16;

export const radius = {
  xs: 6,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  pill: 999,
} as const;

export const fonts = {
  regular: 'Cairo_400Regular',
  medium: 'Cairo_500Medium',
  semibold: 'Cairo_600SemiBold',
  bold: 'Cairo_700Bold',
  extrabold: 'Cairo_800ExtraBold',
} as const;

/**
 * Typography hierarchy — medium, comfortable Arabic sizes with restrained weights:
 * screen titles 20 · section headings 16 · card titles 14.5 · body 14 · secondary 12–13.
 * Cairo has tall glyphs, so line heights are generous. Device text scaling is respected
 * (capped by MAX_FONT_SCALE). Never set `fontWeight` with these families (breaks Android).
 */
export const typography = {
  display: { fontFamily: fonts.bold, fontSize: 22, lineHeight: 36 },
  screenTitle: { fontFamily: fonts.semibold, fontSize: 20, lineHeight: 32 },
  sectionTitle: { fontFamily: fonts.semibold, fontSize: 16, lineHeight: 26 },
  cardTitle: { fontFamily: fonts.semibold, fontSize: 14.5, lineHeight: 23 },
  body: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 23 },
  bodyMedium: { fontFamily: fonts.medium, fontSize: 14, lineHeight: 23 },
  bodyBold: { fontFamily: fonts.semibold, fontSize: 14, lineHeight: 23 },
  caption: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 21 },
  captionMedium: { fontFamily: fonts.medium, fontSize: 13, lineHeight: 21 },
  meta: { fontFamily: fonts.regular, fontSize: 12, lineHeight: 19 },
  stat: { fontFamily: fonts.semibold, fontSize: 20, lineHeight: 30 },
  button: { fontFamily: fonts.semibold, fontSize: 14, lineHeight: 22 },
  label: { fontFamily: fonts.medium, fontSize: 13, lineHeight: 21 },
} satisfies Record<string, TextStyle>;

export type TypographyVariant = keyof typeof typography;

export const shadows = {
  card: { boxShadow: '0px 1px 4px rgba(6, 27, 73, 0.05)' } as ViewStyle,
  raised: { boxShadow: '0px 8px 24px rgba(6, 27, 73, 0.12)' } as ViewStyle,
  gold: { boxShadow: '0px 6px 18px rgba(198, 154, 53, 0.30)' } as ViewStyle,
  none: {} as ViewStyle,
};

export const gradients = {
  navy: ['#0B2B68', '#061B49'] as const,
  navyDeep: ['#102F6E', '#061B49', '#04122F'] as const,
  gold: ['#D9B158', '#C69A35', '#A57E22'] as const,
};

/**
 * Tones used by badges / stat cards / icons.
 */
export type Tone = 'navy' | 'gold' | 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'purple';

export const toneColors: Record<Tone, { fg: string; bg: string }> = {
  navy: { fg: colors.navy2, bg: colors.navySoft },
  gold: { fg: colors.goldDark, bg: colors.goldSoft },
  success: { fg: colors.success, bg: colors.successSoft },
  warning: { fg: '#B37812', bg: colors.warningSoft },
  error: { fg: colors.error, bg: colors.errorSoft },
  info: { fg: colors.info, bg: colors.infoSoft },
  neutral: { fg: colors.textSecondary, bg: '#EEF0F4' },
  purple: { fg: colors.purple, bg: colors.purpleSoft },
};

/** Max font scale so large accessibility sizes don't break layouts. */
export const MAX_FONT_SCALE = 1.3;

export const theme = { colors, spacing, radius, fonts, typography, shadows, gradients, toneColors };
export default theme;

/**
 * Forces right-to-left layout for a subtree.
 * Native: Yoga `direction: 'rtl'`. Web: handled globally with `<html dir="rtl">`
 * (react-native-web does not accept the `direction` style).
 */
export const RTL_ROOT: ViewStyle = Platform.OS === 'web' ? {} : { direction: 'rtl' };
