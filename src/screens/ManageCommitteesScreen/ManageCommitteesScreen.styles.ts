import { StyleSheet } from 'react-native';
import type { AppTheme } from '@/types/theme.types';

/** Committee badge in each admin row. */
export const ROW_ICON_SIZE = 42;
/** Committee badge in the new-committee preview. */
export const PREVIEW_ICON_SIZE = 44;
/** Disabled committees are dimmed. */
const DISABLED_ROW_OPACITY = 0.75;
const SWATCH_SIZE = 36;
const SWATCH_BORDER_WIDTH = 3;

export function createStyles(theme: AppTheme) {
  const { colors, spacing, borderRadius, borderWidth } = theme;
  return StyleSheet.create({
    content: { gap: spacing.md },

    rowDisabled: { opacity: DISABLED_ROW_OPACITY },
    head: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.xs },
    headText: { flex: 1 },
    officialsField: { marginBottom: 0 },

    colors: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
    swatch: { width: SWATCH_SIZE, height: SWATCH_SIZE, borderRadius: borderRadius.lg, borderWidth: SWATCH_BORDER_WIDTH, borderColor: colors.white },
    swatchOn: { borderColor: colors.accent },
    preview: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      padding: spacing.md,
      backgroundColor: colors.white,
      borderRadius: borderRadius.md,
      borderWidth: borderWidth.hairline,
      borderColor: colors.border,
    },
    previewName: { flex: 1 },
  });
}
