import { StyleSheet } from 'react-native';
import type { AppTheme } from '@/types/theme.types';

/** Author avatar in the request card. */
export const AUTHOR_AVATAR_SIZE = 42;
/** Two handler action buttons per row. */
const ACTION_BASIS = '45%';

export function createStyles(theme: AppTheme) {
  const { spacing } = theme;
  return StyleSheet.create({
    badges: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' },
    content: { gap: spacing.lg },
    authorRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
    authorInfo: { flex: 1 },
    description: { marginTop: spacing.md },
    attachments: { gap: spacing.sm, marginTop: spacing.md },
    actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
    action: { flexGrow: 1, flexBasis: ACTION_BASIS },
  });
}
