import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { borderRadius, colors, shadows, sizes, spacing, typography } from '@/theme';
import { AppText } from '@/components/common/AppText';
import { GlassSheen, LiquidGlassFill, useLiquidGlass } from '@/components/common/GlassBackdrop';
import { PressableScale } from '@/components/common/PressableScale';

export type IconButtonVariant = 'glass' | 'soft' | 'plain' | 'primary' | 'accent' | 'slate';

export interface IconButtonProps {
  icon: LucideIcon;
  onPress?: () => void;
  /**
   * - `glass`: glass control on navy headers (back, notifications) — Apple's Liquid Glass on iOS 26.
   * - `slate`: the design's slate-indigo tile with a soft shadow.
   * - `soft`: tinted glass on light surfaces; `plain` / `primary` / `accent`: on light surfaces.
   */
  variant?: IconButtonVariant;
  size?: number;
  badge?: number;
  accessibilityLabel: string;
  accessibilityHint?: string;
  style?: StyleProp<ViewStyle>;
  /** Mirror the glyph horizontally (for directional icons in RTL). */
  mirrored?: boolean;
  disabled?: boolean;
}

const VARIANTS: Record<IconButtonVariant, { bg: string; fg: string; border: string; shadow?: ViewStyle }> = {
  glass: { bg: colors.glass, fg: colors.white, border: colors.glassBorder },
  slate: { bg: colors.secondary, fg: colors.white, border: colors.secondaryLight, shadow: shadows.tile },
  soft: { bg: colors.primarySoft, fg: colors.primary, border: colors.rimSoft },
  plain: { bg: 'transparent', fg: colors.textSecondary, border: 'transparent' },
  primary: { bg: colors.primary, fg: colors.white, border: 'transparent' },
  accent: { bg: colors.accent, fg: colors.white, border: 'transparent' },
};

export function IconButton({
  icon: Icon,
  onPress,
  variant = 'soft',
  size = sizes.iconButton,
  badge,
  accessibilityLabel,
  accessibilityHint,
  style,
  mirrored,
  disabled,
}: IconButtonProps) {
  const v = VARIANTS[variant];
  const liquidAvailable = useLiquidGlass();
  const liquid = variant === 'glass' && liquidAvailable;
  const radius = Math.round(size * 0.3);
  return (
    <PressableScale
      accessibilityLabel={badge ? `${accessibilityLabel} (${badge})` : accessibilityLabel}
      accessibilityHint={accessibilityHint}
      onPress={onPress}
      disabled={disabled}
      hitSlop={Math.max(0, Math.ceil((sizes.touchTarget - size) / 2))}
      style={[styles.base, { width: size, height: size, borderRadius: radius, backgroundColor: liquid ? 'transparent' : v.bg, borderColor: liquid ? 'transparent' : v.border }, v.shadow, style]}
    >
      {liquid || variant === 'glass' || variant === 'soft' ? (
        // Clipped on an inner layer so the badge can still hang over the corner.
        <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.clip, { borderRadius: radius }]}>
          {liquid ? <LiquidGlassFill radius={radius} dark /> : <GlassSheen dark={variant === 'glass'} />}
        </View>
      ) : null}
      <View style={mirrored ? styles.mirror : undefined}>
        <Icon size={Math.round(size * 0.48)} color={v.fg} strokeWidth={2} />
      </View>
      {badge ? (
        <View style={styles.badge}>
          <AppText variant="meta" color={colors.white} style={styles.badgeText}>
            {badge > 99 ? '99+' : badge}
          </AppText>
        </View>
      ) : null}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  base: { borderRadius: borderRadius.md, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  clip: { overflow: 'hidden' },
  mirror: { transform: [{ scaleX: -1 }] },
  badge: {
    position: 'absolute',
    top: -5,
    end: -5,
    minWidth: 20,
    height: 20,
    paddingHorizontal: spacing.xs5,
    borderRadius: borderRadius.pill,
    backgroundColor: colors.error,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  badgeText: { ...typography.countBadge },
});

export default IconButton;
