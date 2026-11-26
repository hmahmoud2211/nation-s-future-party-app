import { StyleSheet } from 'react-native';
import type { AppTheme } from '@/types/theme.types';

export const BRAND_MARK_SIZE = 84;
/** Password visibility and demo-accounts chevron icons. */
export const TOGGLE_ICON_SIZE = 18;
export const ACCOUNT_AVATAR_SIZE = 38;
const INTRO_MAX_WIDTH = 320;
/** Decorative rings behind the content. */
const RING_LARGE_SIZE = 340;
const RING_LARGE_OFFSET = -120;
const RING_LARGE_BORDER_WIDTH = 1.5;
const RING_SMALL_SIZE = 260;
const RING_SMALL_BOTTOM = -80;
const RING_SMALL_START = -100;

export function createStyles(theme: AppTheme) {
  const { colors, spacing, borderRadius, borderWidth, layout, shadows } = theme;
  return StyleSheet.create({
    // Clip the decorative rings: off-screen absolute views would otherwise widen the page on mobile browsers.
    root: { flex: 1, backgroundColor: colors.primary, overflow: 'hidden' },
    keyboard: { flex: 1 },
    // The top / bottom padding (safe area) is added at runtime.
    scroll: { paddingHorizontal: layout.gutter, alignItems: 'center' },
    brand: { alignItems: 'center', marginBottom: spacing.xxl },
    brandTitle: { marginTop: spacing.lg },
    brandIntro: { marginTop: spacing.sm, maxWidth: INTRO_MAX_WIDTH },
    card: {
      width: '100%',
      maxWidth: layout.maxCardWidth,
      backgroundColor: colors.white,
      borderRadius: borderRadius.xl,
      padding: spacing.xl,
      ...shadows.raised,
    },
    cardTitle: { marginBottom: spacing.lg },
    demoNotice: { marginTop: spacing.lg },
    accounts: { width: '100%', maxWidth: layout.maxCardWidth, marginTop: spacing.xl },
    accountsHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md },
    accountGroups: { gap: spacing.lg },
    accountGroup: { gap: spacing.sm },
    account: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      padding: spacing.md,
      borderRadius: borderRadius.lg,
      backgroundColor: colors.glassFaint,
      borderWidth: borderWidth.hairline,
      borderColor: colors.glassBorderSoft,
    },
    accountText: { flex: 1, gap: spacing.xs },
    ring1: {
      position: 'absolute',
      width: RING_LARGE_SIZE,
      height: RING_LARGE_SIZE,
      borderRadius: RING_LARGE_SIZE / 2,
      borderWidth: RING_LARGE_BORDER_WIDTH,
      borderColor: colors.decorRing,
      top: RING_LARGE_OFFSET,
      end: RING_LARGE_OFFSET,
    },
    ring2: {
      position: 'absolute',
      width: RING_SMALL_SIZE,
      height: RING_SMALL_SIZE,
      borderRadius: RING_SMALL_SIZE / 2,
      backgroundColor: colors.decorFill,
      bottom: RING_SMALL_BOTTOM,
      start: RING_SMALL_START,
    },
  });
}
