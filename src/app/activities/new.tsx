import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { MapPin, Save, Users } from 'lucide-react-native';
import { z } from 'zod';
import {
  ActionBar,
  AppHeader,
  AppInput,
  AppText,
  AttachmentPicker,
  Button,
  Card,
  ChoiceChips,
  DateField,
  DemoNotice,
  FormField,
  FormSelect,
  ScreenContainer,
  TextArea,
} from '@/components';
import { ACTIVITY_TYPE } from '@/constants/labels';
import { useManageableCommittees } from '@/features/committees/shared';
import { useAppStore } from '@/store';
import { toast } from '@/store/uiStore';
import { colors } from '@/theme';
import type { ActivityType, Attachment } from '@/types';
import { toWesternDigits } from '@/utils/format';

const schema = z.object({
  title: z.string().trim().min(1, 'يرجى إدخال اسم النشاط').min(4, 'اسم النشاط قصير جداً'),
  type: z.enum(['workshop', 'forum', 'visit', 'initiative', 'seminar', 'training'], { message: 'يرجى اختيار نوع النشاط' }),
  committeeId: z.string().min(1, 'يرجى اختيار اللجنة'),
  date: z.string().min(1, 'يرجى تحديد موعد النشاط'),
  location: z.string().trim().min(1, 'يرجى إدخال مكان النشاط'),
  capacity: z
    .string()
    .refine((v) => !v.trim() || /^\d+$/.test(toWesternDigits(v.trim())), 'يرجى إدخال رقم صحيح')
    .refine((v) => !v.trim() || Number(toWesternDigits(v.trim())) > 0, 'العدد يجب أن يكون أكبر من صفر'),
  description: z.string(),
});

type FormValues = z.infer<typeof schema>;

export default function NewActivityScreen() {
  const { committeeId: paramCommittee } = useLocalSearchParams<{ committeeId?: string }>();
  const router = useRouter();
  const committees = useManageableCommittees();
  const createActivity = useAppStore((s) => s.createActivity);
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
      toast.success('تم إنشاء النشاط ونشره لأعضاء اللجنة بنجاح');
      router.replace(`/activities/${res.data.id}`);
    },
    () => toast.error('يرجى استكمال البيانات المطلوبة'),
  );

  if (committees.length === 0) {
    return (
      <ScreenContainer header={<AppHeader title="نشاط جديد" />}>
        <Card>
          <AppText variant="body" color={colors.textSecondary}>
            إنشاء الأنشطة متاح لمسؤولي اللجان ومدير النظام فقط.
          </AppText>
        </Card>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer
      keyboard
      header={<AppHeader title="إنشاء نشاط جديد" subtitle="ورشة، ندوة، زيارة ميدانية أو مبادرة" />}
      footer={
        <ActionBar>
          <Button title="إنشاء النشاط" icon={Save} onPress={onSubmit} loading={formState.isSubmitting} style={{ flex: 2 }} />
          <Button title="إلغاء" variant="outline" onPress={() => router.back()} style={{ flex: 1 }} />
        </ActionBar>
      }
    >
      <Controller
        control={control}
        name="title"
        render={({ field, fieldState }) => (
          <FormField label="اسم النشاط" required error={fieldState.error?.message}>
            <AppInput value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} placeholder="مثال: ورشة التسويق الرقمي" error={!!fieldState.error} />
          </FormField>
        )}
      />
      <Controller
        control={control}
        name="type"
        render={({ field, fieldState }) => (
          <FormField label="نوع النشاط" required error={fieldState.error?.message}>
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
          <FormField label="اللجنة" required error={fieldState.error?.message}>
            <FormSelect
              title="اختر اللجنة"
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
          <FormField label="الموعد" required error={fieldState.error?.message}>
            <DateField withTime value={field.value || undefined} onChange={(v) => field.onChange(v ?? '')} title="موعد النشاط" placeholder="اختر التاريخ والوقت" error={!!fieldState.error} />
          </FormField>
        )}
      />
      <Controller
        control={control}
        name="location"
        render={({ field, fieldState }) => (
          <FormField label="المكان" required error={fieldState.error?.message}>
            <AppInput value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} icon={MapPin} placeholder="مقر الأمانة المركزية — القاعة الكبرى" error={!!fieldState.error} />
          </FormField>
        )}
      />
      <Controller
        control={control}
        name="capacity"
        render={({ field, fieldState }) => (
          <FormField label="العدد المتاح للتسجيل" error={fieldState.error?.message} hint="اتركه فارغاً إذا كان العدد مفتوحاً">
            <AppInput value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} icon={Users} placeholder="مثال: 60" keyboardType="number-pad" suffix="مشارك" error={!!fieldState.error} />
          </FormField>
        )}
      />
      <Controller
        control={control}
        name="description"
        render={({ field }) => (
          <FormField label="وصف النشاط">
            <TextArea value={field.value} onChangeText={field.onChange} placeholder="أهداف النشاط والفئة المستهدفة والبرنامج…" />
          </FormField>
        )}
      />
      <FormField label="صور توضيحية" hint="اختياري — الصور تبقى على جهازك ولا تُرفع لأي خادم">
        <AttachmentPicker value={images} onChange={setImages} label="إرفاق صورة" />
      </FormField>
      <DemoNotice />
    </ScreenContainer>
  );
}
