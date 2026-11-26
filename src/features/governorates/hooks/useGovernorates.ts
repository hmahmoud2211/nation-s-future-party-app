import { useShallow } from 'zustand/react/shallow';
import { useMemo } from 'react';
import { useAppStore } from '@/context/appStore';

export function useGovernorateMap() {
  const governorates = useAppStore((s) => s.governorates);
  return useMemo(() => Object.fromEntries(governorates.map((g) => [g.id, g])), [governorates]);
}

/** All governorates records (raw store array — derive with useMemo). */
export const useGovernorates = () => useAppStore((s) => s.governorates);

/** One record by id (undefined when missing). */
export const useGovernorate = (id?: string | null) => useAppStore((s) => (id ? s.governorates.find((item) => item.id === id) : undefined));

/** All governorateContacts records (raw store array — derive with useMemo). */
export const useGovernorateContacts = () => useAppStore((s) => s.governorateContacts);

/** The governorates store actions (stable references). */
export function useGovernorateActions() {
  return useAppStore(
    useShallow((s) => ({
      assignGovernorate: s.assignGovernorate,
    })),
  );
}

/** A governorate's name (undefined when no id / not found). */
export const useGovernorateName = (id?: string) =>
  useAppStore((s) => (id ? s.governorates.find((g) => g.id === id)?.name : undefined));
