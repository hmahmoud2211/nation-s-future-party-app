import React, { useMemo, useState } from 'react';
import { FlatList, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Megaphone, Plus } from 'lucide-react-native';
import {
  AnnouncementCard,
  AppHeader,
  EmptyState,
  FilterChips,
  IconButton,
  LoadingState,
  ScreenContainer,
  SearchInput,
  useSimulatedLoading,
  type ChipOption,
} from '@/components';
import { ANNOUNCEMENT_CATEGORY } from '@/constants/labels';
import { useAppStore, useUser } from '@/store';
import { GUTTER, spacing } from '@/theme';
import type { AnnouncementCategory } from '@/types';
import { canPublishAnyAnnouncement, canSeeAnnouncement } from '@/utils/permissions';

type FilterKey = 'all' | 'unread' | AnnouncementCategory;

export default function AnnouncementsScreen() {
  const router = useRouter();
  const user = useUser();
  const announcements = useAppStore((s) => s.announcements);
  const loading = useSimulatedLoading();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<FilterKey>('all');

  const visibleAll = useMemo(
    () => announcements.filter((a) => canSeeAnnouncement(user, a.committeeId)).sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [announcements, user],
  );
  const unreadCount = visibleAll.filter((a) => !a.readBy.includes(user.id)).length;

  const visible = useMemo(() => {
    const q = query.trim();
    return visibleAll.filter((a) => {
      if (filter === 'unread' && a.readBy.includes(user.id)) return false;
      if (filter !== 'all' && filter !== 'unread' && a.category !== filter) return false;
      if (q && !a.title.includes(q) && !a.body.includes(q)) return false;
      return true;
    });
  }, [visibleAll, query, filter, user.id]);

  const options: ChipOption<FilterKey>[] = [
    { key: 'all', label: 'الكل', count: visibleAll.length },
    { key: 'unread', label: 'غير المقروءة', count: unreadCount },
    ...(Object.keys(ANNOUNCEMENT_CATEGORY) as AnnouncementCategory[]).map((k) => ({ key: k, label: ANNOUNCEMENT_CATEGORY[k] })),
  ];

  return (
    <ScreenContainer
      scroll={false}
      padded={false}
      header={
        <AppHeader
          title="الإعلانات"
          subtitle={unreadCount ? `${unreadCount} إعلانات غير مقروءة` : 'جميع الإعلانات مقروءة'}
          actions={
            canPublishAnyAnnouncement(user) ? (
              <IconButton icon={Plus} variant="glass" accessibilityLabel="إعلان جديد" onPress={() => router.push('/announcements/new')} />
            ) : undefined
          }
        />
      }
    >
      <FlatList
        data={loading ? [] : visible}
        keyExtractor={(a) => a.id}
        contentContainerStyle={{ padding: GUTTER, gap: spacing.md, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View style={{ gap: spacing.md }}>
            <SearchInput value={query} onChangeText={setQuery} placeholder="ابحث في الإعلانات…" />
            <FilterChips options={options} value={filter} onChange={setFilter} />
            {loading ? <LoadingState count={3} /> : null}
          </View>
        }
        ListEmptyComponent={loading ? undefined : <EmptyState icon={Megaphone} title={query ? 'لا توجد نتائج مطابقة' : 'لا توجد إعلانات'} message="ستظهر هنا إعلانات لجانك وإعلانات القطاع العامة." />}
        renderItem={({ item }) => <AnnouncementCard announcement={item} onPress={() => router.push(`/announcements/${item.id}`)} />}
      />
    </ScreenContainer>
  );
}
