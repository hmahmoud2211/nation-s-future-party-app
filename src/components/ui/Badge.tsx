import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { RESPONSIBLE_LABEL, RESPONSIBLE_TONE, ROLE_LABELS, ROLE_TONES } from '@/constants/labels';
import { radius, spacing, toneColors, type Tone } from '@/theme';
import type { Member } from '@/types';
import { AppText } from './AppText';

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
  const fg = solid ? '#FFFFFF' : t.fg;
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

/** Status badge driven by a `{label, tone}` entry from constants/labels. */
export function StatusBadge({ status, size, style }: { status: { label: string; tone: Tone }; size?: 'sm' | 'md'; style?: StyleProp<ViewStyle> }) {
  return <Badge label={status.label} tone={status.tone} dot size={size} style={style} />;
}


const styles = StyleSheet.create({
  roleRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 5,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  md: { paddingHorizontal: spacing.md, paddingVertical: 4 },
  mdText: { fontSize: 12.5 },
  dot: { width: 6, height: 6, borderRadius: 3 },
});

export default Badge;

/** Role badge, plus a "مسؤول اللجنة" badge when the person is responsible for a committee. */
export function RoleBadges({ member, style }: { member: Pick<Member, 'role' | 'managedCommitteeIds'>; style?: StyleProp<ViewStyle> }) {
  const plainResponsible = member.role === 'member' && member.managedCommitteeIds.length > 0;
  return (
    <View style={[styles.roleRow, style]}>
      {plainResponsible ? null : <Badge label={ROLE_LABELS[member.role]} tone={ROLE_TONES[member.role]} />}
      {member.managedCommitteeIds.length ? <Badge label={RESPONSIBLE_LABEL} tone={RESPONSIBLE_TONE} /> : null}
    </View>
  );
}
