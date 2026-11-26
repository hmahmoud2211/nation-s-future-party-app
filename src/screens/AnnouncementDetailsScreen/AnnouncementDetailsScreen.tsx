import React, { useEffect, useMemo } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { CalendarDays, Eye, Megaphone, Users } from 'lucide-react-native';
import { AppText } from '@/components/common/AppText';
import { Avatar } from '@/components/common/Avatar';
import { Badge } from '@/components/common/Badge';
import { Card } from '@/components/common/Card';
import { EmptyState } from '@/components/feedback/States';
import { FilePreview } from '@/components/forms/AttachmentPicker';
import { AppHeader } from '@/components/layout/AppHeader';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { InfoRow } from '@/components/ui/InfoRow';
import { useAnnouncement, useAnnouncementActions } from '@/features/announcements/hooks/useAnnouncements';
import { ANNOUNCEMENT_CATEGORY, ANNOUNCEMENT_PRIORITY } from '@/features/announcements/services/labels';
import { useUser } from '@/features/auth/hooks/useSession';
import { canPublishAnnouncement, canSeeAnnouncement, isMemberRole } from '@/features/auth/services/permissions';
import { personLabel } from '@/features/auth/services/roles';
import { useCommittee } from '@/features/committees/hooks/useCommittees';
import { useMember } from '@/features/members/hooks/useMembers';
import { useAppTheme } from '@/hooks/useAppTheme';
import { formatDateTime } from '@/utils/format';
import { announcementDetailsCopy as copy } from './AnnouncementDetailsScreen.data';
import { AUTHOR_AVATAR_SIZE, createStyles } from './AnnouncementDetailsScreen.styles';

export function AnnouncementDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const user = useUser();
  const announcement = useAnnouncement(id);
  const author = useMember(announcement?.createdBy);
  const committee = useCommittee(announcement?.committeeId);
  const { markAnnouncementRead } = useAnnouncementActions();
  const visible = !!announcement && canSeeAnnouncement(user, announcement.committeeId);

  useEffect(() => {
    if (announcement && visible) markAnnouncementRead(announcement.id);
  }, [announcement, visible, markAnnouncementRead]);

  if (!announcement || !visible) {
    return (
      <ScreenContainer header={<AppHeader title={copy.title} />}>
        <EmptyState icon={Megaphone} title={announcement ? copy.unavailable : copy.notFound} />
      </ScreenContainer>
    );
  }

  const p = ANNOUNCEMENT_PRIORITY[announcement.priority];
  const canManage = canPublishAnnouncement(user, announcement.committeeId);

  return (
    <ScreenContainer
      header={
        <AppHeader title={announcement.title} eyebrow={committee?.name ?? copy.sectorWide}>
          <View style={styles.badges}>
            <Badge label={copy.priorityBadge(p.label)} tone={p.tone} size="md" solid={announcement.priority !== 'normal'} />
            <Badge label={ANNOUNCEMENT_CATEGORY[announcement.category]} tone="accent" size="md" />
          </View>
        </AppHeader>
      }
    >
      <View style={styles.content}>
        <Card>
          <View style={styles.authorRow}>
            <Avatar name={author?.name ?? copy.unknownInitial} color={author?.avatarColor} size={AUTHOR_AVATAR_SIZE} />
            <View style={styles.authorInfo}>
              <AppText variant="cardTitle">{author?.name ?? copy.emptyValue}</AppText>
              <AppText variant="meta" color={theme.colors.textSecondary}>
                {author ? (isMemberRole(author) ? personLabel(author) : author.title || personLabel(author)) : ''}
              </AppText>
            </View>
          </View>
          <AppText variant="bodyLoose" style={styles.body}>
            {announcement.body}
          </AppText>
          {announcement.attachments.length ? (
            <View style={styles.attachments}>
              {announcement.attachments.map((a) => (
                <FilePreview key={a.id} file={a} />
              ))}
            </View>
          ) : null}
        </Card>

        <Card style={styles.infoCard}>
          <InfoRow icon={CalendarDays} label={copy.publishedAt} value={formatDateTime(announcement.createdAt)} />
          <InfoRow icon={Users} label={copy.target} value={committee?.name ?? copy.allSectorMembers} />
          <InfoRow icon={Eye} label={copy.readStatus} value={canManage ? copy.readByCount(announcement.readBy.length) : copy.read} last />
        </Card>
      </View>
    </ScreenContainer>
  );
}
