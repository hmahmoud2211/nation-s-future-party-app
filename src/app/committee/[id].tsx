import React, { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  CalendarDays,
  ChartColumn,
  CircleCheck,
  FolderKanban,
  Lightbulb,
  LayoutGrid,
  Megaphone,
  MessageSquare,
  Sparkles,
  Users,
} from 'lucide-react-native';
import {
  ActivityCard,
  AnnouncementCard,
  AppHeader,
  AppText,
  Badge,
  Button,
  Card,
  CommitteeIcon,
  EmptyState,
  FilterChips,
  ProposalCard,
  MeetingCard,
  MemberCard,
  ProjectCard,
  ReportCard,
  ScreenContainer,
  SectionHeader,
  StatCard,
  StatGrid,
} from '@/components';
import { InlineNote, ManagementActions } from '@/features/committees/shared';
import { isRegularMemberOf, isUpcomingMeeting, useAppStore, useCommittee, useCommitteeOfficials, useStats, useUser } from '@/store';
import { colors, radius, spacing } from '@/theme';
import { formatPercent, shortName } from '@/utils/format';
import { canManageCommittee, canOverseeCommittee, canSeeAnnouncement, canSubmitProposal, canViewCommitteeReports, canViewProposal } from '@/utils/permissions';

type Tab = 'overview' | 'proposals' | 'projects' | 'activities' | 'members' | 'reports';

