import React, { useEffect, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { borderRadius, borderWidth, colors, fontFamily, gradients, LTR_ROW, motion, spacing, typography } from '@/theme';
import { formatNumber } from '@/utils/format';
import { AppText } from '@/components/common/AppText';

export interface TrendDatum {
  key: string;
  label: string;
  value: number;
}

/**
 * Whole-number axis for counts: a 1-2-5 step that splits `max` into about `segments` parts, and a top
 * one step above the tallest bar so it never touches the top gridline (e.g. max 1 → 0·1·2, max 7 → 0…8 by 2).
 */
export function niceScale(max: number, segments = 4): { top: number; step: number } {
  const raw = Math.max(max, 1) / segments;
  const pow = 10 ** Math.floor(Math.log10(raw));
  const step = Math.max(1, Math.round([1, 2, 5, 10].map((m) => m * pow).find((s) => s >= raw) ?? 10 * pow));
  return { top: (Math.floor(max / step) + 1) * step, step };
}

/** Height of one axis label line; labels are centred on their gridline. */
const TICK_LABEL_HEIGHT = 14;
const AXIS_WIDTH = 22;
const LABEL_ROW = 24;
/** Placeholder pill drawn on the baseline for months with no value, so every month reads as present. */
const ZERO_STUB_HEIGHT = 4;

function Column({ value, ratio, width, emphasis }: { value: number; ratio: number; width: number; emphasis: boolean }) {
  const h = useSharedValue(0);
  useEffect(() => {
    h.value = withTiming(ratio * 100, { duration: motion.duration.slow, easing: Easing.out(Easing.cubic) });
  }, [ratio, h]);
  const style = useAnimatedStyle(() => ({ height: `${h.value}%` }));
  if (value <= 0) return <View style={[styles.zeroStub, { width }]} />;
  return (
    <>
      <AppText variant="micro" color={emphasis ? colors.text : colors.textSecondary} align="center" style={styles.value}>
        {formatNumber(value)}
      </AppText>
      <Animated.View style={[styles.column, { width, borderTopLeftRadius: width / 2.5, borderTopRightRadius: width / 2.5 }, style]}>
        <LinearGradient colors={gradients.chartBar} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }} style={StyleSheet.absoluteFill} />
      </Animated.View>
    </>
  );
}

/**
 * Vertical column chart with a value axis: soft gridlines at every tick, violet → sky gradient bars with
 * their value on top, a baseline stub for empty periods, and time flowing left → right.
 * `highlightLast` sets the most recent period (the last datum) in bold.
 */
export function TrendChart({
  data,
  height = 132,
  barWidth = 16,
  segments = 4,
  highlightLast = false,
  accessibilityLabel,
}: {
  data: TrendDatum[];
  height?: number;
  barWidth?: number;
  segments?: number;
  highlightLast?: boolean;
  accessibilityLabel?: string;
}) {
  const max = Math.max(0, ...data.map((d) => d.value));
  const { top, step } = useMemo(() => niceScale(max, segments), [max, segments]);
  const ticks = useMemo(() => Array.from({ length: Math.round(top / step) + 1 }, (_, i) => i * step), [top, step]);
  const summary = accessibilityLabel ?? data.map((d) => `${d.label}: ${formatNumber(d.value)}`).join('، ');
  const y = (t: number) => height - (t / top) * height;

  return (
    <View style={[LTR_ROW, styles.chart]} accessible accessibilityRole="image" accessibilityLabel={summary}>
      <View style={[styles.axis, { height }]}>
        {ticks.map((t) => (
          <AppText key={t} variant="micro" color={colors.textMuted} align="end" style={[styles.tick, { top: y(t) - TICK_LABEL_HEIGHT / 2 }]}>
            {formatNumber(t)}
          </AppText>
        ))}
      </View>
      <View style={styles.plot}>
        <View style={{ height }}>
          {ticks.map((t) => (
            <View key={t} style={[styles.grid, t === 0 && styles.baseline, { top: y(t) }]} />
          ))}
          <View style={[LTR_ROW, StyleSheet.absoluteFill]}>
            {data.map((d, i) => (
              <View key={d.key} style={styles.slot}>
                <Column value={d.value} ratio={top > 0 ? d.value / top : 0} width={barWidth} emphasis={highlightLast && i === data.length - 1} />
              </View>
            ))}
          </View>
        </View>
        <View style={[LTR_ROW, styles.labels]}>
          {data.map((d, i) => {
            const emphasis = highlightLast && i === data.length - 1;
            return (
              <AppText key={d.key} variant="micro" color={emphasis ? colors.text : colors.textSecondary} align="center" numberOfLines={1} style={[styles.label, emphasis && styles.labelEmphasis]}>
                {d.label}
              </AppText>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // `gap` is direction-agnostic (native RTL swaps left/right padding).
  chart: { gap: spacing.sm },
  axis: { width: AXIS_WIDTH },
  tick: { position: 'absolute', start: 0, end: 0, height: TICK_LABEL_HEIGHT, lineHeight: TICK_LABEL_HEIGHT },
  plot: { flex: 1 },
  grid: { position: 'absolute', start: 0, end: 0, height: borderWidth.hairline, backgroundColor: colors.divider },
  baseline: { backgroundColor: colors.border },
  slot: { flex: 1, alignItems: 'center', justifyContent: 'flex-end' },
  column: { overflow: 'hidden' },
  value: { marginBottom: spacing.xxs, fontFamily: fontFamily.semibold },
  zeroStub: { height: ZERO_STUB_HEIGHT, borderRadius: borderRadius.xxs, backgroundColor: colors.border },
  labels: { height: LABEL_ROW, alignItems: 'flex-end' },
  label: { flex: 1, ...typography.chartLabel },
  labelEmphasis: { fontFamily: fontFamily.semibold },
});
