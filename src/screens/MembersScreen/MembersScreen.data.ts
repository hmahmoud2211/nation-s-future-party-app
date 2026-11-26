import type { Role } from '@/features/members/types';

/** Order of the role filter chips (lowest first). */
export const ROLE_FILTERS: Role[] = ['member', 'board_member', 'assistant_secretary', 'sector_secretary', 'admin'];

/** Members list copy. */
export const membersCopy = {
  statusAll: 'الكل',
  statusActive: 'سارية',
  statusInactive: 'غير نشط',
  statusSuspended: 'موقوفة',
  allRoles: 'كل الأدوار',

  adminTitle: 'إدارة الأعضاء',
  committeeTitle: 'أعضاء اللجنة',
  adminSubtitle: 'جميع الأعضاء التجريبيين في القطاع',
  scopeSubtitle: (count: number) => `${count} لجان ضمن نطاقك`,
  addMember: 'إضافة عضو',

  searchPlaceholder: 'ابحث باسم العضو…',
  allCommittees: 'كل اللجان',
  filterByCommittee: 'تصفية حسب اللجنة',
  resultsCount: (count: number) => `عدد النتائج: ${count}`,

  noMatches: 'لا توجد نتائج مطابقة',
  noMembers: 'لا يوجد أعضاء',
  emptyMessage: 'جرّب تغيير معايير البحث أو التصفية.',
} as const;
