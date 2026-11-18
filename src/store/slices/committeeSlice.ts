import type { Committee } from '@/types';
import { isAdmin, isSectorWide } from '@/utils/permissions';
import { nowISO, uid } from '@/utils/id';
import { ERR, fail, getUser, ok, okVoid, replaceById } from '../helpers';
import type { CommitteeSlice, SliceCreator } from '../types';

export const createCommitteeSlice: SliceCreator<CommitteeSlice> = (set, get) => ({
  createCommittee: (input) => {
    const state = get();
    const user = getUser(state);
    if (!user) return fail(ERR.auth);
    if (!isAdmin(user)) return fail(ERR.forbidden);
    if (!input.name.trim()) return fail('يرجى إدخال اسم اللجنة');
    const committee: Committee = {
      id: uid('c'),
      name: input.name.trim(),
      shortName: input.shortName.trim() || input.name.trim(),
      description: input.description.trim(),
      icon: input.icon,
      color: input.color,
      enabled: true,
      createdAt: nowISO(),
    };
    set({ committees: [...state.committees, committee] });
    return ok(committee);
  },

  updateCommittee: (id, patch) => {
    const state = get();
    const user = getUser(state);
    if (!user) return fail(ERR.auth);
    if (!isAdmin(user)) return fail(ERR.forbidden);
    set({ committees: replaceById(state.committees, id, (c) => ({ ...c, ...patch })) });
    return okVoid();
  },

  toggleCommittee: (id) => {
    const state = get();
    const user = getUser(state);
    if (!user) return fail(ERR.auth);
    if (!isAdmin(user)) return fail(ERR.forbidden);
    const committee = state.committees.find((c) => c.id === id);
    if (!committee) return fail(ERR.notFound);
    set({ committees: replaceById(state.committees, id, (c) => ({ ...c, enabled: !c.enabled })) });
    return ok(!committee.enabled);
  },

  setCommitteeOfficials: (committeeId, memberIds) => {
    const state = get();
    const user = getUser(state);
    if (!user) return fail(ERR.auth);
    if (!isAdmin(user)) return fail(ERR.forbidden);
    const committee = state.committees.find((c) => c.id === committeeId);
    if (!committee) return fail(ERR.notFound);
    const chosen = new Set(memberIds);
    for (const id of chosen) {
      const member = state.members.find((m) => m.id === id);
      if (!member) return fail(ERR.notFound);
      if (isSectorWide(member)) return fail(`لا يمكن تعيين ${member.name} مسؤولاً للجنة — صلاحياته تشمل جميع اللجان بالفعل`);
    }
    // Committee responsibility is a permission (managedCommitteeIds), not a role — roles stay unchanged.
    set({
      members: state.members.map((m) => {
        const wasResponsible = m.managedCommitteeIds.includes(committeeId);
        const isResponsibleNow = chosen.has(m.id);
        if (wasResponsible === isResponsibleNow) return m;
        if (isResponsibleNow) {
          return {
            ...m,
            managedCommitteeIds: [...m.managedCommitteeIds, committeeId],
            committeeIds: Array.from(new Set([...m.committeeIds, committeeId])),
            title: m.role === 'member' && !m.managedCommitteeIds.length ? `مسؤول ${committee.name}` : m.title,
          };
        }
        // Removed: stays a member of the committee.
        const managed = m.managedCommitteeIds.filter((id) => id !== committeeId);
        return { ...m, managedCommitteeIds: managed, title: m.role === 'member' && !managed.length ? 'عضو لجنة' : m.title };
      }),
    });
    return okVoid();
  },
});
