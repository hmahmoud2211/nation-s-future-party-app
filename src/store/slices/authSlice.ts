import { demoAccounts } from '@/data';
import { toWesternDigits } from '@/utils/format';
import { fail, ok } from '../helpers';
import type { AuthSlice, SliceCreator } from '../types';

/** Mock authentication — no server, no real credentials. */
export const createAuthSlice: SliceCreator<AuthSlice> = (set, get) => ({
  currentUserId: null,

  loginDemoUser: (phone, password) => {
    const normalized = toWesternDigits(phone).replace(/\D/g, '');
    const account = demoAccounts.find((a) => a.phone === normalized);
    // Any member phone can log in too (demo), as long as the demo password is used.
    const member = account
      ? get().members.find((m) => m.id === account.memberId)
      : get().members.find((m) => m.phone === normalized);
    if (!member) return fail('رقم الهاتف غير مسجل في الحسابات التجريبية');
    if (password !== (account?.password ?? '123456')) return fail('كلمة المرور غير صحيحة — كلمة المرور التجريبية هي 123456');
    if (member.status === 'suspended') return fail('هذه العضوية موقوفة مؤقتاً (بيانات تجريبية)');
    set({ currentUserId: member.id });
    return ok(member);
  },

  logoutDemoUser: () => set({ currentUserId: null }),

  switchDemoUser: (memberId) => {
    const member = get().members.find((m) => m.id === memberId);
    if (!member) return fail('الحساب التجريبي غير موجود');
    set({ currentUserId: member.id });
    return ok(member);
  },
});
