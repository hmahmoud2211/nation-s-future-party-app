/**
 * Video-conference provider contract.
 *
 * The UI never talks to a vendor SDK directly — it goes through `VideoProvider`.
 * Today the app ships a SIMULATED provider (no audio/video is transmitted). To integrate a real
 * service later, implement this interface (e.g. with the vendor's React Native SDK, which will
 * require a development build) and export it from `services/video/index.ts`.
 */
export interface VideoParticipant {
  id: string;
  name: string;
  avatarColor: string;
  isLocal: boolean;
  micEnabled: boolean;
  cameraEnabled: boolean;
}

export type VideoConnectionState = 'idle' | 'connecting' | 'connected' | 'disconnected';

export interface VideoSessionEvents {
  onStateChange?: (state: VideoConnectionState) => void;
  onParticipantsChange?: (participants: VideoParticipant[]) => void;
}

export interface VideoSession {
  readonly roomId: string;
  setMicEnabled(enabled: boolean): void;
  setCameraEnabled(enabled: boolean): void;
  leave(): void;
}

export interface JoinOptions {
  roomId: string;
  user: { id: string; name: string; avatarColor: string };
  /** Other invited people — a real provider gets these from the server. */
  expected: { id: string; name: string; avatarColor: string }[];
  events: VideoSessionEvents;
}

export interface VideoProvider {
  /** Stable provider id saved on the meeting (`ConferenceInfo.provider`). */
  readonly id: string;
  /** Arabic display name. */
  readonly label: string;
  /** `true` when no real media is exchanged — the UI must say so. */
  readonly isSimulated: boolean;
  /** Deterministic room id for a meeting (a real provider would create the room server-side). */
  roomIdFor(meetingId: string): string;
  join(options: JoinOptions): VideoSession;
}
