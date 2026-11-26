/** Corner radii (pt). `pill` turns any element into a capsule / circle. */
export const borderRadius = {
  hairline: 1,
  xxs: 2,
  xxs3: 3,
  tiny: 4,
  tiny5: 5,
  xs: 6,
  xs9: 9,
  sm: 10,
  sm11: 11,
  sm12: 12,
  md: 14,
  md15: 15,
  lg: 18,
  xl: 22,
  xxl: 28,
  hero: 40,
  pill: 999,
} as const;

/** Stroke widths (pt). */
export const borderWidth = {
  hairline: 1,
  card: 1,
  focus: 1.5,
  strong: 2,
} as const;
