import React, { useMemo } from 'react';
import { View } from 'react-native';
import { AppText } from '@/components/common/AppText';
import { Badge } from '@/components/common/Badge';
import { CommitteeIcon } from '@/features/committees/components/CommitteeCard';
import type { CommitteeStats } from '@/features/committees/services/stats';
import type { Committee } from '@/features/committees/types';
import type { Member } from '@/features/members/types';
import { useAppTheme } from '@/hooks/useAppTheme';
import { shortName } from '@/utils/format';
import { committeeDetailsCopy as copy } from './CommitteeDetailsScreen.data';
import { COMMITTEE_ICON_SIZE, createStyles } from './CommitteeDetailsScreen.styles';

/** Glass card in the header: icon, official(s), headline stats and the state badge. */
export function CommitteeHeaderCard({
  committee,
  officials,
  stats,
  canManage,
}: {
  committee: Committee;
  officials: Member[];
  stats: CommitteeStats;
  canManage: boolean;
}) {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  return (
    <View style={styles.headCard}>
      <View style={styles.iconBg}>
        <CommitteeIcon committee={committee} size={COMMITTEE_ICON_SIZE} />
      </View>
      <View style={styles.headInfo}>
        <AppText variant="meta" color={theme.colors.accentLight}>
          {copy.officialsTitle(officials.length)}
        </AppText>
        <AppText variant="cardTitle" color={theme.colors.white} numberOfLines={3}>
          {officials.length ? copy.officialNames(officials.map((o) => shortName(o.name))) : copy.noOfficial}
        </AppText>
        <AppText variant="meta" color={theme.colors.onPrimaryMuted}>
          {copy.headerStats(stats.members, stats.activeProjects)}
        </AppText>
      </View>
      {!committee.enabled ? <Badge label={copy.disabled} tone="neutral" solid /> : canManage ? <Badge label={copy.youManage} tone="accent" solid /> : null}
    </View>
  );
}
