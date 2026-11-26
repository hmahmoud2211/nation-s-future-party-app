import type { Project } from '@/features/projects/types';

/** Project finance math (no React). */

export interface Finance {
  budget: number;
  spent: number;
  remaining: number;
  /** Share of the budget already spent (0–100+). */
  percent: number;
}

export function projectFinance(p: Pick<Project, 'budget' | 'expenses'>): Finance {
  const spent = p.expenses.reduce((acc, e) => acc + e.amount, 0);
  return { budget: p.budget, spent, remaining: p.budget - spent, percent: p.budget > 0 ? (spent / p.budget) * 100 : 0 };
}

export function sumFinance(projects: Pick<Project, 'budget' | 'expenses'>[]): Finance {
  const budget = projects.reduce((acc, p) => acc + p.budget, 0);
  const spent = projects.reduce((acc, p) => acc + projectFinance(p).spent, 0);
  return { budget, spent, remaining: budget - spent, percent: budget > 0 ? (spent / budget) * 100 : 0 };
}

// ───────────── Committee statistics ─────────────
