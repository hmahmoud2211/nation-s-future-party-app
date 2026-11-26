import { useShallow } from 'zustand/react/shallow';
import type { Member } from '@/features/members/types';
import { useAppStore } from '@/context/appStore';
import { identityColors } from '@/theme';

/** Placeholder used for a split second after logout so screens never crash. */
const GUEST: Member = {
  id: 'guest',
  name: 'زائر',
  role: 'member',
  title: '',
  committeeIds: [],
  managedCommitteeIds: [],
  supervisedCommitteeIds: [],
  governorateIds: [],
  membershipNumber: '',
  status: 'active',
  joinDate: new Date(0).toISOString(),
  phone: '',
  email: '',
  avatarColor: identityColors.navy,
};

/** Current demo user (or a guest placeholder). */
export function useUser(): Member {
  return useAppStore((s) => s.members.find((m) => m.id === s.currentUserId)) ?? GUEST;
}

export function useIsLoggedIn(): boolean {
  return useAppStore((s) => !!s.currentUserId && s.members.some((m) => m.id === s.currentUserId));
}

/** The signed-in member's id (null when signed out). */
export const useCurrentUserId = () => useAppStore((s) => s.currentUserId);

/** The auth store actions (stable references). */
export function useAuthActions() {
  return useAppStore(
    useShallow((s) => ({
      loginDemoUser: s.loginDemoUser,
      logoutDemoUser: s.logoutDemoUser,
      switchDemoUser: s.switchDemoUser,
    })),
  );
}
