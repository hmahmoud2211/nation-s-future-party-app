import React, { useMemo, useState } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { CalendarDays, CircleCheck, CircleX, Clock, FileText, ListOrdered, MapPin, Pencil, Timer, UserRound, Users, Video, XCircle } from 'lucide-react-native';
import { TextArea } from '@/components/forms/AppInput';
import { FormField } from '@/components/forms/FormField';
import { ActionBar } from '@/components/layout/ActionBar';
import { AppHeader } from '@/components/layout/AppHeader';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { AppText } from '@/components/common/AppText';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { InfoRow } from '@/components/ui/InfoRow';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { EmptyState } from '@/components/feedback/States';
import { useMeeting, useMeetingActions } from '@/features/meetings/hooks/useMeetings';
import { useUser } from '@/features/auth/hooks/useSession';
import { useCommittee } from '@/features/committees/hooks/useCommittees';
import { useMemberMap } from '@/features/members/hooks/useMembers';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useDialogs, useToast } from '@/hooks/useOverlays';
import type { RSVPStatus } from '@/features/meetings/types';
import { formatDate, formatTime } from '@/utils/format';
import { canJoinConference, canManageMeeting, canStartConference, canViewMeeting, isCommitteeMember } from '@/features/auth/services/permissions';
import { ConferenceCard } from './ConferenceCard';
import { MeetingAttendees } from './MeetingAttendees';
import { meetingDetailsCopy as copy } from './MeetingDetailsScreen.data';
import { createStyles } from './MeetingDetailsScreen.styles';
import { MeetingHeadCard } from './MeetingHeadCard';

