import React, { useMemo, useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import {
  Building2,
  ChartColumn,
  CircleCheck,
  ClipboardCheck,
  FileText,
  FolderKanban,
  Gift,
  Inbox,
  MessagesSquare,
  ShieldCheck,
  Wallet,
} from 'lucide-react-native';
import { AppText } from '@/components/common/AppText';
import { Card } from '@/components/common/Card';
import { EmptyState } from '@/components/feedback/States';
import { FormSelect } from '@/components/forms/FormSelect';
import { AppHeader } from '@/components/layout/AppHeader';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { BarChart, DonutChart, StackedBar } from '@/components/ui/Charts';
import { type ChipOption, FilterChips } from '@/components/ui/Chips';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { StatCard, StatGrid } from '@/components/ui/StatCard';
import { useUser } from '@/features/auth/hooks/useSession';
import { can, isSectorWide, scopeCommitteeIds } from '@/features/auth/services/permissions';
import { useCommittees } from '@/features/committees/hooks/useCommittees';
import { ReportCard } from '@/features/reports/components/ReportCard';
import { PERIOD_LABELS, useReportData, type PeriodKey } from '@/features/reports/hooks/useReportData';
import { useReports } from '@/features/reports/hooks/useReports';
import type { ReportStatus } from '@/features/reports/types';
import { useAppTheme } from '@/hooks/useAppTheme';
import { formatPercent } from '@/utils/format';
import { reportsCopy as copy } from './ReportsScreen.data';
import { createStyles } from './ReportsScreen.styles';

const ALL = '__all__';
type ReportFilter = 'all' | ReportStatus;

/** Sector-level reports & statistics (الأمين، الأمناء المساعدون، أعضاء الهيئة، مدير النظام). */
export function ReportsScreen() {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const router = useRouter();
  const user = useUser();
  const committees = useCommittees();
  const reports = useReports();
  // Report viewers follow every committee's statistics (read-only outside their scope).
  const scope = useMemo(() => (can(user, 'reports.viewAll') ? committees.map((c) => c.id) : scopeCommitteeIds(user, committees)), [user, committees]);
  const [committeeFilter, setCommitteeFilter] = useState<string>(ALL);
  const [period, setPeriod] = useState<PeriodKey>('all');
  const [reportFilter, setReportFilter] = useState<ReportFilter>('all');

  const ids = useMemo(() => (committeeFilter === ALL ? scope : [committeeFilter]), [committeeFilter, scope]);
  const data = useReportData(ids, period);
  const { stats } = data;

  const committeeOptions = useMemo(
    () => [{ value: ALL, label: copy.allCommittees }, ...committees.filter((c) => scope.includes(c.id)).map((c) => ({ value: c.id, label: c.name }))],
    [committees, scope],
  );
  const activeCommittees = committees.filter((c) => ids.includes(c.id) && c.enabled).length;

  const scopedReports = useMemo(
    () => reports.filter((r) => ids.includes(r.committeeId)).sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [reports, ids],
  );
  const visibleReports = reportFilter === 'all' ? scopedReports : scopedReports.filter((r) => r.status === reportFilter);
  const reportOptions: ChipOption<ReportFilter>[] = [
    { key: 'all', label: copy.reportFilterAll, count: scopedReports.length },
    { key: 'submitted', label: copy.reportFilterSubmitted, count: scopedReports.filter((r) => r.status === 'submitted').length },
    { key: 'reviewed', label: copy.reportFilterReviewed, count: scopedReports.filter((r) => r.status === 'reviewed').length },
  ];

  if (!can(user, 'reports.viewAll')) {
    return (
      <ScreenContainer header={<AppHeader title={copy.unauthorizedHeader} />}>
        <EmptyState icon={ChartColumn} title={copy.unauthorizedTitle} message={copy.unauthorizedMessage} />
      </ScreenContainer>
    );
  }

  const singleCommittee = committeeFilter !== ALL;

  return (
    <ScreenContainer
      bottomSpace={theme.spacing.huge}
      header={
        <AppHeader
          title={copy.title}
          subtitle={isSectorWide(user) ? copy.subtitleSectorWide : copy.subtitleReadOnly}
        >
          <View style={styles.headerFilters}>
            <FormSelect options={committeeOptions} value={committeeFilter} onChange={(v) => setCommitteeFilter(v ?? ALL)} title={copy.committeeFilterTitle} />
          </View>
        </AppHeader>
      }
    >
      <View style={styles.body}>
        <FilterChips
          options={(Object.keys(PERIOD_LABELS) as PeriodKey[]).map((k) => ({ key: k, label: PERIOD_LABELS[k] }))}
          value={period}
          onChange={setPeriod}
        />

        <View>
          <SectionHeader title={copy.kpisTitle} icon={ChartColumn} />
          <StatGrid>
            <StatCard label={copy.activeCommittees} value={activeCommittees} icon={Building2} tone="primary" />
            <StatCard label={copy.activeProjects} value={stats.activeProjects} icon={FolderKanban} tone="info" hint={copy.completedProjectsHint(stats.completedProjects)} />
            <StatCard label={copy.projectsProgress} value={formatPercent(stats.projectsProgress)} icon={CircleCheck} tone="success" />
            <StatCard label={copy.proposalsPending} value={stats.proposalsPending} icon={ClipboardCheck} tone="warning" onPress={() => router.navigate('/proposals')} />
            <StatCard label={copy.openRequestsAndFeedback} value={data.openRequests + stats.feedbackOpen} icon={Inbox} tone="purple" />
            <StatCard label={copy.completedActivities} value={stats.completedActivities} icon={Wallet} tone="accent" hint={copy.upcomingActivitiesHint(stats.upcomingActivities)} />
          </StatGrid>
        </View>

        <Card>
          <SectionHeader title={copy.proposalStatusTitle} icon={Gift} />
          <DonutChart data={data.proposalDonut} centerLabel={copy.proposalCenterLabel} />
          <View style={styles.inlineStats}>
            <AppText variant="caption" color={theme.colors.textSecondary}>{copy.proposalsTotal(stats.proposalsTotal)}</AppText>
            <AppText variant="caption" color={theme.colors.textSecondary}>{copy.proposalsCompleted(stats.proposalsCompleted)}</AppText>
          </View>
        </Card>

        {!singleCommittee ? (
          <Card>
            <SectionHeader title={copy.progressByCommitteeTitle} icon={CircleCheck} />
            <BarChart data={data.progressByCommittee} valueFormatter={formatPercent} />
          </Card>
        ) : null}

        <Card>
          <SectionHeader title={copy.projectStatusTitle} icon={FolderKanban} />
          <StackedBar data={data.projectStatusBar} />
        </Card>

        {!singleCommittee ? (
          <Card>
            <SectionHeader title={copy.activityTitle} subtitle={copy.activitySubtitle} icon={ChartColumn} />
            <BarChart data={data.activityByCommittee} />
          </Card>
        ) : null}

        <Card>
          <SectionHeader title={copy.workloadTitle} icon={MessagesSquare} />
          <View style={styles.workload}>
            <Workload label={copy.workloadOpenRequests} value={data.openRequests} color={theme.colors.purple} />
            <Workload label={copy.workloadFeedbackOpen} value={stats.feedbackOpen} color={theme.colors.info} />
            <Workload label={copy.workloadProposalsPending} value={stats.proposalsPending} color={theme.colors.warning} />
            <Workload label={copy.workloadReportsAwaitingReview} value={data.reportsAwaitingReview} color={theme.colors.primary} />
          </View>
        </Card>

        <View>
          <SectionHeader title={copy.committeeReportsTitle} count={scopedReports.length} icon={FileText} />
          <FilterChips options={reportOptions} value={reportFilter} onChange={setReportFilter} style={styles.reportChips} />
          {visibleReports.length === 0 ? (
            <EmptyState compact icon={FileText} title={copy.noReports} />
          ) : (
            <View style={styles.reportList}>
              {visibleReports.map((r) => (
                <ReportCard key={r.id} report={r} onPress={() => router.push(`/report/${r.id}`)} />
              ))}
            </View>
          )}
        </View>

        <View style={styles.note}>
          <ShieldCheck size={theme.sizes.icon.sm} color={theme.colors.textSecondary} />
          <AppText variant="meta" color={theme.colors.textSecondary} style={styles.noteText}>
            {copy.privacyNote}
          </AppText>
        </View>
      </View>
    </ScreenContainer>
  );
}

function Workload({ label, value, color }: { label: string; value: number; color: string }) {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  return (
    <View style={styles.workItem}>
      <View style={[styles.workDot, { backgroundColor: color }]} />
      <AppText variant="caption" style={styles.workLabel} numberOfLines={1}>
        {label}
      </AppText>
      <AppText variant="bodyBold" color={color}>
        {value}
      </AppText>
    </View>
  );
}
