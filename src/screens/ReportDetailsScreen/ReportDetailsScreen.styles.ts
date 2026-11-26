import { StyleSheet } from 'react-native';
import type { AppTheme } from '@/types/theme.types';

/** Tinted icon well beside each section title. */
const SECTION_ICON_SIZE = 30;

export function createStyles(theme: AppTheme) {
  const { spacing, borderRadius } = theme;
  return StyleSheet.create({
    badges: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' },
    reviewButton: { flex: 1 },
    content: { gap: spacing.lg },
    infoCard: { paddingVertical: spacing.sm },
    reviewNote: { marginTop: spacing.xs },
    reviewer: { marginTop: spacing.sm },

    sectionHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    sectionIcon: { width: SECTION_ICON_SIZE, height: SECTION_ICON_SIZE, borderRadius: borderRadius.sm, alignItems: 'center', justifyContent: 'center' },
    sectionText: { marginTop: spacing.sm },
  });
}
