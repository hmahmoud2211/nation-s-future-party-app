/** Pure meeting rules (no React). */
import type { Meeting } from '@/features/meetings/types';

export function isUpcomingMeeting(m: Meeting, now = Date.now()) {
  return m.status === 'live' || (m.status === 'scheduled' && new Date(m.date).getTime() >= now - 2 * 3600000);
}

/** Most recent past meeting and the next upcoming (a live meeting counts as next). */
export function meetingHighlights(meetings: Meeting[], now = Date.now()): { previous?: Meeting; next?: Meeting } {
  let previous: Meeting | undefined;
  let next: Meeting | undefined;
  for (const m of meetings) {
    if (m.status === 'cancelled') continue;
    const t = new Date(m.date).getTime();
    if (isUpcomingMeeting(m, now)) {
      const better = !next || (m.status === 'live' && next.status !== 'live') || (m.status === next.status && t < new Date(next.date).getTime());
      if (better) next = m;
    } else if (t < now && (!previous || t > new Date(previous.date).getTime())) {
      previous = m;
    }
  }
  return { previous, next };
}
