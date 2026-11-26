import { StyleSheet } from 'react-native';
import type { AppTheme } from '@/types/theme.types';

/** Two participant tiles per row with a small gap between them. */
const TILE_WIDTH = '48.5%';
export const LIST_AVATAR_SIZE = 34;
export const TILE_AVATAR_SIZE = 56;
/** Muted-mic glyph next to a tile's name. */
export const TILE_MIC_ICON_SIZE = 12;
const CONTROL_WIDTH = 76;
const CONTROL_ICON_SIZE = 50;

export function createStyles(theme: AppTheme) {
  const { colors, spacing, borderRadius, borderWidth } = theme;
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.callBackground, paddingHorizontal: spacing.lg },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    fill: { flex: 1 },
    unavailableHint: { marginTop: spacing.sm },
    backButton: { marginTop: spacing.xl },
    top: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    simBadge: { backgroundColor: colors.accentLight, borderRadius: borderRadius.pill, paddingHorizontal: spacing.sm, paddingVertical: spacing.hairline },
    notice: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: spacing.xs6,
      marginTop: spacing.sm,
      padding: spacing.sm,
      borderRadius: borderRadius.sm,
      backgroundColor: colors.decorFill,
      borderWidth: borderWidth.hairline,
      borderColor: colors.decorRing,
    },
    connectingText: { marginTop: spacing.sm },
    listContent: { gap: spacing.sm, paddingVertical: spacing.md },
    grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: spacing.sm, paddingVertical: spacing.md },
    tile: {
      width: TILE_WIDTH,
      aspectRatio: 1,
      borderRadius: borderRadius.md,
      backgroundColor: colors.glassFaint,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    },
    tileLocal: { borderWidth: borderWidth.focus, borderColor: colors.accent },
    cameraOn: { alignItems: 'center', gap: spacing.xs },
    tileName: {
      position: 'absolute',
      bottom: spacing.sm,
      start: spacing.sm,
      end: spacing.sm,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    tileNameText: { flexShrink: 1 },
    listRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.sm, borderRadius: borderRadius.sm, backgroundColor: colors.glassFaint },
    controls: { flexDirection: 'row', justifyContent: 'space-around', paddingTop: spacing.md, borderTopWidth: borderWidth.hairline, borderTopColor: colors.glassBorderSoft },
    control: { alignItems: 'center', gap: spacing.xs, width: CONTROL_WIDTH },
    controlIcon: { width: CONTROL_ICON_SIZE, height: CONTROL_ICON_SIZE, borderRadius: CONTROL_ICON_SIZE / 2, backgroundColor: colors.glass, alignItems: 'center', justifyContent: 'center' },
    controlActive: { backgroundColor: colors.glassActive },
    controlDanger: { backgroundColor: colors.error },
  });
}
