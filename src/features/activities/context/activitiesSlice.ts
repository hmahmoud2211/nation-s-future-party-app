import type { ActivitiesSlice, Activity } from '@/features/activities/types';
import { canManageCommittee } from '@/features/auth/services/permissions';
import { nowISO, uid } from '@/utils/id';
import { getUser } from '@/features/auth/services/session';
import { memberIdsOf } from '@/features/members/services/memberLookup';
import { replaceById } from '@/utils/collections';
import { ERR, fail, ok, okVoid } from '@/utils/result';
import type { SliceCreator } from '@/types/store.types';
import { buildNotifications } from '@/features/notifications/services/buildNotifications';

export const createActivitiesSlice: SliceCreator<ActivitiesSlice> = (set, get) => ({
  createActivity: (input) => {
    const state = get();
    const user = getUser(state);
    if (!user) return fail(ERR.auth);
    if (!canManageCommittee(user, input.committeeId)) return fail('يمكنك إنشاء أنشطة للجانك فقط');
    if (!input.title.trim() || !input.date || !input.location.trim()) return fail(ERR.required);
    const activity: Activity = {
      id: uid('ac'),
      title: input.title.trim(),
      description: input.description.trim(),
      committeeId: input.committeeId,
      governorateId: input.governorateId,
      type: input.type,
      date: input.date,
      location: input.location.trim(),
      status: new Date(input.date).getTime() > Date.now() ? 'upcoming' : 'ongoing',
      progress: 0,
      capacity: input.capacity,
      registrations: [],
      images: input.images ?? [],
      createdBy: user.id,
      createdAt: nowISO(),
    };
    set({
      activities: [activity, ...state.activities],
      notifications: [
        ...buildNotifications(memberIdsOf(state, input.committeeId), user.id, {
          type: 'announcement_new',
          title: 'نشاط جديد',
          body: `أعلنت اللجنة عن نشاط "${activity.title}".`,
          link: `/activities/${activity.id}`,
        }),
        ...state.notifications,
      ],
    });
    return ok(activity);
  },

  updateActivity: (id, patch) => {
    const state = get();
    const user = getUser(state);
    const activity = state.activities.find((a) => a.id === id);
    if (!user) return fail(ERR.auth);
    if (!activity) return fail(ERR.notFound);
    if (!canManageCommittee(user, activity.committeeId)) return fail(ERR.forbidden);
    set({ activities: replaceById(state.activities, id, (a) => ({ ...a, ...patch })) });
    return okVoid();
  },

  toggleActivityRegistration: (id) => {
    const state = get();
    const user = getUser(state);
    const activity = state.activities.find((a) => a.id === id);
    if (!user) return fail(ERR.auth);
    if (!activity) return fail(ERR.notFound);
    if (activity.status === 'completed') return fail('انتهى هذا النشاط');
    const registered = activity.registrations.includes(user.id);
    if (!registered && activity.capacity && activity.registrations.length >= activity.capacity) return fail('اكتمل العدد المتاح لهذا النشاط');
    set({
      activities: replaceById(state.activities, id, (a) => ({
        ...a,
        registrations: registered ? a.registrations.filter((r) => r !== user.id) : [...a.registrations, user.id],
      })),
    });
    return ok(!registered);
  },

  publishActivityReport: (id, report) => {
    const state = get();
    const user = getUser(state);
    const activity = state.activities.find((a) => a.id === id);
    if (!user) return fail(ERR.auth);
    if (!activity) return fail(ERR.notFound);
    if (!canManageCommittee(user, activity.committeeId)) return fail(ERR.forbidden);
    if (!report.trim()) return fail('يرجى كتابة تقرير الإنجاز');
    set({
      activities: replaceById(state.activities, id, (a) => ({ ...a, report: report.trim(), status: 'completed', progress: 100 })),
      notifications: [
        ...buildNotifications([...activity.registrations, ...memberIdsOf(state, activity.committeeId)], user.id, {
          type: 'announcement_new',
          title: 'نتائج نشاط',
          body: `تم نشر تقرير إنجاز "${activity.title}".`,
          link: `/activities/${id}`,
        }),
        ...state.notifications,
      ],
    });
    return okVoid();
  },
});
