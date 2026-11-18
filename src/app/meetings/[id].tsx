import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  CalendarDays,
  CircleCheck,
  CircleX,
  Clock,
  FileText,
  ListOrdered,
  MapPin,
  Pencil,
  Timer,
  UserRound,
  Users,
  Video,
  XCircle,
} from 'lucide-react-native';
import {
  ActionBar,
  AppHeader,
  AppText,
  Avatar,
  BottomSheet,
  Button,
  Card,
  EmptyState,
  FormField,
  InfoRow,
  ScreenContainer,
  SectionHeader,
  StatusBadge,
  TextArea,
} from '@/components';
import { MEETING_STATUS, RSVP_STATUS } from '@/constants/labels';
import { useAppStore, useCommittee, useMemberMap, useUser } from '@/store';
import { confirmDialog, toast } from '@/store/uiStore';
import { colors, radius, spacing } from '@/theme';
import type { RSVPStatus } from '@/types';
import { videoProvider } from '@/services/video';
import { formatDate, formatRelative, formatTime, formatWeekday, toArabicDigits } from '@/utils/format';
import { canJoinConference, canManageMeeting, canStartConference, canViewMeeting, isCommitteeMember } from '@/utils/permissions';

function durationLabel(min: number) {
  if (min === 60) return 'ساعة';
  if (min === 90) return 'ساعة ونصف';
  if (min === 120) return 'ساعتان';
  return `${toArabicDigits(min)} دقيقة`;
}

