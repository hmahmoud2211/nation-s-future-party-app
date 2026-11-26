import type { Attachment, ISODate, Result, TimelineEvent } from '@/types/common.types';

export type ProposalStatus = 'new' | 'under_review' | 'approved' | 'rejected' | 'in_progress' | 'completed';

export interface Proposal {
  id: string;
  seq: number;
  title: string;
  /** Short description of the idea. */
  description: string;
  objective: string;
  committeeId: string;
  /** Optional governorate the proposal targets (lets assistant secretaries follow it). */
  governorateId?: string;
  createdBy: string;
  createdAt: ISODate;
  updatedAt: ISODate;
  status: ProposalStatus;
  /** Latest decision note from the reviewer. */
  reviewNote?: string;
  attachments: Attachment[];
  history: TimelineEvent[];
}

export interface ProposalInput {
  title: string;
  description: string;
  objective: string;
  committeeId: string;
  governorateId?: string;
  attachments?: Attachment[];
}

// ───────────── Store slice ─────────────

export interface ProposalsSlice {
  createProposal: (input: ProposalInput) => Result<Proposal>;
  /** Move a proposal to its next status (permission-checked), with an optional note. */
  setProposalStatus: (id: string, status: ProposalStatus, note?: string) => Result;
}
