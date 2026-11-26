import { StyleSheet } from 'react-native';
import type { AppTheme } from '@/types/theme.types';

/** Lock glyph in the permissions rule card. */
export const RULE_ICON_SIZE = 18;

export function createStyles(theme: AppTheme) {
  const { colors, spacing, borderRadius, borderWidth } = theme;
  return StyleSheet.create({
    content: { gap: spacing.xl },
    rule: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      padding: spacing.md,
      borderRadius: borderRadius.lg,
      backgroundColor: colors.tint,
      borderWidth: borderWidth.hairline,
      borderColor: colors.border,
    },
    ruleText: { flex: 1 },
    demoDataSection: { gap: spacing.sm },
  });
}
