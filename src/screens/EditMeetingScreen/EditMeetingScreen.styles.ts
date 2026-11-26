import { StyleSheet } from 'react-native';
import type { AppTheme } from '@/types/theme.types';

/** The screen is either the shared `MeetingForm` (features/meetings) or a stock `EmptyState` — nothing of its own to style. */
export function createStyles(theme: AppTheme) {
  return StyleSheet.create({});
}
