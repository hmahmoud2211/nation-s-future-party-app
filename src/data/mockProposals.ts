import type { Proposal, ProposalStatus, TimelineEvent } from '@/types';
import { daysAgo } from '@/utils/dates';
import { SECTOR_SECRETARY_ID } from './mockMembers';

/** Sample committee proposals (fictional content) submitted by the people responsible for each committee. */
type Row = {
  c: string;
  by: string;
  title: string;
  description: string;
  objective: string;
  status: ProposalStatus;
  /** Days since submission. */
  ago: number;
  gov?: string;
  note?: string;
};

const rows: Row[] = [
  {
    c: 'c-investment', by: 'u-ayad', status: 'under_review', ago: 6,
    title: 'منصة موحدة لفرص الاستثمار بالمحافظات',
    description: 'منصة رقمية تعرض الفرص الاستثمارية المتاحة في كل محافظة مع بيانات الأراضي والإجراءات المطلوبة.',
    objective: 'تسهيل وصول المستثمرين إلى الفرص وتسريع اتخاذ القرار.',
  },
  {
    c: 'c-investment', by: 'u-eslam', status: 'approved', ago: 20, gov: 'g-assiut',
    title: 'ملتقى المستثمرين في الصعيد',
    description: 'تنظيم ملتقى سنوي في أسيوط يجمع المستثمرين بممثلي المحافظات والجهات التمويلية.',
    objective: 'جذب استثمارات جديدة لمحافظات الصعيد.',
    note: 'موافقة مبدئية، يرجى التنسيق مع الأمين المساعد المختص بالمحافظة.',
  },
  {
    c: 'c-industry', by: 'u-hesham', status: 'in_progress', ago: 45, gov: 'g-sharqia',
    title: 'دعم المصانع الصغيرة في ترشيد استهلاك الطاقة',
    description: 'برنامج استشاري مجاني لعدد من المصانع الصغيرة لخفض تكلفة الطاقة.',
    objective: 'خفض تكاليف الإنتاج وتحسين القدرة التنافسية.',
  },
  {
    c: 'c-industry', by: 'u-hany', status: 'completed', ago: 90,
    title: 'دليل إجراءات تراخيص المنشآت الصناعية',
    description: 'دليل مبسط يشرح خطوات ومستندات ترخيص المنشآت الصناعية.',
    objective: 'تقليل مدة الحصول على التراخيص.',
  },
  {
    c: 'c-realestate', by: 'u-hassan', status: 'under_review', ago: 9,
    title: 'مقترح تشريعي لتنظيم سوق إعادة البيع',
    description: 'ورقة بمقترحات تشريعية لضبط سوق إعادة بيع الوحدات وحماية حقوق المشترين.',
    objective: 'زيادة الثقة في سوق التطوير العقاري.',
  },
  {
    c: 'c-realestate', by: 'u-shoukry', status: 'new', ago: 2, gov: 'g-dakahlia',
    title: 'خريطة رقمية للمدن الجديدة',
    description: 'خريطة تفاعلية بالمدن الجديدة والخدمات المتاحة فيها ومراحل التنفيذ.',
    objective: 'تعريف المواطنين والمستثمرين بفرص المدن الجديدة.',
  },
  {
    c: 'c-entre', by: 'u-ghitany', status: 'new', ago: 1, gov: 'g-minya',
    title: 'حاضنة أعمال للشباب في المنيا',
    description: 'حاضنة أعمال بالشراكة مع إحدى الجامعات لدعم المشروعات الناشئة في المحافظة.',
    objective: 'توفير فرص عمل للشباب ونشر ثقافة ريادة الأعمال.',
  },
  {
    c: 'c-entre', by: 'u-gohary', status: 'completed', ago: 120,
    title: 'مسابقة سنوية لأفضل مشروع ناشئ',
    description: 'مسابقة تختار أفضل الأفكار الناشئة وتوفر لها الإرشاد والتشبيك.',
    objective: 'اكتشاف المشروعات الواعدة ودعمها.',
  },
  {
    c: 'c-trade', by: 'u-zallat', status: 'approved', ago: 15,
    title: 'بوابة لمتابعة إجراءات التصدير',
    description: 'بوابة إلكترونية توضح خطوات التصدير ومتطلبات كل سوق مستهدف.',
    objective: 'تسهيل الإجراءات وزيادة عدد المصدرين الجدد.',
  },
  {
    c: 'c-trade', by: 'u-alaa', status: 'rejected', ago: 30, gov: 'g-portsaid',
    title: 'معرض دائم للمنتجات المحلية في بورسعيد',
    description: 'معرض دائم لعرض المنتجات المحلية للزوار والتجار.',
    objective: 'فتح منافذ تسويق جديدة للمنتجين المحليين.',
    note: 'يرجى دمجه مع مبادرة المعارض القائمة وإعادة التقديم بخطة تمويل واضحة.',
  },
  {
    c: 'c-tourism', by: 'u-nowishy', status: 'in_progress', ago: 40, gov: 'g-luxor',
    title: 'تطوير الإرشاد السياحي الرقمي في الأقصر وأسوان',
    description: 'تطبيق إرشادي متعدد اللغات للمواقع الأثرية بالتعاون مع شركات السياحة.',
    objective: 'تحسين تجربة الزائر وزيادة مدة الإقامة.',
  },
  {
    c: 'c-tech', by: 'u-zayat', status: 'in_progress', ago: 60,
    title: 'تطبيق موحد لخدمات الأعضاء',
    description: 'تطبيق يجمع خدمات الأعضاء ومتابعة أعمال اللجان في مكان واحد.',
    objective: 'رفع كفاءة التواصل والمتابعة داخل الأمانة.',
  },
  {
    c: 'c-tech', by: 'u-kafas', status: 'new', ago: 3,
    title: 'برنامج المهارات الرقمية لأصحاب المشروعات',
    description: 'سلسلة ورش قصيرة في التسويق الإلكتروني والدفع الرقمي.',
    objective: 'مساعدة المشروعات الصغيرة على التحول الرقمي.',
  },
  {
    c: 'c-social', by: 'u-emad', status: 'approved', ago: 18, gov: 'g-sohag',
    title: 'دعم المشروعات المنزلية للمرأة المعيلة',
    description: 'تمويل صغير وتدريب وتسويق لمشروعات منزلية في عدد من قرى سوهاج.',
    objective: 'تحسين دخل الأسر الأكثر احتياجاً.',
  },
  {
    c: 'c-studies', by: 'u-morgan', status: 'completed', ago: 150,
    title: 'مرصد شهري للمؤشرات الاقتصادية',
    description: 'نشرة شهرية تحلل أهم المؤشرات الاقتصادية وتأثيرها على مجتمع الأعمال.',
    objective: 'دعم القرار بمعلومات محدثة.',
  },
  {
    c: 'c-studies', by: 'u-zayed', status: 'new', ago: 4,
    title: 'دراسة أثر تكلفة التمويل على المشروعات الصغيرة',
    description: 'دراسة ميدانية لقياس أثر تكلفة الاقتراض على توسع المشروعات الصغيرة.',
    objective: 'صياغة توصيات لتيسير التمويل.',
  },
  {
    c: 'c-markets', by: 'u-yehia', status: 'under_review', ago: 11,
    title: 'حملة توعية بأدوات الاستثمار في البورصة',
    description: 'محتوى مبسط وندوات للتعريف بأدوات الاستثمار ومخاطرها.',
    objective: 'زيادة الوعي المالي وتشجيع الاستثمار الرشيد.',
  },
];

