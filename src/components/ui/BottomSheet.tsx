import React from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';
import { borderRadius, colors, GUTTER, motion, RTL_ROOT, spacing } from '@/theme';
import { AppText } from '@/components/common/AppText';
import { GlassBackdrop } from '@/components/common/GlassBackdrop';
import { IconButton } from '@/components/common/IconButton';

export interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  /** Wrap children in a ScrollView (default true). */
  scroll?: boolean;
  maxHeightPercent?: number;
}

/**
 * Modal bottom sheet on frosted glass (live blur of the screen behind it). Modal content is a new native root,
 * so RTL direction is re-applied here.
 */
export function BottomSheet({ visible, onClose, title, subtitle, children, footer, scroll = true, maxHeightPercent = 88 }: BottomSheetProps) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent navigationBarTranslucent>
      <View style={styles.root}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="إغلاق">
          <Animated.View entering={FadeIn.duration(motion.duration.quick)} style={[StyleSheet.absoluteFill, styles.backdrop]} />
        </Pressable>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.kav} pointerEvents="box-none">
          <Animated.View
            entering={SlideInDown.duration(motion.duration.sheet)}
            style={[styles.sheet, { maxHeight: `${maxHeightPercent}%`, paddingBottom: footer ? 0 : Math.max(insets.bottom, spacing.lg) }]}
          >
            <GlassBackdrop material="sheet" />
            <View style={styles.handle} />
            {title ? (
              <View style={styles.header}>
                <View style={{ flex: 1 }}>
                  <AppText variant="sectionTitle">{title}</AppText>
                  {subtitle ? (
                    <AppText variant="caption" color={colors.textSecondary}>
                      {subtitle}
                    </AppText>
                  ) : null}
                </View>
                <IconButton icon={X} size={36} variant="soft" accessibilityLabel="إغلاق" onPress={onClose} />
              </View>
            ) : null}
            {scroll ? (
              <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                {children}
              </ScrollView>
            ) : (
              <View style={[styles.content, { flexShrink: 1 }]}>{children}</View>
            )}
            {footer ? <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>{footer}</View> : null}
          </Animated.View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end', ...RTL_ROOT },
  backdrop: { backgroundColor: colors.overlay },
  kav: { width: '100%', justifyContent: 'flex-end', flex: 1 },
  sheet: {
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: colors.rim,
    borderTopStartRadius: borderRadius.xxl,
    borderTopEndRadius: borderRadius.xxl,
    overflow: 'hidden',
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
  },
  handle: { width: 44, height: 5, borderRadius: borderRadius.pill, backgroundColor: colors.borderStrong, alignSelf: 'center', marginTop: spacing.sm, marginBottom: spacing.xs },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: GUTTER, paddingVertical: spacing.md },
  content: { paddingHorizontal: GUTTER, paddingBottom: spacing.lg },
  footer: { paddingHorizontal: GUTTER, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.frostSubtle },
});

export default BottomSheet;
