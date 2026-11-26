import { StyleSheet } from 'react-native';
import type { AppTheme } from '@/types/theme.types';

/** Author avatar in the announcement card. */
export const AUTHOR_AVATAR_SIZE = 42;

export function createStyles(theme: AppTheme) {
  const { spacing } = theme;
  return StyleSheet.create({
    badges: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' },
    content: { gap: spacing.lg },
    authorRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
    authorInfo: { flex: 1 },
    body: { marginTop: spacing.lg },
    attachments: { gap: spacing.sm, marginTop: spacing.md },
    infoCard: { paddingVertical: spacing.sm },
  });
}
