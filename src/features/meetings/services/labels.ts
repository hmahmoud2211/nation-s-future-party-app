/** Display labels and badge tones for the meetings domain. */
import type { MeetingStatus, RSVPStatus } from '@/features/meetings/types';

import type { LabelTone } from '@/types/common.types';

export const MEETING_STATUS: Record<MeetingStatus, LabelTone> = {
  scheduled: { label: 'مجدول', tone: 'info' },
  live: { label: 'جارٍ الآن', tone: 'success' },
  completed: { label: 'منعقد', tone: 'success' },
  cancelled: { label: 'ملغي', tone: 'error' },
};

export const RSVP_STATUS: Record<RSVPStatus, LabelTone> = {
  going: { label: 'تم تأكيد الحضور', tone: 'success' },
  declined: { label: 'اعتذر عن الحضور', tone: 'error' },
  pending: { label: 'بانتظار الرد', tone: 'neutral' },
};
