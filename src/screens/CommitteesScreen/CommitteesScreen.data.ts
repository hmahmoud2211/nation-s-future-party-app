/** «اللجان» copy. */
export const committeesCopy = {
  title: 'اللجان',
  subtitle: (enabledCount: number) => `${enabledCount} لجنة نوعية في أمانة قطاع الأعمال`,
  searchPlaceholder: 'ابحث باسم اللجنة أو مجال عملها…',
  filterAll: 'جميع اللجان',
  filterMine: 'لجاني',
  filterDisabled: 'المعطلة',
  resultsCount: (count: number) => `عدد النتائج: ${count}`,
  emptyTitle: 'لا توجد لجان مطابقة',
  emptyMessage: 'جرّب تعديل كلمات البحث أو التصفية.',
} as const;
