import type { Tone } from '@/theme';

/** App-wide types shared by several domains. */

export type ISODate = string;

export interface Attachment {
  id: string;
  name: string;
  size?: number;
  mimeType?: string;
  /** Local URI from the document picker — session only, never uploaded. */
  uri?: string;
  addedAt: ISODate;
  addedBy: string;
}

export interface TimelineEvent {
  id: string;
  /** Machine-friendly type used to pick an icon / tone. */
  type:
    | 'created'
    | 'updated'
    | 'submitted'
    | 'under_review'
    | 'approved'
    | 'rejected'
    | 'note'
    | 'started'
    | 'progress'
    | 'completed'
    | 'reopened'
    | 'closed'
    | 'replied'
    | 'assigned';
  label: string;
  actorId: string;
  note?: string;
  createdAt: ISODate;
}

export interface Comment {
  id: string;
  authorId: string;
  message: string;
  createdAt: ISODate;
  kind?: 'comment' | 'review' | 'system' | 'info_request';
  parentId?: string;
  attachments?: Attachment[];
}

/** Snapshot shown in the home header. The demo has no weather service — see `sampleWeather`. */
export type WeatherKind = 'sunny' | 'partlyCloudy' | 'cloudy' | 'rain' | 'wind';

export interface WeatherSnapshot {
  temperatureC: number;
  /** Picks the weather icon. */
  kind: WeatherKind;
  /** Short Arabic condition label shown under the temperature, e.g. «مشمس». */
  condition: string;
}

export type Result<T = void> = { ok: true; data: T } | { ok: false; error: string };

/** A label + tone pair used by status badges. */
export type LabelTone = { label: string; tone: Tone };
