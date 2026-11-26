/** Proposal details copy. */
export const proposalDetailsCopy = {
  title: 'تفاصيل المقترح',
  unauthorized: 'غير مصرح',
  notFound: 'المقترح غير موجود',
  outOfScope: 'هذا المقترح خارج نطاق صلاحياتك.',
  statusChanged: (label: string) => `تم تغيير الحالة إلى «${label}»`,
  confirmTitle: (action: string) => `${action}؟`,
  confirmMessage: (label: string) => `سيتم تغيير حالة المقترح إلى «${label}».`,

  committee: 'اللجنة',
  author: 'مقدم المقترح',
  governorate: 'المحافظة',
  submittedAt: 'تاريخ التقديم',
  emptyValue: '—',
  reviewNote: 'ملاحظة الأمين',

  description: 'الوصف',
  objective: 'الهدف',
  attachments: 'المستندات الداعمة',
  history: 'سجل الحالة',
  sendFeedback: 'إرسال ملاحظة على المقترح',

  rejectSubtitle: 'يرجى توضيح سبب الرفض لمقدم المقترح.',
  noteSubtitle: 'يمكنك إضافة ملاحظة لمقدم المقترح (اختياري).',
  rejectReason: 'سبب الرفض',
  note: 'ملاحظة',
  notePlaceholder: 'اكتب ملاحظتك…',
  noteA11y: 'ملاحظة القرار',
} as const;
