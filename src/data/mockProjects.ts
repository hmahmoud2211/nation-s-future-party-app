import type { Comment, Expense, Milestone, Project, ProjectStatus } from '@/types';
import { daysAgo, daysFromNow } from '@/utils/dates';

type Row = {
  id: string;
  committeeId: string;
  official: string;
  lead: string;
  team: string[];
  title: string;
  description: string;
  status: ProjectStatus;
  progress: number;
  start: number; // days offset (negative = past)
  end: number;
  milestones: [string, number, boolean][];
  comments?: [string, string, number][]; // author, message, daysAgo
};

const rows: Row[] = [
  {
    id: 'p-01', committeeId: 'c-tech', official: 'u-zayat', lead: 'u-m04', team: ['u-ahmed', 'u-m01', 'u-m02'],
    title: 'منصة الخدمات الرقمية للأعضاء',
    description: 'تطوير نموذج أولي لمنصة رقمية تيسر على أعضاء القطاع متابعة أعمال اللجان والاجتماعات والطلبات الإدارية.',
    status: 'in_progress', progress: 62, start: -75, end: 45,
    milestones: [['تحليل المتطلبات', -50, true], ['تصميم واجهات الاستخدام', -20, true], ['النموذج الأولي التجريبي', 15, false], ['الإطلاق التجريبي الداخلي', 40, false]],
    comments: [['u-zayat', 'يرجى الالتزام بموعد تسليم النموذج الأولي، وإرسال أي معوقات مبكراً.', 6], ['u-m04', 'تم الانتهاء من مراجعة الواجهات مع الفريق، وجارٍ تجهيز العرض.', 4]],
  },
  {
    id: 'p-02', committeeId: 'c-tech', official: 'u-zayat', lead: 'u-ahmed', team: ['u-m03', 'u-m14'],
    title: 'برنامج المهارات الرقمية للشركات الصغيرة',
    description: 'سلسلة ورش تدريبية لتعريف أصحاب الشركات الصغيرة بأدوات التسويق الرقمي والتحصيل الإلكتروني.',
    status: 'in_progress', progress: 40, start: -40, end: 60,
    milestones: [['إعداد المحتوى التدريبي', -15, true], ['الورشة الأولى', 5, false], ['الورشة الثانية', 30, false], ['تقرير تقييم البرنامج', 58, false]],
  },
  {
    id: 'p-03', committeeId: 'c-investment', official: 'u-ayad', lead: 'u-mona', team: ['u-m05', 'u-m06'],
    title: 'دليل الإجراءات الميسرة للمستثمرين',
    description: 'إعداد دليل مبسط يشرح خطوات تأسيس الشركات والحصول على التراخيص بلغة واضحة للمستثمر الجديد.',
    status: 'in_progress', progress: 70, start: -90, end: 20,
    milestones: [['جمع الإجراءات الحالية', -60, true], ['صياغة المسودة الأولى', -25, true], ['المراجعة القانونية', 7, false], ['النسخة النهائية', 18, false]],
    comments: [['u-ayad', 'برجاء إضافة قسم خاص بالأسئلة الشائعة في نهاية الدليل.', 3]],
  },
  {
    id: 'p-04', committeeId: 'c-investment', official: 'u-ayad', lead: 'u-m05', team: ['u-m06', 'u-m07'],
    title: 'ملتقى فرص الاستثمار الإقليمي',
    description: 'تنظيم ملتقى لعرض فرص الاستثمار في المحافظات بالتعاون مع غرف التجارة ومجتمع الأعمال.',
    status: 'planned', progress: 10, start: 10, end: 120,
    milestones: [['تحديد المحافظات المشاركة', 20, false], ['التواصل مع الشركاء', 45, false], ['تنظيم الملتقى', 110, false]],
  },
  {
    id: 'p-05', committeeId: 'c-industry', official: 'u-hesham', lead: 'u-m09', team: ['u-m08', 'u-m10'],
    title: 'رصد تحديات المناطق الصناعية',
    description: 'زيارات ميدانية واستبيانات لرصد التحديات التشغيلية في المناطق الصناعية وإعداد ورقة توصيات.',
    status: 'in_progress', progress: 55, start: -60, end: 30,
    milestones: [['تصميم الاستبيان', -45, true], ['الزيارات الميدانية', -10, true], ['تحليل النتائج', 12, false], ['ورقة التوصيات', 28, false]],
  },
  {
    id: 'p-06', committeeId: 'c-industry', official: 'u-hesham', lead: 'u-m08', team: ['u-m10'],
    title: 'مبادرة دعم المكون المحلي',
    description: 'حصر فرص إحلال المكونات المستوردة بمنتجات محلية في عدد من الصناعات الهندسية.',
    status: 'paused', progress: 25, start: -100, end: 50,
    milestones: [['اختيار القطاعات المستهدفة', -80, true], ['حصر الموردين المحليين', -30, false], ['ورشة الربط بين المصنعين', 40, false]],
  },
  {
    id: 'p-07', committeeId: 'c-realestate', official: 'u-hassan', lead: 'u-m11', team: ['u-m12'],
    title: 'ورقة تنظيم سوق إعادة البيع العقاري',
    description: 'دراسة مقارنة لآليات تنظيم سوق إعادة البيع وحماية حقوق المشترين، مع مقترحات قابلة للتطبيق.',
    status: 'in_progress', progress: 35, start: -30, end: 70,
    milestones: [['الدراسة المقارنة', -5, true], ['جلسات استماع مع المطورين', 25, false], ['الصياغة النهائية', 65, false]],
  },
  {
    id: 'p-08', committeeId: 'c-realestate', official: 'u-hassan', lead: 'u-m12', team: ['u-m11'],
    title: 'دليل المدن الجديدة للمستثمر العقاري',
    description: 'دليل تعريفي بفرص التطوير في المدن الجديدة والخدمات المتاحة بها.',
    status: 'completed', progress: 100, start: -160, end: -20,
    milestones: [['جمع البيانات', -130, true], ['التصميم والإخراج', -60, true], ['الإصدار', -22, true]],
  },
  {
    id: 'p-09', committeeId: 'c-entre', official: 'u-ghitany', lead: 'u-m13', team: ['u-m14'],
    title: 'مسابقة أفكار ريادة الأعمال للشباب',
    description: 'مسابقة لاكتشاف أفكار المشروعات الناشئة وربط الفائزين ببرامج الاحتضان والإرشاد.',
    status: 'in_progress', progress: 48, start: -45, end: 50,
    milestones: [['إطلاق المسابقة', -30, true], ['استقبال الطلبات', 0, true], ['التحكيم', 25, false], ['حفل الإعلان عن الفائزين', 48, false]],
  },
  {
    id: 'p-10', committeeId: 'c-entre', official: 'u-ghitany', lead: 'u-m14', team: ['u-m13'],
    title: 'شبكة المرشدين لرواد الأعمال',
    description: 'تأسيس شبكة من الخبراء المتطوعين لتقديم جلسات إرشاد دورية للشركات الناشئة.',
    status: 'planned', progress: 5, start: 15, end: 140,
    milestones: [['تحديد معايير اختيار المرشدين', 30, false], ['استقطاب المرشدين', 70, false], ['بدء الجلسات', 120, false]],
  },
  {
    id: 'p-11', committeeId: 'c-trade', official: 'u-zallat', lead: 'u-m15', team: ['u-m16'],
    title: 'خريطة فرص التصدير للمنتجات الزراعية',
    description: 'تحليل الأسواق المستهدفة لصادرات المنتجات الزراعية وإعداد خريطة فرص للمصدرين الجدد.',
    status: 'in_progress', progress: 58, start: -70, end: 35,
    milestones: [['جمع البيانات', -50, true], ['تحليل الأسواق', -10, true], ['إعداد الخريطة', 20, false], ['ورشة العرض', 33, false]],
  },
  {
    id: 'p-12', committeeId: 'c-trade', official: 'u-zallat', lead: 'u-m15', team: [],
    title: 'دراسة كفاءة سلاسل الإمداد المحلية',
    description: 'دراسة نقاط الاختناق في سلاسل الإمداد للسلع الأساسية ومقترحات لرفع كفاءتها.',
    status: 'completed', progress: 100, start: -200, end: -40,
    milestones: [['التصميم المنهجي', -170, true], ['جمع البيانات', -110, true], ['التقرير النهائي', -42, true]],
  },
  {
    id: 'p-13', committeeId: 'c-tourism', official: 'u-nowishy', lead: 'u-m17', team: ['u-m22'],
    title: 'مبادرة تطوير تجربة الزائر',
    description: 'مقترحات لتحسين تجربة الزائر في عدد من المقاصد عبر الخدمات الرقمية والتدريب.',
    status: 'in_progress', progress: 30, start: -25, end: 80,
    milestones: [['رصد الوضع الحالي', -5, true], ['ورش مع مقدمي الخدمات', 30, false], ['التقرير النهائي', 75, false]],
  },
  {
    id: 'p-14', committeeId: 'c-industry', official: 'u-hesham', lead: 'u-m18', team: ['u-m23'],
    title: 'دليل كفاءة الطاقة للمنشآت التجارية',
    description: 'دليل عملي لخفض استهلاك الطاقة في المحلات والمنشآت التجارية الصغيرة.',
    status: 'in_progress', progress: 66, start: -80, end: 25,
    milestones: [['إعداد المحتوى', -40, true], ['المراجعة الفنية', -5, true], ['الإصدار', 22, false]],
  },
  {
    id: 'p-15', committeeId: 'c-industry', official: 'u-hesham', lead: 'u-m23', team: ['u-m18'],
    title: 'ملتقى الاقتصاد الأخضر',
    description: 'ملتقى للتعريف بفرص الاستثمار في الطاقة المتجددة وإعادة التدوير.',
    status: 'planned', progress: 0, start: 30, end: 150,
    milestones: [['تحديد المتحدثين', 50, false], ['تنظيم الملتقى', 140, false]],
  },
  {
    id: 'p-16', committeeId: 'c-social', official: 'u-emad', lead: 'u-m19', team: [],
    title: 'منصة تنسيق مبادرات المسؤولية المجتمعية',
    description: 'حصر مبادرات الشركات المجتمعية وتنسيقها لتعظيم الأثر وتفادي التكرار.',
    status: 'in_progress', progress: 45, start: -50, end: 60,
    milestones: [['حصر المبادرات', -20, true], ['تصنيف المجالات', 10, false], ['إطلاق دليل المبادرات', 55, false]],
  },
  {
    id: 'p-17', committeeId: 'c-studies', official: 'u-morgan', lead: 'u-m20', team: [],
    title: 'مرصد المؤشرات الاقتصادية الشهري',
    description: 'نشرة شهرية تحليلية لأهم المؤشرات الاقتصادية وتأثيرها على مجتمع الأعمال.',
    status: 'in_progress', progress: 75, start: -120, end: 40,
    milestones: [['تصميم النشرة', -100, true], ['العدد الأول', -60, true], ['العدد الثاني', -30, true], ['العدد الثالث', 10, false]],
  },
  {
    id: 'p-18', committeeId: 'c-studies', official: 'u-morgan', lead: 'u-m20', team: [],
    title: 'ورقة سياسات حول تمويل المشروعات الصغيرة',
    description: 'تحليل فجوات التمويل للمشروعات الصغيرة ومقترحات لأدوات تمويل مبتكرة.',
    status: 'planned', progress: 15, start: -5, end: 90,
    milestones: [['مراجعة الأدبيات', 20, false], ['المقابلات', 50, false], ['الورقة النهائية', 85, false]],
  },
  {
    id: 'p-19', committeeId: 'c-markets', official: 'u-yehia', lead: 'u-m21', team: [],
    title: 'حملة الثقافة المالية لرواد الأعمال',
    description: 'محتوى توعوي مبسط عن أدوات التمويل وأسواق المال موجه لرواد الأعمال.',
    status: 'in_progress', progress: 50, start: -35, end: 45,
    milestones: [['إعداد المحتوى', -10, true], ['النشر', 20, false], ['قياس الأثر', 44, false]],
  },
  {
    id: 'p-20', committeeId: 'c-tech', official: 'u-zayat', lead: 'u-m01', team: ['u-m02', 'u-m03'],
    title: 'دراسة جاهزية الشركات للتحول الرقمي',
    description: 'استبيان لقياس جاهزية الشركات المتوسطة للتحول الرقمي وإعداد تقرير بالنتائج.',
    status: 'completed', progress: 100, start: -180, end: -30,
    milestones: [['تصميم الاستبيان', -150, true], ['جمع الردود', -90, true], ['التقرير النهائي', -32, true]],
  },
];

