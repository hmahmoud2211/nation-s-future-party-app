import { localizeDigits } from '@/utils/format';

/** In-meeting (video call) copy. */
export const meetingCallCopy = {
  endedToast: 'انتهى الاجتماع',
  notJoinable: 'الاجتماع غير متاح للانضمام الآن',
  notFound: 'الاجتماع غير موجود',
  joinHint: 'يمكن الانضمام عندما يبدأ المنظم الاجتماع المرئي.',
  back: 'رجوع',

  leaveDialogTitle: 'مغادرة الاجتماع',
  leaveDialogMessage: 'هل تريد إنهاء الاجتماع للجميع، أم المغادرة فقط مع بقاء الاجتماع جارياً؟',
  leaveDialogConfirm: 'إنهاء للجميع',
  leaveDialogCancel: 'مغادرة فقط',
  endedForAllToast: 'تم إنهاء الاجتماع',

  connectedStatus: (elapsed: string, participants: number) => `${elapsed} • ${localizeDigits(participants)} مشاركين`,
  connecting: 'جارٍ الاتصال…',
  simulatedBadge: 'تجريبي',
  simulatedNotice: 'واجهة اجتماع تجريبية — لا يتم نقل أي صوت أو صورة. يمكن ربط مزود اتصال حقيقي لاحقاً.',
  connectingToMeeting: 'جارٍ الاتصال بالاجتماع…',
  youSuffix: (name: string) => `${name} (أنت)`,
  cameraOn: 'الكاميرا مفعّلة (محاكاة)',
  you: 'أنت',

  mute: 'كتم',
  unmute: 'إلغاء الكتم',
  cameraStop: 'إيقاف الكاميرا',
  cameraStart: 'تشغيل الكاميرا',
  showGrid: 'عرض الشبكة',
  participants: 'المشاركون',
  leave: 'مغادرة',
} as const;
