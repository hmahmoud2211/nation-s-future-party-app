import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { CircleCheck, CircleHelp, Clock, Inbox, Lock } from 'lucide-react-native';
import {
  AppHeader,
  AppText,
  Avatar,
  Badge,
  Button,
  Card,
  CommentInput,
  EmptyState,
  FilePreview,
  MessageThread,
  ScreenContainer,
  SectionHeader,
  StatusBadge,
} from '@/components';
import { REQUEST_STATUS, REQUEST_TYPE } from '@/constants/labels';
import { personLabel } from '@/utils/roles';
import { runResult } from '@/features/feedback/runResult';
import { useAppStore, useCommittee, useMember, useUser } from '@/store';
import { confirmDialog, promptDialog, toast } from '@/store/uiStore';
import { colors, spacing } from '@/theme';
import { formatDateTime, refCode } from '@/utils/format';
import { canHandleRequest } from '@/utils/permissions';

export default function RequestDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const user = useUser();
  const requests = useAppStore((s) => s.requests);
  const request = useMemo(() => requests.find((r) => r.id === id), [requests, id]);
  const author = useMember(request?.authorId);
  const committee = useCommittee(request?.committeeId);
  const replyToRequest = useAppStore((s) => s.replyToRequest);
  const updateRequestStatus = useAppStore((s) => s.updateRequestStatus);

  const isAuthor = !!request && request.authorId === user.id;
  const handler = !!request && canHandleRequest(user, request);

  if (!request || (!isAuthor && !handler)) {
    return (
      <ScreenContainer header={<AppHeader title="تفاصيل الطلب" />}>
        <EmptyState icon={Inbox} title={request ? 'غير مصرح بعرض هذا الطلب' : 'الطلب غير موجود'} />
      </ScreenContainer>
    );
  }

  const closed = request.status === 'closed';

  const requestInfo = async () => {
    const text = await promptDialog({
      title: 'طلب معلومات إضافية',
      placeholder: 'اكتب المعلومات المطلوبة من مقدم الطلب…',
      required: true,
      requiredMessage: 'يرجى كتابة المعلومات المطلوبة',
      confirmLabel: 'إرسال',
    });
    if (text) runResult(replyToRequest(request.id, text, 'info_request'), 'تم إرسال طلب المعلومات');
  };

  const close = async () => {
    const ok = await confirmDialog({ title: 'إغلاق الطلب؟', message: 'لن يمكن إضافة ردود بعد الإغلاق.', confirmLabel: 'إغلاق الطلب', tone: 'danger' });
    if (ok) runResult(updateRequestStatus(request.id, 'closed'), 'تم إغلاق الطلب');
  };

  return (
    <ScreenContainer
      keyboard
      header={
        <AppHeader title={request.subject} eyebrow={`${refCode.request(request.seq)} • ${REQUEST_TYPE[request.type]}`}>
          <View style={styles.badges}>
            <StatusBadge status={REQUEST_STATUS[request.status]} size="md" />
            <Badge label={committee?.name ?? ''} tone="gold" size="md" />
          </View>
        </AppHeader>
      }
      footer={
        <CommentInput
          placeholder={isAuthor ? 'أضف رداً أو معلومات إضافية…' : 'اكتب ردك على مقدم الطلب…'}
          disabled={closed}
          disabledText="الطلب مغلق"
          onSend={(text) => {
            const res = replyToRequest(request.id, text);
            if (!res.ok) {
              toast.error(res.error);
              return false;
            }
            toast.success('تم إرسال الرد');
            return true;
          }}
        />
      }
    >
      <View style={{ gap: spacing.lg }}>
        <Card>
          <View style={styles.authorRow}>
            <Avatar name={author?.name ?? '؟'} color={author?.avatarColor} size={42} />
            <View style={{ flex: 1 }}>
              <AppText variant="cardTitle">{author?.name}</AppText>
              <AppText variant="meta" color={colors.textSecondary}>
                {`${author ? personLabel(author) : ''} • ${formatDateTime(request.createdAt)}`}
              </AppText>
            </View>
          </View>
          <AppText variant="body" style={{ marginTop: spacing.md }}>
            {request.description}
          </AppText>
          {request.attachments.length ? (
            <View style={{ gap: spacing.sm, marginTop: spacing.md }}>
              {request.attachments.map((a) => (
                <FilePreview key={a.id} file={a} />
              ))}
            </View>
          ) : null}
        </Card>

        {handler && !closed ? (
          <View>
            <SectionHeader title="إجراءات الطلب" />
            <View style={styles.actions}>
              <Button title="طلب معلومات إضافية" icon={CircleHelp} size="sm" variant="secondary" onPress={requestInfo} style={styles.action} />
              <Button
                title="قيد المراجعة"
                icon={Clock}
                size="sm"
                variant="outline"
                disabled={request.status === 'under_review'}
                onPress={() => runResult(updateRequestStatus(request.id, 'under_review'), 'تم تحديث حالة الطلب')}
                style={styles.action}
              />
              <Button
                title="تم الحل"
                icon={CircleCheck}
                size="sm"
                variant="success"
                disabled={request.status === 'resolved'}
                onPress={() => runResult(updateRequestStatus(request.id, 'resolved'), 'تم تحديث حالة الطلب إلى تم الحل')}
                style={styles.action}
              />
              <Button title="إغلاق الطلب" icon={Lock} size="sm" variant="dangerOutline" onPress={close} style={styles.action} />
            </View>
          </View>
        ) : null}

        <View>
          <SectionHeader title="الردود" count={request.replies.length} />
          <MessageThread messages={request.replies} currentUserId={user.id} emptyText="لم يتم الرد على الطلب بعد" />
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  badges: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' },
  authorRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  action: { flexGrow: 1, flexBasis: '45%' },
});
