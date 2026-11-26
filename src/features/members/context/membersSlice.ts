import type { Member, MembersSlice, Role } from '@/features/members/types';
import { isAdmin } from '@/features/auth/services/permissions';
import { nowISO, uid } from '@/utils/id';
import { getUser } from '@/features/auth/services/session';
import { replaceById } from '@/utils/collections';
import { ERR, fail, ok, okVoid } from '@/utils/result';
import type { SliceCreator } from '@/types/store.types';
import { identityPalette } from '@/theme';

const AVATAR_COLORS = identityPalette.slice(0, 6);

/**
 * Keeps role and committee scopes consistent: supervision is only kept for assistant
 * secretaries, and people are always members of the committees they are responsible for.
 */
function normalizeScopes(
  role: Role,
  scopes: { committeeIds: string[]; managedCommitteeIds: string[]; supervisedCommitteeIds: string[] },
): Pick<Member, 'role' | 'committeeIds' | 'managedCommitteeIds' | 'supervisedCommitteeIds'> {
  // الأمين and the admin already cover every committee — no responsibility list needed.
  const managed = role === 'sector_secretary' || role === 'admin' ? [] : scopes.managedCommitteeIds;
  return {
    role,
    managedCommitteeIds: managed,
    supervisedCommitteeIds: role === 'assistant_secretary' ? scopes.supervisedCommitteeIds : [],
    committeeIds: Array.from(new Set([...scopes.committeeIds, ...managed])),
  };
}

export const createMembersSlice: SliceCreator<MembersSlice> = (set, get) => ({
  createDemoMember: (input) => {
    const state = get();
    const user = getUser(state);
    if (!user) return fail(ERR.auth);
    if (!isAdmin(user)) return fail(ERR.forbidden);
    if (!input.name.trim()) return fail('يرجى إدخال اسم العضو');
    const n = state.members.length + 500;
    const scopes = normalizeScopes(input.role, input);
    const member: Member = {
      id: uid('u'),
      name: input.name.trim(),
      title: input.title.trim() || 'عضو لجنة',
      ...scopes,
      governorateIds: [],
      membershipNumber: `ق.أ/${new Date().getFullYear()}/${String(n).padStart(4, '0')}`,
      status: input.status,
      joinDate: nowISO(),
      phone: input.phone?.trim() || `0100000${String(n).padStart(4, '0')}`,
      email: input.email?.trim() || `member${n}@demo.example`,
      avatarColor: AVATAR_COLORS[n % AVATAR_COLORS.length],
    };
    set({ members: [...state.members, member] });
    return ok(member);
  },

  editDemoMember: (id, patch) => {
    const state = get();
    const user = getUser(state);
    if (!user) return fail(ERR.auth);
    const admin = isAdmin(user);
    if (!admin && user.id !== id) return fail(ERR.forbidden);
    const member = state.members.find((m) => m.id === id);
    if (!member) return fail(ERR.notFound);
    if (patch.name !== undefined && !patch.name.trim()) return fail('يرجى إدخال اسم العضو');
    const { role, committeeIds, managedCommitteeIds, supervisedCommitteeIds, ...profile } = patch;
    const changesAccess = role !== undefined || committeeIds !== undefined || managedCommitteeIds !== undefined || supervisedCommitteeIds !== undefined;
    if (changesAccess && !admin) return fail('تعديل الأدوار واللجان متاح لمدير النظام فقط');
    const nextRole = role ?? member.role;
    if (member.id === user.id && member.role === 'admin' && nextRole !== 'admin') {
      return fail('لا يمكنك إزالة صلاحية مدير النظام عن حسابك الحالي');
    }
    const scopes = changesAccess
      ? normalizeScopes(nextRole, {
          committeeIds: committeeIds ?? member.committeeIds,
          managedCommitteeIds: managedCommitteeIds ?? member.managedCommitteeIds,
          supervisedCommitteeIds: supervisedCommitteeIds ?? member.supervisedCommitteeIds,
        })
      : {};
    set({
      members: replaceById(state.members, id, (m) => ({
        ...m,
        ...profile,
        ...scopes,
        // Governorates belong to assistant secretaries only.
        governorateIds: nextRole === 'assistant_secretary' ? m.governorateIds : [],
      })),
    });
    return okVoid();
  },
});
