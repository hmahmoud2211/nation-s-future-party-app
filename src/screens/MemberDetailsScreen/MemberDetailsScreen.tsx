import React, { useMemo } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { BadgeCheck, Building2, CalendarDays, FolderKanban, IdCard, Landmark, Lightbulb, Mail, MessageSquare, Pencil, Phone, ShieldCheck, UserRound } from 'lucide-react-native';
import { ActionBar } from '@/components/layout/ActionBar';
import { AppHeader } from '@/components/layout/AppHeader';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { AppText } from '@/components/common/AppText';
import { Avatar } from '@/components/common/Avatar';
import { Badge, StatusBadge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { IconButton } from '@/components/common/IconButton';
import { InfoRow } from '@/components/ui/InfoRow';
import { PressableScale } from '@/components/common/PressableScale';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { EmptyState } from '@/components/feedback/States';
import { RoleBadges } from '@/features/members/components/RoleBadges';
import { ProjectCard } from '@/features/projects/components/ProjectCard';
import { ProposalCard } from '@/features/proposals/components/ProposalCard';
import { MEMBERSHIP_STATUS } from '@/features/members/services/labels';
import { useUser } from '@/features/auth/hooks/useSession';
import { useCommittees } from '@/features/committees/hooks/useCommittees';
import { useGovernorates } from '@/features/governorates/hooks/useGovernorates';
import { useMember } from '@/features/members/hooks/useMembers';
import { useNotificationActions } from '@/features/notifications/hooks/useNotifications';
import { useProjects } from '@/features/projects/hooks/useProjects';
import { useProposals } from '@/features/proposals/hooks/useProposals';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useDialogs, useToast } from '@/hooks/useOverlays';
import { formatDate, localizeDigits } from '@/utils/format';
import { canManageCommittee, canViewProposal, isAdmin } from '@/features/auth/services/permissions';
import { personLabel, rolesLabel } from '@/features/auth/services/roles';
import { createStyles, PROFILE_AVATAR_SIZE } from './MemberDetailsScreen.styles';
import { memberDetailsCopy as copy } from './MemberDetailsScreen.data';

