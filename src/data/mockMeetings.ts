import type { Meeting, MeetingMode, MeetingStatus, RSVPStatus } from '@/features/meetings/types';
import { LEAD_OFFICIAL, mockMembers, SECTOR_SECRETARY_ID } from '@/data/mockMembers';
import { daysFromNow } from '@/utils/dates';

const OFFICIAL = LEAD_OFFICIAL;

/** [committee, title, dayOffset, hour, mode, location, agenda[], status, minutes?] */
type Row = [string, string, number, number, MeetingMode, string, string[], MeetingStatus, string?, unknown?];

const rows: Row[] = [
  ['c-tech', 'الاجتماع الشهري للجنة التكنولوجيا', 3, 18, 'in_person', 'مقر الأمانة المركزية — قاعة الاجتماعات (أ)', ['متابعة منصة الخدمات الرقمية', 'عرض النموذج الأولي', 'خطة ورش المهارات الرقمية', 'ما يستجد من أعمال'], 'scheduled', undefined],
  ['c-tech', 'جلسة مراجعة تصميم الواجهات', 8, 19, 'online', 'اجتماع مرئي — الرابط يُرسل لاحقاً', ['مراجعة ملاحظات المستخدمين', 'اعتماد التعديلات النهائية'], 'scheduled', undefined],
  ['c-tech', 'اجتماع إطلاق برنامج المهارات الرقمية', -12, 18, 'in_person', 'مقر الأمانة المركزية — القاعة الكبرى', ['أهداف البرنامج', 'توزيع المهام', 'الجدول الزمني'], 'completed', 'تم الاتفاق على تنفيذ أربع ورش خلال الربع القادم، وتكليف أحمد محمد بمراجعة المحتوى التدريبي، ونورهان عاطف بحصر الاحتياجات.'],
  ['c-tech', 'اجتماع متابعة دراسة الجاهزية الرقمية', -35, 17, 'online', 'اجتماع مرئي', ['عرض النتائج الأولية', 'خطة التقرير النهائي'], 'completed', 'تم استعراض النتائج الأولية والاتفاق على تسليم التقرير النهائي خلال أسبوعين.'],
  ['c-investment', 'الاجتماع الدوري للجنة الاستثمار', 5, 18, 'in_person', 'مقر الأمانة المركزية — قاعة الاجتماعات (ب)', ['مراجعة مسودة دليل المستثمر', 'التحضير لملتقى فرص الاستثمار', 'التقرير الشهري'], 'scheduled', undefined],
  ['c-investment', 'ورشة صياغة دليل الإجراءات', -9, 17, 'in_person', 'مقر الأمانة المركزية', ['توزيع فصول الدليل', 'معايير الصياغة المبسطة'], 'completed', 'تم توزيع فصول الدليل على الأعضاء، والاتفاق على معايير موحدة للصياغة المبسطة.'],
  ['c-investment', 'اجتماع تنسيقي مع غرف التجارة', 14, 12, 'online', 'اجتماع مرئي', ['آليات التعاون', 'الفرص المقترحة للملتقى'], 'scheduled'],
  ['c-industry', 'اجتماع لجنة الصناعة الشهري', 4, 17, 'in_person', 'مقر الأمانة المركزية — قاعة (ج)', ['نتائج الزيارات الميدانية', 'خطة ورقة التوصيات'], 'scheduled', undefined],
  ['c-industry', 'لقاء تشاوري مع المصنعين', -6, 13, 'in_person', 'إحدى المناطق الصناعية (موقع تجريبي)', ['التحديات التشغيلية', 'مقترحات الحلول'], 'completed', 'رصد 12 تحدياً رئيسياً، أبرزها إجراءات التراخيص وتكلفة الطاقة، وتكليف الأعضاء بصياغة التوصيات.'],
  ['c-realestate', 'اجتماع لجنة التطوير العقاري', 6, 18, 'in_person', 'مقر الأمانة المركزية', ['نتائج الدراسة المقارنة', 'تنسيق جلسات الاستماع'], 'scheduled'],
  ['c-entre', 'اجتماع لجنة التحكيم', 10, 17, 'online', 'اجتماع مرئي', ['معايير التحكيم', 'توزيع الطلبات على المحكمين'], 'scheduled', undefined],
  ['c-entre', 'اجتماع إطلاق المسابقة', -30, 18, 'in_person', 'مقر الأمانة المركزية', ['خطة الإطلاق', 'قنوات الترويج'], 'completed', 'تم إطلاق المسابقة رسمياً، والاتفاق على متابعة الطلبات أسبوعياً.'],
  ['c-trade', 'اجتماع لجنة التجارة', 7, 18, 'in_person', 'مقر الأمانة المركزية', ['خريطة فرص التصدير', 'ورشة المصدرين'], 'scheduled'],
  ['c-tourism', 'اجتماع لجنة السياحة والضيافة', 9, 17, 'online', 'اجتماع مرئي', ['نتائج رصد تجربة الزائر', 'خطة الورش'], 'scheduled'],
  ['c-industry', 'اجتماع ملف كفاءة الطاقة بلجنة الصناعة', 2, 18, 'in_person', 'مقر الأمانة المركزية', ['إصدار دليل كفاءة الطاقة', 'التحضير لملتقى الاقتصاد الأخضر'], 'scheduled'],
  ['c-social', 'اجتماع لجنة المسؤولية المجتمعية', 11, 17, 'in_person', 'مقر الأمانة المركزية', ['تصنيف المبادرات', 'خطة دليل المبادرات'], 'scheduled'],
  ['c-studies', 'اجتماع هيئة تحرير المرصد', 1, 16, 'online', 'اجتماع مرئي', ['محاور العدد الثالث', 'مصادر البيانات'], 'scheduled'],
  ['c-markets', 'اجتماع لجنة الأسواق المالية', 12, 18, 'in_person', 'مقر الأمانة المركزية', ['مراجعة المحتوى التوعوي', 'خطة النشر'], 'scheduled'],
  ['c-markets', 'اجتماع تخطيط الحملة التوعوية', -20, 18, 'online', 'اجتماع مرئي', ['أهداف الحملة', 'الفئات المستهدفة'], 'completed', 'تم الاتفاق على خمس رسائل رئيسية للحملة وجدول زمني للنشر.'],
  ['c-studies', 'اجتماع مراجعة العدد الثاني', -28, 16, 'online', 'اجتماع مرئي', ['ملاحظات القراء', 'تحسينات الإخراج'], 'cancelled'],
];

