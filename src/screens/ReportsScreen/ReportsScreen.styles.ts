import { StyleSheet } from 'react-native';
import type { AppTheme } from '@/types/theme.types';

/** Two workload tiles per row with a small gap between them. */
const WORK_ITEM_WIDTH = '48.5%';
const WORK_DOT_SIZE = 8;

export function createStyles(theme: AppTheme) {
  const { colors, spacing, borderRadius, borderWidth } = theme;
  return StyleSheet.create({
    headerFilters: { gap: spacing.sm },
    body: { gap: spacing.xl },
    inlineStats: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: spacing.md,
      paddingTop: spacing.md,
      borderTopWidth: borderWidth.hairline,
      borderTopColor: colors.border,
    },
    workload: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: spacing.sm },
    workItem: {
      width: WORK_ITEM_WIDTH,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      backgroundColor: colors.background,
      borderRadius: borderRadius.md,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
    },
    // The dot colour is set per item at runtime.
    workDot: { width: WORK_DOT_SIZE, height: WORK_DOT_SIZE, borderRadius: borderRadius.tiny },
    workLabel: { flex: 1 },
    reportChips: { marginBottom: spacing.md },
    reportList: { gap: spacing.md },
    note: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start', padding: spacing.md, backgroundColor: colors.tint, borderRadius: borderRadius.md },
    noteText: { flex: 1 },
  });
}
