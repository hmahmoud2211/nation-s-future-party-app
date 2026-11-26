import { StyleSheet } from 'react-native';
import type { AppTheme } from '@/types/theme.types';

export function createStyles(theme: AppTheme) {
  const { colors, spacing, borderRadius, borderWidth } = theme;
  return StyleSheet.create({
    titleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, marginBottom: spacing.md },
    title: { flex: 1 },
    infoCard: { paddingVertical: spacing.xs },
    section: { marginTop: spacing.lg },
    note: {
      marginTop: spacing.md,
      padding: spacing.md,
      borderRadius: borderRadius.md,
      backgroundColor: colors.tint,
      borderWidth: borderWidth.hairline,
      borderColor: colors.border,
      gap: spacing.xxs,
    },
    noteError: { backgroundColor: colors.errorSoft, borderColor: colors.errorBorder },
    attachments: { gap: spacing.sm },
    actionButton: { flex: 1 },
  });
}
