/** Display labels and badge tones for the reports domain. */
import type { ReportStatus } from '@/features/reports/types';

import type { LabelTone } from '@/types/common.types';

export const REPORT_STATUS: Record<ReportStatus, LabelTone> = {
  submitted: { label: 'مُقدَّم', tone: 'info' },
  reviewed: { label: 'تمت المراجعة', tone: 'success' },
};
