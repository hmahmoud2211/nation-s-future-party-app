/** Pure lookups over members (no React). */
import type { Member } from '@/features/members/types';
import type { AppState } from '@/types/store.types';

import { ROLE_ORDER } from '@/features/auth/services/roles';

/** Officials responsible for a committee (a committee can have several). */
export function officialIdsFor(state: Pick<AppState, 'members'>, committeeId: string): string[] {
  return state.members.filter((m) => m.status !== 'suspended' && m.managedCommitteeIds.includes(committeeId)).map((m) => m.id);
}
export function memberIdsOf(state: AppState, committeeId: string): string[] {
  return state.members
    .filter((m) => m.status !== 'suspended' && (m.committeeIds.includes(committeeId) || m.managedCommitteeIds.includes(committeeId)))
    .map((m) => m.id);
}
export function nameOf(state: AppState, id?: string): string {
  return state.members.find((m) => m.id === id)?.name ?? 'مستخدم';
}

/** People responsible for a committee, highest role first. */
export function committeeOfficials(members: Member[], committeeId: string): Member[] {
  return members
    .filter((m) => m.managedCommitteeIds.includes(committeeId))
    .sort((a, b) => ROLE_ORDER.indexOf(a.role) - ROLE_ORDER.indexOf(b.role));
}

/** Regular members of a committee (excludes the people responsible for it). */
export function isRegularMemberOf(m: Member, committeeId: string): boolean {
  return m.committeeIds.includes(committeeId) && !m.managedCommitteeIds.includes(committeeId);
}
