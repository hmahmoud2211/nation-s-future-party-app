import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { colors, radius, shadows, spacing, toneColors, type Tone } from '@/theme';
import { AppText } from '../ui/AppText';
import { PressableScale } from '../ui/PressableScale';

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
export function StatCard({ label, value, icon: Icon, tone = 'navy', hint, onPress, style, glass }: StatCardProps) {
  const t = toneColors[tone];
  const inner = (
    <>
      <View style={styles.top}>
        <View style={[styles.icon, { backgroundColor: glass ? 'rgba(255,255,255,0.12)' : t.bg }]}>
          <Icon size={16} color={glass ? colors.goldLight : t.fg} strokeWidth={2.2} />
        </View>
        <AppText variant="stat" color={glass ? colors.white : colors.text}>
          {value}
        </AppText>
      </View>
      <AppText variant="caption" color={glass ? 'rgba(255,255,255,0.8)' : colors.textSecondary} numberOfLines={2}>
        {label}
      </AppText>
      {hint ? (
        <AppText variant="meta" color={glass ? colors.goldLight : t.fg} numberOfLines={1}>
          {hint}
        </AppText>
      ) : null}
    </>
  );
  const s = [styles.card, glass ? styles.glass : styles.solid, style];
  return onPress ? (
    <PressableScale onPress={onPress} style={s} accessibilityLabel={label}>
      {inner}
    </PressableScale>
  ) : (
    <View style={s}>{inner}</View>
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

/** Large quick-action tile. */
export function QuickAction({ label, icon: Icon, onPress, tone = 'gold' }: { label: string; icon: LucideIcon; onPress: () => void; tone?: Tone }) {
  const t = toneColors[tone];
  return (
    <PressableScale onPress={onPress} style={styles.action} accessibilityLabel={label} haptic>
      <View style={[styles.actionIcon, { backgroundColor: t.bg }]}>
        <Icon size={19} color={t.fg} strokeWidth={2.1} />
      </View>
      <AppText variant="captionMedium" align="center" numberOfLines={2}>
        {label}
      </AppText>
    </PressableScale>
  );
}

export function QuickActionGrid({ children, columns = 3 }: { children: React.ReactNode; columns?: 3 | 4 }) {
  const items = React.Children.toArray(children);
  return (
    <View style={styles.grid}>
      {items.map((child, i) => (
        <View key={i} style={{ width: columns === 4 ? '23.5%' : '31.6%' }}>
          {child}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.md, padding: spacing.md, gap: 0 },
  solid: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, ...shadows.card },
  glass: { backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.14)' },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 },
  icon: { width: 30, height: 30, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: spacing.sm },
  action: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xs,
    alignItems: 'center',
    gap: spacing.xs + 2,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  actionIcon: { width: 38, height: 38, borderRadius: radius.sm + 2, alignItems: 'center', justifyContent: 'center' },
});
