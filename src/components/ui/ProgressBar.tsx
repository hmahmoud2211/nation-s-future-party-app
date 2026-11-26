import React, { useEffect } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { colors, motion, spacing } from '@/theme';
import { formatPercent } from '@/utils/format';
import { AppText } from '@/components/common/AppText';

export interface ProgressBarProps {
  value: number;
  color?: string;
  /** Gradient fill (start → leading edge of the fill). Overrides `color`. */
  gradient?: readonly [string, string, ...string[]];
  trackColor?: string;
  height?: number;
  showLabel?: boolean;
  label?: string;
  /** Edge the fill grows from: `start` (right in RTL, default) or `end` (left in RTL, as in the dashboard rating bar). */
  fillFrom?: 'start' | 'end';
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

function autoColor(v: number) {
  if (v >= 100) return colors.success;
  if (v >= 60) return colors.primary;
  if (v >= 30) return colors.accent;
  return colors.warning;
}

/** Animated progress bar. */
export function ProgressBar({ value, color, gradient, trackColor = colors.primarySoft, height = 8, showLabel, label, fillFrom = 'start', style, accessibilityLabel }: ProgressBarProps) {
  const v = Math.max(0, Math.min(100, value));
  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = withTiming(v, { duration: motion.duration.progress, easing: Easing.out(Easing.cubic) });
  }, [v, progress]);
  const fill = useAnimatedStyle(() => ({ width: `${progress.value}%` }));
  // Gradients are laid out physically: in the RTL root a start-anchored fill grows leftwards.
  const gradientStart = fillFrom === 'end' ? { x: 0, y: 0.5 } : { x: 1, y: 0.5 };
  const gradientEnd = fillFrom === 'end' ? { x: 1, y: 0.5 } : { x: 0, y: 0.5 };

  return (
    <View
      style={style}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(v) }}
    >
      {showLabel ? (
        <View style={styles.labelRow}>
          <AppText variant="meta" color={colors.textSecondary}>
            {label ?? 'نسبة الإنجاز'}
          </AppText>
          <AppText variant="meta" color={colors.text}>
            {formatPercent(v)}
          </AppText>
        </View>
      ) : null}
      <View style={[styles.track, { height, borderRadius: height / 2, backgroundColor: trackColor }]}>
        <Animated.View
          style={[
            styles.fill,
            fillFrom === 'end' ? styles.fromEnd : styles.fromStart,
            { borderRadius: height / 2, backgroundColor: gradient ? undefined : (color ?? autoColor(v)) },
            fill,
          ]}
        >
          {gradient ? <LinearGradient colors={gradient} start={gradientStart} end={gradientEnd} style={StyleSheet.absoluteFill} /> : null}
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  track: { overflow: 'hidden', width: '100%' },
  fill: { height: '100%', overflow: 'hidden' },
  fromStart: { alignSelf: 'flex-start' },
  fromEnd: { alignSelf: 'flex-end' },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xs },
});

export default ProgressBar;
