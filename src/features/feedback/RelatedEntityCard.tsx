import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, FolderKanban, Inbox, Lightbulb, type LucideIcon } from 'lucide-react-native';
import { AppText, Card, useRelatedTitle } from '@/components';
import { colors, radius, spacing } from '@/theme';
import type { FeedbackCategory } from '@/types';

const META: Record<FeedbackCategory, { label: string; icon: LucideIcon; path?: string }> = {
  proposal: { label: 'المقترح المرتبط', icon: Lightbulb, path: '/proposals/' },
  project: { label: 'المشروع المرتبط', icon: FolderKanban, path: '/projects/' },
  administrative: { label: 'ملاحظة إدارية عامة', icon: Inbox },
};

/** Summary card linking a feedback thread to its proposal / project. */
export function RelatedEntityCard({ category, relatedEntityId, committeeName }: { category: FeedbackCategory; relatedEntityId?: string; committeeName?: string }) {
  const router = useRouter();
  const title = useRelatedTitle({ category, relatedEntityId });
  const meta = META[category];
  const Icon = meta.icon;
  const canOpen = !!meta.path && !!relatedEntityId && !!title;
  return (
    <Card
      onPress={canOpen ? () => router.push(`${meta.path}${relatedEntityId}`) : undefined}
      accessibilityLabel={meta.label}
      style={{ padding: spacing.md }}
    >
      <View style={styles.row}>
        <View style={styles.icon}>
          <Icon size={18} color={colors.navy2} />
        </View>
        <View style={{ flex: 1 }}>
          <AppText variant="meta" color={colors.textSecondary}>
            {meta.label}
          </AppText>
          <AppText variant="cardTitle" numberOfLines={2}>
            {title ?? (category === 'administrative' ? committeeName ?? 'اللجنة' : 'العنصر غير متاح')}
          </AppText>
        </View>
        {canOpen ? <ChevronLeft size={18} color={colors.textMuted} /> : null}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  icon: { width: 40, height: 40, borderRadius: radius.md, backgroundColor: colors.navySoft, alignItems: 'center', justifyContent: 'center' },
});
