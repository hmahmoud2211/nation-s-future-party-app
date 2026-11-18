import React, { useCallback, useMemo } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Building2, CalendarDays, FolderKanban, Lightbulb, Plus } from 'lucide-react-native';
import { AppText, Button, Card, CommitteeIcon, DemoNotice, ScreenContainer, StatCard, StatGrid } from '@/components';
import { isUpcomingMeeting, PENDING_PROPOSAL_STATUSES, useAppStore, useStats, useUser } from '@/store';
import { colors, spacing } from '@/theme';
import type { Activity, Proposal } from '@/types';
import { canViewMeeting, inGovernorateScope, relevantCommitteeIds } from '@/utils/permissions';
import { HomeHero } from './HomeHero';
import {
  ActivitiesSection,
  CommitteesSection,
  FinanceSummaryCard,
  GovernoratesSection,
  ProposalsSection,
  QuickActions,
  UpcomingMeetings,
} from './widgets';

// ───────────── الأمين / مدير النظام ─────────────

export function SecretaryDashboard() {
  const router = useRouter();
  const user = useUser();
  const committees = useAppStore((s) => s.committees);
  const projects = useAppStore((s) => s.projects);
  const proposals = useAppStore((s) => s.proposals);
  const meetings = useAppStore((s) => s.meetings);
  const pending = proposals.filter((p) => PENDING_PROPOSAL_STATUSES.includes(p.status)).length;
  const upcoming = meetings.filter((m) => isUpcomingMeeting(m) && canViewMeeting(user, m)).length;
  const pendingFilter = useCallback((p: Proposal) => PENDING_PROPOSAL_STATUSES.includes(p.status), []);

  return (
    <ScreenContainer header={<HomeHero subtitle="أمانة قطاع الأعمال المركزية" />}>
      <StatGrid>
        <StatCard icon={Building2} tone="navy" label="اللجان" value={committees.filter((c) => c.enabled).length} onPress={() => router.navigate('/committees')} />
        <StatCard icon={FolderKanban} tone="success" label="مشروعات نشطة" value={projects.filter((p) => p.status === 'in_progress').length} onPress={() => router.push('/projects')} />
        <StatCard icon={Lightbulb} tone="warning" label="مقترحات بانتظار القرار" value={pending} onPress={() => router.navigate('/proposals')} />
        <StatCard icon={CalendarDays} tone="info" label="اجتماعات قادمة" value={upcoming} onPress={() => router.navigate('/meetings')} />
      </StatGrid>
      <FinanceSummaryCard />
      <ProposalsSection title="بانتظار قرارك" filter={pendingFilter} emptyText="لا توجد مقترحات بانتظار القرار" />
      <UpcomingMeetings />
      <ActivitiesSection />
      <QuickActions />
    </ScreenContainer>
  );
}

// ───────────── الأمين المساعد ─────────────

export function AssistantDashboard() {
  const user = useUser();
  const committeeIds = useMemo(() => relevantCommitteeIds(user), [user]);
  const govFilter = useCallback((a: Activity) => inGovernorateScope(user, a.governorateId), [user]);
  const scopeFilter = useCallback((p: Proposal) => committeeIds.includes(p.committeeId) || inGovernorateScope(user, p.governorateId), [user, committeeIds]);
  return (
    <ScreenContainer header={<HomeHero subtitle={`${user.governorateIds.length} محافظات`} />}>
      <GovernoratesSection governorateIds={user.governorateIds} />
      <CommitteesSection title="لجانك" committeeIds={committeeIds} />
      <ProposalsSection title="مقترحات في نطاقك" filter={scopeFilter} emptyText="لا توجد مقترحات في لجانك أو محافظاتك" />
      <UpcomingMeetings />
      <ActivitiesSection title="أنشطة المحافظات" filter={govFilter} />
      <QuickActions committeeId={user.managedCommitteeIds[0]} />
      <DemoNotice style={{ marginTop: spacing.xl }} text="توزيع المحافظات على الأمناء المساعدين بيانات تجريبية للعرض." />
    </ScreenContainer>
  );
}

// ───────────── عضو الهيئة ─────────────

export function BoardDashboard() {
  const user = useUser();
  const committeeIds = relevantCommitteeIds(user);
  return (
    <ScreenContainer header={<HomeHero subtitle="هيئة مكتب أمانة قطاع الأعمال" />}>
      <QuickActions committeeId={user.managedCommitteeIds[0]} />
      <CommitteesSection title="لجانك" committeeIds={committeeIds} />
      <ActivitiesSection />
      <ProposalsSection title="أحدث المقترحات" />
      <UpcomingMeetings />
    </ScreenContainer>
  );
}

// ───────────── مسؤول اللجنة ─────────────

export function ResponsibleDashboard() {
  const router = useRouter();
  const user = useUser();
  const committeeId = user.managedCommitteeIds[0];
  const committee = useAppStore((s) => s.committees.find((c) => c.id === committeeId));
  const stats = useStats(committeeId ? [committeeId] : []);
  const mine = useCallback((p: Proposal) => user.managedCommitteeIds.includes(p.committeeId), [user.managedCommitteeIds]);
  const committeeActivities = useCallback((a: Activity) => user.managedCommitteeIds.includes(a.committeeId), [user.managedCommitteeIds]);
  return (
    <ScreenContainer header={<HomeHero subtitle={committee?.name} />}>
      {committee ? (
        <Card onPress={() => router.push(`/committee/${committee.id}`)} accessibilityLabel={committee.name}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
            <CommitteeIcon committee={committee} size={40} />
            <View style={{ flex: 1 }}>
              <AppText variant="cardTitle">{committee.name}</AppText>
              <AppText variant="meta" color={colors.textSecondary}>
                {`${stats.proposalsTotal} مقترحات • ${stats.activeProjects} مشروعات نشطة • ${stats.upcomingActivities} أنشطة قادمة`}
              </AppText>
            </View>
          </View>
        </Card>
      ) : null}
      <Button title="تقديم مقترح جديد" icon={Plus} variant="gold" onPress={() => router.push(`/proposals/new${committeeId ? `?committeeId=${committeeId}` : ''}`)} style={{ marginTop: spacing.md }} />
      <ProposalsSection title="مقترحات اللجنة" filter={mine} emptyText="لم تُقدَّم مقترحات بعد" />
      <ActivitiesSection title="أنشطة اللجنة" filter={committeeActivities} />
      <UpcomingMeetings />
    </ScreenContainer>
  );
}

// ───────────── عضو ─────────────

export function MemberDashboard() {
  const user = useUser();
  const ids = user.committeeIds;
  const committeeNames = useAppStore((s) => s.committees.filter((c) => ids.includes(c.id)).map((c) => c.name).join('، '));
  const inMyCommittees = useCallback((p: Proposal) => ids.includes(p.committeeId), [ids]);
  const myActivities = useCallback((a: Activity) => ids.includes(a.committeeId), [ids]);
  const subtitle = useMemo(() => committeeNames || 'لم يتم تحديد لجنة', [committeeNames]);
  return (
    <ScreenContainer header={<HomeHero subtitle={subtitle} />}>
      <CommitteesSection title="لجنتك" committeeIds={ids} />
      <UpcomingMeetings />
      <ActivitiesSection title="أنشطة لجنتك" filter={myActivities} />
      <ProposalsSection title="مقترحات لجنتك" filter={inMyCommittees} />
    </ScreenContainer>
  );
}
