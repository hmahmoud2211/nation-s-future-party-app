import { create } from 'zustand';
import type { AppState } from '@/types/store.types';
import { createInitialData } from '@/data';
import { createActivitiesSlice } from '@/features/activities/context/activitiesSlice';
import { createAnnouncementsSlice } from '@/features/announcements/context/announcementsSlice';
import { createAuthSlice } from '@/features/auth/context/authSlice';
import { createCommitteesSlice } from '@/features/committees/context/committeesSlice';
import { createFeedbackSlice } from '@/features/feedback/context/feedbackSlice';
import { createGovernoratesSlice } from '@/features/governorates/context/governoratesSlice';
import { createMeetingsSlice } from '@/features/meetings/context/meetingsSlice';
import { createMembersSlice } from '@/features/members/context/membersSlice';
import { createNotificationsSlice } from '@/features/notifications/context/notificationsSlice';
import { createProjectsSlice } from '@/features/projects/context/projectsSlice';
import { createProposalsSlice } from '@/features/proposals/context/proposalsSlice';
import { createReportsSlice } from '@/features/reports/context/reportsSlice';
import { createRequestsSlice } from '@/features/requests/context/requestsSlice';
import { createSettingsSlice } from '@/features/settings/context/settingsSlice';

/**
 * The app's single in-memory data store (NO persistence) — the one documented exception to
 * "domain state lives in its feature": every feature owns its slice in `features/<d>/context/`,
 * and this file only composes them, because actions cross domains (approving a proposal notifies
 * people, starting a meeting notifies attendees, reset touches everything).
 *
 * Read it through the feature hooks (`features/<d>/hooks/`), not directly from screens.
 *
 * Usage rule (zustand v5): select raw slices (`useAppStore(s => s.proposals)`) and derive
 * filtered arrays with `useMemo`, or use `useShallow`. Never return a freshly created
 * array/object from a selector — it causes infinite re-renders.
 */
export const useAppStore = create<AppState>()((...a) => ({
  ...createInitialData(),
  ...createAuthSlice(...a),
  ...createMembersSlice(...a),
  ...createCommitteesSlice(...a),
  ...createGovernoratesSlice(...a),
  ...createProposalsSlice(...a),
  ...createProjectsSlice(...a),
  ...createMeetingsSlice(...a),
  ...createActivitiesSlice(...a),
  ...createAnnouncementsSlice(...a),
  ...createFeedbackSlice(...a),
  ...createRequestsSlice(...a),
  ...createReportsSlice(...a),
  ...createNotificationsSlice(...a),
  ...createSettingsSlice(...a),
}));
