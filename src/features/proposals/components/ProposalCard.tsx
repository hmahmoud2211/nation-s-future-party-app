import React from 'react';
import { StyleSheet, View } from 'react-native';
import { MapPin } from 'lucide-react-native';
import { PROPOSAL_STATUS } from '@/features/proposals/services/labels';
import { useGovernorateName } from '@/features/governorates/hooks/useGovernorates';
import { useCommittee } from '@/features/committees/hooks/useCommittees';
import { useMember } from '@/features/members/hooks/useMembers';
import { colors, spacing } from '@/theme';
import type { Proposal } from '@/features/proposals/types';
import { formatRelative, refCode, shortName } from '@/utils/format';
import { AppText } from '@/components/common/AppText';
import { StatusBadge } from '@/components/common/Badge';
import { Card } from '@/components/common/Card';

/** Compact proposal row: title, committee, author, status. */
export function ProposalCard({ proposal, onPress, showCommittee = true }: { proposal: Proposal; onPress?: () => void; showCommittee?: boolean }) {
  const committee = useCommittee(proposal.committeeId);
  const author = useMember(proposal.createdBy);
  const governorate = useGovernorateName(proposal.governorateId);
  const status = PROPOSAL_STATUS[proposal.status];
  return (
    <Card onPress={onPress} accessibilityLabel={proposal.title} style={styles.card}>
      <View style={styles.top}>
        <AppText variant="cardTitle" numberOfLines={2} style={{ flex: 1 }}>
          {proposal.title}
        </AppText>
        <StatusBadge status={status} />
      </View>
      <AppText variant="caption" color={colors.textSecondary} numberOfLines={1}>
        {[showCommittee ? committee?.shortName : null, author ? shortName(author.name) : null].filter(Boolean).join(' • ')}
      </AppText>
      <View style={styles.meta}>
        <AppText variant="meta" color={colors.textMuted}>
          {`${refCode.proposal(proposal.seq)} • ${formatRelative(proposal.updatedAt)}`}
        </AppText>
        {governorate ? (
          <View style={styles.gov}>
            <MapPin size={12} color={colors.textMuted} />
            <AppText variant="meta" color={colors.textMuted}>
              {governorate}
            </AppText>
          </View>
        ) : null}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: 2 },
  top: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  meta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 },
  gov: { flexDirection: 'row', alignItems: 'center', gap: 3 },
});
