import type { Comment, ISODate, Result } from '@/types/common.types';

export type ProjectStatus = 'planned' | 'in_progress' | 'paused' | 'completed';

export interface Milestone {
  id: string;
  title: string;
  dueDate: ISODate;
  done: boolean;
}

export interface Expense {
  id: string;
  label: string;
  amount: number;
  date: ISODate;
}

export interface Project {
  id: string;
  seq: number;
  title: string;
  description: string;
  committeeId: string;
  governorateId?: string;
  leadId: string;
  teamIds: string[];
  startDate: ISODate;
  endDate: ISODate;
  milestones: Milestone[];
  status: ProjectStatus;
  progress: number;
  /** Allocated budget (EGP). Financial fields are visible only with the `finance.view` permission. */
  budget: number;
  expenses: Expense[];
  comments: Comment[];
  createdBy: string;
  createdAt: ISODate;
  updatedAt: ISODate;
}

export interface ProjectInput {
  title: string;
  description: string;
  committeeId: string;
  leadId: string;
  teamIds: string[];
  startDate: string;
  endDate: string;
  status: ProjectStatus;
  milestones?: { title: string; dueDate: string }[];
}

// ───────────── Store slice ─────────────

export interface ProjectsSlice {
  createProject: (input: ProjectInput) => Result<Project>;
  updateProject: (id: string, patch: Partial<ProjectInput>) => Result;
  addProjectMilestone: (id: string, milestone: { title: string; dueDate: string }) => Result;
  toggleProjectMilestone: (id: string, milestoneId: string) => Result;
  updateProjectProgress: (id: string, progress: number, status?: ProjectStatus) => Result;
  addProjectComment: (id: string, message: string, parentId?: string) => Result;
  closeProject: (id: string) => Result;
  /** Allocate a project's budget (finance permission). */
  setProjectBudget: (id: string, budget: number) => Result;
}
