/** «المزيد» copy. */
export const moreCopy = {
  title: 'المزيد',

  profileA11y: 'بياناتي',
  allSectorCommittees: 'جميع لجان الأمانة',
  committeeSeparator: '، ',
  emptyValue: '—',
  contactLine: (phone: string) => `${phone} • بيانات تواصل افتراضية`,

  leadershipTitle: 'المتابعة والإشراف',
  finance: 'الملخص المالي للمشروعات',
  myGovernorates: 'محافظاتي',
  governorates: 'المحافظات',
  reports: 'التقارير والإحصاءات',

  workTitle: 'أعمال الأمانة',
  projects: 'المشروعات',
  activities: 'الأنشطة والفعاليات',
  announcements: 'الإعلانات',
  notifications: 'الإشعارات',

  communicationTitle: 'التواصل',
  myFeedback: 'ملاحظاتي واستفساراتي',
  feedback: 'الملاحظات والاستفسارات',
  requests: 'الطلبات الإدارية',

  adminTitle: 'إدارة النظام',
  manageMembers: 'إدارة الأعضاء والأدوار',
  manageCommittees: 'إدارة اللجان',
  settings: 'الإعدادات',

  sessionTitle: 'الجلسة التجريبية',
  switchAccount: 'تبديل الحساب التجريبي',
  resetData: 'إعادة تعيين البيانات',
  logout: 'تسجيل الخروج',

  resetDialogTitle: 'إعادة تعيين البيانات التجريبية؟',
  resetDialogMessage: 'سيتم حذف جميع التغييرات التي أجريتها في هذه الجلسة والعودة للبيانات الأولية.',
  resetDialogConfirm: 'إعادة التعيين',
  resetDone: 'تمت إعادة تعيين البيانات التجريبية',

  logoutDialogTitle: 'تسجيل الخروج؟',
  logoutDialogMessage: 'ستبقى البيانات التجريبية في الذاكرة حتى إعادة تشغيل التطبيق.',
  logoutDialogConfirm: 'تسجيل الخروج',
  logoutDone: 'تم تسجيل الخروج',
} as const;
