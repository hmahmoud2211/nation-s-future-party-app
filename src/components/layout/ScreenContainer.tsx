import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, RefreshControl, StyleSheet, View, type LayoutChangeEvent, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedScrollHandler, type SharedValue } from 'react-native-reanimated';
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
  /** Receives the vertical scroll offset on the UI thread (drives collapsing headers). */
  scrollY?: SharedValue<number>;
  /**
   * Float the header over the content instead of stacking it above. The content starts below the header's
   * full height and scrolls underneath it, so a header that collapses with transforms never re-lays out the page.
   */
  floatingHeader?: boolean;
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
  scrollY,
  floatingHeader = false,
}: ScreenContainerProps) {
  const tabInset = useTabBarInset();
  const [headerHeight, setHeaderHeight] = useState(0);
  const onScroll = useAnimatedScrollHandler(
    {
      onScroll: (e) => {
        scrollY?.set(e.contentOffset.y);
      },
    },
    [scrollY],
  );
  const floating = floatingHeader && !!header;
  // A floating header keeps one layout height (it only transforms), so the first measurement holds.
  const onHeaderLayout = (e: LayoutChangeEvent) => setHeaderHeight(Math.round(e.nativeEvent.layout.height));
  // Wait for the header's height before placing the content, so it never starts underneath it.
  const pending = floating && headerHeight === 0;

  const body = scroll ? (
    <Animated.ScrollView
      onScroll={scrollY ? onScroll : undefined}
      scrollEventThrottle={16}
      style={styles.flex}
      contentContainerStyle={[padded && { paddingHorizontal: gutter, paddingTop: spacing.xl }, { paddingBottom: bottomSpace + tabInset }, contentStyle]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      refreshControl={onRefresh ? <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} colors={[colors.primary]} /> : undefined}
    >
      {floating ? <View style={{ height: headerHeight }} /> : null}
      {pending ? null : children}
    </Animated.ScrollView>
  ) : (
    <View style={[styles.flex, padded && { paddingHorizontal: gutter }, contentStyle]}>{children}</View>
  );

  const content = floating ? (
    <>
      {body}
      {/* box-none: only the header's own surface takes touches, the area it slides away from does not. */}
      <View style={styles.floatingHeader} pointerEvents="box-none" onLayout={onHeaderLayout}>
        {header}
      </View>
      {footer}
    </>
  ) : (
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
  floatingHeader: { position: 'absolute', top: 0, left: 0, right: 0 },
});

export default ScreenContainer;
