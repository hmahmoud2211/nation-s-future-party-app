import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form';
import { MapPin, Plus, Save, Trash2, Video } from 'lucide-react-native';
import { z } from 'zod';
import {
  ActionBar,
  AppHeader,
  AppInput,
  AppText,
  Button,
  Card,
  ChoiceChips,
  DateField,
  FormField,
  FormSelect,
  IconButton,
  ScreenContainer,
  TextArea,
} from '@/components';
import { useAppStore, useUser } from '@/store';
import { toast } from '@/store/uiStore';
import { colors, radius, spacing } from '@/theme';
import type { Meeting } from '@/types';
import { canCreateGeneralMeeting, canCreateMeeting, canManageMeeting, meetingCommitteeIds } from '@/utils/permissions';
import { personLabel } from '@/utils/roles';

/** Select value for a general meeting not tied to a committee. */
const GENERAL = 'general';

const schema = z
  .object({
    title: z.string().trim().min(1, 'يرجى إدخال عنوان الاجتماع'),
    committeeId: z.string().min(1, 'يرجى اختيار اللجنة أو «اجتماع عام»'),
    date: z.string().min(1, 'يرجى تحديد موعد الاجتماع'),
    duration: z.enum(['30', '60', '90', '120']),
    mode: z.enum(['in_person', 'online']),
    location: z.string().trim(),
    description: z.string().trim().max(500, 'الوصف طويل جداً'),
    agenda: z.array(z.object({ text: z.string() })),
    attendeeIds: z.array(z.string()).min(1, 'يرجى اختيار مشارك واحد على الأقل'),
  })
  .superRefine((v, ctx) => {
    if (v.mode === 'in_person' && !v.location) ctx.addIssue({ code: 'custom', path: ['location'], message: 'يرجى إدخال مكان الاجتماع' });
  });

type FormValues = z.infer<typeof schema>;

const DURATIONS: { value: FormValues['duration']; label: string }[] = [
  { value: '30', label: '٣٠ دقيقة' },
  { value: '60', label: 'ساعة' },
  { value: '90', label: 'ساعة ونصف' },
  { value: '120', label: 'ساعتان' },
];

const IN_PERSON_DEFAULT = 'مقر الأمانة المركزية — قاعة الاجتماعات';

function committeeMemberIds(members: { id: string; committeeIds: string[]; managedCommitteeIds: string[]; status: string }[], committeeId: string) {
  return members
    .filter((m) => m.status !== 'suspended' && (m.committeeIds.includes(committeeId) || m.managedCommitteeIds.includes(committeeId)))
    .map((m) => m.id);
}

/** Allows a small grace period for meetings scheduled "now". */
function isMoreThanAnHourAgo(iso: string) {
  return new Date(iso).getTime() < Date.now() - 3600000;
}

