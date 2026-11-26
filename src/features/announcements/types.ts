import type { Attachment, ISODate, Result } from '@/types/common.types';

export type AnnouncementPriority = 'normal' | 'important' | 'urgent';

export type AnnouncementCategory = 'general' | 'meeting' | 'event' | 'administrative';

export interface Announcement {
  id: string;
  title: string;
  body: string;
  /** null = sector-wide announcement */
  committeeId: string | null;
  priority: AnnouncementPriority;
  category: AnnouncementCategory;
  createdBy: string;
  createdAt: ISODate;
  readBy: string[];
  attachments: Attachment[];
}

export interface AnnouncementInput {
  title: string;
  body: string;
  committeeId: string | null;
  priority: AnnouncementPriority;
  category: AnnouncementCategory;
  attachments?: Attachment[];
}

// ───────────── Store slice ─────────────

export interface AnnouncementsSlice {
  createAnnouncement: (input: AnnouncementInput) => Result<Announcement>;
  markAnnouncementRead: (id: string) => void;
}
