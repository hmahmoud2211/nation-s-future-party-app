import React from 'react';
import { StyleSheet, View } from 'react-native';
import { CircleHelp } from 'lucide-react-native';
import { borderRadius, colors, spacing } from '@/theme';
import type { Attachment } from '@/types/common.types';
import { formatRelative } from '@/utils/format';
import { FilePreview } from '@/components/forms/AttachmentPicker';
import { AppText } from '@/components/common/AppText';
import { Avatar } from '@/components/common/Avatar';

/** How a message author is shown. */
export interface ThreadAuthor {
  name: string;
  avatarColor?: string;
  /** Role / position label shown after the name. */
  label?: string;
}

export interface ThreadMessage {
  id: string;
  authorId: string;
  message: string;
  createdAt: string;
  kind?: string;
  attachments?: Attachment[];
}

/**
 * Threaded conversation. Current user's messages sit on the end (left) side in navy,
 * others on the start (right) side — mirrored chat layout for Arabic.
 */
export function MessageThread({ messages, currentUserId, authorOf, emptyText = 'لا توجد رسائل بعد' }: { messages: ThreadMessage[]; currentUserId: string; /** Who wrote a message (name, avatar colour, role label). */ authorOf: (authorId: string) => ThreadAuthor | undefined; emptyText?: string }) {
  if (messages.length === 0) {
    return (
      <AppText variant="caption" color={colors.textSecondary} align="center" style={{ paddingVertical: spacing.lg }}>
        {emptyText}
      </AppText>
    );
  }
  return (
    <View style={{ gap: spacing.md }}>
      {messages.map((m) => {
        if (m.kind === 'system') {
          return (
            <View key={m.id} style={styles.system}>
              <AppText variant="meta" color={colors.textSecondary} align="center">
                {`${m.message} • ${formatRelative(m.createdAt)}`}
              </AppText>
            </View>
          );
        }
        const mine = m.authorId === currentUserId;
        const author = authorOf(m.authorId);
        const info = m.kind === 'info_request';
        const review = m.kind === 'review';
        const submission = m.kind === 'submission';
        return (
          <View key={m.id} style={[styles.row, mine ? styles.rowMine : styles.rowOther]}>
            {!mine ? <Avatar name={author?.name ?? '؟'} color={author?.avatarColor} size={32} /> : null}
            <View style={[styles.bubbleWrap, mine ? { alignItems: 'flex-end' } : { alignItems: 'flex-start' }]}>
              <AppText variant="meta" color={colors.textSecondary}>
                {mine ? 'أنت' : `${author?.name ?? 'مستخدم'}${author?.label ? ` • ${author.label}` : ''}`}
              </AppText>
              <View style={[styles.bubble, mine ? styles.mine : styles.other, info && styles.info, review && !mine && styles.review]}>
                {info || review || submission ? (
                  <View style={styles.tagRow}>
                    {info ? <CircleHelp size={13} color={colors.accentStrong} /> : null}
                    <AppText variant="meta" color={mine ? colors.accentLight : colors.accentStrong}>
                      {info ? 'طلب معلومات إضافية' : review ? 'ملاحظة المراجعة' : 'تسليم العمل'}
                    </AppText>
                  </View>
                ) : null}
                <AppText variant="body" color={mine ? colors.white : colors.text}>
                  {m.message}
                </AppText>
                {m.attachments?.length ? (
                  <View style={{ gap: spacing.xs6, marginTop: spacing.sm }}>
                    {m.attachments.map((a) => (
                      <FilePreview key={a.id} file={a} />
                    ))}
                  </View>
                ) : null}
              </View>
              <AppText variant="meta" color={colors.textMuted}>
                {formatRelative(m.createdAt)}
              </AppText>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' },
  rowMine: { justifyContent: 'flex-end' },
  rowOther: { justifyContent: 'flex-start' },
  bubbleWrap: { maxWidth: '82%', gap: spacing.xxs3 },
  bubble: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm + 2, borderRadius: borderRadius.lg },
  mine: { backgroundColor: colors.primary, borderTopEndRadius: 4 },
  other: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, borderTopStartRadius: 4 },
  info: { borderWidth: 1.5, borderColor: colors.accent },
  review: { backgroundColor: colors.accentSoft, borderColor: colors.accentLight },
  tagRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: spacing.xxs },
  system: { alignSelf: 'center', backgroundColor: colors.primarySoft, borderRadius: borderRadius.pill, paddingHorizontal: spacing.md, paddingVertical: spacing.xs },
});

export default MessageThread;
