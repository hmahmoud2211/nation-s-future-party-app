import React from 'react';
import { ActivityIndicator, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { colors, radius, spacing } from '@/theme';
import { AppText } from './AppText';
import { PressableScale } from './PressableScale';

export type ButtonVariant = 'primary' | 'gold' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'dangerOutline' | 'success';
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

const VARIANTS: Record<ButtonVariant, { bg: string; fg: string; border?: string }> = {
  primary: { bg: colors.navy, fg: colors.white },
  gold: { bg: colors.gold, fg: colors.navy },
  secondary: { bg: colors.navySoft, fg: colors.navy2 },
  outline: { bg: colors.white, fg: colors.navy2, border: colors.borderStrong },
  ghost: { bg: 'transparent', fg: colors.navy2 },
  danger: { bg: colors.error, fg: colors.white },
  dangerOutline: { bg: colors.white, fg: colors.error, border: '#F0C4C4' },
  success: { bg: colors.success, fg: colors.white },
};

const SIZES: Record<ButtonSize, { height: number; px: number; icon: number }> = {
  sm: { height: 38, px: spacing.md, icon: 16 },
  md: { height: 48, px: spacing.lg, icon: 18 },
  lg: { height: 54, px: spacing.xl, icon: 20 },
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
      accessibilityState={{ disabled: !!disabled || !!loading }}
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
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  full: { alignSelf: 'stretch' },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
});

export default Button;
