/** React state over the settings store slice. */
import { useShallow } from 'zustand/react/shallow';
import { useAppStore } from '@/context/appStore';

/** App settings (demo hints…). */
export const useSettings = () => useAppStore((s) => s.settings);

/** The settings store actions (stable references). */
export function useSettingsActions() {
  return useAppStore(
    useShallow((s) => ({
      updateSettings: s.updateSettings,
      resetMockData: s.resetMockData,
    })),
  );
}
