import { useMemo } from 'react';
import type { Committee, Meeting, Member, Project, Proposal } from '@/types';
import { scopeCommitteeIds } from '@/utils/permissions';
import { ROLE_ORDER } from '@/utils/roles';
import { useAppStore } from './appStore';
import type { AppState } from './types';

/** Placeholder used for a split second after logout so screens never crash. */
const GUEST: Member = {
  id: 'guest',
  name: 'زائر',
  role: 'member',
  title: '',
  committeeIds: [],
  managedCommitteeIds: [],
  supervisedCommitteeIds: [],
  governorateIds: [],
  membershipNumber: '',
  status: 'active',
  joinDate: new Date(0).toISOString(),
  phone: '',
  email: '',
  avatarColor: '#0B2B68',
};

/** Current demo user (or a guest placeholder). */
export function useUser(): Member {
  return useAppStore((s) => s.members.find((m) => m.id === s.currentUserId)) ?? GUEST;
}

export function useIsLoggedIn(): boolean {
  return useAppStore((s) => !!s.currentUserId && s.members.some((m) => m.id === s.currentUserId));
}

/** People responsible for a committee — a committee can have several. */
export function useCommitteeOfficials(committeeId?: string): Member[] {
  const members = useAppStore((s) => s.members);
  return useMemo(() => (committeeId ? committeeOfficials(members, committeeId) : []), [members, committeeId]);
}

/** People responsible for a committee, highest role first. */
export function committeeOfficials(members: Member[], committeeId: string): Member[] {
  return members
    .filter((m) => m.managedCommitteeIds.includes(committeeId))
    .sort((a, b) => ROLE_ORDER.indexOf(a.role) - ROLE_ORDER.indexOf(b.role));
}

/** Regular members of a committee (excludes the people responsible for it). */
export function isRegularMemberOf(m: Member, committeeId: string): boolean {
  return m.committeeIds.includes(committeeId) && !m.managedCommitteeIds.includes(committeeId);
}

export function useMember(id?: string): Member | undefined {
  return useAppStore((s) => (id ? s.members.find((m) => m.id === id) : undefined));
}

export function useCommittee(id?: string | null): Committee | undefined {
  return useAppStore((s) => (id ? s.committees.find((c) => c.id === id) : undefined));
}

export function useMemberMap(): Record<string, Member> {
  const members = useAppStore((s) => s.members);
  return useMemo(() => Object.fromEntries(members.map((m) => [m.id, m])), [members]);
}

export function useCommitteeMap(): Record<string, Committee> {
  const committees = useAppStore((s) => s.committees);
  return useMemo(() => Object.fromEntries(committees.map((c) => [c.id, c])), [committees]);
}

export function useGovernorateMap() {
  const governorates = useAppStore((s) => s.governorates);
  return useMemo(() => Object.fromEntries(governorates.map((g) => [g.id, g])), [governorates]);
}

/** Committees the current user oversees (responsible / supervised / all). */
export function useScopeCommitteeIds(): string[] {
  const user = useUser();
  const committees = useAppStore((s) => s.committees);
  return useMemo(() => scopeCommitteeIds(user, committees), [user, committees]);
}

export function useMyNotifications() {
  const userId = useAppStore((s) => s.currentUserId);
  const notifications = useAppStore((s) => s.notifications);
  return useMemo(
    () =>
      notifications
        .filter((n) => n.recipientId === userId)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [notifications, userId],
  );
}

export function useUnreadCount(): number {
  return useAppStore((s) => s.notifications.reduce((acc, n) => acc + (n.recipientId === s.currentUserId && !n.read ? 1 : 0), 0));
}

// ───────────── Derived helpers (pure) ─────────────

export function isUpcomingMeeting(m: Meeting, now = Date.now()) {
  return m.status === 'live' || (m.status === 'scheduled' && new Date(m.date).getTime() >= now - 2 * 3600000);
}

