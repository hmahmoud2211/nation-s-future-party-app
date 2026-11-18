/**
 * Domain models for the demo. Data lives in memory only.
 * IDs are plain strings; `seq` numbers are used to build human-friendly reference codes.
 */

export type ISODate = string;

// ───────────────────────────── Roles & members ─────────────────────────────

/**
 * Organisational roles (one per person):
 * - sector_secretary    → الأمين (Secretary-General) — full visibility, finance, decides on proposals
 * - assistant_secretary → الأمين المساعد — like a board member + governorate coordination
 * - board_member        → عضو الهيئة (Executive Board Member)
 * - member              → plain member (sample accounts)
 * - admin               → مدير النظام (platform administration)
 *
 * "Committee responsible" (مسؤول اللجنة) is NOT a role: it is a permission attached to any
 * person through `managedCommitteeIds`.
 */
export type Role = 'member' | 'board_member' | 'assistant_secretary' | 'sector_secretary' | 'admin';

export type MembershipStatus = 'active' | 'inactive' | 'suspended';

export interface Member {
  id: string;
  name: string;
  role: Role;
  /** Arabic position title, e.g. "الأمين المساعد • مسؤول لجنة الاستثمار" */
  title: string;
  /** Committees the person belongs to. Always includes the committees they are responsible for. */
  committeeIds: string[];
  /** Committee responsibility (مسؤول اللجنة) — committees this person runs. */
  managedCommitteeIds: string[];
  /** Committees an assistant secretary supervises. */
  supervisedCommitteeIds: string[];
  /** Governorates an assistant secretary coordinates (kept separate from committee membership). */
  governorateIds: string[];
  membershipNumber: string;
  status: MembershipStatus;
  joinDate: ISODate;
  /** Placeholder contact info — never real data. */
  phone: string;
  email: string;
  avatarColor: string;
  bio?: string;
}

export type DemoAccountGroup = 'leadership' | 'assistants' | 'bureau' | 'officials' | 'demo';

export interface DemoAccount {
  memberId: string;
  /** Arabic label shown in the account switcher. */
  label: string;
  /** Section the account is listed under in the login screen and switcher. */
  group: DemoAccountGroup;
  phone: string;
  password: string;
}

// ───────────────────────────── Shared building blocks ─────────────────────────────

export interface Attachment {
  id: string;
  name: string;
  size?: number;
  mimeType?: string;
  /** Local URI from the document picker — session only, never uploaded. */
  uri?: string;
  addedAt: ISODate;
  addedBy: string;
}

export interface TimelineEvent {
  id: string;
  /** Machine-friendly type used to pick an icon / tone. */
  type:
    | 'created'
    | 'updated'
    | 'submitted'
    | 'under_review'
    | 'approved'
    | 'rejected'
    | 'note'
    | 'started'
    | 'progress'
    | 'completed'
    | 'reopened'
    | 'closed'
    | 'replied'
    | 'assigned';
  label: string;
  actorId: string;
  note?: string;
  createdAt: ISODate;
}

export interface Comment {
  id: string;
  authorId: string;
  message: string;
  createdAt: ISODate;
  kind?: 'comment' | 'review' | 'system' | 'info_request';
  parentId?: string;
  attachments?: Attachment[];
}

// ───────────────────────────── Committees ─────────────────────────────

export type CommitteeIconKey =
  | 'investment'
  | 'industry'
  | 'realestate'
  | 'entrepreneurship'
  | 'trade'
  | 'tourism'
  | 'technology'
  | 'energy'
  | 'social'
  | 'studies'
  | 'markets';

export interface Committee {
  id: string;
  name: string;
  shortName: string;
  description: string;
  icon: CommitteeIconKey;
  color: string;
  /*
   * Responsible officials and supervisors are derived from members (`managedCommitteeIds` /
   * `supervisedCommitteeIds`), so a committee can have several of each.
   */
  enabled: boolean;
  createdAt: ISODate;
}

// ───────────────────────────── Governorates ─────────────────────────────

export interface Governorate {
  id: string;
  name: string;
  /** Broad region, used only for grouping in the UI. */
  region: string;
}

/** A governorate-level secretary or committee representative (a contact record, not an app user). */
export interface GovernorateContact {
  id: string;
  governorateId: string;
  name: string;
  /** e.g. "أمين أمانة المحافظة" / "ممثل لجنة الاستثمار" */
  title: string;
  /** What they are responsible for. */
  responsibilities: string;
  /** Optional committee they represent in the governorate. */
  committeeId?: string;
  /** Placeholder contact info. */
  phone: string;
}

// ───────────────────────────── Proposals ─────────────────────────────

export type ProposalStatus = 'new' | 'under_review' | 'approved' | 'rejected' | 'in_progress' | 'completed';

export interface Proposal {
  id: string;
  seq: number;
  title: string;
  /** Short description of the idea. */
  description: string;
  objective: string;
  committeeId: string;
  /** Optional governorate the proposal targets (lets assistant secretaries follow it). */
  governorateId?: string;
  createdBy: string;
  createdAt: ISODate;
  updatedAt: ISODate;
  status: ProposalStatus;
  /** Latest decision note from the reviewer. */
  reviewNote?: string;
  attachments: Attachment[];
  history: TimelineEvent[];
}

// ───────────────────────────── Projects ─────────────────────────────

export type ProjectStatus = 'planned' | 'in_progress' | 'paused' | 'completed';

export interface Milestone {
  id: string;
  title: string;
  dueDate: ISODate;
  done: boolean;
}

export interface Expense {
  id: string;
  label: string;
  amount: number;
  date: ISODate;
}

