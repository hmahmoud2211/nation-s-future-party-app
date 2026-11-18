import React, { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
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
import {
  AppHeader,
  AppText,
  BarChart,
  Card,
  DonutChart,
  EmptyState,
  FilterChips,
  FormSelect,
  ReportCard,
  ScreenContainer,
  SectionHeader,
  StackedBar,
  StatCard,
  StatGrid,
  type ChipOption,
} from '@/components';
import { PERIOD_LABELS, useReportData, type PeriodKey } from '@/features/reports/reportData';
import { useAppStore, useUser } from '@/store';
import { colors, radius, spacing } from '@/theme';
import type { ReportStatus } from '@/types';
import { formatPercent } from '@/utils/format';
import { can, isSectorWide, scopeCommitteeIds } from '@/utils/permissions';

const ALL = '__all__';
type ReportFilter = 'all' | ReportStatus;

/** Sector-level reports & statistics (الأمين، الأمناء المساعدون، أعضاء الهيئة، مدير النظام). */
export default function SectorReportsScreen() {
  const router = useRouter();
  const user = useUser();
  const committees = useAppStore((s) => s.committees);
  const reports = useAppStore((s) => s.reports);
  // Report viewers follow every committee's statistics (read-only outside their scope).
  const scope = useMemo(() => (can(user, 'reports.viewAll') ? committees.map((c) => c.id) : scopeCommitteeIds(user, committees)), [user, committees]);
  const [committeeFilter, setCommitteeFilter] = useState<string>(ALL);
  const [period, setPeriod] = useState<PeriodKey>('all');
  const [reportFilter, setReportFilter] = useState<ReportFilter>('all');

  const ids = useMemo(() => (committeeFilter === ALL ? scope : [committeeFilter]), [committeeFilter, scope]);
  const data = useReportData(ids, period);
  const { stats } = data;

  const committeeOptions = useMemo(
    () => [{ value: ALL, label: 'كل اللجان' }, ...committees.filter((c) => scope.includes(c.id)).map((c) => ({ value: c.id, label: c.name }))],
    [committees, scope],
  );
  const activeCommittees = committees.filter((c) => ids.includes(c.id) && c.enabled).length;

  const scopedReports = useMemo(
    () => reports.filter((r) => ids.includes(r.committeeId)).sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [reports, ids],
  );
  const visibleReports = reportFilter === 'all' ? scopedReports : scopedReports.filter((r) => r.status === reportFilter);
  const reportOptions: ChipOption<ReportFilter>[] = [
    { key: 'all', label: 'الكل', count: scopedReports.length },
    { key: 'submitted', label: 'بانتظار المراجعة', count: scopedReports.filter((r) => r.status === 'submitted').length },
    { key: 'reviewed', label: 'تمت المراجعة', count: scopedReports.filter((r) => r.status === 'reviewed').length },
  ];

  if (!can(user, 'reports.viewAll')) {
    return (
      <ScreenContainer header={<AppHeader title="التقارير" />}>
        <EmptyState icon={ChartColumn} title="غير مصرح" message="التقارير والإحصاءات متاحة للقيادة وأعضاء الهيئة." />
      </ScreenContainer>
    );
  }

  const singleCommittee = committeeFilter !== ALL;

  return (
    <ScreenContainer
      bottomSpace={spacing.huge}
      header={
        <AppHeader
          title="التقارير والإحصاءات"
          subtitle={isSectorWide(user) ? 'نظرة شاملة على أداء لجان القطاع' : 'أداء لجان الأمانة — للاطلاع'}
        >
          <View style={{ gap: spacing.sm }}>
            <FormSelect options={committeeOptions} value={committeeFilter} onChange={(v) => setCommitteeFilter(v ?? ALL)} title="تصفية حسب اللجنة" />
          </View>
        </AppHeader>
      }
    >
      <View style={{ gap: spacing.xl }}>
        <FilterChips
          options={(Object.keys(PERIOD_LABELS) as PeriodKey[]).map((k) => ({ key: k, label: PERIOD_LABELS[k] }))}
          value={period}
          onChange={setPeriod}
        />

        <View>
          <SectionHeader title="المؤشرات الرئيسية" icon={ChartColumn} />
          <StatGrid>
            <StatCard label="لجان نشطة" value={activeCommittees} icon={Building2} tone="navy" />
            <StatCard label="مشروعات نشطة" value={stats.activeProjects} icon={FolderKanban} tone="info" hint={`${stats.completedProjects} مكتملة`} />
            <StatCard label="متوسط إنجاز المشروعات" value={formatPercent(stats.projectsProgress)} icon={CircleCheck} tone="success" />
            <StatCard label="مقترحات بانتظار القرار" value={stats.proposalsPending} icon={ClipboardCheck} tone="warning" onPress={() => router.navigate('/proposals')} />
            <StatCard label="طلبات وملاحظات مفتوحة" value={data.openRequests + stats.feedbackOpen} icon={Inbox} tone="purple" />
            <StatCard label="أنشطة منفذة" value={stats.completedActivities} icon={Wallet} tone="gold" hint={`${stats.upcomingActivities} قادمة`} />
          </StatGrid>
        </View>

        <Card>
          <SectionHeader title="حالة المقترحات" icon={Gift} />
          <DonutChart data={data.proposalDonut} centerLabel="مقترح" />
          <View style={styles.inlineStats}>
            <AppText variant="caption" color={colors.textSecondary}>{`إجمالي المقترحات: ${stats.proposalsTotal}`}</AppText>
            <AppText variant="caption" color={colors.textSecondary}>{`منجزة: ${stats.proposalsCompleted}`}</AppText>
          </View>
        </Card>

        {!singleCommittee ? (
          <Card>
            <SectionHeader title="متوسط إنجاز المشروعات حسب اللجنة" icon={CircleCheck} />
            <BarChart data={data.progressByCommittee} valueFormatter={formatPercent} />
          </Card>
        ) : null}

        <Card>
          <SectionHeader title="حالة المشروعات والمبادرات" icon={FolderKanban} />
          <StackedBar data={data.projectStatusBar} />
        </Card>

        {!singleCommittee ? (
          <Card>
            <SectionHeader title="ملخص نشاط اللجان" subtitle="الأنشطة والاجتماعات المنعقدة والمجدولة" icon={ChartColumn} />
            <BarChart data={data.activityByCommittee} />
          </Card>
        ) : null}

        <Card>
          <SectionHeader title="عبء العمل الإداري" icon={MessagesSquare} />
          <View style={styles.workload}>
            <Workload label="طلبات إدارية مفتوحة" value={data.openRequests} color={colors.purple} />
            <Workload label="ملاحظات بحاجة لرد" value={stats.feedbackOpen} color={colors.info} />
            <Workload label="مقترحات بانتظار القرار" value={stats.proposalsPending} color={colors.warning} />
            <Workload label="تقارير بانتظار المراجعة" value={data.reportsAwaitingReview} color={colors.navy2} />
          </View>
        </Card>

        <View>
          <SectionHeader title="تقارير اللجان" count={scopedReports.length} icon={FileText} />
          <FilterChips options={reportOptions} value={reportFilter} onChange={setReportFilter} style={{ marginBottom: spacing.md }} />
          {visibleReports.length === 0 ? (
            <EmptyState compact icon={FileText} title="لا توجد تقارير" />
          ) : (
            <View style={{ gap: spacing.md }}>
              {visibleReports.map((r) => (
                <ReportCard key={r.id} report={r} onPress={() => router.push(`/report/${r.id}`)} />
              ))}
            </View>
          )}
        </View>

        <View style={styles.note}>
          <ShieldCheck size={16} color={colors.textSecondary} />
          <AppText variant="meta" color={colors.textSecondary} style={{ flex: 1 }}>
            تعرض التقارير بيانات تشغيلية مجمعة على مستوى اللجان فقط، ولا تتضمن أي تقييم فردي للنشاط السياسي. جميع الأرقام تجريبية ومحسوبة لحظياً من البيانات الوهمية.
          </AppText>
        </View>
      </View>
    </ScreenContainer>
  );
}

function Workload({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={styles.workItem}>
      <View style={[styles.workDot, { backgroundColor: color }]} />
      <AppText variant="caption" style={{ flex: 1 }} numberOfLines={1}>
        {label}
      </AppText>
      <AppText variant="bodyBold" color={color}>
        {value}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  inlineStats: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.md, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.border },
  workload: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: spacing.sm },
  workItem: {
    width: '48.5%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.bg,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  workDot: { width: 8, height: 8, borderRadius: 4 },
  note: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start', padding: spacing.md, backgroundColor: colors.navyTint, borderRadius: radius.md },
});
