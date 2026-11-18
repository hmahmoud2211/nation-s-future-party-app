import React, { useState } from 'react';
import { Platform, StyleSheet, TextInput, View, type StyleProp, type TextInputProps, type ViewStyle } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { colors, fonts, MAX_FONT_SCALE, radius, spacing } from '@/theme';
import { AppText } from '../ui/AppText';

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
      {Icon ? <Icon size={18} color={focused ? colors.navy2 : colors.textMuted} style={multiline ? { marginTop: 12 } : undefined} /> : null}
      <TextInput
        placeholderTextColor={colors.textMuted}
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
    minHeight: 50,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  multiline: { alignItems: 'flex-start', minHeight: 112 },
  focused: { borderColor: colors.navy2, boxShadow: '0px 0px 0px 3px rgba(11,43,104,0.08)' },
  error: { borderColor: colors.error },
  disabled: { backgroundColor: colors.navyTint },
  input: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 14.5,
    color: colors.text,
    textAlign: 'right',
    writingDirection: 'rtl',
    paddingVertical: Platform.OS === 'web' ? 12 : 10,
    ...(Platform.OS === 'web' ? ({ outlineStyle: 'none' } as object) : null),
  },
  inputMultiline: { minHeight: 100, paddingTop: 12, lineHeight: 23 },
});

export default AppInput;
