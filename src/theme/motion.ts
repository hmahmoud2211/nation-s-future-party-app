/** Animation timing tokens (ms). Reanimated honours the system "Reduce Motion" setting. */
export const motion = {
  duration: {
    /** Press-in scale on tappable elements. */
    pressIn: 90,
    /** Release back to rest. */
    pressOut: 140,
    fast: 150,
    quick: 180,
    short: 200,
    medium: 220,
    sheet: 280,
    reveal: 420,
    intro: 500,
    progress: 650,
    slow: 700,
  },
  /** Delay between items in a staggered entrance. */
  stagger: 60,
  /** Delay between blocks on the login intro. */
  introStagger: 100,
} as const;
