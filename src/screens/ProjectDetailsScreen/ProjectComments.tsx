import React, { useMemo } from 'react';
import { View } from 'react-native';
import { MessageSquare, Reply, X } from 'lucide-react-native';
import { AppText } from '@/components/common/AppText';
import { Avatar } from '@/components/common/Avatar';
import { PressableScale } from '@/components/common/PressableScale';
import { EmptyState } from '@/components/feedback/States';
import { CommentInput } from '@/components/forms/CommentInput';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { useUser } from '@/features/auth/hooks/useSession';
import { personLabel } from '@/features/auth/services/roles';
import { useMemberMap } from '@/features/members/hooks/useMembers';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { Comment } from '@/types/common.types';
import { formatRelative } from '@/utils/format';
import { projectDetailsCopy as copy } from './ProjectDetailsScreen.data';
import { COMMENT_AVATAR_SIZE, createStyles, REPLY_AVATAR_SIZE, REPLY_ICON_SIZE } from './ProjectDetailsScreen.styles';

function useStyles() {
  const theme = useAppTheme();
  return { theme, styles: useMemo(() => createStyles(theme), [theme]) };
}

export type CommentThread = { comment: Comment; replies: Comment[] };

/** "الملاحظات الإدارية" — threaded admin notes with a reply chip above the composer. */
export function CommentsSection({
  count,
  threads,
  canComment,
  replyTo,
  onReply,
  onCancelReply,
  onSend,
}: {
  count: number;
  threads: CommentThread[];
  canComment: boolean;
  replyTo: Comment | null;
  onReply: (comment: Comment) => void;
  onCancelReply: () => void;
  onSend: (text: string) => boolean;
}) {
  const { theme, styles } = useStyles();
  const members = useMemberMap();
  const user = useUser();
  return (
    <View style={styles.block}>
      <SectionHeader title={copy.commentsTitle} icon={MessageSquare} count={count} />
      {threads.length ? (
        <View style={styles.threads}>
          {threads.map(({ comment, replies }) => (
            <View key={comment.id} style={styles.thread}>
              <CommentBubble comment={comment} onReply={canComment ? () => onReply(comment) : undefined} />
              {replies.map((r) => (
                <View key={r.id} style={styles.reply}>
                  <CommentBubble comment={r} isReply />
                </View>
              ))}
            </View>
          ))}
        </View>
      ) : (
        <EmptyState compact icon={MessageSquare} title={copy.noComments} message={copy.noCommentsMessage} />
      )}
      <View style={styles.composer}>
        {replyTo ? (
          <View style={styles.replyChip}>
            <Reply size={theme.sizes.icon.xs} color={theme.colors.primary} />
            <AppText variant="meta" color={theme.colors.primary} style={styles.replyChipText} numberOfLines={1}>
              {copy.replyingTo(members[replyTo.authorId]?.name ?? copy.unknownUser, replyTo.message)}
            </AppText>
            <PressableScale onPress={onCancelReply} hitSlop={8} accessibilityLabel={copy.cancelReply}>
              <X size={theme.sizes.icon.xs} color={theme.colors.textSecondary} />
            </PressableScale>
          </View>
        ) : null}
        <CommentInput
          userId={user.id}
          sticky={false}
          onSend={onSend}
          disabled={!canComment}
          disabledText={copy.commentsDisabled}
          placeholder={replyTo ? copy.replyPlaceholder : copy.commentPlaceholder}
        />
      </View>
    </View>
  );
}

function CommentBubble({ comment, onReply, isReply }: { comment: Comment; onReply?: () => void; isReply?: boolean }) {
  const { theme, styles } = useStyles();
  const members = useMemberMap();
  const user = useUser();
  const author = members[comment.authorId];
  const mine = comment.authorId === user.id;
  return (
    <View style={[styles.bubble, mine && styles.bubbleMine]}>
      <View style={styles.bubbleHead}>
        <Avatar name={author?.name ?? copy.unknownInitial} color={author?.avatarColor} size={isReply ? REPLY_AVATAR_SIZE : COMMENT_AVATAR_SIZE} />
        <View style={styles.bubbleAuthor}>
          <AppText variant="captionMedium" numberOfLines={1}>
            {mine ? copy.you : author?.name ?? copy.unknownUser}
          </AppText>
          <AppText variant="meta" color={theme.colors.textMuted}>
            {copy.commentMeta(author ? personLabel(author) : '', formatRelative(comment.createdAt))}
          </AppText>
        </View>
        {onReply ? (
          <PressableScale onPress={onReply} hitSlop={8} style={styles.replyBtn} accessibilityLabel={copy.reply}>
            <Reply size={REPLY_ICON_SIZE} color={theme.colors.accentStrong} />
            <AppText variant="meta" color={theme.colors.accentStrong}>
              {copy.reply}
            </AppText>
          </PressableScale>
        ) : null}
      </View>
      <AppText variant="body" style={styles.bubbleBody}>
        {comment.message}
      </AppText>
    </View>
  );
}
