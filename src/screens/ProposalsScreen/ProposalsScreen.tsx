import React, { useMemo, useState } from 'react';
import { FlatList, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Lightbulb, Plus } from 'lucide-react-native';
import { AppText } from '@/components/common/AppText';
import { IconButton } from '@/components/common/IconButton';
import { EmptyState, LoadingState, useSimulatedLoading } from '@/components/feedback/States';
import { FormSelect } from '@/components/forms/FormSelect';
import { SearchInput } from '@/components/forms/SearchInput';
import { AppHeader } from '@/components/layout/AppHeader';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { useTabBarInset } from '@/components/layout/TabBarInset';
import { FilterChips } from '@/components/ui/Chips';
import { useUser } from '@/features/auth/hooks/useSession';
import { can, canSubmitAnyProposal, canViewProposal, relevantCommitteeIds } from '@/features/auth/services/permissions';
import { useCommittees } from '@/features/committees/hooks/useCommittees';
import { ProposalCard } from '@/features/proposals/components/ProposalCard';
import { useProposals } from '@/features/proposals/hooks/useProposals';
import { PROPOSAL_STATUS } from '@/features/proposals/services/labels';
import type { ProposalStatus } from '@/features/proposals/types';
import { useAppTheme } from '@/hooks/useAppTheme';
import { proposalsCopy as copy } from './ProposalsScreen.data';
import { createStyles } from './ProposalsScreen.styles';

type StatusFilter = 'all' | ProposalStatus;

/** «المقترحات» — browse proposals (by permission) and submit new ones. */
export function ProposalsScreen() {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const tabInset = useTabBarInset();
  const router = useRouter();
  const user = useUser();
  const proposals = useProposals();
  const committees = useCommittees();
  const loading = useSimulatedLoading();
  const mineIds = useMemo(() => relevantCommitteeIds(user), [user]);
  const [scope, setScope] = useState<string>(mineIds.length && !can(user, 'proposals.viewAll') ? 'mine' : 'all');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [query, setQuery] = useState('');

  const visible = useMemo(() => proposals.filter((p) => canViewProposal(user, p)), [proposals, user]);
  const scoped = useMemo(() => {
    if (scope === 'all') return visible;
    if (scope === 'mine') return visible.filter((p) => mineIds.includes(p.committeeId) || p.createdBy === user.id);
    return visible.filter((p) => p.committeeId === scope);
  }, [visible, scope, user.id, mineIds]);
  const filtered = useMemo(() => {
    const q = query.trim();
    return scoped
      .filter((p) => (status === 'all' || p.status === status) && (!q || p.title.includes(q) || p.description.includes(q)))
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }, [scoped, status, query]);

  const statusOptions = [
    { key: 'all' as StatusFilter, label: copy.statusAll, count: scoped.length },
    ...(Object.keys(PROPOSAL_STATUS) as ProposalStatus[])
      .map((s) => ({ key: s as StatusFilter, label: PROPOSAL_STATUS[s].label, count: scoped.filter((p) => p.status === s).length }))
      .filter((o) => o.count > 0),
  ];
  const committeeIds = Array.from(new Set(visible.map((p) => p.committeeId)));
  const scopeOptions = [
    { value: 'all', label: can(user, 'proposals.viewAll') ? copy.scopeAllCommittees : copy.scopeAllAvailable },
    ...(mineIds.length ? [{ value: 'mine', label: copy.scopeMine }] : []),
    ...committees.filter((c) => committeeIds.includes(c.id)).map((c) => ({ value: c.id, label: c.name })),
  ];
  const canSubmit = canSubmitAnyProposal(user);

  return (
    <ScreenContainer
      scroll={false}
      padded={false}
      header={
        <AppHeader
          title={copy.title}
          subtitle={can(user, 'proposals.viewAll') ? copy.subtitleAll : copy.subtitleScoped}
          back={false}
          actions={canSubmit ? <IconButton icon={Plus} variant="accent" accessibilityLabel={copy.submitProposal} onPress={() => router.push('/proposals/new')} /> : undefined}
        />
      }
    >
      <FlatList
        data={loading ? [] : filtered}
        keyExtractor={(p) => p.id}
        contentContainerStyle={[styles.listContent, { paddingBottom: theme.spacing.xxxl + tabInset }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.listHeader}>
            <SearchInput value={query} onChangeText={setQuery} placeholder={copy.searchPlaceholder} />
            {scopeOptions.length > 2 ? <FormSelect options={scopeOptions} value={scope} onChange={(v) => setScope(v ?? 'all')} title={copy.scopeTitle} /> : null}
            <FilterChips options={statusOptions} value={status} onChange={setStatus} />
            {!loading ? (
              <AppText variant="meta" color={theme.colors.textSecondary}>
                {copy.proposalsCount(filtered.length)}
              </AppText>
            ) : null}
          </View>
        }
        renderItem={({ item }) => <ProposalCard proposal={item} onPress={() => router.push(`/proposals/${item.id}`)} />}
        ListEmptyComponent={
          loading ? (
            <LoadingState />
          ) : (
            <EmptyState
              icon={Lightbulb}
              title={copy.emptyTitle}
              actionLabel={canSubmit ? copy.submitProposal : undefined}
              onAction={canSubmit ? () => router.push('/proposals/new') : undefined}
            />
          )
        }
      />
    </ScreenContainer>
  );
}
