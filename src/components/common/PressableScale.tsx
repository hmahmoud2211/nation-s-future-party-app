import React from 'react';
import { Platform, Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { motion } from '@/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface PressableScaleProps extends Omit<PressableProps, 'style'> {
  style?: StyleProp<ViewStyle>;
  /** Scale while pressed (default 0.97). */
  scaleTo?: number;
  haptic?: boolean;
  children?: React.ReactNode;
}

/** Pressable with a subtle press-scale animation (Reanimated) and optional haptics. */
export function PressableScale({ style, scaleTo = 0.97, haptic = false, onPressIn, onPressOut, onPress, disabled, children, ...rest }: PressableScaleProps) {
  const scale = useSharedValue(1);
  // Mirror `accessibilityState` to ARIA props: react-native-web only reads the ARIA form.
  const state = rest.accessibilityState;
  const aria = state
    ? { 'aria-selected': state.selected, 'aria-checked': state.checked, 'aria-busy': state.busy, 'aria-expanded': state.expanded, 'aria-disabled': state.disabled ?? disabled ?? undefined }
    : null;
  const animated = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <AnimatedPressable
      accessibilityRole="button"
      {...rest}
      {...aria}
      disabled={disabled}
      onPressIn={(e) => {
        scale.set(withTiming(scaleTo, { duration: motion.duration.pressIn }));
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        scale.set(withTiming(1, { duration: motion.duration.pressOut }));
        onPressOut?.(e);
      }}
      onPress={(e) => {
        if (haptic && Platform.OS !== 'web') Haptics.selectionAsync().catch(() => undefined);
        onPress?.(e);
      }}
      style={[style, animated, disabled ? { opacity: 0.55 } : null]}
    >
      {children}
    </AnimatedPressable>
  );
}

export default PressableScale;
