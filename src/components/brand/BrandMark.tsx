import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors } from '@/theme';
import { AppText } from '../ui/AppText';

/**
 * TEMPORARY placeholder emblem — NOT an official logo.
 * Replace this component's content with the authorized logo asset (e.g. `assets/logo.png`)
 * when it is provided. See README → "استبدال الشعار".
 */
export function BrandMark({ size = 64, light = false }: { size?: number; light?: boolean }) {
  return (
    <View
      accessibilityLabel="شعار مؤقت للتطبيق"
      style={[
        styles.outer,
        {
          width: size,
          height: size,
          borderRadius: size * 0.3,
          backgroundColor: light ? colors.white : colors.navy,
          borderColor: colors.gold,
        },
      ]}
    >
      <View style={[styles.inner, { width: size * 0.74, height: size * 0.74, borderRadius: size * 0.22, borderColor: light ? colors.goldLight : 'rgba(198,154,53,0.5)' }]}>
        <AppText
          variant="display"
          color={light ? colors.navy : colors.gold}
          style={{ fontSize: size * 0.3, lineHeight: size * 0.44 }}
          align="center"
        >
          م.و
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: { alignItems: 'center', justifyContent: 'center', borderWidth: 2 },
  inner: { alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
});

export default BrandMark;
