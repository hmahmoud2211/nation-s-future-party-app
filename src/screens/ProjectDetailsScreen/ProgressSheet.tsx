import React, { useMemo } from 'react';
import { View } from 'react-native';
import { AppText } from '@/components/common/AppText';
import { Button } from '@/components/common/Button';
import { PressableScale } from '@/components/common/PressableScale';
import { ChoiceChips } from '@/components/forms/ChoiceChips';
import { FormField } from '@/components/forms/FormField';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { PROJECT_STATUS } from '@/features/projects/services/labels';
import type { ProjectStatus } from '@/features/projects/types';
import { useAppTheme } from '@/hooks/useAppTheme';
import { formatPercent } from '@/utils/format';
import { PROGRESS_STEPS, projectDetailsCopy as copy } from './ProjectDetailsScreen.data';
import { createStyles } from './ProjectDetailsScreen.styles';

/** "تحديث تقدم المشروع" — pick a progress step and the project status. */
export function ProgressSheet({
  visible,
  onClose,
  subtitle,
  progress,
  onChangeProgress,
  status,
  onChangeStatus,
  onSave,
}: {
  visible: boolean;
  onClose: () => void;
  subtitle: string;
  progress: number;
  onChangeProgress: (progress: number) => void;
  status: ProjectStatus;
  onChangeStatus: (status: ProjectStatus) => void;
  onSave: () => void;
}) {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title={copy.progressSheetTitle}
      subtitle={subtitle}
      footer={<Button title={copy.saveProgress} onPress={onSave} fullWidth />}
    >
      <FormField label={copy.progressLabel(formatPercent(progress))}>
        <ProgressBar value={progress} style={styles.draftBar} />
        <View style={styles.steps}>
          {PROGRESS_STEPS.map((p) => (
            <PressableScale key={p} onPress={() => onChangeProgress(p)} style={[styles.step, progress === p && styles.stepOn]} accessibilityLabel={copy.stepA11y(p)}>
              <AppText variant="captionMedium" color={progress === p ? theme.colors.white : theme.colors.text}>
                {formatPercent(p)}
              </AppText>
            </PressableScale>
          ))}
        </View>
      </FormField>
      <FormField label={copy.statusLabel}>
        <ChoiceChips
          options={(Object.keys(PROJECT_STATUS) as ProjectStatus[]).map((s) => ({ value: s, label: PROJECT_STATUS[s].label }))}
          value={status}
          onChange={onChangeStatus}
          columns={2}
        />
      </FormField>
    </BottomSheet>
  );
}
