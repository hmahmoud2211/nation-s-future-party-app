import React, { useMemo } from 'react';
import { View } from 'react-native';
import { Receipt, Wallet } from 'lucide-react-native';
import { AppText } from '@/components/common/AppText';
import { Card } from '@/components/common/Card';
import { InfoRow } from '@/components/ui/InfoRow';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { projectFinance } from '@/features/projects/services/finance';
import type { Project } from '@/features/projects/types';
import { useAppTheme } from '@/hooks/useAppTheme';
import { formatCurrency, formatDate, formatPercent } from '@/utils/format';
import { projectDetailsCopy as copy } from './ProjectDetailsScreen.data';
import { createStyles, FINANCE_BAR_HEIGHT } from './ProjectDetailsScreen.styles';

/** Budget, expenses and remaining amount — rendered only for users with the finance permission. */
export function ProjectFinanceCard({ project, onSetBudget }: { project: Project; onSetBudget: () => void }) {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const f = projectFinance(project);
  const over = f.remaining < 0;
  return (
    <View style={styles.block}>
      <SectionHeader title={copy.financeTitle} icon={Wallet} actionLabel={project.budget ? copy.editBudget : copy.setBudget} onAction={onSetBudget} />
      <Card>
        {project.budget ? (
          <>
            <View style={styles.financeRow}>
              {[
                [copy.budget, formatCurrency(f.budget)],
                [copy.spent, formatCurrency(f.spent)],
                [copy.remaining, formatCurrency(f.remaining)],
              ].map(([label, value], i) => (
                <View key={label} style={styles.financeCell}>
                  <AppText variant="meta" color={theme.colors.textSecondary}>
                    {label}
                  </AppText>
                  <AppText variant="captionMedium" color={i === 2 && over ? theme.colors.error : undefined} numberOfLines={1}>
                    {value}
                  </AppText>
                </View>
              ))}
            </View>
            <ProgressBar value={Math.min(100, f.percent)} color={over ? theme.colors.error : undefined} height={FINANCE_BAR_HEIGHT} style={styles.financeBar} />
            <AppText variant="meta" color={over ? theme.colors.error : theme.colors.textSecondary} style={styles.financeNote}>
              {over ? copy.overBudget(formatPercent(f.percent - 100)) : copy.spendRate(formatPercent(f.percent))}
            </AppText>
            {project.expenses.length ? (
              <View style={styles.expenses}>
                {project.expenses.map((e) => (
                  <InfoRow key={e.id} icon={Receipt} label={copy.expenseLabel(e.label, formatDate(e.date))} value={formatCurrency(e.amount)} />
                ))}
              </View>
            ) : null}
          </>
        ) : (
          <AppText variant="caption" color={theme.colors.textSecondary}>
            {copy.noBudget}
          </AppText>
        )}
      </Card>
    </View>
  );
}
