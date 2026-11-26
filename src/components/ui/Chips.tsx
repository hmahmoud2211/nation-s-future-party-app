import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { borderRadius, colors, shadows, spacing, typography } from '@/theme';
import { AppText } from '@/components/common/AppText';
import { PressableScale } from '@/components/common/PressableScale';

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
              <View style={[styles.count, { backgroundColor: active ? colors.glassStrong : colors.primarySoft }]}>
                <AppText variant="meta" color={active ? colors.white : colors.primary} style={styles.countText}>
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
            <AppText variant="captionMedium" color={active ? colors.primary : colors.textSecondary} numberOfLines={1}>
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
    gap: spacing.xs6,
    paddingHorizontal: spacing.md,
    height: 34,
    borderRadius: borderRadius.pill,
    borderWidth: 1,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipIdle: { backgroundColor: colors.card, borderColor: colors.border },
  count: { minWidth: 20, paddingHorizontal: spacing.xs5, borderRadius: borderRadius.pill, alignItems: 'center' },
  countText: { ...typography.chipCount },
  segment: {
    flexDirection: 'row',
    backgroundColor: colors.primarySoft,
    borderRadius: borderRadius.md,
    padding: spacing.xs,
    gap: spacing.xs,
  },
  segmentItem: { flex: 1, height: 36, borderRadius: borderRadius.sm, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xs },
  segmentActive: { backgroundColor: colors.surface, ...shadows.card },
});
