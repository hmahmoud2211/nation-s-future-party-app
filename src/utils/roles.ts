/**
 * Role display helpers. Each person has ONE role; committee responsibility (مسؤول اللجنة)
 * is a separate permission stored in `managedCommitteeIds`.
 */
import { ROLE_LABELS } from '@/constants/labels';
import type { Member, Role } from '@/types';

/** Highest position first — used for sorting people. */
export const ROLE_ORDER: Role[] = ['admin', 'sector_secretary', 'assistant_secretary', 'board_member', 'member'];

export const LEADERSHIP_ROLES: Role[] = ['assistant_secretary', 'sector_secretary', 'admin'];

type MaybeMember = Pick<Member, 'role'> | null | undefined;

export const hasRole = (u: MaybeMember, role: Role): boolean => !!u && u.role === role;

export const hasAnyRole = (u: MaybeMember, roles: Role[]): boolean => !!u && roles.includes(u.role);

/** Whether the person is responsible for at least one committee (مسؤول اللجنة). */
export const isResponsible = (u: Pick<Member, 'managedCommitteeIds'> | null | undefined): boolean => !!u && u.managedCommitteeIds.length > 0;

/** "الأمين المساعد • مسؤول اللجنة" — role plus committee responsibility when present. */
export function rolesLabel(u: Pick<Member, 'role' | 'managedCommitteeIds'>, separator = ' • '): string {
  const parts = [ROLE_LABELS[u.role]];
  if (u.managedCommitteeIds.length) parts.push('مسؤول اللجنة');
  // A plain member who runs a committee is shown simply as "مسؤول اللجنة".
  if (u.role === 'member' && u.managedCommitteeIds.length) parts.shift();
  return parts.join(separator);
}

/** Short label for a person: their title for plain members, otherwise role (+ responsibility). */
export function personLabel(u: Pick<Member, 'role' | 'title' | 'managedCommitteeIds'>): string {
  if (u.role === 'member' && !u.managedCommitteeIds.length) return u.title || ROLE_LABELS.member;
  return rolesLabel(u);
}
