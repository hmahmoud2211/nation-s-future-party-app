import React, { useMemo, useState } from 'react';
import { FlatList, View } from 'react-native';
import { useRouter } from 'expo-router';
import { BellOff, CheckCheck } from 'lucide-react-native';
import {
  AppHeader,
  EmptyState,
  FilterChips,
  IconButton,
  LoadingState,
  NotificationCard,
  ScreenContainer,
  useSimulatedLoading,
  type ChipOption,
} from '@/components';
import { useAppStore, useMyNotifications, useUnreadCount } from '@/store';
import { toast } from '@/store/uiStore';
import { GUTTER, spacing } from '@/theme';
import type { AppNotification, NotificationType } from '@/types';

type GroupKey = 'all' | 'unread' | 'proposals' | 'meetings' | 'feedback' | 'announcements';

const GROUPS: Record<Exclude<GroupKey, 'all' | 'unread'>, NotificationType[]> = {
  proposals: ['proposal_new', 'proposal_update', 'project_update'],
  meetings: ['meeting_new', 'meeting_started'],
  feedback: ['feedback_new', 'feedback_reply', 'request_update'],
  announcements: ['announcement_new'],
};

const LABELS: Record<GroupKey, string> = {
  all: 'الكل',
  unread: 'غير المقروءة',
  proposals: 'المقترحات',
  meetings: 'الاجتماعات',
  feedback: 'الملاحظات',
  announcements: 'الإعلانات',
};

function inGroup(n: AppNotification, g: GroupKey) {
  if (g === 'all') return true;
  if (g === 'unread') return !n.read;
  return GROUPS[g].includes(n.type);
}

export default function NotificationsScreen() {
  const router = useRouter();
  const notifications = useMyNotifications();
  const unread = useUnreadCount();
  const markRead = useAppStore((s) => s.markNotificationRead);
  const markAll = useAppStore((s) => s.markAllNotificationsRead);
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
          title="الإشعارات"
          subtitle={unread ? `لديك ${unread} إشعارات غير مقروءة` : 'لا توجد إشعارات غير مقروءة'}
          actions={
            <IconButton
              icon={CheckCheck}
              variant="glass"
              accessibilityLabel="تحديد الكل كمقروء"
              disabled={!unread}
              onPress={() => {
                markAll();
                toast.success('تم تحديد جميع الإشعارات كمقروءة');
              }}
            />
          }
        />
      }
    >
      <FlatList
        data={loading ? [] : visible}
        keyExtractor={(n) => n.id}
        contentContainerStyle={{ padding: GUTTER, gap: spacing.sm + 2, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={{ gap: spacing.md, marginBottom: spacing.xs }}>
            <FilterChips options={options} value={group} onChange={setGroup} />
            {loading ? <LoadingState count={4} /> : null}
          </View>
        }
        ListEmptyComponent={
          loading ? undefined : <EmptyState icon={BellOff} title={group === 'unread' ? 'لا توجد إشعارات غير مقروءة' : 'لا توجد إشعارات'} message="تصلك الإشعارات عند تحديث المقترحات وبدء الاجتماعات والرد على استفساراتك." />
        }
        renderItem={({ item }) => <NotificationCard notification={item} onPress={() => open(item)} />}
      />
    </ScreenContainer>
  );
}
