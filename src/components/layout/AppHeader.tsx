import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowRight } from 'lucide-react-native';
import { colors, gradients, GUTTER, radius, spacing } from '@/theme';
import { AppText } from '../ui/AppText';
import { IconButton } from '../ui/IconButton';

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
 * Navy gradient header that extends under the status bar.
 * RTL: back arrow points right (towards the start edge).
 */
export function AppHeader({ title, subtitle, back, onBack, actions, children, eyebrow, style, compact }: AppHeaderProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  // `router.canGoBack()` can be stale right after a push from a tab, so the button is shown by default.
  const showBack = back ?? true;

  return (
    <LinearGradient
      colors={gradients.navyDeep as unknown as [string, string, ...string[]]}
      start={{ x: 1, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={[styles.header, { paddingTop: insets.top + (compact ? 4 : 8) }, style]}
    >
      <View style={styles.topRow}>
        <View style={styles.titleRow}>
          {showBack ? (
            <IconButton
              icon={ArrowRight}
              variant="glass"
              size={38}
              accessibilityLabel="رجوع"
              onPress={() => (onBack ? onBack() : router.canGoBack() ? router.back() : router.replace('/home'))}
            />
          ) : null}
          <View style={styles.titles}>
            {eyebrow ? (
              <AppText variant="meta" color={colors.goldLight} numberOfLines={1}>
                {eyebrow}
              </AppText>
            ) : null}
            <AppText variant="screenTitle" color={colors.white} numberOfLines={2}>
              {title}
            </AppText>
            {subtitle ? (
              <AppText variant="caption" color="rgba(255,255,255,0.72)" numberOfLines={2}>
                {subtitle}
              </AppText>
            ) : null}
          </View>
        </View>
        {actions ? <View style={styles.actions}>{actions}</View> : null}
      </View>
      {children ? <View style={styles.children}>{children}</View> : null}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: GUTTER,
    paddingBottom: spacing.lg,
    borderBottomStartRadius: radius.xl,
    borderBottomEndRadius: radius.xl,
    overflow: 'hidden',
  },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md, minHeight: 44 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, flex: 1 },
  titles: { flex: 1 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  children: { marginTop: spacing.md },
});

export default AppHeader;
