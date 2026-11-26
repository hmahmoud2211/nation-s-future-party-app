import type { Result } from '@/types/common.types';

export interface Governorate {
  id: string;
  name: string;
  /** Broad region, used only for grouping in the UI. */
  region: string;
}

/** A governorate-level secretary or committee representative (a contact record, not an app user). */
export interface GovernorateContact {
  id: string;
  governorateId: string;
  name: string;
  /** e.g. "أمين أمانة المحافظة" / "ممثل لجنة الاستثمار" */
  title: string;
  /** What they are responsible for. */
  responsibilities: string;
  /** Optional committee they represent in the governorate. */
  committeeId?: string;
  /** Placeholder contact info. */
  phone: string;
}

// ───────────── Store slice ─────────────

export interface GovernoratesSlice {
  /** Assign a governorate to an assistant secretary (or unassign with `undefined`). */
  assignGovernorate: (governorateId: string, memberId: string | undefined) => Result;
}
