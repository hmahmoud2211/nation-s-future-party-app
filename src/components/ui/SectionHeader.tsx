import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { ChevronLeft, type LucideIcon } from 'lucide-react-native';
import { borderRadius, colors, layout, sizes, spacing } from '@/theme';
import { AppText } from '@/components/common/AppText';
import { PressableScale } from '@/components/common/PressableScale';

export interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: LucideIcon;
  style?: StyleProp<ViewStyle>;
  count?: number;
  /** Content on the end (left) side, e.g. a total pill — replaces the action link. */
  trailing?: React.ReactNode;
}

/** Section title: navy outline icon + bold navy title, optional action link or trailing element. */
export function SectionHeader({ title, subtitle, actionLabel = 'عرض الكل', onAction, icon: Icon, style, count, trailing }: SectionHeaderProps) {
  return (
    <View style={[styles.row, style]}>
      <View style={styles.titleWrap}>
        {Icon ? <Icon size={sizes.icon.md + 2} color={colors.primary} strokeWidth={1.9} /> : <View style={styles.bar} />}
        <View style={styles.titles}>
          <AppText variant="sectionTitle" numberOfLines={1} accessibilityRole="header">
            {title}
            {count !== undefined ? (
              <AppText variant="caption" color={colors.textSecondary}>{`  (${count})`}</AppText>
            ) : null}
          </AppText>
          {subtitle ? (
            <AppText variant="caption" color={colors.textSecondary}>
              {subtitle}
            </AppText>
          ) : null}
        </View>
      </View>
      {trailing ??
        (onAction ? (
          <PressableScale onPress={onAction} style={styles.action} hitSlop={10} accessibilityRole="link" accessibilityLabel={`${actionLabel} — ${title}`}>
            <AppText variant="captionMedium" color={colors.accentStrong}>
              {actionLabel}
            </AppText>
            <ChevronLeft size={sizes.icon.sm} color={colors.accentStrong} />
          </PressableScale>
        ) : null)}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: layout.sectionTitleGap, gap: spacing.sm },
  titleWrap: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexShrink: 1 },
  titles: { flexShrink: 1 },
  bar: { width: 4, height: 18, borderRadius: borderRadius.xxs, backgroundColor: colors.primary },
  action: { flexDirection: 'row', alignItems: 'center', gap: spacing.xxs, minHeight: 32 },
});

export default SectionHeader;