function committeeAttendees(committeeId: string) {
  return mockMembers.filter((m) => m.committeeIds.includes(committeeId)).map((m) => m.id);
}

const committeeMeetings: Meeting[] = rows.map((r, i) => {
  const [committeeId, title, offset, hour, mode, location, agenda, status, minutes] = r;
  const attendeeIds = committeeAttendees(committeeId);
  const rsvps: Record<string, RSVPStatus> = {};
  attendeeIds.forEach((id, idx) => {
    if (status === 'completed') rsvps[id] = idx % 5 === 4 ? 'declined' : 'going';
    else if (id === 'u-ahmed' || id === 'u-mona') rsvps[id] = 'pending';
    else rsvps[id] = idx % 3 === 0 ? 'going' : idx % 4 === 1 ? 'declined' : 'pending';
  });
  return {
    id: `mt-${String(i + 1).padStart(2, '0')}`,
    title,
    committeeId,
    date: daysFromNow(offset, hour),
    durationMin: mode === 'online' ? 60 : 90,
    location,
    mode,
    agenda,
    attendeeIds,
    rsvps,
    minutes,
    createdBy: OFFICIAL[committeeId],
    status,
    conference: mode === 'online' ? { provider: 'mock', roomId: `room-mt-${String(i + 1).padStart(2, '0')}` } : undefined,
    createdAt: daysFromNow(Math.min(offset, 0) - 7),
  };
});

// ───────────── General meetings (not tied to a committee) ─────────────

const bureau = mockMembers.filter((m) => ['sector_secretary', 'assistant_secretary', 'board_member'].includes(m.role)).map((m) => m.id);
const assistants = mockMembers.filter((m) => m.role === 'assistant_secretary').map((m) => m.id);
const minutesAgo = (n: number) => new Date(Date.now() - n * 60000).toISOString();

const allGoing = (ids: string[], pendingEvery = 0): Record<string, RSVPStatus> =>
  Object.fromEntries(ids.map((id, idx) => [id, pendingEvery && idx % pendingEvery === pendingEvery - 1 ? 'pending' : 'going']));

const generalMeetings: Meeting[] = [
  {
    id: 'mt-g1',
    title: 'اجتماع تنسيق المحافظات',
    committeeId: null,
    date: minutesAgo(10),
    durationMin: 60,
    location: 'اجتماع مرئي داخل التطبيق',
    mode: 'online',
    description: 'متابعة أنشطة الأمانة في المحافظات ومقترحات أمناء المحافظات.',
    agenda: ['عرض الأنشطة المنفذة في المحافظات', 'المقترحات الواردة من المحافظات', 'خطة الشهر القادم'],
    attendeeIds: [SECTOR_SECRETARY_ID, ...assistants],
    rsvps: allGoing([SECTOR_SECRETARY_ID, ...assistants]),
    createdBy: SECTOR_SECRETARY_ID,
    status: 'live',
    conference: { provider: 'mock', roomId: 'room-mt-g1', startedAt: minutesAgo(8), startedBy: SECTOR_SECRETARY_ID },
    createdAt: daysFromNow(-5),
  },
  {
    id: 'mt-g2',
    title: 'الاجتماع الشهري لهيئة مكتب الأمانة',
    committeeId: null,
    date: daysFromNow(2, 19),
    durationMin: 90,
    location: 'اجتماع مرئي داخل التطبيق',
    mode: 'online',
    description: 'مراجعة أداء اللجان والمقترحات المعلقة والموقف المالي للمشروعات.',
    agenda: ['أداء اللجان خلال الشهر', 'المقترحات بانتظار القرار', 'الموقف المالي للمشروعات', 'ما يستجد من أعمال'],
    attendeeIds: bureau,
    rsvps: allGoing(bureau, 3),
    createdBy: SECTOR_SECRETARY_ID,
    status: 'scheduled',
    conference: { provider: 'mock', roomId: 'room-mt-g2' },
    createdAt: daysFromNow(-3),
  },
  {
    id: 'mt-g3',
    title: 'لقاء متابعة المقترحات الجديدة',
    committeeId: null,
    date: daysFromNow(-12, 18),
    durationMin: 60,
    location: 'مقر الأمانة المركزية — قاعة الاجتماعات (أ)',
    mode: 'in_person',
    description: 'مناقشة المقترحات المقدمة من اللجان خلال الشهر الماضي.',
    agenda: ['عرض المقترحات الجديدة', 'تحديد أولويات التنفيذ'],
    attendeeIds: bureau.slice(0, 12),
    rsvps: allGoing(bureau.slice(0, 12)),
    minutes: 'تمت مناقشة سبعة مقترحات، والموافقة المبدئية على ثلاثة منها، وطلب استكمال بيانات الباقي.',
    createdBy: SECTOR_SECRETARY_ID,
    status: 'completed',
    createdAt: daysFromNow(-20),
  },
];

export const mockMeetings: Meeting[] = [...generalMeetings, ...committeeMeetings];
