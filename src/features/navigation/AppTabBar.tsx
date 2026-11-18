import React from 'react';
import { StyleSheet, View } from 'react-native';
import type { BottomTabBarProps } from 'expo-router/tabs';
import { CalendarDays, House, LayoutGrid, Lightbulb, Menu, type LucideIcon } from 'lucide-react-native';
import { AppText } from '@/components/ui/AppText';
import { PressableScale } from '@/components/ui/PressableScale';
import { useAppStore, useUnreadCount, useUser } from '@/store';
import { colors, radius, spacing } from '@/theme';
import { can, canJoinConference } from '@/utils/permissions';

export interface TabDef {
  name: string;
  label: string;
  icon: LucideIcon;
}

/**
 * The same five tabs for every role (first item = right-most in RTL). What each tab shows
 * depends on the user's permissions; role-specific tools (finance, governorates, admin) live in «المزيد».
 */
export const TABS: TabDef[] = [
  { name: 'home', label: 'الرئيسية', icon: House },
  { name: 'committees', label: 'اللجان', icon: LayoutGrid },
  { name: 'proposals', label: 'المقترحات', icon: Lightbulb },
  { name: 'meetings', label: 'الاجتماعات', icon: CalendarDays },
  { name: 'more', label: 'المزيد', icon: Menu },
];

/** Live badge counts shown on tabs. */
function useTabBadges(): Record<string, number> {
  const user = useUser();
  const proposals = useAppStore((s) => s.proposals);
  const meetings = useAppStore((s) => s.meetings);
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

export function AppTabBar({ state, descriptors, emitter, navigateToTab, insets }: BottomTabBarProps) {
  const defs = TABS;
  const badges = useTabBadges();
  const focusedKey = state.routes[state.index]?.key;

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, spacing.sm) }]}>
      {defs.map((def) => {
        const route = state.routes.find((r) => r.name === def.name);
        if (!route || !descriptors[route.key]) return null;
        const focused = route.key === focusedKey;
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
            accessibilityLabel={def.label}
            style={styles.item}
          >
            <View style={[styles.indicator, focused && styles.indicatorOn]} />
            <View style={[styles.iconWrap, focused && styles.iconWrapOn]}>
              <Icon size={21} color={focused ? colors.navy : colors.textMuted} strokeWidth={focused ? 2.4 : 2} />
              {badge > 0 ? (
                <View style={styles.badge}>
                  <AppText variant="meta" color={colors.white} style={styles.badgeText}>
                    {badge > 9 ? '9+' : badge}
                  </AppText>
                </View>
              ) : null}
            </View>
            <AppText variant="meta" color={focused ? colors.navy : colors.textSecondary} numberOfLines={1} style={focused && styles.labelOn}>
              {def.label}
            </AppText>
          </PressableScale>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 6,
    paddingHorizontal: spacing.xs,
    boxShadow: '0px -6px 20px rgba(6, 27, 73, 0.07)',
  },
  item: { flex: 1, alignItems: 'center', gap: 1, paddingTop: 2 },
  indicator: { width: 22, height: 3, borderRadius: 2, backgroundColor: 'transparent', marginBottom: 4 },
  indicatorOn: { backgroundColor: colors.gold },
  iconWrap: { width: 46, height: 30, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  iconWrapOn: { backgroundColor: colors.goldSoft },
  labelOn: { fontFamily: 'Cairo_700Bold' },
  badge: {
    position: 'absolute',
    top: -3,
    end: 4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    backgroundColor: colors.error,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  badgeText: { fontSize: 9.5, lineHeight: 13 },
});
