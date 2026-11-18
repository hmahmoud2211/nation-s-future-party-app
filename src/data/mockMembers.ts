import type { DemoAccount, Member, MembershipStatus, Role } from '@/types';
import { daysAgo } from '@/utils/dates';
import { SAMPLE_GOVERNORATE_ASSIGNMENT } from './mockGovernorates';

/**
 * People of أمانة قطاع الأعمال المركزية.
 *
 * REAL — names and positions from the official decree forming the secretariat's bureau
 * (هيئة مكتب أمانة قطاع الأعمال) and from the chart dividing the secretariat into 10 committees.
 * Each person has one role; committee responsibility (مسؤول اللجنة) is a permission added
 * through `managed` — e.g. every assistant secretary is also responsible for a committee.
 * Their phone numbers and e-mails are PLACEHOLDERS (…@demo.example) — never real contact data.
 * Governorate assignments are SAMPLE data (see mockGovernorates.ts).
 *
 * FICTIONAL — the system admin account and the regular committee members (marked below),
 * kept as sample data (they send inquiries and requests and attend activities).
 */

const AVATAR_COLORS = ['#0B2B68', '#3D4FB0', '#2E6B5B', '#9E3D5A', '#B5782A', '#1F5A8A', '#5B4A2E', '#4A4A6A', '#2A7F9E', '#7A5C1F', '#3E8A4A', '#6B4FBB'];

let seq = 100;

function person(
  id: string,
  name: string,
  role: Role,
  title: string,
  opts: {
    committees?: string[];
    managed?: string[];
    supervised?: string[];
    status?: MembershipStatus;
    joinedDaysAgo?: number;
    phone?: string;
    bio?: string;
  } = {},
): Member {
  seq += 7;
  const n = seq;
  const managed = opts.managed ?? [];
  return {
    id,
    name,
    role,
    title,
    committeeIds: Array.from(new Set([...(opts.committees ?? []), ...managed])),
    managedCommitteeIds: managed,
    supervisedCommitteeIds: opts.supervised ?? [],
    governorateIds: SAMPLE_GOVERNORATE_ASSIGNMENT[id] ?? [],
    membershipNumber: `ق.أ/${2021 + (n % 4)}/${String(n).padStart(4, '0')}`,
    status: opts.status ?? 'active',
    joinDate: daysAgo(opts.joinedDaysAgo ?? 200 + (n % 600)),
    phone: opts.phone ?? `0100000${String(n).padStart(4, '0')}`,
    email: `member${n}@demo.example`,
    avatarColor: AVATAR_COLORS[n % AVATAR_COLORS.length],
    bio: opts.bio,
  };
}

/** An assistant secretary listed as an official of a committee also supervises it. */
const assistant = (id: string, name: string, committee: string, committeeName: string, phone: string) =>
  person(id, name, 'assistant_secretary', `الأمين المساعد • مسؤول ${committeeName}`, { managed: [committee], supervised: [committee], phone, joinedDaysAgo: 400 });

const bureau = (id: string, name: string, committee: string, committeeName: string, phone: string) =>
  person(id, name, 'board_member', `عضو الهيئة • مسؤول ${committeeName}`, { managed: [committee], phone, joinedDaysAgo: 400 });

