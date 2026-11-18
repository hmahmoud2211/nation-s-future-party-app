import React, { useMemo, useState } from 'react';
import { FlatList, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Lightbulb, Plus } from 'lucide-react-native';
import {
  AppHeader,
  AppText,
  EmptyState,
  FilterChips,
  FormSelect,
  IconButton,
  LoadingState,
  ProposalCard,
  ScreenContainer,
  SearchInput,
  useSimulatedLoading,
} from '@/components';
import { PROPOSAL_STATUS } from '@/constants/labels';
import { useAppStore, useUser } from '@/store';
import { colors, GUTTER, spacing } from '@/theme';
import type { ProposalStatus } from '@/types';
import { can, canSubmitAnyProposal, canViewProposal, relevantCommitteeIds } from '@/utils/permissions';

type StatusFilter = 'all' | ProposalStatus;

/** «المقترحات» — browse proposals (by permission) and submit new ones. */
export default function ProposalsTab() {
  const router = useRouter();
  const user = useUser();
  const proposals = useAppStore((s) => s.proposals);
  const committees = useAppStore((s) => s.committees);
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
    { key: 'all' as StatusFilter, label: 'الكل', count: scoped.length },
    ...(Object.keys(PROPOSAL_STATUS) as ProposalStatus[])
      .map((s) => ({ key: s as StatusFilter, label: PROPOSAL_STATUS[s].label, count: scoped.filter((p) => p.status === s).length }))
      .filter((o) => o.count > 0),
  ];
  const committeeIds = Array.from(new Set(visible.map((p) => p.committeeId)));
  const scopeOptions = [
    { value: 'all', label: can(user, 'proposals.viewAll') ? 'كل اللجان' : 'كل المقترحات المتاحة' },
    ...(mineIds.length ? [{ value: 'mine', label: 'لجاني' }] : []),
    ...committees.filter((c) => committeeIds.includes(c.id)).map((c) => ({ value: c.id, label: c.name })),
  ];
  const canSubmit = canSubmitAnyProposal(user);

  return (
    <ScreenContainer
      scroll={false}
      padded={false}
      header={
        <AppHeader
          title="المقترحات"
          subtitle={can(user, 'proposals.viewAll') ? 'مقترحات جميع اللجان ومتابعة حالتها' : 'مقترحات لجانك ومنجزات اللجان الأخرى'}
          back={false}
          actions={canSubmit ? <IconButton icon={Plus} variant="gold" accessibilityLabel="تقديم مقترح" onPress={() => router.push('/proposals/new')} /> : undefined}
        />
      }
    >
      <FlatList
        data={loading ? [] : filtered}
        keyExtractor={(p) => p.id}
        contentContainerStyle={{ padding: GUTTER, gap: spacing.sm, paddingBottom: 32 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={{ gap: spacing.sm, marginBottom: spacing.xs }}>
            <SearchInput value={query} onChangeText={setQuery} placeholder="ابحث في المقترحات…" />
            {scopeOptions.length > 2 ? <FormSelect options={scopeOptions} value={scope} onChange={(v) => setScope(v ?? 'all')} title="تصفية حسب اللجنة" /> : null}
            <FilterChips options={statusOptions} value={status} onChange={setStatus} />
            {!loading ? (
              <AppText variant="meta" color={colors.textSecondary}>
                {`عدد المقترحات: ${filtered.length}`}
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
              title="لا توجد مقترحات مطابقة"
              actionLabel={canSubmit ? 'تقديم مقترح' : undefined}
              onAction={canSubmit ? () => router.push('/proposals/new') : undefined}
            />
          )
        }
      />
    </ScreenContainer>
  );
}
