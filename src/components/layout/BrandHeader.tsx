import React, { useState } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import Animated, { Extrapolation, interpolate, useAnimatedReaction, useAnimatedStyle, useSharedValue, type SharedValue } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';
import { Bell, ChevronRight, Cloud, CloudRain, CloudSun, Sun, Wind, type LucideIcon } from 'lucide-react-native';
import { AppText } from '@/components/common/AppText';
import { BrandLockup, BrandMark } from '@/components/common/BrandMark';
import { IconButton } from '@/components/common/IconButton';
import { BRAND_NAME } from '@/config/brand';
import { images } from '@/constants/images';
import { useNow } from '@/hooks/useNow';
import { useScreenLayout } from '@/hooks/useScreenLayout';
import { borderRadius, colors, fontFamily, gradients, sizes, spacing } from '@/theme';
import type { WeatherKind, WeatherSnapshot } from '@/types/common.types';
import { formatShortDate, formatTime, formatWeekday, localizeDigits } from '@/utils/format';

export interface BrandHeaderProps {
  /** Unread notifications shown on the bell. */
  unread?: number;
  onNotifications?: () => void;
  /** Back action — the chevron is shown only when provided (the Home tab has nothing to go back to). */
  onBack?: () => void;
  weather?: WeatherSnapshot;
  /** Page scroll offset; when given the header collapses to a slim bar as the page scrolls (use with `ScreenContainer floatingHeader`). */
  scrollY?: SharedValue<number>;
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

/** Height of the slim bar the header collapses to, below the status bar. */
const COLLAPSED_BAR = 60;
const COMPACT_EMBLEM = 34;
/** Collapse progress (0 → 1) by which the large content has faded out, and from which the slim bar fades in. */
const FADE_OUT_END = 0.5;
const FADE_IN_START = 0.55;
/** While fading, the large content drifts down by this share of the collapse distance (parallax) and shrinks a little. */
const PARALLAX = 0.4;
const COLLAPSED_SCALE = 0.9;

/** Temperature with its weather glyph, for the collapsed bar. */
function CompactWeather({ weather }: { weather: WeatherSnapshot }) {
  const Icon = WEATHER_ICONS[weather.kind];
  return (
    <View style={styles.compactWeather} accessible accessibilityLabel={`${localizeDigits(weather.temperatureC)}° ${weather.condition}`}>
      <AppText variant="bodyBold" color={colors.white} numberOfLines={1}>
        {`${localizeDigits(weather.temperatureC)}°`}
      </AppText>
      <Icon size={sizes.icon.md} color={weather.kind === 'sunny' ? colors.sun : colors.white} strokeWidth={1.8} />
    </View>
  );
}

/**
 * Branded hero header from the Home design: navy surface with a large rounded bottom edge,
 * the emblem lockup in the centre, a frameless weather / date block on the start side and the
 * notifications bell on the end side, both centred against the emblem.
 *
 * Given `scrollY` (and floated over the content by `ScreenContainer floatingHeader`), it collapses as the page
 * scrolls: the hero slides up until only a slim bar is left, the large content fades out with a slight parallax,
 * and a compact row — small emblem and name, temperature, bell — fades in. Transforms only, on the UI thread.
 */
export function BrandHeader({ unread = 0, onNotifications, onBack, weather, scrollY }: BrandHeaderProps) {
  const insets = useSafeAreaInsets();
  const { width, isCompact: compact } = useScreenLayout();
  const emblem = Math.round(Math.min(86, Math.max(64, width * 0.2)));
  const [height, setHeight] = useState(0);
  const [collapsed, setCollapsed] = useState(false);
  const idle = useSharedValue(0);
  const offset = scrollY ?? idle;
  // The hero slides up by everything except the status bar and the slim bar.
  const distance = Math.max(0, height - insets.top - COLLAPSED_BAR);
  const collapsible = !!scrollY && distance > 0;

  // Only the visible layer takes touches and is read by screen readers.
  useAnimatedReaction(
    () => collapsible && offset.value >= distance * FADE_OUT_END,
    (now, prev) => {
      if (now !== prev) scheduleOnRN(setCollapsed, now);
    },
    [collapsible, distance],
  );

  const heroStyle = useAnimatedStyle(() => {
    const shift = collapsible ? interpolate(offset.value, [0, distance], [0, distance], Extrapolation.CLAMP) : 0;
    return { transform: [{ translateY: -shift }] };
  }, [collapsible, distance]);

  const fullStyle = useAnimatedStyle(() => {
    const p = collapsible ? interpolate(offset.value, [0, distance], [0, 1], Extrapolation.CLAMP) : 0;
    return {
      opacity: interpolate(p, [0, FADE_OUT_END], [1, 0], Extrapolation.CLAMP),
      transform: [{ translateY: p * distance * PARALLAX }, { scale: interpolate(p, [0, 1], [1, COLLAPSED_SCALE]) }],
    };
  }, [collapsible, distance]);

  const barStyle = useAnimatedStyle(() => {
    const p = collapsible ? interpolate(offset.value, [0, distance], [0, 1], Extrapolation.CLAMP) : 0;
    return {
      opacity: interpolate(p, [FADE_IN_START, 1], [0, 1], Extrapolation.CLAMP),
      transform: [{ translateY: interpolate(p, [FADE_IN_START, 1], [spacing.xs6, 0], Extrapolation.CLAMP) }],
    };
  }, [collapsible, distance]);

  const onLayout = (e: LayoutChangeEvent) => setHeight(Math.round(e.nativeEvent.layout.height));
  const endControls = (
    <>
      {onBack ? <IconButton icon={ChevronRight} variant="glass" size={sizes.headerControl} accessibilityLabel="رجوع" onPress={onBack} /> : null}
      {onNotifications ? <IconButton icon={Bell} variant="glass" size={sizes.touchTarget} badge={unread} accessibilityLabel="الإشعارات" onPress={onNotifications} /> : null}
    </>
  );
  const gutter = compact ? spacing.md : spacing.xl;

  return (
    <Animated.View style={[styles.hero, { paddingHorizontal: gutter, paddingTop: insets.top + spacing.lg }, heroStyle]} onLayout={onLayout}>
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
      <Animated.View
        style={[styles.row, fullStyle]}
        pointerEvents={collapsed ? 'none' : 'auto'}
        accessibilityElementsHidden={collapsed}
        importantForAccessibility={collapsed ? 'no-hide-descendants' : 'auto'}
      >
        <View style={[styles.side, styles.sideStart]}>
          <InfoBlock weather={weather} compact={compact} />
        </View>

        <BrandLockup size={emblem} />

        <View style={[styles.side, styles.sideEnd]}>{endControls}</View>
      </Animated.View>

      {scrollY ? (
        <Animated.View
          style={[styles.bar, { start: gutter, end: gutter }, barStyle]}
          pointerEvents={collapsed ? 'auto' : 'none'}
          accessibilityElementsHidden={!collapsed}
          importantForAccessibility={collapsed ? 'auto' : 'no-hide-descendants'}
        >
          <View style={[styles.side, styles.sideStart]}>{weather ? <CompactWeather weather={weather} /> : null}</View>
          <View style={styles.compactBrand} accessible accessibilityRole="header" accessibilityLabel={BRAND_NAME}>
            <BrandMark size={COMPACT_EMBLEM} />
            <AppText variant="subheading" color={colors.white} numberOfLines={1} style={styles.compactName}>
              {BRAND_NAME}
            </AppText>
          </View>
          <View style={[styles.side, styles.sideEnd]}>{endControls}</View>
        </Animated.View>
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  hero: {
    paddingBottom: spacing.section,
    borderBottomStartRadius: borderRadius.hero,
    borderBottomEndRadius: borderRadius.hero,
    overflow: 'hidden',
    backgroundColor: colors.primary,
  },
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
  // Slim bar pinned to the hero's bottom edge: the strip that stays on screen once the hero has slid up.
  bar: { position: 'absolute', bottom: 0, height: COLLAPSED_BAR, flexDirection: 'row', alignItems: 'center' },
  compactBrand: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  compactName: { fontFamily: fontFamily.extrabold },
  compactWeather: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs6 },
});

export default BrandHeader;
