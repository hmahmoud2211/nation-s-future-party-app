import { StyleSheet } from 'react-native';
import type { AppTheme } from '@/types/theme.types';

/** Progress step chips in the "update progress" sheet. */
const STEP_MIN_WIDTH = 52;
const STEP_HEIGHT = 36;
const REPORT_INPUT_MIN_HEIGHT = 150;

export function createStyles(theme: AppTheme) {
  const { colors, spacing, borderRadius, borderWidth } = theme;
  return StyleSheet.create({
    headRow: { flexDirection: 'row', gap: spacing.xs, flexWrap: 'wrap' },
    fill: { flex: 1 },
    reportButton: { flex: 1.2 },
    actions: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
    block: { marginBottom: spacing.xl },
    aboutTitle: { marginBottom: spacing.xs },
    infoRows: { marginTop: spacing.md },
    occupancyBar: { marginTop: spacing.sm },
    imagesList: { gap: spacing.sm },
    names: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginTop: spacing.md },
    selfReg: { alignSelf: 'flex-start', marginTop: spacing.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: borderRadius.pill, backgroundColor: colors.primarySoft },
    draftBar: { marginBottom: spacing.md },
    steps: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs6 },
    step: {
      minWidth: STEP_MIN_WIDTH,
      height: STEP_HEIGHT,
      paddingHorizontal: spacing.sm,
      borderRadius: borderRadius.pill,
      borderWidth: borderWidth.hairline,
      borderColor: colors.border,
      backgroundColor: colors.frostStrong,
      alignItems: 'center',
      justifyContent: 'center',
    },
    stepOn: { backgroundColor: colors.primary, borderColor: colors.primary },
    reportInput: { minHeight: REPORT_INPUT_MIN_HEIGHT },
  });
}
