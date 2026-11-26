import { createInitialData } from '@/data';
import type { SliceCreator } from '@/types/store.types';
import { type SettingsSlice } from '@/features/settings/types';

export const createSettingsSlice: SliceCreator<SettingsSlice> = (set, get) => ({
  updateSettings: (patch) => set({ settings: { ...get().settings, ...patch } }),

  resetMockData: () => {
    const currentUserId = get().currentUserId;
    const fresh = createInitialData();
    const stillExists = fresh.members.some((m) => m.id === currentUserId);
    set({ ...fresh, currentUserId: stillExists ? currentUserId : null });
  },
});
