import type { ISODate, Result } from '@/types/common.types';

/**
 * Organisational roles (one per person):
 * - sector_secretary    → الأمين (Secretary-General) — full visibility, finance, decides on proposals
 * - assistant_secretary → الأمين المساعد — like a board member + governorate coordination
 * - board_member        → عضو الهيئة (Executive Board Member)
 * - member              → plain member (sample accounts)
 * - admin               → مدير النظام (platform administration)
 *
 * "Committee responsible" (مسؤول اللجنة) is NOT a role: it is a permission attached to any
 * person through `managedCommitteeIds`.
 */
export type Role = 'member' | 'board_member' | 'assistant_secretary' | 'sector_secretary' | 'admin';

export type MembershipStatus = 'active' | 'inactive' | 'suspended';

export interface Member {
  id: string;
  name: string;
  role: Role;
  /** Arabic position title, e.g. "الأمين المساعد • مسؤول لجنة الاستثمار" */
  title: string;
  /** Committees the person belongs to. Always includes the committees they are responsible for. */
  committeeIds: string[];
  /** Committee responsibility (مسؤول اللجنة) — committees this person runs. */
  managedCommitteeIds: string[];
  /** Committees an assistant secretary supervises. */
  supervisedCommitteeIds: string[];
  /** Governorates an assistant secretary coordinates (kept separate from committee membership). */
  governorateIds: string[];
  membershipNumber: string;
  status: MembershipStatus;
  joinDate: ISODate;
  /** Placeholder contact info — never real data. */
  phone: string;
  email: string;
  avatarColor: string;
  bio?: string;
}

export interface MemberInput {
  name: string;
  role: Role;
  title: string;
  /** Committees the person belongs to as a member. */
  committeeIds: string[];
  /** Committee responsibility (مسؤول اللجنة). */
  managedCommitteeIds: string[];
  /** Committees supervised — only kept for assistant secretaries. */
  supervisedCommitteeIds: string[];
  status: MembershipStatus;
  phone?: string;
  email?: string;
}

// ───────────── Store slice ─────────────

export interface MembersSlice {
  createDemoMember: (input: MemberInput) => Result<Member>;
  /** Updates profile data; role and committee scopes can only be changed by the admin. */
  editDemoMember: (id: string, patch: Partial<MemberInput>) => Result;
}
