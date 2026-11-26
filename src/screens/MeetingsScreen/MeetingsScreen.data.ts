/** «الاجتماعات» copy. */
export const meetingsCopy = {
  title: 'الاجتماعات',
  liveNow: (count: number) => `${count} اجتماع جارٍ الآن`,
  pendingRsvp: (count: number) => `لديك ${count} دعوات بانتظار تأكيد الحضور`,
  defaultSubtitle: 'اجتماعاتك القادمة والسابقة',
  newMeeting: 'اجتماع جديد',
  tabUpcoming: 'القادمة',
  tabPast: 'السابقة',
  sortedUpcoming: 'مرتبة حسب الأقرب موعداً',
  sortedPast: 'مرتبة من الأحدث إلى الأقدم',
  emptyUpcoming: 'لا توجد اجتماعات قادمة',
  emptyPast: 'لا توجد اجتماعات سابقة',
  addMeeting: 'إضافة اجتماع',
} as const;
