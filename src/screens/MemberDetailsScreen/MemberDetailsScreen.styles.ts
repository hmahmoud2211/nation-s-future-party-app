import { StyleSheet } from 'react-native';
import type { AppTheme } from '@/types/theme.types';

/** Profile avatar in the header card. */
export const PROFILE_AVATAR_SIZE = 56;
/** Committee colour dot. */
const COMMITTEE_DOT_SIZE = 10;

export function createStyles(theme: AppTheme) {
  const { colors, spacing, borderRadius, borderWidth } = theme;
  return StyleSheet.create({
    profile: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
    profileText: { flex: 1, gap: spacing.xs },
    badges: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
    section: { marginTop: spacing.xl },
    list: { gap: spacing.sm },
    chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
    committee: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      padding: spacing.md,
      borderRadius: borderRadius.md,
      backgroundColor: colors.white,
      borderWidth: borderWidth.card,
      borderColor: colors.border,
    },
    committeeDot: { width: COMMITTEE_DOT_SIZE, height: COMMITTEE_DOT_SIZE, borderRadius: borderRadius.tiny5 },
    committeeName: { flex: 1 },
    infoCard: { paddingVertical: spacing.xs },
  });
}
