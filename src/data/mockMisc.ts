import type { Announcement, AnnouncementCategory, AnnouncementPriority } from '@/features/announcements/types';
import type { AppNotification, NotificationType } from '@/features/notifications/types';
import type { CommitteeReport } from '@/features/reports/types';
import type { AdminRequest, RequestStatus, RequestType } from '@/features/requests/types';
import type { WeatherSnapshot } from '@/types/common.types';
import { daysAgo, hoursAgo } from '@/utils/dates';
import { LEAD_OFFICIAL } from '@/data/mockMembers';

// ───────────────────────────── Notifications ─────────────────────────────

/** [recipient, type, title, body, hoursAgo, read, link?] */
type NRow = [string, NotificationType, string, string, number, boolean, string?];

const nRows: NRow[] = [
  // الأمين
  ['u-sector', 'proposal_new', 'مقترح جديد', 'قدّم أحمد قدري الخميسي محمد الغيطاني مقترح "حاضنة أعمال للشباب في المنيا".', 20, false, '/proposals/pr-07'],
  ['u-sector', 'proposal_new', 'مقترح جديد', 'قدّم محمد توفيق محمد توفيق القفاص مقترح "برنامج المهارات الرقمية لأصحاب المشروعات".', 70, false, '/proposals/pr-13'],
  ['u-sector', 'announcement_new', 'تقرير جديد', 'قدمت لجنة الاستثمار تقريرها الشهري.', 60, false, '/report/rp-01'],
  ['u-sector', 'meeting_started', 'بدأ الاجتماع الآن', 'بدأ "اجتماع تنسيق المحافظات" — يمكنك الانضمام الآن.', 0.1, true, '/meetings/mt-g1'],

  // Assistant secretaries
  ['u-fekry', 'meeting_started', 'بدأ الاجتماع الآن', 'بدأ "اجتماع تنسيق المحافظات" — يمكنك الانضمام الآن.', 0.1, false, '/meetings/mt-g1'],
  ['u-fekry', 'proposal_update', 'تحديث حالة مقترح', '«ملتقى المستثمرين في الصعيد»: تمت الموافقة', 300, true, '/proposals/pr-02'],
  ['u-shoukry', 'meeting_started', 'بدأ الاجتماع الآن', 'بدأ "اجتماع تنسيق المحافظات" — يمكنك الانضمام الآن.', 0.1, false, '/meetings/mt-g1'],
  ['u-alaa', 'proposal_update', 'تحديث حالة مقترح', '«معرض دائم للمنتجات المحلية في بورسعيد»: مرفوض', 400, false, '/proposals/pr-10'],

  // Board members / committee responsible
  ['u-zayat', 'feedback_new', 'ملاحظة جديدة على مشروع', 'أرسل محمد عصام مقترحاً على مشروع منصة الخدمات الرقمية.', 3, false, '/feedback/fb-04'],
  ['u-zayat', 'meeting_new', 'اجتماع جديد', 'تمت دعوتك إلى "الاجتماع الشهري لهيئة مكتب الأمانة".', 30, false, '/meetings/mt-g2'],
  ['u-ayad', 'proposal_update', 'تحديث حالة مقترح', '«منصة موحدة لفرص الاستثمار بالمحافظات»: قيد المراجعة', 120, false, '/proposals/pr-01'],
  ['u-ayad', 'feedback_new', 'ملاحظة جديدة', 'أرسلت منى عبد الرحمن ملاحظة على مقترح المنصة الموحدة.', 60, true, '/feedback/fb-01'],
  ['u-hesham', 'feedback_new', 'ملاحظة جديدة', 'أرسلت هبة الله ناصر ملاحظة على الجدول الزمني لمشروع رصد التحديات.', 28, false, '/feedback/fb-06'],
  ['u-emad', 'proposal_update', 'تحديث حالة مقترح', '«دعم المشروعات المنزلية للمرأة المعيلة»: تمت الموافقة', 360, true, '/proposals/pr-14'],

  // Sample members
  ['u-ahmed', 'meeting_new', 'اجتماع جديد', 'تمت دعوتك إلى "الاجتماع الشهري للجنة التكنولوجيا".', 48, false, '/meetings/mt-01'],
  ['u-ahmed', 'announcement_new', 'إعلان جديد', 'إعلان: مواعيد الورش التدريبية للربع القادم.', 72, true, '/announcements/an-02'],
  ['u-mona', 'feedback_reply', 'رد على ملاحظتك', 'رد مسؤول اللجنة على ملاحظتك بخصوص منصة فرص الاستثمار.', 50, false, '/feedback/fb-01'],
  ['u-mona', 'project_update', 'تحديث مشروع', 'تمت إضافة ملاحظة جديدة على مشروع "دليل الإجراءات الميسرة للمستثمرين".', 70, false, '/projects/p-03'],

  // Admin
  ['u-admin', 'request_update', 'طلب إداري جديد', 'طلب دعم فني جديد من أحد الأعضاء.', 10, false, '/requests/rq-04'],
];

