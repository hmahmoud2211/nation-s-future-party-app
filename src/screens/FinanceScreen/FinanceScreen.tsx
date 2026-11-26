import React, { useMemo, useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Banknote, CircleDollarSign, Percent, PiggyBank, ShieldAlert, Wallet } from 'lucide-react-native';
import { AppText } from '@/components/common/AppText';
import { StatusBadge } from '@/components/common/Badge';
import { Card } from '@/components/common/Card';
import { EmptyState } from '@/components/feedback/States';
import { FormSelect } from '@/components/forms/FormSelect';
import { AppHeader } from '@/components/layout/AppHeader';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { BarChart } from '@/components/ui/Charts';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { StatCard, StatGrid } from '@/components/ui/StatCard';
import { useUser } from '@/features/auth/hooks/useSession';
import { canViewFinance } from '@/features/auth/services/permissions';
import { useCommitteeMap, useCommittees } from '@/features/committees/hooks/useCommittees';
import { useProjects } from '@/features/projects/hooks/useProjects';
import { projectFinance, sumFinance } from '@/features/projects/services/finance';
import { PROJECT_STATUS } from '@/features/projects/services/labels';
import { DemoNotice } from '@/features/settings/components/DemoNotice';
import { useAppTheme } from '@/hooks/useAppTheme';
import { formatCurrency, formatPercent } from '@/utils/format';
import { financeCopy as copy } from './FinanceScreen.data';
import { createStyles, SPEND_BAR_HEIGHT } from './FinanceScreen.styles';

/** «الملخص المالي» — budgets and expenses per project and committee (finance permission only). */
export function FinanceScreen() {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const router = useRouter();
  const user = useUser();
  const projects = useProjects();
  const committees = useCommittees();
  const committeeMap = useCommitteeMap();
  const [committeeId, setCommitteeId] = useState('all');
  const { chartPalette } = theme;

  const scoped = useMemo(() => (committeeId === 'all' ? projects : projects.filter((p) => p.committeeId === committeeId)), [projects, committeeId]);
  const total = useMemo(() => sumFinance(scoped), [scoped]);
  const byCommittee = useMemo(
    () =>
      committees
        .map((c, i) => ({ label: c.shortName, value: sumFinance(projects.filter((p) => p.committeeId === c.id)).spent, color: chartPalette[i % chartPalette.length] }))
        .filter((d) => d.value > 0)
        .sort((a, b) => b.value - a.value),
    [committees, projects, chartPalette],
  );
  const rows = useMemo(
    () => scoped.map((p) => ({ project: p, f: projectFinance(p) })).sort((a, b) => b.f.percent - a.f.percent),
    [scoped],
  );

  if (!canViewFinance(user)) {
    return (
      <ScreenContainer header={<AppHeader title={copy.title} />}>
        <EmptyState icon={ShieldAlert} title={copy.unauthorizedTitle} message={copy.unauthorizedMessage} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer header={<AppHeader title={copy.title} subtitle={copy.subtitle} />}>
      <FormSelect
        options={[{ value: 'all', label: copy.allCommittees }, ...committees.map((c) => ({ value: c.id, label: c.name }))]}
        value={committeeId}
        onChange={(v) => setCommitteeId(v ?? 'all')}
        title={copy.committeeFilterTitle}
      />

      <View style={styles.stats}>
        <StatGrid>
          <StatCard icon={Banknote} tone="primary" label={copy.budget} value={formatCurrency(total.budget)} />
          <StatCard icon={CircleDollarSign} tone="warning" label={copy.spent} value={formatCurrency(total.spent)} />
          <StatCard icon={PiggyBank} tone={total.remaining < 0 ? 'error' : 'success'} label={copy.remaining} value={formatCurrency(total.remaining)} />
          <StatCard icon={Percent} tone="purple" label={copy.spendRate} value={formatPercent(total.percent)} />
        </StatGrid>
      </View>

      {committeeId === 'all' && byCommittee.length ? (
        <View style={styles.section}>
          <SectionHeader title={copy.spentByCommitteeTitle} />
          <Card>
            <BarChart data={byCommittee} valueFormatter={formatCurrency} />
          </Card>
        </View>
      ) : null}

      <View style={styles.section}>
        <SectionHeader title={copy.projectsTitle} count={rows.length} />
        {rows.length ? (
          <View style={styles.rows}>
            {rows.map(({ project, f }) => {
              const over = f.remaining < 0;
              return (
                <Card key={project.id} onPress={() => router.push(`/projects/${project.id}`)} accessibilityLabel={project.title}>
                  <View style={styles.rowTop}>
                    <View style={styles.rowTitle}>
                      <AppText variant="cardTitle" numberOfLines={2}>
                        {project.title}
                      </AppText>
                      <AppText variant="meta" color={theme.colors.textSecondary}>
                        {committeeMap[project.committeeId]?.shortName}
                      </AppText>
                    </View>
                    <StatusBadge status={PROJECT_STATUS[project.status]} />
                  </View>
                  <View style={styles.figures}>
                    <Figure label={copy.figureBudget} value={project.budget ? formatCurrency(f.budget) : copy.figureBudgetUnset} />
                    <Figure label={copy.figureSpent} value={formatCurrency(f.spent)} />
                    <Figure label={copy.figureRemaining} value={formatCurrency(f.remaining)} color={over ? theme.colors.error : undefined} />
                  </View>
                  <ProgressBar value={Math.min(100, f.percent)} color={over ? theme.colors.error : f.percent > 85 ? theme.colors.warning : undefined} height={SPEND_BAR_HEIGHT} />
                  <AppText variant="meta" color={over ? theme.colors.error : theme.colors.textSecondary} style={styles.rowMeta}>
                    {over ? copy.overBudget(formatPercent(f.percent - 100)) : copy.spentSummary(formatPercent(f.percent), formatPercent(project.progress))}
                  </AppText>
                </Card>
              );
            })}
          </View>
        ) : (
          <Card>
            <EmptyState compact icon={Wallet} title={copy.noProjects} />
          </Card>
        )}
      </View>
      <DemoNotice style={styles.section} text={copy.demoNotice} />
    </ScreenContainer>
  );
}

function Figure({ label, value, color }: { label: string; value: string; color?: string }) {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  return (
    <View style={styles.figure}>
      <AppText variant="meta" color={theme.colors.textSecondary}>
        {label}
      </AppText>
      <AppText variant="captionMedium" color={color} numberOfLines={1}>
        {value}
      </AppText>
    </View>
  );
}
