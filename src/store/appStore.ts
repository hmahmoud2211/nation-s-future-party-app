import { create } from 'zustand';
import { createInitialData } from '@/data';
import { createAdminSlice } from './slices/adminSlice';
import { createAuthSlice } from './slices/authSlice';
import { createCommitteeSlice } from './slices/committeeSlice';
import { createFeedbackSlice } from './slices/feedbackSlice';
import { createMeetingSlice } from './slices/meetingSlice';
import { createNotificationSlice } from './slices/notificationSlice';
import { createProjectSlice } from './slices/projectSlice';
import { createProposalSlice } from './slices/proposalSlice';
import type { AppState } from './types';

/**
 * Single in-memory store (NO persistence). Composed from feature slices so every
 * role-specific screen reads and writes the exact same records.
 *
 * Usage rule (zustand v5): select raw slices (`useAppStore(s => s.proposals)`) and derive
 * filtered arrays with `useMemo`, or use `useShallow`. Never return a freshly created
 * array/object from a selector — it causes infinite re-renders.
 */
export const useAppStore = create<AppState>()((...a) => ({
  ...createInitialData(),
  ...createAuthSlice(...a),
  ...createCommitteeSlice(...a),
  ...createProposalSlice(...a),
  ...createFeedbackSlice(...a),
  ...createProjectSlice(...a),
  ...createMeetingSlice(...a),
  ...createNotificationSlice(...a),
  ...createAdminSlice(...a),
}));



