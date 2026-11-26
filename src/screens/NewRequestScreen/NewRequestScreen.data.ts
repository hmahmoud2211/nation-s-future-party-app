/** New administrative request form copy. */
export const newRequestCopy = {
  title: 'طلب إداري جديد',
  subtitle: 'سيصل طلبك إلى مسؤول اللجنة وإدارة النظام',

  typeRequired: 'يرجى اختيار نوع الطلب',
  committeeRequired: 'يرجى اختيار اللجنة',
  subjectMin: 'يرجى كتابة عنوان الطلب (3 أحرف على الأقل)',
  descriptionMin: 'يرجى كتابة وصف الطلب (5 أحرف على الأقل)',

  sentToast: 'تم إرسال الطلب بنجاح',
  incompleteToast: 'يرجى استكمال البيانات المطلوبة',

  submit: 'إرسال الطلب',
  cancel: 'إلغاء',

  typeLabel: 'نوع الطلب',
  committeeLabel: 'اللجنة',
  committeePlaceholder: 'اختر اللجنة',
  committeeSheetTitle: 'اختر اللجنة',
  subjectLabel: 'عنوان الطلب',
  subjectPlaceholder: 'عنوان مختصر للطلب',
  descriptionLabel: 'وصف الطلب',
  descriptionPlaceholder: 'اشرح طلبك بالتفصيل…',
  attachmentLabel: 'مرفق (اختياري)',
  demoNotice: 'الطلبات تجريبية وتُحفظ في الذاكرة فقط خلال الجلسة الحالية.',
} as const;
