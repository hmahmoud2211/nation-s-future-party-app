import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { ChevronLeft, type LucideIcon } from 'lucide-react-native';
import { colors, spacing } from '@/theme';
import { AppText } from './AppText';
import { PressableScale } from './PressableScale';

export interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: LucideIcon;
  style?: StyleProp<ViewStyle>;
  count?: number;
}

export function SectionHeader({ title, subtitle, actionLabel = 'عرض الكل', onAction, icon: Icon, style, count }: SectionHeaderProps) {
  return (
    <View style={[styles.row, style]}>
      <View style={styles.titleWrap}>
        {Icon ? (
          <View style={styles.icon}>
            <Icon size={16} color={colors.goldDark} strokeWidth={2.2} />
          </View>
        ) : (
          <View style={styles.bar} />
        )}
        <View style={{ flexShrink: 1 }}>
          <AppText variant="sectionTitle" numberOfLines={1}>
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
      {onAction ? (
        <PressableScale onPress={onAction} style={styles.action} hitSlop={8}>
          <AppText variant="captionMedium" color={colors.goldDark}>
            {actionLabel}
          </AppText>
          <ChevronLeft size={16} color={colors.goldDark} />
        </PressableScale>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm + 2, gap: spacing.sm },
  titleWrap: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexShrink: 1 },
  bar: { width: 3, height: 16, borderRadius: 2, backgroundColor: colors.gold },
  icon: { width: 26, height: 26, borderRadius: 7, backgroundColor: colors.goldSoft, alignItems: 'center', justifyContent: 'center' },
  action: { flexDirection: 'row', alignItems: 'center', gap: 2 },
});

export default SectionHeader;
