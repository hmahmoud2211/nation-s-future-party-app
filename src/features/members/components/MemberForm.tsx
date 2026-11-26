import React, { useMemo, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { IdCard, Save, ShieldCheck, UserPlus } from 'lucide-react-native';
import { z } from 'zod';
import { AppInput } from '@/components/forms/AppInput';
import { ChoiceChips } from '@/components/forms/ChoiceChips';
import { FormField } from '@/components/forms/FormField';
import { FormSelect } from '@/components/forms/FormSelect';
import { ActionBar } from '@/components/layout/ActionBar';
import { AppHeader } from '@/components/layout/AppHeader';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Button } from '@/components/common/Button';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { DemoNotice } from '@/features/settings/components/DemoNotice';
import { MEMBERSHIP_STATUS, ROLE_LABELS } from '@/features/members/services/labels';
import { useCommittees } from '@/features/committees/hooks/useCommittees';
import { useToast } from '@/hooks/useOverlays';
import { spacing } from '@/theme';
import type { MembershipStatus, Role } from '@/features/members/types';
import { toWesternDigits } from '@/utils/format';

const ROLES: Role[] = ['member', 'board_member', 'assistant_secretary', 'sector_secretary', 'admin'];
const STATUSES: MembershipStatus[] = ['active', 'inactive', 'suspended'];

const schema = z
  .object({
    name: z.string().trim().min(3, 'يرجى إدخال اسم العضو (3 أحرف على الأقل)').max(60, 'الاسم طويل جداً'),
    title: z.string().max(80, 'المسمى طويل جداً'),
    role: z.enum(['member', 'board_member', 'assistant_secretary', 'sector_secretary', 'admin']),
    committeeIds: z.array(z.string()),
    managedCommitteeIds: z.array(z.string()),
    supervisedCommitteeIds: z.array(z.string()),
    status: z.enum(['active', 'inactive', 'suspended']),
    phone: z
      .string()
      .transform((v) => toWesternDigits(v).replace(/\s|-/g, ''))
      .refine((v) => v === '' || /^01\d{9}$/.test(v), 'رقم الهاتف يجب أن يتكون من 11 رقماً ويبدأ بـ 01'),
    email: z.string().refine((v) => v.trim() === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()), 'صيغة البريد الإلكتروني غير صحيحة'),
  })
  .superRefine((v, ctx) => {
    if (v.role === 'member' && v.committeeIds.length === 0 && v.managedCommitteeIds.length === 0) {
      ctx.addIssue({ code: 'custom', path: ['committeeIds'], message: 'يرجى اختيار لجنة واحدة على الأقل' });
    }
  });

type Input = z.input<typeof schema>;
export type MemberFormValues = z.output<typeof schema>;

export interface MemberFormProps {
  mode: 'create' | 'edit';
  initial: Partial<Input>;
  onSubmit: (values: MemberFormValues) => { ok: true; id: string } | { ok: false; error: string };
}

