import React, { useMemo } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { CircleCheck, CircleHelp, Clock, Inbox, Lock } from 'lucide-react-native';
import { AppText } from '@/components/common/AppText';
import { Avatar } from '@/components/common/Avatar';
import { Badge, StatusBadge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { EmptyState } from '@/components/feedback/States';
import { FilePreview } from '@/components/forms/AttachmentPicker';
import { CommentInput } from '@/components/forms/CommentInput';
import { AppHeader } from '@/components/layout/AppHeader';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { MessageThread } from '@/components/ui/MessageThread';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { useUser } from '@/features/auth/hooks/useSession';
import { canHandleRequest } from '@/features/auth/services/permissions';
import { personLabel } from '@/features/auth/services/roles';
import { useCommittee } from '@/features/committees/hooks/useCommittees';
import { useMember, usePeopleResolvers } from '@/features/members/hooks/useMembers';
import { useRequest, useRequestActions } from '@/features/requests/hooks/useRequests';
import { REQUEST_STATUS, REQUEST_TYPE } from '@/features/requests/services/labels';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useDialogs, useRunResult, useToast } from '@/hooks/useOverlays';
import { formatDateTime, refCode } from '@/utils/format';
import { requestDetailsCopy as copy } from './RequestDetailsScreen.data';
import { AUTHOR_AVATAR_SIZE, createStyles } from './RequestDetailsScreen.styles';

export function RequestDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const toast = useToast();
  const { confirmDialog, promptDialog } = useDialogs();
  const runResult = useRunResult();
  const user = useUser();
  const people = usePeopleResolvers();
  const request = useRequest(id);
  const author = useMember(request?.authorId);
  const committee = useCommittee(request?.committeeId);
  const { replyToRequest, updateRequestStatus } = useRequestActions();

  const isAuthor = !!request && request.authorId === user.id;
  const handler = !!request && canHandleRequest(user, request);

  if (!request || (!isAuthor && !handler)) {
    return (
      <ScreenContainer header={<AppHeader title={copy.title} />}>
        <EmptyState icon={Inbox} title={request ? copy.forbidden : copy.notFound} />
      </ScreenContainer>
    );
  }

  const closed = request.status === 'closed';

  const requestInfo = async () => {
    const text = await promptDialog({
      title: copy.requestInfoTitle,
      placeholder: copy.requestInfoPlaceholder,
      required: true,
      requiredMessage: copy.requestInfoRequired,
      confirmLabel: copy.requestInfoConfirm,
    });
    if (text) runResult(replyToRequest(request.id, text, 'info_request'), copy.infoRequestSent);
  };

  const close = async () => {
    const ok = await confirmDialog({ title: copy.closeTitle, message: copy.closeMessage, confirmLabel: copy.closeConfirm, tone: 'danger' });
    if (ok) runResult(updateRequestStatus(request.id, 'closed'), copy.closedToast);
  };

  return (
    <ScreenContainer
      keyboard
      header={
        <AppHeader title={request.subject} eyebrow={`${refCode.request(request.seq)} • ${REQUEST_TYPE[request.type]}`}>
          <View style={styles.badges}>
            <StatusBadge status={REQUEST_STATUS[request.status]} size="md" />
            <Badge label={committee?.name ?? ''} tone="accent" size="md" />
          </View>
        </AppHeader>
      }
      footer={
        <CommentInput
          userId={user.id}
          placeholder={isAuthor ? copy.authorPlaceholder : copy.handlerPlaceholder}
          disabled={closed}
          disabledText={copy.closedDisabled}
          onSend={(text) => {
            const res = replyToRequest(request.id, text);
            if (!res.ok) {
              toast.error(res.error);
              return false;
            }
            toast.success(copy.replySent);
            return true;
          }}
        />
      }
    >
      <View style={styles.content}>
        <Card>
          <View style={styles.authorRow}>
            <Avatar name={author?.name ?? copy.unknownInitial} color={author?.avatarColor} size={AUTHOR_AVATAR_SIZE} />
            <View style={styles.authorInfo}>
              <AppText variant="cardTitle">{author?.name}</AppText>
              <AppText variant="meta" color={theme.colors.textSecondary}>
                {`${author ? personLabel(author) : ''} • ${formatDateTime(request.createdAt)}`}
              </AppText>
            </View>
          </View>
          <AppText variant="body" style={styles.description}>
            {request.description}
          </AppText>
          {request.attachments.length ? (
            <View style={styles.attachments}>
              {request.attachments.map((a) => (
                <FilePreview key={a.id} file={a} />
              ))}
            </View>
          ) : null}
        </Card>

        {handler && !closed ? (
          <View>
            <SectionHeader title={copy.actionsTitle} />
            <View style={styles.actions}>
              <Button title={copy.requestInfo} icon={CircleHelp} size="sm" variant="secondary" onPress={requestInfo} style={styles.action} />
              <Button
                title={copy.underReview}
                icon={Clock}
                size="sm"
                variant="outline"
                disabled={request.status === 'under_review'}
                onPress={() => runResult(updateRequestStatus(request.id, 'under_review'), copy.statusUpdatedToast)}
                style={styles.action}
              />
              <Button
                title={copy.resolved}
                icon={CircleCheck}
                size="sm"
                variant="success"
                disabled={request.status === 'resolved'}
                onPress={() => runResult(updateRequestStatus(request.id, 'resolved'), copy.resolvedToast)}
                style={styles.action}
              />
              <Button title={copy.close} icon={Lock} size="sm" variant="dangerOutline" onPress={close} style={styles.action} />
            </View>
          </View>
        ) : null}

        <View>
          <SectionHeader title={copy.replies} count={request.replies.length} />
          <MessageThread messages={request.replies} currentUserId={user.id} authorOf={people.authorOf} emptyText={copy.noReplies} />
        </View>
      </View>
    </ScreenContainer>
  );
}
