import React, { useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';
import { CircleAlert, CircleCheck, MessageSquareText } from 'lucide-react-native';
import { useDialogState, type OpenDialog } from '@/hooks/useOverlays';
import { borderRadius, colors, MAX_FONT_SCALE, motion, RTL_ROOT, shadows, spacing, typography } from '@/theme';
import { AppText } from '@/components/common/AppText';
import { Button } from '@/components/common/Button';

type Dialog = OpenDialog;

const keys = new WeakMap<object, number>();
let keySeq = 0;
function dialogKey(d: Dialog) {
  if (!keys.has(d)) keys.set(d, ++keySeq);
  return keys.get(d)!;
}

/** Renders confirm / prompt dialogs requested through `confirmDialog()` / `promptDialog()`. */
export function DialogHost() {
  const { dialog } = useDialogState();
  if (!dialog) return null;
  // Keying by dialog identity resets the input state for every new dialog.
  return <DialogCard key={dialogKey(dialog)} dialog={dialog} />;
}

function DialogCard({ dialog }: { dialog: Dialog }) {
  const { closeDialog } = useDialogState();
  const [value, setValue] = useState(dialog.kind === 'prompt' ? (dialog.options.initialValue ?? '') : '');
  const [error, setError] = useState<string | null>(null);

  const { options } = dialog;
  const tone = options.tone ?? 'primary';
  const Icon = dialog.kind === 'prompt' ? MessageSquareText : tone === 'danger' ? CircleAlert : CircleCheck;
  const iconColor = tone === 'danger' ? colors.error : tone === 'success' ? colors.success : colors.accent;
  const iconBg = tone === 'danger' ? colors.errorSoft : tone === 'success' ? colors.successSoft : colors.accentSoft;

  const cancel = () => {
    if (dialog.kind === 'confirm') dialog.resolve(false);
    else dialog.resolve(null);
    closeDialog();
  };
  const accept = () => {
    if (dialog.kind === 'confirm') {
      dialog.resolve(true);
      closeDialog();
      return;
    }
    if (dialog.options.required && !value.trim()) {
      setError(dialog.options.requiredMessage ?? 'هذا الحقل مطلوب');
      return;
    }
    dialog.resolve(value.trim());
    closeDialog();
  };

  return (
    <Modal visible transparent animationType="none" onRequestClose={cancel} statusBarTranslucent>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.root}>
        <Pressable style={StyleSheet.absoluteFill} onPress={cancel} accessibilityLabel="إغلاق">
          <Animated.View entering={FadeIn.duration(motion.duration.fast)} style={[StyleSheet.absoluteFill, { backgroundColor: colors.overlay }]} />
        </Pressable>
        <Animated.View entering={ZoomIn.duration(motion.duration.short)} style={styles.card} accessibilityViewIsModal>
          <View style={[styles.icon, { backgroundColor: iconBg }]}>
            <Icon size={26} color={iconColor} />
          </View>
          <AppText variant="sectionTitle" align="center">
            {options.title}
          </AppText>
          {options.message ? (
            <AppText variant="body" color={colors.textSecondary} align="center" style={{ marginTop: spacing.xs }}>
              {options.message}
            </AppText>
          ) : null}
          {dialog.kind === 'prompt' ? (
            <View style={{ alignSelf: 'stretch', marginTop: spacing.lg }}>
              <TextInput
                value={value}
                onChangeText={(t) => {
                  setValue(t);
                  if (error) setError(null);
                }}
                placeholder={dialog.options.placeholder}
                placeholderTextColor={colors.placeholder}
                multiline
                autoFocus
                maxFontSizeMultiplier={MAX_FONT_SCALE}
                style={[styles.input, error && { borderColor: colors.error }]}
                textAlignVertical="top"
                accessibilityLabel={dialog.options.placeholder ?? options.title}
              />
              {error ? (
                <AppText variant="caption" color={colors.error} style={{ marginTop: spacing.xs }}>
                  {error}
                </AppText>
              ) : null}
            </View>
          ) : null}
          <View style={styles.buttons}>
            <Button
              title={options.confirmLabel ?? 'تأكيد'}
              variant={tone === 'danger' ? 'danger' : tone === 'success' ? 'success' : 'primary'}
              onPress={accept}
              style={{ flex: 1 }}
            />
            <Button title={options.cancelLabel ?? 'إلغاء'} variant="outline" onPress={cancel} style={{ flex: 1 }} />
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xxl, ...RTL_ROOT },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.xxl,
    alignItems: 'center',
    ...shadows.overlay,
  },
  icon: { width: 56, height: 56, borderRadius: borderRadius.pill, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md },
  input: {
    minHeight: 96,
    maxHeight: 180,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontFamily: typography.inputCompact.fontFamily,
    fontSize: typography.inputCompact.fontSize,
    color: colors.text,
    textAlign: 'right',
    writingDirection: 'rtl',
    backgroundColor: colors.background,
  },
  buttons: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xl, alignSelf: 'stretch' },
});

export default DialogHost;
