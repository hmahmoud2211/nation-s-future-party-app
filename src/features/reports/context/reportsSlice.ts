import type { CommitteeReport, ReportsSlice } from '@/features/reports/types';
import { canReviewReport, isAdmin } from '@/features/auth/services/permissions';
import { nowISO, uid } from '@/utils/id';
import { hasRole } from '@/features/auth/services/roles';
import { getUser } from '@/features/auth/services/session';
import { replaceById } from '@/utils/collections';
import { ERR, fail, ok, okVoid } from '@/utils/result';
import type { SliceCreator } from '@/types/store.types';
import { buildNotifications } from '@/features/notifications/services/buildNotifications';

export const createReportsSlice: SliceCreator<ReportsSlice> = (set, get) => ({
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

  // ───────────── Settings / reset ─────────────,
});
