import { PROPOSAL_STATUS } from '@/features/proposals/services/labels';
import type { Proposal, ProposalsSlice } from '@/features/proposals/types';
import type { TimelineEvent } from '@/types/common.types';
import { canSubmitProposal, proposalTransitions } from '@/features/auth/services/permissions';
import { nowISO, uid } from '@/utils/id';
import { hasAnyRole } from '@/features/auth/services/roles';
import { getUser } from '@/features/auth/services/session';
import { replaceById } from '@/utils/collections';
import { ERR, fail, ok, okVoid } from '@/utils/result';
import { event } from '@/utils/timeline';
import type { SliceCreator } from '@/types/store.types';
import { officialIdsFor } from '@/features/members/services/memberLookup';
import { buildNotifications } from '@/features/notifications/services/buildNotifications';

const EVENT_TYPE: Record<Proposal['status'], TimelineEvent['type']> = {
  new: 'reopened',
  under_review: 'under_review',
  approved: 'approved',
  rejected: 'rejected',
  in_progress: 'started',
  completed: 'completed',
};

export const createProposalsSlice: SliceCreator<ProposalsSlice> = (set, get) => ({
  createProposal: (input) => {
    const state = get();
    const user = getUser(state);
    if (!user) return fail(ERR.auth);
    if (!canSubmitProposal(user, input.committeeId)) return fail('يمكنك تقديم مقترحات للجان التي أنت مسؤول عنها فقط');
    if (!input.title.trim() || !input.description.trim()) return fail('يرجى كتابة عنوان المقترح ووصفه');
    const now = nowISO();
    const seq = state.seqCounter + 1;
    const proposal: Proposal = {
      id: uid('pr'),
      seq,
      title: input.title.trim(),
      description: input.description.trim(),
      objective: input.objective.trim(),
      committeeId: input.committeeId,
      governorateId: input.governorateId,
      createdBy: user.id,
      createdAt: now,
      updatedAt: now,
      status: 'new',
      attachments: input.attachments ?? [],
      history: [event('submitted', 'تم تقديم المقترح', user.id)],
    };
    // Reviewers (الأمين) are notified, plus assistant secretaries coordinating the target governorate.
    const reviewers = state.members.filter((m) => m.status === 'active' && hasAnyRole(m, ['sector_secretary'])).map((m) => m.id);
    const coordinators = input.governorateId ? state.members.filter((m) => m.governorateIds.includes(input.governorateId as string)).map((m) => m.id) : [];
    set({
      proposals: [proposal, ...state.proposals],
      seqCounter: seq,
      notifications: [
        ...buildNotifications([...reviewers, ...coordinators, ...officialIdsFor(state, input.committeeId)], user.id, {
          type: 'proposal_new',
          title: 'مقترح جديد',
          body: `قدّم ${user.name} مقترح "${proposal.title}".`,
          link: `/proposals/${proposal.id}`,
        }),
        ...state.notifications,
      ],
    });
    return ok(proposal);
  },

  setProposalStatus: (id, status, note) => {
    const state = get();
    const user = getUser(state);
    const proposal = state.proposals.find((p) => p.id === id);
    if (!user) return fail(ERR.auth);
    if (!proposal) return fail(ERR.notFound);
    if (!proposalTransitions(user, proposal).includes(status)) return fail('لا يمكنك تغيير حالة هذا المقترح');
    if (status === 'rejected' && !note?.trim()) return fail('يرجى كتابة سبب الرفض');
    const label = `تم تغيير الحالة إلى «${PROPOSAL_STATUS[status].label}»`;
    set({
      proposals: replaceById(state.proposals, id, (p) => ({
        ...p,
        status,
        updatedAt: nowISO(),
        reviewNote: note?.trim() || p.reviewNote,
        history: [...p.history, event(EVENT_TYPE[status], label, user.id, note?.trim() || undefined)],
      })),
      notifications: [
        ...buildNotifications([proposal.createdBy, ...officialIdsFor(state, proposal.committeeId)], user.id, {
          type: 'proposal_update',
          title: 'تحديث حالة مقترح',
          body: `«${proposal.title}»: ${PROPOSAL_STATUS[status].label}`,
          link: `/proposals/${id}`,
        }),
        ...state.notifications,
      ],
    });
    return okVoid();
  },
});
