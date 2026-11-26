import React, { useEffect, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { colors, gradients, LTR_ROW, motion, spacing, typography } from '@/theme';
import { formatNumber } from '@/utils/format';
import { AppText } from '@/components/common/AppText';

export interface TrendDatum {
  key: string;
  label: string;
  value: number;
}

/** Rounded axis maximum and tick step for `max` split into `segments` (1-2-5 steps). */
export function niceScale(max: number, segments = 4): { top: number; step: number } {
  const raw = Math.max(max, 1) / segments;
  const pow = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * pow).find((s) => s >= raw) ?? 10 * pow;
  const safeStep = Math.max(1, Math.round(step));
  return { top: safeStep * segments, step: safeStep };
}

function Column({ ratio, width }: { ratio: number; width: number }) {
  const h = useSharedValue(0);
  useEffect(() => {
    h.value = withTiming(ratio * 100, { duration: motion.duration.slow, easing: Easing.out(Easing.cubic) });
  }, [ratio, h]);
  const style = useAnimatedStyle(() => ({ height: `${h.value}%` }));
  if (ratio <= 0) return null;
  return (
    <Animated.View style={[styles.column, { width, borderTopLeftRadius: width / 3, borderTopRightRadius: width / 3 }, style]}>
      <LinearGradient colors={gradients.chartBar} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }} style={StyleSheet.absoluteFill} />
    </Animated.View>
  );
}

/**
 * Vertical column chart with a value axis, matching the dashboard design: violet → sky gradient
 * bars, axis on the left and time flowing left → right.
 */
export function TrendChart({ data, height = 104, barWidth = 10, segments = 4, accessibilityLabel }: { data: TrendDatum[]; height?: number; barWidth?: number; segments?: number; accessibilityLabel?: string }) {
  const max = Math.max(0, ...data.map((d) => d.value));
  const { top, step } = useMemo(() => niceScale(max, segments), [max, segments]);
  const ticks = useMemo(() => Array.from({ length: segments + 1 }, (_, i) => top - i * step), [top, step, segments]);
  const summary = accessibilityLabel ?? data.map((d) => `${d.label}: ${formatNumber(d.value)}`).join('، ');

  return (
    <View style={[LTR_ROW, styles.chart]} accessible accessibilityRole="image" accessibilityLabel={summary}>
      <View style={[styles.axis, { height: height + LABEL_ROW }]}>
        {ticks.map((t) => (
          <AppText key={t} variant="micro" color={colors.textSecondary} align="end">
            {formatNumber(t)}
          </AppText>
        ))}
      </View>
      <View style={styles.plot}>
        <View style={[LTR_ROW, { height }]}>
          {data.map((d) => (
            <View key={d.key} style={styles.slot}>
              <Column ratio={top > 0 ? d.value / top : 0} width={barWidth} />
            </View>
          ))}
        </View>
        <View style={[LTR_ROW, styles.labels]}>
          {data.map((d) => (
            <AppText key={d.key} variant="micro" color={colors.text} align="center" numberOfLines={1} style={styles.label}>
              {d.label}
            </AppText>
          ))}
        </View>
      </View>
    </View>
  );
}

const LABEL_ROW = 22;

const styles = StyleSheet.create({
  // `gap` is direction-agnostic (native RTL swaps left/right padding).
  chart: { gap: spacing.sm },
  axis: { justifyContent: 'space-between', minWidth: 22 },
  plot: { flex: 1 },
  slot: { flex: 1, alignItems: 'center', justifyContent: 'flex-end' },
  column: { overflow: 'hidden', minHeight: 3 },
  labels: { height: LABEL_ROW, alignItems: 'center' },
  label: { flex: 1, ...typography.chartLabel },
});
