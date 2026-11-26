import { StyleSheet } from 'react-native';
import type { AppTheme } from '@/types/theme.types';

/** Footer buttons share the row 2 : 1 (submit : cancel). */
const SUBMIT_FLEX = 2;
const CANCEL_FLEX = 1;

export function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    submitButton: { flex: SUBMIT_FLEX },
    cancelButton: { flex: CANCEL_FLEX },
  });
}
