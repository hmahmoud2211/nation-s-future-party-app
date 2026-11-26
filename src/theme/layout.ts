import { Platform, type ViewStyle } from 'react-native';

/** Horizontal gutter used by every standard screen. */
export const GUTTER = 18;

/** Shared screen rhythm. */
export const layout = {
  gutter: GUTTER,
  /**
   * Dashboard (Home) gutter: 32pt at the 430pt reference; on narrower phones the gutter shrinks
   * first so cards keep (close to) the design's 366pt content width.
   */
  wideGutter: (screenWidth: number) => Math.round(Math.min(32, Math.max(GUTTER, (screenWidth - 366) / 2))),
  /** Space between two sections. */
  sectionGap: 28,
  /** Space between a section title and its content. */
  sectionTitleGap: 12,
  /** Space between stacked items inside a section. */
  itemGap: 14,
  cardPadding: 16,
  formGap: 16,
  /** Top padding of dashboard content under the brand header. */
  dashboardTop: 26,
  /** Readable max width for content on tablets / web. */
  maxContentWidth: 720,
  /** Max width of centred cards (login) and dialogs. */
  maxCardWidth: 460,
  maxDialogWidth: 420,
  maxToastWidth: 520,
} as const;

/** Component sizes (pt). */
export const sizes = {
  icon: { xs: 14, sm: 16, md: 20, lg: 24, xl: 40 },
  button: { sm: 38, md: 48, lg: 54 },
  input: 50,
  iconButton: 42,
  /** Slate icon tile inside highlight cards (meeting cards). */
  iconTile: 52,
  headerControl: 38,
  /** Floating bottom navigation. */
  tabBar: { height: 58, sideInset: 26, bottomGap: 10 },
  touchTarget: 44,
} as const;

/** Opacity for pressed / disabled states. */
export const opacity = { disabled: 0.5, pressedOverlay: 0.06 } as const;

/**
 * Forces right-to-left layout for a subtree.
 * Native: Yoga `direction: 'rtl'`. Web: handled globally with `<html dir="rtl">`
 * (react-native-web does not accept the `direction` style).
 */
export const RTL_ROOT: ViewStyle = Platform.OS === 'web' ? {} : { direction: 'rtl' };

/**
 * A physical left-to-right row inside the (always) RTL root — for charts whose time axis reads
 * left → right as in the design. Children render in source order from the left edge.
 */
export const LTR_ROW: ViewStyle = { flexDirection: 'row-reverse' };