let commentSeq = 0;

/**
 * Sample finances (EGP): [allocated budget, share already spent, governorate?].
 * One project is deliberately over budget so the financial overview shows that case.
 */
const FINANCE: Record<string, [number, number, string?]> = {
  'p-01': [850_000, 0.58],
  'p-02': [320_000, 0.35],
  'p-03': [180_000, 0.72],
  'p-04': [600_000, 0.08, 'g-assiut'],
  'p-05': [240_000, 0.5, 'g-sharqia'],
  'p-06': [400_000, 0.22],
  'p-07': [150_000, 0.3],
  'p-08': [210_000, 0.97],
  'p-09': [380_000, 0.52, 'g-minya'],
  'p-10': [160_000, 0.04],
  'p-11': [450_000, 0.61, 'g-alex'],
  'p-12': [270_000, 1.08],
  'p-13': [520_000, 0.27, 'g-luxor'],
  'p-14': [300_000, 0.7],
  'p-15': [700_000, 0],
  'p-16': [190_000, 0.4, 'g-sohag'],
  'p-17': [230_000, 0.78],
  'p-18': [140_000, 0.12],
  'p-19': [260_000, 0.46],
  'p-20': [200_000, 0.95],
};

const EXPENSE_LABELS = ['خدمات استشارية', 'تنظيم فعاليات وورش', 'تطوير وتصميم', 'مطبوعات ومواد توعوية', 'نقل وإقامة', 'تجهيزات ومعدات'];

