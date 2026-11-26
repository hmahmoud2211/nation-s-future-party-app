import React, { useMemo, useState } from 'react';
import { FlatList, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { UserPlus, Users } from 'lucide-react-native';
import { FormSelect } from '@/components/forms/FormSelect';
import { AppHeader } from '@/components/layout/AppHeader';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { AppText } from '@/components/common/AppText';
import { type ChipOption, FilterChips } from '@/components/ui/Chips';
import { IconButton } from '@/components/common/IconButton';
import { SearchInput } from '@/components/forms/SearchInput';
import { EmptyState, LoadingState, useSimulatedLoading } from '@/components/feedback/States';
import { MemberCard } from '@/features/members/components/MemberCard';
import { ROLE_LABELS } from '@/features/members/services/labels';
import { useUser } from '@/features/auth/hooks/useSession';
import { useCommittees } from '@/features/committees/hooks/useCommittees';
import { useMembers } from '@/features/members/hooks/useMembers';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { MembershipStatus, Role } from '@/features/members/types';
import { isAdmin, scopeCommitteeIds } from '@/features/auth/services/permissions';
import { ROLE_ORDER } from '@/features/auth/services/roles';
import { createStyles } from './MembersScreen.styles';
import { membersCopy as copy, ROLE_FILTERS } from './MembersScreen.data';

type StatusFilter = 'all' | MembershipStatus;
type RoleFilter = 'all' | Role;

export function MembersScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ committeeId?: string }>();
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const user = useUser();
  const members = useMembers();
  const committees = useCommittees();
  const loading = useSimulatedLoading();
  const admin = isAdmin(user);

  const scopeIds = useMemo(() => {
    const ids = scopeCommitteeIds(user, committees);
    return ids.length ? ids : user.committeeIds;
  }, [user, committees]);
  const scopeCommittees = useMemo(() => committees.filter((c) => scopeIds.includes(c.id)), [committees, scopeIds]);

  const initialCommittee = params.committeeId && scopeIds.includes(params.committeeId) ? params.committeeId : 'all';
  const [committeeId, setCommitteeId] = useState<string>(initialCommittee);
  const [status, setStatus] = useState<StatusFilter>('all');
  const [role, setRole] = useState<RoleFilter>('all');
  const [query, setQuery] = useState('');

  const base = useMemo(() => {
    const ids = committeeId === 'all' ? scopeIds : [committeeId];
    return members
      .filter((m) => m.id !== user.id)
      .filter((m) => {
        if (admin && committeeId === 'all') return true;
        // Includes co-officials: a committee can be run by several people.
        return m.committeeIds.some((c) => ids.includes(c)) || m.managedCommitteeIds.some((c) => ids.includes(c));
      })
      .sort((a, b) => ROLE_ORDER.indexOf(a.role) - ROLE_ORDER.indexOf(b.role) || a.name.localeCompare(b.name, 'ar'));
  }, [members, scopeIds, committeeId, user, admin]);

  const filtered = useMemo(() => {
    const q = query.trim();
    return base.filter((m) => (status === 'all' || m.status === status) && (role === 'all' || m.role === role) && (!q || m.name.includes(q) || m.title.includes(q)));
  }, [base, status, role, query]);

  const statusCount = (s: MembershipStatus) => base.filter((m) => m.status === s).length;
  const statusOptions: ChipOption<StatusFilter>[] = [
    { key: 'all', label: copy.statusAll, count: base.length },
    { key: 'active', label: copy.statusActive, count: statusCount('active') },
    { key: 'inactive', label: copy.statusInactive, count: statusCount('inactive') },
    { key: 'suspended', label: copy.statusSuspended, count: statusCount('suspended') },
  ];
  const roleOptions: ChipOption<RoleFilter>[] = [
    { key: 'all', label: copy.allRoles },
    ...ROLE_FILTERS.map((r) => ({ key: r, label: ROLE_LABELS[r], count: base.filter((m) => m.role === r).length })).filter((o) => o.count > 0),
  ];

  const title = admin ? copy.adminTitle : copy.committeeTitle;
  const subtitle = admin
    ? copy.adminSubtitle
    : scopeCommittees.length === 1
      ? scopeCommittees[0].name
      : copy.scopeSubtitle(scopeCommittees.length);

  return (
    <ScreenContainer
      scroll={false}
      padded={false}
      header={
        <AppHeader
          title={title}
          subtitle={subtitle}
          actions={admin ? <IconButton icon={UserPlus} variant="accent" accessibilityLabel={copy.addMember} onPress={() => router.push('/members/new')} /> : undefined}
        />
      }
    >
      <FlatList
        data={loading ? [] : filtered}
        keyExtractor={(m) => m.id}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.listHeader}>
            <SearchInput value={query} onChangeText={setQuery} placeholder={copy.searchPlaceholder} />
            {scopeCommittees.length > 1 && scopeCommittees.length <= 3 ? (
              <FilterChips
                options={[{ key: 'all', label: copy.allCommittees }, ...scopeCommittees.map((c) => ({ key: c.id, label: c.shortName }))]}
                value={committeeId}
                onChange={setCommitteeId}
              />
            ) : null}
            {scopeCommittees.length > 3 ? (
              <FormSelect
                options={[{ value: 'all', label: copy.allCommittees }, ...scopeCommittees.map((c) => ({ value: c.id, label: c.name }))]}
                value={committeeId}
                onChange={(v) => setCommitteeId(v ?? 'all')}
                placeholder={copy.allCommittees}
                title={copy.filterByCommittee}
              />
            ) : null}
            {admin ? <FilterChips options={roleOptions} value={role} onChange={setRole} /> : null}
            <FilterChips options={statusOptions} value={status} onChange={setStatus} />
            {!loading ? (
              <AppText variant="meta" color={theme.colors.textSecondary}>
                {copy.resultsCount(filtered.length)}
              </AppText>
            ) : null}
            {loading ? <LoadingState count={4} /> : null}
          </View>
        }
        renderItem={({ item }) => <MemberCard member={item} onPress={() => router.push(`/members/${item.id}`)} />}
        ListEmptyComponent={
          loading ? undefined : (
            <EmptyState icon={Users} title={query ? copy.noMatches : copy.noMembers} message={copy.emptyMessage} />
          )
        }
      />
    </ScreenContainer>
  );
}
