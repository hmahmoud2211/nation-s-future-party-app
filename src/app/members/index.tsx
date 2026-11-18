import React, { useMemo, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { UserPlus, Users } from 'lucide-react-native';
import {
  AppHeader,
  AppText,
  EmptyState,
  FilterChips,
  FormSelect,
  IconButton,
  LoadingState,
  MemberCard,
  ScreenContainer,
  SearchInput,
  useSimulatedLoading,
  type ChipOption,
} from '@/components';
import { ROLE_LABELS } from '@/constants/labels';
import { useAppStore, useUser } from '@/store';
import { colors, GUTTER, spacing } from '@/theme';
import type { MembershipStatus, Role } from '@/types';
import { isAdmin, scopeCommitteeIds } from '@/utils/permissions';
import { ROLE_ORDER } from '@/utils/roles';

type StatusFilter = 'all' | MembershipStatus;
type RoleFilter = 'all' | Role;

/** Order of the role filter chips (lowest first). */
const ROLE_FILTERS: Role[] = ['member', 'board_member', 'assistant_secretary', 'sector_secretary', 'admin'];

export default function MembersScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ committeeId?: string }>();
  const user = useUser();
  const members = useAppStore((s) => s.members);
  const committees = useAppStore((s) => s.committees);
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
    { key: 'all', label: 'الكل', count: base.length },
    { key: 'active', label: 'سارية', count: statusCount('active') },
    { key: 'inactive', label: 'غير نشط', count: statusCount('inactive') },
    { key: 'suspended', label: 'موقوفة', count: statusCount('suspended') },
  ];
  const roleOptions: ChipOption<RoleFilter>[] = [
    { key: 'all', label: 'كل الأدوار' },
    ...ROLE_FILTERS.map((r) => ({ key: r, label: ROLE_LABELS[r], count: base.filter((m) => m.role === r).length })).filter((o) => o.count > 0),
  ];

  const title = admin ? 'إدارة الأعضاء' : 'أعضاء اللجنة';
  const subtitle = admin
    ? 'جميع الأعضاء التجريبيين في القطاع'
    : scopeCommittees.length === 1
      ? scopeCommittees[0].name
      : `${scopeCommittees.length} لجان ضمن نطاقك`;

  return (
    <ScreenContainer
      scroll={false}
      padded={false}
      header={
        <AppHeader
          title={title}
          subtitle={subtitle}
          actions={admin ? <IconButton icon={UserPlus} variant="gold" accessibilityLabel="إضافة عضو" onPress={() => router.push('/members/new')} /> : undefined}
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
          <View style={{ gap: spacing.md }}>
            <SearchInput value={query} onChangeText={setQuery} placeholder="ابحث باسم العضو…" />
            {scopeCommittees.length > 1 && scopeCommittees.length <= 3 ? (
              <FilterChips
                options={[{ key: 'all', label: 'كل اللجان' }, ...scopeCommittees.map((c) => ({ key: c.id, label: c.shortName }))]}
                value={committeeId}
                onChange={setCommitteeId}
              />
            ) : null}
            {scopeCommittees.length > 3 ? (
              <FormSelect
                options={[{ value: 'all', label: 'كل اللجان' }, ...scopeCommittees.map((c) => ({ value: c.id, label: c.name }))]}
                value={committeeId}
                onChange={(v) => setCommitteeId(v ?? 'all')}
                placeholder="كل اللجان"
                title="تصفية حسب اللجنة"
              />
            ) : null}
            {admin ? <FilterChips options={roleOptions} value={role} onChange={setRole} /> : null}
            <FilterChips options={statusOptions} value={status} onChange={setStatus} />
            {!loading ? (
              <AppText variant="meta" color={colors.textSecondary}>
                {`عدد النتائج: ${filtered.length}`}
              </AppText>
            ) : null}
            {loading ? <LoadingState count={4} /> : null}
          </View>
        }
        renderItem={({ item }) => <MemberCard member={item} onPress={() => router.push(`/members/${item.id}`)} />}
        ListEmptyComponent={
          loading ? undefined : (
            <EmptyState icon={Users} title={query ? 'لا توجد نتائج مطابقة' : 'لا يوجد أعضاء'} message="جرّب تغيير معايير البحث أو التصفية." />
          )
        }
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  list: { paddingHorizontal: GUTTER, paddingTop: spacing.lg, paddingBottom: spacing.xxxl, gap: spacing.md },
});
