import React, { useState } from 'react';
import { Platform, StyleSheet, TextInput, View, type StyleProp, type TextInputProps, type ViewStyle } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { borderRadius, colors, MAX_FONT_SCALE, shadows, sizes, spacing, typography } from '@/theme';
import { AppText } from '@/components/common/AppText';

export interface AppInputProps extends TextInputProps {
  icon?: LucideIcon;
  /** Text shown at the end (left) — e.g. currency. */
  suffix?: string;
  error?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  right?: React.ReactNode;
}

/** RTL text input — explicit right alignment (inputs don't inherit Yoga direction). */
export function AppInput({ icon: Icon, suffix, error, containerStyle, style, onFocus, onBlur, multiline, right, ...rest }: AppInputProps) {
  const [focused, setFocused] = useState(false);
  return (
    <View
      style={[
        styles.wrap,
        multiline && styles.multiline,
        focused && styles.focused,
        error && styles.error,
        rest.editable === false && styles.disabled,
        containerStyle,
      ]}
    >
      {Icon ? <Icon size={18} color={focused ? colors.primary : colors.textMuted} style={multiline ? { marginTop: spacing.md } : undefined} /> : null}
      <TextInput
        placeholderTextColor={colors.placeholder}
        maxFontSizeMultiplier={MAX_FONT_SCALE}
        multiline={multiline}
        textAlignVertical={multiline ? 'top' : 'center'}
        {...rest}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        style={[styles.input, multiline && styles.inputMultiline, style]}
      />
      {suffix ? (
        <AppText variant="captionMedium" color={colors.textSecondary}>
          {suffix}
        </AppText>
      ) : null}
      {right}
    </View>
  );
}

export function TextArea(props: AppInputProps) {
  return <AppInput multiline numberOfLines={4} {...props} />;
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: sizes.input,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    // Opaque so typed text stays crisp over the gradient page background.
    backgroundColor: colors.frostStrong,
  },
  multiline: { alignItems: 'flex-start', minHeight: 112 },
  focused: { borderColor: colors.primary, ...shadows.focus },
  error: { borderColor: colors.error },
  disabled: { backgroundColor: colors.tint },
  input: {
    flex: 1,
    fontFamily: typography.input.fontFamily,
    fontSize: typography.input.fontSize,
    color: colors.text,
    textAlign: 'right',
    writingDirection: 'rtl',
    paddingVertical: Platform.OS === 'web' ? 12 : 10,
    ...(Platform.OS === 'web' ? ({ outlineStyle: 'none' } as object) : null),
  },
  inputMultiline: { minHeight: 100, paddingTop: spacing.md, lineHeight: typography.inputMultiline.lineHeight },
});

export default AppInput;
