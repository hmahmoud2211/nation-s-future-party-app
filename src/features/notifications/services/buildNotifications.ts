import type { AppNotification } from '@/features/notifications/types';
import { nowISO, uid } from '@/utils/id';

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
