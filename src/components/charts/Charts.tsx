import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { colors, radius, spacing } from '@/theme';
import { formatNumber, formatPercent } from '@/utils/format';
import { AppText } from '../ui/AppText';

export interface ChartDatum {
  label: string;
  value: number;
  color?: string;
}

export const CHART_COLORS = [colors.navy2, colors.gold, colors.success, colors.info, colors.purple, colors.warning, '#9E3D5A', '#2A7F9E'];

function AnimatedBar({ pct, color, height }: { pct: number; color: string; height: number }) {
  const w = useSharedValue(0);
  useEffect(() => {
    w.value = withTiming(pct, { duration: 700, easing: Easing.out(Easing.cubic) });
  }, [pct, w]);
  const style = useAnimatedStyle(() => ({ width: `${w.value}%` }));
  return <Animated.View style={[{ height, borderRadius: height / 2, backgroundColor: color, alignSelf: 'flex-start' }, style]} />;
}

/** Horizontal bar chart (bars grow from the start/right edge). */
export function BarChart({ data, valueFormatter = formatNumber, barHeight = 10 }: { data: ChartDatum[]; valueFormatter?: (v: number) => string; barHeight?: number }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  if (data.length === 0) {
    return (
      <AppText variant="caption" color={colors.textSecondary} align="center">
        لا توجد بيانات
      </AppText>
    );
  }
  return (
    <View style={{ gap: spacing.md }}>
      {data.map((d, i) => (
        <View key={`${d.label}-${i}`} style={{ gap: 4 }}>
          <View style={styles.barLabelRow}>
            <AppText variant="captionMedium" numberOfLines={1} style={{ flex: 1 }}>
              {d.label}
            </AppText>
            <AppText variant="captionMedium" color={colors.navy2}>
              {valueFormatter(d.value)}
            </AppText>
          </View>
          <View style={[styles.track, { height: barHeight, borderRadius: barHeight / 2 }]}>
            <AnimatedBar pct={(d.value / max) * 100} color={d.color ?? CHART_COLORS[i % CHART_COLORS.length]} height={barHeight} />
          </View>
        </View>
      ))}
    </View>
  );
}

function AnimatedColumn({ pct, color }: { pct: number; color: string }) {
  const h = useSharedValue(0);
  useEffect(() => {
    h.value = withTiming(pct, { duration: 700, easing: Easing.out(Easing.cubic) });
  }, [pct, h]);
  const style = useAnimatedStyle(() => ({ height: `${h.value}%` }));
  return <Animated.View style={[styles.column, { backgroundColor: color }, style]} />;
}

/** Vertical column chart. */
export function ColumnChart({ data, height = 150 }: { data: ChartDatum[]; height?: number }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <View>
      <View style={[styles.columns, { height }]}>
        {data.map((d, i) => (
          <View key={`${d.label}-${i}`} style={styles.colWrap}>
            <AppText variant="meta" color={colors.navy2} align="center">
              {formatNumber(d.value)}
            </AppText>
            <View style={styles.colTrack}>
              <AnimatedColumn pct={Math.max(4, (d.value / max) * 100)} color={d.color ?? CHART_COLORS[i % CHART_COLORS.length]} />
            </View>
          </View>
        ))}
      </View>
      <View style={styles.colLabels}>
        {data.map((d, i) => (
          <AppText key={`${d.label}-l${i}`} variant="meta" color={colors.textSecondary} align="center" numberOfLines={2} style={{ flex: 1 }}>
            {d.label}
          </AppText>
        ))}
      </View>
    </View>
  );
}

