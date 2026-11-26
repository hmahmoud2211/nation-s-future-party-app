import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form';
import { CirclePause, CircleCheck, CalendarClock, Play, Plus, Save, Trash2, X } from 'lucide-react-native';
import { z } from 'zod';
import { AppInput, TextArea } from '@/components/forms/AppInput';
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
import { IconButton } from '@/components/common/IconButton';
import { DemoNotice } from '@/features/settings/components/DemoNotice';
import { useManageableCommittees } from '@/features/committees/hooks/useCommitteeScope';
import { useMembers } from '@/features/members/hooks/useMembers';
import { useProjectActions } from '@/features/projects/hooks/useProjects';
import { useToast } from '@/hooks/useOverlays';
import { borderRadius, colors, spacing } from '@/theme';
import type { Project, ProjectStatus } from '@/features/projects/types';

/** Compare calendar days only (pickers may carry different times of day). */
const dayStart = (iso: string) => new Date(iso).setHours(0, 0, 0, 0);

const schema = z
  .object({
    title: z.string().trim().min(1, 'يرجى إدخال اسم المشروع').min(4, 'اسم المشروع قصير جداً'),
    description: z.string(),
    committeeId: z.string().min(1, 'يرجى اختيار اللجنة'),
    leadId: z.string().min(1, 'يرجى اختيار مسؤول المشروع'),
    teamIds: z.array(z.string()),
    startDate: z.string().min(1, 'يرجى تحديد تاريخ البدء'),
    endDate: z.string().min(1, 'يرجى تحديد تاريخ الانتهاء'),
    status: z.enum(['planned', 'in_progress', 'paused', 'completed']),
    milestones: z.array(z.object({ title: z.string(), dueDate: z.string() })),
  })
  .refine((v) => !v.startDate || !v.endDate || dayStart(v.endDate) >= dayStart(v.startDate), {
    path: ['endDate'],
    message: 'تاريخ الانتهاء يجب ألا يسبق تاريخ البدء',
  });

type FormValues = z.infer<typeof schema>;

const STATUS_CHOICES: { value: ProjectStatus; label: string; icon: typeof Play }[] = [
  { value: 'planned', label: 'مخطط له', icon: CalendarClock },
  { value: 'in_progress', label: 'قيد التنفيذ', icon: Play },
  { value: 'paused', label: 'متوقف مؤقتاً', icon: CirclePause },
  { value: 'completed', label: 'مكتمل', icon: CircleCheck },
];

export interface ProjectFormProps {
  mode: 'new' | 'edit';
  project?: Project;
  defaultCommitteeId?: string;
}

