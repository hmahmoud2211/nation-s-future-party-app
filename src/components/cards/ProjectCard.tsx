import React from 'react';
import { StyleSheet, View } from 'react-native';
import { CalendarRange, Flag } from 'lucide-react-native';
import { PROJECT_STATUS } from '@/constants/labels';
import { useCommittee, useMemberMap } from '@/store';
import { colors, spacing } from '@/theme';
import type { Project } from '@/types';
import { formatShortDate, refCode } from '@/utils/format';
import { AppText } from '../ui/AppText';
import { AvatarStack } from '../ui/Avatar';
import { StatusBadge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { ProgressBar } from '../ui/ProgressBar';

export function ProjectCard({ project, onPress }: { project: Project; onPress?: () => void }) {
  const committee = useCommittee(project.committeeId);
  const members = useMemberMap();
  const team = [project.leadId, ...project.teamIds].map((id) => members[id]).filter(Boolean).map((m) => ({ name: m.name, color: m.avatarColor }));
  const done = project.milestones.filter((m) => m.done).length;
  return (
    <Card onPress={onPress} accessibilityLabel={project.title}>
      <View style={styles.head}>
        <StatusBadge status={PROJECT_STATUS[project.status]} />
        <View style={{ flex: 1 }} />
        <AppText variant="meta" color={colors.textMuted}>
          {refCode.project(project.seq)}
        </AppText>
      </View>
      <AppText variant="cardTitle" numberOfLines={2} style={{ marginTop: spacing.sm }}>
        {project.title}
      </AppText>
      <AppText variant="meta" color={colors.textSecondary} numberOfLines={1}>
        {committee?.name}
      </AppText>
      <ProgressBar value={project.progress} showLabel style={{ marginTop: spacing.md }} />
      <View style={styles.foot}>
        <AvatarStack people={team} size={26} />
        <View style={{ flex: 1 }} />
        <View style={styles.inline}>
          <Flag size={13} color={colors.textSecondary} />
          <AppText variant="meta" color={colors.textSecondary}>{`${done}/${project.milestones.length}`}</AppText>
        </View>
        <View style={styles.inline}>
          <CalendarRange size={13} color={colors.textSecondary} />
          <AppText variant="meta" color={colors.textSecondary}>
            {formatShortDate(project.endDate)}
          </AppText>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center' },
  foot: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginTop: spacing.md },
  inline: { flexDirection: 'row', alignItems: 'center', gap: 4 },
});
