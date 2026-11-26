/** React state over the proposals store slice. */
import { useShallow } from 'zustand/react/shallow';
import { useAppStore } from '@/context/appStore';

/** All proposals records (raw store array — derive with useMemo). */
export const useProposals = () => useAppStore((s) => s.proposals);

/** One record by id (undefined when missing). */
export const useProposal = (id?: string | null) => useAppStore((s) => (id ? s.proposals.find((item) => item.id === id) : undefined));

/** The proposals store actions (stable references). */
export function useProposalActions() {
  return useAppStore(
    useShallow((s) => ({
      createProposal: s.createProposal,
      setProposalStatus: s.setProposalStatus,
    })),
  );
}
