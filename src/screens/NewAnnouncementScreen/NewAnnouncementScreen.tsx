import React, { useMemo, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { Megaphone } from 'lucide-react-native';
import { z } from 'zod';
import { Button } from '@/components/common/Button';
import { EmptyState } from '@/components/feedback/States';
import { AppInput, TextArea } from '@/components/forms/AppInput';
import { AttachmentPicker } from '@/components/forms/AttachmentPicker';
import { ChoiceChips } from '@/components/forms/ChoiceChips';
import { FormField } from '@/components/forms/FormField';
import { FormSelect } from '@/components/forms/FormSelect';
import { ActionBar } from '@/components/layout/ActionBar';
import { AppHeader } from '@/components/layout/AppHeader';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { useAnnouncementActions } from '@/features/announcements/hooks/useAnnouncements';
import { ANNOUNCEMENT_CATEGORY, ANNOUNCEMENT_PRIORITY } from '@/features/announcements/services/labels';
import type { AnnouncementCategory, AnnouncementPriority } from '@/features/announcements/types';
import { useUser } from '@/features/auth/hooks/useSession';
import { canPublishAnyAnnouncement, isSectorWide } from '@/features/auth/services/permissions';
import { useCommittees } from '@/features/committees/hooks/useCommittees';
import { DemoNotice } from '@/features/settings/components/DemoNotice';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useToast } from '@/hooks/useOverlays';
import type { Attachment } from '@/types/common.types';
import { newAnnouncementCopy as copy } from './NewAnnouncementScreen.data';
import { createStyles } from './NewAnnouncementScreen.styles';

const SECTOR = '__sector__';

const schema = z.object({
  title: z.string().trim().min(3, copy.titleMin),
  body: z.string().trim().min(10, copy.bodyMin),
  committeeId: z.string().min(1, copy.committeeRequired),
  priority: z.enum(['normal', 'important', 'urgent']),
  category: z.enum(['general', 'meeting', 'event', 'administrative']),
});
type FormValues = z.infer<typeof schema>;

export function NewAnnouncementScreen() {
  const params = useLocalSearchParams<{ committeeId?: string }>();
  const router = useRouter();
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const toast = useToast();
  const user = useUser();
  const committees = useCommittees();
  const { createAnnouncement } = useAnnouncementActions();
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const sectorWide = isSectorWide(user);

  const options = useMemo(() => {
    const list = committees
      .filter((c) => c.enabled && (sectorWide || user.managedCommitteeIds.includes(c.id)))
      .map((c) => ({ value: c.id, label: c.name }));
    return sectorWide ? [{ value: SECTOR, label: copy.sectorOption, description: copy.sectorOptionDescription }, ...list] : list;
  }, [committees, sectorWide, user.managedCommitteeIds]);

  const { control, handleSubmit } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      body: '',
      committeeId: params.committeeId ?? (sectorWide ? SECTOR : user.managedCommitteeIds[0] ?? ''),
      priority: 'normal',
      category: 'general',
    },
  });

  if (!canPublishAnyAnnouncement(user)) {
    return (
      <ScreenContainer header={<AppHeader title={copy.title} />}>
        <EmptyState icon={Megaphone} title={copy.unauthorizedTitle} message={copy.unauthorizedMessage} />
      </ScreenContainer>
    );
  }

  const onSubmit = handleSubmit(
    (v) => {
      const res = createAnnouncement({
        title: v.title,
        body: v.body,
        committeeId: v.committeeId === SECTOR ? null : v.committeeId,
        priority: v.priority as AnnouncementPriority,
        category: v.category as AnnouncementCategory,
        attachments,
      });
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success(copy.publishedToast);
      router.replace(`/announcements/${res.data.id}`);
    },
    () => toast.error(copy.incompleteToast),
  );

  return (
    <ScreenContainer
      keyboard
      header={<AppHeader title={copy.title} subtitle={copy.subtitle} />}
      footer={
        <ActionBar>
          <Button title={copy.publish} icon={Megaphone} onPress={onSubmit} style={styles.submitButton} />
          <Button title={copy.cancel} variant="outline" onPress={() => router.back()} style={styles.cancelButton} />
        </ActionBar>
      }
    >
      <Controller
        control={control}
        name="title"
        render={({ field, fieldState }) => (
          <FormField label={copy.titleLabel} required error={fieldState.error?.message}>
            <AppInput value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} placeholder={copy.titlePlaceholder} error={!!fieldState.error} />
          </FormField>
        )}
      />
      <Controller
        control={control}
        name="body"
        render={({ field, fieldState }) => (
          <FormField label={copy.bodyLabel} required error={fieldState.error?.message}>
            <TextArea value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} placeholder={copy.bodyPlaceholder} error={!!fieldState.error} />
          </FormField>
        )}
      />
      <Controller
        control={control}
        name="committeeId"
        render={({ field, fieldState }) => (
          <FormField label={copy.targetLabel} required error={fieldState.error?.message}>
            <FormSelect
              options={options}
              value={field.value}
              onChange={(v) => field.onChange(v ?? '')}
              placeholder={copy.targetPlaceholder}
              title={copy.targetSheetTitle}
              error={!!fieldState.error}
            />
          </FormField>
        )}
      />
      <Controller
        control={control}
        name="priority"
        render={({ field }) => (
          <FormField label={copy.priorityLabel}>
            <ChoiceChips
              options={(Object.keys(ANNOUNCEMENT_PRIORITY) as AnnouncementPriority[]).map((k) => ({ value: k, label: ANNOUNCEMENT_PRIORITY[k].label }))}
              value={field.value}
              onChange={field.onChange}
              columns={3}
            />
          </FormField>
        )}
      />
      <Controller
        control={control}
        name="category"
        render={({ field }) => (
          <FormField label={copy.categoryLabel}>
            <ChoiceChips
              options={(Object.keys(ANNOUNCEMENT_CATEGORY) as AnnouncementCategory[]).map((k) => ({ value: k, label: ANNOUNCEMENT_CATEGORY[k] }))}
              value={field.value}
              onChange={field.onChange}
              columns={2}
            />
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
