import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { colors, radius, shadows, spacing } from '@/theme';
import { AppText } from './AppText';
import { PressableScale } from './PressableScale';

export interface ChipOption<T extends string = string> {
  key: T;
  label: string;
  count?: number;
}

/** Wrapping filter chips (no horizontal scrolling → safe in RTL). */
export function FilterChips<T extends string>({
  options,
  value,
  onChange,
  style,
}: {
  options: ChipOption<T>[];
  value: T;
  onChange: (key: T) => void;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.wrap, style]}>
      {options.map((o) => {
        const active = o.key === value;
        return (
          <PressableScale
            key={o.key}
            accessibilityState={{ selected: active }}
            onPress={() => onChange(o.key)}
            style={[styles.chip, active ? styles.chipActive : styles.chipIdle]}
          >
            <AppText variant="captionMedium" color={active ? colors.white : colors.text}>
              {o.label}
            </AppText>
            {o.count !== undefined ? (
              <View style={[styles.count, { backgroundColor: active ? 'rgba(255,255,255,0.18)' : colors.navySoft }]}>
                <AppText variant="meta" color={active ? colors.white : colors.navy2} style={styles.countText}>
                  {o.count}
                </AppText>
              </View>
            ) : null}
          </PressableScale>
        );
      })}
    </View>
  );
}

/** Segmented control for 2–4 options. */
export function SegmentedTabs<T extends string>({
  options,
  value,
  onChange,
  style,
}: {
  options: ChipOption<T>[];
  value: T;
  onChange: (key: T) => void;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.segment, style]}>
      {options.map((o) => {
        const active = o.key === value;
        return (
          <PressableScale
            key={o.key}
            scaleTo={0.98}
            accessibilityState={{ selected: active }}
            onPress={() => onChange(o.key)}
            style={[styles.segmentItem, active && styles.segmentActive]}
          >
            <AppText variant="captionMedium" color={active ? colors.navy : colors.textSecondary} numberOfLines={1}>
              {o.label}
              {o.count !== undefined ? ` (${o.count})` : ''}
            </AppText>
          </PressableScale>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    height: 34,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  chipActive: { backgroundColor: colors.navy, borderColor: colors.navy },
  chipIdle: { backgroundColor: colors.white, borderColor: colors.border },
  count: { minWidth: 20, paddingHorizontal: 5, borderRadius: 10, alignItems: 'center' },
  countText: { fontSize: 10.5, lineHeight: 17 },
  segment: {
    flexDirection: 'row',
    backgroundColor: colors.navySoft,
    borderRadius: radius.md,
    padding: 4,
    gap: 4,
  },
  segmentItem: { flex: 1, height: 36, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  segmentActive: { backgroundColor: colors.white, ...shadows.card },
});
