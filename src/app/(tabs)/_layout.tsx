import React from 'react';
import { Tabs } from 'expo-router';
import { AppTabBar, TABS } from '@/features/navigation/AppTabBar';

/** Five bottom tabs for every role; their content adapts to the user's permissions. */
export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }} tabBar={(props) => <AppTabBar {...props} />}>
      {TABS.map((t) => (
        <Tabs.Screen key={t.name} name={t.name} />
      ))}
    </Tabs>
  );
}
