/** Display labels and badge tones for the activities domain. */
import type { ActivityStatus, ActivityType } from '@/features/activities/types';

import type { LabelTone } from '@/types/common.types';

export const ACTIVITY_TYPE: Record<ActivityType, string> = {
  workshop: 'ورشة عمل',
  forum: 'منتدى',
  visit: 'زيارة ميدانية',
  initiative: 'مبادرة',
  seminar: 'ندوة',
  training: 'برنامج تدريبي',
};

export const ACTIVITY_STATUS: Record<ActivityStatus, LabelTone> = {
  upcoming: { label: 'قادم', tone: 'info' },
  ongoing: { label: 'جارٍ', tone: 'warning' },
  completed: { label: 'منتهٍ', tone: 'success' },
};
