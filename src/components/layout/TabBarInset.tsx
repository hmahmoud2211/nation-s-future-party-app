import React, { createContext, useContext, useMemo } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { sizes, spacing } from '@/theme';

/**
 * Height of the floating bottom navigation (including the device's bottom safe area).
 * Tab screens add it to their bottom padding so the last item is never hidden behind the bar.
 * Outside the tab navigator the value is 0.
 */
const TabBarInsetContext = createContext(0);

export function TabBarInsetProvider({ children }: { children: React.ReactNode }) {
  const insets = useSafeAreaInsets();
  const value = useMemo(() => sizes.tabBar.height + Math.max(insets.bottom, sizes.tabBar.bottomGap) + spacing.sm, [insets.bottom]);
  return <TabBarInsetContext.Provider value={value}>{children}</TabBarInsetContext.Provider>;
}

/** Bottom space covered by the floating tab bar (0 on stack screens). */
export function useTabBarInset(): number {
  return useContext(TabBarInsetContext);
}
