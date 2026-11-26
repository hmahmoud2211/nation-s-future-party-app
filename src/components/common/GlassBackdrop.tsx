import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { GlassView, isGlassEffectAPIAvailable, isLiquidGlassAvailable } from 'expo-glass-effect';
import { LinearGradient } from 'expo-linear-gradient';
import { useReduceTransparency } from '@/hooks/useReduceTransparency';
import { glassMaterials, SHEEN_DEPTH, type GlassMaterial } from '@/theme';

/** Apple's native Liquid Glass: iOS 26+ only (the API check guards early iOS 26 betas that crash without it). */
export const LIQUID_GLASS = Platform.OS === 'ios' && isLiquidGlassAvailable() && isGlassEffectAPIAvailable();
/** Live blur on iOS and web; Android draws a near-opaque pane instead (no blur target needed, no per-frame cost). */
const LIVE_BLUR = Platform.OS === 'ios' || Platform.OS === 'web';

export interface GlassBackdropProps {
  material?: GlassMaterial;
  /** Use Apple's Liquid Glass where available (floating controls: tab bar, header buttons). */
  liquid?: boolean;
  /** Liquid Glass reacts to touch (buttons). */
  interactive?: boolean;
  /** Corner radius — needed by Liquid Glass, which draws its own shape. */
  radius?: number;
}

/**
 * The glass layer of a floating surface: put it first inside a container with `overflow: 'hidden'` and a
 * border radius, and the container's content draws on top. Renders, in order of preference:
 * Liquid Glass (iOS 26, `liquid`) → live blur + tint + top sheen (iOS / web) → a near-opaque tinted pane
 * (Android, or when Reduce Transparency is on).
 */
export function GlassBackdrop({ material = 'chrome', liquid = false, interactive = false, radius = 0 }: GlassBackdropProps) {
  const reduceTransparency = useReduceTransparency();
  const m = glassMaterials[material];

  if (reduceTransparency) {
    return <View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: m.fillOpaque }]} />;
  }
  if (liquid && LIQUID_GLASS) {
    return (
      <GlassView
        pointerEvents="none"
        glassEffectStyle="regular"
        colorScheme={m.tint}
        isInteractive={interactive}
        style={[StyleSheet.absoluteFill, { borderRadius: radius }]}
      />
    );
  }
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {LIVE_BLUR ? <BlurView intensity={m.blur} tint={m.tint} style={StyleSheet.absoluteFill} /> : null}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: LIVE_BLUR ? m.fill : m.fillOpaque }]} />
      <LinearGradient colors={m.sheen} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }} style={[styles.sheen, { height: SHEEN_DEPTH }]} />
    </View>
  );
}

/**
 * Liquid Glass for a small control (e.g. a header button): renders Apple's interactive glass when available and
 * returns `false` otherwise, so the control can keep its own translucent fill.
 */
export function useLiquidGlass(): boolean {
  const reduceTransparency = useReduceTransparency();
  return LIQUID_GLASS && !reduceTransparency;
}

export function LiquidGlassFill({ radius, dark = false, interactive = true }: { radius: number; dark?: boolean; interactive?: boolean }) {
  return (
    <GlassView
      pointerEvents="none"
      glassEffectStyle="regular"
      colorScheme={dark ? 'dark' : 'light'}
      isInteractive={interactive}
      style={[StyleSheet.absoluteFill, { borderRadius: radius }]}
    />
  );
}

/** Soft top highlight for frosted panes that don't need a live blur (cards). */
export function GlassSheen({ dark = false }: { dark?: boolean }) {
  const colors = glassMaterials[dark ? 'dark' : 'chrome'].sheen;
  return <LinearGradient pointerEvents="none" colors={colors} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }} style={[styles.sheen, { height: SHEEN_DEPTH }]} />;
}

const styles = StyleSheet.create({
  sheen: { position: 'absolute', top: 0, left: 0, right: 0 },
});

export default GlassBackdrop;
