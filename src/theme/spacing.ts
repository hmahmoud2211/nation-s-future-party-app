/** Spacing scale (pt). Use these for padding, margin and gap. */
export const spacing = {
  hairline: 1,
  xxs: 2,
  xxs3: 3,
  xs: 4,
  xs5: 5,
  xs6: 6,
  sm: 8,
  sm10: 10,
  md: 12,
  md14: 14,
  lg: 16,
  lg18: 18,
  xl: 20,
  xxl: 24,
  xxl26: 26,
  section: 28,
  section30: 30,
  xxxl: 32,
  huge: 40,
} as const;

export type SpacingKey = keyof typeof spacing;
