import React, { useMemo, useState } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { ChevronDown, ChevronUp, CircleCheck, CircleHelp, Clock, Lock, MessagesSquare, RotateCcw } from 'lucide-react-native';
import { AppText } from '@/components/common/AppText';
import { Badge, StatusBadge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { PressableScale } from '@/components/common/PressableScale';
import { EmptyState } from '@/components/feedback/States';
import { CommentInput } from '@/components/forms/CommentInput';
import { AppHeader } from '@/components/layout/AppHeader';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { MessageThread } from '@/components/ui/MessageThread';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Timeline } from '@/components/ui/Timeline';
import { useUser } from '@/features/auth/hooks/useSession';
import { canHandleFeedback, canViewFeedback } from '@/features/auth/services/permissions';
import { useCommittee } from '@/features/committees/hooks/useCommittees';
import { RelatedEntityCard } from '@/features/feedback/components/RelatedEntityCard';
import { useFeedbackActions, useFeedbackItem } from '@/features/feedback/hooks/useFeedback';
import { FEEDBACK_STATUS, FEEDBACK_TOPIC } from '@/features/feedback/services/labels';
import { useMember, usePeopleResolvers } from '@/features/members/hooks/useMembers';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useDialogs, useRunResult, useToast } from '@/hooks/useOverlays';
import { formatDateTime, refCode } from '@/utils/format';
import { feedbackDetailsCopy as copy } from './FeedbackDetailsScreen.data';
import { createStyles, LOG_CHEVRON_SIZE } from './FeedbackDetailsScreen.styles';

