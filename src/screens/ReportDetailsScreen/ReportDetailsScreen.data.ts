/** Committee report details copy. */
export const reportDetailsCopy = {
  title: 'تقرير اللجنة',
  unauthorized: 'غير مصرح بعرض هذا التقرير',
  notFound: 'التقرير غير موجود',
  eyebrow: (ref: string, committeeName: string) => `${ref} • ${committeeName}`,

  reviewTitle: 'مراجعة التقرير',
  reviewMessage: 'أضف ملاحظات المراجعة (اختياري) ثم أكّد.',
  reviewPlaceholder: 'مثال: تقرير متميز، يرجى إضافة مؤشرات كمية…',
  reviewConfirm: 'اعتماد المراجعة',
  reviewSuccess: 'تمت مراجعة التقرير',
  reviewButton: 'مراجعة التقرير',
  updateReviewButton: 'تحديث ملاحظات المراجعة',

  author: 'مقدم التقرير',
  submittedAt: 'تاريخ التقديم',
  period: 'الفترة',

  summary: 'الملخص التنفيذي',
  achievements: 'أبرز الإنجازات',
  challenges: 'التحديات والمعوقات',
  emptySection: 'لا يوجد',

  reviewNotes: 'ملاحظات المراجعة',
  reviewer: (name?: string) => `المراجِع: ${name ?? '—'}`,

  committeeStats: 'عرض إحصاءات اللجنة',
  readOnly: 'عرض للاطلاع فقط',
} as const;
