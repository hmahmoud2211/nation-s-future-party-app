import React, { useMemo, useState } from 'react';
import { FlatList, View } from 'react-native';
import { useRouter } from 'expo-router';
import { LayoutGrid } from 'lucide-react-native';
import { AppText } from '@/components/common/AppText';
import { EmptyState, LoadingState, useSimulatedLoading } from '@/components/feedback/States';
import { SearchInput } from '@/components/forms/SearchInput';
import { AppHeader } from '@/components/layout/AppHeader';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { useTabBarInset } from '@/components/layout/TabBarInset';
import { FilterChips } from '@/components/ui/Chips';
import { useUser } from '@/features/auth/hooks/useSession';
import { isCommitteeMember, isLeadership } from '@/features/auth/services/permissions';
import { CommitteeCard } from '@/features/committees/components/CommitteeCard';
import { useCommittees } from '@/features/committees/hooks/useCommittees';
import { useAppTheme } from '@/hooks/useAppTheme';
import { committeesCopy as copy } from './CommitteesScreen.data';
import { createStyles } from './CommitteesScreen.styles';

type Filter = 'all' | 'mine' | 'disabled';

/** "اللجان" — directory of the sector committees. */
export function CommitteesScreen() {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const tabInset = useTabBarInset();
  const router = useRouter();
  const user = useUser();
  const committees = useCommittees();
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
    const opts: { key: Filter; label: string; count?: number }[] = [{ key: 'all', label: copy.filterAll, count: visible.length }];
    const mine = visible.filter((c) => isCommitteeMember(user, c.id)).length;
    if (mine > 0) opts.push({ key: 'mine', label: copy.filterMine, count: mine });
    const disabled = visible.filter((c) => !c.enabled).length;
    if (leadership && disabled > 0) opts.push({ key: 'disabled', label: copy.filterDisabled, count: disabled });
    return opts;
  }, [visible, user, leadership]);

  const enabledCount = visible.filter((c) => c.enabled).length;

  return (
    <ScreenContainer
      scroll={false}
      padded={false}
      header={
        <AppHeader title={copy.title} subtitle={copy.subtitle(enabledCount)} back={false}>
          <SearchInput value={query} onChangeText={setQuery} placeholder={copy.searchPlaceholder} />
        </AppHeader>
      }
    >
      <FlatList
        data={loading ? [] : filtered}
        keyExtractor={(c) => c.id}
        contentContainerStyle={[styles.listContent, { paddingBottom: theme.spacing.xxxl + tabInset }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View style={styles.listHeader}>
            {filterOptions.length > 1 ? <FilterChips options={filterOptions} value={filter} onChange={setFilter} /> : null}
            {!loading ? (
              <AppText variant="meta" color={theme.colors.textSecondary}>
                {copy.resultsCount(filtered.length)}
              </AppText>
            ) : null}
          </View>
        }
        renderItem={({ item }) => <CommitteeCard committee={item} onPress={() => router.push(`/committee/${item.id}`)} />}
        ListEmptyComponent={
          loading ? <LoadingState count={4} /> : <EmptyState icon={LayoutGrid} title={copy.emptyTitle} message={copy.emptyMessage} />
        }
      />
    </ScreenContainer>
  );
}
