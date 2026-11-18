import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { CalendarDays, CalendarPlus, ChevronLeft, Landmark, Lightbulb, MapPin, Sparkles, Wallet } from 'lucide-react-native';
import {
  ActivityCard,
  AppText,
  Card,
  CommitteeIcon,
  EmptyState,
  MeetingCard,
  PressableScale,
  ProgressBar,
  ProposalCard,
  QuickAction,
  QuickActionGrid,
  SectionHeader,
} from '@/components';
import { isUpcomingMeeting, projectFinance, sumFinance, useAppStore, useStats, useUser } from '@/store';
import { colors, radius, spacing } from '@/theme';
import type { Activity, Proposal } from '@/types';
import { formatCurrency, formatPercent } from '@/utils/format';
import { canCreateMeeting, canSubmitAnyProposal, canViewMeeting, canViewProposal } from '@/utils/permissions';

const section = { marginTop: spacing.xl };

/** Upcoming (and live) meetings the user can see. */
export function UpcomingMeetings({ limit = 2 }: { limit?: number }) {
  const router = useRouter();
  const user = useUser();
  const meetings = useAppStore((s) => s.meetings);
  const list = useMemo(
    () =>
      meetings
        .filter((m) => isUpcomingMeeting(m) && canViewMeeting(user, m))
        .sort((a, b) => (a.status === 'live' ? -1 : b.status === 'live' ? 1 : a.date.localeCompare(b.date))),
    [meetings, user],
  );
  return (
    <View style={section}>
      <SectionHeader title="الاجتماعات القادمة" icon={CalendarDays} count={list.length} onAction={() => router.navigate('/meetings')} />
      {list.length ? (
        <View style={styles.list}>
          {list.slice(0, limit).map((m) => (
            <MeetingCard key={m.id} meeting={m} onPress={() => router.push(`/meetings/${m.id}`)} />
          ))}
        </View>
      ) : (
        <Card>
          <EmptyState compact icon={CalendarDays} title="لا توجد اجتماعات قادمة" />
        </Card>
      )}
    </View>
  );
}

/** A short list of proposals; `filter` narrows the visible ones. */
export function ProposalsSection({
  title,
  filter,
  limit = 3,
  emptyText = 'لا توجد مقترحات',
}: {
  title: string;
  filter?: (p: Proposal) => boolean;
  limit?: number;
  emptyText?: string;
}) {
  const router = useRouter();
  const user = useUser();
  const proposals = useAppStore((s) => s.proposals);
  const list = useMemo(
    () => proposals.filter((p) => canViewProposal(user, p) && (!filter || filter(p))).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    [proposals, user, filter],
  );
  return (
    <View style={section}>
      <SectionHeader title={title} icon={Lightbulb} count={list.length} onAction={() => router.navigate('/proposals')} />
      {list.length ? (
        <View style={styles.list}>
          {list.slice(0, limit).map((p) => (
            <ProposalCard key={p.id} proposal={p} onPress={() => router.push(`/proposals/${p.id}`)} />
          ))}
        </View>
      ) : (
        <Card>
          <EmptyState compact icon={Lightbulb} title={emptyText} />
        </Card>
      )}
    </View>
  );
}

/** Recent committee activities (all committees by default — activities are public). */
export function ActivitiesSection({ title = 'أحدث أنشطة اللجان', filter, limit = 2 }: { title?: string; filter?: (a: Activity) => boolean; limit?: number }) {
  const router = useRouter();
  const activities = useAppStore((s) => s.activities);
  const list = useMemo(() => activities.filter((a) => !filter || filter(a)).sort((a, b) => b.date.localeCompare(a.date)), [activities, filter]);
  return (
    <View style={section}>
      <SectionHeader title={title} icon={Sparkles} onAction={() => router.push('/activities')} />
      {list.length ? (
        <View style={styles.list}>
          {list.slice(0, limit).map((a) => (
            <ActivityCard key={a.id} activity={a} onPress={() => router.push(`/activities/${a.id}`)} />
          ))}
        </View>
      ) : (
        <Card>
          <EmptyState compact icon={Sparkles} title="لا توجد أنشطة" />
        </Card>
      )}
    </View>
  );
}

/** Compact rows for the committees a person is linked to. */
export function CommitteesSection({ title, committeeIds }: { title: string; committeeIds: string[] }) {
  const router = useRouter();
  const committees = useAppStore((s) => s.committees);
  const list = committees.filter((c) => committeeIds.includes(c.id));
  if (!list.length) return null;
  return (
    <View style={section}>
      <SectionHeader title={title} onAction={() => router.navigate('/committees')} actionLabel="كل اللجان" />
      <Card padded={false}>
        {list.map((c, i) => (
          <CommitteeRow key={c.id} committeeId={c.id} last={i === list.length - 1} />
        ))}
      </Card>
    </View>
  );
}