/** Splits the spent amount into 1–4 dated expense lines (deterministic). */
function expensesFor(id: string, budget: number, ratio: number, startOffset: number): Expense[] {
  const total = Math.round((budget * ratio) / 1000) * 1000;
  if (total <= 0) return [];
  const parts = Math.min(4, Math.max(1, Math.round(ratio * 5)));
  const weights = [0.4, 0.3, 0.2, 0.1].slice(0, parts);
  const sum = weights.reduce((a, b) => a + b, 0);
  let used = 0;
  return weights.map((w, i) => {
    const amount = i === parts - 1 ? total - used : Math.round(((total * w) / sum) / 1000) * 1000;
    used += amount;
    const n = Number(id.slice(2));
    return {
      id: `${id}-ex${i + 1}`,
      label: EXPENSE_LABELS[(n + i) % EXPENSE_LABELS.length],
      amount,
      date: daysFromNow(Math.min(-1, startOffset + 7 + i * 12)),
    };
  });
}

export const mockProjects: Project[] = rows.map((r, i) => {
  const milestones: Milestone[] = r.milestones.map(([title, offset, done], idx) => ({
    id: `${r.id}-ms${idx + 1}`,
    title,
    dueDate: daysFromNow(offset),
    done,
  }));
  const comments: Comment[] = (r.comments ?? []).map(([authorId, message, ago]) => ({
    id: `pc-${++commentSeq}`,
    authorId,
    message,
    createdAt: daysAgo(ago, 13),
    kind: 'comment',
  }));
  return {
    id: r.id,
    seq: 301 + i,
    title: r.title,
    description: r.description,
    committeeId: r.committeeId,
    leadId: r.lead,
    teamIds: r.team,
    startDate: daysFromNow(r.start),
    endDate: daysFromNow(r.end),
    milestones,
    status: r.status,
    progress: r.progress,
    governorateId: FINANCE[r.id]?.[2],
    budget: FINANCE[r.id]?.[0] ?? 0,
    expenses: FINANCE[r.id] ? expensesFor(r.id, FINANCE[r.id][0], FINANCE[r.id][1], r.start) : [],
    comments,
    createdBy: r.official,
    createdAt: daysFromNow(Math.min(r.start, 0) - 5),
    updatedAt: daysAgo(i % 9),
  };
});
