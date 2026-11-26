import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, ScrollView, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Info, Mic, MicOff, PhoneOff, Users, Video, VideoOff } from 'lucide-react-native';
import { AppText } from '@/components/common/AppText';
import { Avatar } from '@/components/common/Avatar';
import { Button } from '@/components/common/Button';
import { videoProvider, type VideoConnectionState, type VideoParticipant, type VideoSession } from '@/features/meetings/services/video';
import { useMeeting, useMeetingActions } from '@/features/meetings/hooks/useMeetings';
import { useUser } from '@/features/auth/hooks/useSession';
import { useMemberMap } from '@/features/members/hooks/useMembers';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useDialogs, useToast } from '@/hooks/useOverlays';
import { localizeDigits } from '@/utils/format';
import { canJoinConference, canManageMeeting } from '@/features/auth/services/permissions';
import { CallControl } from './CallControl';
import { meetingCallCopy as copy } from './MeetingCallScreen.data';
import { createStyles, LIST_AVATAR_SIZE, TILE_AVATAR_SIZE, TILE_MIC_ICON_SIZE } from './MeetingCallScreen.styles';

function elapsed(fromMs: number, nowMs: number) {
  const s = Math.max(0, Math.floor((nowMs - fromMs) / 1000));
  const mm = String(Math.floor(s / 60)).padStart(2, '0');
  const ss = String(s % 60).padStart(2, '0');
  return localizeDigits(`${mm}:${ss}`);
}

/**
 * In-meeting screen. Talks only to the `VideoProvider` interface (services/video).
 * The bundled provider is SIMULATED — the screen says so and never claims a real call.
 */
