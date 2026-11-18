import type { Project } from '@/types';
import { canManageCommittee, canViewFinance } from '@/utils/permissions';
import { nowISO, uid } from '@/utils/id';
import { buildNotifications, clampProgress, ERR, fail, getUser, ok, okVoid, replaceById } from '../helpers';
import type { AppState, ProjectSlice, SliceCreator } from '../types';

function teamOf(p: Project) {
  return [p.leadId, ...p.teamIds];
}

function guard(state: AppState, id: string) {
  const user = getUser(state);
  const project = state.projects.find((p) => p.id === id);
  if (!user) return { error: ERR.auth } as const;
  if (!project) return { error: ERR.notFound } as const;
  if (!canManageCommittee(user, project.committeeId)) return { error: ERR.forbidden } as const;
  return { user, project } as const;
}

export const createProjectSlice: SliceCreator<ProjectSlice> = (set, get) => ({
  setProjectBudget: (id, budget) => {
    const state = get();
    const user = getUser(state);
    if (!user) return fail(ERR.auth);
    if (!canViewFinance(user)) return fail(ERR.forbidden);
    if (!Number.isFinite(budget) || budget < 0) return fail('يرجى إدخال مبلغ صحيح');
    set({ projects: replaceById(state.projects, id, (p) => ({ ...p, budget: Math.round(budget), updatedAt: nowISO() })) });
    return okVoid();
  },

  createProject: (input) => {
    const state = get();
    const user = getUser(state);
    if (!user) return fail(ERR.auth);
    if (!canManageCommittee(user, input.committeeId)) return fail('يمكنك إنشاء مشروعات للجانك فقط');
    if (!input.title.trim() || !input.leadId) return fail(ERR.required);
    const now = nowISO();
    const seq = state.seqCounter + 1;
    const project: Project = {
      id: uid('p'),
      seq,
      title: input.title.trim(),
      description: input.description.trim(),
      committeeId: input.committeeId,
      leadId: input.leadId,
      teamIds: input.teamIds.filter((id) => id !== input.leadId),
      startDate: input.startDate,
      endDate: input.endDate,
      milestones: (input.milestones ?? []).filter((m) => m.title.trim()).map((m) => ({ id: uid('ms'), title: m.title.trim(), dueDate: m.dueDate, done: false })),
      status: input.status,
      progress: input.status === 'completed' ? 100 : 0,
      // The budget is allocated later by الأمين (finance permission).
      budget: 0,
      expenses: [],
      comments: [],
      createdBy: user.id,
      createdAt: now,
      updatedAt: now,
    };
    set({
      projects: [project, ...state.projects],
      seqCounter: seq,
      notifications: [
        ...buildNotifications(teamOf(project), user.id, {
          type: 'project_update',
          title: 'مشروع جديد',
          body: `تمت إضافتك إلى فريق مشروع "${project.title}".`,
          link: `/projects/${project.id}`,
        }),
        ...state.notifications,
      ],
    });
    return ok(project);
  },

  updateProject: (id, patch) => {
    const state = get();
    const g = guard(state, id);
    if ('error' in g) return fail(g.error as string);
    if (patch.title !== undefined && !patch.title.trim()) return fail('يرجى إدخال اسم المشروع');
    const { milestones: _ignored, ...rest } = patch;
    set({
      projects: replaceById(state.projects, id, (p) => ({
        ...p,
        ...rest,
        teamIds: (rest.teamIds ?? p.teamIds).filter((m) => m !== (rest.leadId ?? p.leadId)),
        progress: rest.status === 'completed' ? 100 : p.progress,
        updatedAt: nowISO(),
      })),
      notifications: [
        ...buildNotifications(teamOf(g.project), g.user.id, {
          type: 'project_update',
          title: 'تحديث مشروع',
          body: `تم تحديث بيانات مشروع "${patch.title ?? g.project.title}".`,
          link: `/projects/${id}`,
        }),
        ...state.notifications,
      ],
    });
    return okVoid();
  },

  addProjectMilestone: (id, milestone) => {
    const state = get();
    const g = guard(state, id);
    if ('error' in g) return fail(g.error as string);
    if (!milestone.title.trim()) return fail('يرجى إدخال اسم المرحلة');
    set({
      projects: replaceById(state.projects, id, (p) => ({
        ...p,
        milestones: [...p.milestones, { id: uid('ms'), title: milestone.title.trim(), dueDate: milestone.dueDate, done: false }],
        updatedAt: nowISO(),
      })),
    });
    return okVoid();
  },

  toggleProjectMilestone: (id, milestoneId) => {
    const state = get();
    const g = guard(state, id);
    if ('error' in g) return fail(g.error as string);
    set({
      projects: replaceById(state.projects, id, (p) => {
        const milestones = p.milestones.map((m) => (m.id === milestoneId ? { ...m, done: !m.done } : m));
        const done = milestones.filter((m) => m.done).length;
        const auto = milestones.length ? Math.round((done / milestones.length) * 100) : p.progress;
        return { ...p, milestones, progress: p.status === 'completed' ? 100 : Math.max(auto, 0), updatedAt: nowISO() };
      }),
    });
    return okVoid();
  },

  updateProjectProgress: (id, progress, status) => {
    const state = get();
    const g = guard(state, id);
    if ('error' in g) return fail(g.error as string);
    const p = clampProgress(progress);
    const nextStatus = status ?? (p === 100 ? 'completed' : g.project.status === 'planned' && p > 0 ? 'in_progress' : g.project.status);
    set({
      projects: replaceById(state.projects, id, (proj) => ({ ...proj, progress: p, status: nextStatus, updatedAt: nowISO() })),
      notifications: [
        ...buildNotifications(teamOf(g.project), g.user.id, {
          type: 'project_update',
          title: 'تحديث تقدم مشروع',
          body: `أصبحت نسبة إنجاز "${g.project.title}" ${p}٪.`,
          link: `/projects/${id}`,
        }),
        ...state.notifications,
      ],
    });
    return okVoid();
  },

  addProjectComment: (id, message, parentId) => {
    const state = get();
    const user = getUser(state);
    const project = state.projects.find((p) => p.id === id);
    if (!user) return fail(ERR.auth);
    if (!project) return fail(ERR.notFound);
    const allowed = canManageCommittee(user, project.committeeId) || teamOf(project).includes(user.id) || user.committeeIds.includes(project.committeeId);
    if (!allowed) return fail(ERR.forbidden);
    if (!message.trim()) return fail('يرجى كتابة الملاحظة');
    set({
      projects: replaceById(state.projects, id, (p) => ({
        ...p,
        comments: [...p.comments, { id: uid('pc'), authorId: user.id, message: message.trim(), createdAt: nowISO(), kind: 'comment', parentId }],
        updatedAt: nowISO(),
      })),
      notifications: [
        ...buildNotifications([...teamOf(project), project.createdBy], user.id, {
          type: 'project_update',
          title: 'ملاحظة جديدة على مشروع',
          body: `${user.name}: ${message.trim().slice(0, 80)}`,
          link: `/projects/${id}`,
        }),
        ...state.notifications,
      ],
    });
    return okVoid();
  },

  closeProject: (id) => {
    const state = get();
    const g = guard(state, id);
    if ('error' in g) return fail(g.error as string);
    set({
      projects: replaceById(state.projects, id, (p) => ({
        ...p,
        status: 'completed',
        progress: 100,
        milestones: p.milestones.map((m) => ({ ...m, done: true })),
        updatedAt: nowISO(),
      })),
      notifications: [
        ...buildNotifications(teamOf(g.project), g.user.id, {
          type: 'project_update',
          title: 'اكتمال مشروع',
          body: `تم إغلاق مشروع "${g.project.title}" كمشروع مكتمل.`,
          link: `/projects/${id}`,
        }),
        ...state.notifications,
      ],
    });
    return okVoid();
  },
});
