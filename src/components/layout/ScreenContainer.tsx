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
  /** Extra bottom space (e.g. for tab screens). */
  bottomSpace?: number;
}

/** Base screen layout: header → scrollable content → optional sticky footer. */
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
}: ScreenContainerProps) {
  const body = scroll ? (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={[padded && styles.padded, { paddingBottom: bottomSpace }, contentStyle]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      refreshControl={onRefresh ? <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.gold} /> : undefined}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.flex, padded && styles.paddedStatic, contentStyle]}>{children}</View>
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
  root: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },
  padded: { paddingHorizontal: GUTTER, paddingTop: spacing.lg },
  paddedStatic: { paddingHorizontal: GUTTER },
});

export default ScreenContainer;
