import React, { useMemo, useState } from 'react';
import { FlatList, View } from 'react-native';
import { useRouter } from 'expo-router';
import { LayoutGrid } from 'lucide-react-native';
import {
  AppHeader,
  AppText,
  CommitteeCard,
  EmptyState,
  FilterChips,
  LoadingState,
  ScreenContainer,
  SearchInput,
  useSimulatedLoading,
} from '@/components';
import { useAppStore, useUser } from '@/store';
import { colors, GUTTER, spacing } from '@/theme';
import { isCommitteeMember, isLeadership } from '@/utils/permissions';

type Filter = 'all' | 'mine' | 'disabled';

/** "اللجان" — directory of the sector committees. */
export default function CommitteesScreen() {
  const router = useRouter();
  const user = useUser();
  const committees = useAppStore((s) => s.committees);
  const loading = useSimulatedLoading();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const leadership = isLeadership(user);

  // Leadership & admin also see disabled committees (with a badge).
  const visible = useMemo(() => committees.filter((c) => c.enabled || leadership), [committees, leadership]);

  const filtered = useMemo(() => {
    const q = query.trim();
    return visible
      .filter((c) => {
        if (filter === 'mine') return isCommitteeMember(user, c.id);
        if (filter === 'disabled') return !c.enabled;
        return true;
      })
      .filter((c) => !q || c.name.includes(q) || c.description.includes(q));
  }, [visible, filter, query, user]);

  const filterOptions = useMemo(() => {
    const opts: { key: Filter; label: string; count?: number }[] = [{ key: 'all', label: 'جميع اللجان', count: visible.length }];
    const mine = visible.filter((c) => isCommitteeMember(user, c.id)).length;
    if (mine > 0) opts.push({ key: 'mine', label: 'لجاني', count: mine });
    const disabled = visible.filter((c) => !c.enabled).length;
    if (leadership && disabled > 0) opts.push({ key: 'disabled', label: 'المعطلة', count: disabled });
    return opts;
  }, [visible, user, leadership]);

  const enabledCount = visible.filter((c) => c.enabled).length;

  return (
    <ScreenContainer
      scroll={false}
      padded={false}
      header={
        <AppHeader title="اللجان" subtitle={`${enabledCount} لجنة نوعية في أمانة قطاع الأعمال`} back={false}>
          <SearchInput value={query} onChangeText={setQuery} placeholder="ابحث باسم اللجنة أو مجال عملها…" />
        </AppHeader>
      }
    >
      <FlatList
        data={loading ? [] : filtered}
        keyExtractor={(c) => c.id}
        contentContainerStyle={{ padding: GUTTER, gap: spacing.md, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View style={{ gap: spacing.sm }}>
            {filterOptions.length > 1 ? <FilterChips options={filterOptions} value={filter} onChange={setFilter} /> : null}
            {!loading ? (
              <AppText variant="meta" color={colors.textSecondary}>
                {`عدد النتائج: ${filtered.length}`}
              </AppText>
            ) : null}
          </View>
        }
        renderItem={({ item }) => <CommitteeCard committee={item} onPress={() => router.push(`/committee/${item.id}`)} />}
        ListEmptyComponent={
          loading ? <LoadingState count={4} /> : <EmptyState icon={LayoutGrid} title="لا توجد لجان مطابقة" message="جرّب تعديل كلمات البحث أو التصفية." />
        }
      />
    </ScreenContainer>
  );
}
