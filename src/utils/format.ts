/**
 * Arabic formatting helpers. Implemented manually (no Intl dependency) so the
 * output is identical on iOS, Android and web.
 *
 * Digits follow the design system's `NUMERAL_STYLE` (Western digits in the current design).
 */
import { NUMERAL_STYLE } from '@/theme';

const ARABIC_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
const USE_ARABIC_DIGITS = (NUMERAL_STYLE as string) === 'arabic';
const THOUSANDS_SEPARATOR = USE_ARABIC_DIGITS ? '٬' : ',';
const PERCENT_SIGN = USE_ARABIC_DIGITS ? '٪' : '%';

/** Converts Western digits (0-9) in a string to Arabic-Indic digits (٠-٩). */
export function toArabicDigits(input: string | number): string {
  return String(input).replace(/[0-9]/g, (d) => ARABIC_DIGITS[Number(d)]);
}

/** Converts Arabic-Indic digits back to Western digits (for parsing input). */
export function toWesternDigits(input: string): string {
  return input.replace(/[٠-٩]/g, (d) => String(ARABIC_DIGITS.indexOf(d)));
}

/** Renders digits in the app-wide numeral style (`NUMERAL_STYLE` in the theme). */
export function localizeDigits(input: string | number): string {
  return USE_ARABIC_DIGITS ? toArabicDigits(input) : toWesternDigits(String(input));
}

/** 12500 -> "12,500" (or "١٢٬٥٠٠" with Arabic numerals) */
export function formatNumber(value: number): string {
  const rounded = Math.round(value);
  const withSep = Math.abs(rounded)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, THOUSANDS_SEPARATOR);
  return (rounded < 0 ? '-' : '') + localizeDigits(withSep);
}

export function formatCurrency(value?: number): string {
  if (value === undefined || value === null || Number.isNaN(value)) return '—';
  return `${formatNumber(value)} جنيه`;
}

export function formatPercent(value: number): string {
  return `${localizeDigits(Math.round(value))}${PERCENT_SIGN}`;
}

/**
 * Egyptian mobile numbers grouped 4 · 3 · 4 ("0120 000 0010"). The groups are joined with no-break spaces,
 * which the bidi algorithm keeps inside the number, so the groups never swap order in right-to-left text.
 */
export function formatPhone(phone: string): string {
  const digits = toWesternDigits(phone).replace(/\D/g, '');
  if (digits.length !== 11) return localizeDigits(phone);
  return localizeDigits(`${digits.slice(0, 4)}\u00A0${digits.slice(4, 7)}\u00A0${digits.slice(7)}`);
}

/** "22/11/2026" — compact numeric date used on dashboard cards. */
export function formatNumericDate(value?: string | Date | number): string {
  if (!value) return '—';
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return localizeDigits(`${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`);
}

export const AR_MONTHS = [
  'يناير',
  'فبراير',
  'مارس',
  'أبريل',
  'مايو',
  'يونيو',
  'يوليو',
  'أغسطس',
  'سبتمبر',
  'أكتوبر',
  'نوفمبر',
  'ديسمبر',
];

export const AR_WEEKDAYS = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
export const AR_WEEKDAYS_SHORT = ['أحد', 'اثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'];

function toDate(value: string | Date | number): Date {
  return value instanceof Date ? value : new Date(value);
}

/** "16 نوفمبر 2026" */
export function formatDate(value?: string | Date | number): string {
  if (!value) return '—';
  const d = toDate(value);
  if (Number.isNaN(d.getTime())) return '—';
  return localizeDigits(`${d.getDate()} ${AR_MONTHS[d.getMonth()]} ${d.getFullYear()}`);
}

/** "16 نوفمبر" */
export function formatShortDate(value?: string | Date | number): string {
  if (!value) return '—';
  const d = toDate(value);
  return localizeDigits(`${d.getDate()} ${AR_MONTHS[d.getMonth()]}`);
}

/** "10:30 ص" */
export function formatTime(value?: string | Date | number): string {
  if (!value) return '—';
  const d = toDate(value);
  let h = d.getHours();
  const m = d.getMinutes();
  const suffix = h >= 12 ? 'م' : 'ص';
  h = h % 12;
  if (h === 0) h = 12;
  return localizeDigits(`${h}:${m.toString().padStart(2, '0')} ${suffix}`);
}

/** "الاثنين 16 نوفمبر، 10:30 ص" */
export function formatDateTime(value?: string | Date | number): string {
  if (!value) return '—';
  const d = toDate(value);
  return `${AR_WEEKDAYS[d.getDay()]} ${formatShortDate(d)}، ${formatTime(d)}`;
}

export function formatWeekday(value: string | Date | number): string {
  return AR_WEEKDAYS[toDate(value).getDay()];
}

const pluralize = (n: number, one: string, two: string, few: string, many: string) => {
  if (n === 1) return one;
  if (n === 2) return two;
  if (n >= 3 && n <= 10) return `${localizeDigits(n)} ${few}`;
  return `${localizeDigits(n)} ${many}`;
};

