import { mockVideoProvider } from './mockProvider';
import type { VideoProvider } from './types';

export * from './types';

/** The active provider. Swap this for a real implementation to enable actual calls. */
export const videoProvider: VideoProvider = mockVideoProvider;
