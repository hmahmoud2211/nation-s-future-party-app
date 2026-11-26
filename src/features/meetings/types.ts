import type { ISODate, Result } from '@/types/common.types';

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

// ───────────── Store slice ─────────────

export interface MeetingsSlice {
  createMeeting: (input: MeetingInput) => Result<Meeting>;
  editMeeting: (id: string, patch: Partial<MeetingInput>) => Result;
  updateMeetingRSVP: (id: string, status: RSVPStatus, memberId?: string) => Result;
  addMeetingMinutes: (id: string, minutes: string) => Result;
  cancelMeeting: (id: string) => Result;
  /** Organizer starts an online meeting → status `live`, participants are notified. */
  startConference: (id: string) => Result<Meeting>;
  /** Organizer ends a live meeting → status `completed`. */
  endConference: (id: string) => Result;
}
