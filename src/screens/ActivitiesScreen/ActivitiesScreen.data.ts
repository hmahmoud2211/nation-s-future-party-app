/** "الأنشطة والفعاليات" copy. */
export const activitiesCopy = {
  title: 'الأنشطة والفعاليات',
  subtitleMine: 'ورش وندوات ومبادرات لجانك',
  subtitleAll: 'أنشطة جميع لجان الأمانة',
  newActivity: 'نشاط جديد',

  allCommittees: 'كل اللجان',
  myCommitteesOnly: 'لجاني فقط',
  yourCommittee: 'لجنتك',
  filterByCommittee: 'تصفية حسب اللجنة',

  filterAll: 'الكل',
  filterRegistered: 'المسجل بها',
  countSummary: (count: number, followsOthers: boolean) => `عدد الأنشطة: ${count}${followsOthers ? ' • أنشطة اللجان الأخرى للاطلاع فقط' : ''}`,

  empty: 'لا توجد أنشطة مطابقة',
} as const;