export function MeetingCallScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const toast = useToast();
  const { confirmDialog } = useDialogs();
  const user = useUser();
  const members = useMemberMap();
  const meeting = useMeeting(id);
  const { endConference } = useMeetingActions();
  const [state, setState] = useState<VideoConnectionState>('idle');
  const [participants, setParticipants] = useState<VideoParticipant[]>([]);
  const [mic, setMic] = useState(true);
  const [camera, setCamera] = useState(false);
  const [showList, setShowList] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [joinedAt, setJoinedAt] = useState<number | null>(null);
  const session = useRef<VideoSession | null>(null);

  const allowed = !!meeting && canJoinConference(user, meeting);
  const roomId = meeting?.conference?.roomId ?? (meeting ? videoProvider.roomIdFor(meeting.id) : '');
  // People expected in the room: those who confirmed first.
  const expected = useMemo(() => {
    if (!meeting) return [];
    const ordered = [...meeting.attendeeIds].sort((a, b) => Number(meeting.rsvps[b] === 'going') - Number(meeting.rsvps[a] === 'going'));
    return ordered.map((mid) => members[mid]).filter(Boolean).map((m) => ({ id: m.id, name: m.name, avatarColor: m.avatarColor }));
  }, [meeting, members]);

  useEffect(() => {
    if (!allowed) return;
    session.current = videoProvider.join({
      roomId,
      user: { id: user.id, name: user.name, avatarColor: user.avatarColor },
      expected,
      events: {
        onStateChange: (next) => {
          setState(next);
          if (next === 'connected') setJoinedAt(Date.now());
        },
        onParticipantsChange: setParticipants,
      },
    });
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => {
      clearInterval(timer);
      session.current?.leave();
      session.current = null;
    };
    // Join once per screen visit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allowed, roomId]);

  // Leave automatically if the organizer ends the meeting.
  useEffect(() => {
    if (meeting && meeting.status !== 'live' && state === 'connected') {
      toast.info(copy.endedToast);
      router.back();
    }
  }, [meeting, state, router, toast]);

  if (!meeting || !allowed) {
    return (
      <View style={[styles.root, styles.center, { paddingTop: insets.top }]}>
        <AppText variant="sectionTitle" color={theme.colors.white}>
          {meeting ? copy.notJoinable : copy.notFound}
        </AppText>
        <AppText variant="caption" color={theme.colors.onPrimaryMuted} align="center" style={styles.unavailableHint}>
          {copy.joinHint}
        </AppText>
        <Button title={copy.back} variant="secondary" onPress={() => router.back()} style={styles.backButton} />
      </View>
    );
  }

  const toggleMic = () => {
    session.current?.setMicEnabled(!mic);
    setMic((v) => !v);
  };
  const toggleCamera = () => {
    session.current?.setCameraEnabled(!camera);
    setCamera((v) => !v);
  };
  const leave = async () => {
    if (canManageMeeting(user, meeting)) {
      const end = await confirmDialog({
        title: copy.leaveDialogTitle,
        message: copy.leaveDialogMessage,
        confirmLabel: copy.leaveDialogConfirm,
        cancelLabel: copy.leaveDialogCancel,
        tone: 'danger',
      });
      if (end) {
        const res = endConference(meeting.id);
        if (res.ok) toast.success(copy.endedForAllToast);
      }
    }
    router.back();
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top + theme.spacing.sm, paddingBottom: Math.max(insets.bottom, theme.spacing.md) }]}>
      <View style={styles.top}>
        <View style={styles.fill}>
          <AppText variant="cardTitle" color={theme.colors.white} numberOfLines={1}>
            {meeting.title}
          </AppText>
          <AppText variant="meta" color={theme.colors.onPrimarySubtle}>
            {state === 'connected' && joinedAt ? copy.connectedStatus(elapsed(joinedAt, now), participants.length) : copy.connecting}
          </AppText>
        </View>
        {videoProvider.isSimulated ? (
          <View style={styles.simBadge}>
            <AppText variant="meta" color={theme.colors.primary}>
              {copy.simulatedBadge}
            </AppText>
          </View>
        ) : null}
      </View>

      {videoProvider.isSimulated ? (
        <View style={styles.notice}>
          <Info size={theme.sizes.icon.xs} color={theme.colors.accentLight} />
          <AppText variant="meta" color={theme.colors.accentLight} style={styles.fill}>
            {copy.simulatedNotice}
          </AppText>
        </View>
      ) : null}

      {state !== 'connected' ? (
        <View style={styles.center}>
          <ActivityIndicator color={theme.colors.accentLight} />
          <AppText variant="caption" color={theme.colors.onPrimaryMuted} style={styles.connectingText}>
            {copy.connectingToMeeting}
          </AppText>
        </View>
      ) : showList ? (
        <ScrollView style={styles.fill} contentContainerStyle={styles.listContent}>
          {participants.map((p) => (
            <View key={p.id} style={styles.listRow}>
              <Avatar name={p.name} color={p.avatarColor} size={LIST_AVATAR_SIZE} />
              <AppText variant="bodyMedium" color={theme.colors.white} numberOfLines={1} style={styles.fill}>
                {p.isLocal ? copy.youSuffix(p.name) : p.name}
              </AppText>
              {p.micEnabled ? <Mic size={theme.sizes.icon.sm} color={theme.colors.onPrimaryMuted} /> : <MicOff size={theme.sizes.icon.sm} color={theme.colors.error} />}
            </View>
          ))}
        </ScrollView>
      ) : (
        <ScrollView style={styles.fill} contentContainerStyle={styles.grid}>
          {participants.map((p) => (
            <View key={p.id} style={[styles.tile, p.isLocal && styles.tileLocal]}>
              {p.cameraEnabled ? (
                <View style={styles.cameraOn}>
                  <Video size={theme.sizes.icon.md} color={theme.colors.onPrimarySubtle} />
                  <AppText variant="meta" color={theme.colors.onPrimarySubtle}>
                    {copy.cameraOn}
                  </AppText>
                </View>
              ) : (
                <Avatar name={p.name} color={p.avatarColor} size={TILE_AVATAR_SIZE} />
              )}
              <View style={styles.tileName}>
                {p.micEnabled ? null : <MicOff size={TILE_MIC_ICON_SIZE} color={theme.colors.error} />}
                <AppText variant="meta" color={theme.colors.white} numberOfLines={1} style={styles.tileNameText}>
                  {p.isLocal ? copy.you : p.name.split(' ').slice(0, 2).join(' ')}
                </AppText>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      <View style={styles.controls}>
        <CallControl icon={mic ? Mic : MicOff} label={mic ? copy.mute : copy.unmute} active={!mic} onPress={toggleMic} />
        <CallControl icon={camera ? Video : VideoOff} label={camera ? copy.cameraStop : copy.cameraStart} active={!camera} onPress={toggleCamera} />
        <CallControl icon={Users} label={showList ? copy.showGrid : copy.participants} active={showList} onPress={() => setShowList((v) => !v)} />
        <CallControl icon={PhoneOff} label={copy.leave} danger onPress={leave} />
      </View>
    </View>
  );
}
