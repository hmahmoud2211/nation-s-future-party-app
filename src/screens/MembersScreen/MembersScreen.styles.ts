import { StyleSheet } from 'react-native';
import type { AppTheme } from '@/types/theme.types';

export function createStyles(theme: AppTheme) {
  const { spacing, layout } = theme;
  return StyleSheet.create({
    list: { paddingHorizontal: layout.gutter, paddingTop: spacing.lg, paddingBottom: spacing.xxxl, gap: spacing.md },
    listHeader: { gap: spacing.md },
  });
}
