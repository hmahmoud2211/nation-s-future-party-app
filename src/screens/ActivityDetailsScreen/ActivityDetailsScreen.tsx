import React, { useMemo, useState } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { CalendarDays, CircleCheck, FileText, Image as ImageIcon, MapPin, Sparkles, TrendingUp, UserMinus, UserPlus, Users } from 'lucide-react-native';
import { TextArea } from '@/components/forms/AppInput';
import { AttachmentPicker, FilePreview } from '@/components/forms/AttachmentPicker';
import { FormField } from '@/components/forms/FormField';
import { ActionBar } from '@/components/layout/ActionBar';
import { AppHeader } from '@/components/layout/AppHeader';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { AppText } from '@/components/common/AppText';
import { AvatarStack } from '@/components/common/Avatar';
import { Badge, StatusBadge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { InfoRow } from '@/components/ui/InfoRow';
import { PressableScale } from '@/components/common/PressableScale';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { EmptyState } from '@/components/feedback/States';
import { useActivity, useActivityActions } from '@/features/activities/hooks/useActivities';
import { ACTIVITY_STATUS, ACTIVITY_TYPE } from '@/features/activities/services/labels';
import { useUser } from '@/features/auth/hooks/useSession';
import { useCommittee } from '@/features/committees/hooks/useCommittees';
import { useMemberMap } from '@/features/members/hooks/useMembers';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useToast } from '@/hooks/useOverlays';
import type { Attachment } from '@/types/common.types';
import { formatDate, formatDateTime, formatPercent } from '@/utils/format';
import { canManageCommittee } from '@/features/auth/services/permissions';
import { activityDetailsCopy as copy, activityProgressSteps } from './ActivityDetailsScreen.data';
import { createStyles } from './ActivityDetailsScreen.styles';

