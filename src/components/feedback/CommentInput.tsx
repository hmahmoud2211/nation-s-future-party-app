import React, { useState } from 'react';
import { Platform, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Paperclip, Send } from 'lucide-react-native';
import { colors, fonts, GUTTER, MAX_FONT_SCALE, radius, spacing } from '@/theme';
import type { Attachment } from '@/types';
import { AttachmentPicker, FilePreview } from '../forms/AttachmentPicker';
import { BottomSheet } from '../overlays/BottomSheet';
import { AppText } from '../ui/AppText';
import { PressableScale } from '../ui/PressableScale';

export interface CommentInputProps {
  /** Return true to clear the composer. */
  onSend: (text: string, attachments: Attachment[]) => boolean | void;
  placeholder?: string;
  disabled?: boolean;
  disabledText?: string;
  allowAttachments?: boolean;
  /** Render as a sticky bar with safe-area padding (chat screens). */
  sticky?: boolean;
}

/** Message composer with optional local attachments. */
export function CommentInput({ onSend, placeholder = 'اكتب ردك هنا…', disabled, disabledText, allowAttachments, sticky = true }: CommentInputProps) {
  const [text, setText] = useState('');
  const [files, setFiles] = useState<Attachment[]>([]);
  const [sheet, setSheet] = useState(false);
  const insets = useSafeAreaInsets();

  if (disabled) {
    return (
      <View style={[styles.bar, sticky && { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
        <AppText variant="caption" color={colors.textSecondary} align="center">
          {disabledText ?? 'لا يمكن إضافة ردود حالياً'}
        </AppText>
      </View>
    );
  }

  const send = () => {
    if (!text.trim()) return;
    const res = onSend(text.trim(), files);
    if (res !== false) {
      setText('');
      setFiles([]);
    }
  };

  return (
    <View style={[styles.bar, sticky && { paddingBottom: Math.max(insets.bottom, spacing.md) }, !sticky && styles.inline]}>
      {files.length ? (
        <View style={{ gap: 6, marginBottom: spacing.sm }}>
          {files.map((f) => (
            <FilePreview key={f.id} file={f} onRemove={() => setFiles(files.filter((x) => x.id !== f.id))} />
          ))}
        </View>
      ) : null}
      <View style={styles.row}>
        {allowAttachments ? (
          <PressableScale onPress={() => setSheet(true)} style={styles.iconBtn} accessibilityLabel="إرفاق ملف">
            <Paperclip size={19} color={colors.navy2} />
          </PressableScale>
        ) : null}
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          multiline
          maxFontSizeMultiplier={MAX_FONT_SCALE}
          style={styles.input}
          accessibilityLabel={placeholder}
        />
        <PressableScale onPress={send} disabled={!text.trim()} style={[styles.send, !text.trim() && { backgroundColor: colors.borderStrong }]} accessibilityLabel="إرسال">
          {/* Mirror the send glyph so it points towards the reading direction */}
          <View style={{ transform: [{ scaleX: -1 }] }}>
            <Send size={18} color={colors.white} />
          </View>
        </PressableScale>
      </View>
      {allowAttachments ? (
        <BottomSheet visible={sheet} onClose={() => setSheet(false)} title="إرفاق ملف">
          <AttachmentPicker
            value={files}
            onChange={(f) => {
              setFiles(f);
              setSheet(false);
            }}
          />
        </BottomSheet>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: GUTTER,
    paddingTop: spacing.sm + 2,
  },
  inline: { borderTopWidth: 0, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.md, paddingBottom: spacing.sm + 2 },
  row: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    borderRadius: radius.lg,
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingTop: Platform.OS === 'ios' ? 12 : 8,
    paddingBottom: Platform.OS === 'ios' ? 12 : 8,
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.text,
    textAlign: 'right',
    writingDirection: 'rtl',
    ...(Platform.OS === 'web' ? ({ outlineStyle: 'none' } as object) : null),
  },
  iconBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.navySoft, alignItems: 'center', justifyContent: 'center' },
  send: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.navy, alignItems: 'center', justifyContent: 'center' },
});

export default CommentInput;
