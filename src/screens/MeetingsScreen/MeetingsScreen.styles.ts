import { StyleSheet } from 'react-native';
import type { AppTheme } from '@/types/theme.types';

export function createStyles(theme: AppTheme) {
  const { spacing, layout } = theme;
  return StyleSheet.create({
    // The bottom padding (above the tab bar) is added at runtime.
    listContent: { padding: layout.gutter, gap: spacing.sm },
    listHeader: { gap: spacing.sm },
  });
}
