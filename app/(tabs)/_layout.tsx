import React from 'react';
import { Tabs } from 'expo-router';
import { TabBarInsetProvider } from '@/components/layout/TabBarInset';
import { AppTabBar } from '@/navigation/AppTabBar';
import { TABS } from '@/navigation/navTabs';

/**
 * Five bottom tabs for every role; their content adapts to the user's permissions.
 * The tab bar floats over the screens, so the provider tells each tab screen how much
 * bottom space to reserve.
 */
export default function TabsLayout() {
  return (
    <TabBarInsetProvider>
      <Tabs screenOptions={{ headerShown: false }} tabBar={(props) => <AppTabBar {...props} />}>
        {TABS.map((t) => (
          <Tabs.Screen key={t.name} name={t.name} />
        ))}
      </Tabs>
    </TabBarInsetProvider>
  );
}
