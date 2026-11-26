import React, { useMemo } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { CalendarDays, ChartColumn, CircleCheck, FolderKanban, Lightbulb, Megaphone, MessageSquare, Sparkles, Users } from 'lucide-react-native';
import { AppText } from '@/components/common/AppText';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { InlineNote } from '@/components/feedback/InlineNote';
import { EmptyState } from '@/components/feedback/States';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { StatCard, StatGrid } from '@/components/ui/StatCard';
import { ActivityCard } from '@/features/activities/components/ActivityCard';
import type { Activity } from '@/features/activities/types';
import { AnnouncementCard } from '@/features/announcements/components/AnnouncementCard';
import type { Announcement } from '@/features/announcements/types';
import type { CommitteeStats } from '@/features/committees/services/stats';
import type { Committee } from '@/features/committees/types';
import { MeetingCard } from '@/features/meetings/components/MeetingCard';
import type { Meeting } from '@/features/meetings/types';
import { MemberCard } from '@/features/members/components/MemberCard';
import type { Member } from '@/features/members/types';
import { ProjectCard } from '@/features/projects/components/ProjectCard';
import type { Project } from '@/features/projects/types';
import { ProposalCard } from '@/features/proposals/components/ProposalCard';
import type { Proposal } from '@/features/proposals/types';
import { ReportCard } from '@/features/reports/components/ReportCard';
import type { CommitteeReport } from '@/features/reports/types';
import { useAppTheme } from '@/hooks/useAppTheme';
import { committeeDetailsCopy as copy } from './CommitteeDetailsScreen.data';
import { createStyles } from './CommitteeDetailsScreen.styles';

export type CommitteeTab = 'overview' | 'proposals' | 'projects' | 'activities' | 'members' | 'reports';

function useStyles() {
  const theme = useAppTheme();
  return { theme, styles: useMemo(() => createStyles(theme), [theme]) };
}

// ───────────── نظرة عامة ─────────────

export function OverviewTab({
  committee,
  stats,
  officials,
  upcoming,
  announcements,
  onSelectTab,
}: {
  committee: Committee;
  stats: CommitteeStats;
  officials: Member[];
  upcoming: Meeting[];
  announcements: Announcement[];
  onSelectTab: (tab: CommitteeTab) => void;
}) {
  const router = useRouter();
  const { theme, styles } = useStyles();
  return (
    <View style={styles.overview}>
      <Card>
        <AppText variant="cardTitle" style={styles.aboutTitle}>
          {copy.aboutTitle}
        </AppText>
        <AppText variant="body" color={theme.colors.textSecondary}>
          {committee.description}
        </AppText>
      </Card>

      <StatGrid>
        <StatCard label={copy.statMembers} value={stats.members} icon={Users} tone="primary" onPress={() => onSelectTab('members')} />
        <StatCard label={copy.statActiveProjects} value={stats.activeProjects} icon={FolderKanban} tone="success" onPress={() => onSelectTab('projects')} />
        <StatCard label={copy.statUpcomingActivities} value={stats.upcomingActivities} icon={Sparkles} tone="purple" onPress={() => onSelectTab('activities')} />
        <StatCard label={copy.statUpcomingMeetings} value={stats.upcomingMeetings} icon={CalendarDays} tone="info" onPress={() => router.push(`/meetings?committeeId=${committee.id}`)} />
      </StatGrid>

      {officials.length ? (
        <View>
          <SectionHeader title={copy.officialsTitle(officials.length)} count={officials.length > 1 ? officials.length : undefined} />
          <View style={styles.list}>
            {officials.map((o) => (
              <MemberCard key={o.id} member={o} showStats={false} onPress={() => router.push(`/members/${o.id}`)} />
            ))}
          </View>
        </View>
      ) : null}

      <View>
        <SectionHeader title={copy.upcomingMeetingsTitle} icon={CalendarDays} onAction={() => router.push(`/meetings?committeeId=${committee.id}`)} />
        {upcoming.length ? (
          <View style={styles.list}>
            {upcoming.slice(0, 3).map((m) => (
              <MeetingCard key={m.id} meeting={m} onPress={() => router.push(`/meetings/${m.id}`)} />
            ))}
          </View>
        ) : (
          <EmptyState compact icon={CalendarDays} title={copy.noUpcomingMeetings} />
        )}
      </View>

      <View>
        <SectionHeader title={copy.latestAnnouncementsTitle} icon={Megaphone} onAction={() => router.push('/announcements')} />
        {announcements.length ? (
          <View style={styles.list}>
            {announcements.slice(0, 3).map((a) => (
              <AnnouncementCard key={a.id} announcement={a} onPress={() => router.push(`/announcements/${a.id}`)} />
            ))}
          </View>
        ) : (
          <EmptyState compact icon={Megaphone} title={copy.noAnnouncements} />
        )}
      </View>
    </View>
  );
}

// ───────────── الأعضاء ─────────────

export function MembersTab({ committeeId, members, canManage, canOversee }: { committeeId: string; members: Member[]; canManage: boolean; canOversee: boolean }) {
  const router = useRouter();
  const { styles } = useStyles();
  return (
    <View style={styles.list}>
      {canManage ? <Button title={copy.manageMembers} icon={Users} variant="secondary" onPress={() => router.push(`/members?committeeId=${committeeId}`)} /> : null}
      {members.length ? (
        members.map((m) => <MemberCard key={m.id} member={m} showStats={canOversee} onPress={() => router.push(`/members/${m.id}`)} />)
      ) : (
        <EmptyState icon={Users} title={copy.noMembers} />
      )}
    </View>
  );
}