export default function CommitteeDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const user = useUser();
  const committee = useCommittee(id);
  const officials = useCommitteeOfficials(committee?.id);
  const [tab, setTab] = useState<Tab>('overview');

  const members = useAppStore((s) => s.members);
  const projects = useAppStore((s) => s.projects);
  const activities = useAppStore((s) => s.activities);
  const proposals = useAppStore((s) => s.proposals);
  const reports = useAppStore((s) => s.reports);
  const meetings = useAppStore((s) => s.meetings);
  const announcements = useAppStore((s) => s.announcements);
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
      <ScreenContainer header={<AppHeader title="تفاصيل اللجنة" />}>
        <EmptyState icon={LayoutGrid} title="اللجنة غير موجودة" message="ربما تم حذفها أو تعطيلها." actionLabel="العودة للجان" onAction={() => router.replace('/committees')} />
      </ScreenContainer>
    );
  }

  const canReports = canViewCommitteeReports(user, committee.id);
  const tabOptions: { key: Tab; label: string; count?: number }[] = [
    { key: 'overview', label: 'نظرة عامة' },
    { key: 'proposals', label: 'المقترحات', count: data.cProposals.length },
    { key: 'projects', label: 'المشروعات', count: data.cProjects.length },
    { key: 'activities', label: 'الأنشطة', count: data.cActivities.length },
    { key: 'members', label: 'الأعضاء', count: data.cMembers.length },
    ...(canReports ? [{ key: 'reports' as Tab, label: 'التقارير' }] : []),
  ];

  return (
    <ScreenContainer
      header={
        <AppHeader title={committee.name} eyebrow="تفاصيل اللجنة">
          <View style={styles.headCard}>
            <View style={styles.iconBg}>
              <CommitteeIcon committee={committee} size={46} />
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <AppText variant="meta" color={colors.goldLight}>
                {officials.length > 1 ? 'مسؤولو اللجنة' : 'مسؤول اللجنة'}
              </AppText>
              <AppText variant="cardTitle" color={colors.white} numberOfLines={3}>
                {officials.length ? officials.map((o) => shortName(o.name)).join('، ') : 'لم يُعيَّن بعد'}
              </AppText>
              <AppText variant="meta" color="rgba(255,255,255,0.7)">
                {`${stats.members} عضو • ${stats.activeProjects} مشروع نشط`}
              </AppText>
            </View>
            {!committee.enabled ? <Badge label="معطلة" tone="neutral" solid /> : canManage ? <Badge label="أنت المسؤول" tone="gold" solid /> : null}
          </View>
        </AppHeader>
      }
    >
      {canManage ? (
        <View style={{ marginBottom: spacing.xl }}>
          <SectionHeader title="إجراءات الإدارة" icon={LayoutGrid} />
          <ManagementActions committeeId={committee.id} />
        </View>
      ) : null}

      <FilterChips options={tabOptions} value={tab} onChange={setTab} style={{ marginBottom: spacing.lg }} />

      {tab === 'overview' ? (
        <View style={{ gap: spacing.xl }}>
          <Card>
            <AppText variant="cardTitle" style={{ marginBottom: spacing.xs }}>
              عن اللجنة
            </AppText>
            <AppText variant="body" color={colors.textSecondary}>
              {committee.description}
            </AppText>
          </Card>

          <StatGrid>
            <StatCard label="أعضاء اللجنة" value={stats.members} icon={Users} tone="navy" onPress={() => setTab('members')} />
            <StatCard label="المشروعات النشطة" value={stats.activeProjects} icon={FolderKanban} tone="success" onPress={() => setTab('projects')} />
            <StatCard label="الأنشطة الجارية والقادمة" value={stats.upcomingActivities} icon={Sparkles} tone="purple" onPress={() => setTab('activities')} />
            <StatCard label="الاجتماعات القادمة" value={stats.upcomingMeetings} icon={CalendarDays} tone="info" onPress={() => router.push(`/meetings?committeeId=${committee.id}`)} />
          </StatGrid>

          {officials.length ? (
            <View>
              <SectionHeader title={officials.length > 1 ? 'مسؤولو اللجنة' : 'مسؤول اللجنة'} count={officials.length > 1 ? officials.length : undefined} />
              <View style={{ gap: spacing.sm }}>
                {officials.map((o) => (
                  <MemberCard key={o.id} member={o} showStats={false} onPress={() => router.push(`/members/${o.id}`)} />
                ))}
              </View>
            </View>
          ) : null}

          <View>
            <SectionHeader title="الاجتماعات القادمة" icon={CalendarDays} onAction={() => router.push(`/meetings?committeeId=${committee.id}`)} />
            {data.upcoming.length ? (
              <View style={{ gap: spacing.sm }}>
                {data.upcoming.slice(0, 3).map((m) => (
                  <MeetingCard key={m.id} meeting={m} onPress={() => router.push(`/meetings/${m.id}`)} />
                ))}
              </View>
            ) : (
              <EmptyState compact icon={CalendarDays} title="لا توجد اجتماعات قادمة" />
            )}
          </View>

          <View>
            <SectionHeader title="أحدث الإعلانات" icon={Megaphone} onAction={() => router.push('/announcements')} />
            {data.cAnnouncements.length ? (
              <View style={{ gap: spacing.sm }}>
                {data.cAnnouncements.slice(0, 3).map((a) => (
                  <AnnouncementCard key={a.id} announcement={a} onPress={() => router.push(`/announcements/${a.id}`)} />
                ))}
              </View>
            ) : (
              <EmptyState compact icon={Megaphone} title="لا توجد إعلانات لهذه اللجنة" />
            )}
          </View>
        </View>
      ) : null}

      {tab === 'members' ? (
        <View style={{ gap: spacing.sm }}>
          {canManage ? (
            <Button title="إدارة أعضاء اللجنة" icon={Users} variant="secondary" onPress={() => router.push(`/members?committeeId=${committee.id}`)} />
          ) : null}
          {data.cMembers.length ? (
            data.cMembers.map((m) => <MemberCard key={m.id} member={m} showStats={canOversee} onPress={() => router.push(`/members/${m.id}`)} />)
          ) : (
            <EmptyState icon={Users} title="لا يوجد أعضاء في هذه اللجنة بعد" />
          )}
        </View>
      ) : null}

      {tab === 'projects' ? (
        <View style={{ gap: spacing.md }}>
          <View style={styles.row}>
            <Button title="عرض كل المشروعات" variant="outline" size="sm" icon={FolderKanban} onPress={() => router.push(`/projects?committeeId=${committee.id}`)} style={{ flex: 1 }} />
            {canManage ? (
              <Button title="مشروع جديد" size="sm" onPress={() => router.push(`/projects/new?committeeId=${committee.id}`)} style={{ flex: 1 }} />
            ) : null}
          </View>
          {data.cProjects.length ? (
            data.cProjects.map((p) => <ProjectCard key={p.id} project={p} onPress={() => router.push(`/projects/${p.id}`)} />)
          ) : (
            <EmptyState icon={FolderKanban} title="لا توجد مشروعات بعد" />
          )}
        </View>
      ) : null}

      {tab === 'activities' ? (
        <View style={{ gap: spacing.md }}>
          <View style={styles.row}>
            <Button title="عرض كل الأنشطة" variant="outline" size="sm" icon={Sparkles} onPress={() => router.push(`/activities?committeeId=${committee.id}`)} style={{ flex: 1 }} />
            {canManage ? (
              <Button title="نشاط جديد" size="sm" onPress={() => router.push(`/activities/new?committeeId=${committee.id}`)} style={{ flex: 1 }} />
            ) : null}
          </View>
          {data.cActivities.length ? (
            data.cActivities.map((a) => <ActivityCard key={a.id} activity={a} onPress={() => router.push(`/activities/${a.id}`)} />)
          ) : (
            <EmptyState icon={Sparkles} title="لا توجد أنشطة بعد" />
          )}
        </View>
      ) : null}

      {tab === 'proposals' ? (
        <View style={{ gap: spacing.sm }}>
          {canSubmitProposal(user, committee.id) ? (
            <Button title="تقديم مقترح" icon={Lightbulb} variant="gold" onPress={() => router.push(`/proposals/new?committeeId=${committee.id}`)} />
          ) : null}
          {data.cProposals.length ? (
            data.cProposals.map((p) => <ProposalCard key={p.id} proposal={p} showCommittee={false} onPress={() => router.push(`/proposals/${p.id}`)} />)
          ) : (
            <EmptyState icon={Lightbulb} title="لا توجد مقترحات متاحة لك في هذه اللجنة" />
          )}
        </View>
      ) : null}

      {tab === 'reports' ? (
        <View style={{ gap: spacing.md }}>
          {canReports ? (
            <>
              <StatGrid>
                <StatCard label="مقترحات معلقة" value={stats.proposalsPending} icon={Lightbulb} tone="warning" />
                <StatCard label="مقترحات منجزة" value={stats.proposalsCompleted} icon={CircleCheck} tone="success" />
                <StatCard label="مشروعات نشطة" value={stats.activeProjects} icon={FolderKanban} tone="navy" hint={`متوسط الإنجاز ${formatPercent(stats.projectsProgress)}`} />
                <StatCard label="ملاحظات تحتاج متابعة" value={stats.feedbackOpen} icon={MessageSquare} tone="purple" />
              </StatGrid>
              <View style={styles.row}>
                <Button title="تقرير إحصائي مفصل" icon={ChartColumn} variant="secondary" onPress={() => router.push(`/report/committee/${committee.id}`)} style={{ flex: 1 }} />
                {canManage ? <Button title="تقرير جديد" onPress={() => router.push(`/report/new?committeeId=${committee.id}`)} style={{ flex: 1 }} /> : null}
              </View>
              <SectionHeader title="تقارير اللجنة" count={data.cReports.length} />
              {data.cReports.length ? (
                data.cReports.map((r) => <ReportCard key={r.id} report={r} onPress={() => router.push(`/report/${r.id}`)} />)
              ) : (
                <EmptyState compact title="لم تُقدَّم تقارير بعد" />
              )}
            </>
          ) : (
            <>
              <InlineNote text="ملخص عام لنشاط اللجنة — التقارير التفصيلية متاحة لقيادة اللجنة والقطاع." />
              <StatGrid>
                <StatCard label="إجمالي المشروعات" value={stats.totalProjects} icon={FolderKanban} tone="navy" />
                <StatCard label="المشروعات المكتملة" value={stats.completedProjects} icon={CircleCheck} tone="success" />
                <StatCard label="الأنشطة والفعاليات" value={stats.activities} icon={Sparkles} tone="purple" />
                <StatCard label="الاجتماعات القادمة" value={stats.upcomingMeetings} icon={CalendarDays} tone="info" />
              </StatGrid>
            </>
          )}
        </View>
      ) : null}
    </ScreenContainer>
  );
}


const styles = StyleSheet.create({
  headCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  iconBg: { backgroundColor: colors.white, borderRadius: radius.md, padding: 3 },
  row: { flexDirection: 'row', gap: spacing.sm },
  mini: { backgroundColor: colors.white, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, paddingVertical: spacing.md, paddingHorizontal: spacing.xs },
});
