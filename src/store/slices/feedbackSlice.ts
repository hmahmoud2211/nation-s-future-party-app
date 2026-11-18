import type { Feedback } from '@/types';
import { canHandleFeedback } from '@/utils/permissions';
import { nowISO, uid } from '@/utils/id';
import { buildNotifications, ERR, event, fail, getUser, ok, okVoid, officialIdsFor, replaceById } from '../helpers';
import type { FeedbackSlice, SliceCreator } from '../types';

const STATUS_LABEL: Record<Feedback['status'], string> = {
  new: 'جديد',
  under_review: 'قيد المراجعة',
  replied: 'تم الرد',
  closed: 'مغلق',
};

export const createFeedbackSlice: SliceCreator<FeedbackSlice> = (set, get) => ({
  createFeedback: (input) => {
    const state = get();
    const user = getUser(state);
    if (!user) return fail(ERR.auth);
    if (!input.subject.trim() || !input.message.trim()) return fail('يرجى كتابة عنوان ونص الملاحظة');
    const recipientId = input.recipientId ?? officialIdsFor(state, input.committeeId)[0];
    const now = nowISO();
    const seq = state.seqCounter + 1;
    const fb: Feedback = {
      id: uid('fb'),
      seq,
      category: input.category,
      topic: input.topic,
      relatedEntityId: input.relatedEntityId,
      committeeId: input.committeeId,
      authorId: user.id,
      recipientId,
      subject: input.subject.trim(),
      status: 'new',
      createdAt: now,
      updatedAt: now,
      messages: [{ id: uid('fm'), authorId: user.id, message: input.message.trim(), createdAt: now, kind: 'message', attachments: input.attachments ?? [] }],
      activity: [event('created', 'تم إرسال الملاحظة', user.id)],
    };
    set({
      feedback: [fb, ...state.feedback],
      seqCounter: seq,
      notifications: [
        // Every official of the committee is notified — a committee can have several.
        ...buildNotifications([recipientId, ...officialIdsFor(state, input.committeeId)], user.id, {
          type: 'feedback_new',
          title: 'ملاحظة جديدة',
          body: `أرسل ${user.name}: "${fb.subject}"`,
          link: `/feedback/${fb.id}`,
        }),
        ...state.notifications,
      ],
    });
    return ok(fb);
  },

  replyToFeedback: (id, message, kind = 'message', attachments = []) => {
    const state = get();
    const user = getUser(state);
    const fb = state.feedback.find((f) => f.id === id);
    if (!user) return fail(ERR.auth);
    if (!fb) return fail(ERR.notFound);
    if (!message.trim()) return fail('يرجى كتابة الرد');
    const isAuthor = fb.authorId === user.id;
    if (!isAuthor && !canHandleFeedback(user, fb)) return fail(ERR.forbidden);
    if (fb.status === 'closed') return fail('الملاحظة مغلقة — يرجى إعادة فتحها أولاً');
    const now = nowISO();
    const nextStatus: Feedback['status'] = isAuthor ? 'under_review' : kind === 'info_request' ? 'under_review' : 'replied';
    const activityEvent = isAuthor
      ? event('replied', 'أضاف صاحب الملاحظة رداً', user.id)
      : kind === 'info_request'
        ? event('note', 'طُلبت معلومات إضافية', user.id)
        : event('replied', 'تم الرد', user.id);
    set({
      feedback: replaceById(state.feedback, id, (f) => ({
        ...f,
        status: nextStatus,
        updatedAt: now,
        messages: [...f.messages, { id: uid('fm'), authorId: user.id, message: message.trim(), createdAt: now, kind, attachments }],
        activity: [...f.activity, activityEvent],
      })),
      notifications: [
        ...buildNotifications(isAuthor ? [fb.recipientId, ...officialIdsFor(state, fb.committeeId)] : [fb.authorId], user.id, {
          type: isAuthor ? 'feedback_new' : 'feedback_reply',
          title: isAuthor ? 'رد جديد على ملاحظة' : kind === 'info_request' ? 'مطلوب معلومات إضافية' : 'تم الرد على استفسارك',
          body: `${user.name}: ${message.trim().slice(0, 90)}`,
          link: `/feedback/${fb.id}`,
        }),
        ...state.notifications,
      ],
    });
    return okVoid();
  },

  updateFeedbackStatus: (id, status) => {
    const state = get();
    const user = getUser(state);
    const fb = state.feedback.find((f) => f.id === id);
    if (!user) return fail(ERR.auth);
    if (!fb) return fail(ERR.notFound);
    if (!canHandleFeedback(user, fb)) return fail(ERR.forbidden);
    if (fb.status === status) return okVoid();
    const type = status === 'closed' ? 'closed' : status === 'under_review' ? 'under_review' : status === 'replied' ? 'replied' : 'reopened';
    set({
      feedback: replaceById(state.feedback, id, (f) => ({
        ...f,
        status,
        updatedAt: nowISO(),
        activity: [...f.activity, event(type, `تم تغيير الحالة إلى: ${STATUS_LABEL[status]}`, user.id)],
      })),
      notifications: [
        ...buildNotifications([fb.authorId], user.id, {
          type: 'feedback_reply',
          title: 'تحديث حالة ملاحظتك',
          body: `أصبحت حالة "${fb.subject}": ${STATUS_LABEL[status]}`,
          link: `/feedback/${fb.id}`,
        }),
        ...state.notifications,
      ],
    });
    return okVoid();
  },

  closeFeedback: (id) => get().updateFeedbackStatus(id, 'closed'),

  reopenFeedback: (id) => {
    const state = get();
    const user = getUser(state);
    const fb = state.feedback.find((f) => f.id === id);
    if (!user) return fail(ERR.auth);
    if (!fb) return fail(ERR.notFound);
    if (fb.authorId !== user.id && !canHandleFeedback(user, fb)) return fail(ERR.forbidden);
    if (fb.status !== 'closed') return fail('الملاحظة ليست مغلقة');
    set({
      feedback: replaceById(state.feedback, id, (f) => ({
        ...f,
        status: 'under_review',
        updatedAt: nowISO(),
        activity: [...f.activity, event('reopened', 'تمت إعادة فتح الملاحظة', user.id)],
      })),
      notifications: [
        ...buildNotifications(fb.authorId === user.id ? [fb.recipientId, ...officialIdsFor(state, fb.committeeId)] : [fb.authorId], user.id, {
          type: 'feedback_new',
          title: 'إعادة فتح ملاحظة',
          body: `أعاد ${user.name} فتح "${fb.subject}".`,
          link: `/feedback/${fb.id}`,
        }),
        ...state.notifications,
      ],
    });
    return okVoid();
  },
});
