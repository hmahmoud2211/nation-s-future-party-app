import React, { useEffect, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { CalendarDays, Eye, Megaphone, Users } from 'lucide-react-native';
import { AppHeader, AppText, Avatar, Badge, Card, EmptyState, FilePreview, InfoRow, ScreenContainer } from '@/components';
import { ANNOUNCEMENT_CATEGORY, ANNOUNCEMENT_PRIORITY } from '@/constants/labels';
import { personLabel } from '@/utils/roles';
import { useAppStore, useCommittee, useMember, useUser } from '@/store';
import { colors, spacing } from '@/theme';
import { formatDateTime } from '@/utils/format';
import { canPublishAnnouncement, canSeeAnnouncement, isMemberRole } from '@/utils/permissions';

export default function AnnouncementDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const user = useUser();
  const announcements = useAppStore((s) => s.announcements);
  const announcement = useMemo(() => announcements.find((a) => a.id === id), [announcements, id]);
  const author = useMember(announcement?.createdBy);
  const committee = useCommittee(announcement?.committeeId);
  const markAnnouncementRead = useAppStore((s) => s.markAnnouncementRead);
  const visible = !!announcement && canSeeAnnouncement(user, announcement.committeeId);

  useEffect(() => {
    if (announcement && visible) markAnnouncementRead(announcement.id);
  }, [announcement, visible, markAnnouncementRead]);

  if (!announcement || !visible) {
    return (
      <ScreenContainer header={<AppHeader title="الإعلان" />}>
        <EmptyState icon={Megaphone} title={announcement ? 'هذا الإعلان غير متاح لك' : 'الإعلان غير موجود'} />
      </ScreenContainer>
    );
  }

  const p = ANNOUNCEMENT_PRIORITY[announcement.priority];
  const canManage = canPublishAnnouncement(user, announcement.committeeId);

  return (
    <ScreenContainer
      header={
        <AppHeader title={announcement.title} eyebrow={committee?.name ?? 'إعلان عام للقطاع'}>
          <View style={styles.badges}>
            <Badge label={`أولوية: ${p.label}`} tone={p.tone} size="md" solid={announcement.priority !== 'normal'} />
            <Badge label={ANNOUNCEMENT_CATEGORY[announcement.category]} tone="gold" size="md" />
          </View>
        </AppHeader>
      }
    >
      <View style={{ gap: spacing.lg }}>
        <Card>
          <View style={styles.authorRow}>
            <Avatar name={author?.name ?? '؟'} color={author?.avatarColor} size={42} />
            <View style={{ flex: 1 }}>
              <AppText variant="cardTitle">{author?.name ?? '—'}</AppText>
              <AppText variant="meta" color={colors.textSecondary}>
                {author ? (isMemberRole(author) ? personLabel(author) : author.title || personLabel(author)) : ''}
              </AppText>
            </View>
          </View>
          <AppText variant="body" style={{ marginTop: spacing.lg, lineHeight: 26 }}>
            {announcement.body}
          </AppText>
          {announcement.attachments.length ? (
            <View style={{ gap: spacing.sm, marginTop: spacing.md }}>
              {announcement.attachments.map((a) => (
                <FilePreview key={a.id} file={a} />
              ))}
            </View>
          ) : null}
        </Card>

        <Card style={{ paddingVertical: spacing.sm }}>
          <InfoRow icon={CalendarDays} label="تاريخ النشر" value={formatDateTime(announcement.createdAt)} />
          <InfoRow icon={Users} label="الجهة المستهدفة" value={committee?.name ?? 'جميع أعضاء القطاع'} />
          <InfoRow icon={Eye} label="حالة القراءة" value={canManage ? `قرأه ${announcement.readBy.length} عضو` : 'مقروء'} last />
        </Card>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  badges: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' },
  authorRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
});
