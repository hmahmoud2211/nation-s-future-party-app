import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { Image } from 'expo-image';
import { FileText, Image as ImageIcon, Paperclip, X } from 'lucide-react-native';
import { useToast } from '@/hooks/useOverlays';
import { borderRadius, colors, spacing } from '@/theme';
import type { Attachment } from '@/types/common.types';
import { formatFileSize, formatRelative } from '@/utils/format';
import { nowISO, uid } from '@/utils/id';
import { AppText } from '@/components/common/AppText';
import { PressableScale } from '@/components/common/PressableScale';

/** Shows a selected file's name & metadata (never uploaded). */
export function FilePreview({ file, onRemove }: { file: Attachment; onRemove?: () => void }) {
  const isImage = file.mimeType?.startsWith('image/');
  return (
    <View style={styles.file}>
      {isImage && file.uri ? (
        <Image source={{ uri: file.uri }} style={styles.thumb} contentFit="cover" />
      ) : (
        <View style={styles.fileIcon}>{isImage ? <ImageIcon size={18} color={colors.primary} /> : <FileText size={18} color={colors.primary} />}</View>
      )}
      <View style={{ flex: 1 }}>
        <AppText variant="captionMedium" numberOfLines={1} arabicDigits={false}>
          {file.name}
        </AppText>
        <AppText variant="meta" color={colors.textSecondary} numberOfLines={1}>
          {[formatFileSize(file.size), file.uri ? 'محفوظ محلياً في هذه الجلسة' : 'ملف تجريبي', formatRelative(file.addedAt)].filter(Boolean).join(' • ')}
        </AppText>
      </View>
      {onRemove ? (
        <PressableScale onPress={onRemove} hitSlop={8} style={styles.remove} accessibilityLabel="إزالة المرفق">
          <X size={14} color={colors.error} />
        </PressableScale>
      ) : null}
    </View>
  );
}

export interface AttachmentPickerProps {
  value: Attachment[];
  onChange: (files: Attachment[]) => void;
  label?: string;
  max?: number;
  compact?: boolean;
  /** Id of the person attaching the files (stored as `addedBy`). */
  userId?: string;
}

/**
 * Picks local files with expo-document-picker. Files are NOT uploaded anywhere —
 * only the local URI + metadata are kept in memory for the current session.
 */
export function AttachmentPicker({ value, onChange, label = 'إضافة مرفق', max = 5, compact, userId = 'guest' }: AttachmentPickerProps) {
  const toast = useToast();

  const pick = async () => {
    if (value.length >= max) {
      toast.warning(`الحد الأقصى ${max} مرفقات`);
      return;
    }
    try {
      const res = await DocumentPicker.getDocumentAsync({ type: ['application/pdf', 'image/*', '*/*'], multiple: true, copyToCacheDirectory: Platform.OS !== 'web' });
      if (res.canceled) return;
      const files: Attachment[] = res.assets.slice(0, max - value.length).map((a) => ({
        id: uid('att'),
        name: a.name,
        size: a.size,
        mimeType: a.mimeType,
        uri: a.uri,
        addedAt: nowISO(),
        addedBy: userId,
      }));
      onChange([...value, ...files]);
      toast.info('تم إرفاق الملف محلياً (لن يتم رفعه لأي خادم)');
    } catch {
      toast.error('تعذر فتح منتقي الملفات');
    }
  };

  return (
    <View style={{ gap: spacing.sm }}>
      {value.map((f) => (
        <FilePreview key={f.id} file={f} onRemove={() => onChange(value.filter((x) => x.id !== f.id))} />
      ))}
      <PressableScale onPress={pick} style={[styles.add, compact && styles.addCompact]} accessibilityLabel={label}>
        <Paperclip size={18} color={colors.primary} />
        <View style={{ flex: compact ? 0 : 1 }}>
          <AppText variant="captionMedium" color={colors.primary}>
            {label}
          </AppText>
          {!compact ? (
            <AppText variant="meta" color={colors.textSecondary}>
              مستند أو صورة — يبقى على جهازك خلال الجلسة فقط
            </AppText>
          ) : null}
        </View>
      </PressableScale>
    </View>
  );
}

const styles = StyleSheet.create({
  file: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.sm + 2,
    borderRadius: borderRadius.md,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  fileIcon: { width: 40, height: 40, borderRadius: borderRadius.sm, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  thumb: { width: 40, height: 40, borderRadius: borderRadius.sm, backgroundColor: colors.primarySoft },
  remove: { width: 28, height: 28, borderRadius: borderRadius.pill, backgroundColor: colors.errorSoft, alignItems: 'center', justifyContent: 'center' },
  add: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.borderStrong,
    backgroundColor: colors.tint,
  },
  addCompact: { alignSelf: 'flex-start', paddingVertical: spacing.sm },
});

export default AttachmentPicker;