/** Person profile: role, committees (with responsibility), governorates, proposals and projects. */
export function MemberDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const toast = useToast();
  const { promptDialog } = useDialogs();
  const user = useUser();
  const member = useMember(id);
  const committees = useCommittees();
  const governorates = useGovernorates();
  const projects = useProjects();
  const proposals = useProposals();
  const { createNotification } = useNotificationActions();

  const memberCommittees = useMemo(() => {
    if (!member) return [];
    const ids = new Set([...member.managedCommitteeIds, ...member.supervisedCommitteeIds, ...member.committeeIds]);
    return committees.filter((c) => ids.has(c.id));
  }, [committees, member]);
  const memberGovernorates = useMemo(() => (member ? governorates.filter((g) => member.governorateIds.includes(g.id)) : []), [governorates, member]);
  const memberProposals = useMemo(
    () => (member ? proposals.filter((p) => p.createdBy === member.id && canViewProposal(user, p)).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)) : []),
    [proposals, member, user],
  );
  const memberProjects = useMemo(() => (member ? projects.filter((p) => p.leadId === member.id || p.teamIds.includes(member.id)) : []), [projects, member]);

  if (!member) {
    return (
      <ScreenContainer header={<AppHeader title={copy.title} />}>
        <EmptyState icon={UserRound} title={copy.notFoundTitle} actionLabel={copy.back} onAction={() => (router.canGoBack() ? router.back() : router.replace('/home'))} />
      </ScreenContainer>
    );
  }

  const isSelf = member.id === user.id;
  const admin = isAdmin(user);
  const showPrivate = isSelf || admin;
  // People responsible for one of this person's committees can send them an admin note.
  const canNote = !isSelf && member.committeeIds.some((c) => canManageCommittee(user, c));

  const sendNote = async () => {
    const text = await promptDialog({
      title: copy.noteDialogTitle,
      message: copy.noteDialogMessage(member.name),
      placeholder: copy.notePlaceholder,
      confirmLabel: copy.noteConfirm,
      required: true,
      requiredMessage: copy.noteRequired,
    });
    if (text === null) return;
    createNotification({ recipientId: member.id, type: 'feedback_new', title: copy.noteNotificationTitle, body: text, link: `/members/${member.id}` });
    toast.success(copy.noteSent);
  };

  const committeeRole = (committeeId: string) =>
    [member.managedCommitteeIds.includes(committeeId) ? copy.committeeOfficial : null, member.supervisedCommitteeIds.includes(committeeId) ? copy.committeeSupervision : null]
      .filter(Boolean)
      .join(copy.roleSeparator) || personLabel(member);

  return (
    <ScreenContainer
      header={
        <AppHeader
          title={isSelf ? copy.selfTitle : copy.title}
          actions={admin ? <IconButton icon={Pencil} variant="glass" accessibilityLabel={copy.editA11y} onPress={() => router.push(`/members/edit/${member.id}`)} /> : undefined}
        >
          <View style={styles.profile}>
            <Avatar name={member.name} color={member.avatarColor} size={PROFILE_AVATAR_SIZE} ring />
            <View style={styles.profileText}>
              <AppText variant="sectionTitle" color={theme.colors.white} numberOfLines={2}>
                {member.name}
              </AppText>
              <AppText variant="caption" color={theme.colors.accentLight} numberOfLines={2}>
                {member.title}
              </AppText>
              <View style={styles.badges}>
                <RoleBadges member={member} />
                {member.status !== 'active' ? <StatusBadge status={MEMBERSHIP_STATUS[member.status]} /> : null}
              </View>
            </View>
          </View>
        </AppHeader>
      }
      footer={
        canNote ? (
          <ActionBar>
            <Button title={copy.sendNote} icon={MessageSquare} variant="outline" onPress={sendNote} fullWidth />
          </ActionBar>
        ) : undefined
      }
    >
      <SectionHeader title={copy.committeesTitle} icon={Building2} count={memberCommittees.length} />
      {memberCommittees.length ? (
        <View style={styles.list}>
          {memberCommittees.map((c) => (
            <PressableScale key={c.id} onPress={() => router.push(`/committee/${c.id}`)} style={styles.committee} accessibilityLabel={c.name}>
              <View style={[styles.committeeDot, { backgroundColor: c.color }]} />
              <AppText variant="bodyMedium" style={styles.committeeName} numberOfLines={1}>
                {c.name}
              </AppText>
              <AppText variant="meta" color={theme.colors.textSecondary}>
                {committeeRole(c.id)}
              </AppText>
            </PressableScale>
          ))}
        </View>
      ) : (
        <Card>
          <AppText variant="caption" color={theme.colors.textSecondary} align="center">
            {member.role === 'sector_secretary' || member.role === 'admin' ? copy.followsAllCommittees : copy.noCommittees}
          </AppText>
        </Card>
      )}

      {memberGovernorates.length ? (
        <>
          <SectionHeader title={copy.governoratesTitle} icon={Landmark} count={memberGovernorates.length} style={styles.section} />
          <View style={styles.chips}>
            {memberGovernorates.map((g) => (
              <PressableScale key={g.id} onPress={() => router.push(`/governorates/${g.id}`)} accessibilityLabel={g.name}>
                <Badge label={g.name} tone="primary" size="md" />
              </PressableScale>
            ))}
          </View>
        </>
      ) : null}

      <SectionHeader title={copy.membershipTitle} icon={IdCard} style={styles.section} />
      <Card style={styles.infoCard}>
        <InfoRow icon={ShieldCheck} label={copy.rolesLabel} value={rolesLabel(member, copy.rolesSeparator)} />
        <InfoRow icon={BadgeCheck} label={copy.statusLabel} value={MEMBERSHIP_STATUS[member.status].label} />
        <InfoRow icon={CalendarDays} label={copy.joinDateLabel} value={formatDate(member.joinDate)} last={!showPrivate} />
        {showPrivate ? (
          <>
            <InfoRow icon={IdCard} label={copy.membershipNumberLabel} value={localizeDigits(member.membershipNumber)} />
            <InfoRow icon={Phone} label={copy.phoneLabel} value={localizeDigits(member.phone)} />
            <InfoRow icon={Mail} label={copy.emailLabel} last>
              <AppText variant="bodyMedium" arabicDigits={false} numberOfLines={1}>
                {member.email}
              </AppText>
            </InfoRow>
          </>
        ) : null}
      </Card>

      {memberProposals.length ? (
        <>
          <SectionHeader title={copy.proposalsTitle} icon={Lightbulb} count={memberProposals.length} style={styles.section} />
          <View style={styles.list}>
            {memberProposals.slice(0, 5).map((p) => (
              <ProposalCard key={p.id} proposal={p} onPress={() => router.push(`/proposals/${p.id}`)} />
            ))}
          </View>
        </>
      ) : null}

      {memberProjects.length ? (
        <>
          <SectionHeader title={copy.projectsTitle} icon={FolderKanban} count={memberProjects.length} style={styles.section} />
          <View style={styles.list}>
            {memberProjects.map((p) => (
              <ProjectCard key={p.id} project={p} onPress={() => router.push(`/projects/${p.id}`)} />
            ))}
          </View>
        </>
      ) : null}
    </ScreenContainer>
  );
}
