/** Governorates list copy. */
export const governoratesCopy = {
  title: 'المحافظات',
  myTitle: 'محافظاتي',
  subtitle: 'أمناء المحافظات وأنشطتها ومقترحاتها',
  unauthorizedTitle: 'غير مصرح',
  unauthorizedMessage: 'متابعة المحافظات متاحة للأمناء المساعدين والأمين.',
  searchPlaceholder: 'ابحث باسم المحافظة…',
  emptyTitle: 'لا توجد محافظات مسندة إليك',
  emptyMessage: 'يسند مدير النظام المحافظات إلى الأمناء المساعدين.',
  coordinator: (name: string) => `المنسق: ${name}`,
  noCoordinator: 'لم يُسند لأمين مساعد',
  activitiesCount: (count: number) => `${count} أنشطة`,
  proposalsCount: (count: number) => `${count} مقترحات`,
  projectsCount: (count: number) => `${count} مشروعات`,
  metaSeparator: ' • ',
  demoNotice: 'توزيع المحافظات على الأمناء المساعدين وأسماء أمناء المحافظات بيانات تجريبية للعرض.',
} as const;