export function ActivityDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const toast = useToast();
  const user = useUser();
  const activity = useActivity(id);
  const committee = useCommittee(activity?.committeeId);
  const members = useMemberMap();
  const { toggleActivityRegistration: toggleRegistration, updateActivity, publishActivityReport: publishReport } = useActivityActions();

  const [progressOpen, setProgressOpen] = useState(false);
  const [draftProgress, setDraftProgress] = useState(0);
  const [reportOpen, setReportOpen] = useState(false);
  const [report, setReport] = useState('');
  const [reportError, setReportError] = useState<string | null>(null);
  const [imagesOpen, setImagesOpen] = useState(false);

  if (!activity) {
    return (
      <ScreenContainer header={<AppHeader title={copy.title} />}>
        <EmptyState icon={Sparkles} title={copy.notFound} actionLabel={copy.back} onAction={() => router.back()} />
      </ScreenContainer>
    );
  }

  const canManage = canManageCommittee(user, activity.committeeId);
  const registered = activity.registrations.includes(user.id);
  const completed = activity.status === 'completed';
  const full = !!activity.capacity && activity.registrations.length >= activity.capacity;
  const registrants = activity.registrations.map((r) => members[r]).filter(Boolean);

  const onRegister = () => {
    const res = toggleRegistration(activity.id);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    toast.success(res.data ? copy.registeredToast : copy.unregisteredToast);
  };

  const saveProgress = () => {
    const res = updateActivity(activity.id, { progress: draftProgress, status: draftProgress > 0 ? 'ongoing' : activity.status });
    setProgressOpen(false);
    if (res.ok) toast.success(copy.progressSavedToast);
    else toast.error(res.error);
  };

  const saveReport = () => {
    if (!report.trim()) {
      setReportError(copy.reportRequired);
      return;
    }
    const res = publishReport(activity.id, report);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    setReportOpen(false);
    toast.success(copy.reportPublishedToast);
  };

  const saveImages = (images: Attachment[]) => {
    const res = updateActivity(activity.id, { images });
    if (res.ok) toast.success(copy.imagesSavedToast);
    else toast.error(res.error);
  };

  return (
    <ScreenContainer
      header={
        <AppHeader title={activity.title} eyebrow={committee?.name}>
          <View style={styles.headRow}>
            <Badge label={ACTIVITY_TYPE[activity.type]} tone="accent" solid />
            <StatusBadge status={ACTIVITY_STATUS[activity.status]} />
            {registered ? <Badge label={copy.youAreRegistered} tone="success" solid /> : null}
          </View>
        </AppHeader>
      }
      footer={
        !canManage && !completed ? (
          <ActionBar>
            <Button
              title={registered ? copy.unregister : full ? copy.full : copy.register}
              icon={registered ? UserMinus : UserPlus}
              variant={registered ? 'dangerOutline' : 'primary'}
              disabled={!registered && full}
              onPress={onRegister}
              fullWidth
              style={styles.fill}
            />
          </ActionBar>
        ) : undefined
      }
    >
      {canManage && !completed ? (
        <View style={styles.actions}>
          <Button
            title={copy.updateProgress}
            icon={TrendingUp}
            size="sm"
            onPress={() => {
              setDraftProgress(Math.min(90, Math.round(activity.progress / 10) * 10));
              setProgressOpen(true);
            }}
            style={styles.fill}
          />
          <Button
            title={copy.publishReport}
            icon={FileText}
            size="sm"
            variant="success"
            onPress={() => {
              setReport(activity.report ?? '');
              setReportError(null);
              setReportOpen(true);
            }}
            style={styles.reportButton}
          />
        </View>
      ) : null}

      <Card style={styles.block}>
        <AppText variant="cardTitle" style={styles.aboutTitle}>
          {copy.aboutTitle}
        </AppText>
        <AppText variant="body" color={theme.colors.textSecondary}>
          {activity.description || copy.noDescription}
        </AppText>
        <View style={styles.infoRows}>
          <InfoRow icon={CalendarDays} label={copy.dateLabel} value={formatDateTime(activity.date)} />
          <InfoRow icon={MapPin} label={copy.locationLabel} value={activity.location} />
          <InfoRow
            icon={Users}
            label={copy.registrantsLabel}
            value={activity.capacity ? copy.registrantsOfCapacity(activity.registrations.length, activity.capacity) : `${activity.registrations.length}`}
            last
          />
        </View>
        {activity.capacity ? (
          <ProgressBar
            value={(activity.registrations.length / activity.capacity) * 100}
            color={full ? theme.colors.error : theme.colors.accent}
            showLabel
            label={copy.occupancy}
            style={styles.occupancyBar}
          />
        ) : null}
      </Card>

      {activity.status !== 'upcoming' ? (
        <Card style={styles.block}>
          <ProgressBar value={activity.progress} showLabel label={copy.completion} />
        </Card>
      ) : null}

      {activity.report ? (
        <View style={styles.block}>
          <SectionHeader title={copy.publishedReportTitle} icon={CircleCheck} />
          <Card accentColor={theme.colors.success}>
            <AppText variant="body">{activity.report}</AppText>
          </Card>
        </View>
      ) : completed ? (
        <View style={styles.block}>
          <SectionHeader title={copy.resultsTitle} icon={CircleCheck} />
          <EmptyState compact title={copy.noReport} />
        </View>
      ) : null}

      <View style={styles.block}>
        <SectionHeader
          title={copy.imagesTitle}
          icon={ImageIcon}
          count={activity.images.length}
          actionLabel={copy.manageImages}
          onAction={canManage ? () => setImagesOpen(true) : undefined}
        />
        {activity.images.length ? (
          <View style={styles.imagesList}>
            {activity.images.map((img) => (
              <FilePreview key={img.id} file={img} />
            ))}
          </View>
        ) : (
          <EmptyState compact icon={ImageIcon} title={copy.noImages} message={canManage ? copy.noImagesManagerHint : undefined} />
        )}
      </View>

      <View style={styles.block}>
        <SectionHeader title={copy.registrantsTitle} icon={Users} count={registrants.length} />
        {registrants.length ? (
          <Card>
            <AvatarStack people={registrants.map((m) => ({ name: m.name, color: m.avatarColor }))} max={8} />
            <View style={styles.names}>
              {registrants.map((m) => (
                <Badge key={m.id} label={m.id === user.id ? copy.youSuffix(m.name) : m.name} tone={m.id === user.id ? 'success' : 'primary'} />
              ))}
            </View>
          </Card>
        ) : (
          <EmptyState compact icon={Users} title={copy.noRegistrants} />
        )}
        {canManage && !completed ? (
          <PressableScale onPress={onRegister} style={styles.selfReg} accessibilityLabel={copy.selfRegisterA11y}>
            <AppText variant="meta" color={theme.colors.primary}>
              {registered ? copy.selfUnregister : copy.selfRegister}
            </AppText>
          </PressableScale>
        ) : null}
      </View>

      <AppText variant="meta" color={theme.colors.textMuted} align="center">
        {copy.createdNote(formatDate(activity.createdAt))}
      </AppText>

      <BottomSheet
        visible={progressOpen}
        onClose={() => setProgressOpen(false)}
        title={copy.progressSheetTitle}
        footer={<Button title={copy.saveProgress} onPress={saveProgress} fullWidth />}
      >
        <FormField label={copy.progressLabel(draftProgress)} hint={copy.progressHint}>
          <ProgressBar value={draftProgress} style={styles.draftBar} />
          <View style={styles.steps}>
            {activityProgressSteps.map((p) => (
              <PressableScale key={p} onPress={() => setDraftProgress(p)} style={[styles.step, draftProgress === p && styles.stepOn]}>
                <AppText variant="captionMedium" color={draftProgress === p ? theme.colors.white : theme.colors.text}>
                  {formatPercent(p)}
                </AppText>
              </PressableScale>
            ))}
          </View>
        </FormField>
      </BottomSheet>

      <BottomSheet
        visible={reportOpen}
        onClose={() => setReportOpen(false)}
        title={copy.reportSheetTitle}
        subtitle={copy.reportSheetSubtitle}
        footer={<Button title={copy.publishReportButton} icon={FileText} variant="success" onPress={saveReport} fullWidth />}
      >
        <FormField label={copy.reportField} required error={reportError ?? undefined}>
          <TextArea
            value={report}
            onChangeText={(t) => {
              setReport(t);
              if (reportError) setReportError(null);
            }}
            placeholder={copy.reportPlaceholder}
            error={!!reportError}
            style={styles.reportInput}
          />
        </FormField>
      </BottomSheet>

      <BottomSheet visible={imagesOpen} onClose={() => setImagesOpen(false)} title={copy.imagesSheetTitle} subtitle={copy.imagesSheetSubtitle}>
        <AttachmentPicker value={activity.images} onChange={saveImages} label={copy.attachImage} max={8} userId={user.id} />
      </BottomSheet>
    </ScreenContainer>
  );
}