export const mockNotifications: AppNotification[] = nRows.map(([recipientId, type, title, body, h, read, link], i) => ({
  id: `n-${String(i + 1).padStart(2, '0')}`,
  recipientId,
  type,
  title,
  body,
  createdAt: hoursAgo(h),
  read,
  link,
}));

// ───────────────────────────── Announcements ─────────────────────────────

/** [committee|null, title, body, priority, category, author, daysAgo, readBy[]] */
type ARow = [string | null, string, string, AnnouncementPriority, AnnouncementCategory, string, number, string[]];

const aRows: ARow[] = [
  [null, 'انطلاق النسخة التجريبية من تطبيق قطاع الأعمال', 'يسر أمانة قطاع الأعمال المركزية إطلاق النسخة التجريبية من التطبيق لتيسير متابعة أعمال اللجان. نرحب بملاحظاتكم عبر قسم الطلبات الإدارية.', 'important', 'general', 'u-sector', 1, []],
  ['c-tech', 'مواعيد الورش التدريبية للربع القادم', 'تعلن لجنة التكنولوجيا والتحول الرقمي عن جدول ورش برنامج المهارات الرقمية للربع القادم. يرجى تأكيد المشاركة من خلال قسم الأنشطة.', 'normal', 'event', 'u-zayat', 3, ['u-ahmed']],
  ['c-tech', 'تذكير: موعد تسليم النموذج الأولي', 'نذكر فريق منصة الخدمات الرقمية بأن موعد تسليم النموذج الأولي خلال أسبوعين.', 'urgent', 'administrative', 'u-zayat', 2, []],
  [null, 'إطلاق خاصية المقترحات', 'يمكن لمسؤولي اللجان الآن تقديم المقترحات ومتابعة حالتها من تبويب «المقترحات».', 'important', 'administrative', 'u-sector', 6, ['u-ahmed', 'u-mona']],
  ['c-investment', 'دعوة لحضور لقاء المستثمرين الجدد', 'تدعو لجنة الاستثمار أعضاءها لحضور لقاء المستثمرين الجدد والمشاركة في عرض مسودة الدليل.', 'normal', 'event', 'u-ayad', 4, []],
  ['c-investment', 'تغيير موعد الاجتماع الدوري', 'تقرر تعديل موعد الاجتماع الدوري للجنة ليصبح في السادسة مساءً.', 'important', 'meeting', 'u-ayad', 9, ['u-mona']],
  ['c-industry', 'نتائج اللقاء التشاوري مع المصنعين', 'تم رفع محضر اللقاء التشاوري مع المصنعين في قسم الاجتماعات.', 'normal', 'meeting', 'u-hesham', 5, []],
  [null, 'التقارير الشهرية للجان', 'يرجى من مسؤولي اللجان تقديم التقارير الشهرية قبل نهاية الشهر الجاري.', 'urgent', 'administrative', 'u-sector', 2, []],
  ['c-entre', 'فتح باب التحكيم في مسابقة الأفكار', 'بدأت مرحلة التحكيم في مسابقة أفكار ريادة الأعمال للشباب.', 'normal', 'event', 'u-ghitany', 7, []],
  ['c-trade', 'ورشة متطلبات التصدير', 'تعلن لجنة التجارة عن ورشة متطلبات التصدير للمصدرين الجدد.', 'normal', 'event', 'u-zallat', 8, []],
  ['c-industry', 'إصدار دليل كفاءة الطاقة قريباً', 'تستعد لجنة الصناعة لإصدار دليل كفاءة الطاقة للمنشآت الصناعية والتجارية.', 'normal', 'general', 'u-hesham', 10, []],
  [null, 'تهنئة بمناسبة إنجاز دراسة الجاهزية الرقمية', 'تتقدم أمانة القطاع بالتهنئة لفريق دراسة جاهزية الشركات للتحول الرقمي على إنجاز الدراسة.', 'normal', 'general', 'u-sector', 20, ['u-ahmed']],
  ['c-social', 'مبادرة دعم المشروعات المنزلية', 'تدعو لجنة المسؤولية المجتمعية الأعضاء للمشاركة في مبادرة دعم المشروعات المنزلية.', 'normal', 'event', 'u-emad', 4, []],
  ['c-studies', 'صدور العدد الثاني من المرصد', 'صدر العدد الثاني من مرصد المؤشرات الاقتصادية الشهري.', 'normal', 'general', 'u-morgan', 25, []],
  ['c-markets', 'حملة الثقافة المالية', 'انطلاق المرحلة الأولى من حملة الثقافة المالية لرواد الأعمال.', 'normal', 'event', 'u-yehia', 12, []],
];

