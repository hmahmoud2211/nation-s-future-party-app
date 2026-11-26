import React from 'react';
import { StyleSheet, View } from 'react-native';
import {
  Bell,
  CalendarPlus,
  CircleCheck,
  FolderKanban,
  Inbox,
  Lightbulb,
  Megaphone,
  MessageSquare,
  MessagesSquare,
  Video,
  type LucideIcon,
} from 'lucide-react-native';
import { NOTIFICATION_TYPE } from '@/features/notifications/services/labels';
import { borderRadius, colors, spacing, toneColors } from '@/theme';
import type { AppNotification, NotificationType } from '@/features/notifications/types';
import { formatRelative } from '@/utils/format';
import { AppText } from '@/components/common/AppText';
import { PressableScale } from '@/components/common/PressableScale';

export const NOTIFICATION_ICONS: Record<NotificationType, LucideIcon> = {
  proposal_new: Lightbulb,
  proposal_update: CircleCheck,
  feedback_new: MessageSquare,
  feedback_reply: MessagesSquare,
  meeting_new: CalendarPlus,
  meeting_started: Video,
  announcement_new: Megaphone,
  project_update: FolderKanban,
  request_update: Inbox,
};

export function NotificationCard({ notification, onPress }: { notification: AppNotification; onPress?: () => void }) {
  const meta = NOTIFICATION_TYPE[notification.type];
  const t = toneColors[meta.tone];
  const Icon = NOTIFICATION_ICONS[notification.type] ?? Bell;
  return (
    <PressableScale onPress={onPress} scaleTo={0.985} style={[styles.card, !notification.read && styles.unread]} accessibilityLabel={notification.title}>
      <View style={[styles.icon, { backgroundColor: t.bg }]}>
        <Icon size={18} color={t.fg} />
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <View style={styles.titleRow}>
          <AppText variant="cardTitle" numberOfLines={1} style={{ flex: 1 }}>
            {notification.title}
          </AppText>
          {!notification.read ? <View style={styles.dot} /> : null}
        </View>
        <AppText variant="caption" color={colors.textSecondary} numberOfLines={2}>
          {notification.body}
        </AppText>
        <AppText variant="meta" color={colors.textMuted}>
          {`${meta.label} • ${formatRelative(notification.createdAt)}`}
        </AppText>
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  unread: { backgroundColor: colors.accentSoft, borderColor: colors.accentLight },
  icon: { width: 42, height: 42, borderRadius: borderRadius.md, alignItems: 'center', justifyContent: 'center' },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.accent },
});
