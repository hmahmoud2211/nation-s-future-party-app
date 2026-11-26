/** «الإشعارات» copy. */
export const notificationsCopy = {
  title: 'الإشعارات',
  unreadSubtitle: (count: number) => `لديك ${count} إشعارات غير مقروءة`,
  noUnreadSubtitle: 'لا توجد إشعارات غير مقروءة',
  markAllRead: 'تحديد الكل كمقروء',
  markAllReadDone: 'تم تحديد جميع الإشعارات كمقروءة',
  emptyUnreadTitle: 'لا توجد إشعارات غير مقروءة',
  emptyTitle: 'لا توجد إشعارات',
  emptyMessage: 'تصلك الإشعارات عند تحديث المقترحات وبدء الاجتماعات والرد على استفساراتك.',
  /** Filter chip labels, in display order. */
  groupLabels: {
    all: 'الكل',
    unread: 'غير المقروءة',
    proposals: 'المقترحات',
    meetings: 'الاجتماعات',
    feedback: 'الملاحظات',
    announcements: 'الإعلانات',
  },
} as const;
