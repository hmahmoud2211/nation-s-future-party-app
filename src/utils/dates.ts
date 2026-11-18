/**
 * Date helpers used by mock data so that sample records are always relative to "today"
 * (meetings stay upcoming, some tasks are overdue, etc.).
 */
const DAY = 86400000;

/** ISO string N days from now at an optional hour/minute. */
export function daysFromNow(days: number, hour = 10, minute = 0): string {
  const d = new Date(Date.now() + days * DAY);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

export const daysAgo = (days: number, hour = 10, minute = 0) => daysFromNow(-days, hour, minute);

export function hoursAgo(hours: number): string {
  return new Date(Date.now() - hours * 3600000).toISOString();
}

/** True once the whole due day has passed (local time). */
export function isPastDay(iso: string): boolean {
  const d = new Date(iso);
  d.setHours(23, 59, 59, 999);
  return d.getTime() < Date.now();
}

export function isPast(iso: string): boolean {
  return new Date(iso).getTime() < Date.now();
}

export function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}
