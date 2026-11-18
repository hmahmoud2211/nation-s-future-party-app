import React, { useMemo, useState } from 'react';
import { FlatList, View } from 'react-native';
import { useRouter } from 'expo-router';
import { MessageSquarePlus, MessagesSquare } from 'lucide-react-native';
import {
  AppHeader,
  AppText,
  EmptyState,
  FeedbackCard,
  FilterChips,
  IconButton,
  LoadingState,
  ScreenContainer,
  useSimulatedLoading,
  type ChipOption,
} from '@/components';
import { useAppStore, useUser } from '@/store';
import { colors, GUTTER, spacing } from '@/theme';
import type { Feedback, FeedbackCategory, FeedbackStatus } from '@/types';
import { canHandleFeedback, canViewFeedback, isAdmin, isLeadership, isMemberRole, isResponsible } from '@/utils/permissions';

type StatusKey = 'all' | FeedbackStatus;
type CategoryKey = 'all' | FeedbackCategory;

const STATUS_LABELS: Record<FeedbackStatus, string> = {
  new: 'جديدة',
  under_review: 'قيد المتابعة',
  replied: 'تم الرد',
  closed: 'مغلقة',
};

const CATEGORY_LABELS: Record<FeedbackCategory, string> = {
  proposal: 'مقترحات',
  project: 'مشروعات',
  administrative: 'إداري',
};

/**
 * Officials: "الملاحظات والاستفسارات" inbox. Members: their own feedback threads.
 * Leadership: read-only view of feedback in their scope.
 */
export default function FeedbackInboxScreen() {
  const router = useRouter();
  const user = useUser();
  const feedback = useAppStore((s) => s.feedback);
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
      { key: 'all', label: 'الكل', count: byCategory.length },
      ...(Object.keys(STATUS_LABELS) as FeedbackStatus[]).map((k) => ({ key: k, label: STATUS_LABELS[k], count: byCategory.filter((f) => f.status === k).length })),
    ],
    [byCategory],
  );
  const categoryOptions: ChipOption<CategoryKey>[] = useMemo(
    () => [
      { key: 'all', label: 'كل الأنواع' },
      ...(Object.keys(CATEGORY_LABELS) as FeedbackCategory[]).map((k) => ({ key: k, label: CATEGORY_LABELS[k], count: scoped.filter((f) => f.category === k).length })),
    ],
    [scoped],
  );

  const newCount = scoped.filter((f) => f.status === 'new').length;
  const title = memberView ? 'ملاحظاتي واستفساراتي' : 'الملاحظات والاستفسارات';
  const subtitle = memberView
    ? 'تابع ردود اللجنة على استفساراتك'
    : leadershipView
      ? 'عرض للمتابعة — الملاحظات ضمن نطاق إشرافك'
      : newCount
        ? `لديك ${newCount} ملاحظات جديدة بانتظار الرد`
        : 'لا توجد ملاحظات جديدة بانتظار الرد';

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
                accessibilityLabel="ملاحظة جديدة"
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
        contentContainerStyle={{ padding: GUTTER, gap: spacing.md, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={{ gap: spacing.md }}>
            <FilterChips options={statusOptions} value={status} onChange={setStatus} />
            <FilterChips options={categoryOptions} value={category} onChange={setCategory} />
            {loading ? <LoadingState count={4} /> : null}
            {!loading && visible.length > 0 ? (
              <AppText variant="meta" color={colors.textSecondary}>{`${visible.length} ملاحظة`}</AppText>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          loading ? undefined : (
            <EmptyState
              icon={MessagesSquare}
              title={status === 'all' ? 'لا توجد ملاحظات' : `لا توجد ملاحظات بحالة "${STATUS_LABELS[status as FeedbackStatus]}"`}
              message={memberView ? 'يمكنك إرسال استفسار أو ملاحظة للجنة في أي وقت.' : 'ستظهر هنا ملاحظات واستفسارات أعضاء اللجنة.'}
              actionLabel={memberView ? 'إرسال ملاحظة جديدة' : undefined}
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
