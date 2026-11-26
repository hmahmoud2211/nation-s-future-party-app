import { StyleSheet } from 'react-native';
import type { AppTheme } from '@/types/theme.types';

/** Progress bar inside the header card. */
export const HEAD_PROGRESS_HEIGHT = 8;
/** The "close as completed" button is slightly wider than the other actions. */
const CLOSE_ACTION_FLEX = 1.2;
export const LEAD_AVATAR_SIZE = 26;
export const COMMENT_AVATAR_SIZE = 30;
export const REPLY_AVATAR_SIZE = 26;
export const REPLY_ICON_SIZE = 13;
export const CHECK_STROKE_WIDTH = 3;
const CHECK_SIZE = 24;
const STEP_MIN_WIDTH = 52;
const STEP_HEIGHT = 36;
export const FINANCE_BAR_HEIGHT = 6;

export function createStyles(theme: AppTheme) {
  const { colors, spacing, borderRadius, borderWidth } = theme;
  return StyleSheet.create({
    headCard: {
      gap: spacing.sm,
      backgroundColor: colors.glassFaint,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      borderWidth: borderWidth.hairline,
      borderColor: colors.glassBorderSoft,
    },
    headRow: { flexDirection: 'row', alignItems: 'center' },
    headSpacer: { flex: 1 },
    actions: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
    actionButton: { flex: 1 },
    closeButton: { flex: CLOSE_ACTION_FLEX },
    block: { marginBottom: spacing.xl },

    // Info card
    descriptionTitle: { marginBottom: spacing.xs },
    infoRows: { marginTop: spacing.md },
    inline: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    teamWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginTop: spacing.sm },

    // Milestones
    msRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md },
    msBorder: { borderBottomWidth: borderWidth.hairline, borderBottomColor: colors.border },
    check: {
      width: CHECK_SIZE,
      height: CHECK_SIZE,
      borderRadius: borderRadius.sm12,
      borderWidth: borderWidth.strong,
      borderColor: colors.borderStrong,
      alignItems: 'center',
      justifyContent: 'center',
    },
    checkOn: { backgroundColor: colors.success, borderColor: colors.success },
    msBody: { flex: 1 },
    strike: { textDecorationLine: 'line-through' },
    msHint: { marginTop: spacing.xs },

    // Comments
    threads: { gap: spacing.md },
    thread: { gap: spacing.sm },
    reply: { marginStart: spacing.xxl, borderStartWidth: borderWidth.strong, borderStartColor: colors.accentLight, paddingStart: spacing.sm },
    composer: { marginTop: spacing.md },
    replyChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      backgroundColor: colors.primarySoft,
      borderRadius: borderRadius.md,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs6,
      marginBottom: spacing.sm,
    },
    replyChipText: { flex: 1 },
    bubble: { backgroundColor: colors.white, borderRadius: borderRadius.lg, borderWidth: borderWidth.hairline, borderColor: colors.border, padding: spacing.md },
    bubbleMine: { backgroundColor: colors.tint, borderColor: colors.border },
    bubbleHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    bubbleAuthor: { flex: 1 },
    replyBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xxs3,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xxs,
      borderRadius: borderRadius.pill,
      backgroundColor: colors.accentSoft,
    },
    bubbleBody: { marginTop: spacing.xs },

    // Progress sheet
    draftBar: { marginBottom: spacing.md },
    steps: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs6 },
    step: {
      minWidth: STEP_MIN_WIDTH,
      height: STEP_HEIGHT,
      paddingHorizontal: spacing.sm,
      borderRadius: borderRadius.pill,
      borderWidth: borderWidth.hairline,
      borderColor: colors.border,
      backgroundColor: colors.white,
      alignItems: 'center',
      justifyContent: 'center',
    },
    stepOn: { backgroundColor: colors.primary, borderColor: colors.primary },

    // Finance
    financeRow: { flexDirection: 'row', gap: spacing.sm },
    financeCell: { flex: 1 },
    financeBar: { marginTop: spacing.sm },
    financeNote: { marginTop: spacing.xs },
    expenses: { marginTop: spacing.sm },
  });
}
