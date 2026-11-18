import type { StateCreator } from 'zustand';
import type {
  Activity,
  ActivityType,
  AdminRequest,
  Announcement,
  AnnouncementCategory,
  AnnouncementPriority,
  AppNotification,
  AppSettings,
  Attachment,
  Committee,
  CommitteeIconKey,
  CommitteeReport,
  Feedback,
  FeedbackCategory,
  FeedbackStatus,
  FeedbackTopic,
  Governorate,
  GovernorateContact,
  Meeting,
  MeetingMode,
  Member,
  MembershipStatus,
  Project,
  ProjectStatus,
  Proposal,
  ProposalStatus,
  RequestStatus,
  RequestType,
  Role,
  RSVPStatus,
} from '@/types';

export type Result<T = void> = { ok: true; data: T } | { ok: false; error: string };

// ───────────── Inputs ─────────────

export interface ProposalInput {
  title: string;
  description: string;
  objective: string;
  committeeId: string;
  governorateId?: string;
  attachments?: Attachment[];
}

export interface ProjectInput {
  title: string;
  description: string;
  committeeId: string;
  leadId: string;
  teamIds: string[];
  startDate: string;
  endDate: string;
  status: ProjectStatus;
  milestones?: { title: string; dueDate: string }[];
}

export interface MeetingInput {
  title: string;
  /** `null` = general meeting. */
  committeeId: string | null;
  date: string;
  durationMin: number;
  location: string;
  mode: MeetingMode;
  description?: string;
  agenda: string[];
  attendeeIds: string[];
}

export interface ActivityInput {
  title: string;
  description: string;
  committeeId: string;
  governorateId?: string;
  type: ActivityType;
  date: string;
  location: string;
  capacity?: number;
  images?: Attachment[];
}

export interface FeedbackInput {
  category: FeedbackCategory;
  topic: FeedbackTopic;
  relatedEntityId?: string;
  committeeId: string;
  subject: string;
  message: string;
  recipientId?: string;
  attachments?: Attachment[];
}

export interface AnnouncementInput {
  title: string;
  body: string;
  committeeId: string | null;
  priority: AnnouncementPriority;
  category: AnnouncementCategory;
  attachments?: Attachment[];
}

export interface RequestInput {
  type: RequestType;
  subject: string;
  description: string;
  committeeId?: string;
  attachments?: Attachment[];
}

export interface ReportInput {
  committeeId: string;
  title: string;
  period: string;
  summary: string;
  achievements: string;
  challenges: string;
}

export interface CommitteeInput {
  name: string;
  shortName: string;
  description: string;
  icon: CommitteeIconKey;
  color: string;
}

export interface MemberInput {
  name: string;
  role: Role;
  title: string;
  /** Committees the person belongs to as a member. */
  committeeIds: string[];
  /** Committee responsibility (مسؤول اللجنة). */
  managedCommitteeIds: string[];
  /** Committees supervised — only kept for assistant secretaries. */
  supervisedCommitteeIds: string[];
  status: MembershipStatus;
  phone?: string;
  email?: string;
}

// ───────────── Slices ─────────────

export interface DataState {
  members: Member[];
  committees: Committee[];
  governorates: Governorate[];
  governorateContacts: GovernorateContact[];
  proposals: Proposal[];
  projects: Project[];
  meetings: Meeting[];
  activities: Activity[];
  feedback: Feedback[];
  notifications: AppNotification[];
  requests: AdminRequest[];
  announcements: Announcement[];
  reports: CommitteeReport[];
  settings: AppSettings;
  /** Counter used to generate human-readable sequence numbers. */
  seqCounter: number;
}

export interface AuthSlice {
  currentUserId: string | null;
  loginDemoUser: (phone: string, password: string) => Result<Member>;
  logoutDemoUser: () => void;
  switchDemoUser: (memberId: string) => Result<Member>;
}

