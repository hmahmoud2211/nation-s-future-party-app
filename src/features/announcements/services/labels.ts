/** Display labels and badge tones for the announcements domain. */
import type { AnnouncementCategory, AnnouncementPriority } from '@/features/announcements/types';

import type { LabelTone } from '@/types/common.types';

export const ANNOUNCEMENT_PRIORITY: Record<AnnouncementPriority, LabelTone> = {
  normal: { label: 'عادي', tone: 'neutral' },
  important: { label: 'مهم', tone: 'warning' },
  urgent: { label: 'عاجل', tone: 'error' },
};

export const ANNOUNCEMENT_CATEGORY: Record<AnnouncementCategory, string> = {
  general: 'عام',
  meeting: 'اجتماعات',
  event: 'فعاليات',
  administrative: 'إداري',
};
