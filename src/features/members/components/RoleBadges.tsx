import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { RESPONSIBLE_LABEL, RESPONSIBLE_TONE, ROLE_LABELS, ROLE_TONES } from '@/features/members/services/labels';
import { spacing } from '@/theme';
import type { Member } from '@/features/members/types';
import { Badge } from '@/components/common/Badge';

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

const styles = StyleSheet.create({
  roleRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
});
