import { StyleSheet } from 'react-native';
import type { AppTheme } from '@/types/theme.types';

/** Spend progress bar under each project. */
export const SPEND_BAR_HEIGHT = 6;

export function createStyles(theme: AppTheme) {
  const { spacing } = theme;
  return StyleSheet.create({
    section: { marginTop: spacing.xl },
    stats: { marginTop: spacing.md },
    rows: { gap: spacing.sm },
    rowTop: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
    rowTitle: { flex: 1 },
    figures: { flexDirection: 'row', gap: spacing.sm, marginVertical: spacing.sm },
    figure: { flex: 1 },
    rowMeta: { marginTop: spacing.xs },
  });
}
