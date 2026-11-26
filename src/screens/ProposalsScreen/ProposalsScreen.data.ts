/** «المقترحات» copy. */
export const proposalsCopy = {
  title: 'المقترحات',
  subtitleAll: 'مقترحات جميع اللجان ومتابعة حالتها',
  subtitleScoped: 'مقترحات لجانك ومنجزات اللجان الأخرى',
  submitProposal: 'تقديم مقترح',
  searchPlaceholder: 'ابحث في المقترحات…',
  scopeTitle: 'تصفية حسب اللجنة',
  scopeAllCommittees: 'كل اللجان',
  scopeAllAvailable: 'كل المقترحات المتاحة',
  scopeMine: 'لجاني',
  statusAll: 'الكل',
  proposalsCount: (count: number) => `عدد المقترحات: ${count}`,
  emptyTitle: 'لا توجد مقترحات مطابقة',
} as const;
