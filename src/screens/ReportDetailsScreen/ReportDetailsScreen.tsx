import React, { useMemo } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { CalendarDays, ChartColumn, CircleCheck, FileText, Flag, Lightbulb, TriangleAlert, UserRound, type LucideIcon } from 'lucide-react-native';
import { AppText } from '@/components/common/AppText';
import { Badge, StatusBadge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { EmptyState } from '@/components/feedback/States';
import { ActionBar } from '@/components/layout/ActionBar';
import { AppHeader } from '@/components/layout/AppHeader';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { InfoRow } from '@/components/ui/InfoRow';
import { useUser } from '@/features/auth/hooks/useSession';
import { canOverseeCommittee, canReviewReport, canViewCommitteeReports } from '@/features/auth/services/permissions';
import { useCommittee } from '@/features/committees/hooks/useCommittees';
import { useMember } from '@/features/members/hooks/useMembers';
import { useReport, useReportActions } from '@/features/reports/hooks/useReports';
import { REPORT_STATUS } from '@/features/reports/services/labels';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useDialogs, useRunResult } from '@/hooks/useOverlays';
import { formatDateTime, refCode } from '@/utils/format';
import { reportDetailsCopy as copy } from './ReportDetailsScreen.data';
import { createStyles } from './ReportDetailsScreen.styles';

function Section({ title, icon: Icon, text, tone }: { title: string; icon: LucideIcon; text?: string; tone?: string }) {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const toneColor = tone ?? theme.colors.primary;
  return (
    <Card>
      <View style={styles.sectionHead}>
        <View style={[styles.sectionIcon, { backgroundColor: theme.withAlpha(toneColor, theme.tintAlpha.faint) }]}>
          <Icon size={theme.sizes.icon.sm} color={toneColor} />
        </View>
        <AppText variant="cardTitle">{title}</AppText>
      </View>
      <AppText variant="body" color={text ? theme.colors.text : theme.colors.textMuted} style={styles.sectionText}>
        {text || copy.emptySection}
      </AppText>
    </Card>
  );
}

export function ReportDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { promptDialog } = useDialogs();
  const runResult = useRunResult();
  const user = useUser();
  const report = useReport(id);
  const committee = useCommittee(report?.committeeId);
  const author = useMember(report?.createdBy);
  const reviewer = useMember(report?.reviewedBy);
  const { reviewReport } = useReportActions();

  if (!report || !canViewCommitteeReports(user, report.committeeId)) {
    return (
      <ScreenContainer header={<AppHeader title={copy.title} />}>
        <EmptyState icon={FileText} title={report ? copy.unauthorized : copy.notFound} />
      </ScreenContainer>
    );
  }

  const canReview = canReviewReport(user, report);

  const review = async () => {
    const note = await promptDialog({
      title: copy.reviewTitle,
      message: copy.reviewMessage,
      placeholder: copy.reviewPlaceholder,
      confirmLabel: copy.reviewConfirm,
      tone: 'success',
      initialValue: report.reviewNote ?? '',
    });
    if (note === null) return;
    runResult(reviewReport(report.id, note), copy.reviewSuccess);
  };

  return (
    <ScreenContainer
      header={
        <AppHeader title={report.title} eyebrow={copy.eyebrow(refCode.report(report.seq), committee?.name ?? '')}>
          <View style={styles.badges}>
            <StatusBadge status={REPORT_STATUS[report.status]} size="md" />
            <Badge label={report.period} tone="accent" size="md" />
          </View>
        </AppHeader>
      }
      footer={
        canReview ? (
          <ActionBar>
            <Button
              title={report.status === 'reviewed' ? copy.updateReviewButton : copy.reviewButton}
              icon={CircleCheck}
              variant="success"
              onPress={review}
              style={styles.reviewButton}
            />
          </ActionBar>
        ) : undefined
      }
    >
      <View style={styles.content}>
        <Card style={styles.infoCard}>
          <InfoRow icon={UserRound} label={copy.author} value={author?.name} />
          <InfoRow icon={CalendarDays} label={copy.submittedAt} value={formatDateTime(report.createdAt)} />
          <InfoRow icon={Flag} label={copy.period} value={report.period} last />
        </Card>

        <Section title={copy.summary} icon={FileText} text={report.summary} />
        <Section title={copy.achievements} icon={Lightbulb} text={report.achievements} tone={theme.colors.success} />
        <Section title={copy.challenges} icon={TriangleAlert} text={report.challenges} tone={theme.colors.warning} />

        {report.status === 'reviewed' ? (
          <Card accentColor={theme.colors.success}>
            <AppText variant="cardTitle">{copy.reviewNotes}</AppText>
            <AppText variant="body" style={styles.reviewNote}>
              {report.reviewNote}
            </AppText>
            <AppText variant="meta" color={theme.colors.textSecondary} style={styles.reviewer}>
              {copy.reviewer(reviewer?.name)}
            </AppText>
          </Card>
        ) : null}

        <Button title={copy.committeeStats} icon={ChartColumn} variant="secondary" onPress={() => router.push(`/report/committee/${report.committeeId}`)} />
        {!canOverseeCommittee(user, report.committeeId) ? (
          <AppText variant="meta" color={theme.colors.textSecondary} align="center">
            {copy.readOnly}
          </AppText>
        ) : null}
      </View>
    </ScreenContainer>
  );
}
