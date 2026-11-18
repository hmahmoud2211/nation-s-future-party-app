import React, { useMemo, useState } from 'react';
import { FlatList, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Plus, Sparkles } from 'lucide-react-native';
import {
  ActivityCard,
  AppHeader,
  AppText,
  EmptyState,
  FilterChips,
  FormSelect,
  IconButton,
  LoadingState,
  ScreenContainer,
  useSimulatedLoading,
} from '@/components';
import { ACTIVITY_STATUS } from '@/constants/labels';
import { useCanCreateIn } from '@/features/committees/shared';
import { useAppStore, useCommittee, useUser } from '@/store';
import { colors, GUTTER, spacing } from '@/theme';
import type { ActivityStatus } from '@/types';
import { isCommitteeMember, isSectorWide } from '@/utils/permissions';

type Filter = 'all' | ActivityStatus | 'registered';
/** 'all' = every committee the user can follow, 'mine' = their own committees, otherwise one committee id. */
type CommitteeFilter = 'all' | 'mine' | (string & {});

/** "الأنشطة والفعاليات" */
export default function ActivitiesScreen() {
  const { committeeId } = useLocalSearchParams<{ committeeId?: string }>();
  const router = useRouter();
  const user = useUser();
  const committees = useAppStore((s) => s.committees);
  const activities = useAppStore((s) => s.activities);
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
      { value: 'all', label: 'كل اللجان' },
      ...(ownIds.length && ownIds.length < visibleIds.length ? [{ value: 'mine', label: 'لجاني فقط' }] : []),
      ...committees.filter((c) => visibleIds.includes(c.id)).map((c) => ({ value: c.id, label: c.name, description: user.managedCommitteeIds.includes(c.id) ? 'لجنتك' : undefined })),
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
      { key: 'all', label: 'الكل', count: inScope.length },
      ...(Object.keys(ACTIVITY_STATUS) as ActivityStatus[]).map((s) => ({ key: s as Filter, label: ACTIVITY_STATUS[s].label, count: inScope.filter((a) => a.status === s).length })),
    ];
    const mine = inScope.filter((a) => a.registrations.includes(user.id)).length;
    if (mine) opts.push({ key: 'registered', label: 'المسجل بها', count: mine });
    return opts;
  }, [inScope, user.id]);

  const createHref = targetCommitteeId ? `/activities/new?committeeId=${targetCommitteeId}` : '/activities/new';

  return (
    <ScreenContainer
      scroll={false}
      padded={false}
      header={
        <AppHeader
          title="الأنشطة والفعاليات"
          subtitle={
            committee
              ? committee.name
              : committeeFilter === 'mine'
                ? 'ورش وندوات ومبادرات لجانك'
                : 'أنشطة جميع لجان الأمانة'
          }
          actions={canCreate ? <IconButton icon={Plus} variant="gold" accessibilityLabel="نشاط جديد" onPress={() => router.push(createHref)} /> : undefined}
        />
      }
    >
      <FlatList
        data={loading ? [] : filtered}
        keyExtractor={(a) => a.id}
        contentContainerStyle={{ padding: GUTTER, gap: spacing.md, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={{ gap: spacing.sm }}>
            {visibleIds.length > 1 ? (
              <FormSelect
                options={committeeOptions}
                value={committeeFilter}
                onChange={(v) => setCommitteeFilter(v ?? 'all')}
                placeholder="كل اللجان"
                title="تصفية حسب اللجنة"
              />
            ) : null}
            <FilterChips options={options} value={filter} onChange={setFilter} />
            {!loading ? (
              <AppText variant="meta" color={colors.textSecondary}>
                {`عدد الأنشطة: ${filtered.length}${followsOthers ? ' • أنشطة اللجان الأخرى للاطلاع فقط' : ''}`}
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
              title="لا توجد أنشطة مطابقة"
              actionLabel={canCreate ? 'نشاط جديد' : undefined}
              onAction={canCreate ? () => router.push(createHref) : undefined}
            />
          )
        }
      />
    </ScreenContainer>
  );
}