export const mockMembers: Member[] = [
  // ══════════════ REAL — هيئة مكتب أمانة قطاع الأعمال (per the decree) ══════════════

  // الأمين
  person('u-sector', 'أحمد خالد حسين عوني العتال', 'sector_secretary', 'أمين أمانة قطاع الأعمال المركزية', { phone: '01000000001', joinedDaysAgo: 420 }),

  // الأمناء المساعدون — each also runs (and supervises) the committee the chart lists them under
  assistant('u-shenawy', 'النائب أحمد حسين أحمد محمد حسين الشناوي', 'c-realestate', 'لجنة التطوير العقاري', '01000000002'),
  assistant('u-zayed', 'النائب عمر أحمد عمر محمد زايد', 'c-studies', 'لجنة الدراسات والسياسات الاقتصادية', '01000000003'),
  assistant('u-shoukry', 'أحمد طارق عثمان أحمد شكري', 'c-realestate', 'لجنة التطوير العقاري', '01000000004'),
  assistant('u-bahaa', 'بهاء محمد عبدالرحمن محمد سالم', 'c-trade', 'لجنة التجارة الداخلية والخارجية', '01000000005'),
  assistant('u-hany', 'هاني كمال شارد محمد', 'c-industry', 'لجنة الصناعة', '01000000006'),
  assistant('u-mounir', 'محمد منير علي محمد', 'c-tourism', 'لجنة السياحة والضيافة', '01000000007'),
  assistant('u-alaa', 'محمد علاء سليمان محمد أحمد', 'c-trade', 'لجنة التجارة الداخلية والخارجية', '01000000008'),
  assistant('u-fekry', 'محمد فكري عيسى عيسى', 'c-investment', 'لجنة الاستثمار', '01000000009'),

  // أعضاء هيئة المكتب — all but one also run a committee
  bureau('u-zayat', 'أحمد جمال عبدالحافظ الزيات', 'c-tech', 'لجنة التكنولوجيا والتحول الرقمي', '01000000010'),
  bureau('u-ghitany', 'أحمد قدري الخميسي محمد الغيطاني', 'c-entre', 'لجنة ريادة الأعمال والابتكار', '01000000011'),
  person('u-camelia', 'كاميليا محمد صابر أحمد السعدني', 'board_member', 'عضو الهيئة', { phone: '01000000012', joinedDaysAgo: 400 }),
  bureau('u-hesham', 'هشام أحمد لطفي السيد سلام', 'c-industry', 'لجنة الصناعة', '01000000013'),
  bureau('u-nowishy', 'أحمد سعيد أحمد السيد علي النويشي', 'c-tourism', 'لجنة السياحة والضيافة', '01000000014'),
  bureau('u-emad', 'عماد سالم برهان محمد هيكل', 'c-social', 'لجنة المسؤولية المجتمعية', '01000000015'),
  bureau('u-hassan', 'حسن سيد حسين محمد نصر', 'c-realestate', 'لجنة التطوير العقاري', '01000000016'),
  bureau('u-zallat', 'محمود هشام أبو النور حسن الزلاط', 'c-trade', 'لجنة التجارة الداخلية والخارجية', '01000000017'),
  bureau('u-eslam', 'اسلام عبدالعليم محمد زين الدين', 'c-investment', 'لجنة الاستثمار', '01000000018'),
  bureau('u-gohary', 'أحمد محمد سامح الجوهري عزب', 'c-entre', 'لجنة ريادة الأعمال والابتكار', '01000000019'),
  bureau('u-kafas', 'محمد توفيق محمد توفيق القفاص', 'c-tech', 'لجنة التكنولوجيا والتحول الرقمي', '01000000020'),
  bureau('u-yehia', 'يحيي مصطفي أنور محمد حسن', 'c-markets', 'لجنة الأسواق المالية', '01000000021'),
  bureau('u-morgan', 'ماجد محمد عبدالجواد مرجان', 'c-studies', 'لجنة الدراسات والسياسات الاقتصادية', '01000000022'),
  bureau('u-abbas', 'محمد سعيد محمد عباس أنور', 'c-social', 'لجنة المسؤولية المجتمعية', '01000000023'),

  // ══════════════ REAL — committee responsible from the chart (not in the bureau decree) ══════════════
  person('u-ayad', 'محمد عادل عياد', 'member', 'مسؤول لجنة الاستثمار', { managed: ['c-investment'], phone: '01000000024', joinedDaysAgo: 400 }),

  // ══════════════ FICTIONAL — system administration ══════════════
  person('u-admin', 'شريف عبد العزيز', 'admin', 'مدير النظام (حساب تجريبي)', {
    bio: 'حساب تجريبي لإدارة المنصة والمستخدمين والإعدادات.',
    phone: '01000000025',
    joinedDaysAgo: 900,
  }),

  // ══════════════ FICTIONAL — sample committee members ══════════════

  // ── Technology & digital transformation ──
  person('u-ahmed', 'أحمد محمد', 'member', 'عضو لجنة', {
    committees: ['c-tech'],
    phone: '01000000026',
    joinedDaysAgo: 420,
    bio: 'مهتم بمشروعات التحول الرقمي وتطوير الخدمات الإلكترونية.',
  }),
  person('u-m01', 'ياسمين حسن', 'member', 'عضو لجنة', { committees: ['c-tech'] }),
  person('u-m02', 'محمد عصام', 'member', 'عضو لجنة', { committees: ['c-tech'] }),
  person('u-m03', 'نورهان عاطف', 'member', 'عضو لجنة', { committees: ['c-tech'] }),
  person('u-m04', 'عبد الرحمن خليل', 'member', 'مقرر اللجنة', { committees: ['c-tech'] }),

  // ── Investment ──
  person('u-mona', 'منى عبد الرحمن', 'member', 'أمين سر اللجنة', {
    committees: ['c-investment'],
    phone: '01000000027',
    joinedDaysAgo: 610,
    bio: 'أمين سر لجنة الاستثمار، تتابع إعداد التقارير الدورية.',
  }),
  person('u-m05', 'حازم فاروق', 'member', 'عضو لجنة', { committees: ['c-investment'] }),
  person('u-m06', 'دينا مراد', 'member', 'عضو لجنة', { committees: ['c-investment'] }),
  person('u-m07', 'أحمد سمير', 'member', 'عضو لجنة', { committees: ['c-investment'], status: 'inactive' }),

  // ── Industry ──
  person('u-m08', 'إسلام رجب', 'member', 'عضو لجنة', { committees: ['c-industry'] }),
  person('u-m09', 'هبة الله ناصر', 'member', 'مقررة اللجنة', { committees: ['c-industry'] }),
  person('u-m10', 'شادي كمال', 'member', 'عضو لجنة', { committees: ['c-industry'] }),
  person('u-m18', 'باسم توفيق', 'member', 'عضو لجنة', { committees: ['c-industry'] }),
  person('u-m23', 'كريم ناجي', 'member', 'عضو لجنة', { committees: ['c-industry'] }),

  // ── Real estate ──
  person('u-m11', 'مروان جلال', 'member', 'عضو لجنة', { committees: ['c-realestate'] }),
  person('u-m12', 'ريم سعيد', 'member', 'عضو لجنة', { committees: ['c-realestate'] }),

  // ── Entrepreneurship ──
  person('u-m13', 'يوسف هشام', 'member', 'عضو لجنة', { committees: ['c-entre'] }),
  person('u-m14', 'فرح مجدي', 'member', 'عضو لجنة', { committees: ['c-entre', 'c-tech'] }),

  // ── Trade ──
  person('u-m15', 'عمرو صلاح', 'member', 'عضو لجنة', { committees: ['c-trade'] }),
  person('u-m16', 'آية جمال', 'member', 'عضو لجنة', { committees: ['c-trade'], status: 'suspended' }),

  // ── Tourism / Social / Studies / Markets ──
  person('u-m17', 'مريم شوقي', 'member', 'عضو لجنة', { committees: ['c-tourism'] }),
  person('u-m19', 'سلمى إبراهيم', 'member', 'عضو لجنة', { committees: ['c-social'] }),
  person('u-m20', 'أحمد ممدوح', 'member', 'عضو لجنة', { committees: ['c-studies'] }),
  person('u-m21', 'تامر عبد الغني', 'member', 'عضو لجنة', { committees: ['c-markets'] }),
  person('u-m22', 'لمياء حمدي', 'member', 'عضو لجنة', { committees: ['c-tourism'] }),
];

