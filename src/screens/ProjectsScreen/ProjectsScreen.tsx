import React, { useMemo, useState } from 'react';
import { FlatList, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FolderKanban, Plus } from 'lucide-react-native';
import { AppHeader } from '@/components/layout/AppHeader';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { AppText } from '@/components/common/AppText';
import { FilterChips } from '@/components/ui/Chips';
import { IconButton } from '@/components/common/IconButton';
import { SearchInput } from '@/components/forms/SearchInput';
import { EmptyState, LoadingState, useSimulatedLoading } from '@/components/feedback/States';
import { ProjectCard } from '@/features/projects/components/ProjectCard';
import { useProjects } from '@/features/projects/hooks/useProjects';
import { PROJECT_STATUS } from '@/features/projects/services/labels';
import { useCanCreateIn, useListScope } from '@/features/committees/hooks/useCommitteeScope';
import { useCommittee } from '@/features/committees/hooks/useCommittees';
import type { ProjectStatus } from '@/features/projects/types';
import { useAppTheme } from '@/hooks/useAppTheme';
import { projectsCopy as copy } from './ProjectsScreen.data';
import { createStyles } from './ProjectsScreen.styles';

type Filter = 'all' | ProjectStatus;

/** "المشروعات والمبادرات" */
export function ProjectsScreen() {
  const { committeeId } = useLocalSearchParams<{ committeeId?: string }>();
  const router = useRouter();
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const scope = useListScope(committeeId);
  const committee = useCommittee(committeeId);
  const projects = useProjects();
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
      { key: 'all' as Filter, label: copy.filterAll, count: inScope.length },
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
          title={copy.title}
          subtitle={committee ? committee.name : copy.subtitle}
          actions={canCreate ? <IconButton icon={Plus} variant="accent" accessibilityLabel={copy.newProject} onPress={() => router.push(createHref)} /> : undefined}
        >
          <SearchInput value={query} onChangeText={setQuery} placeholder={copy.searchPlaceholder} />
        </AppHeader>
      }
    >
      <FlatList
        data={loading ? [] : filtered}
        keyExtractor={(p) => p.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View style={styles.listHeader}>
            <FilterChips options={options} value={filter} onChange={setFilter} />
            {!loading ? (
              <AppText variant="meta" color={theme.colors.textSecondary}>
                {copy.count(filtered.length)}
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
              title={copy.emptyTitle}
              message={canCreate ? copy.emptyCanCreate : copy.emptyReadOnly}
              actionLabel={canCreate ? copy.newProject : undefined}
              onAction={canCreate ? () => router.push(createHref) : undefined}
            />
          )
        }
      />
    </ScreenContainer>
  );
}
