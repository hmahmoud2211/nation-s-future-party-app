import React from 'react';
import { StyleSheet, View } from 'react-native';
import { FileText } from 'lucide-react-native';
import { REPORT_STATUS } from '@/features/reports/services/labels';
import { useCommittee } from '@/features/committees/hooks/useCommittees';
import { borderRadius, colors, spacing } from '@/theme';
import type { CommitteeReport } from '@/features/reports/types';
import { formatDate, refCode } from '@/utils/format';
import { AppText } from '@/components/common/AppText';
import { StatusBadge } from '@/components/common/Badge';
import { Card } from '@/components/common/Card';

export function ReportCard({ report, onPress }: { report: CommitteeReport; onPress?: () => void }) {
  const committee = useCommittee(report.committeeId);
  return (
    <Card onPress={onPress} accessibilityLabel={report.title}>
      <View style={styles.row}>
        <View style={styles.megaphone}>
          <FileText size={16} color={colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <AppText variant="cardTitle" numberOfLines={2}>
            {report.title}
          </AppText>
          <AppText variant="meta" color={colors.textSecondary}>
            {`${committee?.name ?? ''} • ${report.period}`}
          </AppText>
        </View>
        <StatusBadge status={REPORT_STATUS[report.status]} />
      </View>
      <AppText variant="caption" color={colors.textSecondary} numberOfLines={2} style={{ marginTop: spacing.sm }}>
        {report.summary}
      </AppText>
      <AppText variant="meta" color={colors.textMuted} style={{ marginTop: spacing.xs }}>
        {`${refCode.report(report.seq)} • ${formatDate(report.createdAt)}`}
      </AppText>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs + 2, flexWrap: 'wrap' },
  megaphone: { width: 34, height: 34, borderRadius: borderRadius.sm + 2, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center' },
});
