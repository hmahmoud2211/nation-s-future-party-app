import React from 'react';
import { ActivityIndicator, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { LucideIcon } from 'lucide-react-native';
import { borderRadius, colors, gradients, sizes, spacing } from '@/theme';
import { AppText } from '@/components/common/AppText';
import { PressableScale } from '@/components/common/PressableScale';

export type ButtonVariant = 'primary' | 'accent' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'dangerOutline' | 'success';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps {
  title: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: LucideIcon;
  iconPosition?: 'start' | 'end';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
  testID?: string;
}

const VARIANTS: Record<ButtonVariant, { bg: string; fg: string; border?: string; gradient?: readonly [string, string, ...string[]] }> = {
  /** Navy gradient — same surface as the dashboard tiles. */
  primary: { bg: colors.primary, fg: colors.onPrimary, gradient: gradients.tile },
  accent: { bg: colors.accent, fg: colors.onPrimary },
  secondary: { bg: colors.primarySoft, fg: colors.primary },
  outline: { bg: colors.card, fg: colors.primary, border: colors.cardBorder },
  ghost: { bg: 'transparent', fg: colors.primary },
  danger: { bg: colors.error, fg: colors.white },
  dangerOutline: { bg: colors.card, fg: colors.error, border: colors.error },
  success: { bg: colors.success, fg: colors.white },
};

const SIZES: Record<ButtonSize, { height: number; px: number; icon: number }> = {
  sm: { height: sizes.button.sm, px: spacing.md, icon: sizes.icon.sm },
  md: { height: sizes.button.md, px: spacing.lg, icon: 18 },
  lg: { height: sizes.button.lg, px: spacing.xl, icon: sizes.icon.md },
};

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'start',
  loading,
  disabled,
  fullWidth,
  style,
  accessibilityLabel,
  testID,
}: ButtonProps) {
  const v = VARIANTS[variant];
  const s = SIZES[size];
  const iconEl = Icon ? <Icon size={s.icon} color={v.fg} strokeWidth={2.2} /> : null;
  return (
    <PressableScale
      testID={testID}
      haptic
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityState={{ disabled: !!disabled || !!loading, busy: !!loading }}
      disabled={disabled || loading}
      onPress={onPress}
      style={[
        styles.base,
        {
          height: s.height,
          paddingHorizontal: s.px,
          backgroundColor: v.bg,
          borderColor: v.border ?? 'transparent',
          borderWidth: v.border ? 1 : 0,
        },
        fullWidth && styles.full,
        style,
      ]}
    >
      {v.gradient ? <LinearGradient colors={v.gradient} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }} style={StyleSheet.absoluteFill} /> : null}
      {loading ? (
        <ActivityIndicator color={v.fg} />
      ) : (
        <View style={styles.row}>
          {iconPosition === 'start' && iconEl}
          <AppText variant={size === 'sm' ? 'label' : 'button'} color={v.fg} numberOfLines={1}>
            {title}
          </AppText>
          {iconPosition === 'end' && iconEl}
        </View>
      )}
    </PressableScale>
  );
}

/** Aliases requested by the component spec. */
export const PrimaryButton = (p: Omit<ButtonProps, 'variant'>) => <Button {...p} variant="primary" />;
export const SecondaryButton = (p: Omit<ButtonProps, 'variant'>) => <Button {...p} variant="secondary" />;

const styles = StyleSheet.create({
  base: {
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  full: { alignSelf: 'stretch' },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
});

export default Button;
