import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { CalendarDays, ChartColumn, CircleCheck, FileText, Flag, Lightbulb, TriangleAlert, UserRound, type LucideIcon } from 'lucide-react-native';
import { ActionBar, AppHeader, AppText, Badge, Button, Card, EmptyState, InfoRow, ScreenContainer, StatusBadge } from '@/components';
import { REPORT_STATUS } from '@/constants/labels';
import { runResult } from '@/features/feedback/runResult';
import { useAppStore, useCommittee, useMember, useUser } from '@/store';
import { promptDialog } from '@/store/uiStore';
import { colors, radius, spacing } from '@/theme';
import { formatDateTime, refCode } from '@/utils/format';
import { canOverseeCommittee, canReviewReport, canViewCommitteeReports } from '@/utils/permissions';

function Section({ title, icon: Icon, text, tone = colors.navy2 }: { title: string; icon: LucideIcon; text?: string; tone?: string }) {
  return (
    <Card>
      <View style={styles.sectionHead}>
        <View style={[styles.sectionIcon, { backgroundColor: `${tone}14` }]}>
          <Icon size={16} color={tone} />
        </View>
        <AppText variant="cardTitle">{title}</AppText>
      </View>
      <AppText variant="body" color={text ? colors.text : colors.textMuted} style={{ marginTop: spacing.sm }}>
        {text || 'لا يوجد'}
      </AppText>
    </Card>
  );
}

export default function ReportDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const user = useUser();
  const reports = useAppStore((s) => s.reports);
  const report = useMemo(() => reports.find((r) => r.id === id), [reports, id]);
  const committee = useCommittee(report?.committeeId);
  const author = useMember(report?.createdBy);
  const reviewer = useMember(report?.reviewedBy);
  const reviewReport = useAppStore((s) => s.reviewReport);

  if (!report || !canViewCommitteeReports(user, report.committeeId)) {
    return (
      <ScreenContainer header={<AppHeader title="تقرير اللجنة" />}>
        <EmptyState icon={FileText} title={report ? 'غير مصرح بعرض هذا التقرير' : 'التقرير غير موجود'} />
      </ScreenContainer>
    );
  }

  const canReview = canReviewReport(user, report);

  const review = async () => {
    const note = await promptDialog({
      title: 'مراجعة التقرير',
      message: 'أضف ملاحظات المراجعة (اختياري) ثم أكّد.',
      placeholder: 'مثال: تقرير متميز، يرجى إضافة مؤشرات كمية…',
      confirmLabel: 'اعتماد المراجعة',
      tone: 'success',
      initialValue: report.reviewNote ?? '',
    });
    if (note === null) return;
    runResult(reviewReport(report.id, note), 'تمت مراجعة التقرير');
  };

  return (
    <ScreenContainer
      header={
        <AppHeader title={report.title} eyebrow={`${refCode.report(report.seq)} • ${committee?.name ?? ''}`}>
          <View style={styles.badges}>
            <StatusBadge status={REPORT_STATUS[report.status]} size="md" />
            <Badge label={report.period} tone="gold" size="md" />
          </View>
        </AppHeader>
      }
      footer={
        canReview ? (
          <ActionBar>
            <Button title={report.status === 'reviewed' ? 'تحديث ملاحظات المراجعة' : 'مراجعة التقرير'} icon={CircleCheck} variant="success" onPress={review} style={{ flex: 1 }} />
          </ActionBar>
        ) : undefined
      }
    >
      <View style={{ gap: spacing.lg }}>
        <Card style={{ paddingVertical: spacing.sm }}>
          <InfoRow icon={UserRound} label="مقدم التقرير" value={author?.name} />
          <InfoRow icon={CalendarDays} label="تاريخ التقديم" value={formatDateTime(report.createdAt)} />
          <InfoRow icon={Flag} label="الفترة" value={report.period} last />
        </Card>

        <Section title="الملخص التنفيذي" icon={FileText} text={report.summary} />
        <Section title="أبرز الإنجازات" icon={Lightbulb} text={report.achievements} tone={colors.success} />
        <Section title="التحديات والمعوقات" icon={TriangleAlert} text={report.challenges} tone={colors.warning} />

        {report.status === 'reviewed' ? (
          <Card accentColor={colors.success}>
            <AppText variant="cardTitle">ملاحظات المراجعة</AppText>
            <AppText variant="body" style={{ marginTop: spacing.xs }}>
              {report.reviewNote}
            </AppText>
            <AppText variant="meta" color={colors.textSecondary} style={{ marginTop: spacing.sm }}>
              {`المراجِع: ${reviewer?.name ?? '—'}`}
            </AppText>
          </Card>
        ) : null}

        <Button
          title="عرض إحصاءات اللجنة"
          icon={ChartColumn}
          variant="secondary"
          onPress={() => router.push(`/report/committee/${report.committeeId}`)}
        />
        {!canOverseeCommittee(user, report.committeeId) ? (
          <AppText variant="meta" color={colors.textSecondary} align="center">
            عرض للاطلاع فقط
          </AppText>
        ) : null}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  badges: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' },
  sectionHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  sectionIcon: { width: 30, height: 30, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
});
