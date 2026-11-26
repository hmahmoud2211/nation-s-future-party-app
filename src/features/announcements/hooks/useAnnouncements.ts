/** React state over the announcements store slice. */
import { useShallow } from 'zustand/react/shallow';
import { useAppStore } from '@/context/appStore';

/** All announcements records (raw store array — derive with useMemo). */
export const useAnnouncements = () => useAppStore((s) => s.announcements);

/** One record by id (undefined when missing). */
export const useAnnouncement = (id?: string | null) => useAppStore((s) => (id ? s.announcements.find((item) => item.id === id) : undefined));

/** The announcements store actions (stable references). */
export function useAnnouncementActions() {
  return useAppStore(
    useShallow((s) => ({
      createAnnouncement: s.createAnnouncement,
      markAnnouncementRead: s.markAnnouncementRead,
    })),
  );
}
