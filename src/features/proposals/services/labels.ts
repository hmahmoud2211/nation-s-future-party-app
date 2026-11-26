/** Display labels and badge tones for the proposals domain. */
import type { ProposalStatus } from '@/features/proposals/types';

import type { LabelTone } from '@/types/common.types';

export const PROPOSAL_STATUS: Record<ProposalStatus, LabelTone> = {
  new: { label: 'جديد', tone: 'info' },
  under_review: { label: 'قيد المراجعة', tone: 'warning' },
  approved: { label: 'تمت الموافقة', tone: 'success' },
  rejected: { label: 'مرفوض', tone: 'error' },
  in_progress: { label: 'قيد التنفيذ', tone: 'primary' },
  completed: { label: 'مكتمل', tone: 'purple' },
};

/** Button labels for moving a proposal to a status. */
export const PROPOSAL_ACTION: Record<ProposalStatus, string> = {
  new: 'إعادة فتح',
  under_review: 'بدء المراجعة',
  approved: 'الموافقة',
  rejected: 'رفض',
  in_progress: 'بدء التنفيذ',
  completed: 'تم الإنجاز',
};
