import type { FeedbackCategory, FeedbackTopic } from '@/features/feedback/types';

/** Topic options offered for each feedback category (first one is the default). */
export const feedbackTopicsByCategory: Record<FeedbackCategory, FeedbackTopic[]> = {
  proposal: ['proposal_note', 'review_request', 'other'],
  project: ['project_note', 'data_error', 'other'],
  administrative: ['other', 'data_error'],
};

/** New feedback form copy. */
export const newFeedbackCopy = {
  title: 'إرسال استفسار أو ملاحظة',
  subtitle: 'سيتم توجيه رسالتك إلى مسؤول اللجنة المختص',

  topicRequired: 'يرجى اختيار نوع الملاحظة',
  committeeRequired: 'يرجى اختيار اللجنة',
  subjectMin: 'يرجى كتابة موضوع الملاحظة (3 أحرف على الأقل)',
  messageMin: 'يرجى كتابة نص الملاحظة (5 أحرف على الأقل)',

  proposalSubject: (title: string) => `ملاحظة على مقترح: ${title}`,
  projectSubject: (title: string) => `ملاحظة على مشروع: ${title}`,

  sentToast: 'تم إرسال الملاحظة بنجاح',
  incompleteToast: 'يرجى استكمال البيانات المطلوبة',

  send: 'إرسال',
  cancel: 'إلغاء',

  topicLabel: 'نوع الملاحظة',
  committeeLabel: 'اللجنة',
  committeeSheetTitle: 'اختر اللجنة',
  committeePlaceholder: 'اختر اللجنة',
  subjectLabel: 'الموضوع',
  subjectPlaceholder: 'موضوع الملاحظة',
  messageLabel: 'الرسالة',
  messagePlaceholder: 'اكتب استفسارك أو ملاحظتك بالتفصيل…',
  attachmentLabel: 'مرفق (اختياري)',
  demoNotice: 'سيتم حفظ الملاحظة وإشعار المسؤول داخل التطبيق فقط (محاكاة بدون خادم).',
} as const;