export const sortByDateDesc = <T extends { createdAt: string }>(list: T[]) =>
  [...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

/** Proposals still waiting for a decision. */
export const PENDING_PROPOSAL_STATUSES: Proposal['status'][] = ['new', 'under_review'];

// ───────────── Finance ─────────────

export interface Finance {
  budget: number;
  spent: number;
  remaining: number;
  /** Share of the budget already spent (0–100+). */
  percent: number;
}

export function projectFinance(p: Pick<Project, 'budget' | 'expenses'>): Finance {
  const spent = p.expenses.reduce((acc, e) => acc + e.amount, 0);
  return { budget: p.budget, spent, remaining: p.budget - spent, percent: p.budget > 0 ? (spent / p.budget) * 100 : 0 };
}

export function sumFinance(projects: Pick<Project, 'budget' | 'expenses'>[]): Finance {
  const budget = projects.reduce((acc, p) => acc + p.budget, 0);
  const spent = projects.reduce((acc, p) => acc + projectFinance(p).spent, 0);
  return { budget, spent, remaining: budget - spent, percent: budget > 0 ? (spent / budget) * 100 : 0 };
}

// ───────────── Committee statistics ─────────────

export interface CommitteeStats {
  members: number;
  officials: number;
  activeProjects: number;
  completedProjects: number;
  totalProjects: number;
  /** Average progress of all projects (0–100). */
  projectsProgress: number;
  proposalsTotal: number;
  proposalsPending: number;
  proposalsApproved: number;
  proposalsCompleted: number;
  feedbackOpen: number;
  upcomingMeetings: number;
  activities: number;
  upcomingActivities: number;
  completedActivities: number;
}

/** Live statistics for one or more committees — never hardcoded. */
export function computeStats(
  state: Pick<AppState, 'members' | 'projects' | 'proposals' | 'feedback' | 'meetings' | 'activities'>,
  committeeIds: string[],
): CommitteeStats {
  const inScope = (id: string | null) => !!id && committeeIds.includes(id);
  const members = state.members.filter((m) => committeeIds.some((id) => isRegularMemberOf(m, id)));
  const officials = state.members.filter((m) => m.managedCommitteeIds.some(inScope));
  const projects = state.projects.filter((p) => inScope(p.committeeId));
  const proposals = state.proposals.filter((p) => inScope(p.committeeId));
  const feedback = state.feedback.filter((f) => inScope(f.committeeId));
  const meetings = state.meetings.filter((m) => inScope(m.committeeId));
  const activities = state.activities.filter((a) => inScope(a.committeeId));
  const now = Date.now();
  return {
    members: members.length,
    officials: officials.length,
    activeProjects: projects.filter((p) => p.status === 'in_progress').length,
    completedProjects: projects.filter((p) => p.status === 'completed').length,
    totalProjects: projects.length,
    projectsProgress: projects.length ? projects.reduce((acc, p) => acc + p.progress, 0) / projects.length : 0,
    proposalsTotal: proposals.length,
    proposalsPending: proposals.filter((p) => PENDING_PROPOSAL_STATUSES.includes(p.status)).length,
    proposalsApproved: proposals.filter((p) => p.status === 'approved' || p.status === 'in_progress').length,
    proposalsCompleted: proposals.filter((p) => p.status === 'completed').length,
    feedbackOpen: feedback.filter((f) => f.status === 'new' || f.status === 'under_review').length,
    upcomingMeetings: meetings.filter((m) => isUpcomingMeeting(m, now)).length,
    activities: activities.length,
    upcomingActivities: activities.filter((a) => a.status !== 'completed').length,
    completedActivities: activities.filter((a) => a.status === 'completed').length,
  };
}

/** Reactive stats hook. */
export function useStats(committeeIds: string[]): CommitteeStats {
  const members = useAppStore((s) => s.members);
  const projects = useAppStore((s) => s.projects);
  const proposals = useAppStore((s) => s.proposals);
  const feedback = useAppStore((s) => s.feedback);
  const meetings = useAppStore((s) => s.meetings);
  const activities = useAppStore((s) => s.activities);
  const key = committeeIds.join('|');
  return useMemo(
    () => computeStats({ members, projects, proposals, feedback, meetings, activities }, committeeIds),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [members, projects, proposals, feedback, meetings, activities, key],
  );
}
