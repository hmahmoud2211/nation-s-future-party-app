import { personLabel } from '@/features/auth/services/roles';
import { useShallow } from 'zustand/react/shallow';
import { useMemo } from 'react';
import type { Member } from '@/features/members/types';
import { useAppStore } from '@/context/appStore';
import { committeeOfficials, isRegularMemberOf } from '@/features/members/services/memberLookup';

/** People responsible for a committee — a committee can have several. */
export function useCommitteeOfficials(committeeId?: string): Member[] {
  const members = useAppStore((s) => s.members);
  return useMemo(() => (committeeId ? committeeOfficials(members, committeeId) : []), [members, committeeId]);
}

export function useMember(id?: string): Member | undefined {
  return useAppStore((s) => (id ? s.members.find((m) => m.id === id) : undefined));
}

export function useMemberMap(): Record<string, Member> {
  const members = useAppStore((s) => s.members);
  return useMemo(() => Object.fromEntries(members.map((m) => [m.id, m])), [members]);
}

/** All members records (raw store array — derive with useMemo). */
export const useMembers = () => useAppStore((s) => s.members);

/** The members store actions (stable references). */
export function useMemberActions() {
  return useAppStore(
    useShallow((s) => ({
      createDemoMember: s.createDemoMember,
      editDemoMember: s.editDemoMember,
    })),
  );
}

/** Resolvers for shared components that show people by id (Timeline, MessageThread). */
export function usePeopleResolvers() {
  const members = useMemberMap();
  return useMemo(
    () => ({
      actorName: (id: string) => members[id]?.name,
      authorOf: (id: string) => {
        const m = members[id];
        return m ? { name: m.name, avatarColor: m.avatarColor, label: personLabel(m) } : undefined;
      },
    }),
    [members],
  );
}

/** Number of regular members (not officials) of a committee. */
export const useRegularMemberCount = (committeeId: string) =>
  useAppStore((s) => s.members.filter((m) => isRegularMemberOf(m, committeeId)).length);
