import { formatNumber, formatPercent } from '@/utils/format';

/** Home page copy (text from the Figma design). */
export const homeCopy = {
  performanceTitle: 'أداء الحزب',
  previousMeeting: 'الاجتماع السابق',
  nextMeeting: 'الاجتماع القادم',
  noPreviousMeeting: 'لا يوجد اجتماع سابق',
  noNextMeeting: 'لا يوجد اجتماع قادم',
  liveNow: 'جارٍ الآن',
  /** "الجمعة 20 نوفمبر" */
  meetingWhen: (weekday: string, date: string) => `${weekday} ${date}`,
  meetingA11y: (label: string, title: string, when: string, time: string, status: string) => `${label}: ${title}، ${when} ${time}، ${status}`,
  meetingA11yNone: (label: string) => `${label}: لا يوجد`,
  openMeetingHint: 'فتح تفاصيل الاجتماع',
  openMeetingsHint: 'فتح الاجتماعات',

  initiativesTitle: 'عدد المبادرات',
  initiativesTotalA11y: (total: number) => `إجمالي المبادرات ${formatNumber(total)}`,
  showProposalsHint: 'عرض المقترحات',
  ringInProgress: 'جاري التنفيذ',
  ringCompleted: 'تم التنفيذ',
  ringUnderStudy: 'قيد الدراسة',

  implementedTitle: 'عدد المبادرات التي تم تنفيذها',
  /** Caption beside the period total above the chart. */
  implementedSummary: (months: number) => `إجمالي المبادرات المنفّذة خلال آخر ${formatNumber(months)} أشهر`,
  implementedA11y: (points: { label: string; value: number }[]) => `المبادرات المنفذة شهرياً: ${points.map((d) => `${d.label} ${formatNumber(d.value)}`).join('، ')}`,

  submitProposal: 'تقديم مقترح',
  newMeeting: 'اجتماع جديد',
  events: 'الفعاليات',

  governoratesTitle: 'المحافظات',
  governorateOption: (name: string) => `محافظة ${name}`,
  chooseGovernorate: 'اختر المحافظة',
  governorateSecretary: 'أمين المحافظة',
  noSecretary: 'لم يُحدَّد أمين بعد',
  secretaryA11y: (name: string, phone: string) => `أمين المحافظة ${name}، رقم التواصل ${phone}`,
  initiativesCount: 'عدد المبادرات',
  initiativesTotal: (total: number) => `الإجمالي ${formatNumber(total)}`,
  rating: 'التقييم',
  ratingA11y: (name: string, rate: number) => `تقييم محافظة ${name} ${formatPercent(rate)}`,

  newsTitle: 'أهم الأخبار',
  noNews: 'لا توجد أخبار حالياً',
  unreadSuffix: '، غير مقروء',
  generalAnnouncement: 'إعلان عام',
  allNews: 'عرض كل الأخبار',
} as const;
