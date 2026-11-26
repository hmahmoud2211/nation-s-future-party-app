import React, { useMemo, useState } from 'react';
import { FlatList, View } from 'react-native';
import { useRouter } from 'expo-router';
import { BellOff, CheckCheck } from 'lucide-react-native';
import { IconButton } from '@/components/common/IconButton';
import { EmptyState, LoadingState, useSimulatedLoading } from '@/components/feedback/States';
import { AppHeader } from '@/components/layout/AppHeader';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { type ChipOption, FilterChips } from '@/components/ui/Chips';
import { NotificationCard } from '@/features/notifications/components/NotificationCard';
import { useMyNotifications, useNotificationActions, useUnreadCount } from '@/features/notifications/hooks/useNotifications';
import type { AppNotification, NotificationType } from '@/features/notifications/types';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useToast } from '@/hooks/useOverlays';
import { notificationsCopy as copy } from './NotificationsScreen.data';
import { createStyles } from './NotificationsScreen.styles';

type GroupKey = 'all' | 'unread' | 'proposals' | 'meetings' | 'feedback' | 'announcements';

const GROUPS: Record<Exclude<GroupKey, 'all' | 'unread'>, NotificationType[]> = {
  proposals: ['proposal_new', 'proposal_update', 'project_update'],
  meetings: ['meeting_new', 'meeting_started'],
  feedback: ['feedback_new', 'feedback_reply', 'request_update'],
  announcements: ['announcement_new'],
};

const LABELS: Record<GroupKey, string> = copy.groupLabels;

function inGroup(n: AppNotification, g: GroupKey) {
  if (g === 'all') return true;
  if (g === 'unread') return !n.read;
  return GROUPS[g].includes(n.type);
}

export function NotificationsScreen() {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const router = useRouter();
  const notifications = useMyNotifications();
  const unread = useUnreadCount();
  const { markNotificationRead: markRead, markAllNotificationsRead: markAll } = useNotificationActions();
  const toast = useToast();
  const loading = useSimulatedLoading(350);
  const [group, setGroup] = useState<GroupKey>('all');

  const visible = useMemo(() => notifications.filter((n) => inGroup(n, group)), [notifications, group]);
  const options: ChipOption<GroupKey>[] = (Object.keys(LABELS) as GroupKey[]).map((k) => ({
    key: k,
    label: LABELS[k],
    count: k === 'all' ? notifications.length : notifications.filter((n) => inGroup(n, k)).length,
  }));

  const open = (n: AppNotification) => {
    if (!n.read) markRead(n.id);
    if (n.link) router.push(n.link);
  };

  return (
    <ScreenContainer
      scroll={false}
      padded={false}
      header={
        <AppHeader
          title={copy.title}
          subtitle={unread ? copy.unreadSubtitle(unread) : copy.noUnreadSubtitle}
          actions={
            <IconButton
              icon={CheckCheck}
              variant="glass"
              accessibilityLabel={copy.markAllRead}
              disabled={!unread}
              onPress={() => {
                markAll();
                toast.success(copy.markAllReadDone);
              }}
            />
          }
        />
      }
    >
      <FlatList
        data={loading ? [] : visible}
        keyExtractor={(n) => n.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.listHeader}>
            <FilterChips options={options} value={group} onChange={setGroup} />
            {loading ? <LoadingState count={4} /> : null}
          </View>
        }
        ListEmptyComponent={
          loading ? undefined : <EmptyState icon={BellOff} title={group === 'unread' ? copy.emptyUnreadTitle : copy.emptyTitle} message={copy.emptyMessage} />
        }
        renderItem={({ item }) => <NotificationCard notification={item} onPress={() => open(item)} />}
      />
    </ScreenContainer>
  );
}
