/**
 * Centralized, simulated role-based access control.
 * ⚠️ FRONTEND demo rules only — not a security boundary. A backend should enforce the same
 * matrix later: `ROLE_CAPABILITIES` (what a role can do anywhere) + the scoped checks below
 * (what a person can do in a given committee / governorate).
 *
 * Roles: الأمين (sector_secretary) · الأمين المساعد · عضو الهيئة · عضو · مدير النظام.
 * Committee responsibility (مسؤول اللجنة) is a permission attached to a person through
 * `managedCommitteeIds`, not a separate role.
 */
import type {
  AdminRequest,
  Committee,
  CommitteeReport,
  Feedback,
  Meeting,
  Member,
  Proposal,
  ProposalStatus,
  Role,
} from '@/types';
import { hasAnyRole, hasRole, isResponsible, LEADERSHIP_ROLES } from './roles';

export { LEADERSHIP_ROLES, isResponsible };

// ───────────── Capability matrix ─────────────

export type Capability =
  /** See every committee's internal data (all meetings, all reports…). */
  | 'org.viewAll'
  /** Budgets, expenses and the financial overview. */
  | 'finance.view'
  /** Decide on proposals (under review / approve / reject / progress). */
  | 'proposals.review'
  /** Browse every committee's proposals, whatever their status. */
  | 'proposals.viewAll'
  /** Organise meetings (general ones, or for committees in their scope). */
  | 'meetings.create'
  /** See every governorate. */
  | 'governorates.viewAll'
  /** Assign governorates to assistant secretaries. */
  | 'governorates.manage'
  /** Sector-wide reports & statistics. */
  | 'reports.viewAll'
  /** Publish sector-wide announcements. */
  | 'announcements.publishAll'
  | 'users.manage'
  | 'committees.manage'
  | 'settings.manage';

const SECRETARY: Capability[] = [
  'org.viewAll',
  'finance.view',
  'proposals.review',
  'proposals.viewAll',
  'meetings.create',
  'governorates.viewAll',
  'reports.viewAll',
  'announcements.publishAll',
];

export const ROLE_CAPABILITIES: Record<Role, readonly Capability[]> = {
  admin: [...SECRETARY, 'governorates.manage', 'users.manage', 'committees.manage', 'settings.manage'],
  sector_secretary: SECRETARY,
  assistant_secretary: ['proposals.viewAll', 'meetings.create', 'reports.viewAll'],
  board_member: ['proposals.viewAll', 'meetings.create', 'reports.viewAll'],
  member: [],
};

export function can(u: Member | null | undefined, capability: Capability): boolean {
  return !!u && ROLE_CAPABILITIES[u.role].includes(capability);
}

export const isAdmin = (u?: Member | null) => hasRole(u, 'admin');
export const isSecretary = (u?: Member | null) => hasRole(u, 'sector_secretary');
/** الأمين or system admin — complete organisational visibility. */
export const isSectorWide = (u?: Member | null) => can(u, 'org.viewAll');
export const isLeadership = (u?: Member | null) => hasAnyRole(u, LEADERSHIP_ROLES);
/** Plain member with no committee responsibility. */
export const isMemberRole = (u?: Member | null) => !!u && u.role === 'member' && !isResponsible(u);
/** Coordinates governorates (assistant secretaries). */
export const hasGovernorates = (u?: Member | null) => hasRole(u, 'assistant_secretary');

/** Which home dashboard a person sees. */
export type DashboardKind = 'secretary' | 'assistant' | 'board' | 'responsible' | 'member';

export function dashboardFor(u: Member): DashboardKind {
  if (isSectorWide(u)) return 'secretary';
  if (u.role === 'assistant_secretary') return 'assistant';
  if (u.role === 'board_member') return 'board';
  if (isResponsible(u)) return 'responsible';
  return 'member';
}

// ───────────── Committees ─────────────

export function isCommitteeMember(u: Member | null | undefined, committeeId: string): boolean {
  return !!u && (u.committeeIds.includes(committeeId) || u.managedCommitteeIds.includes(committeeId));
}

