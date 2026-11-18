import { createInitialData } from '@/data';
import type { AdminRequest, Announcement, CommitteeReport, Member, Role } from '@/types';
import { can, canHandleRequest, canPublishAnnouncement, canReviewReport, isAdmin } from '@/utils/permissions';
import { nowISO, uid } from '@/utils/id';
import { hasRole } from '@/utils/roles';
import { buildNotifications, ERR, fail, getUser, memberIdsOf, ok, okVoid, officialIdsFor, replaceById } from '../helpers';
import type { AdminSlice, SliceCreator } from '../types';

const REQUEST_STATUS_LABEL: Record<AdminRequest['status'], string> = {
  new: 'جديد',
  under_review: 'قيد المراجعة',
  info_requested: 'مطلوب معلومات إضافية',
  resolved: 'تم الحل',
  closed: 'مغلق',
};

const AVATAR_COLORS = ['#0B2B68', '#3D4FB0', '#2E6B5B', '#9E3D5A', '#B5782A', '#1F5A8A'];

/**
 * Keeps role and committee scopes consistent: supervision is only kept for assistant
 * secretaries, and people are always members of the committees they are responsible for.
 */
function normalizeScopes(
  role: Role,
  scopes: { committeeIds: string[]; managedCommitteeIds: string[]; supervisedCommitteeIds: string[] },
): Pick<Member, 'role' | 'committeeIds' | 'managedCommitteeIds' | 'supervisedCommitteeIds'> {
  // الأمين and the admin already cover every committee — no responsibility list needed.
  const managed = role === 'sector_secretary' || role === 'admin' ? [] : scopes.managedCommitteeIds;
  return {
    role,
    managedCommitteeIds: managed,
    supervisedCommitteeIds: role === 'assistant_secretary' ? scopes.supervisedCommitteeIds : [],
    committeeIds: Array.from(new Set([...scopes.committeeIds, ...managed])),
  };
}

