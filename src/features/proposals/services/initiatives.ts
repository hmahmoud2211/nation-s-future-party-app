import type { Proposal } from '@/features/proposals/types';
import { AR_MONTHS } from '@/utils/format';

/** Pure proposal / initiative rules (no React). */

/** Proposals still waiting for a decision. */
export const PENDING_PROPOSAL_STATUSES: Proposal['status'][] = ['new', 'under_review'];

// ───────────── Finance ─────────────

/**
 * Home dashboard data. «المبادرات» (initiatives) are the proposals the user can see:
 * - قيد الدراسة (under study) = new + under_review
 * - جاري التنفيذ (in progress) = in_progress
 * - تم التنفيذ (implemented) = completed
 * Everything is derived live from the store — nothing is hardcoded.
 */
export interface InitiativeBreakdown {
  total: number;
  underStudy: number;
  inProgress: number;
  completed: number;
}
export function initiativeBreakdown(proposals: Proposal[]): InitiativeBreakdown {
  let underStudy = 0;
  let inProgress = 0;
  let completed = 0;
  for (const p of proposals) {
    if (p.status === 'new' || p.status === 'under_review') underStudy++;
    else if (p.status === 'in_progress') inProgress++;
    else if (p.status === 'completed') completed++;
  }
  return { total: proposals.length, underStudy, inProgress, completed };
}
/** Share of a governorate's initiatives already in execution or implemented (0–100). */
export function implementationRate(b: InitiativeBreakdown): number {
  return b.total > 0 ? Math.round(((b.inProgress + b.completed) / b.total) * 100) : 0;
}

/** When a proposal reached «completed» (timeline event, falling back to its last update). */
function completedAt(p: Proposal): string {
  return p.history.find((e) => e.type === 'completed')?.createdAt ?? p.updatedAt;
}
export interface MonthlyPoint {
  key: string;
  label: string;
  value: number;
}
/** Implemented initiatives per calendar month for the last `months` months (oldest first). */
export function implementedPerMonth(proposals: Proposal[], months = 6, now = new Date()): MonthlyPoint[] {
  const buckets: MonthlyPoint[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    buckets.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: AR_MONTHS[d.getMonth()], value: 0 });
  }
  const index = new Map(buckets.map((b, i) => [b.key, i]));
  for (const p of proposals) {
    if (p.status !== 'completed') continue;
    const d = new Date(completedAt(p));
    const i = index.get(`${d.getFullYear()}-${d.getMonth()}`);
    if (i !== undefined) buckets[i].value++;
  }
  return buckets;
}
