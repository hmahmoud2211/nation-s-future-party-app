import React, { useMemo, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { Send, ShieldAlert } from 'lucide-react-native';
import { z } from 'zod';
import { AppInput, TextArea } from '@/components/forms/AppInput';
import { AttachmentPicker } from '@/components/forms/AttachmentPicker';
import { FormField } from '@/components/forms/FormField';
import { FormSelect } from '@/components/forms/FormSelect';
import { ActionBar } from '@/components/layout/ActionBar';
import { AppHeader } from '@/components/layout/AppHeader';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Button } from '@/components/common/Button';
import { EmptyState } from '@/components/feedback/States';
import { useUser } from '@/features/auth/hooks/useSession';
import { useCommittees } from '@/features/committees/hooks/useCommittees';
import { useGovernorates } from '@/features/governorates/hooks/useGovernorates';
import { useProposalActions } from '@/features/proposals/hooks/useProposals';
import type { Attachment } from '@/types/common.types';
import { canSubmitProposal, isAdmin } from '@/features/auth/services/permissions';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useToast } from '@/hooks/useOverlays';
import { newProposalCopy as copy } from './NewProposalScreen.data';
import { createStyles } from './NewProposalScreen.styles';

const schema = z.object({
  committeeId: z.string().min(1, copy.errors.committeeRequired),
  title: z.string().trim().min(5, copy.errors.titleMin).max(120, copy.errors.titleMax),
  description: z.string().trim().min(10, copy.errors.descriptionMin).max(600, copy.errors.descriptionMax),
  objective: z.string().trim().min(5, copy.errors.objectiveMin).max(300, copy.errors.objectiveMax),
  governorateId: z.string(),
});
type FormValues = z.infer<typeof schema>;

/** Short proposal form: committee, title, description, objective (+ optional governorate & attachment). */
export function NewProposalScreen() {
  const params = useLocalSearchParams<{ committeeId?: string }>();
  const router = useRouter();
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const toast = useToast();
  const user = useUser();
  const committees = useCommittees();
  const governorates = useGovernorates();
  const { createProposal } = useProposalActions();
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  const committeeOptions = useMemo(
    () => committees.filter((c) => c.enabled && canSubmitProposal(user, c.id)).map((c) => ({ value: c.id, label: c.name })),
    [committees, user],
  );
  const initialCommittee =
    params.committeeId && committeeOptions.some((o) => o.value === params.committeeId)
      ? params.committeeId
      : committeeOptions.length === 1
        ? committeeOptions[0].value
        : '';

  const { control, handleSubmit } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { committeeId: initialCommittee, title: '', description: '', objective: '', governorateId: '' },
  });

  if (!committeeOptions.length) {
    return (
      <ScreenContainer header={<AppHeader title={copy.title} />}>
        <EmptyState
          icon={ShieldAlert}
          title={copy.unauthorized}
          message={isAdmin(user) ? copy.noEnabledCommittees : copy.committeeOfficialsOnly}
        />
      </ScreenContainer>
    );
  }

  const onSubmit = handleSubmit(
    (v) => {
      const res = createProposal({
        committeeId: v.committeeId,
        title: v.title,
        description: v.description,
        objective: v.objective,
        governorateId: v.governorateId || undefined,
        attachments,
      });
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success(copy.submitted);
      router.replace(`/proposals/${res.data.id}`);
    },
    () => toast.error(copy.incomplete),
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
      {committeeOptions.length > 1 ? (
        <Controller
          control={control}
          name="committeeId"
          render={({ field, fieldState }) => (
            <FormField label={copy.committeeLabel} required error={fieldState.error?.message}>
              <FormSelect options={committeeOptions} value={field.value} onChange={(v) => field.onChange(v ?? '')} title={copy.chooseCommittee} placeholder={copy.chooseCommittee} error={!!fieldState.error} />
            </FormField>
          )}
        />
      ) : null}
      <Controller
        control={control}
        name="title"
        render={({ field, fieldState }) => (
          <FormField label={copy.titleLabel} required error={fieldState.error?.message}>
            <AppInput value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} placeholder={copy.titlePlaceholder} error={!!fieldState.error} accessibilityLabel={copy.titleLabel} />
          </FormField>
        )}
      />
      <Controller
        control={control}
        name="description"
        render={({ field, fieldState }) => (
          <FormField label={copy.descriptionLabel} required error={fieldState.error?.message}>
            <TextArea value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} placeholder={copy.descriptionPlaceholder} error={!!fieldState.error} accessibilityLabel={copy.descriptionLabel} />
          </FormField>
        )}
      />
      <Controller
        control={control}
        name="objective"
        render={({ field, fieldState }) => (
          <FormField label={copy.objectiveLabel} required error={fieldState.error?.message}>
            <AppInput value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} placeholder={copy.objectivePlaceholder} error={!!fieldState.error} accessibilityLabel={copy.objectiveLabel} />
          </FormField>
        )}
      />
      <Controller
        control={control}
        name="governorateId"
        render={({ field }) => (
          <FormField label={copy.governorateLabel} hint={copy.governorateHint}>
            <FormSelect
              options={governorates.map((g) => ({ value: g.id, label: g.name, description: g.region }))}
              value={field.value || undefined}
              onChange={(v) => field.onChange(v ?? '')}
              title={copy.chooseGovernorate}
              placeholder={copy.noGovernorate}
              allowClear
            />
          </FormField>
        )}
      />
      <FormField label={copy.attachmentsLabel}>
        <AttachmentPicker value={attachments} onChange={setAttachments} userId={user.id} />
      </FormField>
    </ScreenContainer>
  );
}