/** Shared create / edit form for projects (React Hook Form + Zod). */
export function ProjectForm({ mode, project, defaultCommitteeId }: ProjectFormProps) {
  const router = useRouter();
  const committees = useManageableCommittees();
  const members = useMembers();
  const { createProject, updateProject } = useProjectActions();
  const toast = useToast();

  const initialCommittee =
    project?.committeeId ?? (defaultCommitteeId && committees.some((c) => c.id === defaultCommitteeId) ? defaultCommitteeId : committees[0]?.id) ?? '';

  const { control, handleSubmit, setValue, formState } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: project?.title ?? '',
      description: project?.description ?? '',
      committeeId: initialCommittee,
      leadId: project?.leadId ?? '',
      teamIds: project?.teamIds ?? [],
      startDate: project?.startDate ?? new Date().toISOString(),
      endDate: project?.endDate ?? '',
      status: project?.status ?? 'planned',
      milestones: mode === 'new' ? [{ title: '', dueDate: '' }] : [],
    },
  });
  const { fields, append, remove } = useFieldArray({ control, name: 'milestones' });
  const committeeId = useWatch({ control, name: 'committeeId' });
  const leadId = useWatch({ control, name: 'leadId' });

  const memberOptions = useMemo(
    () =>
      members
        .filter((m) => m.committeeIds.includes(committeeId) && m.status !== 'suspended')
        .map((m) => ({ value: m.id, label: m.name, description: m.title, avatarColor: m.avatarColor })),
    [members, committeeId],
  );

  const onValid = (v: FormValues) => {
    const base = {
      title: v.title,
      description: v.description,
      committeeId: v.committeeId,
      leadId: v.leadId,
      teamIds: v.teamIds.filter((t) => t !== v.leadId),
      startDate: v.startDate,
      endDate: v.endDate,
      status: v.status,
    };
    if (mode === 'new') {
      const milestones = v.milestones.filter((m) => m.title.trim()).map((m) => ({ title: m.title.trim(), dueDate: m.dueDate || v.endDate }));
      const res = createProject({ ...base, milestones });
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success('تم إنشاء المشروع بنجاح');
      router.replace(`/projects/${res.data.id}`);
      return;
    }
    if (!project) return;
    const res = updateProject(project.id, base);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    toast.success('تم حفظ تعديلات المشروع بنجاح');
    router.back();
  };

  const onSubmit = handleSubmit(onValid, () => toast.error('يرجى استكمال البيانات المطلوبة'));

  if (committees.length === 0) {
    return (
      <ScreenContainer header={<AppHeader title={mode === 'new' ? 'مشروع جديد' : 'تعديل المشروع'} />}>
        <Card>
          <AppText variant="body" color={colors.textSecondary}>
            إنشاء المشروعات وتعديلها متاح لمسؤولي اللجان ومدير النظام فقط.
          </AppText>
        </Card>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer
      keyboard
      header={<AppHeader title={mode === 'new' ? 'إضافة مشروع جديد' : 'تعديل المشروع'} subtitle={mode === 'edit' ? project?.title : 'أدخل بيانات المشروع والمراحل الرئيسية'} />}
      footer={
        <ActionBar>
          <Button title={mode === 'new' ? 'إنشاء المشروع' : 'حفظ التعديلات'} icon={Save} onPress={onSubmit} loading={formState.isSubmitting} style={{ flex: 2 }} />
          <Button title="إلغاء" variant="outline" onPress={() => router.back()} style={{ flex: 1 }} />
        </ActionBar>
      }
    >
      <Controller
        control={control}
        name="title"
        render={({ field, fieldState }) => (
          <FormField label="اسم المشروع" required error={fieldState.error?.message}>
            <AppInput value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} placeholder="مثال: منصة الخدمات الرقمية للأعضاء" error={!!fieldState.error} />
          </FormField>
        )}
      />
      <Controller
        control={control}
        name="description"
        render={({ field }) => (
          <FormField label="وصف المشروع">
            <TextArea value={field.value} onChangeText={field.onChange} placeholder="أهداف المشروع ونطاق العمل والنتائج المتوقعة…" />
          </FormField>
        )}
      />
      <Controller
        control={control}
        name="committeeId"
        render={({ field, fieldState }) => (
          <FormField label="اللجنة" required error={fieldState.error?.message} hint={mode === 'edit' ? 'لا يمكن نقل المشروع إلى لجنة أخرى' : undefined}>
            <FormSelect
              title="اختر اللجنة"
              options={committees.map((c) => ({ value: c.id, label: c.name }))}
              value={field.value}
              disabled={mode === 'edit' || committees.length === 1}
              onChange={(v) => {
                field.onChange(v ?? '');
                setValue('leadId', '');
                setValue('teamIds', []);
              }}
              error={!!fieldState.error}
            />
          </FormField>
        )}
      />
      <Controller
        control={control}
        name="leadId"
        render={({ field, fieldState }) => (
          <FormField label="مسؤول المشروع" required error={fieldState.error?.message}>
            <FormSelect
              title="اختر مسؤول المشروع"
              placeholder="اختر من أعضاء اللجنة"
              options={memberOptions}
              value={field.value || undefined}
              onChange={(v) => field.onChange(v ?? '')}
              error={!!fieldState.error}
              emptyText="لا يوجد أعضاء في اللجنة المختارة"
            />
          </FormField>
        )}
      />
      <Controller
        control={control}
        name="teamIds"
        render={({ field }) => (
          <FormField label="فريق العمل" hint="يمكن اختيار أكثر من عضو">
            <FormSelect
              multiple
              title="اختر فريق العمل"
              placeholder="أعضاء الفريق (اختياري)"
              options={memberOptions.filter((o) => o.value !== leadId)}
              value={field.value}
              onChange={field.onChange}
            />
          </FormField>
        )}
      />
      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Controller
            control={control}
            name="startDate"
            render={({ field, fieldState }) => (
              <FormField label="تاريخ البدء" required error={fieldState.error?.message}>
                <DateField value={field.value || undefined} onChange={(v) => field.onChange(v ?? '')} title="تاريخ البدء" error={!!fieldState.error} />
              </FormField>
            )}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Controller
            control={control}
            name="endDate"
            render={({ field, fieldState }) => (
              <FormField label="تاريخ الانتهاء" required error={fieldState.error?.message}>
                <DateField value={field.value || undefined} onChange={(v) => field.onChange(v ?? '')} title="تاريخ الانتهاء" placeholder="اختر التاريخ" error={!!fieldState.error} />
              </FormField>
            )}
          />
        </View>
      </View>
      <Controller
        control={control}
        name="status"
        render={({ field }) => (
          <FormField label="حالة المشروع" required>
            <ChoiceChips options={STATUS_CHOICES} value={field.value} onChange={field.onChange} columns={2} />
          </FormField>
        )}
      />

      {mode === 'new' ? (
        <FormField label="المراحل الرئيسية" hint="يمكنك إضافة مراحل أخرى لاحقاً من صفحة المشروع">
          <View style={{ gap: spacing.sm }}>
            {fields.map((f, index) => (
              <View key={f.id} style={styles.milestone}>
                <View style={styles.msHead}>
                  <View style={styles.msNum}>
                    <AppText variant="meta" color={colors.white}>
                      {index + 1}
                    </AppText>
                  </View>
                  <AppText variant="captionMedium" style={{ flex: 1 }}>
                    {`المرحلة ${index + 1}`}
                  </AppText>
                  <IconButton icon={fields.length > 1 ? Trash2 : X} size={32} variant="plain" accessibilityLabel="حذف المرحلة" onPress={() => remove(index)} />
                </View>
                <Controller
                  control={control}
                  name={`milestones.${index}.title`}
                  render={({ field }) => <AppInput value={field.value} onChangeText={field.onChange} placeholder="اسم المرحلة" />}
                />
                <Controller
                  control={control}
                  name={`milestones.${index}.dueDate`}
                  render={({ field }) => (
                    <DateField value={field.value || undefined} onChange={(v) => field.onChange(v ?? '')} title="موعد المرحلة" placeholder="موعد المرحلة (اختياري)" />
                  )}
                />
              </View>
            ))}
            <Button title="إضافة مرحلة" icon={Plus} variant="secondary" size="sm" onPress={() => append({ title: '', dueDate: '' })} />
          </View>
        </FormField>
      ) : null}

      <DemoNotice />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.sm },
  milestone: { gap: spacing.sm, backgroundColor: colors.frostStrong, borderRadius: borderRadius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.md },
  msHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  msNum: { width: 24, height: 24, borderRadius: 12, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
});

export default ProjectForm;
