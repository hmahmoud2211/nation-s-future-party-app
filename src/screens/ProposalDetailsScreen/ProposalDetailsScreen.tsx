import React, { useMemo, useState } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Building2, CalendarDays, CircleCheck, CircleX, Eye, Lightbulb, MapPin, MessageSquare, Play, Target, UserRound } from 'lucide-react-native';
import { TextArea } from '@/components/forms/AppInput';
import { FilePreview } from '@/components/forms/AttachmentPicker';
import { FormField } from '@/components/forms/FormField';
import { ActionBar } from '@/components/layout/ActionBar';
import { AppHeader } from '@/components/layout/AppHeader';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Timeline } from '@/components/ui/Timeline';
import { AppText } from '@/components/common/AppText';
import { StatusBadge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { InfoRow } from '@/components/ui/InfoRow';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { EmptyState } from '@/components/feedback/States';
import { PROPOSAL_ACTION, PROPOSAL_STATUS } from '@/features/proposals/services/labels';
import { useProposal, useProposalActions } from '@/features/proposals/hooks/useProposals';
import { useGovernorate } from '@/features/governorates/hooks/useGovernorates';
import { useUser } from '@/features/auth/hooks/useSession';
import { useCommittee } from '@/features/committees/hooks/useCommittees';
import { useMember, usePeopleResolvers } from '@/features/members/hooks/useMembers';
import type { ProposalStatus } from '@/features/proposals/types';
import { canViewProposal, proposalTransitions } from '@/features/auth/services/permissions';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useDialogs, useToast } from '@/hooks/useOverlays';
import { formatDate, refCode } from '@/utils/format';
import { proposalDetailsCopy as copy } from './ProposalDetailsScreen.data';
import { createStyles } from './ProposalDetailsScreen.styles';

const ACTION_ICON: Record<ProposalStatus, typeof Eye> = {
  new: Lightbulb,
  under_review: Eye,
  approved: CircleCheck,
  rejected: CircleX,
  in_progress: Play,
  completed: CircleCheck,
};

/** Proposal details: content, status history and the actions the user is allowed to take. */
export function ProposalDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const toast = useToast();
  const { confirmDialog } = useDialogs();
  const user = useUser();
  const people = usePeopleResolvers();
  const proposal = useProposal(id);
  const governorate = useGovernorate(proposal?.governorateId);
  const committee = useCommittee(proposal?.committeeId);
  const author = useMember(proposal?.createdBy);
  const { setProposalStatus } = useProposalActions();
  const [noteFor, setNoteFor] = useState<ProposalStatus | null>(null);
  const [note, setNote] = useState('');

  if (!proposal || !canViewProposal(user, proposal)) {
    return (
      <ScreenContainer header={<AppHeader title={copy.title} />}>
        <EmptyState icon={Lightbulb} title={proposal ? copy.unauthorized : copy.notFound} message={proposal ? copy.outOfScope : undefined} />
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
    toast.success(copy.statusChanged(PROPOSAL_STATUS[status].label));
    return true;
  };

  const onAction = async (status: ProposalStatus) => {
    // Decisions can carry a note (required when rejecting).
    if (status === 'approved' || status === 'rejected') {
      setNote('');
      setNoteFor(status);
      return;
    }
    const ok = await confirmDialog({ title: copy.confirmTitle(PROPOSAL_ACTION[status]), message: copy.confirmMessage(PROPOSAL_STATUS[status].label), confirmLabel: PROPOSAL_ACTION[status] });
    if (ok) apply(status);
  };

  return (
    <ScreenContainer
      header={<AppHeader title={copy.title} subtitle={refCode.proposal(proposal.seq)} />}
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
                style={styles.actionButton}
              />
            ))}
          </ActionBar>
        ) : undefined
      }
    >
      <View style={styles.titleRow}>
        <AppText variant="sectionTitle" style={styles.title}>
          {proposal.title}
        </AppText>
        <StatusBadge status={PROPOSAL_STATUS[proposal.status]} />
      </View>

      <Card style={styles.infoCard}>
        <InfoRow icon={Building2} label={copy.committee} value={committee?.name ?? copy.emptyValue} />
        <InfoRow icon={UserRound} label={copy.author} value={author?.name ?? copy.emptyValue} />
        {governorate ? <InfoRow icon={MapPin} label={copy.governorate} value={governorate.name} /> : null}
        <InfoRow icon={CalendarDays} label={copy.submittedAt} value={formatDate(proposal.createdAt)} last />
      </Card>

      {proposal.reviewNote ? (
        <View style={[styles.note, proposal.status === 'rejected' && styles.noteError]}>
          <AppText variant="captionMedium" color={proposal.status === 'rejected' ? theme.colors.error : theme.colors.primary}>
            {copy.reviewNote}
          </AppText>
          <AppText variant="body">{proposal.reviewNote}</AppText>
        </View>
      ) : null}

      <SectionHeader title={copy.description} style={styles.section} />
      <Card>
        <AppText variant="body">{proposal.description}</AppText>
      </Card>

      <SectionHeader title={copy.objective} icon={Target} style={styles.section} />
      <Card>
        <AppText variant="body">{proposal.objective}</AppText>
      </Card>

      {proposal.attachments.length ? (
        <>
          <SectionHeader title={copy.attachments} style={styles.section} />
          <View style={styles.attachments}>
            {proposal.attachments.map((a) => (
              <FilePreview key={a.id} file={a} />
            ))}
          </View>
        </>
      ) : null}

      <SectionHeader title={copy.history} style={styles.section} />
      <Card>
        <Timeline events={proposal.history} actorName={people.actorName} />
      </Card>

      <Button
        title={copy.sendFeedback}
        icon={MessageSquare}
        variant="ghost"
        onPress={() => router.push(`/feedback/new?category=proposal&relatedId=${proposal.id}&committeeId=${proposal.committeeId}`)}
        style={styles.section}
      />

      <BottomSheet
        visible={noteFor !== null}
        onClose={() => setNoteFor(null)}
        title={noteFor ? PROPOSAL_ACTION[noteFor] : ''}
        subtitle={noteFor === 'rejected' ? copy.rejectSubtitle : copy.noteSubtitle}
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
        <FormField label={noteFor === 'rejected' ? copy.rejectReason : copy.note} required={noteFor === 'rejected'}>
          <TextArea value={note} onChangeText={setNote} placeholder={copy.notePlaceholder} accessibilityLabel={copy.noteA11y} />
        </FormField>
      </BottomSheet>
    </ScreenContainer>
  );
}
