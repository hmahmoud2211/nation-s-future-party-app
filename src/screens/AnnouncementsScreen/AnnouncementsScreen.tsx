import React, { useMemo, useState } from 'react';
import { FlatList, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Megaphone, Plus } from 'lucide-react-native';
import { IconButton } from '@/components/common/IconButton';
import { EmptyState, LoadingState, useSimulatedLoading } from '@/components/feedback/States';
import { SearchInput } from '@/components/forms/SearchInput';
import { AppHeader } from '@/components/layout/AppHeader';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { type ChipOption, FilterChips } from '@/components/ui/Chips';
import { AnnouncementCard } from '@/features/announcements/components/AnnouncementCard';
import { useAnnouncements } from '@/features/announcements/hooks/useAnnouncements';
import { ANNOUNCEMENT_CATEGORY } from '@/features/announcements/services/labels';
import type { AnnouncementCategory } from '@/features/announcements/types';
import { useUser } from '@/features/auth/hooks/useSession';
import { canPublishAnyAnnouncement, canSeeAnnouncement } from '@/features/auth/services/permissions';
import { useAppTheme } from '@/hooks/useAppTheme';
import { announcementsCopy as copy } from './AnnouncementsScreen.data';
import { createStyles } from './AnnouncementsScreen.styles';

type FilterKey = 'all' | 'unread' | AnnouncementCategory;

export function AnnouncementsScreen() {
  const router = useRouter();
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const user = useUser();
  const announcements = useAnnouncements();
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
    { key: 'all', label: copy.filterAll, count: visibleAll.length },
    { key: 'unread', label: copy.filterUnread, count: unreadCount },
    ...(Object.keys(ANNOUNCEMENT_CATEGORY) as AnnouncementCategory[]).map((k) => ({ key: k, label: ANNOUNCEMENT_CATEGORY[k] })),
  ];

  return (
    <ScreenContainer
      scroll={false}
      padded={false}
      header={
        <AppHeader
          title={copy.title}
          subtitle={unreadCount ? copy.unreadSubtitle(unreadCount) : copy.allReadSubtitle}
          actions={
            canPublishAnyAnnouncement(user) ? (
              <IconButton icon={Plus} variant="glass" accessibilityLabel={copy.newAnnouncementA11y} onPress={() => router.push('/announcements/new')} />
            ) : undefined
          }
        />
      }
    >
      <FlatList
        data={loading ? [] : visible}
        keyExtractor={(a) => a.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View style={styles.listHeader}>
            <SearchInput value={query} onChangeText={setQuery} placeholder={copy.searchPlaceholder} />
            <FilterChips options={options} value={filter} onChange={setFilter} />
            {loading ? <LoadingState count={3} /> : null}
          </View>
        }
        ListEmptyComponent={loading ? undefined : <EmptyState icon={Megaphone} title={query ? copy.noResults : copy.empty} message={copy.emptyMessage} />}
        renderItem={({ item }) => <AnnouncementCard announcement={item} onPress={() => router.push(`/announcements/${item.id}`)} />}
      />
    </ScreenContainer>
  );
}
