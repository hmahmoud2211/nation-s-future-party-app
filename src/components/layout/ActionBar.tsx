import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, GUTTER, shadows, spacing } from '@/theme';

/** Sticky bottom action bar for primary screen actions. */
export function ActionBar({ children, style, column }: { children: React.ReactNode; style?: StyleProp<ViewStyle>; column?: boolean }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, spacing.md) }, style]}>
      <View style={[column ? styles.column : styles.row]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    paddingHorizontal: GUTTER,
    paddingTop: spacing.md,
    ...shadows.bar,
  },
  row: { flexDirection: 'row', gap: spacing.sm },
  column: { gap: spacing.sm },
});

export default ActionBar;
