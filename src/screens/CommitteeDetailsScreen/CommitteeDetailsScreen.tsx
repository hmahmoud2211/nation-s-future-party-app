import React, { useMemo, useState } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LayoutGrid } from 'lucide-react-native';
import { AppHeader } from '@/components/layout/AppHeader';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { FilterChips } from '@/components/ui/Chips';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { EmptyState } from '@/components/feedback/States';
import { ManagementActions } from '@/features/committees/components/ManagementActions';
import { useActivities } from '@/features/activities/hooks/useActivities';
import { useAnnouncements } from '@/features/announcements/hooks/useAnnouncements';
import { useUser } from '@/features/auth/hooks/useSession';
import { useCommittee, useStats } from '@/features/committees/hooks/useCommittees';
import { useMeetings } from '@/features/meetings/hooks/useMeetings';
import { isUpcomingMeeting } from '@/features/meetings/services/meetingRules';
import { useCommitteeOfficials, useMembers } from '@/features/members/hooks/useMembers';
import { isRegularMemberOf } from '@/features/members/services/memberLookup';
import { useProjects } from '@/features/projects/hooks/useProjects';
import { useProposals } from '@/features/proposals/hooks/useProposals';
import { useReports } from '@/features/reports/hooks/useReports';
import { useAppTheme } from '@/hooks/useAppTheme';
import { canManageCommittee, canOverseeCommittee, canSeeAnnouncement, canSubmitProposal, canViewCommitteeReports, canViewProposal } from '@/features/auth/services/permissions';
import { committeeDetailsCopy as copy } from './CommitteeDetailsScreen.data';
import { createStyles } from './CommitteeDetailsScreen.styles';
import { CommitteeHeaderCard } from './CommitteeHeaderCard';
import { ActivitiesTab, type CommitteeTab, MembersTab, OverviewTab, ProjectsTab, ProposalsTab, ReportsTab } from './CommitteeTabs';

export function CommitteeDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const user = useUser();
  const committee = useCommittee(id);
  const officials = useCommitteeOfficials(committee?.id);
  const [tab, setTab] = useState<CommitteeTab>('overview');

  const members = useMembers();
  const projects = useProjects();
  const activities = useActivities();
  const proposals = useProposals();
  const reports = useReports();
  const meetings = useMeetings();
  const announcements = useAnnouncements();
  const stats = useStats(id ? [id] : []);

  const canManage = !!id && canManageCommittee(user, id);
  const canOversee = !!id && canOverseeCommittee(user, id);

  const data = useMemo(() => {
    const cMembers = members.filter((m) => isRegularMemberOf(m, id));
    const cProjects = projects.filter((p) => p.committeeId === id).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    const cActivities = activities.filter((a) => a.committeeId === id).sort((a, b) => b.date.localeCompare(a.date));
    const cProposals = proposals.filter((p) => p.committeeId === id && canViewProposal(user, p)).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    const cReports = reports.filter((r) => r.committeeId === id).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const upcoming = meetings
      .filter((m) => m.committeeId === id && isUpcomingMeeting(m))
      .sort((a, b) => a.date.localeCompare(b.date));
    const cAnnouncements = announcements
      .filter((a) => a.committeeId === id && canSeeAnnouncement(user, a.committeeId))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return { cMembers, cProjects, cActivities, cProposals, cReports, upcoming, cAnnouncements };
  }, [members, projects, activities, proposals, reports, meetings, announcements, id, user]);

  if (!committee) {
    return (
      <ScreenContainer header={<AppHeader title={copy.title} />}>
        <EmptyState icon={LayoutGrid} title={copy.notFoundTitle} message={copy.notFoundMessage} actionLabel={copy.backToCommittees} onAction={() => router.replace('/committees')} />
      </ScreenContainer>
    );
  }

  const canReports = canViewCommitteeReports(user, committee.id);
  const tabOptions: { key: CommitteeTab; label: string; count?: number }[] = [
    { key: 'overview', label: copy.tabOverview },
    { key: 'proposals', label: copy.tabProposals, count: data.cProposals.length },
    { key: 'projects', label: copy.tabProjects, count: data.cProjects.length },
    { key: 'activities', label: copy.tabActivities, count: data.cActivities.length },
    { key: 'members', label: copy.tabMembers, count: data.cMembers.length },
    ...(canReports ? [{ key: 'reports' as CommitteeTab, label: copy.tabReports }] : []),
  ];

  return (
    <ScreenContainer
      header={
        <AppHeader title={committee.name} eyebrow={copy.title}>
          <CommitteeHeaderCard committee={committee} officials={officials} stats={stats} canManage={canManage} />
        </AppHeader>
      }
    >
      {canManage ? (
        <View style={styles.manageSection}>
          <SectionHeader title={copy.managementTitle} icon={LayoutGrid} />
          <ManagementActions committeeId={committee.id} />
        </View>
      ) : null}

      <FilterChips options={tabOptions} value={tab} onChange={setTab} style={styles.tabs} />

      {tab === 'overview' ? (
        <OverviewTab committee={committee} stats={stats} officials={officials} upcoming={data.upcoming} announcements={data.cAnnouncements} onSelectTab={setTab} />
      ) : null}

      {tab === 'members' ? <MembersTab committeeId={committee.id} members={data.cMembers} canManage={canManage} canOversee={canOversee} /> : null}

      {tab === 'projects' ? <ProjectsTab committeeId={committee.id} projects={data.cProjects} canManage={canManage} /> : null}

      {tab === 'activities' ? <ActivitiesTab committeeId={committee.id} activities={data.cActivities} canManage={canManage} /> : null}

      {tab === 'proposals' ? <ProposalsTab committeeId={committee.id} proposals={data.cProposals} canSubmit={canSubmitProposal(user, committee.id)} /> : null}

      {tab === 'reports' ? <ReportsTab committeeId={committee.id} stats={stats} reports={data.cReports} canReports={canReports} canManage={canManage} /> : null}
    </ScreenContainer>
  );
}
