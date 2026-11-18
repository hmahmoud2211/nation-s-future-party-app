import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { colors } from '@/theme';
import { initials } from '@/utils/format';
import { AppText } from './AppText';

export interface AvatarProps {
  name: string;
  color?: string;
  size?: number;
  ring?: boolean;
  style?: StyleProp<ViewStyle>;
}

/** Initials avatar — no real photos are used in the demo. */
export function Avatar({ name, color = colors.navy2, size = 40, ring, style }: AvatarProps) {
  return (
    <View
      accessibilityLabel={name}
      style={[
        styles.base,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: color },
        ring && { borderWidth: 2, borderColor: colors.gold },
        style,
      ]}
    >
      <AppText variant="bodyBold" color={colors.white} style={{ fontSize: size * 0.36, lineHeight: size * 0.5 }}>
        {initials(name)}
      </AppText>
    </View>
  );
}

export function AvatarStack({ people, size = 28, max = 4 }: { people: { name: string; color?: string }[]; size?: number; max?: number }) {
  const shown = people.slice(0, max);
  const extra = people.length - shown.length;
  return (
    <View style={styles.stack}>
      {shown.map((p, i) => (
        <View key={`${p.name}-${i}`} style={{ marginStart: i === 0 ? 0 : -size * 0.3 }}>
          <Avatar name={p.name} color={p.color} size={size} style={styles.stackItem} />
        </View>
      ))}
      {extra > 0 ? (
        <View style={[styles.extra, { width: size, height: size, borderRadius: size / 2, marginStart: -size * 0.3 }]}>
          <AppText variant="meta" color={colors.navy2}>{`+${extra}`}</AppText>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center' },
  stack: { flexDirection: 'row', alignItems: 'center' },
  stackItem: { borderWidth: 2, borderColor: colors.white },
  extra: { backgroundColor: colors.navySoft, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: colors.white },
});

export default Avatar;
