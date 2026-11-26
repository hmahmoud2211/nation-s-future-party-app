import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { borderRadius, borderWidth, colors, layout, shadows, spacing } from '@/theme';
import { PressableScale } from '@/components/common/PressableScale';

export type CardVariant = 'outlined' | 'soft' | 'solid';

export interface CardProps {
  children?: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  padded?: boolean;
  /**
   * - `outlined` (default): translucent white with the design's navy outline.
   * - `soft`: translucent white with a light border (dense nested content).
   * - `solid`: opaque white (on top of imagery / overlays).
   */
  variant?: CardVariant;
  /** Accent stripe colour. */
  accentColor?: string;
  /** Which edge carries the stripe — `start` (right in RTL, default) or `end` (left in RTL). */
  accentPosition?: 'start' | 'end';
  /** Stripe thickness (default 4; the dashboard highlight cards use a 20pt bar). */
  accentWidth?: number;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  testID?: string;
}

const VARIANTS: Record<CardVariant, ViewStyle> = {
  outlined: { backgroundColor: colors.card, borderColor: colors.cardBorder },
  soft: { backgroundColor: colors.card, borderColor: colors.border },
  solid: { backgroundColor: colors.cardSolid, borderColor: colors.border },
};

/** Card — the base surface of the design system. */
export function Card({
  children,
  onPress,
  style,
  padded = true,
  variant = 'outlined',
  accentColor,
  accentPosition = 'start',
  accentWidth = 4,
  accessibilityLabel,
  accessibilityHint,
  testID,
}: CardProps) {
  // Space kept between a thick accent bar and the content.
  const inset = padded ? layout.cardPadding : spacing.md;
  const content = (
    <>
      {accentColor ? <View style={[styles.accent, accentPosition === 'end' ? styles.accentEnd : styles.accentStart, { width: accentWidth, backgroundColor: accentColor }]} /> : null}
      {children}
    </>
  );
  const cardStyle = [
    styles.card,
    VARIANTS[variant],
    padded && styles.padded,
    accentColor && accentWidth > 6 ? (accentPosition === 'end' ? { paddingEnd: accentWidth + inset } : { paddingStart: accentWidth + inset }) : null,
    style,
  ];
  if (onPress) {
    return (
      <PressableScale testID={testID} accessibilityLabel={accessibilityLabel} accessibilityHint={accessibilityHint} onPress={onPress} scaleTo={0.985} style={cardStyle}>
        {content}
      </PressableScale>
    );
  }
  return (
    <View testID={testID} style={cardStyle}>
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.xl,
    borderWidth: borderWidth.card,
    overflow: 'hidden',
    ...shadows.card,
  },
  padded: { padding: layout.cardPadding },
  accent: { position: 'absolute', top: 0, bottom: 0 },
  accentStart: { start: 0 },
  accentEnd: { end: 0 },
});

export default Card;
