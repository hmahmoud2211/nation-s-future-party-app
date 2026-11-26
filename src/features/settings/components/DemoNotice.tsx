import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { FlaskConical } from 'lucide-react-native';
import { useSettings } from '@/features/settings/hooks/useSettings';
import { borderRadius, colors, spacing } from '@/theme';
import { AppText } from '@/components/common/AppText';

/** Small notice reminding that an action is simulated (no backend). */
export function DemoNotice({ text = 'نسخة تجريبية — أسماء قيادة الأمانة ومسؤولي اللجان حقيقية، وباقي البيانات تجريبية وتُحفظ في الذاكرة فقط خلال الجلسة.', style }: { text?: string; style?: StyleProp<ViewStyle> }) {
  const show = useSettings().showDemoHints;
  if (!show) return null;
  return (
    <View style={[styles.box, style]}>
      <FlaskConical size={15} color={colors.accentStrong} />
      <AppText variant="meta" color={colors.accentStrong} style={{ flex: 1 }}>
        {text}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.accentSoft,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.accentLight,
  },
});

export default DemoNotice;
