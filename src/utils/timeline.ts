/** Builds timeline / history entries. */
import type { TimelineEvent } from '@/types/common.types';
import { nowISO, uid } from '@/utils/id';

export function event(type: TimelineEvent['type'], label: string, actorId: string, note?: string): TimelineEvent {
  return { id: uid('ev'), type, label, actorId, note, createdAt: nowISO() };
}
