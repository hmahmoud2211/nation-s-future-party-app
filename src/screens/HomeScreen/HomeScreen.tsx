import React, { useMemo } from 'react';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { BrandHeader } from '@/components/layout/BrandHeader';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { sampleWeather } from '@/data';
import { useHomeData } from '@/features/dashboard/hooks/useHomeData';
import { useUnreadCount } from '@/features/notifications/hooks/useNotifications';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useScreenLayout } from '@/hooks/useScreenLayout';
import { createStyles } from './HomeScreen.styles';
import {
  GovernorateSection,
  HomeQuickActions,
  ImplementedChartSection,
  InitiativesSection,
  NewsSection,
  PartyPerformanceSection,
} from './HomeSections';

/** Gentle staggered entrance (Reanimated honours the system "Reduce Motion" setting). */
function Reveal({ index, children }: { index: number; children: React.ReactNode }) {
  const { motion } = useAppTheme();
  return <Animated.View entering={FadeInDown.duration(motion.duration.reveal).delay(motion.stagger * index)}>{children}</Animated.View>;
}

/**
 * Home page — both Figma references as one continuous scroll under a fixed brand header:
 * party performance (meetings) → initiatives → implemented chart → quick actions →
 * governorates → top news. All figures are live and scoped to the user's permissions.
 */
export function HomeScreen() {
  const router = useRouter();
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const unread = useUnreadCount();
  const { wideGutter } = useScreenLayout();
  const data = useHomeData();

  return (
    <ScreenContainer
      gutter={wideGutter}
      contentStyle={styles.content}
      header={<BrandHeader unread={unread} onNotifications={() => router.push('/notifications')} weather={sampleWeather} />}
    >
      <Reveal index={0}>
        <PartyPerformanceSection previous={data.meetings.previous} next={data.meetings.next} />
      </Reveal>
      <Reveal index={1}>
        <InitiativesSection breakdown={data.initiatives} />
      </Reveal>
      <Reveal index={2}>
        <ImplementedChartSection data={data.implemented} />
      </Reveal>
      <Reveal index={3}>
        <HomeQuickActions />
      </Reveal>
      {data.governorates.length ? (
        <Reveal index={4}>
          <GovernorateSection
            key={data.defaultGovernorateId}
            governorates={data.governorates}
            defaultId={data.defaultGovernorateId}
            contacts={data.contacts}
            proposals={data.visibleProposals}
          />
        </Reveal>
      ) : null}
      <Reveal index={5}>
        <NewsSection news={data.news} />
      </Reveal>
    </ScreenContainer>
  );
}
