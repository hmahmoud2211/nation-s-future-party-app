/** Home dashboard data — composed from several domains, scoped to the user's permissions. */
import { useMemo } from 'react';
import { useAppStore } from '@/context/appStore';
import { useUser } from '@/features/auth/hooks/useSession';
import type { Announcement } from '@/features/announcements/types';
import { canSeeAnnouncement, canViewGovernorate, canViewMeeting, canViewProposal } from '@/features/auth/services/permissions';
import { meetingHighlights } from '@/features/meetings/services/meetingRules';
import { implementedPerMonth, initiativeBreakdown } from '@/features/proposals/services/initiatives';

/** Everything the Home page needs, scoped to what the current user may see. */
export function useHomeData() {
  const user = useUser();
  const proposals = useAppStore((s) => s.proposals);
  const meetings = useAppStore((s) => s.meetings);
  const governorates = useAppStore((s) => s.governorates);
  const contacts = useAppStore((s) => s.governorateContacts);
  const announcements = useAppStore((s) => s.announcements);

  return useMemo(() => {
    const visibleProposals = proposals.filter((p) => canViewProposal(user, p));
    const visibleMeetings = meetings.filter((m) => canViewMeeting(user, m));
    const visibleGovernorates = governorates.filter((g) => canViewGovernorate(user, g.id));
    const news: Announcement[] = announcements
      .filter((a) => canSeeAnnouncement(user, a.committeeId))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 3);
    // Open on the user's own governorate (assistant secretaries), otherwise the most active one
    // (initiatives in execution / implemented weigh more than ones still under study).
    const activity = new Map<string, number>();
    for (const p of visibleProposals) {
      if (!p.governorateId) continue;
      const weight = p.status === 'in_progress' || p.status === 'completed' ? 10 : 1;
      activity.set(p.governorateId, (activity.get(p.governorateId) ?? 0) + weight);
    }
    const mostActive = [...visibleGovernorates].sort((a, b) => (activity.get(b.id) ?? 0) - (activity.get(a.id) ?? 0))[0];
    const defaultGovernorateId = visibleGovernorates.find((g) => user.governorateIds.includes(g.id))?.id ?? mostActive?.id;
    return {
      meetings: meetingHighlights(visibleMeetings),
      initiatives: initiativeBreakdown(visibleProposals),
      implemented: implementedPerMonth(visibleProposals),
      visibleProposals,
      governorates: visibleGovernorates,
      defaultGovernorateId,
      contacts,
      news,
    };
  }, [user, proposals, meetings, governorates, contacts, announcements]);
}