function history(id: string, r: Row): TimelineEvent[] {
  const events: TimelineEvent[] = [{ id: `${id}-h1`, type: 'submitted', label: 'تم تقديم المقترح', actorId: r.by, createdAt: daysAgo(r.ago, 10) }];
  const step = (n: number, type: TimelineEvent['type'], label: string, actorId: string, at: number, note?: string) =>
    events.push({ id: `${id}-h${n}`, type, label, actorId, note, createdAt: daysAgo(Math.max(0, at), 12) });
  if (r.status === 'new') return events;
  step(2, 'under_review', 'تم تغيير الحالة إلى «قيد المراجعة»', SECTOR_SECRETARY_ID, r.ago - 1);
  if (r.status === 'under_review') return events;
  if (r.status === 'rejected') {
    step(3, 'rejected', 'تم تغيير الحالة إلى «مرفوض»', SECTOR_SECRETARY_ID, r.ago - 3, r.note);
    return events;
  }
  step(3, 'approved', 'تم تغيير الحالة إلى «تمت الموافقة»', SECTOR_SECRETARY_ID, r.ago - 3, r.note);
  if (r.status === 'approved') return events;
  step(4, 'started', 'تم تغيير الحالة إلى «قيد التنفيذ»', r.by, r.ago - 7);
  if (r.status === 'in_progress') return events;
  step(5, 'completed', 'تم تغيير الحالة إلى «مكتمل»', r.by, r.ago - 60);
  return events;
}

export const mockProposals: Proposal[] = rows.map((r, i) => {
  const id = `pr-${String(i + 1).padStart(2, '0')}`;
  const h = history(id, r);
  return {
    id,
    seq: 701 + i,
    title: r.title,
    description: r.description,
    objective: r.objective,
    committeeId: r.c,
    governorateId: r.gov,
    createdBy: r.by,
    createdAt: h[0].createdAt,
    updatedAt: h[h.length - 1].createdAt,
    status: r.status,
    reviewNote: r.note,
    attachments: i % 4 === 0 ? [{ id: `${id}-att`, name: 'ملخص-المقترح.pdf', size: 248_000, mimeType: 'application/pdf', addedAt: h[0].createdAt, addedBy: r.by }] : [],
    history: h,
  };
});
