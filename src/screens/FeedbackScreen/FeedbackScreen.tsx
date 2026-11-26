import React, { useMemo, useState } from 'react';
import { FlatList, View } from 'react-native';
import { useRouter } from 'expo-router';
import { MessageSquarePlus, MessagesSquare } from 'lucide-react-native';
import { AppText } from '@/components/common/AppText';
import { IconButton } from '@/components/common/IconButton';
import { EmptyState, LoadingState, useSimulatedLoading } from '@/components/feedback/States';
import { AppHeader } from '@/components/layout/AppHeader';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { type ChipOption, FilterChips } from '@/components/ui/Chips';
import { useUser } from '@/features/auth/hooks/useSession';
import { canHandleFeedback, canViewFeedback, isAdmin, isLeadership, isMemberRole, isResponsible } from '@/features/auth/services/permissions';
import { FeedbackCard } from '@/features/feedback/components/FeedbackCard';
import { useFeedbackList } from '@/features/feedback/hooks/useFeedback';
import type { Feedback, FeedbackCategory, FeedbackStatus } from '@/features/feedback/types';
import { useAppTheme } from '@/hooks/useAppTheme';
import { feedbackCopy as copy } from './FeedbackScreen.data';
import { createStyles } from './FeedbackScreen.styles';

type StatusKey = 'all' | FeedbackStatus;
type CategoryKey = 'all' | FeedbackCategory;

/**
 * Officials: "الملاحظات والاستفسارات" inbox. Members: their own feedback threads.
 * Leadership: read-only view of feedback in their scope.
 */
export function FeedbackScreen() {
  const router = useRouter();
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const user = useUser();
  const feedback = useFeedbackList();
  const loading = useSimulatedLoading();
  const [status, setStatus] = useState<StatusKey>('all');
  const [category, setCategory] = useState<CategoryKey>('all');

  const memberView = isMemberRole(user);
  // Read-only follow-up view for leaders who don't run a committee themselves.
  const leadershipView = isLeadership(user) && !isAdmin(user) && !isResponsible(user);

  const scoped = useMemo(() => {
    let list: Feedback[];
    if (memberView) list = feedback.filter((f) => f.authorId === user.id);
    else if (leadershipView) list = feedback.filter((f) => canViewFeedback(user, f));
    else list = feedback.filter((f) => canHandleFeedback(user, f) || f.authorId === user.id);
    return [...list].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }, [feedback, user, memberView, leadershipView]);

  const byCategory = useMemo(() => (category === 'all' ? scoped : scoped.filter((f) => f.category === category)), [scoped, category]);
  const visible = useMemo(() => (status === 'all' ? byCategory : byCategory.filter((f) => f.status === status)), [byCategory, status]);

  const statusOptions: ChipOption<StatusKey>[] = useMemo(
    () => [
      { key: 'all', label: copy.allStatuses, count: byCategory.length },
      ...(Object.keys(copy.statusLabels) as FeedbackStatus[]).map((k) => ({ key: k, label: copy.statusLabels[k], count: byCategory.filter((f) => f.status === k).length })),
    ],
    [byCategory],
  );
  const categoryOptions: ChipOption<CategoryKey>[] = useMemo(
    () => [
      { key: 'all', label: copy.allCategories },
      ...(Object.keys(copy.categoryLabels) as FeedbackCategory[]).map((k) => ({ key: k, label: copy.categoryLabels[k], count: scoped.filter((f) => f.category === k).length })),
    ],
    [scoped],
  );

  const newCount = scoped.filter((f) => f.status === 'new').length;
  const title = memberView ? copy.memberTitle : copy.officialTitle;
  const subtitle = memberView
    ? copy.memberSubtitle
    : leadershipView
      ? copy.leadershipSubtitle
      : newCount
        ? copy.newCountSubtitle(newCount)
        : copy.noNewSubtitle;

  return (
    <ScreenContainer
      scroll={false}
      padded={false}
      header={
        <AppHeader
          title={title}
          subtitle={subtitle}
          actions={
            memberView ? (
              <IconButton
                icon={MessageSquarePlus}
                variant="glass"
                accessibilityLabel={copy.newFeedbackA11y}
                onPress={() => router.push('/feedback/new?category=administrative')}
              />
            ) : undefined
          }
        />
      }
    >
      <FlatList
        data={loading ? [] : visible}
        keyExtractor={(f) => f.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.listHeader}>
            <FilterChips options={statusOptions} value={status} onChange={setStatus} />
            <FilterChips options={categoryOptions} value={category} onChange={setCategory} />
            {loading ? <LoadingState count={4} /> : null}
            {!loading && visible.length > 0 ? (
              <AppText variant="meta" color={theme.colors.textSecondary}>{copy.resultsCount(visible.length)}</AppText>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          loading ? undefined : (
            <EmptyState
              icon={MessagesSquare}
              title={status === 'all' ? copy.empty : copy.emptyWithStatus(copy.statusLabels[status as FeedbackStatus])}
              message={memberView ? copy.memberEmptyMessage : copy.officialEmptyMessage}
              actionLabel={memberView ? copy.sendNew : undefined}
              onAction={memberView ? () => router.push('/feedback/new?category=administrative') : undefined}
            />
          )
        }
        renderItem={({ item }) => (
          <FeedbackCard
            feedback={item}
            perspective={item.authorId === user.id ? 'author' : 'official'}
            onPress={() => router.push(`/feedback/${item.id}`)}
          />
        )}
      />
    </ScreenContainer>
  );
}