export function MeetingDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const toast = useToast();
  const { confirmDialog } = useDialogs();
  const user = useUser();
  const meeting = useMeeting(id);
  const members = useMemberMap();
  const committee = useCommittee(meeting?.committeeId);
  const { updateMeetingRSVP, addMeetingMinutes, cancelMeeting, startConference, endConference } = useMeetingActions();
  const [minutesOpen, setMinutesOpen] = useState(false);
  const [minutes, setMinutes] = useState('');
  const [minutesError, setMinutesError] = useState<string | null>(null);

  if (!meeting || !canViewMeeting(user, meeting)) {
    return (
      <ScreenContainer header={<AppHeader title={copy.title} />}>
        <EmptyState icon={CalendarDays} title={meeting ? copy.unauthorized : copy.notFound} actionLabel={copy.back} onAction={() => router.back()} />
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

  const rsvp = (status: RSVPStatus) => {
    const res = updateMeetingRSVP(meeting.id, status);
    if (res.ok) toast.success(status === 'going' ? copy.rsvpGoingToast : copy.rsvpDeclinedToast);
    else toast.error(res.error);
  };

  const saveMinutes = () => {
    if (!minutes.trim()) {
      setMinutesError(copy.minutesRequired);
      return;
    }
    const res = addMeetingMinutes(meeting.id, minutes);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    setMinutesOpen(false);
    toast.success(copy.minutesSavedToast);
  };

  const onCancel = async () => {
    const yes = await confirmDialog({
      title: copy.cancelDialogTitle,
      message: copy.cancelDialogMessage,
      confirmLabel: copy.cancelDialogConfirm,
      cancelLabel: copy.cancelDialogDismiss,
      tone: 'danger',
    });
    if (!yes) return;
    const res = cancelMeeting(meeting.id);
    if (res.ok) toast.success(copy.cancelledToast);
    else toast.error(res.error);
  };

  const onStart = async () => {
    const yes = await confirmDialog({
      title: copy.startDialogTitle,
      message: copy.startDialogMessage,
      confirmLabel: copy.startDialogConfirm,
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
    const yes = await confirmDialog({ title: copy.endDialogTitle, message: copy.endDialogMessage, confirmLabel: copy.endDialogConfirm, tone: 'danger' });
    if (!yes) return;
    const res = endConference(meeting.id);
    if (res.ok) toast.success(copy.endedToast);
    else toast.error(res.error);
  };

  const ModeIcon = meeting.mode === 'online' ? Video : MapPin;
  const showRsvpBar = scheduled && isAttendee;

  return (
    <ScreenContainer
      header={
        <AppHeader title={meeting.title} eyebrow={committee?.name ?? copy.generalMeeting}>
          <MeetingHeadCard meeting={meeting} myRsvp={myRsvp} scheduled={scheduled} />
        </AppHeader>
      }
      footer={
        canJoin ? (
          <ActionBar>
            <Button title={copy.joinMeeting} icon={Video} variant="success" onPress={() => router.push(`/meetings/call/${meeting.id}`)} style={styles.fill} />
          </ActionBar>
        ) : showRsvpBar ? (
          <ActionBar>
            <Button
              title={myRsvp === 'going' ? copy.rsvpGoingDone : copy.rsvpGoing}
              icon={CircleCheck}
              variant={myRsvp === 'going' ? 'success' : 'primary'}
              onPress={() => rsvp('going')}
              style={styles.fill}
            />
            <Button
              title={myRsvp === 'declined' ? copy.rsvpDeclinedDone : copy.rsvpDecline}
              icon={CircleX}
              variant={myRsvp === 'declined' ? 'danger' : 'dangerOutline'}
              onPress={() => rsvp('declined')}
              style={styles.fill}
            />
          </ActionBar>
        ) : undefined
      }
    >
      {canManage ? (
        <View style={styles.actions}>
          {scheduled ? <Button title={copy.edit} icon={Pencil} size="sm" variant="outline" onPress={() => router.push(`/meetings/edit/${meeting.id}`)} style={styles.fill} /> : null}
          {meeting.status !== 'cancelled' ? (
            <Button
              title={meeting.minutes ? copy.updateMinutes : copy.recordMinutes}
              icon={FileText}
              size="sm"
              onPress={() => {
                setMinutes(meeting.minutes ?? '');
                setMinutesError(null);
                setMinutesOpen(true);
              }}
              style={styles.minutesButton}
            />
          ) : null}
          {scheduled ? <Button title={copy.cancel} icon={XCircle} size="sm" variant="dangerOutline" onPress={onCancel} style={styles.fill} /> : null}
        </View>
      ) : null}

      {meeting.mode === 'online' && meeting.status !== 'cancelled' ? (
        <ConferenceCard meeting={meeting} live={live} scheduled={scheduled} canStart={canStart} canManage={canManage} onStart={onStart} onEnd={onEnd} />
      ) : null}

      <Card style={styles.block}>
        <InfoRow icon={CalendarDays} label={copy.dateLabel} value={formatDate(meeting.date)} />
        <InfoRow icon={Clock} label={copy.timeLabel} value={formatTime(meeting.date)} />
        <InfoRow icon={Timer} label={copy.durationLabelTitle} value={copy.durationLabel(meeting.durationMin)} />
        <InfoRow icon={ModeIcon} label={meeting.mode === 'online' ? copy.typeLabel : copy.locationLabel} value={meeting.mode === 'online' ? copy.onlineMeeting : meeting.location} />
        <InfoRow icon={Users} label={copy.committeeLabel} value={committee?.name ?? copy.generalMeeting} />
        <InfoRow icon={UserRound} label={copy.organizerLabel} value={organizer?.name ?? copy.emptyValue} last />
      </Card>

      {meeting.description ? (
        <View style={styles.block}>
          <SectionHeader title={copy.descriptionTitle} />
          <Card>
            <AppText variant="body">{meeting.description}</AppText>
          </Card>
        </View>
      ) : null}

      <View style={styles.block}>
        <SectionHeader title={copy.agendaTitle} icon={ListOrdered} count={meeting.agenda.length} />
        {meeting.agenda.length ? (
          <Card style={styles.agendaCard}>
            {meeting.agenda.map((item, i) => (
              <View key={`${item}-${i}`} style={styles.agendaRow}>
                <View style={styles.num}>
                  <AppText variant="meta" color={theme.colors.white}>
                    {i + 1}
                  </AppText>
                </View>
                <AppText variant="body" style={styles.fill}>
                  {item}
                </AppText>
              </View>
            ))}
          </Card>
        ) : (
          <EmptyState compact title={copy.noAgenda} />
        )}
      </View>

      {meeting.minutes || meeting.status === 'completed' ? (
        <View style={styles.block}>
          <SectionHeader title={copy.minutesTitle} icon={FileText} />
          <Card accentColor={theme.colors.accent}>
            <AppText variant="body" color={meeting.minutes ? theme.colors.text : theme.colors.textSecondary}>
              {meeting.minutes ?? copy.noMinutes}
            </AppText>
          </Card>
        </View>
      ) : null}

      <MeetingAttendees meeting={meeting} members={members} userId={user.id} />

      <BottomSheet
        visible={minutesOpen}
        onClose={() => setMinutesOpen(false)}
        title={copy.minutesSheetTitle}
        subtitle={copy.minutesSheetSubtitle}
        footer={<Button title={copy.saveMinutes} icon={FileText} onPress={saveMinutes} fullWidth />}
      >
        <FormField label={copy.minutesField} required error={minutesError ?? undefined}>
          <TextArea
            value={minutes}
            onChangeText={(t) => {
              setMinutes(t);
              if (minutesError) setMinutesError(null);
            }}
            placeholder={copy.minutesPlaceholder}
            error={!!minutesError}
            style={styles.minutesInput}
          />
        </FormField>
      </BottomSheet>
    </ScreenContainer>
  );
}
