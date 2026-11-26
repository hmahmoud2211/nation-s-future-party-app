/** React state over the activities store slice. */
import { useShallow } from 'zustand/react/shallow';
import { useAppStore } from '@/context/appStore';

/** All activities records (raw store array — derive with useMemo). */
export const useActivities = () => useAppStore((s) => s.activities);

/** One record by id (undefined when missing). */
export const useActivity = (id?: string | null) => useAppStore((s) => (id ? s.activities.find((item) => item.id === id) : undefined));

/** The activities store actions (stable references). */
export function useActivityActions() {
  return useAppStore(
    useShallow((s) => ({
      createActivity: s.createActivity,
      updateActivity: s.updateActivity,
      toggleActivityRegistration: s.toggleActivityRegistration,
      publishActivityReport: s.publishActivityReport,
    })),
  );
}

/** Number of a committee's activities that are not completed yet. */
export const useOpenActivityCount = (committeeId: string) =>
  useAppStore((s) => s.activities.filter((a) => a.committeeId === committeeId && a.status !== 'completed').length);
