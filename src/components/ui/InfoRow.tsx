import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { colors, spacing } from '@/theme';
import { AppText } from '@/components/common/AppText';

/** Label / value row used on detail screens. */
export function InfoRow({
  icon: Icon,
  label,
  value,
  children,
  style,
  last,
}: {
  icon?: LucideIcon;
  label: string;
  value?: string | number;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  last?: boolean;
}) {
  return (
    <View style={[styles.row, !last && styles.border, style]}>
      <View style={styles.labelWrap}>
        {Icon ? <Icon size={16} color={colors.textSecondary} strokeWidth={2} /> : null}
        <AppText variant="caption" color={colors.textSecondary}>
          {label}
        </AppText>
      </View>
      <View style={styles.value}>
        {children ?? (
          <AppText variant="bodyMedium" align="end" numberOfLines={2}>
            {value ?? '—'}
          </AppText>
        )}
      </View>
    </View>
  );
}

export function Divider({ style }: { style?: StyleProp<ViewStyle> }) {
  return <View style={[{ height: 1, backgroundColor: colors.divider, marginVertical: spacing.md }, style]} />;
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.md - 2, gap: spacing.md },
  border: { borderBottomWidth: 1, borderBottomColor: colors.divider },
  labelWrap: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexShrink: 0, maxWidth: '45%' },
  value: { flex: 1, alignItems: 'flex-end' },
});
