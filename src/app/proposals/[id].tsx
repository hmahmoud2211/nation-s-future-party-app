import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Building2, CalendarDays, CircleCheck, CircleX, Eye, Lightbulb, MapPin, MessageSquare, Play, Target, UserRound } from 'lucide-react-native';
import {
  ActionBar,
  AppHeader,
  AppText,
  BottomSheet,
  Button,
  Card,
  EmptyState,
  FilePreview,
  FormField,
  InfoRow,
  ScreenContainer,
  SectionHeader,
  StatusBadge,
  TextArea,
  Timeline,
} from '@/components';
import { PROPOSAL_ACTION, PROPOSAL_STATUS } from '@/constants/labels';
import { useAppStore, useCommittee, useMember, useUser } from '@/store';
import { confirmDialog, toast } from '@/store/uiStore';
import { colors, radius, spacing } from '@/theme';
import type { ProposalStatus } from '@/types';
import { formatDate, refCode } from '@/utils/format';
import { canViewProposal, proposalTransitions } from '@/utils/permissions';

const ACTION_ICON: Record<ProposalStatus, typeof Eye> = {
  new: Lightbulb,
  under_review: Eye,
  approved: CircleCheck,
  rejected: CircleX,
  in_progress: Play,
  completed: CircleCheck,
};

/** Proposal details: content, status history and the actions the user is allowed to take. */
export default function ProposalDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const user = useUser();
  const proposal = useAppStore((s) => s.proposals.find((p) => p.id === id));
  const governorate = useAppStore((s) => (proposal?.governorateId ? s.governorates.find((g) => g.id === proposal.governorateId) : undefined));
  const committee = useCommittee(proposal?.committeeId);
  const author = useMember(proposal?.createdBy);
  const setProposalStatus = useAppStore((s) => s.setProposalStatus);
  const [noteFor, setNoteFor] = useState<ProposalStatus | null>(null);
  const [note, setNote] = useState('');

  if (!proposal || !canViewProposal(user, proposal)) {
    return (
      <ScreenContainer header={<AppHeader title="تفاصيل المقترح" />}>
        <EmptyState icon={Lightbulb} title={proposal ? 'غير مصرح' : 'المقترح غير موجود'} message={proposal ? 'هذا المقترح خارج نطاق صلاحياتك.' : undefined} />
      </ScreenContainer>
    );
  }

  const transitions = proposalTransitions(user, proposal);

  const apply = (status: ProposalStatus, text?: string) => {
    const res = setProposalStatus(proposal.id, status, text);
    if (!res.ok) {
      toast.error(res.error);
      return false;
    }
    toast.success(`تم تغيير الحالة إلى «${PROPOSAL_STATUS[status].label}»`);
    return true;
  };

  const onAction = async (status: ProposalStatus) => {
    // Decisions can carry a note (required when rejecting).
    if (status === 'approved' || status === 'rejected') {
      setNote('');
      setNoteFor(status);
      return;
    }
    const ok = await confirmDialog({ title: `${PROPOSAL_ACTION[status]}؟`, message: `سيتم تغيير حالة المقترح إلى «${PROPOSAL_STATUS[status].label}».`, confirmLabel: PROPOSAL_ACTION[status] });
    if (ok) apply(status);
  };

  return (
    <ScreenContainer
      header={<AppHeader title="تفاصيل المقترح" subtitle={refCode.proposal(proposal.seq)} />}
      footer={
        transitions.length ? (
          <ActionBar>
            {transitions.map((s, i) => (
              <Button
                key={s}
                title={PROPOSAL_ACTION[s]}
                icon={ACTION_ICON[s]}
                variant={s === 'rejected' ? 'dangerOutline' : i === 0 ? 'primary' : 'outline'}
                onPress={() => onAction(s)}
                style={{ flex: 1 }}
              />
            ))}
          </ActionBar>
        ) : undefined
      }
    >
      <View style={styles.titleRow}>
        <AppText variant="sectionTitle" style={{ flex: 1 }}>
          {proposal.title}
        </AppText>
        <StatusBadge status={PROPOSAL_STATUS[proposal.status]} />
      </View>

      <Card style={{ paddingVertical: spacing.xs }}>
        <InfoRow icon={Building2} label="اللجنة" value={committee?.name ?? '—'} />
        <InfoRow icon={UserRound} label="مقدم المقترح" value={author?.name ?? '—'} />
        {governorate ? <InfoRow icon={MapPin} label="المحافظة" value={governorate.name} /> : null}
        <InfoRow icon={CalendarDays} label="تاريخ التقديم" value={formatDate(proposal.createdAt)} last />
      </Card>

      {proposal.reviewNote ? (
        <View style={[styles.note, proposal.status === 'rejected' && styles.noteError]}>
          <AppText variant="captionMedium" color={proposal.status === 'rejected' ? colors.error : colors.navy2}>
            ملاحظة الأمين
          </AppText>
          <AppText variant="body">{proposal.reviewNote}</AppText>
        </View>
      ) : null}

      <SectionHeader title="الوصف" style={styles.section} />
      <Card>
        <AppText variant="body">{proposal.description}</AppText>
      </Card>

      <SectionHeader title="الهدف" icon={Target} style={styles.section} />
      <Card>
        <AppText variant="body">{proposal.objective}</AppText>
      </Card>

      {proposal.attachments.length ? (
        <>
          <SectionHeader title="المستندات الداعمة" style={styles.section} />
          <View style={{ gap: spacing.sm }}>
            {proposal.attachments.map((a) => (
              <FilePreview key={a.id} file={a} />
            ))}
          </View>
        </>
      ) : null}

      <SectionHeader title="سجل الحالة" style={styles.section} />
      <Card>
        <Timeline events={proposal.history} />
      </Card>

      <Button
        title="إرسال ملاحظة على المقترح"
        icon={MessageSquare}
        variant="ghost"
        onPress={() => router.push(`/feedback/new?category=proposal&relatedId=${proposal.id}&committeeId=${proposal.committeeId}`)}
        style={styles.section}
      />

      <BottomSheet
        visible={noteFor !== null}
        onClose={() => setNoteFor(null)}
        title={noteFor ? PROPOSAL_ACTION[noteFor] : ''}
        subtitle={noteFor === 'rejected' ? 'يرجى توضيح سبب الرفض لمقدم المقترح.' : 'يمكنك إضافة ملاحظة لمقدم المقترح (اختياري).'}
        footer={
          <Button
            title={noteFor ? PROPOSAL_ACTION[noteFor] : ''}
            variant={noteFor === 'rejected' ? 'danger' : 'primary'}
            onPress={() => {
              if (noteFor && apply(noteFor, note)) setNoteFor(null);
            }}
            fullWidth
          />
        }
      >
        <FormField label={noteFor === 'rejected' ? 'سبب الرفض' : 'ملاحظة'} required={noteFor === 'rejected'}>
          <TextArea value={note} onChangeText={setNote} placeholder="اكتب ملاحظتك…" accessibilityLabel="ملاحظة القرار" />
        </FormField>
      </BottomSheet>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, marginBottom: spacing.md },
  section: { marginTop: spacing.lg },
  note: { marginTop: spacing.md, padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.navyTint, borderWidth: 1, borderColor: colors.border, gap: 2 },
  noteError: { backgroundColor: colors.errorSoft, borderColor: '#F3CACA' },
});
