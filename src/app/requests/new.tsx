import React, { useMemo, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { Send } from 'lucide-react-native';
import { z } from 'zod';
import {
  ActionBar,
  AppHeader,
  AppInput,
  AttachmentPicker,
  Button,
  ChoiceChips,
  DemoNotice,
  FormField,
  FormSelect,
  ScreenContainer,
  TextArea,
} from '@/components';
import { REQUEST_TYPE } from '@/constants/labels';
import { useAppStore, useUser } from '@/store';
import { toast } from '@/store/uiStore';
import type { Attachment, RequestType } from '@/types';
import { scopeCommitteeIds } from '@/utils/permissions';

const TYPES = Object.keys(REQUEST_TYPE) as RequestType[];

const schema = z.object({
  type: z.string().min(1, 'يرجى اختيار نوع الطلب'),
  committeeId: z.string().min(1, 'يرجى اختيار اللجنة'),
  subject: z.string().trim().min(3, 'يرجى كتابة عنوان الطلب (٣ أحرف على الأقل)'),
  description: z.string().trim().min(5, 'يرجى كتابة وصف الطلب (٥ أحرف على الأقل)'),
});
type FormValues = z.infer<typeof schema>;

export default function NewRequestScreen() {
  const params = useLocalSearchParams<{ type?: string; subject?: string; committeeId?: string }>();
  const router = useRouter();
  const user = useUser();
  const committees = useAppStore((s) => s.committees);
  const createRequest = useAppStore((s) => s.createRequest);
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
      toast.success('تم إرسال الطلب بنجاح');
      router.replace(`/requests/${res.data.id}`);
    },
    () => toast.error('يرجى استكمال البيانات المطلوبة'),
  );

  return (
    <ScreenContainer
      keyboard
      header={<AppHeader title="طلب إداري جديد" subtitle="سيصل طلبك إلى مسؤول اللجنة وإدارة النظام" />}
      footer={
        <ActionBar>
          <Button title="إرسال الطلب" icon={Send} onPress={onSubmit} style={{ flex: 2 }} />
          <Button title="إلغاء" variant="outline" onPress={() => router.back()} style={{ flex: 1 }} />
        </ActionBar>
      }
    >
      <Controller
        control={control}
        name="type"
        render={({ field, fieldState }) => (
          <FormField label="نوع الطلب" required error={fieldState.error?.message}>
            <ChoiceChips options={TYPES.map((t) => ({ value: t, label: REQUEST_TYPE[t] }))} value={field.value as RequestType} onChange={field.onChange} columns={2} />
          </FormField>
        )}
      />
      <Controller
        control={control}
        name="committeeId"
        render={({ field, fieldState }) => (
          <FormField label="اللجنة" required error={fieldState.error?.message}>
            <FormSelect options={committeeOptions} value={field.value} onChange={(v) => field.onChange(v ?? '')} placeholder="اختر اللجنة" title="اختر اللجنة" error={!!fieldState.error} />
          </FormField>
        )}
      />
      <Controller
        control={control}
        name="subject"
        render={({ field, fieldState }) => (
          <FormField label="عنوان الطلب" required error={fieldState.error?.message}>
            <AppInput value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} placeholder="عنوان مختصر للطلب" error={!!fieldState.error} />
          </FormField>
        )}
      />
      <Controller
        control={control}
        name="description"
        render={({ field, fieldState }) => (
          <FormField label="وصف الطلب" required error={fieldState.error?.message}>
            <TextArea value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} placeholder="اشرح طلبك بالتفصيل…" error={!!fieldState.error} />
          </FormField>
        )}
      />
      <FormField label="مرفق (اختياري)">
        <AttachmentPicker value={attachments} onChange={setAttachments} />
      </FormField>
      <DemoNotice text="الطلبات تجريبية وتُحفظ في الذاكرة فقط خلال الجلسة الحالية." />
    </ScreenContainer>
  );
}
