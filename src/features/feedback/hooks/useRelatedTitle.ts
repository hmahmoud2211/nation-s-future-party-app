import { useAppStore } from '@/context/appStore';
import type { Feedback } from '@/features/feedback/types';

/** Title of the related proposal / project. */
export function useRelatedTitle(fb: Pick<Feedback, 'category' | 'relatedEntityId'>): string | undefined {
  return useAppStore((s) => {
    if (!fb.relatedEntityId) return undefined;
    if (fb.category === 'proposal') return s.proposals.find((p) => p.id === fb.relatedEntityId)?.title;
    if (fb.category === 'project') return s.projects.find((p) => p.id === fb.relatedEntityId)?.title;
    return undefined;
  });
}
