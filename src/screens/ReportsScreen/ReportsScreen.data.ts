/** Sector reports & statistics copy. */
export const reportsCopy = {
  unauthorizedHeader: 'التقارير',
  unauthorizedTitle: 'غير مصرح',
  unauthorizedMessage: 'التقارير والإحصاءات متاحة للقيادة وأعضاء الهيئة.',

  title: 'التقارير والإحصاءات',
  subtitleSectorWide: 'نظرة شاملة على أداء لجان القطاع',
  subtitleReadOnly: 'أداء لجان الأمانة — للاطلاع',
  committeeFilterTitle: 'تصفية حسب اللجنة',
  allCommittees: 'كل اللجان',

  kpisTitle: 'المؤشرات الرئيسية',
  activeCommittees: 'لجان نشطة',
  activeProjects: 'مشروعات نشطة',
  completedProjectsHint: (count: number) => `${count} مكتملة`,
  projectsProgress: 'متوسط إنجاز المشروعات',
  proposalsPending: 'مقترحات بانتظار القرار',
  openRequestsAndFeedback: 'طلبات وملاحظات مفتوحة',
  completedActivities: 'أنشطة منفذة',
  upcomingActivitiesHint: (count: number) => `${count} قادمة`,

  proposalStatusTitle: 'حالة المقترحات',
  proposalCenterLabel: 'مقترح',
  proposalsTotal: (count: number) => `إجمالي المقترحات: ${count}`,
  proposalsCompleted: (count: number) => `منجزة: ${count}`,

  progressByCommitteeTitle: 'متوسط إنجاز المشروعات حسب اللجنة',
  projectStatusTitle: 'حالة المشروعات والمبادرات',
  activityTitle: 'ملخص نشاط اللجان',
  activitySubtitle: 'الأنشطة والاجتماعات المنعقدة والمجدولة',

  workloadTitle: 'عبء العمل الإداري',
  workloadOpenRequests: 'طلبات إدارية مفتوحة',
  workloadFeedbackOpen: 'ملاحظات بحاجة لرد',
  workloadProposalsPending: 'مقترحات بانتظار القرار',
  workloadReportsAwaitingReview: 'تقارير بانتظار المراجعة',

  committeeReportsTitle: 'تقارير اللجان',
  reportFilterAll: 'الكل',
  reportFilterSubmitted: 'بانتظار المراجعة',
  reportFilterReviewed: 'تمت المراجعة',
  noReports: 'لا توجد تقارير',

  privacyNote:
    'تعرض التقارير بيانات تشغيلية مجمعة على مستوى اللجان فقط، ولا تتضمن أي تقييم فردي للنشاط السياسي. جميع الأرقام تجريبية ومحسوبة لحظياً من البيانات الوهمية.',
} as const;
