import React, { useMemo, useState } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { CalendarDays, CalendarRange, CircleCheck, FolderKanban, Pencil, TrendingUp, User, Users } from 'lucide-react-native';
import { AppHeader } from '@/components/layout/AppHeader';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { AppText } from '@/components/common/AppText';
import { Avatar, AvatarStack } from '@/components/common/Avatar';
import { Badge, StatusBadge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { InfoRow } from '@/components/ui/InfoRow';
import { PressableScale } from '@/components/common/PressableScale';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { EmptyState } from '@/components/feedback/States';
import { PROJECT_STATUS } from '@/features/projects/services/labels';
import { useProject, useProjectActions } from '@/features/projects/hooks/useProjects';
import { useUser } from '@/features/auth/hooks/useSession';
import { useCommittee } from '@/features/committees/hooks/useCommittees';
import { useMemberMap } from '@/features/members/hooks/useMembers';
import type { ProjectStatus } from '@/features/projects/types';
import type { Comment } from '@/types/common.types';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useDialogs, useToast } from '@/hooks/useOverlays';
import { formatDate, formatPercent, refCode, localizeDigits, toWesternDigits } from '@/utils/format';
import { canManageCommittee, canViewFinance } from '@/features/auth/services/permissions';
import { projectDetailsCopy as copy } from './ProjectDetailsScreen.data';
import { createStyles, HEAD_PROGRESS_HEIGHT, LEAD_AVATAR_SIZE } from './ProjectDetailsScreen.styles';
import { CommentsSection } from './ProjectComments';
import { ProjectFinanceCard } from './ProjectFinanceCard';
import { AddMilestoneSheet, MilestonesSection } from './ProjectMilestones';
import { ProgressSheet } from './ProgressSheet';

