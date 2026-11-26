import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';
import { Bell, ChevronRight, Sun } from 'lucide-react-native';
import { images } from '@/constants/images';
import { useNow } from '@/hooks/useNow';
import { useScreenLayout } from '@/hooks/useScreenLayout';
import { borderRadius, colors, gradients, sizes, spacing, typography } from '@/theme';
import type { WeatherSnapshot } from '@/types/common.types';
import { formatClock, localizeDigits } from '@/utils/format';
import { BrandLockup } from '@/components/common/BrandMark';
import { AppText } from '@/components/common/AppText';
import { IconButton } from '@/components/common/IconButton';

export interface BrandHeaderProps {
  /** Unread notifications shown on the bell. */
  unread?: number;
  onNotifications?: () => void;
  /** Back action — the chevron is shown only when provided (the Home tab has nothing to go back to). */
  onBack?: () => void;
  weather?: WeatherSnapshot;
}

/**
 * Branded hero header from the Home design: navy surface with a large rounded bottom edge,
 * clock + weather on the start side, the emblem lockup in the centre, back / notifications on
 * the end side. Fixed above the scrolling content.
 */
export function BrandHeader({ unread = 0, onNotifications, onBack, weather }: BrandHeaderProps) {
  const insets = useSafeAreaInsets();
  const { width, isCompact } = useScreenLayout();
  const now = useNow();
  const clock = formatClock(now);
  const emblem = Math.round(Math.min(86, Math.max(64, width * 0.2)));
  // Narrow phones: stack the clock and tighten the side columns so nothing breaks mid-word.
  const compact = isCompact;
  const small = compact ? styles.smaller : styles.small;

  return (
    <View style={[styles.hero, compact && styles.heroCompact, { paddingTop: insets.top + spacing.lg }]}>
      {images.headerBackground ? <Image source={images.headerBackground} style={[StyleSheet.absoluteFill, styles.fill]} contentFit="cover" accessible={false} /> : null}
      <LinearGradient
        colors={gradients.header}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={[StyleSheet.absoluteFill, styles.fill, images.headerBackground ? styles.overlay : null]}
      />
      {/* Soft light behind the emblem gives the flat navy some depth. */}
      <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
        <Defs>
          <RadialGradient id="hero-glow" cx="50%" cy="38%" rx="42%" ry="62%">
            <Stop offset="0" stopColor={gradients.headerGlow[0]} />
            <Stop offset="1" stopColor={gradients.headerGlow[1]} />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#hero-glow)" />
      </Svg>
      <View style={styles.row}>
        <View style={[styles.side, styles.sideStart]} accessible accessibilityLabel={`${clock.date} ${clock.time}${weather ? `، ${weather.temperatureC}° ${weather.condition}` : ''}`}>
          <View style={compact ? styles.clockStacked : styles.clock}>
            {/* RTL row: first child sits on the right — time right, date left, as in the design. */}
            <AppText variant="micro" color={colors.white} style={small} numberOfLines={1}>
              {clock.time}
            </AppText>
            <AppText variant="micro" color={colors.white} style={small} numberOfLines={1}>
              {clock.date}
            </AppText>
          </View>
          {weather ? (
            <View style={[styles.weather, compact && styles.weatherCompact]}>
              <AppText variant="micro" color={colors.white} style={small} numberOfLines={1}>
                {`${localizeDigits(weather.temperatureC)}°C - ${weather.condition}`}
              </AppText>
              <Sun size={compact ? sizes.icon.sm : sizes.icon.md} color={colors.sun} strokeWidth={1.8} />
            </View>
          ) : null}
        </View>

        <BrandLockup size={emblem} />

        <View style={[styles.side, styles.sideEnd]}>
          {onBack ? <IconButton icon={ChevronRight} variant="glass" size={34} accessibilityLabel="رجوع" onPress={onBack} /> : <View />}
          {onNotifications ? (
            <IconButton icon={Bell} variant="glass" size={50} badge={unread} accessibilityLabel="الإشعارات" onPress={onNotifications} style={styles.bell} />
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl + spacing.xs,
    borderBottomStartRadius: borderRadius.hero,
    borderBottomEndRadius: borderRadius.hero,
    overflow: 'hidden',
    backgroundColor: colors.primary,
  },
  heroCompact: { paddingHorizontal: spacing.md },
  fill: { borderBottomLeftRadius: borderRadius.hero, borderBottomRightRadius: borderRadius.hero },
  overlay: { opacity: 0.86 },
  row: { flexDirection: 'row', alignItems: 'stretch' },
  side: { flex: 1, paddingTop: spacing.sm },
  sideStart: { alignItems: 'flex-start', gap: spacing.sm },
  sideEnd: { alignItems: 'flex-end', justifyContent: 'space-between', paddingBottom: spacing.xxl },
  clock: { flexDirection: 'row', gap: spacing.md },
  clockStacked: { gap: 0 },
  weather: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  weatherCompact: { gap: spacing.xs },
  small: { ...typography.headerMeta },
  smaller: { ...typography.headerMetaCompact },
  bell: { borderRadius: borderRadius.md },
});

export default BrandHeader;
