/** Display labels and badge tones for the feedback domain. */
import type { FeedbackStatus, FeedbackTopic } from '@/features/feedback/types';

import type { LabelTone } from '@/types/common.types';

export const FEEDBACK_STATUS: Record<FeedbackStatus, LabelTone> = {
  new: { label: 'جديد', tone: 'info' },
  under_review: { label: 'قيد المراجعة', tone: 'warning' },
  replied: { label: 'تم الرد', tone: 'success' },
  closed: { label: 'مغلق', tone: 'neutral' },
};

export const FEEDBACK_TOPIC: Record<FeedbackTopic, string> = {
  proposal_note: 'ملاحظة على مقترح',
  project_note: 'ملاحظة على مشروع',
  review_request: 'طلب مراجعة',
  data_error: 'خطأ في البيانات',
  other: 'ملاحظة أخرى',
};