export const mockAnnouncements: Announcement[] = aRows.map(([committeeId, title, body, priority, category, createdBy, ago, readBy], i) => ({
  id: `an-${String(i + 1).padStart(2, '0')}`,
  title,
  body,
  committeeId,
  priority,
  category,
  createdBy,
  createdAt: daysAgo(ago, 9 + (i % 6)),
  readBy,
  attachments: [],
}));

// ───────────────────────────── Administrative requests ─────────────────────────────

type RRow = [RequestType, string, string, string, string, RequestStatus, number, [string, string, number][]];

const rRows: RRow[] = [
  ['data_update', 'تحديث رقم الهاتف', 'أرجو تحديث رقم الهاتف المسجل في بياناتي إلى الرقم الجديد.', 'u-ahmed', 'c-tech', 'resolved', 10, [['u-zayat', 'تم تحديث البيانات في النظام التجريبي.', 9]]],
  ['document', 'طلب إفادة عضوية', 'أرجو إصدار إفادة بعضويتي في لجنة التكنولوجيا لتقديمها لجهة عملي.', 'u-ahmed', 'c-tech', 'under_review', 2, [['u-zayat', 'تم استلام الطلب وجارٍ التنسيق مع الأمانة.', 1]]],
  ['admin_inquiry', 'آلية الانضمام لأكثر من لجنة', 'هل يمكن للعضو الانضمام لأكثر من لجنة في نفس الوقت؟', 'u-m14', 'c-entre', 'resolved', 20, [['u-ghitany', 'نعم، وفق موافقة مسؤولي اللجان المعنية.', 19]]],
  ['tech_support', 'مشكلة في عرض المرفقات', 'لا يظهر اسم الملف المرفق بشكل كامل في تفاصيل المشروع.', 'u-m03', 'c-tech', 'new', 0, []],
  ['data_update', 'تصحيح الاسم', 'يرجى تصحيح كتابة اسمي في بيانات العضوية.', 'u-m09', 'c-industry', 'closed', 40, [['u-hesham', 'تم التصحيح.', 39]]],
  ['document', 'طلب شهادة مشاركة', 'أرجو إصدار شهادة مشاركة في برنامج الجودة الصناعية.', 'u-m08', 'c-industry', 'info_requested', 5, [['u-hesham', 'يرجى تحديد تاريخ البرنامج الذي شاركت فيه.', 4]]],
  ['admin_inquiry', 'مواعيد الاجتماعات الدورية', 'هل هناك جدول ثابت للاجتماعات الدورية للجنة؟', 'u-m05', 'c-investment', 'resolved', 15, [['u-ayad', 'نعم، الاجتماع الدوري في الأسبوع الأول من كل شهر.', 14]]],
  ['tech_support', 'لا تصلني الإشعارات', 'لا تظهر لي إشعارات الاجتماعات الجديدة.', 'u-m06', 'c-investment', 'under_review', 3, [['u-ayad', 'تم تحويل الطلب للدعم الفني.', 2]]],
  ['data_update', 'إضافة بريد إلكتروني', 'أرجو إضافة بريد إلكتروني للتواصل.', 'u-m17', 'c-tourism', 'resolved', 25, [['u-nowishy', 'تمت الإضافة.', 24]]],
  ['document', 'طلب نسخة من محضر اجتماع', 'أرجو الحصول على نسخة من محضر اجتماع إطلاق المسابقة.', 'u-m13', 'c-entre', 'closed', 28, [['u-ghitany', 'المحضر متاح في قسم الاجتماعات.', 27]]],
  ['admin_inquiry', 'التطوع في الأنشطة', 'كيف يمكنني التطوع في تنظيم أنشطة اللجنة؟', 'u-m19', 'c-social', 'under_review', 4, []],
  ['tech_support', 'نسيت كلمة المرور', 'لا أتذكر كلمة المرور الخاصة بالتطبيق التجريبي.', 'u-m21', 'c-markets', 'resolved', 12, [['u-yehia', 'كلمة المرور التجريبية لجميع الحسابات موضحة في شاشة الدخول.', 11]]],
];

