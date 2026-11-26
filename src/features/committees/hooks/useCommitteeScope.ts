import { useMemo } from 'react';
import { useAppStore } from '@/context/appStore';
import { useUser } from '@/features/auth/hooks/useSession';
import type { Committee } from '@/features/committees/types';
import { canManageCommittee, isAdmin, isCommitteeMember } from '@/features/auth/services/permissions';

/**
 * Committees a public list (projects) covers: the explicit `committeeId` param, otherwise every
 * enabled committee — committee work is transparent; only finance and management stay restricted.
 */
export function useListScope(committeeId?: string): string[] {
  const user = useUser();
  const committees = useAppStore((s) => s.committees);
  return useMemo(() => {
    if (committeeId) return [committeeId];
    return committees.filter((c) => c.enabled || isCommitteeMember(user, c.id)).map((c) => c.id);
  }, [committeeId, user, committees]);
}
/** Committees the current user may create records in (official → managed, admin → all enabled). */
export function useManageableCommittees(): Committee[] {
  const user = useUser();
  const committees = useAppStore((s) => s.committees);
  return useMemo(() => {
    if (isAdmin(user)) return committees.filter((c) => c.enabled);
    return committees.filter((c) => user.managedCommitteeIds.includes(c.id));
  }, [user, committees]);
}
/** Whether the "create" action should be offered on a list screen. */
export function useCanCreateIn(committeeId?: string): { canCreate: boolean; targetCommitteeId?: string } {
  const user = useUser();
  const manageable = useManageableCommittees();
  if (committeeId) return { canCreate: canManageCommittee(user, committeeId), targetCommitteeId: committeeId };
  return { canCreate: manageable.length > 0, targetCommitteeId: user.managedCommitteeIds[0] };
}
