import { StyleSheet } from 'react-native';
import type { AppTheme } from '@/types/theme.types';

export function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    submitButton: { flex: 2 },
    cancelButton: { flex: 1 },
  });
}
