/** Short proposal form copy. */
export const newProposalCopy = {
  title: 'تقديم مقترح',
  subtitle: 'يُرسل إلى الأمين للمراجعة',
  unauthorized: 'غير مصرح',
  noEnabledCommittees: 'لا توجد لجان مفعّلة.',
  committeeOfficialsOnly: 'تقديم المقترحات متاح لمسؤولي اللجان فقط.',

  submit: 'تقديم المقترح',
  cancel: 'إلغاء',
  submitted: 'تم تقديم المقترح بنجاح',
  incomplete: 'يرجى استكمال البيانات المطلوبة',

  committeeLabel: 'اللجنة',
  chooseCommittee: 'اختر اللجنة',
  titleLabel: 'عنوان المقترح',
  titlePlaceholder: 'مثال: منصة موحدة لفرص الاستثمار',
  descriptionLabel: 'وصف مختصر',
  descriptionPlaceholder: 'ما الفكرة باختصار؟',
  objectiveLabel: 'الهدف',
  objectivePlaceholder: 'ماذا سيحقق المقترح؟',
  governorateLabel: 'المحافظة (اختياري)',
  governorateHint: 'إن كان المقترح خاصاً بمحافظة معينة',
  chooseGovernorate: 'اختر المحافظة',
  noGovernorate: 'بدون محافظة محددة',
  attachmentsLabel: 'مستندات داعمة (اختياري)',

  errors: {
    committeeRequired: 'يرجى اختيار اللجنة',
    titleMin: 'يرجى كتابة عنوان المقترح (5 أحرف على الأقل)',
    titleMax: 'العنوان طويل جداً',
    descriptionMin: 'يرجى كتابة وصف مختصر (10 أحرف على الأقل)',
    descriptionMax: 'الوصف طويل — اختصره قدر الإمكان',
    objectiveMin: 'يرجى توضيح الهدف',
    objectiveMax: 'الهدف طويل جداً',
  },
} as const;
