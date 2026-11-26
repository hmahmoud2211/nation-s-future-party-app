/** «الملخص المالي» copy. */
export const financeCopy = {
  title: 'الملخص المالي',
  unauthorizedTitle: 'غير مصرح',
  unauthorizedMessage: 'البيانات المالية متاحة للأمين ومدير النظام فقط.',
  subtitle: 'ميزانيات ومصروفات مشروعات اللجان',

  committeeFilterTitle: 'تصفية حسب اللجنة',
  allCommittees: 'كل اللجان',

  budget: 'الميزانية المخصصة',
  spent: 'إجمالي المصروف',
  remaining: 'المتبقي',
  spendRate: 'نسبة الصرف',

  spentByCommitteeTitle: 'المصروف حسب اللجنة',
  projectsTitle: 'المشروعات',
  noProjects: 'لا توجد مشروعات',

  figureBudget: 'الميزانية',
  figureBudgetUnset: 'لم تُحدد',
  figureSpent: 'المصروف',
  figureRemaining: 'المتبقي',
  overBudget: (percent: string) => `تجاوز الميزانية بنسبة ${percent}`,
  spentSummary: (spentPercent: string, progressPercent: string) => `صُرف ${spentPercent} • إنجاز المشروع ${progressPercent}`,

  demoNotice: 'الأرقام المالية بيانات تجريبية للعرض فقط.',
} as const;
