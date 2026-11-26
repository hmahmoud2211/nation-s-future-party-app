/** React state over the feedback store slice. */
import { useShallow } from 'zustand/react/shallow';
import { useAppStore } from '@/context/appStore';

/** All feedback records (raw store array — derive with useMemo). */
export const useFeedbackList = () => useAppStore((s) => s.feedback);

/** One record by id (undefined when missing). */
export const useFeedbackItem = (id?: string | null) => useAppStore((s) => (id ? s.feedback.find((item) => item.id === id) : undefined));

/** The feedback store actions (stable references). */
export function useFeedbackActions() {
  return useAppStore(
    useShallow((s) => ({
      createFeedback: s.createFeedback,
      replyToFeedback: s.replyToFeedback,
      updateFeedbackStatus: s.updateFeedbackStatus,
      closeFeedback: s.closeFeedback,
      reopenFeedback: s.reopenFeedback,
    })),
  );
}
