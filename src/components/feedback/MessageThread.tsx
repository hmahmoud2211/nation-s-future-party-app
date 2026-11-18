import React from 'react';
import { StyleSheet, View } from 'react-native';
import { CircleHelp } from 'lucide-react-native';
import { personLabel } from '@/utils/roles';
import { useMemberMap } from '@/store';
import { colors, radius, spacing } from '@/theme';
import type { Attachment } from '@/types';
import { formatRelative } from '@/utils/format';
import { FilePreview } from '../forms/AttachmentPicker';
import { AppText } from '../ui/AppText';
import { Avatar } from '../ui/Avatar';

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
export function MessageThread({ messages, currentUserId, emptyText = 'لا توجد رسائل بعد' }: { messages: ThreadMessage[]; currentUserId: string; emptyText?: string }) {
  const members = useMemberMap();
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
        const author = members[m.authorId];
        const info = m.kind === 'info_request';
        const review = m.kind === 'review';
        const submission = m.kind === 'submission';
        return (
          <View key={m.id} style={[styles.row, mine ? styles.rowMine : styles.rowOther]}>
            {!mine ? <Avatar name={author?.name ?? '؟'} color={author?.avatarColor} size={32} /> : null}
            <View style={[styles.bubbleWrap, mine ? { alignItems: 'flex-end' } : { alignItems: 'flex-start' }]}>
              <AppText variant="meta" color={colors.textSecondary}>
                {mine ? 'أنت' : `${author?.name ?? 'مستخدم'}${author ? ` • ${personLabel(author)}` : ''}`}
              </AppText>
              <View style={[styles.bubble, mine ? styles.mine : styles.other, info && styles.info, review && !mine && styles.review]}>
                {info || review || submission ? (
                  <View style={styles.tagRow}>
                    {info ? <CircleHelp size={13} color={colors.goldDark} /> : null}
                    <AppText variant="meta" color={mine ? colors.goldLight : colors.goldDark}>
                      {info ? 'طلب معلومات إضافية' : review ? 'ملاحظة المراجعة' : 'تسليم العمل'}
                    </AppText>
                  </View>
                ) : null}
                <AppText variant="body" color={mine ? colors.white : colors.text}>
                  {m.message}
                </AppText>
                {m.attachments?.length ? (
                  <View style={{ gap: 6, marginTop: spacing.sm }}>
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
  bubbleWrap: { maxWidth: '82%', gap: 3 },
  bubble: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm + 2, borderRadius: radius.lg },
  mine: { backgroundColor: colors.navy2, borderTopEndRadius: 4 },
  other: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, borderTopStartRadius: 4 },
  info: { borderWidth: 1.5, borderColor: colors.gold },
  review: { backgroundColor: colors.goldSoft, borderColor: colors.goldLight },
  tagRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 2 },
  system: { alignSelf: 'center', backgroundColor: colors.navySoft, borderRadius: radius.pill, paddingHorizontal: spacing.md, paddingVertical: 4 },
});

export default MessageThread;