export function FeedbackDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const toast = useToast();
  const { confirmDialog, promptDialog } = useDialogs();
  const run = useRunResult();
  const user = useUser();
  const people = usePeopleResolvers();
  const fb = useFeedbackItem(id);
  const author = useMember(fb?.authorId);
  const recipient = useMember(fb?.recipientId);
  const committee = useCommittee(fb?.committeeId);
  const { replyToFeedback, updateFeedbackStatus, closeFeedback, reopenFeedback } = useFeedbackActions();
  const [showLog, setShowLog] = useState(false);

  if (!fb || !canViewFeedback(user, fb)) {
    return (
      <ScreenContainer header={<AppHeader title={copy.title} />}>
        <EmptyState icon={MessagesSquare} title={fb ? copy.forbidden : copy.notFound} message={copy.outOfScope} />
      </ScreenContainer>
    );
  }

  const isAuthor = fb.authorId === user.id;
  const handler = canHandleFeedback(user, fb);
  const closed = fb.status === 'closed';
  const canReply = (isAuthor || handler) && !closed;

  const onSend = (text: string, attachments: Parameters<typeof replyToFeedback>[3]) => {
    const res = replyToFeedback(fb.id, text, 'message', attachments);
    if (!res.ok) {
      toast.error(res.error);
      return false;
    }
    toast.success(isAuthor ? copy.authorReplySent : copy.replySent);
    return true;
  };

  const requestInfo = async () => {
    const text = await promptDialog({
      title: copy.requestInfoTitle,
      message: copy.requestInfoMessage,
      placeholder: copy.requestInfoPlaceholder,
      required: true,
      requiredMessage: copy.requestInfoRequired,
      confirmLabel: copy.requestInfoConfirm,
    });
    if (text === null) return;
    run(replyToFeedback(fb.id, text, 'info_request'), copy.infoRequestSent);
  };

  const close = async () => {
    const ok = await confirmDialog({ title: copy.closeTitle, message: copy.closeMessage, confirmLabel: copy.closeConfirm, tone: 'danger' });
    if (ok) run(closeFeedback(fb.id), copy.closedToast);
  };

  return (
    <ScreenContainer
      keyboard
      header={
        <AppHeader title={fb.subject} eyebrow={`${refCode.feedback(fb.seq)} • ${committee?.name ?? ''}`}>
          <View style={styles.headerBadges}>
            <StatusBadge status={FEEDBACK_STATUS[fb.status]} size="md" />
            <Badge label={FEEDBACK_TOPIC[fb.topic]} tone="accent" size="md" />
          </View>
        </AppHeader>
      }
      footer={
        <CommentInput
          userId={user.id}
          onSend={onSend}
          allowAttachments
          placeholder={handler && !isAuthor ? copy.handlerPlaceholder : copy.messagePlaceholder}
          disabled={!canReply}
          disabledText={closed ? copy.closedDisabled : copy.readOnlyDisabled}
        />
      }
    >
      <View style={styles.content}>
        <RelatedEntityCard category={fb.category} relatedEntityId={fb.relatedEntityId} committeeName={committee?.name} />

        <Card style={styles.metaCard}>
          <View style={styles.metaRow}>
            <AppText variant="meta" color={theme.colors.textSecondary}>
              {copy.submittedBy}
            </AppText>
            <AppText variant="captionMedium">{author?.name ?? copy.emptyValue}</AppText>
          </View>
          <View style={styles.metaRow}>
            <AppText variant="meta" color={theme.colors.textSecondary}>
              {copy.recipient}
            </AppText>
            <AppText variant="captionMedium">{recipient?.name ?? copy.recipientFallback}</AppText>
          </View>
          <View style={styles.metaRow}>
            <AppText variant="meta" color={theme.colors.textSecondary}>
              {copy.sentAt}
            </AppText>
            <AppText variant="captionMedium">{formatDateTime(fb.createdAt)}</AppText>
          </View>
        </Card>

        {handler ? (
          <View>
            <SectionHeader title={copy.actionsTitle} />
            {closed ? (
              <Button title={copy.reopen} icon={RotateCcw} variant="outline" onPress={() => run(reopenFeedback(fb.id), copy.reopenedToast)} />
            ) : (
              <View style={styles.actions}>
                <Button title={copy.requestInfo} icon={CircleHelp} size="sm" variant="secondary" onPress={requestInfo} style={styles.action} />
                <Button
                  title={copy.underReview}
                  icon={Clock}
                  size="sm"
                  variant="outline"
                  disabled={fb.status === 'under_review'}
                  onPress={() => run(updateFeedbackStatus(fb.id, 'under_review'), copy.underReviewToast)}
                  style={styles.action}
                />
                <Button
                  title={copy.replied}
                  icon={CircleCheck}
                  size="sm"
                  variant="success"
                  disabled={fb.status === 'replied'}
                  onPress={() => run(updateFeedbackStatus(fb.id, 'replied'), copy.repliedToast)}
                  style={styles.action}
                />
                <Button title={copy.close} icon={Lock} size="sm" variant="dangerOutline" onPress={close} style={styles.action} />
              </View>
            )}
          </View>
        ) : isAuthor && closed ? (
          <Button title={copy.reopen} icon={RotateCcw} variant="outline" onPress={() => run(reopenFeedback(fb.id), copy.reopenedToast)} />
        ) : null}

        <View>
          <SectionHeader title={copy.conversation} count={fb.messages.length} />
          <MessageThread messages={fb.messages} currentUserId={user.id} authorOf={people.authorOf} />
        </View>

        <Card style={styles.logCard}>
          <PressableScale onPress={() => setShowLog((v) => !v)} style={styles.logHeader} accessibilityLabel={copy.activityLog}>
            <AppText variant="cardTitle">{copy.activityLog}</AppText>
            <View style={styles.logRight}>
              <Badge label={copy.eventsCount(fb.activity.length)} tone="neutral" />
              {showLog ? (
                <ChevronUp size={LOG_CHEVRON_SIZE} color={theme.colors.textSecondary} />
              ) : (
                <ChevronDown size={LOG_CHEVRON_SIZE} color={theme.colors.textSecondary} />
              )}
            </View>
          </PressableScale>
          {showLog ? (
            <View style={styles.logBody}>
              <Timeline events={fb.activity} actorName={people.actorName} />
            </View>
          ) : null}
        </Card>
      </View>
    </ScreenContainer>
  );
}
