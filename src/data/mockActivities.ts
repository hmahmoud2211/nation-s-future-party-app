import type { Activity, ActivityStatus, ActivityType } from '@/features/activities/types';
import { daysAgo, daysFromNow } from '@/utils/dates';
import { LEAD_OFFICIAL } from '@/data/mockMembers';

const OFFICIAL = LEAD_OFFICIAL;

/** [committee, title, type, dayOffset, location, status, progress, description, capacity?, registrations[], report?] */
type Row = [string, string, ActivityType, number, string, ActivityStatus, number, string, number | undefined, string[], string?];

const rows: Row[] = [
  ['c-tech', 'ورشة التسويق الرقمي للشركات الصغيرة', 'workshop', 5, 'مقر الأمانة المركزية — القاعة الكبرى', 'upcoming', 0, 'ورشة تطبيقية لتعريف أصحاب الشركات الصغيرة بأدوات التسويق الرقمي وإدارة الحضور على المنصات.', 60, ['u-m01', 'u-m03']],
  ['c-tech', 'ندوة الأمن السيبراني للشركات', 'seminar', -1, 'مقر الأمانة المركزية', 'ongoing', 70, 'ندوة توعوية حول حماية بيانات الشركات وأفضل ممارسات الأمن السيبراني.', 80, ['u-ahmed', 'u-m02', 'u-m04']],
  ['c-tech', 'منتدى التحول الرقمي لمجتمع الأعمال', 'forum', -25, 'أحد مراكز المؤتمرات (موقع تجريبي)', 'completed', 100, 'منتدى لمناقشة فرص التحول الرقمي للشركات المتوسطة.', 200, ['u-ahmed', 'u-m01', 'u-m02', 'u-m03', 'u-m04'], 'شارك في المنتدى نحو 150 من ممثلي الشركات، وخرج بعشر توصيات رئيسية تم رفعها لقيادة القطاع.'],
  ['c-investment', 'لقاء المستثمرين الجدد', 'forum', 9, 'مقر الأمانة المركزية', 'upcoming', 0, 'لقاء تعريفي بالمستثمرين الجدد لعرض مسودة دليل الإجراءات الميسرة والاستماع لمقترحاتهم.', 50, ['u-mona']],
  ['c-investment', 'ورشة تيسير إجراءات التأسيس', 'workshop', -14, 'مقر الأمانة المركزية', 'completed', 100, 'ورشة نقاشية حول تحديات تأسيس الشركات.', 40, ['u-mona', 'u-m05', 'u-m06'], 'تم رصد أبرز التحديات الإجرائية وإدراجها في دليل المستثمر.'],
  ['c-industry', 'زيارة ميدانية لمنطقة صناعية', 'visit', 3, 'منطقة صناعية (موقع تجريبي)', 'upcoming', 0, 'زيارة ميدانية للاطلاع على سير العمل في عدد من المصانع ورصد التحديات.', 25, ['u-m08', 'u-m10']],
  ['c-industry', 'برنامج تدريبي للجودة الصناعية', 'training', -40, 'مركز تدريب (موقع تجريبي)', 'completed', 100, 'برنامج تدريبي حول معايير الجودة الصناعية.', 30, ['u-m08', 'u-m09'], 'أتم البرنامج 28 متدرباً بنجاح.'],
  ['c-realestate', 'ندوة مستقبل المدن الجديدة', 'seminar', 12, 'مقر الأمانة المركزية', 'upcoming', 0, 'ندوة حول فرص التطوير العقاري في المدن الجديدة.', 100, ['u-m11']],
  ['c-entre', 'يوم ريادة الأعمال المفتوح', 'initiative', 15, 'إحدى حاضنات الأعمال (موقع تجريبي)', 'upcoming', 10, 'يوم مفتوح يلتقي فيه رواد الأعمال بالخبراء والمستثمرين.', 150, ['u-m13', 'u-m14']],
  ['c-entre', 'ورشة إعداد خطة العمل', 'workshop', -10, 'مقر الأمانة المركزية', 'completed', 100, 'ورشة تطبيقية لإعداد خطط العمل للمشروعات الناشئة.', 40, ['u-m13'], 'شارك 35 من رواد الأعمال، وتم تقديم 12 خطة عمل للتقييم.'],
  ['c-trade', 'ورشة متطلبات التصدير', 'workshop', 18, 'مقر الأمانة المركزية', 'upcoming', 0, 'ورشة لتعريف المصدرين الجدد بمتطلبات الأسواق الخارجية.', 60, ['u-m15']],
  ['c-trade', 'منتدى سلاسل الإمداد', 'forum', -45, 'أحد مراكز المؤتمرات (موقع تجريبي)', 'completed', 100, 'منتدى لمناقشة نتائج دراسة كفاءة سلاسل الإمداد.', 120, ['u-m15', 'u-m16'], 'تم عرض نتائج الدراسة ومناقشتها مع ممثلي الشركات.'],
  ['c-tourism', 'مبادرة تدريب العاملين بالضيافة', 'training', 20, 'مركز تدريب (موقع تجريبي)', 'upcoming', 0, 'برنامج تدريبي لرفع كفاءة العاملين في قطاع الضيافة.', 40, ['u-m17', 'u-m22']],
  ['c-industry', 'ورشة كفاءة الطاقة للمحلات التجارية', 'workshop', 7, 'مقر الأمانة المركزية', 'upcoming', 0, 'ورشة عملية لعرض دليل كفاءة الطاقة للمنشآت التجارية.', 50, ['u-m18']],
  ['c-industry', 'زيارة لمحطة طاقة شمسية', 'visit', -18, 'محطة طاقة شمسية (موقع تجريبي)', 'completed', 100, 'زيارة تعريفية بتطبيقات الطاقة الشمسية.', 20, ['u-m18', 'u-m23'], 'تعرف المشاركون على مراحل تشغيل المحطة ونماذج التمويل.'],
  ['c-social', 'مبادرة دعم المشروعات المنزلية', 'initiative', -3, 'عدد من المحافظات', 'ongoing', 55, 'مبادرة لتقديم استشارات مجانية لأصحاب المشروعات المنزلية.', undefined, ['u-m19']],
  ['c-social', 'معرض منتجات الحرف اليدوية', 'initiative', 25, 'مقر الأمانة المركزية', 'upcoming', 5, 'معرض لدعم تسويق منتجات الحرف اليدوية.', undefined, []],
  ['c-studies', 'ندوة قراءة في المؤشرات الاقتصادية', 'seminar', 10, 'اجتماع مرئي', 'upcoming', 0, 'ندوة لعرض أهم ما ورد في مرصد المؤشرات الاقتصادية.', 300, ['u-m20']],
  ['c-markets', 'ورشة أدوات التمويل لرواد الأعمال', 'workshop', 13, 'مقر الأمانة المركزية', 'upcoming', 0, 'ورشة مبسطة حول أدوات التمويل المتاحة لرواد الأعمال.', 60, ['u-m21']],
  ['c-markets', 'برنامج الثقافة المالية', 'training', -30, 'اجتماع مرئي', 'completed', 100, 'برنامج تدريبي قصير حول أساسيات الثقافة المالية.', 100, ['u-m21'], 'أتم البرنامج 85 مشاركاً.'],
];

/** Activities held in a specific governorate (lets assistant secretaries follow them). */
const GOVERNORATE_BY_TITLE: Record<string, string> = {
  'مبادرة دعم المشروعات المنزلية': 'g-sohag',
  'يوم ريادة الأعمال المفتوح': 'g-minya',
  'مبادرة تدريب العاملين بالضيافة': 'g-luxor',
  'زيارة ميدانية لمنطقة صناعية': 'g-sharqia',
  'ورشة متطلبات التصدير': 'g-alex',
  'لقاء المستثمرين الجدد': 'g-assiut',
};

export const mockActivities: Activity[] = rows.map((r, i) => {
  const [committeeId, title, type, offset, location, status, progress, description, capacity, registrations, report] = r;
  return {
    id: `ac-${String(i + 1).padStart(2, '0')}`,
    title,
    description,
    committeeId,
    governorateId: GOVERNORATE_BY_TITLE[title],
    type,
    date: daysFromNow(offset, 11),
    location,
    status,
    progress,
    capacity,
    registrations,
    images: [],
    report,
    createdBy: OFFICIAL[committeeId],
    createdAt: daysAgo(Math.max(5, -offset + 10)),
  };
});
