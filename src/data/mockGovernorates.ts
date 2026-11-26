import type { Governorate, GovernorateContact } from '@/features/governorates/types';

/** Egypt's 27 governorates (real names), grouped by region for display. */
export const mockGovernorates: Governorate[] = [
  { id: 'g-cairo', name: 'القاهرة', region: 'القاهرة الكبرى' },
  { id: 'g-giza', name: 'الجيزة', region: 'القاهرة الكبرى' },
  { id: 'g-qalyubia', name: 'القليوبية', region: 'القاهرة الكبرى' },
  { id: 'g-alex', name: 'الإسكندرية', region: 'الدلتا والإسكندرية' },
  { id: 'g-beheira', name: 'البحيرة', region: 'الدلتا والإسكندرية' },
  { id: 'g-gharbia', name: 'الغربية', region: 'الدلتا والإسكندرية' },
  { id: 'g-monufia', name: 'المنوفية', region: 'الدلتا والإسكندرية' },
  { id: 'g-dakahlia', name: 'الدقهلية', region: 'الدلتا والإسكندرية' },
  { id: 'g-kafrelsheikh', name: 'كفر الشيخ', region: 'الدلتا والإسكندرية' },
  { id: 'g-sharqia', name: 'الشرقية', region: 'الدلتا والإسكندرية' },
  { id: 'g-damietta', name: 'دمياط', region: 'الدلتا والإسكندرية' },
  { id: 'g-portsaid', name: 'بورسعيد', region: 'القناة وسيناء' },
  { id: 'g-ismailia', name: 'الإسماعيلية', region: 'القناة وسيناء' },
  { id: 'g-suez', name: 'السويس', region: 'القناة وسيناء' },
  { id: 'g-northsinai', name: 'شمال سيناء', region: 'القناة وسيناء' },
  { id: 'g-southsinai', name: 'جنوب سيناء', region: 'القناة وسيناء' },
  { id: 'g-fayoum', name: 'الفيوم', region: 'شمال الصعيد' },
  { id: 'g-benisuef', name: 'بني سويف', region: 'شمال الصعيد' },
  { id: 'g-minya', name: 'المنيا', region: 'شمال الصعيد' },
  { id: 'g-assiut', name: 'أسيوط', region: 'جنوب الصعيد' },
  { id: 'g-sohag', name: 'سوهاج', region: 'جنوب الصعيد' },
  { id: 'g-qena', name: 'قنا', region: 'جنوب الصعيد' },
  { id: 'g-luxor', name: 'الأقصر', region: 'جنوب الصعيد' },
  { id: 'g-aswan', name: 'أسوان', region: 'جنوب الصعيد' },
  { id: 'g-redsea', name: 'البحر الأحمر', region: 'المحافظات الحدودية' },
  { id: 'g-newvalley', name: 'الوادي الجديد', region: 'المحافظات الحدودية' },
  { id: 'g-matrouh', name: 'مطروح', region: 'المحافظات الحدودية' },
];

/**
 * ⚠️ SAMPLE assignment of governorates to assistant secretaries — the official decree does not
 * specify it. Shown as sample data in the app; the admin can reassign governorates.
 */
export const SAMPLE_GOVERNORATE_ASSIGNMENT: Record<string, string[]> = {
  'u-shenawy': ['g-cairo', 'g-giza', 'g-qalyubia'],
  'u-zayed': ['g-alex', 'g-beheira', 'g-matrouh'],
  'u-shoukry': ['g-dakahlia', 'g-damietta', 'g-kafrelsheikh'],
  'u-bahaa': ['g-ismailia', 'g-portsaid', 'g-suez', 'g-northsinai'],
  'u-hany': ['g-sharqia', 'g-gharbia', 'g-monufia'],
  'u-mounir': ['g-southsinai', 'g-redsea', 'g-luxor', 'g-aswan'],
  'u-alaa': ['g-fayoum', 'g-benisuef', 'g-minya'],
  'u-fekry': ['g-assiut', 'g-sohag', 'g-qena', 'g-newvalley'],
};

/** FICTIONAL governorate secretaries and committee representatives (placeholder phones). */
const SECRETARIES: [string, string][] = [
  ['g-cairo', 'كريم فتحي عبد الله'],
  ['g-giza', 'هالة سمير منصور'],
  ['g-qalyubia', 'أشرف رمضان علي'],
  ['g-alex', 'نادر جلال يوسف'],
  ['g-beheira', 'سامح عبد الفتاح'],
  ['g-gharbia', 'وائل حمدي سالم'],
  ['g-monufia', 'رشا عبد العظيم'],
  ['g-dakahlia', 'أيمن صبري خليل'],
  ['g-kafrelsheikh', 'محمد شعبان عرفة'],
  ['g-sharqia', 'طارق عبد الرازق'],
  ['g-damietta', 'إيهاب نصر الدين'],
  ['g-portsaid', 'عمرو البدري'],
  ['g-ismailia', 'منى الشربيني'],
  ['g-suez', 'حسن رأفت'],
  ['g-northsinai', 'سليمان عودة'],
  ['g-southsinai', 'جمال سالم'],
  ['g-fayoum', 'مصطفى عبد الحليم'],
  ['g-benisuef', 'علاء فرغلي'],
  ['g-minya', 'نجلاء ثابت'],
  ['g-assiut', 'عادل ممدوح'],
  ['g-sohag', 'خالد أبو زيد'],
  ['g-qena', 'ناصر الحفني'],
  ['g-luxor', 'أحمد نوفل'],
  ['g-aswan', 'ياسر عبد الباقي'],
  ['g-redsea', 'شريف لطفي'],
  ['g-newvalley', 'فوزي عبد الجليل'],
  ['g-matrouh', 'مسعد الحداد'],
];

const REPRESENTATIVES: [string, string, string, string][] = [
  ['g-cairo', 'دعاء حسين', 'c-investment', 'ممثل لجنة الاستثمار'],
  ['g-alex', 'تامر سعد', 'c-trade', 'ممثل لجنة التجارة الداخلية والخارجية'],
  ['g-sharqia', 'محمود عزت', 'c-industry', 'ممثل لجنة الصناعة'],
  ['g-luxor', 'رانيا مختار', 'c-tourism', 'ممثل لجنة السياحة والضيافة'],
  ['g-southsinai', 'سلمى عادل', 'c-tourism', 'ممثل لجنة السياحة والضيافة'],
  ['g-assiut', 'هشام بكر', 'c-entre', 'ممثل لجنة ريادة الأعمال والابتكار'],
  ['g-sohag', 'إيمان طلعت', 'c-social', 'ممثل لجنة المسؤولية المجتمعية'],
];

export const mockGovernorateContacts: GovernorateContact[] = [
  ...SECRETARIES.map(([governorateId, name], i) => ({
    id: `gc-${String(i + 1).padStart(2, '0')}`,
    governorateId,
    name,
    title: 'أمين أمانة قطاع الأعمال بالمحافظة',
    responsibilities: 'متابعة أنشطة الأمانة في المحافظة، والتنسيق مع اللجان المركزية، ورفع المقترحات المحلية.',
    phone: `01200000${String(i + 1).padStart(3, '0')}`,
  })),
  ...REPRESENTATIVES.map(([governorateId, name, committeeId, title], i) => ({
    id: `gc-r${String(i + 1).padStart(2, '0')}`,
    governorateId,
    name,
    title,
    committeeId,
    responsibilities: 'تنسيق أنشطة اللجنة ومقترحاتها داخل المحافظة ومتابعة تنفيذها مع أمين المحافظة.',
    phone: `01200001${String(i + 1).padStart(3, '0')}`,
  })),
];
