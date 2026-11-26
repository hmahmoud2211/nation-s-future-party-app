/** React state over the projects store slice. */
import { useShallow } from 'zustand/react/shallow';
import { useAppStore } from '@/context/appStore';

/** All projects records (raw store array — derive with useMemo). */
export const useProjects = () => useAppStore((s) => s.projects);

/** One record by id (undefined when missing). */
export const useProject = (id?: string | null) => useAppStore((s) => (id ? s.projects.find((item) => item.id === id) : undefined));

/** The projects store actions (stable references). */
export function useProjectActions() {
  return useAppStore(
    useShallow((s) => ({
      createProject: s.createProject,
      updateProject: s.updateProject,
      addProjectMilestone: s.addProjectMilestone,
      toggleProjectMilestone: s.toggleProjectMilestone,
      updateProjectProgress: s.updateProjectProgress,
      addProjectComment: s.addProjectComment,
      closeProject: s.closeProject,
      setProjectBudget: s.setProjectBudget,
    })),
  );
}

/** Number of a committee's projects in progress. */
export const useActiveProjectCount = (committeeId: string) =>
  useAppStore((s) => s.projects.filter((p) => p.committeeId === committeeId && p.status === 'in_progress').length);
