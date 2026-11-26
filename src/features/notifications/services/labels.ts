/** Display labels and badge tones for the notifications domain. */
import type { Tone } from '@/theme';
import type { NotificationType } from '@/features/notifications/types';


export const NOTIFICATION_TYPE: Record<NotificationType, { label: string; tone: Tone }> = {
  proposal_new: { label: 'مقترح جديد', tone: 'accent' },
  proposal_update: { label: 'تحديث مقترح', tone: 'primary' },
  feedback_new: { label: 'ملاحظة جديدة', tone: 'purple' },
  feedback_reply: { label: 'رد على استفسار', tone: 'success' },
  meeting_new: { label: 'اجتماع', tone: 'info' },
  meeting_started: { label: 'اجتماع بدأ الآن', tone: 'success' },
  announcement_new: { label: 'إعلان جديد', tone: 'accent' },
  project_update: { label: 'تحديث مشروع', tone: 'primary' },
  request_update: { label: 'تحديث طلب إداري', tone: 'purple' },
};
