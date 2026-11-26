import React, { useMemo } from 'react';
import { View } from 'react-native';
import { AppText } from '@/components/common/AppText';
import { StatusBadge } from '@/components/common/Badge';
import { MEETING_STATUS, RSVP_STATUS } from '@/features/meetings/services/labels';
import type { Meeting, RSVPStatus } from '@/features/meetings/types';
import { useAppTheme } from '@/hooks/useAppTheme';
import { formatDate, formatTime, formatWeekday } from '@/utils/format';
import { meetingDetailsCopy as copy } from './MeetingDetailsScreen.data';
import { createStyles } from './MeetingDetailsScreen.styles';

/** Glass card under the header title: day tile, full date, time • duration and status badges. */
export function MeetingHeadCard({ meeting, myRsvp, scheduled }: { meeting: Meeting; myRsvp?: RSVPStatus; scheduled: boolean }) {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const d = new Date(meeting.date);
  return (
    <View style={styles.headCard}>
      <View style={styles.dateBox}>
        <AppText variant="meta" color={theme.colors.primary}>
          {formatWeekday(d)}
        </AppText>
        <AppText variant="display" color={theme.colors.primary} style={styles.day}>
          {d.getDate()}
        </AppText>
      </View>
      <View style={styles.headInfo}>
        <AppText variant="cardTitle" color={theme.colors.white}>
          {formatDate(meeting.date)}
        </AppText>
        <AppText variant="caption" color={theme.colors.onPrimaryMuted}>
          {copy.timeWithDuration(formatTime(meeting.date), copy.durationLabel(meeting.durationMin))}
        </AppText>
        <View style={styles.headBadges}>
          <StatusBadge status={MEETING_STATUS[meeting.status]} />
          {myRsvp && scheduled ? <StatusBadge status={RSVP_STATUS[myRsvp]} /> : null}
        </View>
      </View>
    </View>
  );
}
