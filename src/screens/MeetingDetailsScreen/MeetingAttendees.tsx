import React, { useMemo } from 'react';
import { View } from 'react-native';
import { Users } from 'lucide-react-native';
import { AppText } from '@/components/common/AppText';
import { Avatar } from '@/components/common/Avatar';
import { StatusBadge } from '@/components/common/Badge';
import { Card } from '@/components/common/Card';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { RSVP_STATUS } from '@/features/meetings/services/labels';
import type { Meeting, RSVPStatus } from '@/features/meetings/types';
import type { Member } from '@/features/members/types';
import { useAppTheme } from '@/hooks/useAppTheme';
import { meetingDetailsCopy as copy } from './MeetingDetailsScreen.data';
import { ATTENDEE_AVATAR_SIZE, createStyles } from './MeetingDetailsScreen.styles';

type Styles = ReturnType<typeof createStyles>;

/** "المدعوون": RSVP totals and the invitee list with each person's response. */
export function MeetingAttendees({ meeting, members, userId }: { meeting: Meeting; members: Record<string, Member>; userId: string }) {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const counts = meeting.attendeeIds.reduce(
    (acc, a) => {
      const s = meeting.rsvps[a] ?? 'pending';
      acc[s] += 1;
      return acc;
    },
    { going: 0, declined: 0, pending: 0 } as Record<RSVPStatus, number>,
  );

  return (
    <View style={styles.block}>
      <SectionHeader title={copy.attendeesTitle} icon={Users} count={meeting.attendeeIds.length} />
      <View style={styles.counts}>
        <CountPill label={copy.countGoing} value={counts.going} color={theme.colors.success} styles={styles} />
        <CountPill label={copy.countDeclined} value={counts.declined} color={theme.colors.error} styles={styles} />
        <CountPill label={copy.countPending} value={counts.pending} color={theme.colors.textSecondary} styles={styles} />
      </View>
      <Card padded={false}>
        {meeting.attendeeIds.map((a, i) => {
          const m = members[a];
          if (!m) return null;
          const s = meeting.rsvps[a] ?? 'pending';
          return (
            <View key={a} style={[styles.attendee, i < meeting.attendeeIds.length - 1 && styles.border]}>
              <Avatar name={m.name} color={m.avatarColor} size={ATTENDEE_AVATAR_SIZE} />
              <View style={styles.fill}>
                <AppText variant="bodyMedium" numberOfLines={1}>
                  {a === userId ? copy.youSuffix(m.name) : m.name}
                </AppText>
                <AppText variant="meta" color={theme.colors.textSecondary} numberOfLines={1}>
                  {m.title}
                </AppText>
              </View>
              <StatusBadge status={RSVP_STATUS[s]} />
            </View>
          );
        })}
      </Card>
    </View>
  );
}

function CountPill({ label, value, color, styles }: { label: string; value: number; color: string; styles: Styles }) {
  const theme = useAppTheme();
  return (
    <View style={styles.pill}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <AppText variant="captionMedium">{value}</AppText>
      <AppText variant="meta" color={theme.colors.textSecondary}>
        {label}
      </AppText>
    </View>
  );
}
