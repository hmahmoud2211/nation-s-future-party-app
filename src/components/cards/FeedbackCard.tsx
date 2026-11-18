import React from 'react';
import { StyleSheet, View } from 'react-native';
import { FEEDBACK_STATUS, FEEDBACK_TOPIC } from '@/constants/labels';
import { useAppStore, useMember } from '@/store';
import { colors, spacing } from '@/theme';
import type { Feedback } from '@/types';
import { formatRelative, refCode } from '@/utils/format';
import { AppText } from '../ui/AppText';
import { Avatar } from '../ui/Avatar';
import { Badge, StatusBadge } from '../ui/Badge';
import { Card } from '../ui/Card';

const CATEGORY_LABEL: Record<Feedback['category'], string> = {
  proposal: 'مقترح',
  project: 'مشروع',
  administrative: 'إداري',
};

/** Title of the related proposal / project. */
export function useRelatedTitle(fb: Pick<Feedback, 'category' | 'relatedEntityId'>): string | undefined {
  return useAppStore((s) => {
    if (!fb.relatedEntityId) return undefined;
    if (fb.category === 'proposal') return s.proposals.find((p) => p.id === fb.relatedEntityId)?.title;
    if (fb.category === 'project') return s.projects.find((p) => p.id === fb.relatedEntityId)?.title;
    return undefined;
  });
}

export function FeedbackCard({ feedback, onPress, perspective = 'official' }: { feedback: Feedback; onPress?: () => void; perspective?: 'official' | 'author' }) {
  const author = useMember(feedback.authorId);
  const related = useRelatedTitle(feedback);
  const last = feedback.messages[feedback.messages.length - 1];
  const isNew = feedback.status === 'new' && perspective === 'official';
  return (
    <Card onPress={onPress} accessibilityLabel={feedback.subject} accentColor={isNew ? colors.info : undefined}>
      <View style={styles.row}>
        <Avatar name={author?.name ?? '؟'} color={author?.avatarColor} size={40} />
        <View style={{ flex: 1, gap: 1 }}>
          <AppText variant="cardTitle" numberOfLines={1}>
            {feedback.subject}
          </AppText>
          <AppText variant="meta" color={colors.textSecondary} numberOfLines={1}>
            {`${author?.name ?? ''} • ${formatRelative(feedback.updatedAt)}`}
          </AppText>
        </View>
        <StatusBadge status={FEEDBACK_STATUS[feedback.status]} />
      </View>
      <AppText variant="caption" color={colors.text} numberOfLines={2} style={{ marginTop: spacing.sm }}>
        {last?.message}
      </AppText>
      <View style={styles.foot}>
        <Badge label={`${CATEGORY_LABEL[feedback.category]}${related ? `: ${related}` : ''}`} tone="navy" style={{ maxWidth: '75%' }} />
        <Badge label={FEEDBACK_TOPIC[feedback.topic]} tone="neutral" />
        <View style={{ flex: 1 }} />
        <AppText variant="meta" color={colors.textMuted}>
          {refCode.feedback(feedback.seq)}
        </AppText>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  foot: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: spacing.md, flexWrap: 'wrap' },
});
