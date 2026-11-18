import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { colors, radius, shadows, spacing } from '@/theme';
import { PressableScale } from './PressableScale';

export interface CardProps {
  children?: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  padded?: boolean;
  /** Accent stripe on the start (right) edge. */
  accentColor?: string;
  accessibilityLabel?: string;
  testID?: string;
}

/** Clean white card — the base surface of the design system. */
export function Card({ children, onPress, style, padded = true, accentColor, accessibilityLabel, testID }: CardProps) {
  const content = (
    <>
      {accentColor ? <View style={[styles.accent, { backgroundColor: accentColor }]} /> : null}
      {children}
    </>
  );
  const cardStyle = [styles.card, padded && styles.padded, style];
  if (onPress) {
    return (
      <PressableScale testID={testID} accessibilityLabel={accessibilityLabel} onPress={onPress} scaleTo={0.985} style={cardStyle}>
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
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    ...shadows.card,
  },
  padded: { padding: spacing.md + 2 },
  accent: { position: 'absolute', start: 0, top: 0, bottom: 0, width: 4 },
});

export default Card;
