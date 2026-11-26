import { StyleSheet } from 'react-native';
import type { AppTheme } from '@/types/theme.types';

export function createStyles(theme: AppTheme) {
  const { spacing } = theme;
  return StyleSheet.create({
    content: { gap: spacing.xl },
    reportList: { gap: spacing.md },
  });
}
