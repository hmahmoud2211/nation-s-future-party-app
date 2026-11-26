/** Display labels and badge tones for the projects domain. */
import type { ProjectStatus } from '@/features/projects/types';

import type { LabelTone } from '@/types/common.types';

export const PROJECT_STATUS: Record<ProjectStatus, LabelTone> = {
  planned: { label: 'مخطط له', tone: 'info' },
  in_progress: { label: 'قيد التنفيذ', tone: 'primary' },
  paused: { label: 'متوقف مؤقتاً', tone: 'warning' },
  completed: { label: 'مكتمل', tone: 'success' },
};

export const CURRENCY = 'جنيه مصري';

export const CURRENCY_SHORT = 'ج.م';