/** Committee responsibility: create / edit records (proposals, projects, activities, reports) in a committee. */
export function canManageCommittee(u: Member | null | undefined, committeeId: string): boolean {
  if (!u) return false;
  return isAdmin(u) || u.managedCommitteeIds.includes(committeeId);
}

/** Can see a committee's internal data (reports, all meetings). */
export function canOverseeCommittee(u: Member | null | undefined, committeeId: string): boolean {
  if (!u) return false;
  if (isSectorWide(u)) return true;
  if (hasRole(u, 'assistant_secretary') && u.supervisedCommitteeIds.includes(committeeId)) return true;
  return canManageCommittee(u, committeeId);
}

/** Committees a person oversees (dashboards, statistics). */
export function scopeCommitteeIds(u: Member | null | undefined, committees: Committee[]): string[] {
  if (!u) return [];
  if (isSectorWide(u)) return committees.map((c) => c.id);
  return Array.from(new Set([...u.supervisedCommitteeIds, ...u.managedCommitteeIds]));
}

/** The committees a person is linked to (member, responsible or supervisor). */
export function relevantCommitteeIds(u: Member | null | undefined): string[] {
  if (!u) return [];
  return Array.from(new Set([...u.managedCommitteeIds, ...u.supervisedCommitteeIds, ...u.committeeIds]));
}

// ───────────── Governorates ─────────────

export function canViewGovernorate(u: Member | null | undefined, governorateId: string): boolean {
  return can(u, 'governorates.viewAll') || (!!u && u.governorateIds.includes(governorateId));
}

/** Whether a record tied to a governorate falls inside an assistant secretary's governorates. */
export function inGovernorateScope(u: Member | null | undefined, governorateId?: string): boolean {
  return !!u && !!governorateId && u.governorateIds.includes(governorateId);
}

// ───────────── Proposals ─────────────

/** Statuses that represent achievements — visible to every user for transparency. */
export const PUBLIC_PROPOSAL_STATUSES: ProposalStatus[] = ['approved', 'in_progress', 'completed'];

/** Submit proposals: committee responsibility for that committee. */
export function canSubmitProposal(u: Member | null | undefined, committeeId: string): boolean {
  return canManageCommittee(u, committeeId);
}

/** Whether the person can submit proposals at all. */
export function canSubmitAnyProposal(u: Member | null | undefined): boolean {
  return !!u && (isAdmin(u) || isResponsible(u));
}

export function canViewProposal(u: Member | null | undefined, p: Proposal): boolean {
  if (!u) return false;
  return (
    can(u, 'proposals.viewAll') ||
    isCommitteeMember(u, p.committeeId) ||
    p.createdBy === u.id ||
    inGovernorateScope(u, p.governorateId) ||
    PUBLIC_PROPOSAL_STATUSES.includes(p.status)
  );
}

/** Next statuses the person may set — empty when they can't act. */
export function proposalTransitions(u: Member | null | undefined, p: Proposal): ProposalStatus[] {
  if (!u) return [];
  const reviewer = can(u, 'proposals.review') && p.createdBy !== u.id;
  const executor = canManageCommittee(u, p.committeeId);
  switch (p.status) {
    case 'new':
      return reviewer ? ['under_review', 'approved', 'rejected'] : [];
    case 'under_review':
      return reviewer ? ['approved', 'rejected'] : [];
    case 'approved':
      return reviewer || executor ? ['in_progress'] : [];
    case 'in_progress':
      return reviewer || executor ? ['completed'] : [];
    default:
      return [];
  }
}

// ───────────── Finance ─────────────

export const canViewFinance = (u?: Member | null) => can(u, 'finance.view');

// ───────────── Meetings ─────────────

