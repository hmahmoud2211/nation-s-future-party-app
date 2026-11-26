import React, { useId } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Path, RadialGradient, Stop } from 'react-native-svg';
import { colors, fontFamily, gradients, spacing } from '@/theme';
import { formatNumber, formatPercent } from '@/utils/format';
import { AppText } from '@/components/common/AppText';

export type RingTone = 'blue' | 'navy' | 'teal';

const RING_GRADIENTS: Record<RingTone, readonly [string, string, ...string[]]> = {
  blue: gradients.ringBlue,
  navy: gradients.ringNavy,
  teal: gradients.ringTeal,
};

export interface ProgressRingProps {
  /** Number shown in the navy core. */
  value: number;
  /** Arc fill, 0–1. */
  progress: number;
  tone?: RingTone;
  /** Outer diameter (default 70, as in the design). */
  size?: number;
  accessibilityLabel?: string;
}

/**
 * SVG arc starting at 12 o'clock and sweeping counter-clockwise (the natural direction for RTL)
 * by `fraction` of a full turn. Sweep flag 0 = counter-clockwise in screen coordinates.
 */
function arcPath(cx: number, cy: number, r: number, fraction: number) {
  const theta = Math.min(fraction, 0.9999) * 2 * Math.PI;
  const endX = cx - r * Math.sin(theta);
  const endY = cy - r * Math.cos(theta);
  const largeArc = theta > Math.PI ? 1 : 0;
  return `M ${cx} ${cy - r} A ${r} ${r} 0 ${largeArc} 0 ${endX.toFixed(3)} ${endY.toFixed(3)}`;
}

/**
 * Status ring from the dashboard: a navy core with the count, a light gap, and an outer arc that
 * fills counter-clockwise from 12 o'clock (natural for RTL) over a grey track.
 */
export const ProgressRing = React.memo(function ProgressRing({ value, progress, tone = 'blue', size = 70, accessibilityLabel }: ProgressRingProps) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const stroke = Math.max(3, Math.round(size * 0.065));
  const c = size / 2;
  const arcR = c - stroke / 2;
  const coreR = c - stroke - Math.max(2, size * 0.045);
  const fraction = Math.max(0, Math.min(1, progress));
  const [from, to] = RING_GRADIENTS[tone];
  const [coreEdge, coreCenter] = gradients.ringCore;

  return (
    <View style={{ width: size, height: size }} accessible accessibilityRole="image" accessibilityLabel={accessibilityLabel ?? formatNumber(value)}>
      <Svg width={size} height={size}>
        <Defs>
          <LinearGradient id={`arc-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={from} />
            <Stop offset="1" stopColor={to} />
          </LinearGradient>
          <RadialGradient id={`core-${uid}`} cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor={coreCenter} />
            <Stop offset="1" stopColor={coreEdge} />
          </RadialGradient>
        </Defs>
        <Circle cx={c} cy={c} r={arcR} stroke={colors.inactive} strokeOpacity={0.85} strokeWidth={stroke} fill="none" />
        {fraction >= 0.9999 ? (
          <Circle cx={c} cy={c} r={arcR} stroke={`url(#arc-${uid})`} strokeWidth={stroke} fill="none" />
        ) : fraction > 0 ? (
          <Path d={arcPath(c, c, arcR, fraction)} stroke={`url(#arc-${uid})`} strokeWidth={stroke} fill="none" />
        ) : null}
        <Circle cx={c} cy={c} r={coreR + 1.5} fill={colors.primarySoft} />
        <Circle cx={c} cy={c} r={coreR} fill={`url(#core-${uid})`} />
      </Svg>
      <View style={[StyleSheet.absoluteFill, styles.center]} pointerEvents="none">
        <AppText variant="stat" color={colors.white} align="center" style={{ fontFamily: fontFamily.medium, fontSize: Math.round(size * 0.29), lineHeight: Math.round(size * 0.42) }}>
          {formatNumber(value)}
        </AppText>
      </View>
    </View>
  );
});

const SHARE_DOT_SIZE = 6;

export interface StatRingItem {
  key: string;
  label: string;
  value: number;
  tone: RingTone;
}

/** Row of labelled progress rings; each arc shows the item's share of `total`. */
export function StatRings({ items, total, size = 70, style }: { items: StatRingItem[]; total: number; size?: number; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[styles.row, style]}>
      {items.map((item) => (
        <View key={item.key} style={styles.item}>
          <ProgressRing
            value={item.value}
            progress={total > 0 ? item.value / total : 0}
            tone={item.tone}
            size={size}
            accessibilityLabel={`${item.label}: ${formatNumber(item.value)} من ${formatNumber(total)}، ${formatPercent(total > 0 ? (item.value / total) * 100 : 0)}`}
          />
          <View style={styles.caption} importantForAccessibility="no-hide-descendants">
            <AppText variant="subheading" align="center" numberOfLines={1} style={styles.label}>
              {item.label}
            </AppText>
            {/* Share of the total, keyed to the ring by a dot in the arc colour. */}
            <View style={styles.share}>
              <View style={[styles.shareDot, { backgroundColor: RING_GRADIENTS[item.tone][0] }]} />
              <AppText variant="meta" color={colors.textSecondary}>
                {formatPercent(total > 0 ? (item.value / total) * 100 : 0)}
              </AppText>
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-start' },
  item: { flex: 1, alignItems: 'center', gap: spacing.md },
  caption: { alignItems: 'center' },
  label: { fontFamily: fontFamily.medium },
  share: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  shareDot: { width: SHARE_DOT_SIZE, height: SHARE_DOT_SIZE, borderRadius: SHARE_DOT_SIZE / 2 },
});
