import React, { useMemo, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { Send, ShieldAlert } from 'lucide-react-native';
import { z } from 'zod';
import { ActionBar, AppHeader, AppInput, AttachmentPicker, Button, EmptyState, FormField, FormSelect, ScreenContainer, TextArea } from '@/components';
import { useAppStore, useUser } from '@/store';
import { toast } from '@/store/uiStore';
import type { Attachment } from '@/types';
import { canSubmitProposal, isAdmin } from '@/utils/permissions';

const schema = z.object({
  committeeId: z.string().min(1, 'يرجى اختيار اللجنة'),
  title: z.string().trim().min(5, 'يرجى كتابة عنوان المقترح (٥ أحرف على الأقل)').max(120, 'العنوان طويل جداً'),
  description: z.string().trim().min(10, 'يرجى كتابة وصف مختصر (١٠ أحرف على الأقل)').max(600, 'الوصف طويل — اختصره قدر الإمكان'),
  objective: z.string().trim().min(5, 'يرجى توضيح الهدف').max(300, 'الهدف طويل جداً'),
  governorateId: z.string(),
});
type FormValues = z.infer<typeof schema>;

/** Short proposal form: committee, title, description, objective (+ optional governorate & attachment). */
export default function NewProposalScreen() {
  const params = useLocalSearchParams<{ committeeId?: string }>();
  const router = useRouter();
  const user = useUser();
  const committees = useAppStore((s) => s.committees);
  const governorates = useAppStore((s) => s.governorates);
  const createProposal = useAppStore((s) => s.createProposal);
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
      <ScreenContainer header={<AppHeader title="تقديم مقترح" />}>
        <EmptyState
          icon={ShieldAlert}
          title="غير مصرح"
          message={isAdmin(user) ? 'لا توجد لجان مفعّلة.' : 'تقديم المقترحات متاح لمسؤولي اللجان فقط.'}
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
      toast.success('تم تقديم المقترح بنجاح');
      router.replace(`/proposals/${res.data.id}`);
    },
    () => toast.error('يرجى استكمال البيانات المطلوبة'),
  );

  return (
    <ScreenContainer
      keyboard
      header={<AppHeader title="تقديم مقترح" subtitle="يُرسل إلى الأمين للمراجعة" />}
      footer={
        <ActionBar>
          <Button title="تقديم المقترح" icon={Send} onPress={onSubmit} style={{ flex: 2 }} />
          <Button title="إلغاء" variant="outline" onPress={() => router.back()} style={{ flex: 1 }} />
        </ActionBar>
      }
    >
      {committeeOptions.length > 1 ? (
        <Controller
          control={control}
          name="committeeId"
          render={({ field, fieldState }) => (
            <FormField label="اللجنة" required error={fieldState.error?.message}>
              <FormSelect options={committeeOptions} value={field.value} onChange={(v) => field.onChange(v ?? '')} title="اختر اللجنة" placeholder="اختر اللجنة" error={!!fieldState.error} />
            </FormField>
          )}
        />
      ) : null}
      <Controller
        control={control}
        name="title"
        render={({ field, fieldState }) => (
          <FormField label="عنوان المقترح" required error={fieldState.error?.message}>
            <AppInput value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} placeholder="مثال: منصة موحدة لفرص الاستثمار" error={!!fieldState.error} accessibilityLabel="عنوان المقترح" />
          </FormField>
        )}
      />
      <Controller
        control={control}
        name="description"
        render={({ field, fieldState }) => (
          <FormField label="وصف مختصر" required error={fieldState.error?.message}>
            <TextArea value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} placeholder="ما الفكرة باختصار؟" error={!!fieldState.error} accessibilityLabel="وصف مختصر" />
          </FormField>
        )}
      />
      <Controller
        control={control}
        name="objective"
        render={({ field, fieldState }) => (
          <FormField label="الهدف" required error={fieldState.error?.message}>
            <AppInput value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} placeholder="ماذا سيحقق المقترح؟" error={!!fieldState.error} accessibilityLabel="الهدف" />
          </FormField>
        )}
      />
      <Controller
        control={control}
        name="governorateId"
        render={({ field }) => (
          <FormField label="المحافظة (اختياري)" hint="إن كان المقترح خاصاً بمحافظة معينة">
            <FormSelect
              options={governorates.map((g) => ({ value: g.id, label: g.name, description: g.region }))}
              value={field.value || undefined}
              onChange={(v) => field.onChange(v ?? '')}
              title="اختر المحافظة"
              placeholder="بدون محافظة محددة"
              allowClear
            />
          </FormField>
        )}
      />
      <FormField label="مستندات داعمة (اختياري)">
        <AttachmentPicker value={attachments} onChange={setAttachments} />
      </FormField>
    </ScreenContainer>
  );
}
