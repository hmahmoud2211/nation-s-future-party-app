import React from 'react';
import { StyleSheet, View } from 'react-native';
import { FEEDBACK_STATUS, FEEDBACK_TOPIC } from '@/features/feedback/services/labels';
import { useMember } from '@/features/members/hooks/useMembers';
import { colors, spacing } from '@/theme';
import type { Feedback } from '@/features/feedback/types';
import { formatRelative, refCode } from '@/utils/format';
import { AppText } from '@/components/common/AppText';
import { Avatar } from '@/components/common/Avatar';
import { Badge, StatusBadge } from '@/components/common/Badge';
import { Card } from '@/components/common/Card';
import { useRelatedTitle } from '@/features/feedback/hooks/useRelatedTitle';

const CATEGORY_LABEL: Record<Feedback['category'], string> = {
  proposal: 'مقترح',
  project: 'مشروع',
  administrative: 'إداري',
};


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
        <Badge label={`${CATEGORY_LABEL[feedback.category]}${related ? `: ${related}` : ''}`} tone="primary" style={{ maxWidth: '75%' }} />
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