export const mockRequests: AdminRequest[] = rRows.map(([type, subject, description, authorId, committeeId, status, ago, replies], i) => {
  const id = `rq-${String(i + 1).padStart(2, '0')}`;
  return {
    id,
    seq: 801 + i,
    type,
    subject,
    description,
    authorId,
    committeeId,
    status,
    createdAt: daysAgo(ago, 10),
    updatedAt: replies.length ? daysAgo(replies[replies.length - 1][2], 14) : daysAgo(ago, 10),
    attachments: [],
    replies: replies.map(([a, message, d], idx) => ({
      id: `${id}-r${idx + 1}`,
      authorId: a,
      message,
      createdAt: daysAgo(d, 14),
      kind: status === 'info_requested' && idx === replies.length - 1 ? ('info_request' as const) : ('message' as const),
      attachments: [],
    })),
  };
});

// ───────────────────────────── Committee reports ─────────────────────────────

type RpRow = [string, string, string, string, string, string, number, 'submitted' | 'reviewed', string?, string?];

const rpRows: RpRow[] = [
  ['c-investment', 'التقرير الشهري للجنة الاستثمار', 'الشهر الماضي', 'استمر العمل على دليل الإجراءات الميسرة للمستثمرين، وعُقدت ورشة صياغة بمشاركة أعضاء اللجنة.', 'إنجاز 70% من دليل المستثمر، وتنظيم ورشة تيسير إجراءات التأسيس.', 'الحاجة إلى مراجعة قانونية متخصصة قبل الإصدار.', 3, 'submitted'],
  ['c-tech', 'التقرير الشهري للجنة التكنولوجيا', 'الشهر الماضي', 'تقدم ملحوظ في منصة الخدمات الرقمية وإطلاق برنامج المهارات الرقمية.', 'الانتهاء من تصميم الواجهات، وإطلاق البرنامج التدريبي، وإنجاز دراسة الجاهزية.', 'ضغط الجدول الزمني للنموذج الأولي.', 4, 'reviewed', 'تقرير متميز، يرجى إضافة مؤشرات كمية في التقارير القادمة.', 'u-sector'],
  ['c-industry', 'التقرير الشهري للجنة الصناعة', 'الشهر الماضي', 'تنفيذ الزيارات الميدانية وتنظيم لقاء تشاوري مع المصنعين.', 'رصد 12 تحدياً رئيسياً وإعداد مسودة التوصيات.', 'توقف مبادرة المكون المحلي مؤقتاً لحين توفر البيانات.', 5, 'submitted'],
  ['c-realestate', 'تقرير ربع سنوي — التطوير العقاري', 'الربع الماضي', 'إصدار دليل المدن الجديدة وبدء ورقة تنظيم إعادة البيع.', 'إصدار الدليل، وإنجاز الدراسة المقارنة.', 'صعوبة تنسيق مواعيد جلسات الاستماع.', 20, 'reviewed', 'تم الاطلاع، بالتوفيق.', 'u-shenawy'],
  ['c-entre', 'التقرير الشهري لريادة الأعمال', 'الشهر الماضي', 'إطلاق مسابقة الأفكار وتنظيم ورشة خطط العمل.', 'استقبال عدد كبير من الطلبات يفوق المستهدف.', 'الحاجة لمحكمين إضافيين.', 6, 'submitted'],
  ['c-trade', 'تقرير ربع سنوي — التجارة', 'الربع الماضي', 'إنجاز دراسة سلاسل الإمداد والعمل على خريطة فرص التصدير.', 'تنظيم منتدى سلاسل الإمداد.', 'تأخر بعض البيانات من المصادر.', 30, 'reviewed', 'جهد مقدر.', 'u-bahaa'],
  ['c-industry', 'تقرير ملف كفاءة الطاقة — الصناعة', 'الشهر الماضي', 'المراجعة الفنية لدليل كفاءة الطاقة وزيارة محطة طاقة شمسية.', 'الانتهاء من المحتوى الفني للدليل.', 'لا يوجد.', 7, 'submitted'],
  ['c-studies', 'التقرير الشهري للدراسات', 'الشهر الماضي', 'إصدار العدد الثاني من المرصد.', 'انتظام الإصدار الشهري.', 'إلغاء أحد الاجتماعات لظروف طارئة.', 9, 'reviewed', 'يرجى الالتزام بالاجتماعات الدورية.', 'u-zayed'],
  ['c-social', 'التقرير الشهري للمسؤولية المجتمعية', 'الشهر الماضي', 'حصر المبادرات وإطلاق مبادرة دعم المشروعات المنزلية.', 'إعداد نموذج حصر موحد.', 'محدودية عدد الأعضاء.', 8, 'submitted'],
  ['c-markets', 'التقرير الشهري للأسواق المالية', 'الشهر الماضي', 'إطلاق حملة الثقافة المالية وتنفيذ برنامج تدريبي.', 'أتم البرنامج 85 مشاركاً.', 'الحاجة لتبسيط المحتوى.', 10, 'submitted'],
  ['c-tourism', 'التقرير الشهري للسياحة والضيافة', 'الشهر الماضي', 'رصد تجربة الزائر في عدد من المقاصد.', 'إنجاز الرصد الميداني.', 'تنسيق مواعيد الورش.', 11, 'submitted'],
  ['c-tech', 'تقرير ربع سنوي — التكنولوجيا', 'الربع الماضي', 'ملخص أعمال اللجنة خلال الربع.', 'إنجاز دراسة الجاهزية الرقمية وتنظيم منتدى التحول الرقمي.', 'الحاجة لدعم فني إضافي.', 40, 'reviewed', 'تم الاعتماد.', 'u-sector'],
];

const REPORT_AUTHOR = LEAD_OFFICIAL;

export const mockReports: CommitteeReport[] = rpRows.map(([committeeId, title, period, summary, achievements, challenges, ago, status, reviewNote, reviewedBy], i) => ({
  id: `rp-${String(i + 1).padStart(2, '0')}`,
  seq: 901 + i,
  committeeId,
  title,
  period,
  summary,
  achievements,
  challenges,
  createdBy: REPORT_AUTHOR[committeeId],
  createdAt: daysAgo(ago, 12),
  status,
  reviewNote,
  reviewedBy,
}));

// ───────────────────────────── Weather ─────────────────────────────

/** SAMPLE weather for the home header (values from the design). There is no weather API in the demo. */
export const sampleWeather: WeatherSnapshot = { temperatureC: 28, kind: 'sunny', condition: 'مشمس' };
