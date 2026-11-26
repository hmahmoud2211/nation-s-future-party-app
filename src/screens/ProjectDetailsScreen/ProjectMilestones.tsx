import React, { useMemo } from 'react';
import { View } from 'react-native';
import { Check, Flag, Plus } from 'lucide-react-native';
import { AppText } from '@/components/common/AppText';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { PressableScale } from '@/components/common/PressableScale';
import { EmptyState } from '@/components/feedback/States';
import { AppInput } from '@/components/forms/AppInput';
import { DateField } from '@/components/forms/DateField';
import { FormField } from '@/components/forms/FormField';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { SectionHeader } from '@/components/ui/SectionHeader';
import type { Project } from '@/features/projects/types';
import { useAppTheme } from '@/hooks/useAppTheme';
import { isPastDay } from '@/utils/dates';
import { formatDate } from '@/utils/format';
import { projectDetailsCopy as copy } from './ProjectDetailsScreen.data';
import { CHECK_STROKE_WIDTH, createStyles } from './ProjectDetailsScreen.styles';

function useStyles() {
  const theme = useAppTheme();
  return { theme, styles: useMemo(() => createStyles(theme), [theme]) };
}

/** "المراحل الرئيسية" — tap a milestone to toggle it (managers only). */
export function MilestonesSection({
  project,
  canManage,
  completed,
  onAdd,
  onToggle,
}: {
  project: Project;
  canManage: boolean;
  completed: boolean;
  onAdd: () => void;
  onToggle: (milestoneId: string) => void;
}) {
  const { theme, styles } = useStyles();
  return (
    <View style={styles.block}>
      <SectionHeader
        title={copy.milestonesTitle}
        icon={Flag}
        count={project.milestones.length}
        actionLabel={copy.addMilestone}
        onAction={canManage && !completed ? onAdd : undefined}
      />
      {project.milestones.length ? (
        <Card padded={false}>
          {project.milestones.map((m, i) => (
            <PressableScale
              key={m.id}
              disabled={!canManage}
              onPress={() => onToggle(m.id)}
              scaleTo={0.99}
              accessibilityLabel={m.done ? copy.unmarkMilestoneA11y(m.title) : copy.markMilestoneA11y(m.title)}
              style={[styles.msRow, i < project.milestones.length - 1 && styles.msBorder]}
            >
              <View style={[styles.check, m.done && styles.checkOn]}>
                {m.done ? <Check size={theme.sizes.icon.xs} color={theme.colors.white} strokeWidth={CHECK_STROKE_WIDTH} /> : null}
              </View>
              <View style={styles.msBody}>
                <AppText variant="bodyMedium" color={m.done ? theme.colors.textSecondary : theme.colors.text} style={m.done && styles.strike}>
                  {m.title}
                </AppText>
                <AppText variant="meta" color={theme.colors.textMuted}>
                  {copy.milestoneDue(formatDate(m.dueDate))}
                </AppText>
              </View>
              {m.done ? <Badge label={copy.milestoneDone} tone="success" /> : isPastDay(m.dueDate) ? <Badge label={copy.milestoneLate} tone="error" /> : null}
            </PressableScale>
          ))}
        </Card>
      ) : (
        <EmptyState compact icon={Flag} title={copy.noMilestones} />
      )}
      {canManage ? (
        <AppText variant="meta" color={theme.colors.textSecondary} style={styles.msHint}>
          {copy.milestonesHint}
        </AppText>
      ) : null}
    </View>
  );
}

/** Bottom sheet for adding a milestone (title required; the due date falls back to the project end date). */
export function AddMilestoneSheet({
  visible,
  onClose,
  title,
  onChangeTitle,
  date,
  onChangeDate,
  error,
  onSubmit,
}: {
  visible: boolean;
  onClose: () => void;
  title: string;
  onChangeTitle: (text: string) => void;
  date?: string;
  onChangeDate: (date: string | undefined) => void;
  error: string | null;
  onSubmit: () => void;
}) {
  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title={copy.milestoneSheetTitle}
      footer={<Button title={copy.milestoneSubmit} icon={Plus} onPress={onSubmit} fullWidth />}
    >
      <FormField label={copy.milestoneName} required error={error ?? undefined}>
        <AppInput value={title} onChangeText={onChangeTitle} placeholder={copy.milestoneNamePlaceholder} error={!!error} />
      </FormField>
      <FormField label={copy.milestoneDate} hint={copy.milestoneDateHint}>
        <DateField value={date} onChange={onChangeDate} title={copy.milestoneDate} />
      </FormField>
    </BottomSheet>
  );
}
