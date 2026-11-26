import type { Attachment, ISODate, Result } from '@/types/common.types';

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

// ───────────── Store slice ─────────────

export interface ActivitiesSlice {
  createActivity: (input: ActivityInput) => Result<Activity>;
  updateActivity: (id: string, patch: Partial<ActivityInput> & { progress?: number; status?: Activity['status'] }) => Result;
  toggleActivityRegistration: (id: string) => Result<boolean>;
  publishActivityReport: (id: string, report: string) => Result;
}
