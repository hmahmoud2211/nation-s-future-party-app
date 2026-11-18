import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { CalendarDays, CircleCheck, FileText, Image as ImageIcon, MapPin, Sparkles, TrendingUp, UserMinus, UserPlus, Users } from 'lucide-react-native';
import {
  ActionBar,
  AppHeader,
  AppText,
  AttachmentPicker,
  AvatarStack,
  Badge,
  BottomSheet,
  Button,
  Card,
  EmptyState,
  FilePreview,
  FormField,
  InfoRow,
  PressableScale,
  ProgressBar,
  ScreenContainer,
  SectionHeader,
  StatusBadge,
  TextArea,
} from '@/components';
import { ACTIVITY_STATUS, ACTIVITY_TYPE } from '@/constants/labels';
import { useAppStore, useCommittee, useMemberMap, useUser } from '@/store';
import { toast } from '@/store/uiStore';
import { colors, radius, spacing } from '@/theme';
import type { Attachment } from '@/types';
import { formatDate, formatDateTime, formatPercent } from '@/utils/format';
import { canManageCommittee } from '@/utils/permissions';

const STEPS = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90];

export default function ActivityDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const user = useUser();
  const activity = useAppStore((s) => s.activities.find((a) => a.id === id));
  const committee = useCommittee(activity?.committeeId);
  const members = useMemberMap();
  const toggleRegistration = useAppStore((s) => s.toggleActivityRegistration);
  const updateActivity = useAppStore((s) => s.updateActivity);
  const publishReport = useAppStore((s) => s.publishActivityReport);

  const [progressOpen, setProgressOpen] = useState(false);
  const [draftProgress, setDraftProgress] = useState(0);
  const [reportOpen, setReportOpen] = useState(false);
  const [report, setReport] = useState('');
  const [reportError, setReportError] = useState<string | null>(null);
  const [imagesOpen, setImagesOpen] = useState(false);

  if (!activity) {
    return (
      <ScreenContainer header={<AppHeader title="تفاصيل النشاط" />}>
        <EmptyState icon={Sparkles} title="النشاط غير موجود" actionLabel="رجوع" onAction={() => router.back()} />
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
    toast.success(res.data ? 'تم تسجيلك في النشاط بنجاح (تسجيل تجريبي)' : 'تم إلغاء تسجيلك في النشاط');
  };

  const saveProgress = () => {
    const res = updateActivity(activity.id, { progress: draftProgress, status: draftProgress > 0 ? 'ongoing' : activity.status });
    setProgressOpen(false);
    if (res.ok) toast.success('تم تحديث تقدم النشاط بنجاح');
    else toast.error(res.error);
  };

  const saveReport = () => {
    if (!report.trim()) {
      setReportError('يرجى كتابة تقرير الإنجاز');
      return;
    }
    const res = publishReport(activity.id, report);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    setReportOpen(false);
    toast.success('تم نشر تقرير الإنجاز بنجاح');
  };

  const saveImages = (images: Attachment[]) => {
    const res = updateActivity(activity.id, { images });
    if (res.ok) toast.success('تم تحديث صور النشاط');
    else toast.error(res.error);
  };

  return (
    <ScreenContainer
      header={
        <AppHeader title={activity.title} eyebrow={committee?.name}>
          <View style={styles.headRow}>
            <Badge label={ACTIVITY_TYPE[activity.type]} tone="gold" solid />
            <StatusBadge status={ACTIVITY_STATUS[activity.status]} />
            {registered ? <Badge label="أنت مسجل" tone="success" solid /> : null}
          </View>
        </AppHeader>
      }
      footer={
        !canManage && !completed ? (
          <ActionBar>
            <Button
              title={registered ? 'إلغاء التسجيل' : full ? 'اكتمل العدد' : 'التسجيل في النشاط'}
              icon={registered ? UserMinus : UserPlus}
              variant={registered ? 'dangerOutline' : 'primary'}
              disabled={!registered && full}
              onPress={onRegister}
              fullWidth
              style={{ flex: 1 }}
            />
          </ActionBar>
        ) : undefined
      }
    >
      {canManage && !completed ? (
        <View style={styles.actions}>
          <Button
            title="تحديث التقدم"
            icon={TrendingUp}
            size="sm"
            onPress={() => {
              setDraftProgress(Math.min(90, Math.round(activity.progress / 10) * 10));
              setProgressOpen(true);
            }}
            style={{ flex: 1 }}
          />
          <Button
            title="نشر تقرير الإنجاز"
            icon={FileText}
            size="sm"
            variant="success"
            onPress={() => {
              setReport(activity.report ?? '');
              setReportError(null);
              setReportOpen(true);
            }}
            style={{ flex: 1.2 }}
          />
        </View>
      ) : null}

      <Card style={styles.block}>
        <AppText variant="cardTitle" style={{ marginBottom: spacing.xs }}>
          عن النشاط
        </AppText>
        <AppText variant="body" color={colors.textSecondary}>
          {activity.description || 'لا يوجد وصف.'}
        </AppText>
        <View style={{ marginTop: spacing.md }}>
          <InfoRow icon={CalendarDays} label="الموعد" value={formatDateTime(activity.date)} />
          <InfoRow icon={MapPin} label="المكان" value={activity.location} />
          <InfoRow icon={Users} label="المسجلون" value={activity.capacity ? `${activity.registrations.length} من ${activity.capacity}` : `${activity.registrations.length}`} last />
        </View>
        {activity.capacity ? (
          <ProgressBar
            value={(activity.registrations.length / activity.capacity) * 100}
            color={full ? colors.error : colors.gold}
            showLabel
            label="نسبة الإشغال"
            style={{ marginTop: spacing.sm }}
          />
        ) : null}
      </Card>

      {activity.status !== 'upcoming' ? (
        <Card style={styles.block}>
          <ProgressBar value={activity.progress} showLabel label="نسبة إنجاز النشاط" />
        </Card>
      ) : null}

      {activity.report ? (
        <View style={styles.block}>
          <SectionHeader title="تقرير الإنجاز المنشور" icon={CircleCheck} />
          <Card accentColor={colors.success}>
            <AppText variant="body">{activity.report}</AppText>
          </Card>
        </View>
      ) : completed ? (
        <View style={styles.block}>
          <SectionHeader title="نتائج النشاط" icon={CircleCheck} />
          <EmptyState compact title="لم يُنشر تقرير الإنجاز بعد" />
        </View>
      ) : null}

      <View style={styles.block}>
        <SectionHeader
          title="صور النشاط (تجريبية)"
          icon={ImageIcon}
          count={activity.images.length}
          actionLabel="إدارة الصور"
          onAction={canManage ? () => setImagesOpen(true) : undefined}
        />
        {activity.images.length ? (
          <View style={{ gap: spacing.sm }}>
            {activity.images.map((img) => (
              <FilePreview key={img.id} file={img} />
            ))}
          </View>
        ) : (
          <EmptyState compact icon={ImageIcon} title="لا توجد صور مرفقة" message={canManage ? 'يمكنك إرفاق صور من جهازك — لن يتم رفعها لأي خادم.' : undefined} />
        )}
      </View>

      <View style={styles.block}>
        <SectionHeader title="المسجلون" icon={Users} count={registrants.length} />
        {registrants.length ? (
          <Card>
            <AvatarStack people={registrants.map((m) => ({ name: m.name, color: m.avatarColor }))} max={8} />
            <View style={styles.names}>
              {registrants.map((m) => (
                <Badge key={m.id} label={m.id === user.id ? `${m.name} (أنت)` : m.name} tone={m.id === user.id ? 'success' : 'navy'} />
              ))}
            </View>
          </Card>
        ) : (
          <EmptyState compact icon={Users} title="لا يوجد مسجلون بعد" />
        )}
        {canManage && !completed ? (
          <PressableScale onPress={onRegister} style={styles.selfReg} accessibilityLabel="تسجيلي">
            <AppText variant="meta" color={colors.navy2}>
              {registered ? 'إلغاء تسجيلي الشخصي' : 'تسجيلي كمشارك'}
            </AppText>
          </PressableScale>
        ) : null}
      </View>

      <AppText variant="meta" color={colors.textMuted} align="center">
        {`أُنشئ في ${formatDate(activity.createdAt)} • التسجيل في الأنشطة تجريبي ولا يرسل أي بيانات`}
      </AppText>

      <BottomSheet
        visible={progressOpen}
        onClose={() => setProgressOpen(false)}
        title="تحديث تقدم النشاط"
        footer={<Button title="حفظ التحديث" onPress={saveProgress} fullWidth />}
      >
        <FormField label={`نسبة الإنجاز: ${formatPercent(draftProgress)}`} hint="لإنهاء النشاط انشر تقرير الإنجاز">
          <ProgressBar value={draftProgress} style={{ marginBottom: spacing.md }} />
          <View style={styles.steps}>
            {STEPS.map((p) => (
              <PressableScale key={p} onPress={() => setDraftProgress(p)} style={[styles.step, draftProgress === p && styles.stepOn]}>
                <AppText variant="captionMedium" color={draftProgress === p ? colors.white : colors.text}>
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
        title="نشر تقرير الإنجاز"
        subtitle="سيُعتبر النشاط منتهياً ويُشعَر الأعضاء والمسجلون بالنتائج"
        footer={<Button title="نشر التقرير" icon={FileText} variant="success" onPress={saveReport} fullWidth />}
      >
        <FormField label="تقرير الإنجاز" required error={reportError ?? undefined}>
          <TextArea
            value={report}
            onChangeText={(t) => {
              setReport(t);
              if (reportError) setReportError(null);
            }}
            placeholder="عدد المشاركين، أبرز النتائج والتوصيات…"
            error={!!reportError}
            style={{ minHeight: 150 }}
          />
        </FormField>
      </BottomSheet>

      <BottomSheet visible={imagesOpen} onClose={() => setImagesOpen(false)} title="صور النشاط" subtitle="تبقى الصور على جهازك خلال الجلسة فقط">
        <AttachmentPicker value={activity.images} onChange={saveImages} label="إرفاق صورة" max={8} />
      </BottomSheet>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  headRow: { flexDirection: 'row', gap: spacing.xs, flexWrap: 'wrap' },
  actions: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  block: { marginBottom: spacing.xl },
  names: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginTop: spacing.md },
  selfReg: { alignSelf: 'flex-start', marginTop: spacing.sm, paddingHorizontal: spacing.md, paddingVertical: 4, borderRadius: radius.pill, backgroundColor: colors.navySoft },
  steps: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs + 2 },
  step: { minWidth: 52, height: 36, paddingHorizontal: spacing.sm, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  stepOn: { backgroundColor: colors.navy, borderColor: colors.navy },
});
