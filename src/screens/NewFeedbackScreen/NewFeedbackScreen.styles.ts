import { StyleSheet } from 'react-native';
import type { AppTheme } from '@/types/theme.types';

export function createStyles(theme: AppTheme) {
  const { spacing } = theme;
  return StyleSheet.create({
    related: { marginBottom: spacing.lg },
    submitButton: { flex: 2 },
    cancelButton: { flex: 1 },
  });
}
