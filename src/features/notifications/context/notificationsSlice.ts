import { nowISO, uid } from '@/utils/id';
import type { SliceCreator } from '@/types/store.types';
import { type NotificationsSlice } from '@/features/notifications/types';

export const createNotificationsSlice: SliceCreator<NotificationsSlice> = (set, get) => ({
  createNotification: (input) => {
    set({ notifications: [{ ...input, id: uid('n'), createdAt: nowISO(), read: false }, ...get().notifications] });
  },

  markNotificationRead: (id) => {
    set({ notifications: get().notifications.map((n) => (n.id === id ? { ...n, read: true } : n)) });
  },

  markAllNotificationsRead: () => {
    const userId = get().currentUserId;
    set({ notifications: get().notifications.map((n) => (n.recipientId === userId ? { ...n, read: true } : n)) });
  },
});
