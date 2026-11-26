/** Feedback thread (details) copy. */
export const feedbackDetailsCopy = {
  title: 'تفاصيل الملاحظة',
  forbidden: 'غير مصرح بعرض هذه الملاحظة',
  notFound: 'الملاحظة غير موجودة',
  outOfScope: 'قد تكون الملاحظة خارج نطاق صلاحياتك التجريبية.',

  authorReplySent: 'تم إرسال ردك',
  replySent: 'تم إرسال الرد',

  requestInfoTitle: 'طلب معلومات إضافية',
  requestInfoMessage: 'اكتب المعلومات المطلوبة من العضو لاستكمال المراجعة.',
  requestInfoPlaceholder: 'مثال: يرجى توضيح تفاصيل إضافية عن المقترح…',
  requestInfoRequired: 'يرجى كتابة المعلومات المطلوبة',
  requestInfoConfirm: 'إرسال الطلب',
  infoRequestSent: 'تم إرسال طلب المعلومات',

  closeTitle: 'إغلاق الملاحظة؟',
  closeMessage: 'لن يمكن إضافة ردود جديدة إلا بعد إعادة فتحها.',
  closeConfirm: 'إغلاق',
  closedToast: 'تم إغلاق الملاحظة',

  handlerPlaceholder: 'اكتب ردك على العضو…',
  messagePlaceholder: 'اكتب رسالتك…',
  closedDisabled: 'الملاحظة مغلقة — أعد فتحها لإضافة ردود',
  readOnlyDisabled: 'عرض فقط — لا يمكنك الرد على هذه الملاحظة',

  submittedBy: 'مقدم الملاحظة',
  emptyValue: '—',
  recipient: 'الجهة المختصة',
  recipientFallback: 'مسؤول اللجنة',
  sentAt: 'تاريخ الإرسال',

  actionsTitle: 'إجراءات المتابعة',
  reopen: 'إعادة فتح الملاحظة',
  reopenedToast: 'تمت إعادة فتح الملاحظة',
  requestInfo: 'طلب معلومات إضافية',
  underReview: 'قيد المراجعة',
  underReviewToast: 'تم تحديث الحالة إلى قيد المراجعة',
  replied: 'تم الرد',
  repliedToast: 'تم تحديث الحالة إلى تم الرد',
  close: 'إغلاق',

  conversation: 'المحادثة',
  activityLog: 'سجل المتابعة',
  eventsCount: (count: number) => `${count} حدث`,
} as const;
