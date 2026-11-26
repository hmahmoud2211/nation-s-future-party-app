import React from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/common/AppText';
import { borderRadius, colors, spacing } from '@/theme';

/** Small boxed note (e.g. "management-only" hints). */
export function InlineNote({ text, tone = 'info' }: { text: string; tone?: 'info' | 'accent' }) {
  return (
    <View style={[styles.note, tone === 'accent' ? styles.noteAccent : styles.noteInfo]}>
      <AppText variant="caption" color={tone === 'accent' ? colors.accentStrong : colors.info}>
        {text}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  note: { borderRadius: borderRadius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderWidth: 1 },
  noteInfo: { backgroundColor: colors.infoSoft, borderColor: colors.infoBorder },
  noteAccent: { backgroundColor: colors.accentSoft, borderColor: colors.accentLight },
});
