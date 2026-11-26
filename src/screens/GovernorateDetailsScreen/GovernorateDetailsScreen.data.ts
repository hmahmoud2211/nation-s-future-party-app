/** Governorate details copy. */
export const governorateDetailsCopy = {
  title: 'المحافظة',
  unauthorizedTitle: 'غير مصرح',
  notFoundTitle: 'المحافظة غير موجودة',
  outOfScopeMessage: 'هذه المحافظة خارج نطاق إشرافك.',

  coordinatorTitle: 'الأمين المساعد المنسق',
  noCoordinator: 'لم تُسند المحافظة لأمين مساعد بعد.',
  changeCoordinator: 'تغيير المنسق',
  assigned: 'تم إسناد المحافظة',
  unassigned: 'تم إلغاء الإسناد',
  coordinatorPickerTitle: (name: string) => `منسق ${name}`,
  coordinatorPlaceholder: 'اختر الأمين المساعد',

  contactsTitle: 'أمناء وممثلو المحافظة',
  committeeSuffix: (shortName: string) => ` (${shortName})`,
  contactPhone: (phone: string) => `${phone} • رقم افتراضي`,

  activitiesTitle: 'أنشطة في المحافظة',
  noActivities: 'لا توجد أنشطة مسجلة في المحافظة',
  proposalsTitle: 'مقترحات تخص المحافظة',
  noProposals: 'لا توجد مقترحات',
  projectsTitle: 'مشروعات في المحافظة',

  demoNotice: 'أسماء أمناء المحافظات وأرقامهم وتوزيع المحافظات بيانات تجريبية.',
} as const;