export default function MeetingDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const user = useUser();
  const meeting = useAppStore((s) => s.meetings.find((m) => m.id === id));
  const members = useMemberMap();
  const committee = useCommittee(meeting?.committeeId);
  const updateMeetingRSVP = useAppStore((s) => s.updateMeetingRSVP);
  const addMeetingMinutes = useAppStore((s) => s.addMeetingMinutes);
  const cancelMeeting = useAppStore((s) => s.cancelMeeting);
  const startConference = useAppStore((s) => s.startConference);
  const endConference = useAppStore((s) => s.endConference);
  const [minutesOpen, setMinutesOpen] = useState(false);
  const [minutes, setMinutes] = useState('');
  const [minutesError, setMinutesError] = useState<string | null>(null);

  if (!meeting || !canViewMeeting(user, meeting)) {
    return (
      <ScreenContainer header={<AppHeader title="تفاصيل الاجتماع" />}>
        <EmptyState icon={CalendarDays} title={meeting ? 'غير مصرح' : 'الاجتماع غير موجود'} actionLabel="رجوع" onAction={() => router.back()} />
      </ScreenContainer>
    );
  }

  const canManage = canManageMeeting(user, meeting);
  const scheduled = meeting.status === 'scheduled';
  const live = meeting.status === 'live';
  const canJoin = canJoinConference(user, meeting);
  const canStart = canStartConference(user, meeting);
  const organizer = members[meeting.createdBy];
  const isAttendee = meeting.attendeeIds.includes(user.id) || (!!meeting.committeeId && isCommitteeMember(user, meeting.committeeId));
  const myRsvp: RSVPStatus | undefined = meeting.rsvps[user.id];
  const counts = meeting.attendeeIds.reduce(
    (acc, a) => {
      const s = meeting.rsvps[a] ?? 'pending';
      acc[s] += 1;
      return acc;
    },
    { going: 0, declined: 0, pending: 0 } as Record<RSVPStatus, number>,
  );

  const rsvp = (status: RSVPStatus) => {
    const res = updateMeetingRSVP(meeting.id, status);
    if (res.ok) toast.success(status === 'going' ? 'تم تأكيد حضورك بنجاح' : 'تم تسجيل اعتذارك عن الحضور');
    else toast.error(res.error);
  };

  const saveMinutes = () => {
    if (!minutes.trim()) {
      setMinutesError('يرجى كتابة محضر الاجتماع');
      return;
    }
    const res = addMeetingMinutes(meeting.id, minutes);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    setMinutesOpen(false);
    toast.success('تم تسجيل محضر الاجتماع بنجاح');
  };

  const onCancel = async () => {
    const yes = await confirmDialog({
      title: 'إلغاء الاجتماع؟',
      message: 'سيتم إشعار جميع المدعوين بإلغاء الاجتماع. لا يمكن التراجع عن هذا الإجراء.',
      confirmLabel: 'إلغاء الاجتماع',
      cancelLabel: 'تراجع',
      tone: 'danger',
    });
    if (!yes) return;
    const res = cancelMeeting(meeting.id);
    if (res.ok) toast.success('تم إلغاء الاجتماع وإشعار المدعوين');
    else toast.error(res.error);
  };

  const onStart = async () => {
    const yes = await confirmDialog({
      title: 'بدء الاجتماع المرئي؟',
      message: 'سيتم إشعار المشاركين بأن الاجتماع بدأ ويمكنهم الانضمام.',
      confirmLabel: 'بدء الاجتماع',
    });
    if (!yes) return;
    const res = startConference(meeting.id);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    router.push(`/meetings/call/${meeting.id}`);
  };

  const onEnd = async () => {
    const yes = await confirmDialog({ title: 'إنهاء الاجتماع للجميع؟', message: 'سيتم إغلاق الاجتماع المرئي واعتباره منعقداً.', confirmLabel: 'إنهاء', tone: 'danger' });
    if (!yes) return;
    const res = endConference(meeting.id);
    if (res.ok) toast.success('تم إنهاء الاجتماع');
    else toast.error(res.error);
  };

  const d = new Date(meeting.date);
  const ModeIcon = meeting.mode === 'online' ? Video : MapPin;
  const showRsvpBar = scheduled && isAttendee;

  return (
    <ScreenContainer
      header={
        <AppHeader title={meeting.title} eyebrow={committee?.name ?? 'اجتماع عام'}>
          <View style={styles.headCard}>
            <View style={styles.dateBox}>
              <AppText variant="meta" color={colors.navy}>
                {formatWeekday(d)}
              </AppText>
              <AppText variant="display" color={colors.navy} style={styles.day}>
                {d.getDate()}
              </AppText>
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <AppText variant="cardTitle" color={colors.white}>
                {formatDate(meeting.date)}
              </AppText>
              <AppText variant="caption" color="rgba(255,255,255,0.75)">
                {`${formatTime(meeting.date)} • ${durationLabel(meeting.durationMin)}`}
              </AppText>
              <View style={{ flexDirection: 'row', gap: spacing.xs, marginTop: 2 }}>
                <StatusBadge status={MEETING_STATUS[meeting.status]} />
                {myRsvp && scheduled ? <StatusBadge status={RSVP_STATUS[myRsvp]} /> : null}
              </View>
            </View>
          </View>
        </AppHeader>
      }
      footer={
        canJoin ? (
          <ActionBar>
            <Button title="انضمام إلى الاجتماع" icon={Video} variant="success" onPress={() => router.push(`/meetings/call/${meeting.id}`)} style={{ flex: 1 }} />
          </ActionBar>
        ) : showRsvpBar ? (
          <ActionBar>
            <Button
              title={myRsvp === 'going' ? 'تم تأكيد الحضور' : 'تأكيد الحضور'}
              icon={CircleCheck}
              variant={myRsvp === 'going' ? 'success' : 'primary'}
              onPress={() => rsvp('going')}
              style={{ flex: 1 }}
            />
            <Button
              title={myRsvp === 'declined' ? 'تم الاعتذار' : 'الاعتذار'}
              icon={CircleX}
              variant={myRsvp === 'declined' ? 'danger' : 'dangerOutline'}
              onPress={() => rsvp('declined')}
              style={{ flex: 1 }}
            />
          </ActionBar>
        ) : undefined
      }
    >
      {canManage ? (
        <View style={styles.actions}>
          {scheduled ? <Button title="تعديل" icon={Pencil} size="sm" variant="outline" onPress={() => router.push(`/meetings/edit/${meeting.id}`)} style={{ flex: 1 }} /> : null}
          {meeting.status !== 'cancelled' ? (
            <Button
              title={meeting.minutes ? 'تحديث المحضر' : 'تسجيل المحضر'}
              icon={FileText}
              size="sm"
              onPress={() => {
                setMinutes(meeting.minutes ?? '');
                setMinutesError(null);
                setMinutesOpen(true);
              }}
              style={{ flex: 1.2 }}
            />
          ) : null}
          {scheduled ? <Button title="إلغاء" icon={XCircle} size="sm" variant="dangerOutline" onPress={onCancel} style={{ flex: 1 }} /> : null}
        </View>
      ) : null}

      {meeting.mode === 'online' && meeting.status !== 'cancelled' ? (
        <Card style={[styles.block, live && styles.liveCard]}>
          <View style={styles.confHead}>
            <View style={[styles.confIcon, live && { backgroundColor: colors.success }]}>
              <Video size={18} color={live ? colors.white : colors.navy2} />
            </View>
            <View style={{ flex: 1 }}>
              <AppText variant="cardTitle">
                {live ? 'الاجتماع المرئي جارٍ الآن' : scheduled ? 'اجتماع مرئي — لم يبدأ بعد' : 'انتهى الاجتماع المرئي'}
              </AppText>
              <AppText variant="meta" color={colors.textSecondary}>
                {live && meeting.conference?.startedAt
                  ? `بدأ ${formatRelative(meeting.conference.startedAt)}`
                  : scheduled
                    ? canStart
                      ? 'ابدأ الاجتماع في موعده ليتمكن المشاركون من الانضمام'
                      : 'يمكنك الانضمام عندما يبدأ المنظم الاجتماع'
                    : 'يمكن مراجعة المحضر أدناه'}
              </AppText>
            </View>
          </View>
          {canStart ? <Button title="بدء الاجتماع" icon={Video} onPress={onStart} style={{ marginTop: spacing.md }} /> : null}
          {live && canManage ? <Button title="إنهاء الاجتماع للجميع" icon={XCircle} variant="dangerOutline" size="sm" onPress={onEnd} style={{ marginTop: spacing.sm }} /> : null}
          {videoProvider.isSimulated ? (
            <AppText variant="meta" color={colors.textMuted} style={{ marginTop: spacing.sm }}>
              الاتصال المرئي في هذه النسخة تجريبي — لا يتم نقل صوت أو صورة.
            </AppText>
          ) : null}
        </Card>
      ) : null}

      <Card style={styles.block}>
        <InfoRow icon={CalendarDays} label="التاريخ" value={formatDate(meeting.date)} />
        <InfoRow icon={Clock} label="الوقت" value={formatTime(meeting.date)} />
        <InfoRow icon={Timer} label="المدة" value={durationLabel(meeting.durationMin)} />
        <InfoRow icon={ModeIcon} label={meeting.mode === 'online' ? 'النوع' : 'المكان'} value={meeting.mode === 'online' ? 'اجتماع مرئي' : meeting.location} />
        <InfoRow icon={Users} label="اللجنة" value={committee?.name ?? 'اجتماع عام'} />
        <InfoRow icon={UserRound} label="المنظم" value={organizer?.name ?? '—'} last />
      </Card>

      {meeting.description ? (
        <View style={styles.block}>
          <SectionHeader title="الوصف" />
          <Card>
            <AppText variant="body">{meeting.description}</AppText>
          </Card>
        </View>
      ) : null}

      <View style={styles.block}>
        <SectionHeader title="جدول الأعمال" icon={ListOrdered} count={meeting.agenda.length} />
        {meeting.agenda.length ? (
          <Card style={{ gap: spacing.sm }}>
            {meeting.agenda.map((item, i) => (
              <View key={`${item}-${i}`} style={styles.agendaRow}>
                <View style={styles.num}>
                  <AppText variant="meta" color={colors.white}>
                    {i + 1}
                  </AppText>
                </View>
                <AppText variant="body" style={{ flex: 1 }}>
                  {item}
                </AppText>
              </View>
            ))}
          </Card>
        ) : (
          <EmptyState compact title="لم يُحدَّد جدول أعمال" />
        )}
      </View>

      {meeting.minutes || meeting.status === 'completed' ? (
        <View style={styles.block}>
          <SectionHeader title="محضر الاجتماع" icon={FileText} />
          <Card accentColor={colors.gold}>
            <AppText variant="body" color={meeting.minutes ? colors.text : colors.textSecondary}>
              {meeting.minutes ?? 'لم يُسجَّل المحضر بعد.'}
            </AppText>
          </Card>
        </View>
      ) : null}

      <View style={styles.block}>
        <SectionHeader title="المدعوون" icon={Users} count={meeting.attendeeIds.length} />
        <View style={styles.counts}>
          <CountPill label="مؤكد" value={counts.going} color={colors.success} />
          <CountPill label="معتذر" value={counts.declined} color={colors.error} />
          <CountPill label="بانتظار الرد" value={counts.pending} color={colors.textSecondary} />
        </View>
        <Card padded={false}>
          {meeting.attendeeIds.map((a, i) => {
            const m = members[a];
            if (!m) return null;
            const s = meeting.rsvps[a] ?? 'pending';
            return (
              <View key={a} style={[styles.attendee, i < meeting.attendeeIds.length - 1 && styles.border]}>
                <Avatar name={m.name} color={m.avatarColor} size={34} />
                <View style={{ flex: 1 }}>
                  <AppText variant="bodyMedium" numberOfLines={1}>
                    {a === user.id ? `${m.name} (أنت)` : m.name}
                  </AppText>
                  <AppText variant="meta" color={colors.textSecondary} numberOfLines={1}>
                    {m.title}
                  </AppText>
                </View>
                <StatusBadge status={RSVP_STATUS[s]} />
              </View>
            );
          })}
        </Card>
      </View>


      <BottomSheet
        visible={minutesOpen}
        onClose={() => setMinutesOpen(false)}
        title="محضر الاجتماع"
        subtitle="سيُعتبر الاجتماع منعقداً ويُشعَر المدعوون بنشر المحضر"
        footer={<Button title="حفظ المحضر" icon={FileText} onPress={saveMinutes} fullWidth />}
      >
        <FormField label="نص المحضر" required error={minutesError ?? undefined}>
          <TextArea
            value={minutes}
            onChangeText={(t) => {
              setMinutes(t);
              if (minutesError) setMinutesError(null);
            }}
            placeholder="أبرز ما تمت مناقشته والقرارات والتكليفات…"
            error={!!minutesError}
            style={{ minHeight: 160 }}
          />
        </FormField>
      </BottomSheet>
    </ScreenContainer>
  );
}

function CountPill({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={styles.pill}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <AppText variant="captionMedium">{value}</AppText>
      <AppText variant="meta" color={colors.textSecondary}>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  headCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  dateBox: { width: 56, borderRadius: radius.sm + 2, backgroundColor: colors.goldLight, alignItems: 'center', paddingVertical: spacing.xs + 2 },
  day: { fontSize: 20, lineHeight: 28 },
  liveCard: { borderColor: colors.success, backgroundColor: colors.successSoft },
  confHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  confIcon: { width: 38, height: 38, borderRadius: radius.sm + 2, backgroundColor: colors.navySoft, alignItems: 'center', justifyContent: 'center' },
  actions: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  block: { marginBottom: spacing.xl },
  agendaRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  num: { width: 24, height: 24, borderRadius: 12, backgroundColor: colors.navy2, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  counts: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm, flexWrap: 'wrap' },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: colors.white, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.md, paddingVertical: 3 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  attendee: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm + 2 },
  border: { borderBottomWidth: 1, borderBottomColor: colors.border },
});
