import { useShallow } from 'zustand/react/shallow';
import { useMemo } from 'react';
import { useAppStore } from '@/context/appStore';

export function useMyNotifications() {
  const userId = useAppStore((s) => s.currentUserId);
  const notifications = useAppStore((s) => s.notifications);
  return useMemo(
    () =>
      notifications
        .filter((n) => n.recipientId === userId)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [notifications, userId],
  );
}

export function useUnreadCount(): number {
  return useAppStore((s) => s.notifications.reduce((acc, n) => acc + (n.recipientId === s.currentUserId && !n.read ? 1 : 0), 0));
}

// ───────────── Derived helpers (pure) ─────────────

/** All notifications records (raw store array — derive with useMemo). */
export const useNotifications = () => useAppStore((s) => s.notifications);

/** The notifications store actions (stable references). */
export function useNotificationActions() {
  return useAppStore(
    useShallow((s) => ({
      createNotification: s.createNotification,
      markNotificationRead: s.markNotificationRead,
      markAllNotificationsRead: s.markAllNotificationsRead,
    })),
  );
}
