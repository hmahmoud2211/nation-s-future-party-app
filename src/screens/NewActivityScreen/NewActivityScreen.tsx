import React, { useMemo } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { MapPin, Save, Users } from 'lucide-react-native';
import { z } from 'zod';
import { AppInput, TextArea } from '@/components/forms/AppInput';
import { AttachmentPicker } from '@/components/forms/AttachmentPicker';
import { ChoiceChips } from '@/components/forms/ChoiceChips';
import { DateField } from '@/components/forms/DateField';
import { FormField } from '@/components/forms/FormField';
import { FormSelect } from '@/components/forms/FormSelect';
import { ActionBar } from '@/components/layout/ActionBar';
import { AppHeader } from '@/components/layout/AppHeader';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { AppText } from '@/components/common/AppText';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { DemoNotice } from '@/features/settings/components/DemoNotice';
import { useActivityActions } from '@/features/activities/hooks/useActivities';
import { ACTIVITY_TYPE } from '@/features/activities/services/labels';
import { useManageableCommittees } from '@/features/committees/hooks/useCommitteeScope';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useToast } from '@/hooks/useOverlays';
import type { ActivityType } from '@/features/activities/types';
import type { Attachment } from '@/types/common.types';
import { toWesternDigits } from '@/utils/format';
import { useUser } from '@/features/auth/hooks/useSession';
import { newActivityCopy as copy } from './NewActivityScreen.data';
import { createStyles } from './NewActivityScreen.styles';

const schema = z.object({
  title: z.string().trim().min(1, copy.titleRequired).min(4, copy.titleTooShort),
  type: z.enum(['workshop', 'forum', 'visit', 'initiative', 'seminar', 'training'], { message: copy.typeRequired }),
  committeeId: z.string().min(1, copy.committeeRequired),
  date: z.string().min(1, copy.dateRequired),
  location: z.string().trim().min(1, copy.locationRequired),
  capacity: z
    .string()
    .refine((v) => !v.trim() || /^\d+$/.test(toWesternDigits(v.trim())), copy.capacityInvalid)
    .refine((v) => !v.trim() || Number(toWesternDigits(v.trim())) > 0, copy.capacityPositive),
  description: z.string(),
});

type FormValues = z.infer<typeof schema>;

export function NewActivityScreen() {
  const { committeeId: paramCommittee } = useLocalSearchParams<{ committeeId?: string }>();
  const router = useRouter();
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const toast = useToast();
  const user = useUser();
  const committees = useManageableCommittees();
  const { createActivity } = useActivityActions();
  const [images, setImages] = React.useState<Attachment[]>([]);

  const initialCommittee = (paramCommittee && committees.some((c) => c.id === paramCommittee) ? paramCommittee : committees[0]?.id) ?? '';

  const { control, handleSubmit, formState } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { title: '', type: 'workshop', committeeId: initialCommittee, date: '', location: '', capacity: '', description: '' },
  });

  const onSubmit = handleSubmit(
    (v) => {
      const res = createActivity({
        title: v.title,
        type: v.type,
        committeeId: v.committeeId,
        date: v.date,
        location: v.location,
        capacity: v.capacity.trim() ? Number(toWesternDigits(v.capacity.trim())) : undefined,
        description: v.description,
        images,
      });
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success(copy.createdToast);
      router.replace(`/activities/${res.data.id}`);
    },
    () => toast.error(copy.incompleteToast),
  );

  if (committees.length === 0) {
    return (
      <ScreenContainer header={<AppHeader title={copy.noAccessTitle} />}>
        <Card>
          <AppText variant="body" color={theme.colors.textSecondary}>
            {copy.noAccessMessage}
          </AppText>
        </Card>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer
      keyboard
      header={<AppHeader title={copy.title} subtitle={copy.subtitle} />}
      footer={
        <ActionBar>
          <Button title={copy.submit} icon={Save} onPress={onSubmit} loading={formState.isSubmitting} style={styles.submitButton} />
          <Button title={copy.cancel} variant="outline" onPress={() => router.back()} style={styles.cancelButton} />
        </ActionBar>
      }
    >
      <Controller
        control={control}
        name="title"
        render={({ field, fieldState }) => (
          <FormField label={copy.nameLabel} required error={fieldState.error?.message}>
            <AppInput value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} placeholder={copy.namePlaceholder} error={!!fieldState.error} />
          </FormField>
        )}
      />
      <Controller
        control={control}
        name="type"
        render={({ field, fieldState }) => (
          <FormField label={copy.typeLabel} required error={fieldState.error?.message}>
            <ChoiceChips
              options={(Object.keys(ACTIVITY_TYPE) as ActivityType[]).map((t) => ({ value: t, label: ACTIVITY_TYPE[t] }))}
              value={field.value}
              onChange={field.onChange}
              columns={3}
            />
          </FormField>
        )}
      />
      <Controller
        control={control}
        name="committeeId"
        render={({ field, fieldState }) => (
          <FormField label={copy.committeeLabel} required error={fieldState.error?.message}>
            <FormSelect
              title={copy.committeeSheetTitle}
              options={committees.map((c) => ({ value: c.id, label: c.name }))}
              value={field.value}
              disabled={committees.length === 1}
              onChange={(v) => field.onChange(v ?? '')}
              error={!!fieldState.error}
            />
          </FormField>
        )}
      />
      <Controller
        control={control}
        name="date"
        render={({ field, fieldState }) => (
          <FormField label={copy.dateLabel} required error={fieldState.error?.message}>
            <DateField withTime value={field.value || undefined} onChange={(v) => field.onChange(v ?? '')} title={copy.dateSheetTitle} placeholder={copy.datePlaceholder} error={!!fieldState.error} />
          </FormField>
        )}
      />
      <Controller
        control={control}
        name="location"
        render={({ field, fieldState }) => (
          <FormField label={copy.locationLabel} required error={fieldState.error?.message}>
            <AppInput value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} icon={MapPin} placeholder={copy.locationPlaceholder} error={!!fieldState.error} />
          </FormField>
        )}
      />
      <Controller
        control={control}
        name="capacity"
        render={({ field, fieldState }) => (
          <FormField label={copy.capacityLabel} error={fieldState.error?.message} hint={copy.capacityHint}>
            <AppInput value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} icon={Users} placeholder={copy.capacityPlaceholder} keyboardType="number-pad" suffix={copy.capacitySuffix} error={!!fieldState.error} />
          </FormField>
        )}
      />
      <Controller
        control={control}
        name="description"
        render={({ field }) => (
          <FormField label={copy.descriptionLabel}>
            <TextArea value={field.value} onChangeText={field.onChange} placeholder={copy.descriptionPlaceholder} />
          </FormField>
        )}
      />
      <FormField label={copy.imagesLabel} hint={copy.imagesHint}>
        <AttachmentPicker value={images} onChange={setImages} label={copy.attachImage} userId={user.id} />
      </FormField>
      <DemoNotice />
    </ScreenContainer>
  );
}
