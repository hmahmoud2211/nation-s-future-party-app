import { StyleSheet } from 'react-native';
import type { AppTheme } from '@/types/theme.types';

/** Measured from the Figma design (430pt reference). */
export const MEETING_CARD_MIN_HEIGHT = 76;
/** Navy bar on the end edge of the meeting cards. */
export const MEETING_ACCENT_WIDTH = 20;
/** Icon tile size on narrow phones (default comes from `sizes.iconTile`). */
export const COMPACT_TILE_SIZE = 48;
/** Small separator dot between date and time. */
const META_DOT_SIZE = 3;
/** Governorate card rings are slightly smaller than the initiatives rings. */
export const GOVERNORATE_RING_SIZE = 62;
export const RATING_BAR_HEIGHT = 8;
/** Initials avatar of the governorate secretary. */
export const CONTACT_AVATAR_SIZE = 44;
const DIVIDER_HEIGHT = 1.5;
const DIVIDER_WIDTH = '76%';
const NEWS_CARD_MIN_HEIGHT = 135;
const NEWS_DOT_SIZE = 8;
const LINK_MIN_HEIGHT = 32;

export function createStyles(theme: AppTheme) {
  const { colors, layout, spacing, fontFamily, borderRadius } = theme;
  return StyleSheet.create({
    content: { paddingTop: layout.dashboardTop, width: '100%', maxWidth: layout.maxContentWidth, alignSelf: 'center' },
    section: { marginTop: layout.sectionGap },

    meetingCard: {
      minHeight: MEETING_CARD_MIN_HEIGHT,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      paddingStart: spacing.sm10,
      paddingVertical: spacing.sm10,
    },
    meetingGap: { marginTop: spacing.section30 },
    // Label · title · day/date/time stacked; the title and date truncate before the status chip does.
    meetingBody: { flex: 1, gap: spacing.xxs },
    meetingMeta: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
    meetingMetaText: { flexShrink: 1 },
    meetingMetaDot: { width: META_DOT_SIZE, height: META_DOT_SIZE, borderRadius: borderRadius.pill, backgroundColor: colors.textMuted, marginHorizontal: spacing.xxs },
    meetingStatus: { alignSelf: 'center' },

    ringsCard: { paddingVertical: spacing.xl },
    chartCard: { paddingTop: spacing.lg, paddingBottom: spacing.md },
    // Period total and its caption above the chart.
    chartHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.lg, paddingHorizontal: spacing.xs },
    chartCaption: { flex: 1 },

    govCard: { padding: spacing.sm10, paddingBottom: spacing.lg },
    // Secretary: avatar · role over name · phone pill (the name truncates first).
    contact: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.sm, marginTop: spacing.lg },
    contactAvatarEmpty: {
      width: CONTACT_AVATAR_SIZE,
      height: CONTACT_AVATAR_SIZE,
      borderRadius: borderRadius.pill,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.neutralSoft,
    },
    contactText: { flex: 1 },
    medium: { fontFamily: fontFamily.medium },
    divider: { height: DIVIDER_HEIGHT, width: DIVIDER_WIDTH, alignSelf: 'center', marginVertical: spacing.md, borderRadius: borderRadius.hairline },
    govCountHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm, paddingHorizontal: spacing.sm, marginBottom: spacing.md },
    // Rating on a soft panel: label and percentage on one line, the bar full width beneath.
    rating: { gap: spacing.sm, marginTop: spacing.xl, padding: spacing.md, borderRadius: borderRadius.md, backgroundColor: colors.tint },
    ratingHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },

    newsCard: { minHeight: NEWS_CARD_MIN_HEIGHT },
    newsRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: layout.cardPadding, paddingVertical: spacing.md },
    newsBorder: { borderTopWidth: theme.borderWidth.hairline, borderTopColor: colors.divider },
    newsDot: { width: NEWS_DOT_SIZE, height: NEWS_DOT_SIZE, borderRadius: borderRadius.pill, backgroundColor: colors.accent },
    newsDotRead: { backgroundColor: colors.border },
    newsText: { flex: 1, gap: spacing.xxs },
    newsMore: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-end', gap: spacing.xxs, paddingHorizontal: layout.cardPadding, paddingBottom: spacing.md, paddingTop: spacing.xs, minHeight: LINK_MIN_HEIGHT },
  });
}
