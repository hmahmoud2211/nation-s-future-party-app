import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ChevronLeft, FolderKanban, Sparkles, Users } from 'lucide-react-native';
import { COMMITTEE_ICONS } from '@/features/committees/components/committeeIcons';
import { useOpenActivityCount } from '@/features/activities/hooks/useActivities';
import { useCommitteeOfficials, useRegularMemberCount } from '@/features/members/hooks/useMembers';
import { useActiveProjectCount } from '@/features/projects/hooks/useProjects';
import { borderRadius, colors, spacing, tintAlpha, withAlpha } from '@/theme';
import type { Committee } from '@/features/committees/types';
import { shortName } from '@/utils/format';
import { AppText } from '@/components/common/AppText';
import { Badge } from '@/components/common/Badge';
import { Card } from '@/components/common/Card';

export function CommitteeIcon({ committee, size = 48 }: { committee: Pick<Committee, 'icon' | 'color'>; size?: number }) {
  const Icon = COMMITTEE_ICONS[committee.icon];
  return (
    <View style={[styles.icon, { width: size, height: size, borderRadius: size * 0.3, backgroundColor: withAlpha(committee.color, tintAlpha.soft) }]}>
      <Icon size={size * 0.48} color={committee.color} strokeWidth={2} />
    </View>
  );
}

export function CommitteeCard({ committee, onPress }: { committee: Committee; onPress?: () => void }) {
  const officials = useCommitteeOfficials(committee.id);
  const memberCount = useRegularMemberCount(committee.id);
  const activeProjects = useActiveProjectCount(committee.id);
  const activities = useOpenActivityCount(committee.id);

  return (
    <Card onPress={onPress} accessibilityLabel={committee.name} style={!committee.enabled && { opacity: 0.6 }}>
      <View style={styles.row}>
        <CommitteeIcon committee={committee} />
        <View style={{ flex: 1, gap: 2 }}>
          <AppText variant="cardTitle" numberOfLines={2}>
            {committee.name}
          </AppText>
          <AppText variant="meta" color={colors.textSecondary} numberOfLines={2}>
            {officialsLine(officials.map((o) => o.name))}
          </AppText>
        </View>
        {!committee.enabled ? <Badge label="معطلة" tone="neutral" /> : <ChevronLeft size={18} color={colors.textMuted} />}
      </View>
      <AppText variant="caption" color={colors.textSecondary} numberOfLines={2} style={{ marginTop: spacing.sm }}>
        {committee.description}
      </AppText>
      <View style={styles.stats}>
        <Stat icon={Users} label="عضو" value={memberCount} />
        <Stat icon={FolderKanban} label="مشروع نشط" value={activeProjects} />
        <Stat icon={Sparkles} label="نشاط جارٍ" value={activities} />
      </View>
    </Card>
  );
}

/** "المسؤول: …" / "المسؤولون: …، …" — a committee can have several officials. */
export function officialsLine(names: string[]): string {
  if (names.length === 0) return 'لم يُعيَّن مسؤول بعد';
  const short = names.map(shortName);
  return names.length === 1 ? `المسؤول: ${short[0]}` : `المسؤولون: ${short.join('، ')}`;
}

function Stat({ icon: Icon, label, value }: { icon: typeof Users; label: string; value: number }) {
  return (
    <View style={styles.stat}>
      <Icon size={14} color={colors.accentStrong} />
      <AppText variant="captionMedium">{value}</AppText>
      <AppText variant="meta" color={colors.textSecondary}>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  icon: { alignItems: 'center', justifyContent: 'center' },
  stats: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.md, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.border, flexWrap: 'wrap' },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.accentSoft, paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: borderRadius.pill },
});
