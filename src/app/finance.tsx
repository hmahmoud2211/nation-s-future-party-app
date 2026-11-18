import React, { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Banknote, CircleDollarSign, Percent, PiggyBank, ShieldAlert, Wallet } from 'lucide-react-native';
import {
  AppHeader,
  AppText,
  BarChart,
  Card,
  DemoNotice,
  EmptyState,
  FormSelect,
  ProgressBar,
  ScreenContainer,
  SectionHeader,
  StatCard,
  StatGrid,
  StatusBadge,
} from '@/components';
import { CHART_COLORS } from '@/components/charts/Charts';
import { PROJECT_STATUS } from '@/constants/labels';
import { projectFinance, sumFinance, useAppStore, useCommitteeMap, useUser } from '@/store';
import { colors, spacing } from '@/theme';
import { formatCurrency, formatPercent } from '@/utils/format';
import { canViewFinance } from '@/utils/permissions';

/** «الملخص المالي» — budgets and expenses per project and committee (finance permission only). */
export default function FinanceScreen() {
  const router = useRouter();
  const user = useUser();
  const projects = useAppStore((s) => s.projects);
  const committees = useAppStore((s) => s.committees);
  const committeeMap = useCommitteeMap();
  const [committeeId, setCommitteeId] = useState('all');

  const scoped = useMemo(() => (committeeId === 'all' ? projects : projects.filter((p) => p.committeeId === committeeId)), [projects, committeeId]);
  const total = useMemo(() => sumFinance(scoped), [scoped]);
  const byCommittee = useMemo(
    () =>
      committees
        .map((c, i) => ({ label: c.shortName, value: sumFinance(projects.filter((p) => p.committeeId === c.id)).spent, color: CHART_COLORS[i % CHART_COLORS.length] }))
        .filter((d) => d.value > 0)
        .sort((a, b) => b.value - a.value),
    [committees, projects],
  );
  const rows = useMemo(
    () => scoped.map((p) => ({ project: p, f: projectFinance(p) })).sort((a, b) => b.f.percent - a.f.percent),
    [scoped],
  );

  if (!canViewFinance(user)) {
    return (
      <ScreenContainer header={<AppHeader title="الملخص المالي" />}>
        <EmptyState icon={ShieldAlert} title="غير مصرح" message="البيانات المالية متاحة للأمين ومدير النظام فقط." />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer header={<AppHeader title="الملخص المالي" subtitle="ميزانيات ومصروفات مشروعات اللجان" />}>
      <FormSelect
        options={[{ value: 'all', label: 'كل اللجان' }, ...committees.map((c) => ({ value: c.id, label: c.name }))]}
        value={committeeId}
        onChange={(v) => setCommitteeId(v ?? 'all')}
        title="تصفية حسب اللجنة"
      />

      <View style={{ marginTop: spacing.md }}>
        <StatGrid>
          <StatCard icon={Banknote} tone="navy" label="الميزانية المخصصة" value={formatCurrency(total.budget)} />
          <StatCard icon={CircleDollarSign} tone="warning" label="إجمالي المصروف" value={formatCurrency(total.spent)} />
          <StatCard icon={PiggyBank} tone={total.remaining < 0 ? 'error' : 'success'} label="المتبقي" value={formatCurrency(total.remaining)} />
          <StatCard icon={Percent} tone="purple" label="نسبة الصرف" value={formatPercent(total.percent)} />
        </StatGrid>
      </View>

      {committeeId === 'all' && byCommittee.length ? (
        <View style={styles.section}>
          <SectionHeader title="المصروف حسب اللجنة" />
          <Card>
            <BarChart data={byCommittee} valueFormatter={formatCurrency} />
          </Card>
        </View>
      ) : null}

      <View style={styles.section}>
        <SectionHeader title="المشروعات" count={rows.length} />
        {rows.length ? (
          <View style={{ gap: spacing.sm }}>
            {rows.map(({ project, f }) => {
              const over = f.remaining < 0;
              return (
                <Card key={project.id} onPress={() => router.push(`/projects/${project.id}`)} accessibilityLabel={project.title}>
                  <View style={styles.rowTop}>
                    <View style={{ flex: 1 }}>
                      <AppText variant="cardTitle" numberOfLines={2}>
                        {project.title}
                      </AppText>
                      <AppText variant="meta" color={colors.textSecondary}>
                        {committeeMap[project.committeeId]?.shortName}
                      </AppText>
                    </View>
                    <StatusBadge status={PROJECT_STATUS[project.status]} />
                  </View>
                  <View style={styles.figures}>
                    <Figure label="الميزانية" value={project.budget ? formatCurrency(f.budget) : 'لم تُحدد'} />
                    <Figure label="المصروف" value={formatCurrency(f.spent)} />
                    <Figure label="المتبقي" value={formatCurrency(f.remaining)} color={over ? colors.error : undefined} />
                  </View>
                  <ProgressBar value={Math.min(100, f.percent)} color={over ? colors.error : f.percent > 85 ? colors.warning : undefined} height={6} />
                  <AppText variant="meta" color={over ? colors.error : colors.textSecondary} style={{ marginTop: 4 }}>
                    {over ? `تجاوز الميزانية بنسبة ${formatPercent(f.percent - 100)}` : `صُرف ${formatPercent(f.percent)} • إنجاز المشروع ${formatPercent(project.progress)}`}
                  </AppText>
                </Card>
              );
            })}
          </View>
        ) : (
          <Card>
            <EmptyState compact icon={Wallet} title="لا توجد مشروعات" />
          </Card>
        )}
      </View>
      <DemoNotice style={styles.section} text="الأرقام المالية بيانات تجريبية للعرض فقط." />
    </ScreenContainer>
  );
}

function Figure({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <View style={{ flex: 1 }}>
      <AppText variant="meta" color={colors.textSecondary}>
        {label}
      </AppText>
      <AppText variant="captionMedium" color={color} numberOfLines={1}>
        {value}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: spacing.xl },
  rowTop: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  figures: { flexDirection: 'row', gap: spacing.sm, marginVertical: spacing.sm },
});