// ───────────── المشروعات ─────────────

export function ProjectsTab({ committeeId, projects, canManage }: { committeeId: string; projects: Project[]; canManage: boolean }) {
  const router = useRouter();
  const { styles } = useStyles();
  return (
    <View style={styles.tabContent}>
      <View style={styles.row}>
        <Button title={copy.allProjects} variant="outline" size="sm" icon={FolderKanban} onPress={() => router.push(`/projects?committeeId=${committeeId}`)} style={styles.rowButton} />
        {canManage ? <Button title={copy.newProject} size="sm" onPress={() => router.push(`/projects/new?committeeId=${committeeId}`)} style={styles.rowButton} /> : null}
      </View>
      {projects.length ? (
        projects.map((p) => <ProjectCard key={p.id} project={p} onPress={() => router.push(`/projects/${p.id}`)} />)
      ) : (
        <EmptyState icon={FolderKanban} title={copy.noProjects} />
      )}
    </View>
  );
}

// ───────────── الأنشطة ─────────────

export function ActivitiesTab({ committeeId, activities, canManage }: { committeeId: string; activities: Activity[]; canManage: boolean }) {
  const router = useRouter();
  const { styles } = useStyles();
  return (
    <View style={styles.tabContent}>
      <View style={styles.row}>
        <Button title={copy.allActivities} variant="outline" size="sm" icon={Sparkles} onPress={() => router.push(`/activities?committeeId=${committeeId}`)} style={styles.rowButton} />
        {canManage ? <Button title={copy.newActivity} size="sm" onPress={() => router.push(`/activities/new?committeeId=${committeeId}`)} style={styles.rowButton} /> : null}
      </View>
      {activities.length ? (
        activities.map((a) => <ActivityCard key={a.id} activity={a} onPress={() => router.push(`/activities/${a.id}`)} />)
      ) : (
        <EmptyState icon={Sparkles} title={copy.noActivities} />
      )}
    </View>
  );
}

// ───────────── المقترحات ─────────────

export function ProposalsTab({ committeeId, proposals, canSubmit }: { committeeId: string; proposals: Proposal[]; canSubmit: boolean }) {
  const router = useRouter();
  const { styles } = useStyles();
  return (
    <View style={styles.list}>
      {canSubmit ? <Button title={copy.submitProposal} icon={Lightbulb} variant="accent" onPress={() => router.push(`/proposals/new?committeeId=${committeeId}`)} /> : null}
      {proposals.length ? (
        proposals.map((p) => <ProposalCard key={p.id} proposal={p} showCommittee={false} onPress={() => router.push(`/proposals/${p.id}`)} />)
      ) : (
        <EmptyState icon={Lightbulb} title={copy.noProposals} />
      )}
    </View>
  );
}

// ───────────── التقارير ─────────────

export function ReportsTab({
  committeeId,
  stats,
  reports,
  canReports,
  canManage,
}: {
  committeeId: string;
  stats: CommitteeStats;
  reports: CommitteeReport[];
  canReports: boolean;
  canManage: boolean;
}) {
  const router = useRouter();
  const { styles } = useStyles();
  return (
    <View style={styles.tabContent}>
      {canReports ? (
        <>
          <StatGrid>
            <StatCard label={copy.pendingProposals} value={stats.proposalsPending} icon={Lightbulb} tone="warning" />
            <StatCard label={copy.completedProposals} value={stats.proposalsCompleted} icon={CircleCheck} tone="success" />
            <StatCard label={copy.activeProjects} value={stats.activeProjects} icon={FolderKanban} tone="primary" hint={copy.avgProgress(stats.projectsProgress)} />
            <StatCard label={copy.openFeedback} value={stats.feedbackOpen} icon={MessageSquare} tone="purple" />
          </StatGrid>
          <View style={styles.row}>
            <Button title={copy.detailedReport} icon={ChartColumn} variant="secondary" onPress={() => router.push(`/report/committee/${committeeId}`)} style={styles.rowButton} />
            {canManage ? <Button title={copy.newReport} onPress={() => router.push(`/report/new?committeeId=${committeeId}`)} style={styles.rowButton} /> : null}
          </View>
          <SectionHeader title={copy.reportsTitle} count={reports.length} />
          {reports.length ? (
            reports.map((r) => <ReportCard key={r.id} report={r} onPress={() => router.push(`/report/${r.id}`)} />)
          ) : (
            <EmptyState compact title={copy.noReports} />
          )}
        </>
      ) : (
        <>
          <InlineNote text={copy.publicSummaryNote} />
          <StatGrid>
            <StatCard label={copy.totalProjects} value={stats.totalProjects} icon={FolderKanban} tone="primary" />
            <StatCard label={copy.completedProjects} value={stats.completedProjects} icon={CircleCheck} tone="success" />
            <StatCard label={copy.activitiesAndEvents} value={stats.activities} icon={Sparkles} tone="purple" />
            <StatCard label={copy.upcomingMeetings} value={stats.upcomingMeetings} icon={CalendarDays} tone="info" />
          </StatGrid>
        </>
      )}
    </View>
  );
}
