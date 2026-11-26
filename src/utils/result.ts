/** Result helpers for store actions (`Result<T>` lives in types/common.types). */
import type { Result } from '@/types/common.types';

export const ok = <T>(data: T): Result<T> => ({ ok: true, data });
export const okVoid = (): Result => ({ ok: true, data: undefined });
export const fail = <T = void>(error: string): Result<T> => ({ ok: false, error });
export const ERR = {
  auth: 'يرجى تسجيل الدخول أولاً',
  notFound: 'العنصر المطلوب غير موجود',
  forbidden: 'ليست لديك صلاحية لتنفيذ هذا الإجراء (صلاحيات تجريبية)',
  required: 'يرجى استكمال البيانات المطلوبة',
} as const;
