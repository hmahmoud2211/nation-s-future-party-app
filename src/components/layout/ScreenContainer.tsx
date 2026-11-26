import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { colors, GUTTER, spacing } from '@/theme';
import { AppBackground } from '@/components/layout/AppBackground';
import { useTabBarInset } from '@/components/layout/TabBarInset';

export interface ScreenContainerProps {
  header?: React.ReactNode;
  footer?: React.ReactNode;
  children?: React.ReactNode;
  /** Wrap content in a ScrollView (default true). Use false for FlatList screens. */
  scroll?: boolean;
  padded?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
  /** Avoid the keyboard (forms, chat). */
  keyboard?: boolean;
  onRefresh?: () => void;
  refreshing?: boolean;
  /** Extra bottom space below the content (the floating tab bar's height is added automatically). */
  bottomSpace?: number;
  /** Horizontal padding override (e.g. the wider dashboard gutter). */
  gutter?: number;
}

/**
 * Base screen layout: fixed header → scrollable content → optional sticky footer,
 * drawn over the design's gradient page background.
 */
export function ScreenContainer({
  header,
  footer,
  children,
  scroll = true,
  padded = true,
  contentStyle,
  keyboard,
  onRefresh,
  refreshing = false,
  bottomSpace = spacing.xxxl,
  gutter = GUTTER,
}: ScreenContainerProps) {
  const tabInset = useTabBarInset();
  const body = scroll ? (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={[padded && { paddingHorizontal: gutter, paddingTop: spacing.xl }, { paddingBottom: bottomSpace + tabInset }, contentStyle]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      refreshControl={onRefresh ? <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} colors={[colors.primary]} /> : undefined}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.flex, padded && { paddingHorizontal: gutter }, contentStyle]}>{children}</View>
  );

  const content = (
    <>
      {header}
      {body}
      {footer}
    </>
  );

  return (
    <View style={styles.root}>
      <AppBackground />
      {keyboard ? (
        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          {content}
        </KeyboardAvoidingView>
      ) : (
        content
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
});

export default ScreenContainer;
