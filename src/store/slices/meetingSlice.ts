import type { Activity, Meeting, RSVPStatus } from '@/types';
import { videoProvider } from '@/services/video';
import { canCreateGeneralMeeting, canManageCommittee, canManageMeeting, canStartConference, meetingCommitteeIds } from '@/utils/permissions';
import { nowISO, uid } from '@/utils/id';
import { formatDateTime } from '@/utils/format';
import { buildNotifications, ERR, fail, getUser, memberIdsOf, ok, okVoid, replaceById } from '../helpers';
import type { MeetingSlice, SliceCreator } from '../types';

export const createMeetingSlice: SliceCreator<MeetingSlice> = (set, get) => ({
  // ───────────── Meetings ─────────────
  createMeeting: (input) => {
    const state = get();
    const user = getUser(state);
    if (!user) return fail(ERR.auth);
    if (input.committeeId === null ? !canCreateGeneralMeeting(user) : !meetingCommitteeIds(user, state.committees).includes(input.committeeId)) {
      return fail(input.committeeId === null ? 'إنشاء الاجتماعات العامة متاح للقيادة وأعضاء الهيئة' : 'يمكنك إنشاء اجتماعات للجان ضمن نطاقك فقط');
    }
    if (!input.title.trim() || !input.date || (input.mode === 'in_person' && !input.location.trim())) return fail(ERR.required);
    // The organizer always takes part in their own meeting.
    const attendeeIds = Array.from(new Set([user.id, ...input.attendeeIds]));
    const rsvps: Record<string, RSVPStatus> = {};
    attendeeIds.forEach((id) => (rsvps[id] = id === user.id ? 'going' : 'pending'));
    const id = uid('mt');
    const meeting: Meeting = {
      id,
      title: input.title.trim(),
      committeeId: input.committeeId,
      date: input.date,
      durationMin: input.durationMin,
      location: input.mode === 'online' ? input.location.trim() || 'اجتماع مرئي داخل التطبيق' : input.location.trim(),
      mode: input.mode,
      description: input.description?.trim() || undefined,
      agenda: input.agenda.map((a) => a.trim()).filter(Boolean),
      attendeeIds,
      rsvps,
      createdBy: user.id,
      status: 'scheduled',
      conference: input.mode === 'online' ? { provider: videoProvider.id, roomId: videoProvider.roomIdFor(id) } : undefined,
      createdAt: nowISO(),
    };
    set({
      meetings: [meeting, ...state.meetings],
      notifications: [
        ...buildNotifications(attendeeIds, user.id, {
          type: 'meeting_new',
          title: 'اجتماع جديد',
          body: `تمت دعوتك إلى "${meeting.title}" — ${formatDateTime(meeting.date)}`,
          link: `/meetings/${meeting.id}`,
        }),
        ...state.notifications,
      ],
    });
    return ok(meeting);
  },

  editMeeting: (id, patch) => {
    const state = get();
    const user = getUser(state);
    const meeting = state.meetings.find((m) => m.id === id);
    if (!user) return fail(ERR.auth);
    if (!meeting) return fail(ERR.notFound);
    if (!canManageMeeting(user, meeting)) return fail(ERR.forbidden);
    const mode = patch.mode ?? meeting.mode;
    const attendeeIds = Array.from(new Set([meeting.createdBy, ...(patch.attendeeIds ?? meeting.attendeeIds)]));
    const rsvps: Record<string, RSVPStatus> = {};
    attendeeIds.forEach((a) => (rsvps[a] = meeting.rsvps[a] ?? 'pending'));
    set({
      meetings: replaceById(state.meetings, id, (m) => ({
        ...m,
        ...patch,
        agenda: (patch.agenda ?? m.agenda).map((a) => a.trim()).filter(Boolean),
        description: patch.description !== undefined ? patch.description.trim() || undefined : m.description,
        attendeeIds,
        rsvps,
        conference: mode === 'online' ? m.conference ?? { provider: videoProvider.id, roomId: videoProvider.roomIdFor(m.id) } : undefined,
      })),
      notifications: [
        ...buildNotifications(attendeeIds, user.id, {
          type: 'meeting_new',
          title: 'تحديث بيانات اجتماع',
          body: `تم تحديث بيانات "${patch.title ?? meeting.title}".`,
          link: `/meetings/${id}`,
        }),
        ...state.notifications,
      ],
    });
    return okVoid();
  },

  updateMeetingRSVP: (id, status, memberId) => {
    const state = get();
    const user = getUser(state);
    const meeting = state.meetings.find((m) => m.id === id);
    if (!user) return fail(ERR.auth);
    if (!meeting) return fail(ERR.notFound);
    const target = memberId ?? user.id;
    if (target !== user.id && !canManageMeeting(user, meeting)) return fail(ERR.forbidden);
    if (meeting.status !== 'scheduled') return fail('لا يمكن تعديل الحضور لاجتماع منعقد أو ملغي');
    set({
      meetings: replaceById(state.meetings, id, (m) => ({
        ...m,
        attendeeIds: m.attendeeIds.includes(target) ? m.attendeeIds : [...m.attendeeIds, target],
        rsvps: { ...m.rsvps, [target]: status },
      })),
    });
    return okVoid();
  },

  addMeetingMinutes: (id, minutes) => {
    const state = get();
    const user = getUser(state);
    const meeting = state.meetings.find((m) => m.id === id);
    if (!user) return fail(ERR.auth);
    if (!meeting) return fail(ERR.notFound);
    if (!canManageMeeting(user, meeting)) return fail(ERR.forbidden);
    if (!minutes.trim()) return fail('يرجى كتابة محضر الاجتماع');
    set({
      meetings: replaceById(state.meetings, id, (m) => ({
        ...m,
        minutes: minutes.trim(),
        status: 'completed',
        conference: m.conference && m.status === 'live' ? { ...m.conference, endedAt: nowISO() } : m.conference,
      })),
      notifications: [
        ...buildNotifications(meeting.attendeeIds, user.id, {
          type: 'meeting_new',
          title: 'محضر اجتماع جديد',
          body: `تم نشر محضر "${meeting.title}".`,
          link: `/meetings/${id}`,
        }),
        ...state.notifications,
      ],
    });
    return okVoid();
  },

  cancelMeeting: (id) => {
    const state = get();
    const user = getUser(state);
    const meeting = state.meetings.find((m) => m.id === id);
    if (!user) return fail(ERR.auth);
    if (!meeting) return fail(ERR.notFound);
    if (!canManageMeeting(user, meeting)) return fail(ERR.forbidden);
    if (meeting.status !== 'scheduled') return fail('يمكن إلغاء الاجتماعات المجدولة فقط');
    set({
      meetings: replaceById(state.meetings, id, (m) => ({ ...m, status: 'cancelled' })),
      notifications: [
        ...buildNotifications(meeting.attendeeIds, user.id, {
          type: 'meeting_new',
          title: 'إلغاء اجتماع',
          body: `تم إلغاء "${meeting.title}".`,
          link: `/meetings/${id}`,
        }),
        ...state.notifications,
      ],
    });
    return okVoid();
  },

  // ───────────── Video conference (simulated — see features/video) ─────────────
  startConference: (id) => {
    const state = get();
    const user = getUser(state);
    const meeting = state.meetings.find((m) => m.id === id);
    if (!user) return fail(ERR.auth);
    if (!meeting) return fail(ERR.notFound);
    if (!canStartConference(user, meeting)) return fail('يمكن لمنظم الاجتماع فقط بدء الاجتماع المرئي المجدول');
    const started: Meeting = {
      ...meeting,
      status: 'live',
      conference: { ...(meeting.conference ?? { provider: videoProvider.id, roomId: videoProvider.roomIdFor(meeting.id) }), startedAt: nowISO(), startedBy: user.id, endedAt: undefined },
    };
    set({
      meetings: replaceById(state.meetings, id, () => started),
      notifications: [
        ...buildNotifications(meeting.attendeeIds, user.id, {
          type: 'meeting_started',
          title: 'بدأ الاجتماع الآن',
          body: `بدأ "${meeting.title}" — يمكنك الانضمام الآن.`,
          link: `/meetings/${id}`,
        }),
        ...state.notifications,
      ],
    });
    return ok(started);
  },

  endConference: (id) => {
    const state = get();
    const user = getUser(state);
    const meeting = state.meetings.find((m) => m.id === id);
    if (!user) return fail(ERR.auth);
    if (!meeting) return fail(ERR.notFound);
    if (!canManageMeeting(user, meeting)) return fail(ERR.forbidden);
    if (meeting.status !== 'live') return fail('الاجتماع ليس جارياً الآن');
    set({
      meetings: replaceById(state.meetings, id, (m) => ({
        ...m,
        status: 'completed',
        conference: m.conference ? { ...m.conference, endedAt: nowISO() } : m.conference,
      })),
    });
    return okVoid();
  },

  // ───────────── Activities ─────────────
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
