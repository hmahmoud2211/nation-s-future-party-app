import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronRight } from 'lucide-react-native';
import { borderRadius, colors, gradients, GUTTER, sizes, spacing } from '@/theme';
import { AppText } from '@/components/common/AppText';
import { IconButton } from '@/components/common/IconButton';

export interface AppHeaderProps {
  title: string;
  subtitle?: string;
  /** Show the back button (default true). Tab root screens pass `false`. Without history it returns home. */
  back?: boolean;
  onBack?: () => void;
  /** Action buttons rendered on the end (left) side. */
  actions?: React.ReactNode;
  /** Extra content under the title (stats, search…). */
  children?: React.ReactNode;
  /** Small label above the title (e.g. committee name). */
  eyebrow?: string;
  style?: StyleProp<ViewStyle>;
  compact?: boolean;
}

/**
 * Navy header that extends under the status bar — same surface and rounded edge as the Home
 * brand header. RTL: the back chevron points right (towards the start edge).
 */
export function AppHeader({ title, subtitle, back, onBack, actions, children, eyebrow, style, compact }: AppHeaderProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  // `router.canGoBack()` can be stale right after a push from a tab, so the button is shown by default.
  const showBack = back ?? true;

  return (
    <View style={[styles.header, { paddingTop: insets.top + (compact ? 4 : spacing.sm) }, style]}>
      <LinearGradient colors={gradients.header} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }} style={[StyleSheet.absoluteFill, styles.fill]} />
      <View style={styles.topRow}>
        <View style={styles.titleRow}>
          {showBack ? (
            <IconButton
              icon={ChevronRight}
              variant="glass"
              size={sizes.headerControl}
              accessibilityLabel="رجوع"
              onPress={() => (onBack ? onBack() : router.canGoBack() ? router.back() : router.replace('/home'))}
            />
          ) : null}
          <View style={styles.titles}>
            {eyebrow ? (
              <AppText variant="meta" color={colors.accentLight} numberOfLines={1}>
                {eyebrow}
              </AppText>
            ) : null}
            <AppText variant="screenTitle" color={colors.white} numberOfLines={2} accessibilityRole="header">
              {title}
            </AppText>
            {subtitle ? (
              <AppText variant="caption" color={colors.onPrimaryMuted} numberOfLines={2}>
                {subtitle}
              </AppText>
            ) : null}
          </View>
        </View>
        {actions ? <View style={styles.actions}>{actions}</View> : null}
      </View>
      {children ? <View style={styles.children}>{children}</View> : null}
    </View>
  );
}

const HEADER_RADIUS = borderRadius.xxl + 4;

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: GUTTER,
    paddingBottom: spacing.xl,
    borderBottomStartRadius: HEADER_RADIUS,
    borderBottomEndRadius: HEADER_RADIUS,
    overflow: 'hidden',
    backgroundColor: colors.primary,
  },
  fill: { borderBottomLeftRadius: HEADER_RADIUS, borderBottomRightRadius: HEADER_RADIUS },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md, minHeight: 44 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, flex: 1 },
  titles: { flex: 1 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  children: { marginTop: spacing.md },
});

export default AppHeader;