export interface CommitteeSlice {
  createCommittee: (input: CommitteeInput) => Result<Committee>;
  updateCommittee: (id: string, patch: Partial<CommitteeInput>) => Result;
  toggleCommittee: (id: string) => Result<boolean>;
  /** Replace the people responsible for a committee (a committee can have several). */
  setCommitteeOfficials: (committeeId: string, memberIds: string[]) => Result;
}

export interface ProposalSlice {
  createProposal: (input: ProposalInput) => Result<Proposal>;
  /** Move a proposal to its next status (permission-checked), with an optional note. */
  setProposalStatus: (id: string, status: ProposalStatus, note?: string) => Result;
}

export interface ProjectSlice {
  createProject: (input: ProjectInput) => Result<Project>;
  updateProject: (id: string, patch: Partial<ProjectInput>) => Result;
  addProjectMilestone: (id: string, milestone: { title: string; dueDate: string }) => Result;
  toggleProjectMilestone: (id: string, milestoneId: string) => Result;
  updateProjectProgress: (id: string, progress: number, status?: ProjectStatus) => Result;
  addProjectComment: (id: string, message: string, parentId?: string) => Result;
  closeProject: (id: string) => Result;
  /** Allocate a project's budget (finance permission). */
  setProjectBudget: (id: string, budget: number) => Result;
}

export interface MeetingSlice {
  createMeeting: (input: MeetingInput) => Result<Meeting>;
  editMeeting: (id: string, patch: Partial<MeetingInput>) => Result;
  updateMeetingRSVP: (id: string, status: RSVPStatus, memberId?: string) => Result;
  addMeetingMinutes: (id: string, minutes: string) => Result;
  cancelMeeting: (id: string) => Result;
  /** Organizer starts an online meeting → status `live`, participants are notified. */
  startConference: (id: string) => Result<Meeting>;
  /** Organizer ends a live meeting → status `completed`. */
  endConference: (id: string) => Result;

  createActivity: (input: ActivityInput) => Result<Activity>;
  updateActivity: (id: string, patch: Partial<ActivityInput> & { progress?: number; status?: Activity['status'] }) => Result;
  toggleActivityRegistration: (id: string) => Result<boolean>;
  publishActivityReport: (id: string, report: string) => Result;
}

export interface FeedbackSlice {
  createFeedback: (input: FeedbackInput) => Result<Feedback>;
  replyToFeedback: (id: string, message: string, kind?: 'message' | 'info_request', attachments?: Attachment[]) => Result;
  updateFeedbackStatus: (id: string, status: FeedbackStatus) => Result;
  closeFeedback: (id: string) => Result;
  reopenFeedback: (id: string) => Result;
}

export interface NotificationSlice {
  createNotification: (input: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
}

export interface AdminSlice {
  createDemoMember: (input: MemberInput) => Result<Member>;
  /** Updates profile data; role and committee scopes can only be changed by the admin. */
  editDemoMember: (id: string, patch: Partial<MemberInput>) => Result;
  /** Assign a governorate to an assistant secretary (or unassign with `undefined`). */
  assignGovernorate: (governorateId: string, memberId: string | undefined) => Result;

  createAnnouncement: (input: AnnouncementInput) => Result<Announcement>;
  markAnnouncementRead: (id: string) => void;

  createRequest: (input: RequestInput) => Result<AdminRequest>;
  replyToRequest: (id: string, message: string, kind?: 'message' | 'info_request') => Result;
  updateRequestStatus: (id: string, status: RequestStatus) => Result;

  createReport: (input: ReportInput) => Result<CommitteeReport>;
  reviewReport: (id: string, note: string) => Result;

  updateSettings: (patch: Partial<AppSettings>) => void;
  resetMockData: () => void;
}

export type AppState = DataState &
  AuthSlice &
  CommitteeSlice &
  ProposalSlice &
  FeedbackSlice &
  ProjectSlice &
  MeetingSlice &
  NotificationSlice &
  AdminSlice;

export type SliceCreator<T> = StateCreator<AppState, [], [], T>;
