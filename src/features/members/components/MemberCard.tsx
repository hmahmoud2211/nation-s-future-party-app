import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { MEMBERSHIP_STATUS } from '@/features/members/services/labels';
import { isMemberRole } from '@/features/auth/services/permissions';
import { useCommittees } from '@/features/committees/hooks/useCommittees';
import { colors, spacing } from '@/theme';
import type { Member } from '@/features/members/types';
import { AppText } from '@/components/common/AppText';
import { Avatar } from '@/components/common/Avatar';
import { Badge, StatusBadge } from '@/components/common/Badge';
import { RoleBadges } from '@/features/members/components/RoleBadges';
import { Card } from '@/components/common/Card';

export function MemberCard({ member, onPress, showStats = true, right }: { member: Member; onPress?: () => void; showStats?: boolean; right?: React.ReactNode }) {
  const committees = useCommittees();
  const committeeNames = committees.filter((c) => member.committeeIds.includes(c.id)).map((c) => c.shortName).join('، ');
  return (
    <Card onPress={onPress} accessibilityLabel={member.name} style={{ padding: spacing.md }}>
      <View style={styles.row}>
        <Avatar name={member.name} color={member.avatarColor} size={46} />
        <View style={{ flex: 1, gap: 3 }}>
          <AppText variant="cardTitle" numberOfLines={2}>
            {member.name}
          </AppText>
          <View style={styles.badges}>
            {isMemberRole(member) ? <Badge label={member.title || 'عضو'} tone="neutral" /> : <RoleBadges member={member} />}
            {member.status !== 'active' ? <StatusBadge status={MEMBERSHIP_STATUS[member.status]} /> : null}
          </View>
          {showStats && committeeNames ? (
            <AppText variant="meta" color={colors.textSecondary} numberOfLines={1}>
              {committeeNames}
            </AppText>
          ) : null}
        </View>
        {right ?? (onPress ? <ChevronLeft size={18} color={colors.textMuted} /> : null)}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
});