export function MeetingForm({ mode, meeting, defaultCommitteeId }: { mode: 'new' | 'edit'; meeting?: Meeting; defaultCommitteeId?: string }) {
  const router = useRouter();
  const user = useUser();
  const allCommittees = useAppStore((s) => s.committees);
  const members = useAppStore((s) => s.members);
  const createMeeting = useAppStore((s) => s.createMeeting);
  const editMeeting = useAppStore((s) => s.editMeeting);

  const general = canCreateGeneralMeeting(user);
  const committees = useMemo(() => {
    const ids = meetingCommitteeIds(user, allCommittees);
    return allCommittees.filter((c) => ids.includes(c.id));
  }, [user, allCommittees]);
  const committeeOptions = useMemo(
    () => [...(general ? [{ value: GENERAL, label: 'اجتماع عام (بدون لجنة)' }] : []), ...committees.map((c) => ({ value: c.id, label: c.name }))],
    [general, committees],
  );
  const allowed = mode === 'edit' ? !!meeting && canManageMeeting(user, meeting) : canCreateMeeting(user) && committeeOptions.length > 0;

  const initialCommittee = meeting
    ? meeting.committeeId ?? GENERAL
    : defaultCommitteeId && committees.some((c) => c.id === defaultCommitteeId)
      ? defaultCommitteeId
      : committeeOptions[0]?.value ?? '';

  const { control, handleSubmit, setValue, getValues, formState } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: meeting?.title ?? '',
      committeeId: initialCommittee,
      date: meeting?.date ?? '',
      duration: (String(meeting?.durationMin ?? 60) as FormValues['duration']) ?? '60',
      mode: meeting?.mode ?? 'online',
      location: meeting ? (meeting.mode === 'online' ? '' : meeting.location) : '',
      description: meeting?.description ?? '',
      agenda: meeting ? meeting.agenda.map((text) => ({ text })) : [{ text: '' }],
      attendeeIds: meeting?.attendeeIds ?? (initialCommittee && initialCommittee !== GENERAL ? committeeMemberIds(members, initialCommittee) : []),
    },
  });
  const { fields, append, remove } = useFieldArray({ control, name: 'agenda' });
  const committeeId = useWatch({ control, name: 'committeeId' });
  const meetingMode = useWatch({ control, name: 'mode' });

  // Anyone can be invited; the committee's people are listed first.
  const attendeeOptions = useMemo(() => {
    const inCommittee = (m: (typeof members)[number]) => committeeId !== GENERAL && (m.committeeIds.includes(committeeId) || m.managedCommitteeIds.includes(committeeId));
    return members
      .filter((m) => m.status !== 'suspended' && m.id !== user.id)
      .sort((a, b) => Number(inCommittee(b)) - Number(inCommittee(a)))
      .map((m) => ({ value: m.id, label: m.name, description: inCommittee(m) ? `من أعضاء اللجنة • ${personLabel(m)}` : personLabel(m), avatarColor: m.avatarColor }));
  }, [members, committeeId, user.id]);
  const bureauIds = useMemo(
    () => members.filter((m) => m.id !== user.id && m.status === 'active' && ['sector_secretary', 'assistant_secretary', 'board_member'].includes(m.role)).map((m) => m.id),
    [members, user.id],
  );

  const onValid = (v: FormValues) => {
    const input = {
      title: v.title,
      committeeId: v.committeeId === GENERAL ? null : v.committeeId,
      date: v.date,
      durationMin: Number(v.duration),
      location: v.location,
      mode: v.mode,
      description: v.description,
      agenda: v.agenda.map((a) => a.text.trim()).filter(Boolean),
      attendeeIds: v.attendeeIds,
    };
    if (mode === 'new') {
      if (isMoreThanAnHourAgo(v.date)) {
        toast.error('موعد الاجتماع يجب أن يكون في المستقبل');
        return;
      }
      const res = createMeeting(input);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success('تم إنشاء الاجتماع وإرسال الدعوات بنجاح');
      router.replace(`/meetings/${res.data.id}`);
      return;
    }
    if (!meeting) return;
    const res = editMeeting(meeting.id, input);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    toast.success('تم تحديث بيانات الاجتماع بنجاح');
    router.back();
  };

  const onSubmit = handleSubmit(onValid, () => toast.error('يرجى استكمال البيانات المطلوبة'));

  if (!allowed) {
    return (
      <ScreenContainer header={<AppHeader title={mode === 'new' ? 'اجتماع جديد' : 'تعديل الاجتماع'} />}>
        <Card>
          <AppText variant="body" color={colors.textSecondary}>
            {mode === 'new' ? 'إنشاء الاجتماعات متاح للقيادة وأعضاء الهيئة ومسؤولي اللجان.' : 'تعديل الاجتماع متاح لمنظمه فقط.'}
          </AppText>
        </Card>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer
      keyboard
      header={<AppHeader title={mode === 'new' ? 'اجتماع جديد' : 'تعديل الاجتماع'} subtitle={mode === 'edit' ? meeting?.title : undefined} />}
      footer={
        <ActionBar>
          <Button title={mode === 'new' ? 'إنشاء الاجتماع' : 'حفظ التعديلات'} icon={Save} onPress={onSubmit} loading={formState.isSubmitting} style={{ flex: 2 }} />
          <Button title="إلغاء" variant="outline" onPress={() => router.back()} style={{ flex: 1 }} />
        </ActionBar>
      }
    >
      <Controller
        control={control}
        name="title"
        render={({ field, fieldState }) => (
          <FormField label="عنوان الاجتماع" required error={fieldState.error?.message}>
            <AppInput value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} placeholder="مثال: الاجتماع الشهري للجنة" error={!!fieldState.error} />
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
              options={committeeOptions}
              value={field.value}
              disabled={mode === 'edit' || committeeOptions.length === 1}
              onChange={(v) => {
                const next = v ?? '';
                field.onChange(next);
                if (next && next !== GENERAL) setValue('attendeeIds', committeeMemberIds(members, next).filter((id) => id !== user.id));
              }}
              error={!!fieldState.error}
            />
          </FormField>
        )}
      />
      <Controller
        control={control}
        name="date"
        render={({ field, fieldState }) => (
          <FormField label="التاريخ والوقت" required error={fieldState.error?.message}>
            <DateField
              withTime
              value={field.value || undefined}
              onChange={(v) => field.onChange(v ?? '')}
              minDate={mode === 'new' ? new Date() : undefined}
              title="موعد الاجتماع"
              placeholder="اختر التاريخ والوقت"
              error={!!fieldState.error}
            />
          </FormField>
        )}
      />
      <Controller
        control={control}
        name="duration"
        render={({ field }) => (
          <FormField label="مدة الاجتماع">
            <ChoiceChips options={DURATIONS} value={field.value} onChange={field.onChange} />
          </FormField>
        )}
      />
      <Controller
        control={control}
        name="mode"
        render={({ field }) => (
          <FormField label="نوع الاجتماع">
            <ChoiceChips
              options={[
                { value: 'online', label: 'مرئي (اتصال فيديو)', icon: Video },
                { value: 'in_person', label: 'حضوري', icon: MapPin },
              ]}
              value={field.value}
              onChange={(v) => {
                field.onChange(v);
                if (v === 'in_person' && !getValues('location')) setValue('location', IN_PERSON_DEFAULT);
              }}
              columns={2}
            />
          </FormField>
        )}
      />
      {meetingMode === 'in_person' ? (
        <Controller
          control={control}
          name="location"
          render={({ field, fieldState }) => (
            <FormField label="المكان" required error={fieldState.error?.message}>
              <AppInput value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} icon={MapPin} placeholder="مكان الاجتماع" error={!!fieldState.error} />
            </FormField>
          )}
        />
      ) : (
        <AppText variant="caption" color={colors.textSecondary} style={{ marginTop: -spacing.sm, marginBottom: spacing.md }}>
          يبدأ المنظم الاجتماع المرئي من داخل التطبيق، وينضم المشاركون من صفحة الاجتماع.
        </AppText>
      )}
      <Controller
        control={control}
        name="description"
        render={({ field, fieldState }) => (
          <FormField label="الوصف (اختياري)" error={fieldState.error?.message}>
            <TextArea value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} placeholder="هدف الاجتماع باختصار" error={!!fieldState.error} accessibilityLabel="وصف الاجتماع" />
          </FormField>
        )}
      />

      <FormField label="جدول الأعمال">
        <View style={{ gap: spacing.sm }}>
          {fields.map((f, index) => (
            <View key={f.id} style={styles.agendaRow}>
              <View style={styles.num}>
                <AppText variant="meta" color={colors.white}>
                  {index + 1}
                </AppText>
              </View>
              <View style={{ flex: 1 }}>
                <Controller
                  control={control}
                  name={`agenda.${index}.text`}
                  render={({ field }) => <AppInput value={field.value} onChangeText={field.onChange} placeholder={`البند ${index + 1}`} />}
                />
              </View>
              <IconButton icon={Trash2} size={36} variant="plain" accessibilityLabel="حذف البند" onPress={() => remove(index)} disabled={fields.length === 1} />
            </View>
          ))}
          <Button title="إضافة بند" icon={Plus} variant="secondary" size="sm" onPress={() => append({ text: '' })} />
        </View>
      </FormField>

      <Controller
        control={control}
        name="attendeeIds"
        render={({ field, fieldState }) => (
          <FormField label="المشاركون" required error={fieldState.error?.message} hint={`تم اختيار ${field.value.length} — ستُضاف أنت تلقائياً كمنظم`}>
            <FormSelect multiple searchable title="اختر المشاركين" placeholder="اختر المشاركين" options={attendeeOptions} value={field.value} onChange={field.onChange} error={!!fieldState.error} />
            {general ? (
              <Button title="إضافة أعضاء هيئة المكتب" variant="ghost" size="sm" onPress={() => setValue('attendeeIds', Array.from(new Set([...field.value, ...bureauIds])), { shouldValidate: true })} style={{ marginTop: spacing.xs }} />
            ) : null}
          </FormField>
        )}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  agendaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  num: { width: 26, height: 26, borderRadius: radius.pill, backgroundColor: colors.navy2, alignItems: 'center', justifyContent: 'center' },
});

export default MeetingForm;