/** Donut chart with legend (react-native-svg). */
export function DonutChart({ data, size = 140, thickness = 18, centerLabel, centerValue }: { data: ChartDatum[]; size?: number; thickness?: number; centerLabel?: string; centerValue?: string }) {
  const total = data.reduce((acc, d) => acc + d.value, 0);
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  let offset = 0;
  return (
    <View style={styles.donutRow}>
      <View style={{ width: size, height: size }}>
        {/* Rotate the whole SVG so segments start at 12 o'clock (avoids transform-origin warnings on web). */}
        <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
            <Circle cx={size / 2} cy={size / 2} r={r} stroke={colors.navySoft} strokeWidth={thickness} fill="none" />
            {total > 0 &&
              data.map((d, i) => {
                const len = (d.value / total) * c;
                const el = (
                  <Circle
                    key={`${d.label}-${i}`}
                    cx={size / 2}
                    cy={size / 2}
                    r={r}
                    stroke={d.color ?? CHART_COLORS[i % CHART_COLORS.length]}
                    strokeWidth={thickness}
                    strokeDasharray={`${Math.max(0, len - 2)} ${c}`}
                    strokeDashoffset={-offset}
                    fill="none"
                  />
                );
                offset += len;
                return el;
              })}
        </Svg>
        <View style={[StyleSheet.absoluteFill, styles.donutCenter]}>
          <AppText variant="stat" align="center">
            {centerValue ?? formatNumber(total)}
          </AppText>
          {centerLabel ? (
            <AppText variant="meta" color={colors.textSecondary} align="center">
              {centerLabel}
            </AppText>
          ) : null}
        </View>
      </View>
      <View style={styles.legend}>
        {data.map((d, i) => (
          <View key={`${d.label}-lg${i}`} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: d.color ?? CHART_COLORS[i % CHART_COLORS.length] }]} />
            <AppText variant="caption" style={{ flex: 1 }} numberOfLines={1}>
              {d.label}
            </AppText>
            <AppText variant="captionMedium" color={colors.navy2}>
              {total ? `${formatNumber(d.value)} (${formatPercent((d.value / total) * 100)})` : formatNumber(d.value)}
            </AppText>
          </View>
        ))}
      </View>
    </View>
  );
}

/** Single stacked bar with legend — good for status distributions. */
export function StackedBar({ data, height = 14 }: { data: ChartDatum[]; height?: number }) {
  const total = data.reduce((acc, d) => acc + d.value, 0);
  return (
    <View style={{ gap: spacing.md }}>
      <View style={[styles.stacked, { height, borderRadius: height / 2 }]}>
        {total > 0 &&
          data
            .filter((d) => d.value > 0)
            .map((d, i) => <View key={`${d.label}-${i}`} style={{ flex: d.value, backgroundColor: d.color ?? CHART_COLORS[i % CHART_COLORS.length] }} />)}
      </View>
      <View style={styles.stackLegend}>
        {data.map((d, i) => (
          <View key={`${d.label}-s${i}`} style={styles.stackLegendItem}>
            <View style={[styles.legendDot, { backgroundColor: d.color ?? CHART_COLORS[i % CHART_COLORS.length] }]} />
            <AppText variant="meta" color={colors.textSecondary}>
              {`${d.label}: ${formatNumber(d.value)}`}
            </AppText>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  barLabelRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  track: { backgroundColor: colors.navySoft, overflow: 'hidden' },
  columns: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm },
  colWrap: { flex: 1, height: '100%', justifyContent: 'flex-end', alignItems: 'center', gap: 4 },
  colTrack: { flex: 1, width: '70%', maxWidth: 34, justifyContent: 'flex-end', backgroundColor: colors.navyTint, borderRadius: radius.sm, overflow: 'hidden' },
  column: { width: '100%', borderRadius: radius.sm },
  colLabels: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xs },
  donutRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg, flexWrap: 'wrap' },
  donutCenter: { alignItems: 'center', justifyContent: 'center' },
  legend: { flex: 1, minWidth: 150, gap: spacing.sm },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  stacked: { flexDirection: 'row', overflow: 'hidden', backgroundColor: colors.navySoft, gap: 2 },
  stackLegend: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  stackLegendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
});
