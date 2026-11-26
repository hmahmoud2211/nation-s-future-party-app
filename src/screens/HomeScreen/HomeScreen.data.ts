import { formatNumber, formatPercent } from '@/utils/format';

/** Home page copy (text from the Figma design). */
export const homeCopy = {
  performanceTitle: 'أداء الحزب',
  previousMeeting: 'الاجتماع السابق',
  nextMeeting: 'الاجتماع القادم',
  none: 'لا يوجد',
  labelSuffix: (label: string) => `${label} :`,
  meetingA11y: (label: string, weekday: string, date: string, title: string) => `${label} ${weekday} ${date} — ${title}`,
  meetingA11yNone: (label: string) => `${label} لا يوجد`,
  openMeetingHint: 'فتح تفاصيل الاجتماع',
  openMeetingsHint: 'فتح الاجتماعات',

  initiativesTitle: 'عدد المبادرات',
  initiativesTotalA11y: (total: number) => `إجمالي المبادرات ${formatNumber(total)}`,
  showProposalsHint: 'عرض المقترحات',
  ringInProgress: 'جاري التنفيذ',
  ringCompleted: 'تم التنفيذ',
  ringUnderStudy: 'قيد الدراسة',

  implementedTitle: 'عدد المبادرات التي تم تنفيذها',
  implementedA11y: (points: { label: string; value: number }[]) => `المبادرات المنفذة شهرياً: ${points.map((d) => `${d.label} ${formatNumber(d.value)}`).join('، ')}`,

  submitProposal: 'تقديم مقترح',
  newMeeting: 'اجتماع جديد',
  events: 'الفعاليات',

  governoratesTitle: 'المحافظات',
  governorateOption: (name: string) => `محافظة ${name}`,
  chooseGovernorate: 'اختر المحافظة',
  governorateSecretary: 'أمين المحافظة',
  contactNumber: 'رقم التواصل',
  emptyValue: '—',
  initiativesCount: 'عدد المبادرات',
  rating: 'التقييم :',
  ratingA11y: (name: string, rate: number) => `تقييم محافظة ${name} ${formatPercent(rate)}`,

  newsTitle: 'أهم الأخبار',
  noNews: 'لا توجد أخبار حالياً',
  unreadSuffix: '، غير مقروء',
  generalAnnouncement: 'إعلان عام',
  allNews: 'عرض كل الأخبار',
} as const;
