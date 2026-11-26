import { StyleSheet } from 'react-native';
import type { AppTheme } from '@/types/theme.types';

export function createStyles(theme: AppTheme) {
  const { spacing, layout } = theme;
  return StyleSheet.create({
    listContent: { padding: layout.gutter, gap: spacing.sm10, paddingBottom: spacing.xxxl },
    listHeader: { gap: spacing.md, marginBottom: spacing.xs },
  });
}
