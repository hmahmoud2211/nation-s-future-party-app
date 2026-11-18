import React, { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { ChevronDown, ChevronUp, CircleCheck, CircleHelp, Clock, Lock, MessagesSquare, RotateCcw } from 'lucide-react-native';
import {
  AppHeader,
  AppText,
  Badge,
  Button,
  Card,
  CommentInput,
  EmptyState,
  MessageThread,
  PressableScale,
  ScreenContainer,
  SectionHeader,
  StatusBadge,
  Timeline,
} from '@/components';
import { FEEDBACK_STATUS, FEEDBACK_TOPIC } from '@/constants/labels';
import { RelatedEntityCard } from '@/features/feedback/RelatedEntityCard';
import { runResult } from '@/features/feedback/runResult';
import { useAppStore, useCommittee, useMember, useUser } from '@/store';
import { confirmDialog, promptDialog, toast } from '@/store/uiStore';
import { colors, radius, spacing } from '@/theme';
import { formatDateTime, refCode } from '@/utils/format';
import { canHandleFeedback, canViewFeedback } from '@/utils/permissions';

export default function FeedbackThreadScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const user = useUser();
  const feedback = useAppStore((s) => s.feedback);
  const fb = useMemo(() => feedback.find((f) => f.id === id), [feedback, id]);
  const author = useMember(fb?.authorId);
  const recipient = useMember(fb?.recipientId);
  const committee = useCommittee(fb?.committeeId);
  const replyToFeedback = useAppStore((s) => s.replyToFeedback);
  const updateFeedbackStatus = useAppStore((s) => s.updateFeedbackStatus);
  const closeFeedback = useAppStore((s) => s.closeFeedback);
  const reopenFeedback = useAppStore((s) => s.reopenFeedback);
  const [showLog, setShowLog] = useState(false);

  if (!fb || !canViewFeedback(user, fb)) {
    return (
      <ScreenContainer header={<AppHeader title="تفاصيل الملاحظة" />}>
        <EmptyState icon={MessagesSquare} title={fb ? 'غير مصرح بعرض هذه الملاحظة' : 'الملاحظة غير موجودة'} message="قد تكون الملاحظة خارج نطاق صلاحياتك التجريبية." />
      </ScreenContainer>
    );
  }

  const isAuthor = fb.authorId === user.id;
  const handler = canHandleFeedback(user, fb);
  const closed = fb.status === 'closed';
  const canReply = (isAuthor || handler) && !closed;

  const run = runResult;

  const onSend = (text: string, attachments: Parameters<typeof replyToFeedback>[3]) => {
    const res = replyToFeedback(fb.id, text, 'message', attachments);
    if (!res.ok) {
      toast.error(res.error);
      return false;
    }
    toast.success(isAuthor ? 'تم إرسال ردك' : 'تم إرسال الرد');
    return true;
  };

  const requestInfo = async () => {
    const text = await promptDialog({
      title: 'طلب معلومات إضافية',
      message: 'اكتب المعلومات المطلوبة من العضو لاستكمال المراجعة.',
      placeholder: 'مثال: يرجى توضيح تفاصيل إضافية عن المقترح…',
      required: true,
      requiredMessage: 'يرجى كتابة المعلومات المطلوبة',
      confirmLabel: 'إرسال الطلب',
    });
    if (text === null) return;
    run(replyToFeedback(fb.id, text, 'info_request'), 'تم إرسال طلب المعلومات');
  };

  const close = async () => {
    const ok = await confirmDialog({ title: 'إغلاق الملاحظة؟', message: 'لن يمكن إضافة ردود جديدة إلا بعد إعادة فتحها.', confirmLabel: 'إغلاق', tone: 'danger' });
    if (ok) run(closeFeedback(fb.id), 'تم إغلاق الملاحظة');
  };

  return (
    <ScreenContainer
      keyboard
      header={
        <AppHeader title={fb.subject} eyebrow={`${refCode.feedback(fb.seq)} • ${committee?.name ?? ''}`}>
          <View style={styles.headerBadges}>
            <StatusBadge status={FEEDBACK_STATUS[fb.status]} size="md" />
            <Badge label={FEEDBACK_TOPIC[fb.topic]} tone="gold" size="md" />
          </View>
        </AppHeader>
      }
      footer={
        <CommentInput
          onSend={onSend}
          allowAttachments
          placeholder={handler && !isAuthor ? 'اكتب ردك على العضو…' : 'اكتب رسالتك…'}
          disabled={!canReply}
          disabledText={closed ? 'الملاحظة مغلقة — أعد فتحها لإضافة ردود' : 'عرض فقط — لا يمكنك الرد على هذه الملاحظة'}
        />
      }
    >
      <View style={{ gap: spacing.lg }}>
        <RelatedEntityCard category={fb.category} relatedEntityId={fb.relatedEntityId} committeeName={committee?.name} />

        <Card style={{ padding: spacing.md }}>
          <View style={styles.metaRow}>
            <AppText variant="meta" color={colors.textSecondary}>
              مقدم الملاحظة
            </AppText>
            <AppText variant="captionMedium">{author?.name ?? '—'}</AppText>
          </View>
          <View style={styles.metaRow}>
            <AppText variant="meta" color={colors.textSecondary}>
              الجهة المختصة
            </AppText>
            <AppText variant="captionMedium">{recipient?.name ?? 'مسؤول اللجنة'}</AppText>
          </View>
          <View style={styles.metaRow}>
            <AppText variant="meta" color={colors.textSecondary}>
              تاريخ الإرسال
            </AppText>
            <AppText variant="captionMedium">{formatDateTime(fb.createdAt)}</AppText>
          </View>
        </Card>

        {handler ? (
          <View>
            <SectionHeader title="إجراءات المتابعة" />
            {closed ? (
              <Button title="إعادة فتح الملاحظة" icon={RotateCcw} variant="outline" onPress={() => run(reopenFeedback(fb.id), 'تمت إعادة فتح الملاحظة')} />
            ) : (
              <View style={styles.actions}>
                <Button title="طلب معلومات إضافية" icon={CircleHelp} size="sm" variant="secondary" onPress={requestInfo} style={styles.action} />
                <Button
                  title="قيد المراجعة"
                  icon={Clock}
                  size="sm"
                  variant="outline"
                  disabled={fb.status === 'under_review'}
                  onPress={() => run(updateFeedbackStatus(fb.id, 'under_review'), 'تم تحديث الحالة إلى قيد المراجعة')}
                  style={styles.action}
                />
                <Button
                  title="تم الرد"
                  icon={CircleCheck}
                  size="sm"
                  variant="success"
                  disabled={fb.status === 'replied'}
                  onPress={() => run(updateFeedbackStatus(fb.id, 'replied'), 'تم تحديث الحالة إلى تم الرد')}
                  style={styles.action}
                />
                <Button title="إغلاق" icon={Lock} size="sm" variant="dangerOutline" onPress={close} style={styles.action} />
              </View>
            )}
          </View>
        ) : isAuthor && closed ? (
          <Button title="إعادة فتح الملاحظة" icon={RotateCcw} variant="outline" onPress={() => run(reopenFeedback(fb.id), 'تمت إعادة فتح الملاحظة')} />
        ) : null}

        <View>
          <SectionHeader title="المحادثة" count={fb.messages.length} />
          <MessageThread messages={fb.messages} currentUserId={user.id} />
        </View>

        <Card style={{ padding: 0 }}>
          <PressableScale onPress={() => setShowLog((v) => !v)} style={styles.logHeader} accessibilityLabel="سجل المتابعة">
            <AppText variant="cardTitle">سجل المتابعة</AppText>
            <View style={styles.logRight}>
              <Badge label={`${fb.activity.length} حدث`} tone="neutral" />
              {showLog ? <ChevronUp size={18} color={colors.textSecondary} /> : <ChevronDown size={18} color={colors.textSecondary} />}
            </View>
          </PressableScale>
          {showLog ? (
            <View style={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.lg }}>
              <Timeline events={fb.activity} />
            </View>
          ) : null}
        </Card>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  headerBadges: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  action: { flexGrow: 1, flexBasis: '45%' },
  logHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.lg, borderRadius: radius.lg },
  logRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
});
