import React, { useMemo, useState } from 'react';
import { FlatList, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { CalendarDays, Plus } from 'lucide-react-native';
import {
  AppHeader,
  AppText,
  EmptyState,
  IconButton,
  LoadingState,
  MeetingCard,
  ScreenContainer,
  SegmentedTabs,
  useSimulatedLoading,
} from '@/components';
import { isUpcomingMeeting, useAppStore, useCommittee, useUser } from '@/store';
import { colors, GUTTER, spacing } from '@/theme';
import { canCreateMeeting, canViewMeeting } from '@/utils/permissions';

type Tab = 'upcoming' | 'past';

/** «الاجتماعات» — meetings the user can see (all of them for الأمين), live ones first. */
export default function MeetingsScreen() {
  const { committeeId } = useLocalSearchParams<{ committeeId?: string }>();
  const router = useRouter();
  const user = useUser();
  const committee = useCommittee(committeeId);
  const meetings = useAppStore((s) => s.meetings);
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
          title="الاجتماعات"
          subtitle={
            committee
              ? committee.name
              : live
                ? `${live} اجتماع جارٍ الآن`
                : pendingRsvp
                  ? `لديك ${pendingRsvp} دعوات بانتظار تأكيد الحضور`
                  : 'اجتماعاتك القادمة والسابقة'
          }
          back={!!committeeId}
          actions={canCreate ? <IconButton icon={Plus} variant="gold" accessibilityLabel="اجتماع جديد" onPress={() => router.push(createHref)} /> : undefined}
        />
      }
    >
      <FlatList
        data={loading ? [] : data}
        keyExtractor={(m) => m.id}
        contentContainerStyle={{ padding: GUTTER, gap: spacing.sm, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={{ gap: spacing.sm }}>
            <SegmentedTabs
              options={[
                { key: 'upcoming' as Tab, label: 'القادمة', count: upcoming.length },
                { key: 'past' as Tab, label: 'السابقة', count: past.length },
              ]}
              value={tab}
              onChange={setTab}
            />
            {!loading && data.length ? (
              <AppText variant="meta" color={colors.textSecondary}>
                {tab === 'upcoming' ? 'مرتبة حسب الأقرب موعداً' : 'مرتبة من الأحدث إلى الأقدم'}
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
              title={tab === 'upcoming' ? 'لا توجد اجتماعات قادمة' : 'لا توجد اجتماعات سابقة'}
              actionLabel={canCreate && tab === 'upcoming' ? 'إضافة اجتماع' : undefined}
              onAction={canCreate && tab === 'upcoming' ? () => router.push(createHref) : undefined}
            />
          )
        }
      />
    </ScreenContainer>
  );
}
