import type { Feedback, FeedbackCategory, FeedbackStatus, FeedbackTopic } from '@/features/feedback/types';
import { daysAgo, hoursAgo } from '@/utils/dates';

type Msg = [string, string, number]; // author, message, hoursAgo

type Row = {
  category: FeedbackCategory;
  topic: FeedbackTopic;
  related?: string;
  c: string;
  author: string;
  recipient: string;
  subject: string;
  status: FeedbackStatus;
  messages: Msg[];
};

const rows: Row[] = [
  // ── Proposal feedback ──
  {
    category: 'proposal', topic: 'proposal_note', related: 'pr-01', c: 'c-investment', author: 'u-mona', recipient: 'u-ayad',
    subject: 'إضافة بيانات المناطق الصناعية للمنصة', status: 'replied',
    messages: [
      ['u-mona', 'أقترح إضافة بيانات المناطق الصناعية المتاحة في كل محافظة ضمن المنصة المقترحة.', 60],
      ['u-ayad', 'إضافة مهمة، سيتم تضمينها في النسخة المعدلة من المقترح.', 50],
    ],
  },
  {
    category: 'proposal', topic: 'proposal_note', related: 'pr-13', c: 'c-tech', author: 'u-ahmed', recipient: 'u-kafas',
    subject: 'التطوع في تنفيذ برنامج المهارات الرقمية', status: 'new',
    messages: [['u-ahmed', 'أرغب في المشاركة في إعداد محتوى ورش برنامج المهارات الرقمية حال الموافقة عليه.', 20]],
  },
  {
    category: 'proposal', topic: 'review_request', related: 'pr-14', c: 'c-social', author: 'u-m19', recipient: 'u-emad',
    subject: 'معايير اختيار المستفيدات', status: 'under_review',
    messages: [['u-m19', 'هل يمكن مشاركة معايير اختيار المستفيدات من مبادرة المشروعات المنزلية؟', 30]],
  },

  // ── Project feedback ──
  {
    category: 'project', topic: 'project_note', related: 'p-01', c: 'c-tech', author: 'u-m02', recipient: 'u-zayat',
    subject: 'مقترح إضافة مرحلة اختبار ثانية', status: 'new',
    messages: [['u-m02', 'أقترح إضافة مرحلة اختبار ثانية مع عدد أكبر من الأعضاء قبل الإطلاق.', 3]],
  },
  {
    category: 'project', topic: 'project_note', related: 'p-03', c: 'c-investment', author: 'u-mona', recipient: 'u-ayad',
    subject: 'ملاحظات على هيكل الدليل', status: 'replied',
    messages: [
      ['u-mona', 'أقترح دمج فصلي التأسيس والتراخيص لتسهيل القراءة.', 80],
      ['u-ayad', 'مقترح جيد، سنناقشه في الاجتماع القادم.', 75],
    ],
  },
  {
    category: 'project', topic: 'project_note', related: 'p-05', c: 'c-industry', author: 'u-m09', recipient: 'u-hesham',
    subject: 'تعديل الجدول الزمني', status: 'under_review',
    messages: [['u-m09', 'نحتاج أسبوعاً إضافياً لتحليل نتائج الاستبيان.', 28]],
  },

  // ── Administrative ──
  {
    category: 'administrative', topic: 'other', c: 'c-tech', author: 'u-m03', recipient: 'u-zayat',
    subject: 'مقترح تنظيم لقاء تعارف للأعضاء الجدد', status: 'new',
    messages: [['u-m03', 'أقترح تنظيم لقاء تعارف للأعضاء الجدد بالتزامن مع الاجتماع الشهري.', 7]],
  },
  {
    category: 'administrative', topic: 'other', c: 'c-investment', author: 'u-m06', recipient: 'u-ayad',
    subject: 'تغيير موعد الاجتماع الدوري', status: 'closed',
    messages: [
      ['u-m06', 'هل يمكن تغيير موعد الاجتماع الدوري إلى السادسة مساءً؟', 220],
      ['u-ayad', 'تم تعديل الموعد بناء على رغبة أغلب الأعضاء.', 210],
    ],
  },
  {
    category: 'administrative', topic: 'other', c: 'c-industry', author: 'u-m08', recipient: 'u-hesham',
    subject: 'طلب نسخة من محضر اللقاء', status: 'replied',
    messages: [
      ['u-m08', 'أرجو إرسال نسخة من محضر اللقاء التشاوري.', 30],
      ['u-hesham', 'المحضر متاح في تفاصيل الاجتماع داخل التطبيق.', 27],
    ],
  },
  {
    category: 'administrative', topic: 'other', c: 'c-tech', author: 'u-ahmed', recipient: 'u-zayat',
    subject: 'مقترح لتحسين تنظيم الورش', status: 'under_review',
    messages: [
      ['u-ahmed', 'أقترح إرسال استبيان قصير للمشاركين بعد كل ورشة لقياس الاستفادة.', 52],
      ['u-zayat', 'فكرة ممتازة، جارٍ دراستها.', 49],
    ],
  },
];

export const mockFeedback: Feedback[] = rows.map((r, i) => {
  const id = `fb-${String(i + 1).padStart(2, '0')}`;
  const messages = r.messages.map(([authorId, message, h], idx) => ({
    id: `${id}-m${idx + 1}`,
    authorId,
    message,
    createdAt: hoursAgo(h),
    kind: 'message' as const,
    attachments: [],
  }));
  const first = messages[0];
  const last = messages[messages.length - 1];
  const activity: Feedback['activity'] = [
    { id: `${id}-a1`, type: 'created', label: 'تم إرسال الملاحظة', actorId: r.author, createdAt: first.createdAt },
  ];
  if (r.status === 'under_review') {
    activity.push({ id: `${id}-a2`, type: 'under_review', label: 'قيد المراجعة', actorId: r.recipient, createdAt: last.createdAt });
  }
  if (r.status === 'replied' || r.status === 'closed') {
    const reply = messages.find((m) => m.authorId === r.recipient);
    if (reply) activity.push({ id: `${id}-a2`, type: 'replied', label: 'تم الرد', actorId: r.recipient, createdAt: reply.createdAt });
  }
  if (r.status === 'closed') {
    activity.push({ id: `${id}-a3`, type: 'closed', label: 'تم إغلاق الملاحظة', actorId: r.recipient, createdAt: last.createdAt });
  }
  return {
    id,
    seq: 501 + i,
    category: r.category,
    topic: r.topic,
    relatedEntityId: r.related,
    committeeId: r.c,
    authorId: r.author,
    recipientId: r.recipient,
    subject: r.subject,
    status: r.status,
    createdAt: first.createdAt,
    updatedAt: last.createdAt ?? daysAgo(0),
    messages,
    activity,
  };
});
