import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Clock, MapPin, Video } from 'lucide-react-native';
import { MEETING_STATUS, RSVP_STATUS } from '@/features/meetings/services/labels';
import { useUser } from '@/features/auth/hooks/useSession';
import { useCommittee } from '@/features/committees/hooks/useCommittees';
import { borderRadius, colors, spacing, typography } from '@/theme';
import type { Meeting } from '@/features/meetings/types';
import { AR_MONTHS, formatTime, formatWeekday, localizeDigits } from '@/utils/format';
import { AppText } from '@/components/common/AppText';
import { StatusBadge } from '@/components/common/Badge';
import { Card } from '@/components/common/Card';

export function MeetingCard({ meeting, onPress }: { meeting: Meeting; onPress?: () => void }) {
  const committee = useCommittee(meeting.committeeId);
  const user = useUser();
  const d = new Date(meeting.date);
  const rsvp = meeting.rsvps[user.id];
  const ModeIcon = meeting.mode === 'online' ? Video : MapPin;
  const live = meeting.status === 'live';
  return (
    <Card onPress={onPress} accessibilityLabel={meeting.title} style={{ padding: spacing.md }} accentColor={live ? colors.success : undefined}>
      <View style={styles.row}>
        <View style={[styles.date, meeting.status === 'cancelled' && { backgroundColor: colors.errorSoft }]}>
          <AppText variant="meta" color={colors.accentLight} style={meeting.status === 'cancelled' && { color: colors.error }}>
            {formatWeekday(d)}
          </AppText>
          <AppText variant="display" color={meeting.status === 'cancelled' ? colors.error : colors.white} style={styles.day}>
            {d.getDate()}
          </AppText>
          <AppText variant="meta" color={meeting.status === 'cancelled' ? colors.error : colors.onPrimaryMuted}>
            {localizeDigits(AR_MONTHS[d.getMonth()])}
          </AppText>
        </View>
        <View style={{ flex: 1, gap: 3 }}>
          <AppText variant="cardTitle" numberOfLines={2}>
            {meeting.title}
          </AppText>
          <AppText variant="meta" color={colors.textSecondary} numberOfLines={1}>
            {committee?.name ?? 'اجتماع عام'}
          </AppText>
          <View style={styles.inline}>
            <Clock size={13} color={colors.textSecondary} />
            <AppText variant="meta" color={colors.textSecondary}>
              {formatTime(meeting.date)}
            </AppText>
            <ModeIcon size={13} color={colors.textSecondary} />
            <AppText variant="meta" color={colors.textSecondary} numberOfLines={1} style={{ flexShrink: 1 }}>
              {meeting.mode === 'online' ? 'اجتماع مرئي' : meeting.location}
            </AppText>
          </View>
          <View style={styles.badges}>
            {meeting.status !== 'scheduled' ? <StatusBadge status={MEETING_STATUS[meeting.status]} /> : null}
            {meeting.status === 'scheduled' && rsvp ? <StatusBadge status={RSVP_STATUS[rsvp]} /> : null}
          </View>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.md, alignItems: 'center' },
  date: { width: 56, borderRadius: borderRadius.sm + 2, backgroundColor: colors.primary, alignItems: 'center', paddingVertical: spacing.xs + 2 },
  day: { ...typography.dateDay },
  inline: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  badges: { flexDirection: 'row', gap: spacing.xs, flexWrap: 'wrap' },
});
