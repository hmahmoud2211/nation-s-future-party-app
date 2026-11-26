import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { LucideIcon } from 'lucide-react-native';
import { colors, gradients, shadows, sizes } from '@/theme';

/**
 * Slate-indigo rounded tile holding a white outline icon (decorative — use IconButton when it
 * must be pressable on its own). Used inside the dashboard highlight cards.
 */
export function IconTile({ icon: Icon, size = sizes.iconTile, style }: { icon: LucideIcon; size?: number; style?: StyleProp<ViewStyle> }) {
  const r = Math.round(size * 0.27);
  // The gradient is rounded itself (no overflow clipping) so the drop shadow is never cut off on iOS.
  return (
    <View style={[styles.tile, { width: size, height: size, borderRadius: r }, style]} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
      <LinearGradient colors={gradients.slate} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }} style={[StyleSheet.absoluteFill, { borderRadius: r }]} />
      {/* Wrapped so the glyph stacks above the absolutely positioned gradient on web. */}
      <View>
        <Icon size={Math.round(size * 0.58)} color={colors.white} strokeWidth={1.5} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 1.5,
    borderTopColor: colors.secondaryLight,
    ...shadows.tile,
  },
});

export default IconTile;
