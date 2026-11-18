import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { colors, radius } from '@/theme';
import { AppText } from './AppText';
import { PressableScale } from './PressableScale';

export interface IconButtonProps {
  icon: LucideIcon;
  onPress?: () => void;
  variant?: 'glass' | 'soft' | 'plain' | 'navy' | 'gold';
  size?: number;
  badge?: number;
  accessibilityLabel: string;
  style?: StyleProp<ViewStyle>;
  /** Mirror the glyph horizontally (for directional icons in RTL). */
  mirrored?: boolean;
  disabled?: boolean;
}

const VARIANTS = {
  glass: { bg: 'rgba(255,255,255,0.12)', fg: colors.white, border: 'rgba(255,255,255,0.18)' },
  soft: { bg: colors.navySoft, fg: colors.navy2, border: 'transparent' },
  plain: { bg: 'transparent', fg: colors.textSecondary, border: 'transparent' },
  navy: { bg: colors.navy, fg: colors.white, border: 'transparent' },
  gold: { bg: colors.gold, fg: colors.navy, border: 'transparent' },
} as const;

export function IconButton({ icon: Icon, onPress, variant = 'soft', size = 42, badge, accessibilityLabel, style, mirrored, disabled }: IconButtonProps) {
  const v = VARIANTS[variant];
  return (
    <PressableScale
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      disabled={disabled}
      hitSlop={6}
      style={[styles.base, { width: size, height: size, backgroundColor: v.bg, borderColor: v.border }, style]}
    >
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
  base: { borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  mirror: { transform: [{ scaleX: -1 }] },
  badge: {
    position: 'absolute',
    top: -4,
    end: -4,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 5,
    borderRadius: 10,
    backgroundColor: colors.error,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.navy,
  },
  badgeText: { fontSize: 10, lineHeight: 14 },
});

export default IconButton;
