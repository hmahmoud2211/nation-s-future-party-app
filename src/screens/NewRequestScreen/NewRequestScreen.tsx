import React, { useMemo, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { Send } from 'lucide-react-native';
import { z } from 'zod';
import { Button } from '@/components/common/Button';
import { AppInput, TextArea } from '@/components/forms/AppInput';
import { AttachmentPicker } from '@/components/forms/AttachmentPicker';
import { ChoiceChips } from '@/components/forms/ChoiceChips';
import { FormField } from '@/components/forms/FormField';
import { FormSelect } from '@/components/forms/FormSelect';
import { ActionBar } from '@/components/layout/ActionBar';
import { AppHeader } from '@/components/layout/AppHeader';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { useUser } from '@/features/auth/hooks/useSession';
import { scopeCommitteeIds } from '@/features/auth/services/permissions';
import { useCommittees } from '@/features/committees/hooks/useCommittees';
import { useRequestActions } from '@/features/requests/hooks/useRequests';
import { REQUEST_TYPE } from '@/features/requests/services/labels';
import type { RequestType } from '@/features/requests/types';
import { DemoNotice } from '@/features/settings/components/DemoNotice';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useToast } from '@/hooks/useOverlays';
import type { Attachment } from '@/types/common.types';
import { newRequestCopy as copy } from './NewRequestScreen.data';
import { createStyles } from './NewRequestScreen.styles';

const TYPES = Object.keys(REQUEST_TYPE) as RequestType[];

const schema = z.object({
  type: z.string().min(1, copy.typeRequired),
  committeeId: z.string().min(1, copy.committeeRequired),
  subject: z.string().trim().min(3, copy.subjectMin),
  description: z.string().trim().min(5, copy.descriptionMin),
});
type FormValues = z.infer<typeof schema>;

export function NewRequestScreen() {
  const params = useLocalSearchParams<{ type?: string; subject?: string; committeeId?: string }>();
  const router = useRouter();
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const toast = useToast();
  const user = useUser();
  const committees = useCommittees();
  const { createRequest } = useRequestActions();
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  const committeeOptions = useMemo(() => {
    const ids = new Set([...user.committeeIds, ...user.managedCommitteeIds, ...scopeCommitteeIds(user, committees)]);
    return committees.filter((c) => ids.has(c.id) && c.enabled).map((c) => ({ value: c.id, label: c.name }));
  }, [committees, user]);

  const initialType = TYPES.includes(params.type as RequestType) ? (params.type as RequestType) : 'admin_inquiry';

  const { control, handleSubmit } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: initialType,
      committeeId: params.committeeId ?? user.committeeIds[0] ?? user.managedCommitteeIds[0] ?? committeeOptions[0]?.value ?? '',
      subject: params.subject ?? '',
      description: '',
    },
  });

  const onSubmit = handleSubmit(
    (v) => {
      const res = createRequest({ type: v.type as RequestType, subject: v.subject, description: v.description, committeeId: v.committeeId, attachments });
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success(copy.sentToast);
      router.replace(`/requests/${res.data.id}`);
    },
    () => toast.error(copy.incompleteToast),
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
        name="type"
        render={({ field, fieldState }) => (
          <FormField label={copy.typeLabel} required error={fieldState.error?.message}>
            <ChoiceChips options={TYPES.map((t) => ({ value: t, label: REQUEST_TYPE[t] }))} value={field.value as RequestType} onChange={field.onChange} columns={2} />
          </FormField>
        )}
      />
      <Controller
        control={control}
        name="committeeId"
        render={({ field, fieldState }) => (
          <FormField label={copy.committeeLabel} required error={fieldState.error?.message}>
            <FormSelect
              options={committeeOptions}
              value={field.value}
              onChange={(v) => field.onChange(v ?? '')}
              placeholder={copy.committeePlaceholder}
              title={copy.committeeSheetTitle}
              error={!!fieldState.error}
            />
          </FormField>
        )}
      />
      <Controller
        control={control}
        name="subject"
        render={({ field, fieldState }) => (
          <FormField label={copy.subjectLabel} required error={fieldState.error?.message}>
            <AppInput value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} placeholder={copy.subjectPlaceholder} error={!!fieldState.error} />
          </FormField>
        )}
      />
      <Controller
        control={control}
        name="description"
        render={({ field, fieldState }) => (
          <FormField label={copy.descriptionLabel} required error={fieldState.error?.message}>
            <TextArea value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} placeholder={copy.descriptionPlaceholder} error={!!fieldState.error} />
          </FormField>
        )}
      />
      <FormField label={copy.attachmentLabel}>
        <AttachmentPicker value={attachments} onChange={setAttachments} userId={user.id} />
      </FormField>
      <DemoNotice text={copy.demoNotice} />
    </ScreenContainer>
  );
}
