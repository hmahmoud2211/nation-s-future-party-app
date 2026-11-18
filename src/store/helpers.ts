import type { AppNotification, Member, TimelineEvent } from '@/types';
import { nowISO, uid } from '@/utils/id';
import type { AppState, Result } from './types';

export const ok = <T>(data: T): Result<T> => ({ ok: true, data });
export const okVoid = (): Result => ({ ok: true, data: undefined });
export const fail = <T = void>(error: string): Result<T> => ({ ok: false, error });

export const ERR = {
  auth: 'يرجى تسجيل الدخول أولاً',
  notFound: 'العنصر المطلوب غير موجود',
  forbidden: 'ليست لديك صلاحية لتنفيذ هذا الإجراء (صلاحيات تجريبية)',
  required: 'يرجى استكمال البيانات المطلوبة',
} as const;

export function getUser(state: AppState): Member | undefined {
  return state.members.find((m) => m.id === state.currentUserId);
}

export function event(type: TimelineEvent['type'], label: string, actorId: string, note?: string): TimelineEvent {
  return { id: uid('ev'), type, label, actorId, note, createdAt: nowISO() };
}

/** Builds notifications for each recipient, skipping the actor and duplicates. */
export function buildNotifications(
  recipients: (string | undefined)[],
  actorId: string | undefined,
  payload: Omit<AppNotification, 'id' | 'createdAt' | 'read' | 'recipientId'>,
): AppNotification[] {
  const unique = Array.from(new Set(recipients.filter((r): r is string => !!r && r !== actorId)));
  return unique.map((recipientId) => ({
    ...payload,
    id: uid('n'),
    recipientId,
    createdAt: nowISO(),
    read: false,
  }));
}

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

export function committeeNameOf(state: AppState, id?: string): string {
  return state.committees.find((c) => c.id === id)?.name ?? 'اللجنة';
}

export function replaceById<T extends { id: string }>(list: T[], id: string, updater: (item: T) => T): T[] {
  return list.map((item) => (item.id === id ? updater(item) : item));
}

export const clampProgress = (p: number) => Math.max(0, Math.min(100, Math.round(p)));
