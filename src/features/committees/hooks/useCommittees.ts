import { useShallow } from 'zustand/react/shallow';
import { useMemo } from 'react';
import type { Committee } from '@/features/committees/types';
import { scopeCommitteeIds } from '@/features/auth/services/permissions';
import { useAppStore } from '@/context/appStore';
import { useUser } from '@/features/auth/hooks/useSession';
import { CommitteeStats, computeStats } from '@/features/committees/services/stats';

export function useCommittee(id?: string | null): Committee | undefined {
  return useAppStore((s) => (id ? s.committees.find((c) => c.id === id) : undefined));
}

export function useCommitteeMap(): Record<string, Committee> {
  const committees = useAppStore((s) => s.committees);
  return useMemo(() => Object.fromEntries(committees.map((c) => [c.id, c])), [committees]);
}

/** Committees the current user oversees (responsible / supervised / all). */
export function useScopeCommitteeIds(): string[] {
  const user = useUser();
  const committees = useAppStore((s) => s.committees);
  return useMemo(() => scopeCommitteeIds(user, committees), [user, committees]);
}

/** Reactive stats hook. */
export function useStats(committeeIds: string[]): CommitteeStats {
  const members = useAppStore((s) => s.members);
  const projects = useAppStore((s) => s.projects);
  const proposals = useAppStore((s) => s.proposals);
  const feedback = useAppStore((s) => s.feedback);
  const meetings = useAppStore((s) => s.meetings);
  const activities = useAppStore((s) => s.activities);
  const key = committeeIds.join('|');
  return useMemo(
    () => computeStats({ members, projects, proposals, feedback, meetings, activities }, committeeIds),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [members, projects, proposals, feedback, meetings, activities, key],
  );
}

/** All committees records (raw store array — derive with useMemo). */
export const useCommittees = () => useAppStore((s) => s.committees);

/** The committees store actions (stable references). */
export function useCommitteeActions() {
  return useAppStore(
    useShallow((s) => ({
      createCommittee: s.createCommittee,
      updateCommittee: s.updateCommittee,
      toggleCommittee: s.toggleCommittee,
      setCommitteeOfficials: s.setCommitteeOfficials,
    })),
  );
}
