/** React state over the meetings store slice. */
import { useShallow } from 'zustand/react/shallow';
import { useAppStore } from '@/context/appStore';

/** All meetings records (raw store array — derive with useMemo). */
export const useMeetings = () => useAppStore((s) => s.meetings);

/** One record by id (undefined when missing). */
export const useMeeting = (id?: string | null) => useAppStore((s) => (id ? s.meetings.find((item) => item.id === id) : undefined));

/** The meetings store actions (stable references). */
export function useMeetingActions() {
  return useAppStore(
    useShallow((s) => ({
      createMeeting: s.createMeeting,
      editMeeting: s.editMeeting,
      updateMeetingRSVP: s.updateMeetingRSVP,
      addMeetingMinutes: s.addMeetingMinutes,
      cancelMeeting: s.cancelMeeting,
      startConference: s.startConference,
      endConference: s.endConference,
    })),
  );
}