export function ProjectDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const toast = useToast();
  const { confirmDialog, promptDialog } = useDialogs();
  const user = useUser();
  const project = useProject(id);
  const members = useMemberMap();
  const committee = useCommittee(project?.committeeId);
  const { updateProjectProgress, toggleProjectMilestone, addProjectMilestone, addProjectComment, closeProject, setProjectBudget } = useProjectActions();

  const [progressOpen, setProgressOpen] = useState(false);
  const [draftProgress, setDraftProgress] = useState(0);
  const [draftStatus, setDraftStatus] = useState<ProjectStatus>('in_progress');
  const [msOpen, setMsOpen] = useState(false);
  const [msTitle, setMsTitle] = useState('');
  const [msDate, setMsDate] = useState<string | undefined>();
  const [msError, setMsError] = useState<string | null>(null);
  const [replyTo, setReplyTo] = useState<Comment | null>(null);

  const threads = useMemo(() => {
    const comments = project?.comments ?? [];
    const top = comments.filter((c) => !c.parentId || !comments.some((p) => p.id === c.parentId));
    return top.map((c) => ({ comment: c, replies: comments.filter((r) => r.parentId === c.id) }));
  }, [project?.comments]);

  if (!project) {
    return (
      <ScreenContainer header={<AppHeader title={copy.title} />}>
        <EmptyState icon={FolderKanban} title={copy.notFound} actionLabel={copy.back} onAction={() => router.back()} />
      </ScreenContainer>
    );
  }

  const canManage = canManageCommittee(user, project.committeeId);
  const team = [project.leadId, ...project.teamIds];
  const canComment = canManage || team.includes(user.id) || user.committeeIds.includes(project.committeeId);
  const lead = members[project.leadId];
  const doneMilestones = project.milestones.filter((m) => m.done).length;
  const completed = project.status === 'completed';

  const openProgress = () => {
    setDraftProgress(Math.round(project.progress / 10) * 10);
    setDraftStatus(project.status === 'planned' ? 'in_progress' : project.status);
    setProgressOpen(true);
  };

  const saveProgress = () => {
    const res = updateProjectProgress(project.id, draftProgress, draftStatus);
    setProgressOpen(false);
    if (res.ok) toast.success(copy.progressSaved);
    else toast.error(res.error);
  };

  const onChangeStatus = (v: ProjectStatus) => {
    setDraftStatus(v);
    if (v === 'completed') setDraftProgress(100);
  };

  const onChangeMsTitle = (t: string) => {
    setMsTitle(t);
    if (msError) setMsError(null);
  };

  const saveMilestone = () => {
    if (!msTitle.trim()) {
      setMsError(copy.milestoneRequired);
      return;
    }
    const res = addProjectMilestone(project.id, { title: msTitle, dueDate: msDate ?? project.endDate });
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    setMsOpen(false);
    setMsTitle('');
    setMsDate(undefined);
    setMsError(null);
    toast.success(copy.milestoneAdded);
  };

  const onToggle = (milestoneId: string) => {
    const res = toggleProjectMilestone(project.id, milestoneId);
    if (!res.ok) toast.error(res.error);
  };

  const onSetBudget = async () => {
    const text = await promptDialog({
      title: copy.budgetPrompt.title,
      message: copy.budgetPrompt.message,
      placeholder: copy.budgetPrompt.placeholder,
      initialValue: project.budget ? String(project.budget) : '',
      confirmLabel: copy.budgetPrompt.confirmLabel,
      required: true,
      requiredMessage: copy.budgetPrompt.requiredMessage,
    });
    if (text === null) return;
    const amount = Number(toWesternDigits(text).replace(/[^\d.]/g, ''));
    const res = setProjectBudget(project.id, amount);
    if (res.ok) toast.success(copy.budgetSaved);
    else toast.error(res.error);
  };

  const onClose = async () => {
    const yes = await confirmDialog({
      title: copy.closeConfirm.title,
      message: copy.closeConfirm.message,
      confirmLabel: copy.closeConfirm.confirmLabel,
      tone: 'success',
    });
    if (!yes) return;
    const res = closeProject(project.id);
    if (res.ok) toast.success(copy.projectClosed);
    else toast.error(res.error);
  };

  const onSend = (text: string) => {
    const res = addProjectComment(project.id, text, replyTo?.id);
    if (!res.ok) {
      toast.error(res.error);
      return false;
    }
    setReplyTo(null);
    toast.success(copy.commentSent);
    return true;
  };

  return (
    <ScreenContainer
      keyboard
      header={
        <AppHeader title={project.title} eyebrow={copy.eyebrow(refCode.project(project.seq), committee?.name ?? '')}>
          <View style={styles.headCard}>
            <View style={styles.headRow}>
              <StatusBadge status={PROJECT_STATUS[project.status]} />
              <View style={styles.headSpacer} />
              <AppText variant="bodyBold" color={theme.colors.white}>
                {formatPercent(project.progress)}
              </AppText>
            </View>
            <ProgressBar value={project.progress} trackColor={theme.colors.glassStrong} color={theme.colors.accent} height={HEAD_PROGRESS_HEIGHT} />
            <AppText variant="meta" color={theme.colors.onPrimaryMuted}>
              {copy.milestonesSummary(localizeDigits(doneMilestones), localizeDigits(project.milestones.length), formatDate(project.endDate))}
            </AppText>
          </View>
        </AppHeader>
      }
    >
      {canManage ? (
        <View style={styles.actions}>
          <Button title={copy.updateProgress} icon={TrendingUp} size="sm" onPress={openProgress} style={styles.actionButton} />
          <Button title={copy.edit} icon={Pencil} size="sm" variant="outline" onPress={() => router.push(`/projects/edit/${project.id}`)} style={styles.actionButton} />
          {!completed ? <Button title={copy.closeAsCompleted} icon={CircleCheck} size="sm" variant="success" onPress={onClose} style={styles.closeButton} /> : null}
        </View>
      ) : null}

      <Card style={styles.block}>
        <AppText variant="cardTitle" style={styles.descriptionTitle}>
          {copy.descriptionTitle}
        </AppText>
        <AppText variant="body" color={theme.colors.textSecondary}>
          {project.description || copy.noDescription}
        </AppText>
        <View style={styles.infoRows}>
          <InfoRow icon={FolderKanban} label={copy.committee} value={committee?.name} />
          <InfoRow icon={CalendarDays} label={copy.startDate} value={formatDate(project.startDate)} />
          <InfoRow icon={CalendarRange} label={copy.endDate} value={formatDate(project.endDate)} />
          <InfoRow icon={User} label={copy.lead}>
            {lead ? (
              <PressableScale onPress={() => router.push(`/members/${lead.id}`)} style={styles.inline}>
                <AppText variant="bodyMedium">{lead.name}</AppText>
                <Avatar name={lead.name} color={lead.avatarColor} size={LEAD_AVATAR_SIZE} />
              </PressableScale>
            ) : (
              <AppText variant="bodyMedium">{copy.emptyValue}</AppText>
            )}
          </InfoRow>
          <InfoRow icon={Users} label={copy.team} last>
            <AvatarStack people={team.map((t) => members[t]).filter(Boolean).map((m) => ({ name: m.name, color: m.avatarColor }))} />
          </InfoRow>
        </View>
        {project.teamIds.length ? (
          <View style={styles.teamWrap}>
            {project.teamIds.map((t) => members[t]).filter(Boolean).map((m) => (
              <Badge key={m.id} label={m.name} tone="primary" />
            ))}
          </View>
        ) : null}
      </Card>

      {canViewFinance(user) ? <ProjectFinanceCard project={project} onSetBudget={onSetBudget} /> : null}

      <MilestonesSection project={project} canManage={canManage} completed={completed} onAdd={() => setMsOpen(true)} onToggle={onToggle} />

      <CommentsSection
        count={project.comments.length}
        threads={threads}
        canComment={canComment}
        replyTo={replyTo}
        onReply={setReplyTo}
        onCancelReply={() => setReplyTo(null)}
        onSend={onSend}
      />

      <ProgressSheet
        visible={progressOpen}
        onClose={() => setProgressOpen(false)}
        subtitle={project.title}
        progress={draftProgress}
        onChangeProgress={setDraftProgress}
        status={draftStatus}
        onChangeStatus={onChangeStatus}
        onSave={saveProgress}
      />

      <AddMilestoneSheet
        visible={msOpen}
        onClose={() => setMsOpen(false)}
        title={msTitle}
        onChangeTitle={onChangeMsTitle}
        date={msDate}
        onChangeDate={setMsDate}
        error={msError}
        onSubmit={saveMilestone}
      />
    </ScreenContainer>
  );
}
