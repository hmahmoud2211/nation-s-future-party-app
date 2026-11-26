import { localizeDigits } from '@/utils/format';

/** Meeting details copy. */
export const meetingDetailsCopy = {
  title: 'تفاصيل الاجتماع',
  unauthorized: 'غير مصرح',
  notFound: 'الاجتماع غير موجود',
  back: 'رجوع',
  generalMeeting: 'اجتماع عام',

  durationLabel: (min: number) => {
    if (min === 60) return 'ساعة';
    if (min === 90) return 'ساعة ونصف';
    if (min === 120) return 'ساعتان';
    return `${localizeDigits(min)} دقيقة`;
  },
  timeWithDuration: (time: string, duration: string) => `${time} • ${duration}`,

  rsvpGoingToast: 'تم تأكيد حضورك بنجاح',
  rsvpDeclinedToast: 'تم تسجيل اعتذارك عن الحضور',
  minutesRequired: 'يرجى كتابة محضر الاجتماع',
  minutesSavedToast: 'تم تسجيل محضر الاجتماع بنجاح',

  cancelDialogTitle: 'إلغاء الاجتماع؟',
  cancelDialogMessage: 'سيتم إشعار جميع المدعوين بإلغاء الاجتماع. لا يمكن التراجع عن هذا الإجراء.',
  cancelDialogConfirm: 'إلغاء الاجتماع',
  cancelDialogDismiss: 'تراجع',
  cancelledToast: 'تم إلغاء الاجتماع وإشعار المدعوين',

  startDialogTitle: 'بدء الاجتماع المرئي؟',
  startDialogMessage: 'سيتم إشعار المشاركين بأن الاجتماع بدأ ويمكنهم الانضمام.',
  startDialogConfirm: 'بدء الاجتماع',

  endDialogTitle: 'إنهاء الاجتماع للجميع؟',
  endDialogMessage: 'سيتم إغلاق الاجتماع المرئي واعتباره منعقداً.',
  endDialogConfirm: 'إنهاء',
  endedToast: 'تم إنهاء الاجتماع',

  joinMeeting: 'انضمام إلى الاجتماع',
  rsvpGoingDone: 'تم تأكيد الحضور',
  rsvpGoing: 'تأكيد الحضور',
  rsvpDeclinedDone: 'تم الاعتذار',
  rsvpDecline: 'الاعتذار',

  edit: 'تعديل',
  updateMinutes: 'تحديث المحضر',
  recordMinutes: 'تسجيل المحضر',
  cancel: 'إلغاء',

  conferenceLive: 'الاجتماع المرئي جارٍ الآن',
  conferenceScheduled: 'اجتماع مرئي — لم يبدأ بعد',
  conferenceEnded: 'انتهى الاجتماع المرئي',
  conferenceStartedAt: (relative: string) => `بدأ ${relative}`,
  conferenceStartHint: 'ابدأ الاجتماع في موعده ليتمكن المشاركون من الانضمام',
  conferenceWaitHint: 'يمكنك الانضمام عندما يبدأ المنظم الاجتماع',
  conferenceReviewHint: 'يمكن مراجعة المحضر أدناه',
  startMeeting: 'بدء الاجتماع',
  endForAll: 'إنهاء الاجتماع للجميع',
  simulatedNotice: 'الاتصال المرئي في هذه النسخة تجريبي — لا يتم نقل صوت أو صورة.',

  dateLabel: 'التاريخ',
  timeLabel: 'الوقت',
  durationLabelTitle: 'المدة',
  typeLabel: 'النوع',
  locationLabel: 'المكان',
  onlineMeeting: 'اجتماع مرئي',
  committeeLabel: 'اللجنة',
  organizerLabel: 'المنظم',
  emptyValue: '—',

  descriptionTitle: 'الوصف',
  agendaTitle: 'جدول الأعمال',
  noAgenda: 'لم يُحدَّد جدول أعمال',
  minutesTitle: 'محضر الاجتماع',
  noMinutes: 'لم يُسجَّل المحضر بعد.',

  attendeesTitle: 'المدعوون',
  countGoing: 'مؤكد',
  countDeclined: 'معتذر',
  countPending: 'بانتظار الرد',
  youSuffix: (name: string) => `${name} (أنت)`,

  minutesSheetTitle: 'محضر الاجتماع',
  minutesSheetSubtitle: 'سيُعتبر الاجتماع منعقداً ويُشعَر المدعوون بنشر المحضر',
  saveMinutes: 'حفظ المحضر',
  minutesField: 'نص المحضر',
  minutesPlaceholder: 'أبرز ما تمت مناقشته والقرارات والتكليفات…',
} as const;
