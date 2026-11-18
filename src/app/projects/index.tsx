import React, { useMemo, useState } from 'react';
import { FlatList, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FolderKanban, Plus } from 'lucide-react-native';
import {
  AppHeader,
  AppText,
  EmptyState,
  FilterChips,
  IconButton,
  LoadingState,
  ProjectCard,
  ScreenContainer,
  SearchInput,
  useSimulatedLoading,
} from '@/components';
import { PROJECT_STATUS } from '@/constants/labels';
import { useCanCreateIn, useListScope } from '@/features/committees/shared';
import { useAppStore, useCommittee } from '@/store';
import { colors, GUTTER, spacing } from '@/theme';
import type { ProjectStatus } from '@/types';

type Filter = 'all' | ProjectStatus;

/** "المشروعات والمبادرات" */
export default function ProjectsScreen() {
  const { committeeId } = useLocalSearchParams<{ committeeId?: string }>();
  const router = useRouter();
  const scope = useListScope(committeeId);
  const committee = useCommittee(committeeId);
  const projects = useAppStore((s) => s.projects);
  const loading = useSimulatedLoading();
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');
  const { canCreate, targetCommitteeId } = useCanCreateIn(committeeId);

  const inScope = useMemo(
    () => projects.filter((p) => scope.includes(p.committeeId)).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    [projects, scope],
  );

  const filtered = useMemo(() => {
    const q = query.trim();
    return inScope.filter((p) => (filter === 'all' || p.status === filter) && (!q || p.title.includes(q) || p.description.includes(q)));
  }, [inScope, filter, query]);

  const options = useMemo(
    () => [
      { key: 'all' as Filter, label: 'الكل', count: inScope.length },
      ...(Object.keys(PROJECT_STATUS) as ProjectStatus[]).map((s) => ({ key: s as Filter, label: PROJECT_STATUS[s].label, count: inScope.filter((p) => p.status === s).length })),
    ],
    [inScope],
  );

  const createHref = targetCommitteeId ? `/projects/new?committeeId=${targetCommitteeId}` : '/projects/new';

  return (
    <ScreenContainer
      scroll={false}
      padded={false}
      header={
        <AppHeader
          title="المشروعات والمبادرات"
          subtitle={committee ? committee.name : 'مشروعات اللجان ضمن نطاقك'}
          actions={canCreate ? <IconButton icon={Plus} variant="gold" accessibilityLabel="مشروع جديد" onPress={() => router.push(createHref)} /> : undefined}
        >
          <SearchInput value={query} onChangeText={setQuery} placeholder="ابحث باسم المشروع…" />
        </AppHeader>
      }
    >
      <FlatList
        data={loading ? [] : filtered}
        keyExtractor={(p) => p.id}
        contentContainerStyle={{ padding: GUTTER, gap: spacing.md, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View style={{ gap: spacing.sm }}>
            <FilterChips options={options} value={filter} onChange={setFilter} />
            {!loading ? (
              <AppText variant="meta" color={colors.textSecondary}>
                {`عدد المشروعات: ${filtered.length}`}
              </AppText>
            ) : null}
          </View>
        }
        renderItem={({ item }) => <ProjectCard project={item} onPress={() => router.push(`/projects/${item.id}`)} />}
        ListEmptyComponent={
          loading ? (
            <LoadingState />
          ) : (
            <EmptyState
              icon={FolderKanban}
              title="لا توجد مشروعات مطابقة"
              message={canCreate ? 'ابدأ بإضافة مشروع جديد للجنة.' : 'ستظهر هنا مشروعات لجانك عند إضافتها.'}
              actionLabel={canCreate ? 'مشروع جديد' : undefined}
              onAction={canCreate ? () => router.push(createHref) : undefined}
            />
          )
        }
      />
    </ScreenContainer>
  );
}