/** Admin-only demo member create / edit form. */
export function MemberForm({ mode, initial, onSubmit }: MemberFormProps) {
  const router = useRouter();
  const committees = useCommittees();
  const toast = useToast();
  const [submitting, setSubmitting] = useState(false);

  const { control, handleSubmit } = useForm<Input, unknown, MemberFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: initial.name ?? '',
      title: initial.title ?? '',
      role: initial.role ?? 'member',
      committeeIds: initial.committeeIds ?? [],
      managedCommitteeIds: initial.managedCommitteeIds ?? [],
      supervisedCommitteeIds: initial.supervisedCommitteeIds ?? [],
      status: initial.status ?? 'active',
      phone: initial.phone ?? '',
      email: initial.email ?? '',
    },
  });

  const role = useWatch({ control, name: 'role' });
  const committeeOptions = useMemo(() => committees.map((c) => ({ value: c.id, label: c.name, description: c.enabled ? undefined : 'لجنة معطلة' })), [committees]);
  const sectorWide = role === 'admin' || role === 'sector_secretary';

  const submit = handleSubmit(
    (values) => {
      setSubmitting(true);
      const res = onSubmit(values);
      setSubmitting(false);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success(mode === 'create' ? 'تمت إضافة العضو التجريبي بنجاح' : 'تم حفظ بيانات العضو');
      router.replace(`/members/${res.id}`);
    },
    () => toast.error('يرجى استكمال البيانات المطلوبة'),
  );

  return (
    <ScreenContainer
      keyboard
      header={<AppHeader title={mode === 'create' ? 'إضافة عضو تجريبي' : 'تعديل البيانات والدور'} subtitle="بيانات وهمية لأغراض العرض فقط" />}
      footer={
        <ActionBar>
          <Button title={mode === 'create' ? 'إضافة العضو' : 'حفظ التعديلات'} icon={mode === 'create' ? UserPlus : Save} onPress={submit} loading={submitting} style={{ flex: 2 }} />
          <Button title="إلغاء" variant="outline" onPress={() => (router.canGoBack() ? router.back() : router.replace('/members'))} style={{ flex: 1 }} />
        </ActionBar>
      }
    >
      <SectionHeader title="البيانات الأساسية" icon={IdCard} />
      <Controller
        control={control}
        name="name"
        render={({ field, fieldState }) => (
          <FormField label="الاسم" required error={fieldState.error?.message}>
            <AppInput value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} placeholder="الاسم الثنائي أو الثلاثي (اسم وهمي)" error={!!fieldState.error} accessibilityLabel="الاسم" />
          </FormField>
        )}
      />
      <Controller
        control={control}
        name="title"
        render={({ field, fieldState }) => (
          <FormField label="المسمى داخل اللجنة" error={fieldState.error?.message} hint="مثال: عضو لجنة، مقرر اللجنة، أمين سر اللجنة">
            <AppInput value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} placeholder="عضو لجنة" error={!!fieldState.error} accessibilityLabel="المسمى داخل اللجنة" />
          </FormField>
        )}
      />
      <Controller
        control={control}
        name="phone"
        render={({ field, fieldState }) => (
          <FormField label="رقم الهاتف (وهمي)" error={fieldState.error?.message} hint="اتركه فارغاً لإنشاء رقم تجريبي تلقائياً">
            <AppInput value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} placeholder="01xxxxxxxxx" keyboardType="phone-pad" maxLength={14} error={!!fieldState.error} accessibilityLabel="رقم الهاتف" />
          </FormField>
        )}
      />
      <Controller
        control={control}
        name="email"
        render={({ field, fieldState }) => (
          <FormField label="البريد الإلكتروني (وهمي)" error={fieldState.error?.message}>
            <AppInput value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} placeholder="name@demo.example" keyboardType="email-address" autoCapitalize="none" error={!!fieldState.error} accessibilityLabel="البريد الإلكتروني" />
          </FormField>
        )}
      />

      <SectionHeader title="الدور والصلاحيات التجريبية" icon={ShieldCheck} style={{ marginTop: spacing.sm }} />
      <Controller
        control={control}
        name="role"
        render={({ field }) => (
          <FormField label="الدور" required>
            <ChoiceChips options={ROLES.map((r) => ({ value: r, label: ROLE_LABELS[r] }))} value={field.value} onChange={field.onChange} columns={2} />
          </FormField>
        )}
      />
      {!sectorWide ? (
        <Controller
          control={control}
          name="managedCommitteeIds"
          render={({ field }) => (
            <FormField label="مسؤول عن اللجان (اختياري)" hint="صلاحية «مسؤول اللجنة»: تقديم مقترحات اللجنة وإدارة أنشطتها ومشروعاتها">
              <FormSelect multiple options={committeeOptions} value={field.value} onChange={field.onChange} placeholder="بدون مسؤولية لجنة" title="مسؤول عن اللجان" />
            </FormField>
          )}
        />
      ) : null}
      {role === 'assistant_secretary' ? (
        <Controller
          control={control}
          name="supervisedCommitteeIds"
          render={({ field }) => (
            <FormField label="اللجان تحت الإشراف (اختياري)">
              <FormSelect multiple options={committeeOptions} value={field.value} onChange={field.onChange} placeholder="اختر اللجان" title="اللجان تحت الإشراف" />
            </FormField>
          )}
        />
      ) : null}
      <Controller
        control={control}
        name="committeeIds"
        render={({ field, fieldState }) => (
          <FormField
            label={sectorWide ? 'لجان العضوية (اختياري)' : 'لجان العضوية'}
            required={role === 'member'}
            error={fieldState.error?.message}
            hint="اللجان التي هو مسؤول عنها تُضاف تلقائياً"
          >
            <FormSelect multiple options={committeeOptions} value={field.value} onChange={field.onChange} placeholder="اختر اللجان" title="لجان العضوية" error={!!fieldState.error} />
          </FormField>
        )}
      />
      <Controller
        control={control}
        name="status"
        render={({ field }) => (
          <FormField label="حالة العضوية" required>
            <ChoiceChips options={STATUSES.map((s) => ({ value: s, label: MEMBERSHIP_STATUS[s].label }))} value={field.value} onChange={field.onChange} columns={3} />
          </FormField>
        )}
      />
      <DemoNotice text="الصلاحيات هنا محاكاة للواجهة فقط وليست حماية أمنية حقيقية. استخدم بيانات وهمية دائماً." />
    </ScreenContainer>
  );
}

export default MemberForm;
