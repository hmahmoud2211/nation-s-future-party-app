import type { AdminRequest, RequestsSlice } from '@/features/requests/types';
import { canHandleRequest } from '@/features/auth/services/permissions';
import { nowISO, uid } from '@/utils/id';
import { hasRole } from '@/features/auth/services/roles';
import { getUser } from '@/features/auth/services/session';
import { officialIdsFor } from '@/features/members/services/memberLookup';
import { replaceById } from '@/utils/collections';
import { ERR, fail, ok, okVoid } from '@/utils/result';
import type { SliceCreator } from '@/types/store.types';
import { buildNotifications } from '@/features/notifications/services/buildNotifications';

const REQUEST_STATUS_LABEL: Record<AdminRequest['status'], string> = {
  new: 'جديد',
  under_review: 'قيد المراجعة',
  info_requested: 'مطلوب معلومات إضافية',
  resolved: 'تم الحل',
  closed: 'مغلق',
};

export const createRequestsSlice: SliceCreator<RequestsSlice> = (set, get) => ({
  createRequest: (input) => {
    const state = get();
    const user = getUser(state);
    if (!user) return fail(ERR.auth);
    if (!input.subject.trim() || !input.description.trim()) return fail('يرجى كتابة عنوان ووصف الطلب');
    const committeeId = input.committeeId ?? user.committeeIds[0] ?? user.managedCommitteeIds[0] ?? state.committees[0].id;
    const now = nowISO();
    const seq = state.seqCounter + 1;
    const request: AdminRequest = {
      id: uid('rq'),
      seq,
      type: input.type,
      subject: input.subject.trim(),
      description: input.description.trim(),
      authorId: user.id,
      committeeId,
      status: 'new',
      createdAt: now,
      updatedAt: now,
      attachments: input.attachments ?? [],
      replies: [],
    };
    const admins = state.members.filter((m) => hasRole(m, 'admin')).map((m) => m.id);
    set({
      requests: [request, ...state.requests],
      seqCounter: seq,
      notifications: [
        ...buildNotifications([...officialIdsFor(state, committeeId), ...admins], user.id, {
          type: 'request_update',
          title: 'طلب إداري جديد',
          body: `${user.name}: ${request.subject}`,
          link: `/requests/${request.id}`,
        }),
        ...state.notifications,
      ],
    });
    return ok(request);
  },

  replyToRequest: (id, message, kind = 'message') => {
    const state = get();
    const user = getUser(state);
    const request = state.requests.find((r) => r.id === id);
    if (!user) return fail(ERR.auth);
    if (!request) return fail(ERR.notFound);
    const isAuthor = request.authorId === user.id;
    if (!isAuthor && !canHandleRequest(user, request)) return fail(ERR.forbidden);
    if (!message.trim()) return fail('يرجى كتابة الرد');
    if (request.status === 'closed') return fail('الطلب مغلق');
    const now = nowISO();
    const status: AdminRequest['status'] = isAuthor ? 'under_review' : kind === 'info_request' ? 'info_requested' : request.status === 'new' ? 'under_review' : request.status;
    set({
      requests: replaceById(state.requests, id, (r) => ({
        ...r,
        status,
        updatedAt: now,
        replies: [...r.replies, { id: uid('rr'), authorId: user.id, message: message.trim(), createdAt: now, kind, attachments: [] }],
      })),
      notifications: [
        ...buildNotifications(isAuthor ? officialIdsFor(state, request.committeeId) : [request.authorId], user.id, {
          type: 'request_update',
          title: isAuthor ? 'رد جديد على طلب إداري' : kind === 'info_request' ? 'مطلوب معلومات إضافية لطلبك' : 'تم الرد على طلبك',
          body: `${user.name}: ${message.trim().slice(0, 90)}`,
          link: `/requests/${request.id}`,
        }),
        ...state.notifications,
      ],
    });
    return okVoid();
  },

  updateRequestStatus: (id, status) => {
    const state = get();
    const user = getUser(state);
    const request = state.requests.find((r) => r.id === id);
    if (!user) return fail(ERR.auth);
    if (!request) return fail(ERR.notFound);
    if (!canHandleRequest(user, request)) return fail(ERR.forbidden);
    set({
      requests: replaceById(state.requests, id, (r) => ({
        ...r,
        status,
        updatedAt: nowISO(),
        replies: [
          ...r.replies,
          { id: uid('rr'), authorId: user.id, message: `تم تغيير حالة الطلب إلى: ${REQUEST_STATUS_LABEL[status]}`, createdAt: nowISO(), kind: 'system', attachments: [] },
        ],
      })),
      notifications: [
        ...buildNotifications([request.authorId], user.id, {
          type: 'request_update',
          title: 'تحديث حالة طلبك',
          body: `أصبحت حالة "${request.subject}": ${REQUEST_STATUS_LABEL[status]}`,
          link: `/requests/${request.id}`,
        }),
        ...state.notifications,
      ],
    });
    return okVoid();
  },

  // ───────────── Committee reports ─────────────,
});
