import React, { useMemo, useState } from 'react';
import { View } from 'react-native';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { Send } from 'lucide-react-native';
import { z } from 'zod';
import { Button } from '@/components/common/Button';
import { AppInput, TextArea } from '@/components/forms/AppInput';
import { AttachmentPicker } from '@/components/forms/AttachmentPicker';
import { type Choice, ChoiceChips } from '@/components/forms/ChoiceChips';
import { FormField } from '@/components/forms/FormField';
import { FormSelect } from '@/components/forms/FormSelect';
import { ActionBar } from '@/components/layout/ActionBar';
import { AppHeader } from '@/components/layout/AppHeader';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { useUser } from '@/features/auth/hooks/useSession';
import { canViewProposal, scopeCommitteeIds } from '@/features/auth/services/permissions';
import { useCommittees } from '@/features/committees/hooks/useCommittees';
import { useFeedbackActions } from '@/features/feedback/hooks/useFeedback';
import { FEEDBACK_TOPIC } from '@/features/feedback/services/labels';
import type { FeedbackCategory, FeedbackTopic } from '@/features/feedback/types';
import { ProjectCard } from '@/features/projects/components/ProjectCard';
import { useProjects } from '@/features/projects/hooks/useProjects';
import { ProposalCard } from '@/features/proposals/components/ProposalCard';
import { useProposals } from '@/features/proposals/hooks/useProposals';
import { DemoNotice } from '@/features/settings/components/DemoNotice';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useToast } from '@/hooks/useOverlays';
import type { Attachment } from '@/types/common.types';
import { newFeedbackCopy as copy, feedbackTopicsByCategory as TOPICS } from './NewFeedbackScreen.data';
import { createStyles } from './NewFeedbackScreen.styles';

const schema = z.object({
  topic: z.string().min(1, copy.topicRequired),
  committeeId: z.string().min(1, copy.committeeRequired),
  subject: z.string().trim().min(3, copy.subjectMin),
  message: z.string().trim().min(5, copy.messageMin),
});
type FormValues = z.infer<typeof schema>;

export function NewFeedbackScreen() {
  const params = useLocalSearchParams<{ category?: string; relatedId?: string; committeeId?: string }>();
  const router = useRouter();
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const toast = useToast();
  const user = useUser();
  const proposals = useProposals();
  const projects = useProjects();
  const committees = useCommittees();
  const { createFeedback } = useFeedbackActions();
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

  const defaultSubject = related ? (category === 'proposal' ? copy.proposalSubject(related.title) : copy.projectSubject(related.title)) : '';

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
      toast.success(copy.sentToast);
      router.replace(`/feedback/${res.data.id}`);
    },
    () => toast.error(copy.incompleteToast),
  );

  return (
    <ScreenContainer
      keyboard
      header={<AppHeader title={copy.title} subtitle={copy.subtitle} />}
      footer={
        <ActionBar>
          <Button title={copy.send} icon={Send} onPress={onSubmit} style={styles.submitButton} />
          <Button title={copy.cancel} variant="outline" onPress={() => router.back()} style={styles.cancelButton} />
        </ActionBar>
      }
    >
      {related ? (
        <View style={styles.related}>
          {related.kind === 'proposal' ? <ProposalCard proposal={related.item} /> : null}
          {related.kind === 'project' ? <ProjectCard project={related.item} /> : null}
        </View>
      ) : null}

      <Controller
        control={control}
        name="topic"
        render={({ field, fieldState }) => (
          <FormField label={copy.topicLabel} required error={fieldState.error?.message}>
            <ChoiceChips options={topicChoices} value={field.value as FeedbackTopic} onChange={field.onChange} error={!!fieldState.error} />
          </FormField>
        )}
      />

      {!related ? (
        <Controller
          control={control}
          name="committeeId"
          render={({ field, fieldState }) => (
            <FormField label={copy.committeeLabel} required error={fieldState.error?.message}>
              <FormSelect
                options={committeeOptions}
                value={field.value}
                onChange={(v) => field.onChange(v ?? '')}
                title={copy.committeeSheetTitle}
                placeholder={copy.committeePlaceholder}
                error={!!fieldState.error}
              />
            </FormField>
          )}
        />
      ) : null}

      <Controller
        control={control}
        name="subject"
        render={({ field, fieldState }) => (
          <FormField label={copy.subjectLabel} required error={fieldState.error?.message}>
            <AppInput value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} placeholder={copy.subjectPlaceholder} error={!!fieldState.error} />
          </FormField>
        )}
      />

      <Controller
        control={control}
        name="message"
        render={({ field, fieldState }) => (
          <FormField label={copy.messageLabel} required error={fieldState.error?.message}>
            <TextArea value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} placeholder={copy.messagePlaceholder} error={!!fieldState.error} />
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
