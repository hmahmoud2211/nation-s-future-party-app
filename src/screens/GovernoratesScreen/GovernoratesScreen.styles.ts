import { StyleSheet } from 'react-native';
import type { AppTheme } from '@/types/theme.types';

/** Governorate icon box in each row. */
const ROW_ICON_SIZE = 32;

export function createStyles(theme: AppTheme) {
  const { colors, spacing, borderRadius, borderWidth } = theme;
  return StyleSheet.create({
    section: { marginTop: spacing.lg },
    emptyCard: { marginTop: spacing.md },
    row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm10, paddingHorizontal: spacing.md, paddingVertical: spacing.sm10 },
    border: { borderBottomWidth: borderWidth.hairline, borderBottomColor: colors.border },
    icon: { width: ROW_ICON_SIZE, height: ROW_ICON_SIZE, borderRadius: borderRadius.sm, backgroundColor: colors.tint, alignItems: 'center', justifyContent: 'center' },
    rowText: { flex: 1 },
  });
}
