import type { Announcement, AnnouncementsSlice } from '@/features/announcements/types';
import { canPublishAnnouncement } from '@/features/auth/services/permissions';
import { nowISO, uid } from '@/utils/id';
import { getUser } from '@/features/auth/services/session';
import { memberIdsOf } from '@/features/members/services/memberLookup';
import { replaceById } from '@/utils/collections';
import { ERR, fail, ok } from '@/utils/result';
import type { SliceCreator } from '@/types/store.types';
import { buildNotifications } from '@/features/notifications/services/buildNotifications';

export const createAnnouncementsSlice: SliceCreator<AnnouncementsSlice> = (set, get) => ({
  createAnnouncement: (input) => {
    const state = get();
    const user = getUser(state);
    if (!user) return fail(ERR.auth);
    if (!canPublishAnnouncement(user, input.committeeId)) return fail(ERR.forbidden);
    if (!input.title.trim() || !input.body.trim()) return fail('يرجى كتابة عنوان ونص الإعلان');
    const announcement: Announcement = {
      id: uid('an'),
      title: input.title.trim(),
      body: input.body.trim(),
      committeeId: input.committeeId,
      priority: input.priority,
      category: input.category,
      createdBy: user.id,
      createdAt: nowISO(),
      readBy: [user.id],
      attachments: input.attachments ?? [],
    };
    const recipients = input.committeeId ? memberIdsOf(state, input.committeeId) : state.members.filter((m) => m.status !== 'suspended').map((m) => m.id);
    set({
      announcements: [announcement, ...state.announcements],
      notifications: [
        ...buildNotifications(recipients, user.id, {
          type: 'announcement_new',
          title: 'إعلان جديد',
          body: announcement.title,
          link: `/announcements/${announcement.id}`,
        }),
        ...state.notifications,
      ],
    });
    return ok(announcement);
  },

  markAnnouncementRead: (id) => {
    const state = get();
    const userId = state.currentUserId;
    if (!userId) return;
    const a = state.announcements.find((x) => x.id === id);
    if (!a || a.readBy.includes(userId)) return;
    set({ announcements: replaceById(state.announcements, id, (x) => ({ ...x, readBy: [...x.readBy, userId] })) });
  },

  // ───────────── Administrative requests ─────────────,
});
