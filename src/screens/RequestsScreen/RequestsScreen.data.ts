import type { RequestStatus } from '@/features/requests/types';

/** Administrative requests list copy. */
export const requestsCopy = {
  statusLabels: {
    new: 'جديد',
    under_review: 'قيد المراجعة',
    info_requested: 'مطلوب معلومات',
    resolved: 'تم الحل',
    closed: 'مغلق',
  } satisfies Record<RequestStatus, string>,
  allStatuses: 'الكل',

  title: 'الطلبات الإدارية',
  handlerSubtitle: (count: number) => `${count} طلبات جديدة واردة`,
  memberSubtitle: 'تابع طلباتك وردود الجهات المختصة',
  newRequestA11y: 'طلب جديد',

  inboxTab: 'الواردة',
  mineTab: 'طلباتي',

  emptyInbox: 'لا توجد طلبات واردة',
  empty: 'لا توجد طلبات',
  mineEmptyMessage: 'يمكنك تقديم طلب تحديث بيانات أو استفسار إداري أو طلب مستند.',
  inboxEmptyMessage: 'ستظهر هنا طلبات أعضاء اللجان ضمن نطاقك.',
  submitNew: 'تقديم طلب جديد',
} as const;
