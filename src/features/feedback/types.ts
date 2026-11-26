import type { Attachment, ISODate, Result, TimelineEvent } from '@/types/common.types';

export type FeedbackStatus = 'new' | 'under_review' | 'replied' | 'closed';

export type FeedbackCategory = 'proposal' | 'project' | 'administrative';

export type FeedbackTopic = 'proposal_note' | 'project_note' | 'review_request' | 'data_error' | 'other';

export interface FeedbackMessage {
  id: string;
  authorId: string;
  message: string;
  createdAt: ISODate;
  kind?: 'message' | 'info_request' | 'system';
  attachments: Attachment[];
}

export interface Feedback {
  id: string;
  seq: number;
  category: FeedbackCategory;
  topic: FeedbackTopic;
  relatedEntityId?: string;
  committeeId: string;

  authorId: string;
  recipientId?: string;

  subject: string;
  status: FeedbackStatus;

  createdAt: ISODate;
  updatedAt: ISODate;

  /** messages[0] is the original message, the rest are replies (threaded). */
  messages: FeedbackMessage[];
  activity: TimelineEvent[];
}

export interface FeedbackInput {
  category: FeedbackCategory;
  topic: FeedbackTopic;
  relatedEntityId?: string;
  committeeId: string;
  subject: string;
  message: string;
  recipientId?: string;
  attachments?: Attachment[];
}

// ───────────── Store slice ─────────────

export interface FeedbackSlice {
  createFeedback: (input: FeedbackInput) => Result<Feedback>;
  replyToFeedback: (id: string, message: string, kind?: 'message' | 'info_request', attachments?: Attachment[]) => Result;
  updateFeedbackStatus: (id: string, status: FeedbackStatus) => Result;
  closeFeedback: (id: string) => Result;
  reopenFeedback: (id: string) => Result;
}
