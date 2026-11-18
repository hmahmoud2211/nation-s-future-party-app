import React, { useMemo, useState } from 'react';
import { View } from 'react-native';
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
  ProjectCard,
  ProposalCard,
  ScreenContainer,
  TextArea,
  type Choice,
} from '@/components';
import { FEEDBACK_TOPIC } from '@/constants/labels';
import { useAppStore, useUser } from '@/store';
import { toast } from '@/store/uiStore';
import { spacing } from '@/theme';
import type { Attachment, FeedbackCategory, FeedbackTopic } from '@/types';
import { canViewProposal, scopeCommitteeIds } from '@/utils/permissions';

const TOPICS: Record<FeedbackCategory, FeedbackTopic[]> = {
  proposal: ['proposal_note', 'review_request', 'other'],
  project: ['project_note', 'data_error', 'other'],
  administrative: ['other', 'data_error'],
};

const schema = z.object({
  topic: z.string().min(1, 'يرجى اختيار نوع الملاحظة'),
  committeeId: z.string().min(1, 'يرجى اختيار اللجنة'),
  subject: z.string().trim().min(3, 'يرجى كتابة موضوع الملاحظة (٣ أحرف على الأقل)'),
  message: z.string().trim().min(5, 'يرجى كتابة نص الملاحظة (٥ أحرف على الأقل)'),
});
type FormValues = z.infer<typeof schema>;

export default function NewFeedbackScreen() {
  const params = useLocalSearchParams<{ category?: string; relatedId?: string; committeeId?: string }>();
  const router = useRouter();
  const user = useUser();
  const proposals = useAppStore((s) => s.proposals);
  const projects = useAppStore((s) => s.projects);
  const committees = useAppStore((s) => s.committees);
  const createFeedback = useAppStore((s) => s.createFeedback);
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  const category: FeedbackCategory = (['proposal', 'project', 'administrative'] as const).includes(params.category as FeedbackCategory)
    ? (params.category as FeedbackCategory)
    : 'administrative';

  // Resolve the related entity (only if the user may see it).
  const related = useMemo(() => {
    if (!params.relatedId) return undefined;
    if (category === 'proposal') {
      const p = proposals.find((x) => x.id === params.relatedId);
      return p && canViewProposal(user, p) ? { kind: 'proposal' as const, item: p, title: p.title, committeeId: p.committeeId } : undefined;
    }
    if (category === 'project') {
      const p = projects.find((x) => x.id === params.relatedId);
      return p ? { kind: 'project' as const, item: p, title: p.title, committeeId: p.committeeId } : undefined;
    }
    return undefined;
  }, [category, params.relatedId, proposals, projects, user]);

  const committeeOptions = useMemo(() => {
    const ids = new Set([...user.committeeIds, ...user.managedCommitteeIds, ...scopeCommitteeIds(user, committees)]);
    return committees.filter((c) => ids.has(c.id) && c.enabled).map((c) => ({ value: c.id, label: c.name }));
  }, [committees, user]);

  const defaultCommittee = related?.committeeId ?? params.committeeId ?? user.committeeIds[0] ?? user.managedCommitteeIds[0] ?? committeeOptions[0]?.value ?? '';

  const defaultSubject = related ? (category === 'proposal' ? `ملاحظة على مقترح: ${related.title}` : `ملاحظة على مشروع: ${related.title}`) : '';

  const topicChoices: Choice<FeedbackTopic>[] = TOPICS[category].map((t) => ({ value: t, label: FEEDBACK_TOPIC[t] }));

  const { control, handleSubmit } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { topic: TOPICS[category][0], committeeId: defaultCommittee, subject: defaultSubject, message: '' },
  });

  const onSubmit = handleSubmit(
    (values) => {
      const res = createFeedback({
        category: related ? category : 'administrative',
        topic: values.topic as FeedbackTopic,
        relatedEntityId: related?.item.id,
        committeeId: values.committeeId,
        subject: values.subject,
        message: values.message,
        attachments,
      });
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success('تم إرسال الملاحظة بنجاح');
      router.replace(`/feedback/${res.data.id}`);
    },
    () => toast.error('يرجى استكمال البيانات المطلوبة'),
  );

  return (
    <ScreenContainer
      keyboard
      header={<AppHeader title="إرسال استفسار أو ملاحظة" subtitle="سيتم توجيه رسالتك إلى مسؤول اللجنة المختص" />}
      footer={
        <ActionBar>
          <Button title="إرسال" icon={Send} onPress={onSubmit} style={{ flex: 2 }} />
          <Button title="إلغاء" variant="outline" onPress={() => router.back()} style={{ flex: 1 }} />
        </ActionBar>
      }
    >
      {related ? (
        <View style={{ marginBottom: spacing.lg }}>
          {related.kind === 'proposal' ? <ProposalCard proposal={related.item} /> : null}
          {related.kind === 'project' ? <ProjectCard project={related.item} /> : null}
        </View>
      ) : null}

      <Controller
        control={control}
        name="topic"
        render={({ field, fieldState }) => (
          <FormField label="نوع الملاحظة" required error={fieldState.error?.message}>
            <ChoiceChips options={topicChoices} value={field.value as FeedbackTopic} onChange={field.onChange} error={!!fieldState.error} />
          </FormField>
        )}
      />

      {!related ? (
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
        name="subject"
        render={({ field, fieldState }) => (
          <FormField label="الموضوع" required error={fieldState.error?.message}>
            <AppInput value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} placeholder="موضوع الملاحظة" error={!!fieldState.error} />
          </FormField>
        )}
      />

      <Controller
        control={control}
        name="message"
        render={({ field, fieldState }) => (
          <FormField label="الرسالة" required error={fieldState.error?.message}>
            <TextArea value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} placeholder="اكتب استفسارك أو ملاحظتك بالتفصيل…" error={!!fieldState.error} />
          </FormField>
        )}
      />

      <FormField label="مرفق (اختياري)">
        <AttachmentPicker value={attachments} onChange={setAttachments} />
      </FormField>

      <DemoNotice text="سيتم حفظ الملاحظة وإشعار المسؤول داخل التطبيق فقط (محاكاة بدون خادم)." />
    </ScreenContainer>
  );
}
