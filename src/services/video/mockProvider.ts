import type { JoinOptions, VideoParticipant, VideoProvider, VideoSession } from './types';

/**
 * SIMULATED provider: no camera, microphone or network is used.
 * It only fakes connection states and a participant list so the meeting UI can be designed
 * and tested end-to-end. Replace it with a real implementation of `VideoProvider`.
 */
export const mockVideoProvider: VideoProvider = {
  id: 'mock',
  label: 'اتصال مرئي تجريبي',
  isSimulated: true,

  roomIdFor: (meetingId) => `room-${meetingId}`,

  join({ roomId, user, expected, events }: JoinOptions): VideoSession {
    let mic = true;
    let camera = false;
    let left = false;
    const timers: ReturnType<typeof setTimeout>[] = [];

    const local = (): VideoParticipant => ({ ...user, isLocal: true, micEnabled: mic, cameraEnabled: camera });
    // Simulate up to 5 invited people "present" in the room.
    const remotes: VideoParticipant[] = expected
      .filter((p) => p.id !== user.id)
      .slice(0, 5)
      .map((p, i) => ({ ...p, isLocal: false, micEnabled: i % 2 === 0, cameraEnabled: false }));
    const emit = () => !left && events.onParticipantsChange?.([local(), ...remotes]);

    events.onStateChange?.('connecting');
    timers.push(
      setTimeout(() => {
        if (left) return;
        events.onStateChange?.('connected');
        emit();
      }, 900),
    );

    return {
      roomId,
      setMicEnabled(enabled) {
        mic = enabled;
        emit();
      },
      setCameraEnabled(enabled) {
        camera = enabled;
        emit();
      },
      leave() {
        left = true;
        timers.forEach(clearTimeout);
        events.onStateChange?.('disconnected');
      },
    };
  },
};
