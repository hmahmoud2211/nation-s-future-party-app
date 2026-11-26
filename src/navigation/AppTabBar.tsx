import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import type { BottomTabBarProps } from 'expo-router/tabs';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { AppText } from '@/components/common/AppText';
import { GlassBackdrop } from '@/components/common/GlassBackdrop';
import { PressableScale } from '@/components/common/PressableScale';
import { useMeetings } from '@/features/meetings/hooks/useMeetings';
import { useProposals } from '@/features/proposals/hooks/useProposals';
import { useUser } from '@/features/auth/hooks/useSession';
import { useUnreadCount } from '@/features/notifications/hooks/useNotifications';
import { borderRadius, colors, fontFamily, motion, shadows, sizes, spacing, typography } from '@/theme';
import { can, canJoinConference } from '@/features/auth/services/permissions';
import { TABS } from '@/navigation/navTabs';

/** Live badge counts shown on tabs. */
function useTabBadges(): Record<string, number> {
  const user = useUser();
  const proposals = useProposals();
  const meetings = useMeetings();
  const unread = useUnreadCount();
  return React.useMemo(
    () => ({
      // Proposals waiting for the reviewer's decision.
      proposals: can(user, 'proposals.review') ? proposals.filter((p) => p.status === 'new' || p.status === 'under_review').length : 0,
      // Meetings the user can join right now.
      meetings: meetings.filter((m) => canJoinConference(user, m)).length,
      more: unread,
    }),
    [user, proposals, meetings, unread],
  );
}

/**
 * The selected tab's tinted glass pill. It fills its own tab symmetrically, so it needs no physical
 * left/right positioning (native RTL swaps those) and simply fades / grows in on selection.
 */
function ActivePill({ active }: { active: boolean }) {
  const progress = useSharedValue(active ? 1 : 0);
  useEffect(() => {
    progress.value = withTiming(active ? 1 : 0, { duration: motion.duration.medium, easing: Easing.out(Easing.cubic) });
  }, [active, progress]);
  const style = useAnimatedStyle(() => ({ opacity: progress.value, transform: [{ scaleX: 0.7 + 0.3 * progress.value }] }));
  return <Animated.View pointerEvents="none" style={[styles.pill, style]} />;
}

/**
 * Floating glass pill navigation: a frosted bar (live blur, or Apple's Liquid Glass on iOS 26) with a tinted pill
 * and navy glyphs on the selected tab. Rendered over the screen (absolute) so content scrolls under the glass —
 * tab screens reserve its height through `useTabBarInset()`.
 */
export function AppTabBar({ state, descriptors, emitter, navigateToTab, insets }: BottomTabBarProps) {
  const badges = useTabBadges();
  const focusedName = state.routes[state.index]?.name;

  return (
    <View pointerEvents="box-none" style={[styles.wrap, { bottom: Math.max(insets.bottom, sizes.tabBar.bottomGap) }]}>
      <View style={styles.bar} accessibilityRole="tablist">
        <GlassBackdrop material="chrome" liquid radius={BAR_HEIGHT / 2} />
        {TABS.map((def) => {
          const route = state.routes.find((r) => r.name === def.name);
          if (!route || !descriptors[route.key]) return null;
          const focused = def.name === focusedName;
          const Icon = def.icon;
          const badge = badges[def.name] ?? 0;
          const onPress = () => {
            const event = emitter.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!focused && !event.defaultPrevented) navigateToTab(route.key);
          };
          return (
            <PressableScale
              key={def.name}
              onPress={onPress}
              haptic
              scaleTo={0.92}
              accessibilityRole="tab"
              accessibilityState={{ selected: focused }}
              accessibilityLabel={badge > 0 ? `${def.label} (${badge})` : def.label}
              style={styles.item}
            >
              <ActivePill active={focused} />
              <View>
                <Icon size={sizes.icon.md} color={focused ? colors.primary : colors.textSecondary} strokeWidth={focused ? 2.3 : 1.9} />
                {badge > 0 ? (
                  <View style={styles.badge}>
                    <AppText variant="meta" color={colors.white} style={styles.badgeText}>
                      {badge > 9 ? '9+' : badge}
                    </AppText>
                  </View>
                ) : null}
              </View>
              <AppText variant="navLabel" color={focused ? colors.primary : colors.textSecondary} numberOfLines={1} style={[styles.label, focused && styles.labelOn]}>
                {def.label}
              </AppText>
            </PressableScale>
          );
        })}
      </View>
    </View>
  );
}

const { height: BAR_HEIGHT, sideInset } = sizes.tabBar;

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, alignItems: 'center', paddingHorizontal: sideInset },
  bar: {
    width: '100%',
    maxWidth: 520,
    height: BAR_HEIGHT,
    flexDirection: 'row',
    alignItems: 'stretch',
    padding: 4,
    borderRadius: borderRadius.pill,
    borderWidth: 1,
    borderColor: colors.rim,
    overflow: 'hidden',
    ...shadows.glass,
  },
  pill: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    borderRadius: borderRadius.pill,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.rimSoft,
  },
  item: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 1, borderRadius: borderRadius.pill, paddingHorizontal: spacing.xxs },
  label: { marginTop: 1 },
  labelOn: { fontFamily: fontFamily.bold },
  badge: {
    position: 'absolute',
    top: -6,
    end: -10,
    minWidth: 17,
    height: 17,
    borderRadius: 9,
    paddingHorizontal: 4,
    backgroundColor: colors.error,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.white,
  },
  badgeText: { ...typography.countBadgeSmall },
});
