/** React state over the reports store slice. */
import { useShallow } from 'zustand/react/shallow';
import { useAppStore } from '@/context/appStore';

/** All reports records (raw store array — derive with useMemo). */
export const useReports = () => useAppStore((s) => s.reports);

/** One record by id (undefined when missing). */
export const useReport = (id?: string | null) => useAppStore((s) => (id ? s.reports.find((item) => item.id === id) : undefined));

/** The reports store actions (stable references). */
export function useReportActions() {
  return useAppStore(
    useShallow((s) => ({
      createReport: s.createReport,
      reviewReport: s.reviewReport,
    })),
  );
}
