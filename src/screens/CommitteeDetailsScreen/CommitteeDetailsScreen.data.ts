import { formatPercent } from '@/utils/format';

/** Committee details copy. */
export const committeeDetailsCopy = {
  title: 'تفاصيل اللجنة',
  notFoundTitle: 'اللجنة غير موجودة',
  notFoundMessage: 'ربما تم حذفها أو تعطيلها.',
  backToCommittees: 'العودة للجان',

  tabOverview: 'نظرة عامة',
  tabProposals: 'المقترحات',
  tabProjects: 'المشروعات',
  tabActivities: 'الأنشطة',
  tabMembers: 'الأعضاء',
  tabReports: 'التقارير',

  officialsTitle: (count: number) => (count > 1 ? 'مسؤولو اللجنة' : 'مسؤول اللجنة'),
  officialNames: (names: string[]) => names.join('، '),
  noOfficial: 'لم يُعيَّن بعد',
  headerStats: (members: number, activeProjects: number) => `${members} عضو • ${activeProjects} مشروع نشط`,
  disabled: 'معطلة',
  youManage: 'أنت المسؤول',
  managementTitle: 'إجراءات الإدارة',

  aboutTitle: 'عن اللجنة',
  statMembers: 'أعضاء اللجنة',
  statActiveProjects: 'المشروعات النشطة',
  statUpcomingActivities: 'الأنشطة الجارية والقادمة',
  statUpcomingMeetings: 'الاجتماعات القادمة',
  upcomingMeetingsTitle: 'الاجتماعات القادمة',
  noUpcomingMeetings: 'لا توجد اجتماعات قادمة',
  latestAnnouncementsTitle: 'أحدث الإعلانات',
  noAnnouncements: 'لا توجد إعلانات لهذه اللجنة',

  manageMembers: 'إدارة أعضاء اللجنة',
  noMembers: 'لا يوجد أعضاء في هذه اللجنة بعد',

  allProjects: 'عرض كل المشروعات',
  newProject: 'مشروع جديد',
  noProjects: 'لا توجد مشروعات بعد',

  allActivities: 'عرض كل الأنشطة',
  newActivity: 'نشاط جديد',
  noActivities: 'لا توجد أنشطة بعد',

  submitProposal: 'تقديم مقترح',
  noProposals: 'لا توجد مقترحات متاحة لك في هذه اللجنة',

  pendingProposals: 'مقترحات معلقة',
  completedProposals: 'مقترحات منجزة',
  activeProjects: 'مشروعات نشطة',
  avgProgress: (progress: number) => `متوسط الإنجاز ${formatPercent(progress)}`,
  openFeedback: 'ملاحظات تحتاج متابعة',
  detailedReport: 'تقرير إحصائي مفصل',
  newReport: 'تقرير جديد',
  reportsTitle: 'تقارير اللجنة',
  noReports: 'لم تُقدَّم تقارير بعد',
  publicSummaryNote: 'ملخص عام لنشاط اللجنة — التقارير التفصيلية متاحة لقيادة اللجنة والقطاع.',
  totalProjects: 'إجمالي المشروعات',
  completedProjects: 'المشروعات المكتملة',
  activitiesAndEvents: 'الأنشطة والفعاليات',
  upcomingMeetings: 'الاجتماعات القادمة',
} as const;
