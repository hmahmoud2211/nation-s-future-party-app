import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Megaphone } from 'lucide-react-native';
import { ANNOUNCEMENT_CATEGORY, ANNOUNCEMENT_PRIORITY } from '@/features/announcements/services/labels';
import { useUser } from '@/features/auth/hooks/useSession';
import { useCommittee } from '@/features/committees/hooks/useCommittees';
import { borderRadius, colors, spacing } from '@/theme';
import type { Announcement } from '@/features/announcements/types';
import { formatRelative } from '@/utils/format';
import { AppText } from '@/components/common/AppText';
import { Badge } from '@/components/common/Badge';
import { Card } from '@/components/common/Card';

export function AnnouncementCard({ announcement, onPress }: { announcement: Announcement; onPress?: () => void }) {
  const committee = useCommittee(announcement.committeeId);
  const user = useUser();
  const unread = !announcement.readBy.includes(user.id);
  const p = ANNOUNCEMENT_PRIORITY[announcement.priority];
  return (
    <Card onPress={onPress} accessibilityLabel={announcement.title} accentColor={announcement.priority === 'urgent' ? colors.error : announcement.priority === 'important' ? colors.accent : undefined}>
      <View style={styles.row}>
        <View style={styles.megaphone}>
          <Megaphone size={16} color={colors.accentStrong} />
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

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs + 2, flexWrap: 'wrap' },
  megaphone: { width: 34, height: 34, borderRadius: borderRadius.sm + 2, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center' },
  dot: { width: 9, height: 9, borderRadius: 5, backgroundColor: colors.accent },
});
