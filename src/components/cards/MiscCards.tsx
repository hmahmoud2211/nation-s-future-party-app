import React from 'react';
import { StyleSheet, View } from 'react-native';
import { CalendarDays, FileText, MapPin, Megaphone, Users } from 'lucide-react-native';
import {
  ACTIVITY_STATUS,
  ACTIVITY_TYPE,
  ANNOUNCEMENT_CATEGORY,
  ANNOUNCEMENT_PRIORITY,
  REPORT_STATUS,
  REQUEST_STATUS,
  REQUEST_TYPE,
} from '@/constants/labels';
import { useCommittee, useMember, useUser } from '@/store';
import { colors, radius, spacing } from '@/theme';
import type { Activity, AdminRequest, Announcement, CommitteeReport } from '@/types';
import { formatDate, formatDateTime, formatRelative, refCode } from '@/utils/format';
import { AppText } from '../ui/AppText';
import { Badge, StatusBadge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { ProgressBar } from '../ui/ProgressBar';

export function ActivityCard({ activity, onPress }: { activity: Activity; onPress?: () => void }) {
  const committee = useCommittee(activity.committeeId);
  const user = useUser();
  const registered = activity.registrations.includes(user.id);
  return (
    <Card onPress={onPress} accessibilityLabel={activity.title}>
      <View style={styles.row}>
        <Badge label={ACTIVITY_TYPE[activity.type]} tone="gold" />
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

export function AnnouncementCard({ announcement, onPress }: { announcement: Announcement; onPress?: () => void }) {
  const committee = useCommittee(announcement.committeeId);
  const user = useUser();
  const unread = !announcement.readBy.includes(user.id);
  const p = ANNOUNCEMENT_PRIORITY[announcement.priority];
  return (
    <Card onPress={onPress} accessibilityLabel={announcement.title} accentColor={announcement.priority === 'urgent' ? colors.error : announcement.priority === 'important' ? colors.gold : undefined}>
      <View style={styles.row}>
        <View style={styles.megaphone}>
          <Megaphone size={16} color={colors.goldDark} />
        </View>
        <View style={{ flex: 1 }}>
          <AppText variant="cardTitle" numberOfLines={2}>
            {announcement.title}
          </AppText>
          <AppText variant="meta" color={colors.textSecondary}>
            {`${committee?.name ?? 'إعلان عام للقطاع'} • ${formatRelative(announcement.createdAt)}`}
          </AppText>
        </View>
        {unread ? <View style={styles.dot} /> : null}
      </View>
      <AppText variant="caption" color={colors.textSecondary} numberOfLines={2} style={{ marginTop: spacing.sm }}>
        {announcement.body}
      </AppText>
      <View style={[styles.row, { marginTop: spacing.sm }]}>
        {announcement.priority !== 'normal' ? <Badge label={p.label} tone={p.tone} /> : null}
        <Badge label={ANNOUNCEMENT_CATEGORY[announcement.category]} tone="neutral" />
      </View>
    </Card>
  );
}

export function RequestCard({ request, onPress, showAuthor }: { request: AdminRequest; onPress?: () => void; showAuthor?: boolean }) {
  const author = useMember(request.authorId);
  return (
    <Card onPress={onPress} accessibilityLabel={request.subject}>
      <View style={styles.row}>
        <Badge label={REQUEST_TYPE[request.type]} tone="navy" />
        <StatusBadge status={REQUEST_STATUS[request.status]} />
        <View style={{ flex: 1 }} />
        <AppText variant="meta" color={colors.textMuted}>
          {refCode.request(request.seq)}
        </AppText>
      </View>
      <AppText variant="cardTitle" numberOfLines={2} style={{ marginTop: spacing.sm }}>
        {request.subject}
      </AppText>
      <AppText variant="caption" color={colors.textSecondary} numberOfLines={2}>
        {request.description}
      </AppText>
      <AppText variant="meta" color={colors.textMuted} style={{ marginTop: spacing.sm }}>
        {[showAuthor ? author?.name : null, formatRelative(request.updatedAt), request.replies.length ? `${request.replies.length} ردود` : 'لا توجد ردود بعد']
          .filter(Boolean)
          .join(' • ')}
      </AppText>
    </Card>
  );
}

export function ReportCard({ report, onPress }: { report: CommitteeReport; onPress?: () => void }) {
  const committee = useCommittee(report.committeeId);
  return (
    <Card onPress={onPress} accessibilityLabel={report.title}>
      <View style={styles.row}>
        <View style={styles.megaphone}>
          <FileText size={16} color={colors.navy2} />
        </View>
        <View style={{ flex: 1 }}>
          <AppText variant="cardTitle" numberOfLines={2}>
            {report.title}
          </AppText>
          <AppText variant="meta" color={colors.textSecondary}>
            {`${committee?.name ?? ''} • ${report.period}`}
          </AppText>
        </View>
        <StatusBadge status={REPORT_STATUS[report.status]} />
      </View>
      <AppText variant="caption" color={colors.textSecondary} numberOfLines={2} style={{ marginTop: spacing.sm }}>
        {report.summary}
      </AppText>
      <AppText variant="meta" color={colors.textMuted} style={{ marginTop: spacing.xs }}>
        {`${refCode.report(report.seq)} • ${formatDate(report.createdAt)}`}
      </AppText>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs + 2, flexWrap: 'wrap' },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 3 },
  megaphone: { width: 34, height: 34, borderRadius: radius.sm + 2, backgroundColor: colors.goldSoft, alignItems: 'center', justifyContent: 'center' },
  dot: { width: 9, height: 9, borderRadius: 5, backgroundColor: colors.gold },
});