/** "منذ 3 ساعات" / "بعد يومين" */
export function formatRelative(value?: string | Date | number, now: Date = new Date()): string {
  if (!value) return '—';
  const d = toDate(value);
  const diffMs = d.getTime() - now.getTime();
  const future = diffMs > 0;
  const abs = Math.abs(diffMs);
  const minutes = Math.round(abs / 60000);
  const hours = Math.round(abs / 3600000);
  const days = Math.round(abs / 86400000);

  let text: string;
  if (minutes < 1) return 'الآن';
  if (minutes < 60) text = pluralize(minutes, 'دقيقة', 'دقيقتين', 'دقائق', 'دقيقة');
  else if (hours < 24) text = pluralize(hours, 'ساعة', 'ساعتين', 'ساعات', 'ساعة');
  else if (days < 30) text = pluralize(days, 'يوم', 'يومين', 'أيام', 'يوماً');
  else return formatDate(d);
  return future ? `بعد ${text}` : `منذ ${text}`;
}

/** Remaining days until a date: "متبقٍ 3 أيام" / "متأخرة بيومين" / "اليوم" */
export function formatDueIn(value: string, now: Date = new Date()): string {
  const d = toDate(value);
  const startOf = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const days = Math.round((startOf(d) - startOf(now)) / 86400000);
  if (days === 0) return 'تستحق اليوم';
  if (days === 1) return 'تستحق غداً';
  if (days > 1) return `متبقٍ ${pluralize(days, 'يوم', 'يومان', 'أيام', 'يوماً')}`;
  const late = Math.abs(days);
  return `متأخرة ${late === 1 ? 'يوماً واحداً' : late === 2 ? 'يومين' : pluralize(late, 'يوم', 'يومين', 'أيام', 'يوماً')}`;
}

export function formatFileSize(bytes?: number): string {
  if (!bytes && bytes !== 0) return '';
  if (bytes < 1024) return `${localizeDigits(bytes)} بايت`;
  if (bytes < 1024 * 1024) return `${localizeDigits((bytes / 1024).toFixed(0))} ك.ب`;
  return `${localizeDigits((bytes / (1024 * 1024)).toFixed(1))} م.ب`;
}

/** Honorifics written before a name (e.g. "النائب" for members of parliament). */
const HONORIFICS = ['النائب', 'النائبة', 'د.', 'م.', 'أ.'];

function nameParts(name: string): string[] {
  const parts = name.trim().replace(/\//g, ' ').split(/\s+/).filter(Boolean);
  while (parts.length > 1 && HONORIFICS.includes(parts[0])) parts.shift();
  return parts;
}

/** Initials for avatars: "أحمد محمد" -> "أم" (honorifics are skipped). */
export function initials(name: string): string {
  const parts = nameParts(name);
  if (parts.length === 0) return '؟';
  if (parts.length === 1) return parts[0].slice(0, 2);
  return `${parts[0][0]}${parts[1][0]}`;
}

export function firstName(name: string): string {
  return nameParts(name)[0] ?? name;
}

/**
 * Common short form of a long official name — first, second and family name:
 * "محمد فكري عيسى عيسى" -> "محمد فكري عيسى". Keeps the honorific ("النائب").
 */
export function shortName(name: string): string {
  const all = name.trim().replace(/\//g, ' ').split(/\s+/).filter(Boolean);
  const honorific = all.length > 1 && HONORIFICS.includes(all[0]) ? `${all[0]} ` : '';
  const parts = compoundNameParts(nameParts(name));
  const short = parts.length <= 3 ? parts : [parts[0], parts[1], parts[parts.length - 1]];
  return `${honorific}${short.join(' ')}`;
}

const NAME_PREFIXES = ['عبد', 'أبو', 'ابو', 'أبي', 'بن'];
const NAME_SUFFIXES = ['الدين', 'الله'];

/** Keeps compound names together: "زين الدين", "أبو النور", "عبد الله". */
function compoundNameParts(parts: string[]): string[] {
  const out: string[] = [];
  for (let i = 0; i < parts.length; i++) {
    const word = parts[i];
    if (NAME_PREFIXES.includes(word) && i + 1 < parts.length) {
      out.push(`${word} ${parts[++i]}`);
    } else if (NAME_SUFFIXES.includes(word) && out.length) {
      out[out.length - 1] = `${out[out.length - 1]} ${word}`;
    } else {
      out.push(word);
    }
  }
  return out;
}

/** Reference codes */
export const refCode = {
  proposal: (seq: number) => localizeDigits(`مق-${seq}`),
  project: (seq: number) => localizeDigits(`مش-${seq}`),
  feedback: (seq: number) => localizeDigits(`ل-${seq}`),
  request: (seq: number) => localizeDigits(`ط-${seq}`),
  report: (seq: number) => localizeDigits(`ت-${seq}`),
};

export function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
