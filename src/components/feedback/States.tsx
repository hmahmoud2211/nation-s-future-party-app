import React, { useEffect, useState } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { Inbox, TriangleAlert, type LucideIcon } from 'lucide-react-native';
import { borderRadius, colors, motion, spacing } from '@/theme';
import { AppText } from '@/components/common/AppText';
import { Button } from '@/components/common/Button';

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  compact?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function EmptyState({ icon: Icon = Inbox, title, message, actionLabel, onAction, compact, style }: EmptyStateProps) {
  return (
    <View style={[styles.empty, compact && styles.emptyCompact, style]}>
      <View style={[styles.emptyIcon, compact && styles.emptyIconCompact]}>
        <Icon size={compact ? 22 : 30} color={colors.primary} strokeWidth={1.8} />
      </View>
      <AppText variant={compact ? 'cardTitle' : 'sectionTitle'} align="center">
        {title}
      </AppText>
      {message ? (
        <AppText variant="caption" color={colors.textSecondary} align="center" style={styles.emptyMsg}>
          {message}
        </AppText>
      ) : null}
      {actionLabel && onAction ? <Button title={actionLabel} onPress={onAction} size="sm" variant="secondary" style={{ marginTop: spacing.md }} /> : null}
    </View>
  );
}

export function ErrorState({ title = 'تعذر عرض البيانات', message = 'حدث خطأ غير متوقع، يرجى المحاولة مرة أخرى.', onRetry }: { title?: string; message?: string; onRetry?: () => void }) {
  return (
    <View style={styles.empty}>
      <View style={[styles.emptyIcon, { backgroundColor: colors.errorSoft }]}>
        <TriangleAlert size={30} color={colors.error} />
      </View>
      <AppText variant="sectionTitle" align="center">
        {title}
      </AppText>
      <AppText variant="caption" color={colors.textSecondary} align="center" style={styles.emptyMsg}>
        {message}
      </AppText>
      {onRetry ? <Button title="إعادة المحاولة" onPress={onRetry} size="sm" variant="outline" style={{ marginTop: spacing.md }} /> : null}
    </View>
  );
}

/** Pulsing skeleton block. */
export function Skeleton({ width = '100%', height = 14, radius: r = borderRadius.sm, style }: { width?: number | `${number}%`; height?: number; radius?: number; style?: StyleProp<ViewStyle> }) {
  const opacity = useSharedValue(0.5);
  useEffect(() => {
    opacity.value = withRepeat(withTiming(1, { duration: motion.duration.slow }), -1, true);
  }, [opacity]);
  const animated = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return <Animated.View style={[{ width, height, borderRadius: r, backgroundColor: colors.primarySoft }, animated, style]} />;
}

/** Skeleton list used while a screen "loads" (simulated). */
export function LoadingState({ count = 3 }: { count?: number }) {
  return (
    <View style={{ gap: spacing.md }}>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={styles.skeletonCard}>
          <View style={styles.skeletonRow}>
            <Skeleton width={44} height={44} radius={12} />
            <View style={{ flex: 1, gap: spacing.sm }}>
              <Skeleton width="70%" height={14} />
              <Skeleton width="45%" height={12} />
            </View>
          </View>
          <Skeleton width="100%" height={8} style={{ marginTop: spacing.md }} />
        </View>
      ))}
    </View>
  );
}

/** Short simulated loading delay so skeletons are visible on first mount. */
export function useSimulatedLoading(ms = 450) {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), ms);
    return () => clearTimeout(t);
  }, [ms]);
  return loading;
}

const styles = StyleSheet.create({
  empty: { alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.huge, paddingHorizontal: spacing.xxl },
  emptyCompact: { paddingVertical: spacing.xl },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: borderRadius.pill,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  emptyIconCompact: { width: 52, height: 52, borderRadius: borderRadius.pill },
  emptyMsg: { marginTop: spacing.xs, maxWidth: 320 },
  skeletonCard: { backgroundColor: colors.card, borderRadius: borderRadius.xl, padding: spacing.lg, borderWidth: 1, borderColor: colors.border },
  skeletonRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
});
