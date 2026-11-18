import React, { useEffect } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming, Easing } from 'react-native-reanimated';
import { colors, spacing } from '@/theme';
import { formatPercent } from '@/utils/format';
import { AppText } from './AppText';

export interface ProgressBarProps {
  value: number;
  color?: string;
  trackColor?: string;
  height?: number;
  showLabel?: boolean;
  label?: string;
  style?: StyleProp<ViewStyle>;
}

function autoColor(v: number) {
  if (v >= 100) return colors.success;
  if (v >= 60) return colors.navy2;
  if (v >= 30) return colors.gold;
  return colors.warning;
}

/** Animated progress bar; fills from the start (right) edge in RTL. */
export function ProgressBar({ value, color, trackColor = colors.navySoft, height = 8, showLabel, label, style }: ProgressBarProps) {
  const v = Math.max(0, Math.min(100, value));
  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = withTiming(v, { duration: 650, easing: Easing.out(Easing.cubic) });
  }, [v, progress]);
  const fill = useAnimatedStyle(() => ({ width: `${progress.value}%` }));

  return (
    <View style={style}>
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
        <Animated.View style={[styles.fill, { borderRadius: height / 2, backgroundColor: color ?? autoColor(v) }, fill]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  track: { overflow: 'hidden', width: '100%' },
  fill: { height: '100%', alignSelf: 'flex-start' },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xs },
});

export default ProgressBar;
