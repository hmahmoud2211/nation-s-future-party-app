import type { DataState } from '@/store/types';
import { mockActivities } from './mockActivities';
import { mockCommittees } from './mockCommittees';
import { mockFeedback } from './mockFeedback';
import { mockGovernorateContacts, mockGovernorates } from './mockGovernorates';
import { mockMeetings } from './mockMeetings';
import { DEMO_ACCOUNT_GROUP_LABELS, demoAccounts, mockMembers } from './mockMembers';
import { mockAnnouncements, mockNotifications, mockReports, mockRequests } from './mockMisc';
import { mockProjects } from './mockProjects';
import { mockProposals } from './mockProposals';

export { DEMO_ACCOUNT_GROUP_LABELS, demoAccounts };

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

/**
 * Fresh copy of the initial demo dataset. Called on app start and by `resetMockData()`.
 * Nothing is persisted — reloading the app always returns to this state.
 */
export function createInitialData(): DataState {
  return {
    members: clone(mockMembers),
    committees: clone(mockCommittees),
    governorates: clone(mockGovernorates),
    governorateContacts: clone(mockGovernorateContacts),
    proposals: clone(mockProposals),
    projects: clone(mockProjects),
    meetings: clone(mockMeetings),
    activities: clone(mockActivities),
    feedback: clone(mockFeedback),
    notifications: clone(mockNotifications),
    requests: clone(mockRequests),
    announcements: clone(mockAnnouncements),
    reports: clone(mockReports),
    settings: { showDemoHints: true },
    seqCounter: 2000,
  };
}
