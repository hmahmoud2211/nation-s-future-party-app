import type { FeedbackCategory, FeedbackStatus } from '@/features/feedback/types';

/** Feedback inbox copy. */
export const feedbackCopy = {
  statusLabels: {
    new: 'جديدة',
    under_review: 'قيد المتابعة',
    replied: 'تم الرد',
    closed: 'مغلقة',
  } satisfies Record<FeedbackStatus, string>,
  categoryLabels: {
    proposal: 'مقترحات',
    project: 'مشروعات',
    administrative: 'إداري',
  } satisfies Record<FeedbackCategory, string>,

  allStatuses: 'الكل',
  allCategories: 'كل الأنواع',

  memberTitle: 'ملاحظاتي واستفساراتي',
  officialTitle: 'الملاحظات والاستفسارات',
  memberSubtitle: 'تابع ردود اللجنة على استفساراتك',
  leadershipSubtitle: 'عرض للمتابعة — الملاحظات ضمن نطاق إشرافك',
  newCountSubtitle: (count: number) => `لديك ${count} ملاحظات جديدة بانتظار الرد`,
  noNewSubtitle: 'لا توجد ملاحظات جديدة بانتظار الرد',
  newFeedbackA11y: 'ملاحظة جديدة',

  resultsCount: (count: number) => `${count} ملاحظة`,
  empty: 'لا توجد ملاحظات',
  emptyWithStatus: (status: string) => `لا توجد ملاحظات بحالة "${status}"`,
  memberEmptyMessage: 'يمكنك إرسال استفسار أو ملاحظة للجنة في أي وقت.',
  officialEmptyMessage: 'ستظهر هنا ملاحظات واستفسارات أعضاء اللجنة.',
  sendNew: 'إرسال ملاحظة جديدة',
} as const;
