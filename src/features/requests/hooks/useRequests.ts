/** React state over the requests store slice. */
import { useShallow } from 'zustand/react/shallow';
import { useAppStore } from '@/context/appStore';

/** All requests records (raw store array — derive with useMemo). */
export const useRequests = () => useAppStore((s) => s.requests);

/** One record by id (undefined when missing). */
export const useRequest = (id?: string | null) => useAppStore((s) => (id ? s.requests.find((item) => item.id === id) : undefined));

/** The requests store actions (stable references). */
export function useRequestActions() {
  return useAppStore(
    useShallow((s) => ({
      createRequest: s.createRequest,
      replyToRequest: s.replyToRequest,
      updateRequestStatus: s.updateRequestStatus,
    })),
  );
}