export function canViewMeeting(u: Member | null | undefined, m: Meeting): boolean {
  if (!u) return false;
  return (
    isSectorWide(u) ||
    m.createdBy === u.id ||
    m.attendeeIds.includes(u.id) ||
    (!!m.committeeId && (isCommitteeMember(u, m.committeeId) || canOverseeCommittee(u, m.committeeId)))
  );
}

/** Organise meetings: leadership & board members, or anyone responsible for a committee. */
export function canCreateMeeting(u: Member | null | undefined): boolean {
  return can(u, 'meetings.create') || isResponsible(u);
}

/** General meetings (no committee) are for leadership and board members. */
export function canCreateGeneralMeeting(u: Member | null | undefined): boolean {
  return can(u, 'meetings.create');
}

/** Committees a person may attach a new meeting to. */
export function meetingCommitteeIds(u: Member | null | undefined, committees: Committee[]): string[] {
  if (!u) return [];
  if (isSectorWide(u)) return committees.filter((c) => c.enabled).map((c) => c.id);
  return Array.from(new Set([...u.managedCommitteeIds, ...u.supervisedCommitteeIds]));
}

/** Edit, cancel, start, end or write minutes: the organiser, الأمين/admin, or the committee's responsible. */
export function canManageMeeting(u: Member | null | undefined, m: Meeting): boolean {
  if (!u) return false;
  return m.createdBy === u.id || isSectorWide(u) || (!!m.committeeId && canManageCommittee(u, m.committeeId));
}

export function canStartConference(u: Member | null | undefined, m: Meeting): boolean {
  return m.mode === 'online' && m.status === 'scheduled' && canManageMeeting(u, m);
}

export function canJoinConference(u: Member | null | undefined, m: Meeting): boolean {
  return m.mode === 'online' && m.status === 'live' && canViewMeeting(u, m);
}

// ───────────── Feedback / requests / reports / announcements ─────────────

export function canHandleFeedback(u: Member | null | undefined, fb: Feedback): boolean {
  if (!u) return false;
  return fb.recipientId === u.id || canManageCommittee(u, fb.committeeId);
}

export function canViewFeedback(u: Member | null | undefined, fb: Feedback): boolean {
  if (!u) return false;
  return fb.authorId === u.id || canHandleFeedback(u, fb) || canOverseeCommittee(u, fb.committeeId);
}

export function canHandleRequest(u: Member | null | undefined, r: AdminRequest): boolean {
  if (!u) return false;
  return (
    isSectorWide(u) ||
    canManageCommittee(u, r.committeeId) ||
    (hasRole(u, 'assistant_secretary') && u.supervisedCommitteeIds.includes(r.committeeId))
  );
}

/** Read a committee's written reports and statistics. */
export function canViewCommitteeReports(u: Member | null | undefined, committeeId: string): boolean {
  if (!u) return false;
  return can(u, 'reports.viewAll') || canOverseeCommittee(u, committeeId);
}

export function canCreateCommitteeReport(u: Member | null | undefined, committeeId: string): boolean {
  return canManageCommittee(u, committeeId);
}

export function canReviewReport(u: Member | null | undefined, r: CommitteeReport): boolean {
  if (!u) return false;
  if (isSectorWide(u)) return true;
  return hasRole(u, 'assistant_secretary') && u.supervisedCommitteeIds.includes(r.committeeId);
}

export function canPublishAnnouncement(u: Member | null | undefined, committeeId: string | null): boolean {
  if (!u) return false;
  if (can(u, 'announcements.publishAll')) return true;
  if (committeeId === null) return false;
  return canManageCommittee(u, committeeId);
}

export function canPublishAnyAnnouncement(u: Member | null | undefined): boolean {
  return can(u, 'announcements.publishAll') || isResponsible(u);
}

/** Announcements visible to a user. */
export function canSeeAnnouncement(u: Member | null | undefined, committeeId: string | null): boolean {
  if (!u) return false;
  if (committeeId === null) return true;
  return isCommitteeMember(u, committeeId) || canOverseeCommittee(u, committeeId) || hasAnyRole(u, ['board_member', 'assistant_secretary']);
}
