import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';
import { Bell, ChevronRight, Cloud, CloudRain, CloudSun, Sun, Wind, type LucideIcon } from 'lucide-react-native';
import { AppText } from '@/components/common/AppText';
import { BrandLockup } from '@/components/common/BrandMark';
import { IconButton } from '@/components/common/IconButton';
import { images } from '@/constants/images';
import { useNow } from '@/hooks/useNow';
import { useScreenLayout } from '@/hooks/useScreenLayout';
import { borderRadius, colors, gradients, sizes, spacing } from '@/theme';
import type { WeatherKind, WeatherSnapshot } from '@/types/common.types';
import { formatShortDate, formatTime, formatWeekday, localizeDigits } from '@/utils/format';

export interface BrandHeaderProps {
  /** Unread notifications shown on the bell. */
  unread?: number;
  onNotifications?: () => void;
  /** Back action — the chevron is shown only when provided (the Home tab has nothing to go back to). */
  onBack?: () => void;
  weather?: WeatherSnapshot;
}

const WEATHER_ICONS: Record<WeatherKind, LucideIcon> = {
  sunny: Sun,
  partlyCloudy: CloudSun,
  cloudy: Cloud,
  rain: CloudRain,
  wind: Wind,
};

/**
 * Frameless info block on the start side: temperature and condition (weather glyph beside them) over the
 * live time and date. Every line starts on the same edge so the stack reads as one clean column.
 */
function InfoBlock({ weather, compact }: { weather?: WeatherSnapshot; compact: boolean }) {
  const now = useNow();
  const time = formatTime(now);
  const date = `${formatWeekday(now)} ${formatShortDate(now)}`;
  const WeatherIcon = weather ? WEATHER_ICONS[weather.kind] : null;
  const temperature = weather ? `${localizeDigits(weather.temperatureC)}°` : '';
  return (
    <View
      style={styles.info}
      accessible
      accessibilityLabel={`${date}، ${time}${weather ? `، ${temperature} ${weather.condition}` : ''}`}
    >
      {weather && WeatherIcon ? (
        <View style={styles.weatherRow}>
          <View style={styles.weatherText}>
            <AppText variant="stat" color={colors.white} numberOfLines={1}>
              {temperature}
            </AppText>
            <AppText variant="micro" color={colors.onPrimaryMuted} numberOfLines={1} style={styles.condition}>
              {weather.condition}
            </AppText>
          </View>
          <WeatherIcon size={compact ? sizes.icon.md : sizes.icon.lg} color={weather.kind === 'sunny' ? colors.sun : colors.white} strokeWidth={1.8} />
        </View>
      ) : null}
      <View>
        <AppText variant="bodyBold" color={colors.white} numberOfLines={1}>
          {time}
        </AppText>
        <AppText variant="meta" color={colors.onPrimaryMuted} numberOfLines={1}>
          {date}
        </AppText>
      </View>
    </View>
  );
}

/**
 * Branded hero header from the Home design: navy surface with a large rounded bottom edge,
 * the emblem lockup in the centre, a frameless weather / date block on the start side and the
 * notifications bell on the end side, both centred against the emblem. Fixed above the scrolling content.
 */
export function BrandHeader({ unread = 0, onNotifications, onBack, weather }: BrandHeaderProps) {
  const insets = useSafeAreaInsets();
  const { width, isCompact: compact } = useScreenLayout();
  const emblem = Math.round(Math.min(86, Math.max(64, width * 0.2)));

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
        <View style={[styles.side, styles.sideStart]}>
          <InfoBlock weather={weather} compact={compact} />
        </View>

        <BrandLockup size={emblem} />

        <View style={[styles.side, styles.sideEnd]}>
          {onBack ? <IconButton icon={ChevronRight} variant="glass" size={sizes.headerControl} accessibilityLabel="رجوع" onPress={onBack} /> : null}
          {onNotifications ? (
            <IconButton icon={Bell} variant="glass" size={sizes.touchTarget} badge={unread} accessibilityLabel="الإشعارات" onPress={onNotifications} />
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.section,
    borderBottomStartRadius: borderRadius.hero,
    borderBottomEndRadius: borderRadius.hero,
    overflow: 'hidden',
    backgroundColor: colors.primary,
  },
  heroCompact: { paddingHorizontal: spacing.md },
  fill: { borderBottomLeftRadius: borderRadius.hero, borderBottomRightRadius: borderRadius.hero },
  overlay: { opacity: 0.86 },
  // Both side columns are centred against the emblem so the header reads as one balanced block.
  row: { flexDirection: 'row', alignItems: 'center' },
  side: { flex: 1 },
  sideStart: { alignItems: 'flex-start' },
  sideEnd: { alignItems: 'flex-end', gap: spacing.sm },
  info: { gap: spacing.sm, alignItems: 'flex-start' },
  // Text first so it sits flush on the start edge with the time and date; the glyph follows it.
  weatherRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  weatherText: { alignItems: 'flex-start' },
  condition: { marginTop: -spacing.xxs },
});

export default BrandHeader;
