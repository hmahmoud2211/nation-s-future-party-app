import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { FlaskConical } from 'lucide-react-native';
import { useAppStore } from '@/store';
import { colors, radius, spacing } from '@/theme';
import { AppText } from '../ui/AppText';

/** Small notice reminding that an action is simulated (no backend). */
export function DemoNotice({ text = 'نسخة تجريبية — أسماء قيادة الأمانة ومسؤولي اللجان حقيقية، وباقي البيانات تجريبية وتُحفظ في الذاكرة فقط خلال الجلسة.', style }: { text?: string; style?: StyleProp<ViewStyle> }) {
  const show = useAppStore((s) => s.settings.showDemoHints);
  if (!show) return null;
  return (
    <View style={[styles.box, style]}>
      <FlaskConical size={15} color={colors.goldDark} />
      <AppText variant="meta" color={colors.goldDark} style={{ flex: 1 }}>
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
    backgroundColor: colors.goldSoft,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.goldLight,
  },
});

export default DemoNotice;