/**
 * Person responsible for each committee who created its seeded records (projects, meetings,
 * activities, reports).
 */
export const LEAD_OFFICIAL: Record<string, string> = {
  'c-investment': 'u-ayad',
  'c-industry': 'u-hesham',
  'c-realestate': 'u-hassan',
  'c-entre': 'u-ghitany',
  'c-trade': 'u-zallat',
  'c-tourism': 'u-nowishy',
  'c-tech': 'u-zayat',
  'c-social': 'u-emad',
  'c-studies': 'u-morgan',
  'c-markets': 'u-yehia',
};

export const SECTOR_SECRETARY_ID = 'u-sector';
export const ADMIN_ID = 'u-admin';

/** Login accounts — password for all: 123456. Every real person has one. */
const account = (memberId: string, label: string, group: DemoAccount['group']): DemoAccount => {
  const m = mockMembers.find((x) => x.id === memberId);
  if (!m) throw new Error(`Unknown demo account member: ${memberId}`);
  return { memberId, label, group, phone: m.phone, password: '123456' };
};

export const demoAccounts: DemoAccount[] = [
  account('u-sector', 'الأمين — أمانة قطاع الأعمال', 'leadership'),
  account('u-admin', 'مدير النظام (حساب تجريبي)', 'leadership'),

  account('u-fekry', 'الأمين المساعد • مسؤول لجنة الاستثمار', 'assistants'),
  account('u-hany', 'الأمين المساعد • مسؤول لجنة الصناعة', 'assistants'),
  account('u-shenawy', 'الأمين المساعد • مسؤول لجنة التطوير العقاري', 'assistants'),
  account('u-shoukry', 'الأمين المساعد • مسؤول لجنة التطوير العقاري', 'assistants'),
  account('u-bahaa', 'الأمين المساعد • مسؤول لجنة التجارة', 'assistants'),
  account('u-alaa', 'الأمين المساعد • مسؤول لجنة التجارة', 'assistants'),
  account('u-mounir', 'الأمين المساعد • مسؤول لجنة السياحة والضيافة', 'assistants'),
  account('u-zayed', 'الأمين المساعد • مسؤول لجنة الدراسات', 'assistants'),

  account('u-eslam', 'عضو الهيئة • مسؤول لجنة الاستثمار', 'bureau'),
  account('u-hesham', 'عضو الهيئة • مسؤول لجنة الصناعة', 'bureau'),
  account('u-hassan', 'عضو الهيئة • مسؤول لجنة التطوير العقاري', 'bureau'),
  account('u-ghitany', 'عضو الهيئة • مسؤول لجنة ريادة الأعمال', 'bureau'),
  account('u-gohary', 'عضو الهيئة • مسؤول لجنة ريادة الأعمال', 'bureau'),
  account('u-zallat', 'عضو الهيئة • مسؤول لجنة التجارة', 'bureau'),
  account('u-nowishy', 'عضو الهيئة • مسؤول لجنة السياحة والضيافة', 'bureau'),
  account('u-zayat', 'عضو الهيئة • مسؤول لجنة التكنولوجيا', 'bureau'),
  account('u-kafas', 'عضو الهيئة • مسؤول لجنة التكنولوجيا', 'bureau'),
  account('u-emad', 'عضو الهيئة • مسؤول لجنة المسؤولية المجتمعية', 'bureau'),
  account('u-abbas', 'عضو الهيئة • مسؤول لجنة المسؤولية المجتمعية', 'bureau'),
  account('u-morgan', 'عضو الهيئة • مسؤول لجنة الدراسات', 'bureau'),
  account('u-yehia', 'عضو الهيئة • مسؤول لجنة الأسواق المالية', 'bureau'),
  account('u-camelia', 'عضو الهيئة', 'bureau'),

  account('u-ayad', 'مسؤول لجنة الاستثمار', 'officials'),

  account('u-ahmed', 'عضو — لجنة التكنولوجيا (بيانات تجريبية)', 'demo'),
  account('u-mona', 'أمين سر — لجنة الاستثمار (بيانات تجريبية)', 'demo'),
];

export const DEMO_ACCOUNT_GROUP_LABELS: Record<DemoAccount['group'], string> = {
  leadership: 'قيادة الأمانة',
  assistants: 'الأمناء المساعدون',
  bureau: 'أعضاء الهيئة',
  officials: 'مسؤولو اللجان',
  demo: 'أعضاء تجريبيون',
};
