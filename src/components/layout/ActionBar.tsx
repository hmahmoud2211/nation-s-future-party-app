import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, GUTTER, spacing } from '@/theme';

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
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: GUTTER,
    paddingTop: spacing.md,
    boxShadow: '0px -4px 16px rgba(6, 27, 73, 0.06)',
  },
  row: { flexDirection: 'row', gap: spacing.sm },
  column: { gap: spacing.sm },
});

export default ActionBar;
