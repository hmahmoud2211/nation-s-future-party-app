import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Info, Mic, MicOff, PhoneOff, Users, Video, VideoOff } from 'lucide-react-native';
import { AppText, Avatar, Button, PressableScale } from '@/components';
import { videoProvider, type VideoConnectionState, type VideoParticipant, type VideoSession } from '@/services/video';
import { useAppStore, useMemberMap, useUser } from '@/store';
import { confirmDialog, toast } from '@/store/uiStore';
import { colors, radius, spacing } from '@/theme';
import { toArabicDigits } from '@/utils/format';
import { canJoinConference, canManageMeeting } from '@/utils/permissions';

function elapsed(fromMs: number, nowMs: number) {
  const s = Math.max(0, Math.floor((nowMs - fromMs) / 1000));
  const mm = String(Math.floor(s / 60)).padStart(2, '0');
  const ss = String(s % 60).padStart(2, '0');
  return toArabicDigits(`${mm}:${ss}`);
}

/**
 * In-meeting screen. Talks only to the `VideoProvider` interface (services/video).
 * The bundled provider is SIMULATED — the screen says so and never claims a real call.
 */
export default function MeetingCallScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const user = useUser();
  const members = useMemberMap();
  const meeting = useAppStore((s) => s.meetings.find((m) => m.id === id));
  const endConference = useAppStore((s) => s.endConference);
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
      toast.info('انتهى الاجتماع');
      router.back();
    }
  }, [meeting, state, router]);

  if (!meeting || !allowed) {
    return (
      <View style={[styles.root, styles.center, { paddingTop: insets.top }]}>
        <AppText variant="sectionTitle" color={colors.white}>
          {meeting ? 'الاجتماع غير متاح للانضمام الآن' : 'الاجتماع غير موجود'}
        </AppText>
        <AppText variant="caption" color="rgba(255,255,255,0.7)" align="center" style={{ marginTop: spacing.sm }}>
          يمكن الانضمام عندما يبدأ المنظم الاجتماع المرئي.
        </AppText>
        <Button title="رجوع" variant="secondary" onPress={() => router.back()} style={{ marginTop: spacing.xl }} />
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
        title: 'مغادرة الاجتماع',
        message: 'هل تريد إنهاء الاجتماع للجميع، أم المغادرة فقط مع بقاء الاجتماع جارياً؟',
        confirmLabel: 'إنهاء للجميع',
        cancelLabel: 'مغادرة فقط',
        tone: 'danger',
      });
      if (end) {
        const res = endConference(meeting.id);
        if (res.ok) toast.success('تم إنهاء الاجتماع');
      }
    }
    router.back();
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top + spacing.sm, paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
      <View style={styles.top}>
        <View style={{ flex: 1 }}>
          <AppText variant="cardTitle" color={colors.white} numberOfLines={1}>
            {meeting.title}
          </AppText>
          <AppText variant="meta" color="rgba(255,255,255,0.65)">
            {state === 'connected' && joinedAt ? `${elapsed(joinedAt, now)} • ${toArabicDigits(participants.length)} مشاركين` : 'جارٍ الاتصال…'}
          </AppText>
        </View>
        {videoProvider.isSimulated ? (
          <View style={styles.simBadge}>
            <AppText variant="meta" color={colors.navy}>
              تجريبي
            </AppText>
          </View>
        ) : null}
      </View>

      {videoProvider.isSimulated ? (
        <View style={styles.notice}>
          <Info size={14} color={colors.goldLight} />
          <AppText variant="meta" color={colors.goldLight} style={{ flex: 1 }}>
            واجهة اجتماع تجريبية — لا يتم نقل أي صوت أو صورة. يمكن ربط مزود اتصال حقيقي لاحقاً.
          </AppText>
        </View>
      ) : null}

      {state !== 'connected' ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.goldLight} />
          <AppText variant="caption" color="rgba(255,255,255,0.7)" style={{ marginTop: spacing.sm }}>
            جارٍ الاتصال بالاجتماع…
          </AppText>
        </View>
      ) : showList ? (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ gap: spacing.sm, paddingVertical: spacing.md }}>
          {participants.map((p) => (
            <View key={p.id} style={styles.listRow}>
              <Avatar name={p.name} color={p.avatarColor} size={34} />
              <AppText variant="bodyMedium" color={colors.white} numberOfLines={1} style={{ flex: 1 }}>
                {p.isLocal ? `${p.name} (أنت)` : p.name}
              </AppText>
              {p.micEnabled ? <Mic size={16} color="rgba(255,255,255,0.7)" /> : <MicOff size={16} color={colors.error} />}
            </View>
          ))}
        </ScrollView>
      ) : (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.grid}>
          {participants.map((p) => (
            <View key={p.id} style={[styles.tile, p.isLocal && styles.tileLocal]}>
              {p.cameraEnabled ? (
                <View style={styles.cameraOn}>
                  <Video size={20} color="rgba(255,255,255,0.6)" />
                  <AppText variant="meta" color="rgba(255,255,255,0.6)">
                    الكاميرا مفعّلة (محاكاة)
                  </AppText>
                </View>
              ) : (
                <Avatar name={p.name} color={p.avatarColor} size={56} />
              )}
              <View style={styles.tileName}>
                {p.micEnabled ? null : <MicOff size={12} color={colors.error} />}
                <AppText variant="meta" color={colors.white} numberOfLines={1} style={{ flexShrink: 1 }}>
                  {p.isLocal ? 'أنت' : p.name.split(' ').slice(0, 2).join(' ')}
                </AppText>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      <View style={styles.controls}>
        <Control icon={mic ? Mic : MicOff} label={mic ? 'كتم' : 'إلغاء الكتم'} active={!mic} onPress={toggleMic} />
        <Control icon={camera ? Video : VideoOff} label={camera ? 'إيقاف الكاميرا' : 'تشغيل الكاميرا'} active={!camera} onPress={toggleCamera} />
        <Control icon={Users} label={showList ? 'عرض الشبكة' : 'المشاركون'} active={showList} onPress={() => setShowList((v) => !v)} />
        <Control icon={PhoneOff} label="مغادرة" danger onPress={leave} />
      </View>
    </View>
  );
}

function Control({ icon: Icon, label, onPress, active, danger }: { icon: typeof Mic; label: string; onPress: () => void; active?: boolean; danger?: boolean }) {
  return (
    <PressableScale onPress={onPress} style={styles.control} accessibilityLabel={label} haptic>
      <View style={[styles.controlIcon, active && styles.controlActive, danger && styles.controlDanger]}>
        <Icon size={20} color={colors.white} />
      </View>
      <AppText variant="meta" color="rgba(255,255,255,0.75)" numberOfLines={1}>
        {label}
      </AppText>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0A1430', paddingHorizontal: spacing.lg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  top: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  simBadge: { backgroundColor: colors.goldLight, borderRadius: radius.pill, paddingHorizontal: spacing.sm, paddingVertical: 1 },
  notice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs + 2,
    marginTop: spacing.sm,
    padding: spacing.sm,
    borderRadius: radius.sm,
    backgroundColor: 'rgba(233,213,163,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(233,213,163,0.25)',
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: spacing.sm, paddingVertical: spacing.md },
  tile: {
    width: '48.5%',
    aspectRatio: 1,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  tileLocal: { borderWidth: 1.5, borderColor: colors.gold },
  cameraOn: { alignItems: 'center', gap: 4 },
  tileName: {
    position: 'absolute',
    bottom: spacing.sm,
    start: spacing.sm,
    end: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  listRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.sm, borderRadius: radius.sm, backgroundColor: 'rgba(255,255,255,0.05)' },
  controls: { flexDirection: 'row', justifyContent: 'space-around', paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)' },
  control: { alignItems: 'center', gap: 4, width: 76 },
  controlIcon: { width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' },
  controlActive: { backgroundColor: 'rgba(255,255,255,0.28)' },
  controlDanger: { backgroundColor: colors.error },
});
