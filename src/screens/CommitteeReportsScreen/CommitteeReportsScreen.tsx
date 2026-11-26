import React, { useMemo } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  CalendarDays,
  ChartColumn,
  CircleCheck,
  Lightbulb,
  FilePlus,
  FileText,
  FolderCheck,
  FolderKanban,
  Sparkles,
  MessagesSquare,
  Send,
  Users,
} from 'lucide-react-native';
import { AppText } from '@/components/common/AppText';
import { Card } from '@/components/common/Card';
import { IconButton } from '@/components/common/IconButton';
import { EmptyState } from '@/components/feedback/States';
import { AppHeader } from '@/components/layout/AppHeader';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { DonutChart, StackedBar } from '@/components/ui/Charts';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { StatCard, StatGrid } from '@/components/ui/StatCard';
import { useUser } from '@/features/auth/hooks/useSession';
import { canCreateCommitteeReport, canOverseeCommittee, canViewCommitteeReports } from '@/features/auth/services/permissions';
import { useCommittee } from '@/features/committees/hooks/useCommittees';
import { ReportCard } from '@/features/reports/components/ReportCard';
import { useReportData } from '@/features/reports/hooks/useReportData';
import { useReports } from '@/features/reports/hooks/useReports';
import { useAppTheme } from '@/hooks/useAppTheme';
import { formatPercent } from '@/utils/format';
import { committeeReportsCopy as copy } from './CommitteeReportsScreen.data';
import { createStyles } from './CommitteeReportsScreen.styles';

/** "تقارير اللجنة" — live committee statistics + written committee reports. */
export function CommitteeReportsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const user = useUser();
  const committee = useCommittee(id);
  const reports = useReports();
  const ids = useMemo(() => (id ? [id] : []), [id]);
  const data = useReportData(ids);
  const committeeReports = useMemo(() => reports.filter((r) => r.committeeId === id).sort((a, b) => b.createdAt.localeCompare(a.createdAt)), [reports, id]);

  if (!committee || !canViewCommitteeReports(user, committee.id)) {
    return (
      <ScreenContainer header={<AppHeader title={copy.title} />}>
        <EmptyState icon={ChartColumn} title={committee ? copy.unauthorized : copy.notFound} />
      </ScreenContainer>
    );
  }

  const { stats } = data;
  const canCreate = canCreateCommitteeReport(user, committee.id);
  // Board members and assistant secretaries can read any committee's statistics.
  const readOnly = !canOverseeCommittee(user, committee.id);

  return (
    <ScreenContainer
      bottomSpace={theme.spacing.huge}
      header={
        <AppHeader
          title={copy.title}
          eyebrow={committee.name}
          subtitle={readOnly ? copy.readOnly : copy.liveStats}
          actions={canCreate ? <IconButton icon={FilePlus} variant="glass" accessibilityLabel={copy.newReport} onPress={() => router.push(`/report/new?committeeId=${committee.id}`)} /> : undefined}
        >
          <StatGrid columns={3}>
            <StatCard glass label={copy.officials} value={stats.officials} icon={Users} />
            <StatCard glass label={copy.projectsProgress} value={formatPercent(stats.projectsProgress)} icon={CircleCheck} />
            <StatCard glass label={copy.upcomingMeetings} value={stats.upcomingMeetings} icon={CalendarDays} />
          </StatGrid>
        </AppHeader>
      }
    >
      <View style={styles.content}>
        <View>
          <SectionHeader title={copy.indicatorsTitle} icon={ChartColumn} />
          <StatGrid>
            <StatCard label={copy.activeProjects} value={stats.activeProjects} icon={FolderKanban} tone="info" />
            <StatCard label={copy.completedProjects} value={stats.completedProjects} icon={FolderCheck} tone="success" />
            <StatCard label={copy.proposalsTotal} value={stats.proposalsTotal} icon={Lightbulb} tone="accent" />
            <StatCard label={copy.proposalsPending} value={stats.proposalsPending} icon={Send} tone="warning" />
            <StatCard label={copy.completedActivities} value={stats.completedActivities} icon={Sparkles} tone="purple" />
            <StatCard label={copy.upcomingActivities} value={stats.upcomingActivities} icon={Sparkles} tone="primary" />
            <StatCard label={copy.feedbackOpen} value={stats.feedbackOpen} icon={MessagesSquare} tone="purple" />
            <StatCard label={copy.scheduledMeetings} value={stats.upcomingMeetings} icon={CalendarDays} tone="info" />
          </StatGrid>
        </View>

        <Card>
          <SectionHeader title={copy.proposalStatusTitle} icon={Lightbulb} />
          <DonutChart data={data.proposalDonut} centerLabel={copy.proposalUnit} />
        </Card>

        <Card>
          <SectionHeader title={copy.projectsTitle} icon={FolderKanban} />
          <StackedBar data={data.projectStatusBar} />
        </Card>

        <View>
          <SectionHeader title={copy.writtenReportsTitle} count={committeeReports.length} icon={FileText} />
          {committeeReports.length === 0 ? (
            <EmptyState
              compact
              icon={FileText}
              title={copy.noReports}
              actionLabel={canCreate ? copy.addReport : undefined}
              onAction={canCreate ? () => router.push(`/report/new?committeeId=${committee.id}`) : undefined}
            />
          ) : (
            <View style={styles.reportList}>
              {committeeReports.map((r) => (
                <ReportCard key={r.id} report={r} onPress={() => router.push(`/report/${r.id}`)} />
              ))}
            </View>
          )}
        </View>

        <AppText variant="meta" color={theme.colors.textSecondary} align="center">
          {copy.footnote}
        </AppText>
      </View>
    </ScreenContainer>
  );
}
