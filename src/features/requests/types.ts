import type { FeedbackMessage } from '@/features/feedback/types';
import type { Attachment, ISODate, Result } from '@/types/common.types';

export type RequestType = 'data_update' | 'admin_inquiry' | 'document' | 'tech_support';

export type RequestStatus = 'new' | 'under_review' | 'info_requested' | 'resolved' | 'closed';

export interface AdminRequest {
  id: string;
  seq: number;
  type: RequestType;
  subject: string;
  description: string;
  authorId: string;
  committeeId: string;
  status: RequestStatus;
  createdAt: ISODate;
  updatedAt: ISODate;
  attachments: Attachment[];
  replies: FeedbackMessage[];
}

export interface RequestInput {
  type: RequestType;
  subject: string;
  description: string;
  committeeId?: string;
  attachments?: Attachment[];
}

// ───────────── Store slice ─────────────

export interface RequestsSlice {
  createRequest: (input: RequestInput) => Result<AdminRequest>;
  replyToRequest: (id: string, message: string, kind?: 'message' | 'info_request') => Result;
  updateRequestStatus: (id: string, status: RequestStatus) => Result;
}
