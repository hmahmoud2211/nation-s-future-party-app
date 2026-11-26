import type { ActivitiesSlice, Activity } from '@/features/activities/types';
import type { Announcement, AnnouncementsSlice } from '@/features/announcements/types';
import type { AuthSlice } from '@/features/auth/types';
import type { Committee, CommitteesSlice } from '@/features/committees/types';
import type { Feedback, FeedbackSlice } from '@/features/feedback/types';
import type { Governorate, GovernorateContact, GovernoratesSlice } from '@/features/governorates/types';
import type { Meeting, MeetingsSlice } from '@/features/meetings/types';
import type { Member, MembersSlice } from '@/features/members/types';
import type { AppNotification, NotificationsSlice } from '@/features/notifications/types';
import type { Project, ProjectsSlice } from '@/features/projects/types';
import type { Proposal, ProposalsSlice } from '@/features/proposals/types';
import type { CommitteeReport, ReportsSlice } from '@/features/reports/types';
import type { AdminRequest, RequestsSlice } from '@/features/requests/types';
import type { AppSettings, SettingsSlice } from '@/features/settings/types';

import type { StateCreator } from 'zustand';

/** Every record collection held by the in-memory store. */
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

/** The whole store: data + every feature slice's actions. */
export type AppState = DataState &
  AuthSlice &
  MembersSlice &
  CommitteesSlice &
  GovernoratesSlice &
  ProposalsSlice &
  ProjectsSlice &
  MeetingsSlice &
  ActivitiesSlice &
  AnnouncementsSlice &
  FeedbackSlice &
  RequestsSlice &
  ReportsSlice &
  NotificationsSlice &
  SettingsSlice;

export type SliceCreator<T> = StateCreator<AppState, [], [], T>;