function CommitteeRow({ committeeId, last }: { committeeId: string; last: boolean }) {
  const router = useRouter();
  const committee = useAppStore((s) => s.committees.find((c) => c.id === committeeId));
  const stats = useStats([committeeId]);
  if (!committee) return null;
  return (
    <PressableScale onPress={() => router.push(`/committee/${committee.id}`)} style={[styles.row, !last && styles.rowBorder]} accessibilityLabel={committee.name}>
      <CommitteeIcon committee={committee} size={34} />
      <View style={{ flex: 1 }}>
        <AppText variant="bodyMedium" numberOfLines={1}>
          {committee.name}
        </AppText>
        <AppText variant="meta" color={colors.textSecondary}>
          {`${stats.proposalsPending} مقترحات معلقة • ${stats.activeProjects} مشروعات نشطة • ${stats.upcomingActivities} أنشطة قادمة`}
        </AppText>
      </View>
      <ChevronLeft size={16} color={colors.textMuted} />
    </PressableScale>
  );
}

/** Aggregated finance card for authorized leadership. */
export function FinanceSummaryCard() {
  const router = useRouter();
  const projects = useAppStore((s) => s.projects);
  const total = useMemo(() => sumFinance(projects), [projects]);
  const overBudget = useMemo(() => projects.filter((p) => projectFinance(p).remaining < 0).length, [projects]);
  return (
    <View style={section}>
      <SectionHeader title="الملخص المالي" icon={Wallet} actionLabel="التفاصيل" onAction={() => router.push('/finance')} />
      <Card onPress={() => router.push('/finance')} accessibilityLabel="الملخص المالي">
        <View style={styles.financeRow}>
          <FinanceFigure label="الميزانية" value={formatCurrency(total.budget)} />
          <FinanceFigure label="المصروف" value={formatCurrency(total.spent)} />
          <FinanceFigure label="المتبقي" value={formatCurrency(total.remaining)} />
        </View>
        <ProgressBar value={Math.min(100, total.percent)} height={8} style={{ marginTop: spacing.md }} />
        <AppText variant="meta" color={colors.textSecondary} style={{ marginTop: 4 }}>
          {`نسبة الصرف ${formatPercent(total.percent)}${overBudget ? ` • ${overBudget} مشروع تجاوز الميزانية` : ''}`}
        </AppText>
      </Card>
    </View>
  );
}

function FinanceFigure({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flex: 1 }}>
      <AppText variant="meta" color={colors.textSecondary}>
        {label}
      </AppText>
      <AppText variant="bodyBold" numberOfLines={1}>
        {value}
      </AppText>
    </View>
  );
}

/** Assigned governorates as chips with activity / proposal counts. */
export function GovernoratesSection({ governorateIds }: { governorateIds: string[] }) {
  const router = useRouter();
  const governorates = useAppStore((s) => s.governorates);
  const activities = useAppStore((s) => s.activities);
  const proposals = useAppStore((s) => s.proposals);
  const list = governorates.filter((g) => governorateIds.includes(g.id));
  return (
    <View style={section}>
      <SectionHeader title="المحافظات المسندة إليك" icon={MapPin} count={list.length} onAction={() => router.push('/governorates')} />
      {list.length ? (
        <View style={styles.chips}>
          {list.map((g) => {
            const n = activities.filter((a) => a.governorateId === g.id).length + proposals.filter((p) => p.governorateId === g.id).length;
            return (
              <PressableScale key={g.id} onPress={() => router.push(`/governorates/${g.id}`)} style={styles.chip} accessibilityLabel={g.name}>
                <Landmark size={14} color={colors.navy2} />
                <AppText variant="captionMedium">{g.name}</AppText>
                {n ? (
                  <AppText variant="meta" color={colors.textSecondary}>
                    {`(${n})`}
                  </AppText>
                ) : null}
              </PressableScale>
            );
          })}
        </View>
      ) : (
        <Card>
          <EmptyState compact icon={MapPin} title="لا توجد محافظات مسندة إليك" message="يمكن لمدير النظام إسناد المحافظات من شاشة المحافظات." />
        </Card>
      )}
    </View>
  );
}

/** New proposal / new meeting, shown only when permitted. */
export function QuickActions({ committeeId }: { committeeId?: string }) {
  const router = useRouter();
  const user = useUser();
  const proposal = canSubmitAnyProposal(user);
  const meeting = canCreateMeeting(user);
  if (!proposal && !meeting) return null;
  const q = committeeId ? `?committeeId=${committeeId}` : '';
  return (
    <View style={section}>
      <QuickActionGrid columns={proposal && meeting ? 3 : 3}>
        {proposal ? <QuickAction icon={Lightbulb} label="تقديم مقترح" tone="gold" onPress={() => router.push(`/proposals/new${q}`)} /> : null}
        {meeting ? <QuickAction icon={CalendarPlus} label="اجتماع جديد" tone="navy" onPress={() => router.push(`/meetings/new${q}`)} /> : null}
        <QuickAction icon={Sparkles} label="الأنشطة" tone="purple" onPress={() => router.push('/activities')} />
      </QuickActionGrid>
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm + 2, paddingHorizontal: spacing.md, paddingVertical: spacing.sm + 2 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  financeRow: { flexDirection: 'row', gap: spacing.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.pill,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
