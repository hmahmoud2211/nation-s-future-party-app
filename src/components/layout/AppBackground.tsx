import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, gradients } from '@/theme';

/**
 * The page backdrop from the design: white → lavender diagonal wash with a soft cyan glow
 * rising from the bottom-left corner. Rendered behind screen content (absolute fill, no touches).
 */
export const AppBackground = React.memo(function AppBackground() {
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.base]}>
      <LinearGradient colors={gradients.page} locations={[0, 0.45, 1]} start={{ x: 0, y: 0.15 }} end={{ x: 1, y: 0.55 }} style={StyleSheet.absoluteFill} />
      <LinearGradient colors={gradients.pageGlow} start={{ x: 0.75, y: 0.5 }} end={{ x: 0, y: 1 }} style={StyleSheet.absoluteFill} />
    </View>
  );
});

const styles = StyleSheet.create({
  base: { backgroundColor: colors.background },
});

export default AppBackground;
