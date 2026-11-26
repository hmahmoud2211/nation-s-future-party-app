import { mockVideoProvider } from '@/features/meetings/services/video/mockProvider';
import type { VideoProvider } from '@/features/meetings/services/video/types';

export * from '@/features/meetings/services/video/types';

/** The active provider. Swap this for a real implementation to enable actual calls. */
export const videoProvider: VideoProvider = mockVideoProvider;
