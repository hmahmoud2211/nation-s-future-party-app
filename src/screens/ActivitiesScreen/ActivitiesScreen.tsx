import React, { useMemo, useState } from 'react';
import { FlatList, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Plus, Sparkles } from 'lucide-react-native';
import { FormSelect } from '@/components/forms/FormSelect';
import { AppHeader } from '@/components/layout/AppHeader';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { AppText } from '@/components/common/AppText';
import { FilterChips } from '@/components/ui/Chips';
import { IconButton } from '@/components/common/IconButton';
import { EmptyState, LoadingState, useSimulatedLoading } from '@/components/feedback/States';
import { ActivityCard } from '@/features/activities/components/ActivityCard';
import { useActivities } from '@/features/activities/hooks/useActivities';
import { ACTIVITY_STATUS } from '@/features/activities/services/labels';
import { useCanCreateIn } from '@/features/committees/hooks/useCommitteeScope';
import { useUser } from '@/features/auth/hooks/useSession';
import { useCommittee, useCommittees } from '@/features/committees/hooks/useCommittees';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { ActivityStatus } from '@/features/activities/types';
import { isCommitteeMember, isSectorWide } from '@/features/auth/services/permissions';
import { activitiesCopy as copy } from './ActivitiesScreen.data';
import { createStyles } from './ActivitiesScreen.styles';

type Filter = 'all' | ActivityStatus | 'registered';
/** 'all' = every committee the user can follow, 'mine' = their own committees, otherwise one committee id. */
type CommitteeFilter = 'all' | 'mine' | (string & {});

/** "الأنشطة والفعاليات" */
export function ActivitiesScreen() {
  const { committeeId } = useLocalSearchParams<{ committeeId?: string }>();
  const router = useRouter();
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const user = useUser();
  const committees = useCommittees();
  const activities = useActivities();
  const loading = useSimulatedLoading();
  const [filter, setFilter] = useState<Filter>('all');

  // Activities are public: everyone follows every committee's activities (managing stays per committee).
  const visibleIds = useMemo(() => committees.filter((c) => c.enabled || isCommitteeMember(user, c.id)).map((c) => c.id), [user, committees]);
  const ownIds = useMemo(
    () => visibleIds.filter((id) => user.committeeIds.includes(id) || user.managedCommitteeIds.includes(id)),
    [visibleIds, user.committeeIds, user.managedCommitteeIds],
  );
  const [committeeFilter, setCommitteeFilter] = useState<CommitteeFilter>(committeeId && visibleIds.includes(committeeId) ? committeeId : 'all');
  const scope = useMemo(
    () => (committeeFilter === 'all' ? visibleIds : committeeFilter === 'mine' ? ownIds : [committeeFilter]),
    [committeeFilter, visibleIds, ownIds],
  );
  const selectedCommitteeId = committeeFilter === 'all' || committeeFilter === 'mine' ? undefined : committeeFilter;
  const committee = useCommittee(selectedCommitteeId);
  const { canCreate, targetCommitteeId } = useCanCreateIn(selectedCommitteeId);
  const followsOthers = !isSectorWide(user) && scope.some((id) => !user.managedCommitteeIds.includes(id));
  const committeeOptions = useMemo(
    () => [
      { value: 'all', label: copy.allCommittees },
      ...(ownIds.length && ownIds.length < visibleIds.length ? [{ value: 'mine', label: copy.myCommitteesOnly }] : []),
      ...committees.filter((c) => visibleIds.includes(c.id)).map((c) => ({ value: c.id, label: c.name, description: user.managedCommitteeIds.includes(c.id) ? copy.yourCommittee : undefined })),
    ],
    [committees, visibleIds, ownIds, user],
  );

  const inScope = useMemo(() => {
    const list = activities.filter((a) => scope.includes(a.committeeId));
    // Upcoming/ongoing first (closest date), then completed (latest first).
    return list.sort((a, b) => {
      const ac = a.status === 'completed' ? 1 : 0;
      const bc = b.status === 'completed' ? 1 : 0;
      if (ac !== bc) return ac - bc;
      return ac ? b.date.localeCompare(a.date) : a.date.localeCompare(b.date);
    });
  }, [activities, scope]);

  const filtered = useMemo(
    () => inScope.filter((a) => (filter === 'all' ? true : filter === 'registered' ? a.registrations.includes(user.id) : a.status === filter)),
    [inScope, filter, user.id],
  );

  const options = useMemo(() => {
    const opts: { key: Filter; label: string; count: number }[] = [
      { key: 'all', label: copy.filterAll, count: inScope.length },
      ...(Object.keys(ACTIVITY_STATUS) as ActivityStatus[]).map((s) => ({ key: s as Filter, label: ACTIVITY_STATUS[s].label, count: inScope.filter((a) => a.status === s).length })),
    ];
    const mine = inScope.filter((a) => a.registrations.includes(user.id)).length;
    if (mine) opts.push({ key: 'registered', label: copy.filterRegistered, count: mine });
    return opts;
  }, [inScope, user.id]);

  const createHref = targetCommitteeId ? `/activities/new?committeeId=${targetCommitteeId}` : '/activities/new';

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
              : committeeFilter === 'mine'
                ? copy.subtitleMine
                : copy.subtitleAll
          }
          actions={canCreate ? <IconButton icon={Plus} variant="accent" accessibilityLabel={copy.newActivity} onPress={() => router.push(createHref)} /> : undefined}
        />
      }
    >
      <FlatList
        data={loading ? [] : filtered}
        keyExtractor={(a) => a.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.listHeader}>
            {visibleIds.length > 1 ? (
              <FormSelect
                options={committeeOptions}
                value={committeeFilter}
                onChange={(v) => setCommitteeFilter(v ?? 'all')}
                placeholder={copy.allCommittees}
                title={copy.filterByCommittee}
              />
            ) : null}
            <FilterChips options={options} value={filter} onChange={setFilter} />
            {!loading ? (
              <AppText variant="meta" color={theme.colors.textSecondary}>
                {copy.countSummary(filtered.length, followsOthers)}
              </AppText>
            ) : null}
          </View>
        }
        renderItem={({ item }) => <ActivityCard activity={item} onPress={() => router.push(`/activities/${item.id}`)} />}
        ListEmptyComponent={
          loading ? (
            <LoadingState />
          ) : (
            <EmptyState
              icon={Sparkles}
              title={copy.empty}
              actionLabel={canCreate ? copy.newActivity : undefined}
              onAction={canCreate ? () => router.push(createHref) : undefined}
            />
          )
        }
      />
    </ScreenContainer>
  );
}
