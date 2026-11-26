import type { ISODate, Result } from '@/types/common.types';

export type ReportStatus = 'submitted' | 'reviewed';

export interface CommitteeReport {
  id: string;
  seq: number;
  committeeId: string;
  title: string;
  period: string;
  summary: string;
  achievements: string;
  challenges: string;
  createdBy: string;
  createdAt: ISODate;
  status: ReportStatus;
  reviewNote?: string;
  reviewedBy?: string;
}

export interface ReportInput {
  committeeId: string;
  title: string;
  period: string;
  summary: string;
  achievements: string;
  challenges: string;
}

// ───────────── Store slice ─────────────

export interface ReportsSlice {
  createReport: (input: ReportInput) => Result<CommitteeReport>;
  reviewReport: (id: string, note: string) => Result;
}
