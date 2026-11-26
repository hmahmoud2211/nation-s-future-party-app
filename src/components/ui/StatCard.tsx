import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { LucideIcon } from 'lucide-react-native';
import { borderRadius, colors, fontFamily, gradients, layout, shadows, sizes, spacing, toneColors, type Tone } from '@/theme';
import { AppText } from '@/components/common/AppText';
import { PressableScale } from '@/components/common/PressableScale';

export interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  tone?: Tone;
  hint?: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  /** Glass variant for use on navy headers. */
  glass?: boolean;
}

/** Statistic tile — values must come from live selectors, never hardcoded. */
export function StatCard({ label, value, icon: Icon, tone = 'primary', hint, onPress, style, glass }: StatCardProps) {
  const t = toneColors[tone];
  const inner = (
    <>
      <View style={styles.top}>
        <View style={[styles.icon, { backgroundColor: glass ? colors.glassStrong : t.bg }]}>
          <Icon size={sizes.icon.sm} color={glass ? colors.accentLight : t.fg} strokeWidth={2.2} />
        </View>
        <AppText variant="stat" color={glass ? colors.white : colors.text}>
          {value}
        </AppText>
      </View>
      <AppText variant="caption" color={glass ? colors.onPrimaryMuted : colors.textSecondary} numberOfLines={2}>
        {label}
      </AppText>
      {hint ? (
        <AppText variant="meta" color={glass ? colors.accentLight : t.fg} numberOfLines={1}>
          {hint}
        </AppText>
      ) : null}
    </>
  );
  const s = [styles.card, glass ? styles.glass : styles.solid, style];
  return onPress ? (
    <PressableScale onPress={onPress} style={s} accessibilityLabel={`${label}: ${value}`}>
      {inner}
    </PressableScale>
  ) : (
    <View style={s} accessible accessibilityLabel={`${label}: ${value}`}>
      {inner}
    </View>
  );
}

/** Alias required by the spec. */
export const SummaryCard = StatCard;

/** 2-column responsive grid for stat cards. */
export function StatGrid({ children, columns = 2 }: { children: React.ReactNode; columns?: 2 | 3 }) {
  const items = React.Children.toArray(children);
  return (
    <View style={styles.grid}>
      {items.map((child, i) => (
        <View key={i} style={{ width: columns === 2 ? '48.5%' : '31.6%' }}>
          {child}
        </View>
      ))}
    </View>
  );
}

/** Navy gradient action tile (white outline icon + label) — the dashboard's quick actions. */
export function QuickAction({ label, icon: Icon, onPress, accessibilityHint }: { label: string; icon: LucideIcon; onPress: () => void; accessibilityHint?: string }) {
  return (
    <PressableScale onPress={onPress} style={styles.action} accessibilityLabel={label} accessibilityHint={accessibilityHint} haptic scaleTo={0.95}>
      <LinearGradient colors={gradients.tile} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }} style={[StyleSheet.absoluteFill, styles.actionFill]} />
      <View>
        <Icon size={sizes.icon.xl} color={colors.white} strokeWidth={1.5} />
      </View>
      <AppText variant="subheading" color={colors.white} align="center" numberOfLines={2} style={styles.actionLabel}>
        {label}
      </AppText>
    </PressableScale>
  );
}

const TILE_GAP = 16;

/** Grid of quick-action tiles; items fill from the start (right) edge, so 1–2 tiles stay aligned. */
export function QuickActionGrid({ children, columns = 3 }: { children: React.ReactNode; columns?: 3 | 4 }) {
  const items = React.Children.toArray(children);
  return (
    <View style={styles.actionGrid}>
      {items.map((child, i) => (
        <View key={i} style={[styles.actionCell, { width: columns === 4 ? '25%' : '33.333%' }]}>
          {child}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: borderRadius.lg, padding: spacing.md, gap: 0 },
  solid: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.cardBorder, ...shadows.card },
  glass: { backgroundColor: colors.glass, borderWidth: 1, borderColor: colors.glassBorder },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.xxs },
  icon: { width: 30, height: 30, borderRadius: borderRadius.sm, alignItems: 'center', justifyContent: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: layout.itemGap },
  action: {
    minHeight: 100,
    borderRadius: borderRadius.xl,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.primaryLight,
    ...shadows.tile,
  },
  actionFill: { borderRadius: borderRadius.xl - 1 },
  actionLabel: { fontFamily: fontFamily.medium },
  actionGrid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -TILE_GAP / 2, rowGap: TILE_GAP },
  actionCell: { paddingHorizontal: TILE_GAP / 2 },
});