export const createAdminSlice: SliceCreator<AdminSlice> = (set, get) => ({
  // ───────────── Members ─────────────
  createDemoMember: (input) => {
    const state = get();
    const user = getUser(state);
    if (!user) return fail(ERR.auth);
    if (!isAdmin(user)) return fail(ERR.forbidden);
    if (!input.name.trim()) return fail('يرجى إدخال اسم العضو');
    const n = state.members.length + 500;
    const scopes = normalizeScopes(input.role, input);
    const member: Member = {
      id: uid('u'),
      name: input.name.trim(),
      title: input.title.trim() || 'عضو لجنة',
      ...scopes,
      governorateIds: [],
      membershipNumber: `ق.أ/${new Date().getFullYear()}/${String(n).padStart(4, '0')}`,
      status: input.status,
      joinDate: nowISO(),
      phone: input.phone?.trim() || `0100000${String(n).padStart(4, '0')}`,
      email: input.email?.trim() || `member${n}@demo.example`,
      avatarColor: AVATAR_COLORS[n % AVATAR_COLORS.length],
    };
    set({ members: [...state.members, member] });
    return ok(member);
  },

  editDemoMember: (id, patch) => {
    const state = get();
    const user = getUser(state);
    if (!user) return fail(ERR.auth);
    const admin = isAdmin(user);
    if (!admin && user.id !== id) return fail(ERR.forbidden);
    const member = state.members.find((m) => m.id === id);
    if (!member) return fail(ERR.notFound);
    if (patch.name !== undefined && !patch.name.trim()) return fail('يرجى إدخال اسم العضو');
    const { role, committeeIds, managedCommitteeIds, supervisedCommitteeIds, ...profile } = patch;
    const changesAccess = role !== undefined || committeeIds !== undefined || managedCommitteeIds !== undefined || supervisedCommitteeIds !== undefined;
    if (changesAccess && !admin) return fail('تعديل الأدوار واللجان متاح لمدير النظام فقط');
    const nextRole = role ?? member.role;
    if (member.id === user.id && member.role === 'admin' && nextRole !== 'admin') {
      return fail('لا يمكنك إزالة صلاحية مدير النظام عن حسابك الحالي');
    }
    const scopes = changesAccess
      ? normalizeScopes(nextRole, {
          committeeIds: committeeIds ?? member.committeeIds,
          managedCommitteeIds: managedCommitteeIds ?? member.managedCommitteeIds,
          supervisedCommitteeIds: supervisedCommitteeIds ?? member.supervisedCommitteeIds,
        })
      : {};
    set({
      members: replaceById(state.members, id, (m) => ({
        ...m,
        ...profile,
        ...scopes,
        // Governorates belong to assistant secretaries only.
        governorateIds: nextRole === 'assistant_secretary' ? m.governorateIds : [],
      })),
    });
    return okVoid();
  },

  assignGovernorate: (governorateId, memberId) => {
    const state = get();
    const user = getUser(state);
    if (!user) return fail(ERR.auth);
    if (!can(user, 'governorates.manage')) return fail(ERR.forbidden);
    if (!state.governorates.some((g) => g.id === governorateId)) return fail(ERR.notFound);
    if (memberId) {
      const target = state.members.find((m) => m.id === memberId);
      if (!target) return fail(ERR.notFound);
      if (target.role !== 'assistant_secretary') return fail('تُسند المحافظات إلى الأمناء المساعدين فقط');
    }
    // One coordinator per governorate: remove it from everyone, then give it to the new one.
    set({
      members: state.members.map((m) => {
        const without = m.governorateIds.filter((g) => g !== governorateId);
        if (m.id === memberId) return { ...m, governorateIds: [...without, governorateId] };
        return without.length === m.governorateIds.length ? m : { ...m, governorateIds: without };
      }),
    });
    return okVoid();
  },

  // ───────────── Announcements ─────────────
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

  // ───────────── Administrative requests ─────────────
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

  // ───────────── Committee reports ─────────────
  createReport: (input) => {
    const state = get();
    const user = getUser(state);
    if (!user) return fail(ERR.auth);
    if (!(isAdmin(user) || user.managedCommitteeIds.includes(input.committeeId))) return fail('يمكنك إضافة تقارير للجانك فقط');
    if (!input.title.trim() || !input.summary.trim()) return fail('يرجى كتابة عنوان وملخص التقرير');
    const seq = state.seqCounter + 1;
    const report: CommitteeReport = {
      id: uid('rp'),
      seq,
      ...input,
      title: input.title.trim(),
      createdBy: user.id,
      createdAt: nowISO(),
      status: 'submitted',
    };
    const committee = state.committees.find((c) => c.id === input.committeeId);
    const reviewers = state.members
      .filter((m) => hasRole(m, 'sector_secretary') || (hasRole(m, 'assistant_secretary') && m.supervisedCommitteeIds.includes(input.committeeId)))
      .map((m) => m.id);
    set({
      reports: [report, ...state.reports],
      seqCounter: seq,
      notifications: [
        ...buildNotifications(reviewers, user.id, {
          type: 'announcement_new',
          title: 'تقرير لجنة جديد',
          body: `قدمت ${committee?.name ?? 'اللجنة'} تقرير "${report.title}".`,
          link: `/report/${report.id}`,
        }),
        ...state.notifications,
      ],
    });
    return ok(report);
  },

  reviewReport: (id, note) => {
    const state = get();
    const user = getUser(state);
    const report = state.reports.find((r) => r.id === id);
    if (!user) return fail(ERR.auth);
    if (!report) return fail(ERR.notFound);
    if (!canReviewReport(user, report)) return fail(ERR.forbidden);
    set({
      reports: replaceById(state.reports, id, (r) => ({ ...r, status: 'reviewed', reviewNote: note.trim() || 'تم الاطلاع.', reviewedBy: user.id })),
      notifications: [
        ...buildNotifications([report.createdBy], user.id, {
          type: 'announcement_new',
          title: 'تمت مراجعة تقرير اللجنة',
          body: `راجع ${user.name} تقرير "${report.title}".`,
          link: `/report/${report.id}`,
        }),
        ...state.notifications,
      ],
    });
    return okVoid();
  },

  // ───────────── Settings / reset ─────────────
  updateSettings: (patch) => set({ settings: { ...get().settings, ...patch } }),

  resetMockData: () => {
    const currentUserId = get().currentUserId;
    const fresh = createInitialData();
    const stillExists = fresh.members.some((m) => m.id === currentUserId);
    set({ ...fresh, currentUserId: stillExists ? currentUserId : null });
  },
});
