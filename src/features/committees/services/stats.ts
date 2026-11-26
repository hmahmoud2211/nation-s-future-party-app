import type { AppState } from '@/types/store.types';
import { isUpcomingMeeting } from '@/features/meetings/services/meetingRules';
import { isRegularMemberOf } from '@/features/members/services/memberLookup';
import { PENDING_PROPOSAL_STATUSES } from '@/features/proposals/services/initiatives';

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
