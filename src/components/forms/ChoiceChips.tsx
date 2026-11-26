import React from 'react';
import { StyleSheet, Switch, View } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { borderRadius, colors, spacing } from '@/theme';
import { AppText } from '@/components/common/AppText';
import { PressableScale } from '@/components/common/PressableScale';

export interface Choice<T extends string> {
  value: T;
  label: string;
  icon?: LucideIcon;
  description?: string;
}

/** Radio-like selectable chips (e.g. incentive type, priority). */
export function ChoiceChips<T extends string>({
  options,
  value,
  onChange,
  columns,
  error,
}: {
  options: Choice<T>[];
  value?: T;
  onChange: (v: T) => void;
  columns?: 2 | 3;
  error?: boolean;
}) {
  return (
    <View style={styles.wrap}>
      {options.map((o) => {
        const active = o.value === value;
        const Icon = o.icon;
        return (
          <PressableScale
            key={o.value}
            onPress={() => onChange(o.value)}
            accessibilityState={{ selected: active }}
            style={[
              styles.chip,
              columns ? { width: columns === 2 ? '48.5%' : '31.5%' } : null,
              active && styles.active,
              error && !value && { borderColor: colors.error },
            ]}
          >
            {Icon ? <Icon size={16} color={active ? colors.accent : colors.primary} /> : null}
            <AppText variant="captionMedium" color={active ? colors.white : colors.text} numberOfLines={1} style={{ flexShrink: 1 }}>
              {o.label}
            </AppText>
          </PressableScale>
        );
      })}
    </View>
  );
}

/** Checkbox-like chips — several values can be selected (e.g. a person's roles). */
export function MultiChoiceChips<T extends string>({
  options,
  value,
  onChange,
  columns,
  error,
}: {
  options: Choice<T>[];
  value: T[];
  onChange: (v: T[]) => void;
  columns?: 2 | 3;
  error?: boolean;
}) {
  return (
    <View style={styles.wrap}>
      {options.map((o) => {
        const active = value.includes(o.value);
        const Icon = o.icon;
        return (
          <PressableScale
            key={o.value}
            onPress={() => onChange(active ? value.filter((v) => v !== o.value) : [...value, o.value])}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: active }}
            style={[
              styles.chip,
              columns ? { width: columns === 2 ? '48.5%' : '31.5%' } : null,
              active && styles.active,
              error && value.length === 0 && { borderColor: colors.error },
            ]}
          >
            {Icon ? <Icon size={16} color={active ? colors.accent : colors.primary} /> : null}
            <AppText variant="captionMedium" color={active ? colors.white : colors.text} numberOfLines={1} style={{ flexShrink: 1 }}>
              {o.label}
            </AppText>
          </PressableScale>
        );
      })}
    </View>
  );
}

export function SwitchRow({ label, description, value, onChange }: { label: string; description?: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <View style={styles.switchRow}>
      <View style={{ flex: 1 }}>
        <AppText variant="bodyMedium">{label}</AppText>
        {description ? (
          <AppText variant="meta" color={colors.textSecondary}>
            {description}
          </AppText>
        ) : null}
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ true: colors.accent, false: colors.borderStrong }}
        thumbColor={colors.white}
        {...({ activeThumbColor: colors.white } as object)}
        accessibilityLabel={label}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    minHeight: 42,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.frostStrong,
  },
  active: { backgroundColor: colors.primary, borderColor: colors.primary },
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm },
});
