import React from 'react';
import { StyleSheet, View } from 'react-native';
import { REQUEST_STATUS, REQUEST_TYPE } from '@/features/requests/services/labels';
import { useMember } from '@/features/members/hooks/useMembers';
import { colors, spacing } from '@/theme';
import type { AdminRequest } from '@/features/requests/types';
import { formatRelative, refCode } from '@/utils/format';
import { AppText } from '@/components/common/AppText';
import { Badge, StatusBadge } from '@/components/common/Badge';
import { Card } from '@/components/common/Card';

export function RequestCard({ request, onPress, showAuthor }: { request: AdminRequest; onPress?: () => void; showAuthor?: boolean }) {
  const author = useMember(request.authorId);
  return (
    <Card onPress={onPress} accessibilityLabel={request.subject}>
      <View style={styles.row}>
        <Badge label={REQUEST_TYPE[request.type]} tone="primary" />
        <StatusBadge status={REQUEST_STATUS[request.status]} />
        <View style={{ flex: 1 }} />
        <AppText variant="meta" color={colors.textMuted}>
          {refCode.request(request.seq)}
        </AppText>
      </View>
      <AppText variant="cardTitle" numberOfLines={2} style={{ marginTop: spacing.sm }}>
        {request.subject}
      </AppText>
      <AppText variant="caption" color={colors.textSecondary} numberOfLines={2}>
        {request.description}
      </AppText>
      <AppText variant="meta" color={colors.textMuted} style={{ marginTop: spacing.sm }}>
        {[showAuthor ? author?.name : null, formatRelative(request.updatedAt), request.replies.length ? `${request.replies.length} ردود` : 'لا توجد ردود بعد']
          .filter(Boolean)
          .join(' • ')}
      </AppText>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs + 2, flexWrap: 'wrap' },
});
