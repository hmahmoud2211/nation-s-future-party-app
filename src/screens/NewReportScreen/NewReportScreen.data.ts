/** New committee report copy. */
export const newReportCopy = {
  title: 'تقرير جديد',
  subtitle: 'يُرسل التقرير للأمين المساعد وأمين القطاع للمراجعة',

  unauthorizedTitle: 'غير مصرح',
  unauthorizedMessage: 'إضافة التقارير متاحة لمسؤولي اللجان فقط.',

  /** Reporting periods (value and label). */
  periods: ['الشهر الحالي', 'الشهر الماضي', 'الربع الحالي', 'الربع الماضي'],
  fallbackCommitteeName: 'اللجنة',
  defaultTitle: (committeeName: string) => `التقرير الشهري — ${committeeName}`,

  committeeRequired: 'يرجى اختيار اللجنة',
  titleRequired: 'يرجى كتابة عنوان التقرير',
  periodRequired: 'يرجى اختيار الفترة',
  summaryRequired: 'يرجى كتابة ملخص التقرير (10 أحرف على الأقل)',

  submitSuccess: 'تم تقديم التقرير بنجاح',
  incompleteForm: 'يرجى استكمال البيانات المطلوبة',

  submit: 'تقديم التقرير',
  cancel: 'إلغاء',

  committeeLabel: 'اللجنة',
  chooseCommittee: 'اختر اللجنة',
  reportTitleLabel: 'عنوان التقرير',
  reportTitlePlaceholder: 'عنوان التقرير',
  periodLabel: 'الفترة',
  summaryLabel: 'الملخص التنفيذي',
  summaryPlaceholder: 'ملخص أعمال اللجنة خلال الفترة…',
  achievementsLabel: 'أبرز الإنجازات',
  achievementsPlaceholder: 'ما تم إنجازه من مشروعات وأنشطة…',
  challengesLabel: 'التحديات والمعوقات',
  challengesPlaceholder: 'التحديات ومقترحات الحل…',

  demoNotice: 'التقرير تجريبي ويُحفظ في الذاكرة فقط.',
} as const;
