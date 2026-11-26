/** Session helpers over the store state (no React). */
import type { Member } from '@/features/members/types';
import type { AppState } from '@/types/store.types';

export function getUser(state: AppState): Member | undefined {
  return state.members.find((m) => m.id === state.currentUserId);
}
