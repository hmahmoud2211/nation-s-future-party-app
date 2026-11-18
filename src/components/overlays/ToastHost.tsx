import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CircleAlert, CircleCheck, Info, TriangleAlert } from 'lucide-react-native';
import { useUIStore } from '@/store/uiStore';
import { colors, radius, spacing } from '@/theme';
import { AppText } from '../ui/AppText';

const TONES = {
  success: { icon: CircleCheck, color: colors.success },
  error: { icon: CircleAlert, color: colors.error },
  info: { icon: Info, color: colors.info },
  warning: { icon: TriangleAlert, color: colors.warning },
} as const;

/** Global toast (success / error feedback for every action). */
export function ToastHost() {
  const toast = useUIStore((s) => s.toast);
  const hide = useUIStore((s) => s.hideToast);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(hide, toast.tone === 'error' ? 3600 : 2600);
    return () => clearTimeout(t);
  }, [toast, hide]);

  if (!toast) return null;
  const tone = TONES[toast.tone];
  const Icon = tone.icon;
  return (
    <View pointerEvents="box-none" style={[styles.wrap, { top: insets.top + spacing.sm }]}>
      <Animated.View key={toast.id} entering={FadeInUp.duration(220)} exiting={FadeOutUp.duration(180)} style={styles.toast}>
        <View style={[styles.icon, { backgroundColor: tone.color }]}>
          <Icon size={16} color={colors.white} strokeWidth={2.5} />
        </View>
        <AppText variant="bodyMedium" color={colors.white} style={{ flex: 1 }} onPress={hide}>
          {toast.message}
        </AppText>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', start: spacing.lg, end: spacing.lg, alignItems: 'center', zIndex: 1000 },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.navy,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    width: '100%',
    maxWidth: 520,
    borderWidth: 1,
    borderColor: 'rgba(198,154,53,0.35)',
    boxShadow: '0px 12px 30px rgba(6,27,73,0.30)',
  },
  icon: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
});

export default ToastHost;
