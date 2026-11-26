/** Display labels and badge tones for the members domain. */
import type { Tone } from '@/theme';
import type { MembershipStatus, Role } from '@/features/members/types';

import type { LabelTone } from '@/types/common.types';

export const ROLE_LABELS: Record<Role, string> = {
  member: 'عضو',
  board_member: 'عضو الهيئة',
  assistant_secretary: 'الأمين المساعد',
  sector_secretary: 'الأمين',
  admin: 'مدير النظام',
};

export const ROLE_TONES: Record<Role, Tone> = {
  member: 'neutral',
  board_member: 'info',
  assistant_secretary: 'purple',
  sector_secretary: 'primary',
  admin: 'error',
};

/** Badge for the committee-responsibility permission (مسؤول اللجنة). */
export const RESPONSIBLE_LABEL = 'مسؤول اللجنة';

export const RESPONSIBLE_TONE: Tone = 'accent';

export const MEMBERSHIP_STATUS: Record<MembershipStatus, LabelTone> = {
  active: { label: 'عضوية سارية', tone: 'success' },
  inactive: { label: 'غير نشط', tone: 'neutral' },
  suspended: { label: 'موقوفة مؤقتاً', tone: 'warning' },
};
