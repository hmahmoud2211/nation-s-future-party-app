import type { Member } from '@/features/members/types';
import type { Result } from '@/types/common.types';

export type DemoAccountGroup = 'leadership' | 'assistants' | 'bureau' | 'officials' | 'demo';

export interface DemoAccount {
  memberId: string;
  /** Arabic label shown in the account switcher. */
  label: string;
  /** Section the account is listed under in the login screen and switcher. */
  group: DemoAccountGroup;
  phone: string;
  password: string;
}

// ───────────── Store slice ─────────────

export interface AuthSlice {
  currentUserId: string | null;
  loginDemoUser: (phone: string, password: string) => Result<Member>;
  logoutDemoUser: () => void;
  switchDemoUser: (memberId: string) => Result<Member>;
}
