import type { AppState } from '@/types/store.types';

export function committeeNameOf(state: AppState, id?: string): string {
  return state.committees.find((c) => c.id === id)?.name ?? 'اللجنة';
}
