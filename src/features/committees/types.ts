import type { ISODate, Result } from '@/types/common.types';

export type CommitteeIconKey =
  | 'investment'
  | 'industry'
  | 'realestate'
  | 'entrepreneurship'
  | 'trade'
  | 'tourism'
  | 'technology'
  | 'energy'
  | 'social'
  | 'studies'
  | 'markets';

export interface Committee {
  id: string;
  name: string;
  shortName: string;
  description: string;
  icon: CommitteeIconKey;
  color: string;
  /*
   * Responsible officials and supervisors are derived from members (`managedCommitteeIds` /
   * `supervisedCommitteeIds`), so a committee can have several of each.
   */
  enabled: boolean;
  createdAt: ISODate;
}

export interface CommitteeInput {
  name: string;
  shortName: string;
  description: string;
  icon: CommitteeIconKey;
  color: string;
}

// ───────────── Store slice ─────────────

export interface CommitteesSlice {
  createCommittee: (input: CommitteeInput) => Result<Committee>;
  updateCommittee: (id: string, patch: Partial<CommitteeInput>) => Result;
  toggleCommittee: (id: string) => Result<boolean>;
  /** Replace the people responsible for a committee (a committee can have several). */
  setCommitteeOfficials: (committeeId: string, memberIds: string[]) => Result;
}
