import { formatPercent } from '@/utils/format';

/** Progress steps offered in the "update progress" sheet (100% is reached by publishing the report). */
export const activityProgressSteps = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90] as const;

/** Activity details copy. */
export const activityDetailsCopy = {
  title: 'تفاصيل النشاط',
  notFound: 'النشاط غير موجود',
  back: 'رجوع',

  registeredToast: 'تم تسجيلك في النشاط بنجاح (تسجيل تجريبي)',
  unregisteredToast: 'تم إلغاء تسجيلك في النشاط',
  progressSavedToast: 'تم تحديث تقدم النشاط بنجاح',
  reportRequired: 'يرجى كتابة تقرير الإنجاز',
  reportPublishedToast: 'تم نشر تقرير الإنجاز بنجاح',
  imagesSavedToast: 'تم تحديث صور النشاط',

  youAreRegistered: 'أنت مسجل',
  unregister: 'إلغاء التسجيل',
  full: 'اكتمل العدد',
  register: 'التسجيل في النشاط',

  updateProgress: 'تحديث التقدم',
  publishReport: 'نشر تقرير الإنجاز',

  aboutTitle: 'عن النشاط',
  noDescription: 'لا يوجد وصف.',
  dateLabel: 'الموعد',
  locationLabel: 'المكان',
  registrantsLabel: 'المسجلون',
  registrantsOfCapacity: (count: number, capacity: number) => `${count} من ${capacity}`,
  occupancy: 'نسبة الإشغال',
  completion: 'نسبة إنجاز النشاط',

  publishedReportTitle: 'تقرير الإنجاز المنشور',
  resultsTitle: 'نتائج النشاط',
  noReport: 'لم يُنشر تقرير الإنجاز بعد',

  imagesTitle: 'صور النشاط (تجريبية)',
  manageImages: 'إدارة الصور',
  noImages: 'لا توجد صور مرفقة',
  noImagesManagerHint: 'يمكنك إرفاق صور من جهازك — لن يتم رفعها لأي خادم.',

  registrantsTitle: 'المسجلون',
  noRegistrants: 'لا يوجد مسجلون بعد',
  youSuffix: (name: string) => `${name} (أنت)`,
  selfRegisterA11y: 'تسجيلي',
  selfUnregister: 'إلغاء تسجيلي الشخصي',
  selfRegister: 'تسجيلي كمشارك',

  createdNote: (date: string) => `أُنشئ في ${date} • التسجيل في الأنشطة تجريبي ولا يرسل أي بيانات`,

  progressSheetTitle: 'تحديث تقدم النشاط',
  saveProgress: 'حفظ التحديث',
  progressLabel: (progress: number) => `نسبة الإنجاز: ${formatPercent(progress)}`,
  progressHint: 'لإنهاء النشاط انشر تقرير الإنجاز',

  reportSheetTitle: 'نشر تقرير الإنجاز',
  reportSheetSubtitle: 'سيُعتبر النشاط منتهياً ويُشعَر الأعضاء والمسجلون بالنتائج',
  publishReportButton: 'نشر التقرير',
  reportField: 'تقرير الإنجاز',
  reportPlaceholder: 'عدد المشاركين، أبرز النتائج والتوصيات…',

  imagesSheetTitle: 'صور النشاط',
  imagesSheetSubtitle: 'تبقى الصور على جهازك خلال الجلسة فقط',
  attachImage: 'إرفاق صورة',
} as const;
