import { useMemo, useState } from 'react';
import type { ChartDatum } from '@/components/ui/Charts';
import { chartPalette, colors } from '@/theme';
import { PROJECT_STATUS } from '@/features/projects/services/labels';
import { PROPOSAL_STATUS } from '@/features/proposals/services/labels';
import { useAppStore } from '@/context/appStore';
import { type CommitteeStats, computeStats } from '@/features/committees/services/stats';
import type { Committee } from '@/features/committees/types';
import type { ProjectStatus } from '@/features/projects/types';
import type { ProposalStatus } from '@/features/proposals/types';

export type PeriodKey = 'all' | '30' | '90';

export const PERIOD_LABELS: Record<PeriodKey, string> = {
  all: 'كل الفترات',
  '30': 'آخر 30 يوماً',
  '90': 'آخر 90 يوماً',
};

export interface ReportData {
  stats: CommitteeStats;
  proposalDonut: ChartDatum[];
  projectStatusBar: ChartDatum[];
  progressByCommittee: ChartDatum[];
  activityByCommittee: ChartDatum[];
  openRequests: number;
  reportsAwaitingReview: number;
}

const PROPOSAL_COLORS: Record<ProposalStatus, string> = {
  new: colors.info,
  under_review: colors.warning,
  approved: colors.success,
  rejected: colors.error,
  in_progress: colors.primary,
  completed: colors.purple,
};

/**
 * Aggregated operational report data for a set of committees — derived live from the store
 * so every chart updates as soon as mock data changes. No individual scoring is computed.
 */
export function useReportData(committeeIds: string[], period: PeriodKey = 'all'): ReportData {
  const members = useAppStore((s) => s.members);
  const projects = useAppStore((s) => s.projects);
  const proposals = useAppStore((s) => s.proposals);
  const feedback = useAppStore((s) => s.feedback);
  const meetings = useAppStore((s) => s.meetings);
  const activities = useAppStore((s) => s.activities);
  const requests = useAppStore((s) => s.requests);
  const reports = useAppStore((s) => s.reports);
  const committees = useAppStore((s) => s.committees);
  const key = committeeIds.join('|');
  // Reference time captured once per mount so period filters stay stable across renders.
  const [now] = useState(() => Date.now());

  return useMemo(() => {
    const cutoff = period === 'all' ? 0 : now - Number(period) * 86400000;
    const recent = <T extends { createdAt: string }>(list: T[]) => (cutoff ? list.filter((x) => new Date(x.createdAt).getTime() >= cutoff) : list);
    const inScope = (id: string | null) => !!id && committeeIds.includes(id);

    const data = { members, projects, proposals: recent(proposals), feedback: recent(feedback), meetings: recent(meetings), activities: recent(activities) };
    const stats = computeStats(data, committeeIds);

    const scopedProposals = data.proposals.filter((p) => inScope(p.committeeId));
    const proposalDonut: ChartDatum[] = (Object.keys(PROPOSAL_STATUS) as ProposalStatus[]).map((st) => ({
      label: PROPOSAL_STATUS[st].label,
      value: scopedProposals.filter((p) => p.status === st).length,
      color: PROPOSAL_COLORS[st],
    }));

    const projectStatuses: ProjectStatus[] = ['planned', 'in_progress', 'paused', 'completed'];
    const projectColors: Record<ProjectStatus, string> = { planned: colors.info, in_progress: colors.primary, paused: colors.warning, completed: colors.success };
    const scopedProjects = projects.filter((p) => inScope(p.committeeId));
    const projectStatusBar: ChartDatum[] = projectStatuses.map((st) => ({
      label: PROJECT_STATUS[st].label,
      value: scopedProjects.filter((p) => p.status === st).length,
      color: projectColors[st],
    }));

    const scopeCommittees: Committee[] = committees.filter((c) => inScope(c.id));
    const progressByCommittee: ChartDatum[] = scopeCommittees
      .map((c, i) => {
        const cp = projects.filter((p) => p.committeeId === c.id);
        return { label: c.shortName, value: cp.length ? Math.round(cp.reduce((acc, p) => acc + p.progress, 0) / cp.length) : 0, color: chartPalette[i % chartPalette.length] };
      })
      .sort((a, b) => b.value - a.value);

    const activityByCommittee: ChartDatum[] = scopeCommittees
      .map((c) => ({
        label: c.shortName,
        value: data.activities.filter((a) => a.committeeId === c.id).length + data.meetings.filter((m) => m.committeeId === c.id && m.status !== 'cancelled').length,
        color: c.color,
      }))
      .sort((a, b) => b.value - a.value);

    const openRequests = recent(requests).filter((r) => inScope(r.committeeId) && !['resolved', 'closed'].includes(r.status)).length;
    const reportsAwaitingReview = reports.filter((r) => inScope(r.committeeId) && r.status === 'submitted').length;

    return { stats, proposalDonut, projectStatusBar, progressByCommittee, activityByCommittee, openRequests, reportsAwaitingReview };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [members, projects, proposals, feedback, meetings, activities, requests, reports, committees, key, period]);
}
