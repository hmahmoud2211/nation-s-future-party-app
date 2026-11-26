import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { borderRadius, colors, gradients, shadows, spacing, toneColors, type Tone, typography } from '@/theme';
import { AppText } from '@/components/common/AppText';

export interface BadgeProps {
  label: string;
  tone?: Tone;
  icon?: LucideIcon;
  dot?: boolean;
  size?: 'sm' | 'md';
  style?: StyleProp<ViewStyle>;
  solid?: boolean;
}

export function Badge({ label, tone = 'neutral', icon: Icon, dot, size = 'sm', style, solid }: BadgeProps) {
  const t = toneColors[tone];
  const fg = solid ? colors.white : t.fg;
  return (
    <View style={[styles.base, size === 'md' && styles.md, { backgroundColor: solid ? t.fg : t.bg }, style]}>
      {dot ? <View style={[styles.dot, { backgroundColor: fg }]} /> : null}
      {Icon ? <Icon size={size === 'md' ? 14 : 12} color={fg} strokeWidth={2.4} /> : null}
      <AppText variant="meta" color={fg} numberOfLines={1} style={size === 'md' ? styles.mdText : undefined}>
        {label}
      </AppText>
    </View>
  );
}

/** Slate total pill shown next to a section title (e.g. the total number of initiatives). */
export function CountPill({ value, accessibilityLabel, style }: { value: string | number; accessibilityLabel?: string; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[styles.pill, style]} accessible accessibilityLabel={accessibilityLabel}>
      <LinearGradient colors={gradients.slate} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }} style={[StyleSheet.absoluteFill, styles.pillFill]} />
      <AppText variant="sectionTitle" color={colors.white} align="center" style={styles.pillText}>
        {value}
      </AppText>
    </View>
  );
}

/** Status badge driven by a `{label, tone}` entry from constants/labels. */
export function StatusBadge({ status, size, style }: { status: { label: string; tone: Tone }; size?: 'sm' | 'md'; style?: StyleProp<ViewStyle> }) {
  return <Badge label={status.label} tone={status.tone} dot size={size} style={style} />;
}


const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.xs5,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xxs,
    borderRadius: borderRadius.pill,
  },
  md: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs },
  mdText: { ...typography.badgeLabel },
  dot: { width: 6, height: 6, borderRadius: borderRadius.pill },
  pill: {
    minWidth: 70,
    height: 26,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.secondaryLight,
    ...shadows.tile,
  },
  pillFill: { borderRadius: borderRadius.pill },
  pillText: { ...typography.pillValue },
});

export default Badge;
