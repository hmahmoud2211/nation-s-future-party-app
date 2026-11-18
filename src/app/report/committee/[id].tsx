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
import {
  AppHeader,
  AppText,
  Card,
  DonutChart,
  EmptyState,
  IconButton,
  ReportCard,
  ScreenContainer,
  SectionHeader,
  StackedBar,
  StatCard,
  StatGrid,
} from '@/components';
import { useReportData } from '@/features/reports/reportData';
import { useAppStore, useCommittee, useUser } from '@/store';
import { colors, spacing } from '@/theme';
import { formatPercent } from '@/utils/format';
import { canCreateCommitteeReport, canOverseeCommittee, canViewCommitteeReports } from '@/utils/permissions';

/** "تقارير اللجنة" — live committee statistics + written committee reports. */
export default function CommitteeReportsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const user = useUser();
  const committee = useCommittee(id);
  const reports = useAppStore((s) => s.reports);
  const ids = useMemo(() => (id ? [id] : []), [id]);
  const data = useReportData(ids);
  const committeeReports = useMemo(() => reports.filter((r) => r.committeeId === id).sort((a, b) => b.createdAt.localeCompare(a.createdAt)), [reports, id]);

  if (!committee || !canViewCommitteeReports(user, committee.id)) {
    return (
      <ScreenContainer header={<AppHeader title="تقارير اللجنة" />}>
        <EmptyState icon={ChartColumn} title={committee ? 'غير مصرح بعرض تقارير هذه اللجنة' : 'اللجنة غير موجودة'} />
      </ScreenContainer>
    );
  }

  const { stats } = data;
  const canCreate = canCreateCommitteeReport(user, committee.id);
  // Board members and assistant secretaries can read any committee's statistics.
  const readOnly = !canOverseeCommittee(user, committee.id);

  return (
    <ScreenContainer
      bottomSpace={spacing.huge}
      header={
        <AppHeader
          title="تقارير اللجنة"
          eyebrow={committee.name}
          subtitle={readOnly ? 'عرض للاطلاع فقط' : 'إحصاءات تشغيلية محدثة لحظياً'}
          actions={canCreate ? <IconButton icon={FilePlus} variant="glass" accessibilityLabel="تقرير جديد" onPress={() => router.push(`/report/new?committeeId=${committee.id}`)} /> : undefined}
        >
          <StatGrid columns={3}>
            <StatCard glass label="المسؤولون" value={stats.officials} icon={Users} />
            <StatCard glass label="إنجاز المشروعات" value={formatPercent(stats.projectsProgress)} icon={CircleCheck} />
            <StatCard glass label="اجتماعات قادمة" value={stats.upcomingMeetings} icon={CalendarDays} />
          </StatGrid>
        </AppHeader>
      }
    >
      <View style={{ gap: spacing.xl }}>
        <View>
          <SectionHeader title="مؤشرات اللجنة" icon={ChartColumn} />
          <StatGrid>
            <StatCard label="مشروعات نشطة" value={stats.activeProjects} icon={FolderKanban} tone="info" />
            <StatCard label="مشروعات مكتملة" value={stats.completedProjects} icon={FolderCheck} tone="success" />
            <StatCard label="مقترحات مقدمة" value={stats.proposalsTotal} icon={Lightbulb} tone="gold" />
            <StatCard label="مقترحات معلقة" value={stats.proposalsPending} icon={Send} tone="warning" />
            <StatCard label="أنشطة منفذة" value={stats.completedActivities} icon={Sparkles} tone="purple" />
            <StatCard label="أنشطة قادمة" value={stats.upcomingActivities} icon={Sparkles} tone="navy" />
            <StatCard label="ملاحظات بحاجة لرد" value={stats.feedbackOpen} icon={MessagesSquare} tone="purple" />
            <StatCard label="اجتماعات مجدولة" value={stats.upcomingMeetings} icon={CalendarDays} tone="info" />
          </StatGrid>
        </View>


        <Card>
          <SectionHeader title="حالة المقترحات" icon={Lightbulb} />
          <DonutChart data={data.proposalDonut} centerLabel="مقترح" />
        </Card>

        <Card>
          <SectionHeader title="المشروعات" icon={FolderKanban} />
          <StackedBar data={data.projectStatusBar} />
        </Card>

        <View>
          <SectionHeader title="التقارير المكتوبة" count={committeeReports.length} icon={FileText} />
          {committeeReports.length === 0 ? (
            <EmptyState
              compact
              icon={FileText}
              title="لا توجد تقارير بعد"
              actionLabel={canCreate ? 'إضافة تقرير' : undefined}
              onAction={canCreate ? () => router.push(`/report/new?committeeId=${committee.id}`) : undefined}
            />
          ) : (
            <View style={{ gap: spacing.md }}>
              {committeeReports.map((r) => (
                <ReportCard key={r.id} report={r} onPress={() => router.push(`/report/${r.id}`)} />
              ))}
            </View>
          )}
        </View>

        <AppText variant="meta" color={colors.textSecondary} align="center">
          بيانات تشغيلية مجمعة — لا تتضمن تقييماً فردياً للأعضاء
        </AppText>
      </View>
    </ScreenContainer>
  );
}
