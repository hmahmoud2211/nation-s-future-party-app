/** Announcement details copy. */
export const announcementDetailsCopy = {
  title: 'الإعلان',
  unavailable: 'هذا الإعلان غير متاح لك',
  notFound: 'الإعلان غير موجود',
  sectorWide: 'إعلان عام للقطاع',
  priorityBadge: (label: string) => `أولوية: ${label}`,
  unknownInitial: '؟',
  emptyValue: '—',
  publishedAt: 'تاريخ النشر',
  target: 'الجهة المستهدفة',
  allSectorMembers: 'جميع أعضاء القطاع',
  readStatus: 'حالة القراءة',
  readByCount: (count: number) => `قرأه ${count} عضو`,
  read: 'مقروء',
} as const;
