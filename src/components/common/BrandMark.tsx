import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import { BRAND_NAME, BRAND_TAGLINE } from '@/config/brand';
import { images } from '@/constants/images';
import { colors, fontFamily, gradients, spacing, typography } from '@/theme';
import { AppText } from '@/components/common/AppText';

const STAR_COUNT = 22;

/**
 * Circular emblem. Renders `images.brandLogo` when the official artwork is configured; otherwise a
 * TEMPORARY placeholder (ring of stars around a sky-blue disc) — NOT the official logo.
 */
export function BrandMark({ size = 64, style }: { size?: number; style?: StyleProp<ViewStyle> }) {
  if (images.brandLogo) {
    return (
      <View style={[{ width: size, height: size }, style]}>
        <Image source={images.brandLogo} style={styles.logo} contentFit="contain" accessibilityLabel={BRAND_NAME} />
      </View>
    );
  }
  const c = size / 2;
  const ringR = c - size * 0.07;
  const starR = Math.max(1, size * 0.018);
  return (
    <View style={[{ width: size, height: size }, style]} accessible accessibilityRole="image" accessibilityLabel={`${BRAND_NAME} — شعار مؤقت`}>
      <Svg width={size} height={size}>
        <Defs>
          <RadialGradient id="brand-disc" cx="50%" cy="40%" r="60%">
            <Stop offset="0" stopColor={gradients.brandDisc[0]} />
            <Stop offset="1" stopColor={gradients.brandDisc[1]} />
          </RadialGradient>
        </Defs>
        <Circle cx={c} cy={c} r={c - 0.5} fill={colors.primary} stroke={colors.white} strokeWidth={1} />
        {Array.from({ length: STAR_COUNT }, (_, i) => {
          const a = (i / STAR_COUNT) * Math.PI * 2;
          return <Circle key={i} cx={c + Math.sin(a) * ringR} cy={c - Math.cos(a) * ringR} r={starR} fill={colors.white} />;
        })}
        <Circle cx={c} cy={c} r={c - size * 0.14} fill="url(#brand-disc)" />
      </Svg>
      <View style={[StyleSheet.absoluteFill, styles.center]} pointerEvents="none">
        <AppText variant="display" color={colors.white} align="center" style={{ fontSize: size * 0.24, lineHeight: size * 0.36 }}>
          م.و
        </AppText>
      </View>
    </View>
  );
}

/** Emblem + «مستقبل وطن» wordmark + English tagline, as in the header design. */
export function BrandLockup({ size = 86, style }: { size?: number; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[styles.lockup, style]} accessible accessibilityRole="header" accessibilityLabel={BRAND_NAME}>
      <BrandMark size={size} />
      <AppText variant="display" color={colors.white} align="center" style={[styles.name, { fontSize: size * 0.3, lineHeight: size * 0.42 }]}>
        {BRAND_NAME}
      </AppText>
      <AppText variant="micro" color={colors.white} align="center" arabicDigits={false} style={[styles.tagline, { fontSize: Math.max(7, size * 0.085) }]}>
        {BRAND_TAGLINE}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
  logo: { width: '100%', height: '100%' },
  lockup: { alignItems: 'center' },
  name: { fontFamily: fontFamily.extrabold, marginTop: spacing.xxs },
  tagline: { ...typography.tagline, marginTop: -spacing.xxs },
});

export default BrandMark;
