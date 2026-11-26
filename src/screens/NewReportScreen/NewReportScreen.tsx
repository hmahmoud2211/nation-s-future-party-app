import React, { useMemo } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { FileText, Send } from 'lucide-react-native';
import { z } from 'zod';
import { Button } from '@/components/common/Button';
import { EmptyState } from '@/components/feedback/States';
import { AppInput, TextArea } from '@/components/forms/AppInput';
import { ChoiceChips } from '@/components/forms/ChoiceChips';
import { FormField } from '@/components/forms/FormField';
import { FormSelect } from '@/components/forms/FormSelect';
import { ActionBar } from '@/components/layout/ActionBar';
import { AppHeader } from '@/components/layout/AppHeader';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { useUser } from '@/features/auth/hooks/useSession';
import { canManageCommittee } from '@/features/auth/services/permissions';
import { useCommittees } from '@/features/committees/hooks/useCommittees';
import { useReportActions } from '@/features/reports/hooks/useReports';
import { DemoNotice } from '@/features/settings/components/DemoNotice';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useToast } from '@/hooks/useOverlays';
import { newReportCopy as copy } from './NewReportScreen.data';
import { createStyles } from './NewReportScreen.styles';

const schema = z.object({
  committeeId: z.string().min(1, copy.committeeRequired),
  title: z.string().trim().min(3, copy.titleRequired),
  period: z.string().min(1, copy.periodRequired),
  summary: z.string().trim().min(10, copy.summaryRequired),
  achievements: z.string(),
  challenges: z.string(),
});
type FormValues = z.infer<typeof schema>;

export function NewReportScreen() {
  const params = useLocalSearchParams<{ committeeId?: string }>();
  const router = useRouter();
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const toast = useToast();
  const user = useUser();
  const committees = useCommittees();
  const { createReport } = useReportActions();

  const options = useMemo(
    () => committees.filter((c) => canManageCommittee(user, c.id)).map((c) => ({ value: c.id, label: c.name })),
    [committees, user],
  );
  const initialCommittee = params.committeeId && options.some((o) => o.value === params.committeeId) ? params.committeeId : options[0]?.value ?? '';
  const initialName = committees.find((c) => c.id === initialCommittee)?.name ?? copy.fallbackCommitteeName;

  const { control, handleSubmit } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { committeeId: initialCommittee, title: copy.defaultTitle(initialName), period: copy.periods[0], summary: '', achievements: '', challenges: '' },
  });

  if (options.length === 0) {
    return (
      <ScreenContainer header={<AppHeader title={copy.title} />}>
        <EmptyState icon={FileText} title={copy.unauthorizedTitle} message={copy.unauthorizedMessage} />
      </ScreenContainer>
    );
  }

  const onSubmit = handleSubmit(
    (v) => {
      const res = createReport(v);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success(copy.submitSuccess);
      router.replace(`/report/${res.data.id}`);
    },
    () => toast.error(copy.incompleteForm),
  );

  return (
    <ScreenContainer
      keyboard
      header={<AppHeader title={copy.title} subtitle={copy.subtitle} />}
      footer={
        <ActionBar>
          <Button title={copy.submit} icon={Send} onPress={onSubmit} style={styles.submitButton} />
          <Button title={copy.cancel} variant="outline" onPress={() => router.back()} style={styles.cancelButton} />
        </ActionBar>
      }
    >
      <Controller
        control={control}
        name="committeeId"
        render={({ field, fieldState }) => (
          <FormField label={copy.committeeLabel} required error={fieldState.error?.message}>
            <FormSelect options={options} value={field.value} onChange={(v) => field.onChange(v ?? '')} title={copy.chooseCommittee} disabled={options.length === 1} error={!!fieldState.error} />
          </FormField>
        )}
      />
      <Controller
        control={control}
        name="title"
        render={({ field, fieldState }) => (
          <FormField label={copy.reportTitleLabel} required error={fieldState.error?.message}>
            <AppInput value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} placeholder={copy.reportTitlePlaceholder} error={!!fieldState.error} />
          </FormField>
        )}
      />
      <Controller
        control={control}
        name="period"
        render={({ field, fieldState }) => (
          <FormField label={copy.periodLabel} required error={fieldState.error?.message}>
            <ChoiceChips options={copy.periods.map((p) => ({ value: p, label: p }))} value={field.value as (typeof copy.periods)[number]} onChange={field.onChange} columns={2} />
          </FormField>
        )}
      />
      <Controller
        control={control}
        name="summary"
        render={({ field, fieldState }) => (
          <FormField label={copy.summaryLabel} required error={fieldState.error?.message}>
            <TextArea value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} placeholder={copy.summaryPlaceholder} error={!!fieldState.error} />
          </FormField>
        )}
      />
      <Controller
        control={control}
        name="achievements"
        render={({ field }) => (
          <FormField label={copy.achievementsLabel}>
            <TextArea value={field.value} onChangeText={field.onChange} placeholder={copy.achievementsPlaceholder} />
          </FormField>
        )}
      />
      <Controller
        control={control}
        name="challenges"
        render={({ field }) => (
          <FormField label={copy.challengesLabel}>
            <TextArea value={field.value} onChangeText={field.onChange} placeholder={copy.challengesPlaceholder} />
          </FormField>
        )}
      />
      <DemoNotice text={copy.demoNotice} />
    </ScreenContainer>
  );
}
