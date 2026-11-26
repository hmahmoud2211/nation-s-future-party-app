import React, { useMemo } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Landmark, Phone, UserRound } from 'lucide-react-native';
import { FormField } from '@/components/forms/FormField';
import { FormSelect } from '@/components/forms/FormSelect';
import { AppHeader } from '@/components/layout/AppHeader';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { AppText } from '@/components/common/AppText';
import { Avatar } from '@/components/common/Avatar';
import { Card } from '@/components/common/Card';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { EmptyState } from '@/components/feedback/States';
import { ActivityCard } from '@/features/activities/components/ActivityCard';
import { MemberCard } from '@/features/members/components/MemberCard';
import { ProjectCard } from '@/features/projects/components/ProjectCard';
import { ProposalCard } from '@/features/proposals/components/ProposalCard';
import { DemoNotice } from '@/features/settings/components/DemoNotice';
import { useActivities } from '@/features/activities/hooks/useActivities';
import { useUser } from '@/features/auth/hooks/useSession';
import { useCommitteeMap } from '@/features/committees/hooks/useCommittees';
import { useGovernorate, useGovernorateActions, useGovernorateContacts } from '@/features/governorates/hooks/useGovernorates';
import { useMembers } from '@/features/members/hooks/useMembers';
import { useProjects } from '@/features/projects/hooks/useProjects';
import { useProposals } from '@/features/proposals/hooks/useProposals';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useRunResult } from '@/hooks/useOverlays';
import { localizeDigits } from '@/utils/format';
import { can, canViewGovernorate, canViewProposal } from '@/features/auth/services/permissions';
import { CONTACT_AVATAR_SIZE, createStyles, PHONE_ICON_SIZE } from './GovernorateDetailsScreen.styles';
import { governorateDetailsCopy as copy } from './GovernorateDetailsScreen.data';

/** One governorate: coordinator, local secretaries/representatives, and work in that governorate. */
export function GovernorateDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const runResult = useRunResult();
  const user = useUser();
  const governorate = useGovernorate(id);
  const members = useMembers();
  const contacts = useGovernorateContacts();
  const activities = useActivities();
  const proposals = useProposals();
  const projects = useProjects();
  const { assignGovernorate } = useGovernorateActions();
  const committees = useCommitteeMap();

  const data = useMemo(
    () => ({
      coordinator: members.find((m) => m.governorateIds.includes(id)),
      assistants: members.filter((m) => m.role === 'assistant_secretary' && m.status === 'active'),
      contacts: contacts.filter((c) => c.governorateId === id),
      activities: activities.filter((a) => a.governorateId === id).sort((a, b) => b.date.localeCompare(a.date)),
      proposals: proposals.filter((p) => p.governorateId === id && canViewProposal(user, p)),
      projects: projects.filter((p) => p.governorateId === id),
    }),
    [members, contacts, activities, proposals, projects, id, user],
  );

  if (!governorate || !canViewGovernorate(user, governorate.id)) {
    return (
      <ScreenContainer header={<AppHeader title={copy.title} />}>
        <EmptyState icon={Landmark} title={governorate ? copy.unauthorizedTitle : copy.notFoundTitle} message={governorate ? copy.outOfScopeMessage : undefined} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer header={<AppHeader title={governorate.name} eyebrow={governorate.region} />}>
      <SectionHeader title={copy.coordinatorTitle} icon={UserRound} />
      {data.coordinator ? (
        <MemberCard member={data.coordinator} showStats={false} onPress={() => router.push(`/members/${data.coordinator?.id}`)} />
      ) : (
        <Card>
          <AppText variant="caption" color={theme.colors.textSecondary}>
            {copy.noCoordinator}
          </AppText>
        </Card>
      )}
      {can(user, 'governorates.manage') ? (
        <FormField label={copy.changeCoordinator} style={styles.coordinatorField}>
          <FormSelect
            options={data.assistants.map((m) => ({ value: m.id, label: m.name, avatarColor: m.avatarColor }))}
            value={data.coordinator?.id}
            onChange={(v) => runResult(assignGovernorate(governorate.id, v), v ? copy.assigned : copy.unassigned)}
            title={copy.coordinatorPickerTitle(governorate.name)}
            placeholder={copy.coordinatorPlaceholder}
            allowClear
          />
        </FormField>
      ) : null}

      <View style={styles.section}>
        <SectionHeader title={copy.contactsTitle} count={data.contacts.length} />
        <View style={styles.list}>
          {data.contacts.map((c) => (
            <Card key={c.id}>
              <View style={styles.contactRow}>
                <Avatar name={c.name} size={CONTACT_AVATAR_SIZE} />
                <View style={styles.contactText}>
                  <AppText variant="cardTitle">{c.name}</AppText>
                  <AppText variant="meta" color={theme.colors.accentStrong}>
                    {c.title}
                  </AppText>
                </View>
              </View>
              <AppText variant="caption" color={theme.colors.textSecondary} style={styles.responsibilities}>
                {c.responsibilities}
                {c.committeeId ? copy.committeeSuffix(committees[c.committeeId]?.shortName ?? '') : ''}
              </AppText>
              <View style={styles.phone}>
                <Phone size={PHONE_ICON_SIZE} color={theme.colors.textMuted} />
                <AppText variant="meta" color={theme.colors.textMuted}>
                  {copy.contactPhone(localizeDigits(c.phone))}
                </AppText>
              </View>
            </Card>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <SectionHeader title={copy.activitiesTitle} count={data.activities.length} />
        {data.activities.length ? (
          <View style={styles.list}>
            {data.activities.map((a) => (
              <ActivityCard key={a.id} activity={a} onPress={() => router.push(`/activities/${a.id}`)} />
            ))}
          </View>
        ) : (
          <EmptyState compact title={copy.noActivities} />
        )}
      </View>

      <View style={styles.section}>
        <SectionHeader title={copy.proposalsTitle} count={data.proposals.length} />
        {data.proposals.length ? (
          <View style={styles.list}>
            {data.proposals.map((p) => (
              <ProposalCard key={p.id} proposal={p} onPress={() => router.push(`/proposals/${p.id}`)} />
            ))}
          </View>
        ) : (
          <EmptyState compact title={copy.noProposals} />
        )}
      </View>

      {data.projects.length ? (
        <View style={styles.section}>
          <SectionHeader title={copy.projectsTitle} count={data.projects.length} />
          <View style={styles.list}>
            {data.projects.map((p) => (
              <ProjectCard key={p.id} project={p} onPress={() => router.push(`/projects/${p.id}`)} />
            ))}
          </View>
        </View>
      ) : null}

      <DemoNotice style={styles.section} text={copy.demoNotice} />
    </ScreenContainer>
  );
}
