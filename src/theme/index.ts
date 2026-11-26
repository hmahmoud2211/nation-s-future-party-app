/**
 * نظام التصميم المركزي — Design tokens.
 *
 * Every colour, font size, spacing, radius, shadow and animation value lives in this folder.
 * Screens read the theme through `useAppTheme()`; components may import the token groups directly.
 */
import { borderRadius, borderWidth } from '@/theme/borderRadius';
import { breakpoints } from '@/theme/breakpoints';
import { chartPalette, colors, gradients, identityColors, identityPalette, tintAlpha, toneColors, withAlpha } from '@/theme/colors';
import { layout, opacity, sizes } from '@/theme/layout';
import { motion } from '@/theme/motion';
import { shadows } from '@/theme/shadows';
import { spacing } from '@/theme/spacing';
import { fontFamily, latinFonts, typography } from '@/theme/typography';
import { backdrop, glassMaterials } from '@/theme/glass';

export { borderRadius, borderWidth } from '@/theme/borderRadius';
export { breakpoints } from '@/theme/breakpoints';
export { chartPalette, colors, gradients, identityColors, tintAlpha, withAlpha, identityPalette, toneColors, type ColorKey, type Gradient, type Tone } from '@/theme/colors';
export { GUTTER, layout, LTR_ROW, opacity, RTL_ROOT, sizes } from '@/theme/layout';
export { motion } from '@/theme/motion';
export { shadows } from '@/theme/shadows';
export { spacing, type SpacingKey } from '@/theme/spacing';
export { fontFamily, latinFonts, MAX_FONT_SCALE, NUMERAL_STYLE, typography, type TypographyVariant } from '@/theme/typography';
export { backdrop, glassMaterials, SHEEN_DEPTH, type GlassMaterial } from '@/theme/glass';

/** The whole design system as one object — provided by ThemeContext, returned by useAppTheme(). */
export const appTheme = {
  colors,
  gradients,
  identityColors,
  identityPalette,
  chartPalette,
  toneColors,
  tintAlpha,
  withAlpha,
  typography,
  fontFamily,
  latinFonts,
  spacing,
  borderRadius,
  borderWidth,
  shadows,
  layout,
  sizes,
  opacity,
  breakpoints,
  motion,
  glassMaterials,
  backdrop,
} as const;
