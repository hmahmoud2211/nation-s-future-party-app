/**
 * Width breakpoints (pt). Phone layouts stay as designed (430pt reference); narrower phones step
 * some type down, wider screens cap content at `layout.maxContentWidth`.
 */
export const breakpoints = {
  /** Below this the brand header stacks its clock and tightens. */
  compact: 380,
  /** Below this dashboard highlight cards use the compact type. */
  narrow: 390,
  /** Tablets and wide web windows. */
  tablet: 768,
} as const;
