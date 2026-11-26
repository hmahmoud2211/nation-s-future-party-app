import { can } from '@/features/auth/services/permissions';
import { getUser } from '@/features/auth/services/session';
import { ERR, fail, okVoid } from '@/utils/result';
import type { SliceCreator } from '@/types/store.types';
import { type GovernoratesSlice } from '@/features/governorates/types';

export const createGovernoratesSlice: SliceCreator<GovernoratesSlice> = (set, get) => ({
  assignGovernorate: (governorateId, memberId) => {
    const state = get();
    const user = getUser(state);
    if (!user) return fail(ERR.auth);
    if (!can(user, 'governorates.manage')) return fail(ERR.forbidden);
    if (!state.governorates.some((g) => g.id === governorateId)) return fail(ERR.notFound);
    if (memberId) {
      const target = state.members.find((m) => m.id === memberId);
      if (!target) return fail(ERR.notFound);
      if (target.role !== 'assistant_secretary') return fail('تُسند المحافظات إلى الأمناء المساعدين فقط');
    }
    // One coordinator per governorate: remove it from everyone, then give it to the new one.
    set({
      members: state.members.map((m) => {
        const without = m.governorateIds.filter((g) => g !== governorateId);
        if (m.id === memberId) return { ...m, governorateIds: [...without, governorateId] };
        return without.length === m.governorateIds.length ? m : { ...m, governorateIds: without };
      }),
    });
    return okVoid();
  },

  // ───────────── Announcements ─────────────,
});
