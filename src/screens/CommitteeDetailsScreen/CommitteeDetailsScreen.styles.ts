import { StyleSheet } from 'react-native';
import type { AppTheme } from '@/types/theme.types';

/** Committee icon inside the header card. */
export const COMMITTEE_ICON_SIZE = 46;

export function createStyles(theme: AppTheme) {
  const { colors, spacing, borderRadius, borderWidth } = theme;
  return StyleSheet.create({
    headCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      backgroundColor: colors.glassFaint,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      borderWidth: borderWidth.card,
      borderColor: colors.glassBorderSoft,
    },
    iconBg: { backgroundColor: colors.white, borderRadius: borderRadius.md, padding: spacing.xxs3 },
    headInfo: { flex: 1, gap: spacing.xxs },
    manageSection: { marginBottom: spacing.xl },
    tabs: { marginBottom: spacing.lg },
    overview: { gap: spacing.xl },
    aboutTitle: { marginBottom: spacing.xs },
    list: { gap: spacing.sm },
    tabContent: { gap: spacing.md },
    row: { flexDirection: 'row', gap: spacing.sm },
    rowButton: { flex: 1 },
  });
}
