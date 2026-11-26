import React, { useMemo, useState } from 'react';
import { FlatList, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { CalendarDays, Plus } from 'lucide-react-native';
import { AppText } from '@/components/common/AppText';
import { IconButton } from '@/components/common/IconButton';
import { EmptyState, LoadingState, useSimulatedLoading } from '@/components/feedback/States';
import { AppHeader } from '@/components/layout/AppHeader';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { useTabBarInset } from '@/components/layout/TabBarInset';
import { SegmentedTabs } from '@/components/ui/Chips';
import { useUser } from '@/features/auth/hooks/useSession';
import { canCreateMeeting, canViewMeeting } from '@/features/auth/services/permissions';
import { useCommittee } from '@/features/committees/hooks/useCommittees';
import { MeetingCard } from '@/features/meetings/components/MeetingCard';
import { useMeetings } from '@/features/meetings/hooks/useMeetings';
import { isUpcomingMeeting } from '@/features/meetings/services/meetingRules';
import { useAppTheme } from '@/hooks/useAppTheme';
import { meetingsCopy as copy } from './MeetingsScreen.data';
import { createStyles } from './MeetingsScreen.styles';

type Tab = 'upcoming' | 'past';

/** «الاجتماعات» — meetings the user can see (all of them for الأمين), live ones first. */
export function MeetingsScreen() {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const tabInset = useTabBarInset();
  const { committeeId } = useLocalSearchParams<{ committeeId?: string }>();
  const router = useRouter();
  const user = useUser();
  const committee = useCommittee(committeeId);
  const meetings = useMeetings();
  const loading = useSimulatedLoading();
  const [tab, setTab] = useState<Tab>('upcoming');
  const canCreate = canCreateMeeting(user);

  const { upcoming, past } = useMemo(() => {
    const list = meetings.filter((m) => canViewMeeting(user, m) && (!committeeId || m.committeeId === committeeId));
    return {
      upcoming: list
        .filter((m) => isUpcomingMeeting(m))
        .sort((a, b) => (a.status === 'live' ? -1 : b.status === 'live' ? 1 : a.date.localeCompare(b.date))),
      past: list.filter((m) => !isUpcomingMeeting(m)).sort((a, b) => b.date.localeCompare(a.date)),
    };
  }, [meetings, user, committeeId]);

  const data = tab === 'upcoming' ? upcoming : past;
  const live = upcoming.filter((m) => m.status === 'live').length;
  const pendingRsvp = upcoming.filter((m) => m.rsvps[user.id] === 'pending').length;
  const createHref = committeeId ? `/meetings/new?committeeId=${committeeId}` : '/meetings/new';

  return (
    <ScreenContainer
      scroll={false}
      padded={false}
      header={
        <AppHeader
          title={copy.title}
          subtitle={
            committee
              ? committee.name
              : live
                ? copy.liveNow(live)
                : pendingRsvp
                  ? copy.pendingRsvp(pendingRsvp)
                  : copy.defaultSubtitle
          }
          back={!!committeeId}
          actions={canCreate ? <IconButton icon={Plus} variant="accent" accessibilityLabel={copy.newMeeting} onPress={() => router.push(createHref)} /> : undefined}
        />
      }
    >
      <FlatList
        data={loading ? [] : data}
        keyExtractor={(m) => m.id}
        contentContainerStyle={[styles.listContent, { paddingBottom: theme.spacing.xxxl + tabInset }]}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.listHeader}>
            <SegmentedTabs
              options={[
                { key: 'upcoming' as Tab, label: copy.tabUpcoming, count: upcoming.length },
                { key: 'past' as Tab, label: copy.tabPast, count: past.length },
              ]}
              value={tab}
              onChange={setTab}
            />
            {!loading && data.length ? (
              <AppText variant="meta" color={theme.colors.textSecondary}>
                {tab === 'upcoming' ? copy.sortedUpcoming : copy.sortedPast}
              </AppText>
            ) : null}
          </View>
        }
        renderItem={({ item }) => <MeetingCard meeting={item} onPress={() => router.push(`/meetings/${item.id}`)} />}
        ListEmptyComponent={
          loading ? (
            <LoadingState />
          ) : (
            <EmptyState
              icon={CalendarDays}
              title={tab === 'upcoming' ? copy.emptyUpcoming : copy.emptyPast}
              actionLabel={canCreate && tab === 'upcoming' ? copy.addMeeting : undefined}
              onAction={canCreate && tab === 'upcoming' ? () => router.push(createHref) : undefined}
            />
          )
        }
      />
    </ScreenContainer>
  );
}
