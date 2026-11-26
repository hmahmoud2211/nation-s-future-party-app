import { StyleSheet } from 'react-native';
import type { AppTheme } from '@/types/theme.types';

/** Measured from the Figma design (430pt reference). */
export const MEETING_CARD_MIN_HEIGHT = 64;
/** Navy bar on the end edge of the meeting cards. */
export const MEETING_ACCENT_WIDTH = 20;
/** Icon tile size on narrow phones (default comes from `sizes.iconTile`). */
export const COMPACT_TILE_SIZE = 48;
/** Room kept for the full date so it never truncates. */
const MEETING_DATE_MIN_WIDTH = 88;
/** Governorate card rings are slightly smaller than the initiatives rings. */
export const GOVERNORATE_RING_SIZE = 62;
export const RATING_BAR_HEIGHT = 8;
const RATING_VALUE_MIN_WIDTH = 34;
const DIVIDER_HEIGHT = 1.5;
const DIVIDER_WIDTH = '76%';
const NEWS_CARD_MIN_HEIGHT = 135;
const NEWS_DOT_SIZE = 8;
const LINK_MIN_HEIGHT = 32;

export function createStyles(theme: AppTheme) {
  const { colors, layout, spacing, typography, fontFamily, borderRadius } = theme;
  return StyleSheet.create({
    content: { paddingTop: layout.dashboardTop, width: '100%', maxWidth: layout.maxContentWidth, alignSelf: 'center' },
    section: { marginTop: layout.sectionGap },

    meetingCard: {
      minHeight: MEETING_CARD_MIN_HEIGHT,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm10,
      paddingStart: spacing.sm,
      paddingVertical: spacing.xs6,
    },
    meetingGap: { marginTop: spacing.section30 },
    // The label may wrap on narrow phones; the date block keeps room for a full date.
    meetingLabel: { ...typography.highlightLabel, flexShrink: 1 },
    meetingLabelCompact: { ...typography.highlightLabelCompact },
    // Wraps (weekday above date) only on narrow phones; one row at the 430pt reference width.
    meetingDate: { flex: 1, minWidth: MEETING_DATE_MIN_WIDTH, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', columnGap: spacing.sm10, flexWrap: 'wrap' },
    weekday: { ...typography.highlightWeekday },
    weekdayCompact: { ...typography.highlightWeekdayCompact },
    dateText: { ...typography.highlightDate },
    dateCompact: { ...typography.highlightDateCompact },

    ringsCard: { paddingVertical: spacing.xl },
    chartCard: { paddingTop: spacing.xl, paddingBottom: spacing.md },

    govCard: { padding: spacing.sm10, paddingBottom: spacing.lg },
    govInfo: { flexDirection: 'row', gap: spacing.md, paddingHorizontal: spacing.sm, marginTop: spacing.md },
    labeled: { flex: 1, gap: spacing.xxs },
    medium: { fontFamily: fontFamily.medium },
    divider: { height: DIVIDER_HEIGHT, width: DIVIDER_WIDTH, alignSelf: 'center', marginVertical: spacing.md, borderRadius: borderRadius.hairline },
    govCountTitle: { paddingHorizontal: spacing.sm, marginBottom: spacing.sm },
    rating: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.sm, marginTop: spacing.lg },
    ratingValue: { minWidth: RATING_VALUE_MIN_WIDTH, textAlign: 'center' },
    ratingBar: { flex: 1 },

    newsCard: { minHeight: NEWS_CARD_MIN_HEIGHT },
    newsRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: layout.cardPadding, paddingVertical: spacing.md },
    newsBorder: { borderTopWidth: theme.borderWidth.hairline, borderTopColor: colors.divider },
    newsDot: { width: NEWS_DOT_SIZE, height: NEWS_DOT_SIZE, borderRadius: borderRadius.pill, backgroundColor: colors.accent },
    newsDotRead: { backgroundColor: colors.border },
    newsText: { flex: 1, gap: spacing.xxs },
    newsMore: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-end', gap: spacing.xxs, paddingHorizontal: layout.cardPadding, paddingBottom: spacing.md, paddingTop: spacing.xs, minHeight: LINK_MIN_HEIGHT },
  });
}
