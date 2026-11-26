import React from 'react';
import { StyleSheet, View } from 'react-native';
import { CalendarDays, MapPin, Users } from 'lucide-react-native';
import { ACTIVITY_STATUS, ACTIVITY_TYPE } from '@/features/activities/services/labels';
import { useUser } from '@/features/auth/hooks/useSession';
import { useCommittee } from '@/features/committees/hooks/useCommittees';
import { colors, spacing } from '@/theme';
import type { Activity } from '@/features/activities/types';
import { formatDateTime } from '@/utils/format';
import { AppText } from '@/components/common/AppText';
import { Badge, StatusBadge } from '@/components/common/Badge';
import { Card } from '@/components/common/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';

export function ActivityCard({ activity, onPress }: { activity: Activity; onPress?: () => void }) {
  const committee = useCommittee(activity.committeeId);
  const user = useUser();
  const registered = activity.registrations.includes(user.id);
  return (
    <Card onPress={onPress} accessibilityLabel={activity.title}>
      <View style={styles.row}>
        <Badge label={ACTIVITY_TYPE[activity.type]} tone="accent" />
        <StatusBadge status={ACTIVITY_STATUS[activity.status]} />
        {registered ? <Badge label="مسجل" tone="success" /> : null}
      </View>
      <AppText variant="cardTitle" numberOfLines={2} style={{ marginTop: spacing.sm }}>
        {activity.title}
      </AppText>
      <AppText variant="meta" color={colors.textSecondary} numberOfLines={1}>
        {committee?.name}
      </AppText>
      <View style={[styles.meta, { marginTop: spacing.sm }]}>
        <CalendarDays size={13} color={colors.textSecondary} />
        <AppText variant="meta" color={colors.textSecondary}>
          {formatDateTime(activity.date)}
        </AppText>
      </View>
      <View style={styles.meta}>
        <MapPin size={13} color={colors.textSecondary} />
        <AppText variant="meta" color={colors.textSecondary} numberOfLines={1} style={{ flex: 1 }}>
          {activity.location}
        </AppText>
        <Users size={13} color={colors.textSecondary} />
        <AppText variant="meta" color={colors.textSecondary}>
          {activity.capacity ? `${activity.registrations.length}/${activity.capacity}` : `${activity.registrations.length}`}
        </AppText>
      </View>
      {activity.status === 'ongoing' ? <ProgressBar value={activity.progress} height={6} style={{ marginTop: spacing.sm }} /> : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs + 2, flexWrap: 'wrap' },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 3 },
});
