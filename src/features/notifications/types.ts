import type { ISODate } from '@/types/common.types';

export type NotificationType =
  | 'proposal_new'
  | 'proposal_update'
  | 'feedback_new'
  | 'feedback_reply'
  | 'meeting_new'
  | 'meeting_started'
  | 'announcement_new'
  | 'project_update'
  | 'request_update';

export interface AppNotification {
  id: string;
  recipientId: string;
  type: NotificationType;
  title: string;
  body: string;
  createdAt: ISODate;
  read: boolean;
  /** Expo Router href to open the related screen. */
  link?: string;
}

// ───────────── Store slice ─────────────

export interface NotificationsSlice {
  createNotification: (input: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
}
