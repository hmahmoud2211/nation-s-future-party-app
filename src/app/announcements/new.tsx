import React, { useMemo, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { Megaphone } from 'lucide-react-native';
import { z } from 'zod';
import {
  ActionBar,
  AppHeader,
  AppInput,
  AttachmentPicker,
  Button,
  ChoiceChips,
  DemoNotice,
  EmptyState,
  FormField,
  FormSelect,
  ScreenContainer,
  TextArea,
} from '@/components';
import { ANNOUNCEMENT_CATEGORY, ANNOUNCEMENT_PRIORITY } from '@/constants/labels';
import { useAppStore, useUser } from '@/store';
import { canPublishAnyAnnouncement, isSectorWide } from '@/utils/permissions';
import { toast } from '@/store/uiStore';
import type { AnnouncementCategory, AnnouncementPriority, Attachment } from '@/types';

const SECTOR = '__sector__';

const schema = z.object({
  title: z.string().trim().min(3, 'يرجى كتابة عنوان الإعلان (٣ أحرف على الأقل)'),
  body: z.string().trim().min(10, 'يرجى كتابة نص الإعلان (١٠ أحرف على الأقل)'),
  committeeId: z.string().min(1, 'يرجى اختيار الجهة المستهدفة'),
  priority: z.enum(['normal', 'important', 'urgent']),
  category: z.enum(['general', 'meeting', 'event', 'administrative']),
});
type FormValues = z.infer<typeof schema>;

export default function NewAnnouncementScreen() {
  const params = useLocalSearchParams<{ committeeId?: string }>();
  const router = useRouter();
  const user = useUser();
  const committees = useAppStore((s) => s.committees);
  const createAnnouncement = useAppStore((s) => s.createAnnouncement);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const sectorWide = isSectorWide(user);

  const options = useMemo(() => {
    const list = committees
      .filter((c) => c.enabled && (sectorWide || user.managedCommitteeIds.includes(c.id)))
      .map((c) => ({ value: c.id, label: c.name }));
    return sectorWide ? [{ value: SECTOR, label: 'إعلان عام للقطاع', description: 'يصل لجميع أعضاء القطاع' }, ...list] : list;
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
      <ScreenContainer header={<AppHeader title="إعلان جديد" />}>
        <EmptyState icon={Megaphone} title="غير مصرح" message="نشر الإعلانات متاح لمسؤولي اللجان وقيادة القطاع فقط." />
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
      toast.success('تم نشر الإعلان وإشعار الأعضاء');
      router.replace(`/announcements/${res.data.id}`);
    },
    () => toast.error('يرجى استكمال البيانات المطلوبة'),
  );

  return (
    <ScreenContainer
      keyboard
      header={<AppHeader title="إعلان جديد" subtitle="سيتم إرسال إشعار داخل التطبيق لجميع المستهدفين" />}
      footer={
        <ActionBar>
          <Button title="نشر الإعلان" icon={Megaphone} onPress={onSubmit} style={{ flex: 2 }} />
          <Button title="إلغاء" variant="outline" onPress={() => router.back()} style={{ flex: 1 }} />
        </ActionBar>
      }
    >
      <Controller
        control={control}
        name="title"
        render={({ field, fieldState }) => (
          <FormField label="عنوان الإعلان" required error={fieldState.error?.message}>
            <AppInput value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} placeholder="مثال: موعد الاجتماع الشهري" error={!!fieldState.error} />
          </FormField>
        )}
      />
      <Controller
        control={control}
        name="body"
        render={({ field, fieldState }) => (
          <FormField label="نص الإعلان" required error={fieldState.error?.message}>
            <TextArea value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} placeholder="اكتب تفاصيل الإعلان…" error={!!fieldState.error} />
          </FormField>
        )}
      />
      <Controller
        control={control}
        name="committeeId"
        render={({ field, fieldState }) => (
          <FormField label="الجهة المستهدفة" required error={fieldState.error?.message}>
            <FormSelect options={options} value={field.value} onChange={(v) => field.onChange(v ?? '')} placeholder="اختر اللجنة" title="الجهة المستهدفة" error={!!fieldState.error} />
          </FormField>
        )}
      />
      <Controller
        control={control}
        name="priority"
        render={({ field }) => (
          <FormField label="الأولوية">
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
          <FormField label="التصنيف">
            <ChoiceChips
              options={(Object.keys(ANNOUNCEMENT_CATEGORY) as AnnouncementCategory[]).map((k) => ({ value: k, label: ANNOUNCEMENT_CATEGORY[k] }))}
              value={field.value}
              onChange={field.onChange}
              columns={2}
            />
          </FormField>
        )}
      />
      <FormField label="مرفق (اختياري)">
        <AttachmentPicker value={attachments} onChange={setAttachments} />
      </FormField>
      <DemoNotice text="الإشعارات داخلية في التطبيق فقط — لا توجد إشعارات فورية حقيقية." />
    </ScreenContainer>
  );
}