export interface Project {
  id: string;
  seq: number;
  title: string;
  description: string;
  committeeId: string;
  governorateId?: string;
  leadId: string;
  teamIds: string[];
  startDate: ISODate;
  endDate: ISODate;
  milestones: Milestone[];
  status: ProjectStatus;
  progress: number;
  /** Allocated budget (EGP). Financial fields are visible only with the `finance.view` permission. */
  budget: number;
  expenses: Expense[];
  comments: Comment[];
  createdBy: string;
  createdAt: ISODate;
  updatedAt: ISODate;
}

// ───────────────────────────── Feedback ─────────────────────────────

export type FeedbackStatus = 'new' | 'under_review' | 'replied' | 'closed';

export type FeedbackCategory = 'proposal' | 'project' | 'administrative';

export type FeedbackTopic = 'proposal_note' | 'project_note' | 'review_request' | 'data_error' | 'other';

export interface FeedbackMessage {
  id: string;
  authorId: string;
  message: string;
  createdAt: ISODate;
  kind?: 'message' | 'info_request' | 'system';
  attachments: Attachment[];
}

export interface Feedback {
  id: string;
  seq: number;
  category: FeedbackCategory;
  topic: FeedbackTopic;
  relatedEntityId?: string;
  committeeId: string;

  authorId: string;
  recipientId?: string;

  subject: string;
  status: FeedbackStatus;

  createdAt: ISODate;
  updatedAt: ISODate;

  /** messages[0] is the original message, the rest are replies (threaded). */
  messages: FeedbackMessage[];
  activity: TimelineEvent[];
}

// ───────────────────────────── Meetings & video conferencing ─────────────────────────────

export type RSVPStatus = 'going' | 'declined' | 'pending';
/** `live` = the organizer started the (online) meeting and participants can join. */
export type MeetingStatus = 'scheduled' | 'live' | 'completed' | 'cancelled';
export type MeetingMode = 'in_person' | 'online';

/** Video conference attached to an online meeting. Provider-agnostic so a real service can replace the mock. */
export interface ConferenceInfo {
  /** Provider id, e.g. "mock" today; a real provider later. */
  provider: string;
  roomId: string;
  startedAt?: ISODate;
  startedBy?: string;
  endedAt?: ISODate;
}

export interface Meeting {
  id: string;
  title: string;
  /** `null` = general meeting not tied to a committee. */
  committeeId: string | null;
  date: ISODate;
  durationMin: number;
  location: string;
  mode: MeetingMode;
  description?: string;
  agenda: string[];
  attendeeIds: string[];
  rsvps: Record<string, RSVPStatus>;
  minutes?: string;
  createdBy: string;
  status: MeetingStatus;
  conference?: ConferenceInfo;
  createdAt: ISODate;
}

// ───────────────────────────── Activities ─────────────────────────────

export type ActivityType = 'workshop' | 'forum' | 'visit' | 'initiative' | 'seminar' | 'training';
export type ActivityStatus = 'upcoming' | 'ongoing' | 'completed';

export interface Activity {
  id: string;
  title: string;
  description: string;
  committeeId: string;
  governorateId?: string;
  type: ActivityType;
  date: ISODate;
  location: string;
  status: ActivityStatus;
  progress: number;
  capacity?: number;
  registrations: string[];
  images: Attachment[];
  report?: string;
  createdBy: string;
  createdAt: ISODate;
}

// ───────────────────────────── Announcements ─────────────────────────────

export type AnnouncementPriority = 'normal' | 'important' | 'urgent';
export type AnnouncementCategory = 'general' | 'meeting' | 'event' | 'administrative';

export interface Announcement {
  id: string;
  title: string;
  body: string;
  /** null = sector-wide announcement */
  committeeId: string | null;
  priority: AnnouncementPriority;
  category: AnnouncementCategory;
  createdBy: string;
  createdAt: ISODate;
  readBy: string[];
  attachments: Attachment[];
}

// ───────────────────────────── Notifications ─────────────────────────────

export type NotificationType =
  | 'proposal_new'
  | 'proposal_update'
  | 'feedback_new'
  | 'feedback_reply'
  | 'meeting_new'
  | 'meeting_started'
  | 'announcement_new'
  | 'project_update'
  | 'request_update';

export interface AppNotification {
  id: string;
  recipientId: string;
  type: NotificationType;
  title: string;
  body: string;
  createdAt: ISODate;
  read: boolean;
  /** Expo Router href to open the related screen. */
  link?: string;
}

// ───────────────────────────── Administrative requests ─────────────────────────────

export type RequestType = 'data_update' | 'admin_inquiry' | 'document' | 'tech_support';
export type RequestStatus = 'new' | 'under_review' | 'info_requested' | 'resolved' | 'closed';

export interface AdminRequest {
  id: string;
  seq: number;
  type: RequestType;
  subject: string;
  description: string;
  authorId: string;
  committeeId: string;
  status: RequestStatus;
  createdAt: ISODate;
  updatedAt: ISODate;
  attachments: Attachment[];
  replies: FeedbackMessage[];
}

// ───────────────────────────── Committee reports ─────────────────────────────

export type ReportStatus = 'submitted' | 'reviewed';

export interface CommitteeReport {
  id: string;
  seq: number;
  committeeId: string;
  title: string;
  period: string;
  summary: string;
  achievements: string;
  challenges: string;
  createdBy: string;
  createdAt: ISODate;
  status: ReportStatus;
  reviewNote?: string;
  reviewedBy?: string;
}

// ───────────────────────────── Settings ─────────────────────────────

export interface AppSettings {
  /** Show the "demo mode" banner and simulated-action hints. */
  showDemoHints: boolean;
}
