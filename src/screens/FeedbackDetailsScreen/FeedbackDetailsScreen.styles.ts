import { StyleSheet } from 'react-native';
import type { AppTheme } from '@/types/theme.types';

/** Chevron on the collapsible activity-log header. */
export const LOG_CHEVRON_SIZE = 18;
/** Two follow-up action buttons per row. */
const ACTION_BASIS = '45%';

export function createStyles(theme: AppTheme) {
  const { spacing, borderRadius } = theme;
  return StyleSheet.create({
    headerBadges: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' },
    content: { gap: spacing.lg },
    metaCard: { padding: spacing.md },
    metaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.xs },
    actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
    action: { flexGrow: 1, flexBasis: ACTION_BASIS },
    logCard: { padding: 0 },
    logHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.lg, borderRadius: borderRadius.lg },
    logRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    logBody: { paddingHorizontal: spacing.lg, paddingBottom: spacing.lg },
  });
}
