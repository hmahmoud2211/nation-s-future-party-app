import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';
import { backdrop, colors } from '@/theme';

/** Orbs are sized on the screen width; on a tall phone this keeps them close to round. */
const ORB_ASPECT = 0.62;

/**
 * The page backdrop the glass floats over: a cool light wash with large soft colour orbs from the brand palette
 * (sky, violet, cyan, blue). Static and behind everything (absolute fill, no touches).
 */
export const AppBackground = React.memo(function AppBackground() {
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.base]}>
      <LinearGradient colors={backdrop.base} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
      <Svg style={StyleSheet.absoluteFill} width="100%" height="100%">
        <Defs>
          {backdrop.orbs.map((o, i) => (
            <RadialGradient key={i} id={`orb-${i}`} cx={`${o.cx * 100}%`} cy={`${o.cy * 100}%`} rx={`${o.r * 100}%`} ry={`${o.r * ORB_ASPECT * 100}%`}>
              <Stop offset="0" stopColor={o.color} stopOpacity={o.opacity} />
              <Stop offset="0.55" stopColor={o.color} stopOpacity={o.opacity * 0.35} />
              <Stop offset="1" stopColor={o.color} stopOpacity={0} />
            </RadialGradient>
          ))}
        </Defs>
        {backdrop.orbs.map((_, i) => (
          <Rect key={i} x="0" y="0" width="100%" height="100%" fill={`url(#orb-${i})`} />
        ))}
      </Svg>
    </View>
  );
});

const styles = StyleSheet.create({
  base: { backgroundColor: colors.background },
});

export default AppBackground;
