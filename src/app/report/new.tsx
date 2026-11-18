import React, { useMemo } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { FileText, Send } from 'lucide-react-native';
import { z } from 'zod';
import {
  ActionBar,
  AppHeader,
  AppInput,
  Button,
  ChoiceChips,
  DemoNotice,
  EmptyState,
  FormField,
  FormSelect,
  ScreenContainer,
  TextArea,
} from '@/components';
import { useAppStore, useUser } from '@/store';
import { toast } from '@/store/uiStore';
import { canManageCommittee } from '@/utils/permissions';

const PERIODS = ['الشهر الحالي', 'الشهر الماضي', 'الربع الحالي', 'الربع الماضي'] as const;

const schema = z.object({
  committeeId: z.string().min(1, 'يرجى اختيار اللجنة'),
  title: z.string().trim().min(3, 'يرجى كتابة عنوان التقرير'),
  period: z.string().min(1, 'يرجى اختيار الفترة'),
  summary: z.string().trim().min(10, 'يرجى كتابة ملخص التقرير (١٠ أحرف على الأقل)'),
  achievements: z.string(),
  challenges: z.string(),
});
type FormValues = z.infer<typeof schema>;

export default function NewReportScreen() {
  const params = useLocalSearchParams<{ committeeId?: string }>();
  const router = useRouter();
  const user = useUser();
  const committees = useAppStore((s) => s.committees);
  const createReport = useAppStore((s) => s.createReport);

  const options = useMemo(
    () => committees.filter((c) => canManageCommittee(user, c.id)).map((c) => ({ value: c.id, label: c.name })),
    [committees, user],
  );
  const initialCommittee = params.committeeId && options.some((o) => o.value === params.committeeId) ? params.committeeId : options[0]?.value ?? '';
  const initialName = committees.find((c) => c.id === initialCommittee)?.name ?? 'اللجنة';

  const { control, handleSubmit } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { committeeId: initialCommittee, title: `التقرير الشهري — ${initialName}`, period: PERIODS[0], summary: '', achievements: '', challenges: '' },
  });

  if (options.length === 0) {
    return (
      <ScreenContainer header={<AppHeader title="تقرير جديد" />}>
        <EmptyState icon={FileText} title="غير مصرح" message="إضافة التقارير متاحة لمسؤولي اللجان فقط." />
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
      toast.success('تم تقديم التقرير بنجاح');
      router.replace(`/report/${res.data.id}`);
    },
    () => toast.error('يرجى استكمال البيانات المطلوبة'),
  );

  return (
    <ScreenContainer
      keyboard
      header={<AppHeader title="تقرير جديد" subtitle="يُرسل التقرير للأمين المساعد وأمين القطاع للمراجعة" />}
      footer={
        <ActionBar>
          <Button title="تقديم التقرير" icon={Send} onPress={onSubmit} style={{ flex: 2 }} />
          <Button title="إلغاء" variant="outline" onPress={() => router.back()} style={{ flex: 1 }} />
        </ActionBar>
      }
    >
      <Controller
        control={control}
        name="committeeId"
        render={({ field, fieldState }) => (
          <FormField label="اللجنة" required error={fieldState.error?.message}>
            <FormSelect options={options} value={field.value} onChange={(v) => field.onChange(v ?? '')} title="اختر اللجنة" disabled={options.length === 1} error={!!fieldState.error} />
          </FormField>
        )}
      />
      <Controller
        control={control}
        name="title"
        render={({ field, fieldState }) => (
          <FormField label="عنوان التقرير" required error={fieldState.error?.message}>
            <AppInput value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} placeholder="عنوان التقرير" error={!!fieldState.error} />
          </FormField>
        )}
      />
      <Controller
        control={control}
        name="period"
        render={({ field, fieldState }) => (
          <FormField label="الفترة" required error={fieldState.error?.message}>
            <ChoiceChips options={PERIODS.map((p) => ({ value: p, label: p }))} value={field.value as (typeof PERIODS)[number]} onChange={field.onChange} columns={2} />
          </FormField>
        )}
      />
      <Controller
        control={control}
        name="summary"
        render={({ field, fieldState }) => (
          <FormField label="الملخص التنفيذي" required error={fieldState.error?.message}>
            <TextArea value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} placeholder="ملخص أعمال اللجنة خلال الفترة…" error={!!fieldState.error} />
          </FormField>
        )}
      />
      <Controller
        control={control}
        name="achievements"
        render={({ field }) => (
          <FormField label="أبرز الإنجازات">
            <TextArea value={field.value} onChangeText={field.onChange} placeholder="ما تم إنجازه من مشروعات وأنشطة…" />
          </FormField>
        )}
      />
      <Controller
        control={control}
        name="challenges"
        render={({ field }) => (
          <FormField label="التحديات والمعوقات">
            <TextArea value={field.value} onChangeText={field.onChange} placeholder="التحديات ومقترحات الحل…" />
          </FormField>
        )}
      />
      <DemoNotice text="التقرير تجريبي ويُحفظ في الذاكرة فقط." />
    </ScreenContainer>
  );
}
