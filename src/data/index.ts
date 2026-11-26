import type { DataState } from '@/types/store.types';
import { mockActivities } from '@/data/mockActivities';
import { mockCommittees } from '@/data/mockCommittees';
import { mockFeedback } from '@/data/mockFeedback';
import { mockGovernorateContacts, mockGovernorates } from '@/data/mockGovernorates';
import { mockMeetings } from '@/data/mockMeetings';
import { DEMO_ACCOUNT_GROUP_LABELS, demoAccounts, mockMembers } from '@/data/mockMembers';
import { mockAnnouncements, mockNotifications, mockReports, mockRequests, sampleWeather } from '@/data/mockMisc';
import { mockProjects } from '@/data/mockProjects';
import { mockProposals } from '@/data/mockProposals';

export { DEMO_ACCOUNT_GROUP_LABELS, demoAccounts, sampleWeather };

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
