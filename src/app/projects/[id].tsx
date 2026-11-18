import React, { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { isPastDay } from '@/utils/dates';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  CalendarDays,
  CalendarRange,
  Check,
  CircleCheck,
  Flag,
  FolderKanban,
  MessageSquare,
  Pencil,
  Plus,
  Reply,
  TrendingUp,
  User,
  Users,
  X,
  Receipt,
  Wallet,
} from 'lucide-react-native';
import {
  AppHeader,
  AppInput,
  AppText,
  Avatar,
  AvatarStack,
  Badge,
  BottomSheet,
  Button,
  Card,
  ChoiceChips,
  CommentInput,
  DateField,
  EmptyState,
  FormField,
  InfoRow,
  PressableScale,
  ProgressBar,
  ScreenContainer,
  SectionHeader,
  StatusBadge,
} from '@/components';
import { PROJECT_STATUS } from '@/constants/labels';
import { personLabel } from '@/utils/roles';
import { projectFinance, useAppStore, useCommittee, useMemberMap, useUser } from '@/store';
import { confirmDialog, promptDialog, toast } from '@/store/uiStore';
import { colors, radius, spacing } from '@/theme';
import type { Comment, Project, ProjectStatus } from '@/types';
import { formatCurrency, formatDate, formatPercent, formatRelative, refCode, toArabicDigits, toWesternDigits } from '@/utils/format';
import { canManageCommittee, canViewFinance } from '@/utils/permissions';

const PROGRESS_STEPS = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

export default function ProjectDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const user = useUser();
  const project = useAppStore((s) => s.projects.find((p) => p.id === id));
  const members = useMemberMap();
  const committee = useCommittee(project?.committeeId);
  const updateProjectProgress = useAppStore((s) => s.updateProjectProgress);
  const toggleProjectMilestone = useAppStore((s) => s.toggleProjectMilestone);
  const addProjectMilestone = useAppStore((s) => s.addProjectMilestone);
  const addProjectComment = useAppStore((s) => s.addProjectComment);
  const closeProject = useAppStore((s) => s.closeProject);
  const setProjectBudget = useAppStore((s) => s.setProjectBudget);

  const [progressOpen, setProgressOpen] = useState(false);
  const [draftProgress, setDraftProgress] = useState(0);
  const [draftStatus, setDraftStatus] = useState<ProjectStatus>('in_progress');
  const [msOpen, setMsOpen] = useState(false);
  const [msTitle, setMsTitle] = useState('');
  const [msDate, setMsDate] = useState<string | undefined>();
  const [msError, setMsError] = useState<string | null>(null);
  const [replyTo, setReplyTo] = useState<Comment | null>(null);

  const threads = useMemo(() => {
    const comments = project?.comments ?? [];
    const top = comments.filter((c) => !c.parentId || !comments.some((p) => p.id === c.parentId));
    return top.map((c) => ({ comment: c, replies: comments.filter((r) => r.parentId === c.id) }));
  }, [project?.comments]);

  if (!project) {
    return (
      <ScreenContainer header={<AppHeader title="تفاصيل المشروع" />}>
        <EmptyState icon={FolderKanban} title="المشروع غير موجود" actionLabel="رجوع" onAction={() => router.back()} />
      </ScreenContainer>
    );
  }

  const canManage = canManageCommittee(user, project.committeeId);
  const team = [project.leadId, ...project.teamIds];
  const canComment = canManage || team.includes(user.id) || user.committeeIds.includes(project.committeeId);
  const lead = members[project.leadId];
  const doneMilestones = project.milestones.filter((m) => m.done).length;
  const completed = project.status === 'completed';

  const openProgress = () => {
    setDraftProgress(Math.round(project.progress / 10) * 10);
    setDraftStatus(project.status === 'planned' ? 'in_progress' : project.status);
    setProgressOpen(true);
  };

  const saveProgress = () => {
    const res = updateProjectProgress(project.id, draftProgress, draftStatus);
    setProgressOpen(false);
    if (res.ok) toast.success('تم تحديث تقدم المشروع بنجاح');
    else toast.error(res.error);
  };

  const saveMilestone = () => {
    if (!msTitle.trim()) {
      setMsError('يرجى إدخال اسم المرحلة');
      return;
    }
    const res = addProjectMilestone(project.id, { title: msTitle, dueDate: msDate ?? project.endDate });
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    setMsOpen(false);
    setMsTitle('');
    setMsDate(undefined);
    setMsError(null);
    toast.success('تمت إضافة المرحلة بنجاح');
  };

  const onToggle = (milestoneId: string) => {
    const res = toggleProjectMilestone(project.id, milestoneId);
    if (!res.ok) toast.error(res.error);
  };

  const onSetBudget = async () => {
    const text = await promptDialog({
      title: 'الميزانية المخصصة',
      message: 'أدخل الميزانية المخصصة للمشروع بالجنيه.',
      placeholder: 'مثال: 250000',
      initialValue: project.budget ? String(project.budget) : '',
      confirmLabel: 'حفظ',
      required: true,
      requiredMessage: 'يرجى إدخال المبلغ',
    });
    if (text === null) return;
    const amount = Number(toWesternDigits(text).replace(/[^\d.]/g, ''));
    const res = setProjectBudget(project.id, amount);
    if (res.ok) toast.success('تم تحديث الميزانية');
    else toast.error(res.error);
  };

  const onClose = async () => {
    const yes = await confirmDialog({
      title: 'إغلاق المشروع كمكتمل؟',
      message: 'سيتم اعتبار جميع المراحل منجزة وتحديث نسبة الإنجاز إلى ١٠٠٪.',
      confirmLabel: 'إغلاق المشروع',
      tone: 'success',
    });
    if (!yes) return;
    const res = closeProject(project.id);
    if (res.ok) toast.success('تم إغلاق المشروع كمكتمل بنجاح');
    else toast.error(res.error);
  };

  const onSend = (text: string) => {
    const res = addProjectComment(project.id, text, replyTo?.id);
    if (!res.ok) {
      toast.error(res.error);
      return false;
    }
    setReplyTo(null);
    toast.success('تم إرسال الملاحظة بنجاح');
    return true;
  };

  return (
    <ScreenContainer
      keyboard
      header={
        <AppHeader title={project.title} eyebrow={`${refCode.project(project.seq)} • ${committee?.name ?? ''}`}>
          <View style={styles.headCard}>
            <View style={styles.headRow}>
              <StatusBadge status={PROJECT_STATUS[project.status]} />
              <View style={{ flex: 1 }} />
              <AppText variant="bodyBold" color={colors.white}>
                {formatPercent(project.progress)}
              </AppText>
            </View>
            <ProgressBar value={project.progress} trackColor="rgba(255,255,255,0.16)" color={colors.gold} height={8} />
            <AppText variant="meta" color="rgba(255,255,255,0.75)">
              {`${toArabicDigits(doneMilestones)} من ${toArabicDigits(project.milestones.length)} مراحل منجزة • ينتهي ${formatDate(project.endDate)}`}
            </AppText>
          </View>
        </AppHeader>
      }
    >
      {canManage ? (
        <View style={styles.actions}>
          <Button title="تحديث التقدم" icon={TrendingUp} size="sm" onPress={openProgress} style={{ flex: 1 }} />
          <Button title="تعديل" icon={Pencil} size="sm" variant="outline" onPress={() => router.push(`/projects/edit/${project.id}`)} style={{ flex: 1 }} />
          {!completed ? <Button title="إغلاق كمكتمل" icon={CircleCheck} size="sm" variant="success" onPress={onClose} style={{ flex: 1.2 }} /> : null}
        </View>
      ) : null}

      <Card style={styles.block}>
        <AppText variant="cardTitle" style={{ marginBottom: spacing.xs }}>
          وصف المشروع
        </AppText>
        <AppText variant="body" color={colors.textSecondary}>
          {project.description || 'لا يوجد وصف.'}
        </AppText>
        <View style={{ marginTop: spacing.md }}>
          <InfoRow icon={FolderKanban} label="اللجنة" value={committee?.name} />
          <InfoRow icon={CalendarDays} label="تاريخ البدء" value={formatDate(project.startDate)} />
          <InfoRow icon={CalendarRange} label="تاريخ الانتهاء" value={formatDate(project.endDate)} />
          <InfoRow icon={User} label="مسؤول المشروع">
            {lead ? (
              <PressableScale onPress={() => router.push(`/members/${lead.id}`)} style={styles.inline}>
                <AppText variant="bodyMedium">{lead.name}</AppText>
                <Avatar name={lead.name} color={lead.avatarColor} size={26} />
              </PressableScale>
            ) : (
              <AppText variant="bodyMedium">—</AppText>
            )}
          </InfoRow>
          <InfoRow icon={Users} label="فريق العمل" last>
            <AvatarStack people={team.map((t) => members[t]).filter(Boolean).map((m) => ({ name: m.name, color: m.avatarColor }))} />
          </InfoRow>
        </View>
        {project.teamIds.length ? (
          <View style={styles.teamWrap}>
            {project.teamIds.map((t) => members[t]).filter(Boolean).map((m) => (
              <Badge key={m.id} label={m.name} tone="navy" />
            ))}
          </View>
        ) : null}
      </Card>

      {canViewFinance(user) ? <ProjectFinanceCard project={project} onSetBudget={onSetBudget} /> : null}

      <View style={styles.block}>
        <SectionHeader
          title="المراحل الرئيسية"
          icon={Flag}
          count={project.milestones.length}
          actionLabel="إضافة مرحلة"
          onAction={canManage && !completed ? () => setMsOpen(true) : undefined}
        />
        {project.milestones.length ? (
          <Card padded={false}>
            {project.milestones.map((m, i) => (
              <PressableScale
                key={m.id}
                disabled={!canManage}
                onPress={() => onToggle(m.id)}
                scaleTo={0.99}
                accessibilityLabel={m.done ? `إلغاء إنجاز ${m.title}` : `تحديد ${m.title} كمنجزة`}
                style={[styles.msRow, i < project.milestones.length - 1 && styles.msBorder]}
              >
                <View style={[styles.check, m.done && styles.checkOn]}>{m.done ? <Check size={14} color={colors.white} strokeWidth={3} /> : null}</View>
                <View style={{ flex: 1 }}>
                  <AppText variant="bodyMedium" color={m.done ? colors.textSecondary : colors.text} style={m.done && styles.strike}>
                    {m.title}
                  </AppText>
                  <AppText variant="meta" color={colors.textMuted}>
                    {`الموعد: ${formatDate(m.dueDate)}`}
                  </AppText>
                </View>
                {m.done ? <Badge label="منجزة" tone="success" /> : isPastDay(m.dueDate) ? <Badge label="متأخرة" tone="error" /> : null}
              </PressableScale>
            ))}
          </Card>
        ) : (
          <EmptyState compact icon={Flag} title="لم تُضف مراحل بعد" />
        )}
        {canManage ? (
          <AppText variant="meta" color={colors.textSecondary} style={{ marginTop: spacing.xs }}>
            اضغط على المرحلة لتحديدها كمنجزة — يتم تحديث نسبة الإنجاز تلقائياً.
          </AppText>
        ) : null}
      </View>

      <View style={styles.block}>
        <SectionHeader title="الملاحظات الإدارية" icon={MessageSquare} count={project.comments.length} />
        {threads.length ? (
          <View style={{ gap: spacing.md }}>
            {threads.map(({ comment, replies }) => (
              <View key={comment.id} style={{ gap: spacing.sm }}>
                <CommentBubble comment={comment} onReply={canComment ? () => setReplyTo(comment) : undefined} />
                {replies.map((r) => (
                  <View key={r.id} style={styles.reply}>
                    <CommentBubble comment={r} isReply />
                  </View>
                ))}
              </View>
            ))}
          </View>
        ) : (
          <EmptyState compact icon={MessageSquare} title="لا توجد ملاحظات بعد" message="يمكن لأعضاء المشروع والمسؤول تبادل الملاحظات الإدارية هنا." />
        )}
        <View style={{ marginTop: spacing.md }}>
          {replyTo ? (
            <View style={styles.replyChip}>
              <Reply size={14} color={colors.navy2} />
              <AppText variant="meta" color={colors.navy2} style={{ flex: 1 }} numberOfLines={1}>
                {`رد على ${members[replyTo.authorId]?.name ?? 'مستخدم'}: ${replyTo.message}`}
              </AppText>
              <PressableScale onPress={() => setReplyTo(null)} hitSlop={8} accessibilityLabel="إلغاء الرد">
                <X size={14} color={colors.textSecondary} />
              </PressableScale>
            </View>
          ) : null}
          <CommentInput
            sticky={false}
            onSend={onSend}
            disabled={!canComment}
            disabledText="الملاحظات متاحة لأعضاء اللجنة وفريق المشروع فقط"
            placeholder={replyTo ? 'اكتب ردك…' : 'أضف ملاحظة إدارية على المشروع…'}
          />
        </View>
      </View>

      <BottomSheet
        visible={progressOpen}
        onClose={() => setProgressOpen(false)}
        title="تحديث تقدم المشروع"
        subtitle={project.title}
        footer={<Button title="حفظ التحديث" onPress={saveProgress} fullWidth />}
      >
        <FormField label={`نسبة الإنجاز: ${formatPercent(draftProgress)}`}>
          <ProgressBar value={draftProgress} style={{ marginBottom: spacing.md }} />
          <View style={styles.steps}>
            {PROGRESS_STEPS.map((p) => (
              <PressableScale key={p} onPress={() => setDraftProgress(p)} style={[styles.step, draftProgress === p && styles.stepOn]} accessibilityLabel={`${p}٪`}>
                <AppText variant="captionMedium" color={draftProgress === p ? colors.white : colors.text}>
                  {formatPercent(p)}
                </AppText>
              </PressableScale>
            ))}
          </View>
        </FormField>
        <FormField label="حالة المشروع">
          <ChoiceChips
            options={(Object.keys(PROJECT_STATUS) as ProjectStatus[]).map((s) => ({ value: s, label: PROJECT_STATUS[s].label }))}
            value={draftStatus}
            onChange={(v) => {
              setDraftStatus(v);
              if (v === 'completed') setDraftProgress(100);
            }}
            columns={2}
          />
        </FormField>
      </BottomSheet>

      <BottomSheet
        visible={msOpen}
        onClose={() => setMsOpen(false)}
        title="إضافة مرحلة جديدة"
        footer={<Button title="إضافة المرحلة" icon={Plus} onPress={saveMilestone} fullWidth />}
      >
        <FormField label="اسم المرحلة" required error={msError ?? undefined}>
          <AppInput
            value={msTitle}
            onChangeText={(t) => {
              setMsTitle(t);
              if (msError) setMsError(null);
            }}
            placeholder="مثال: الإطلاق التجريبي"
            error={!!msError}
          />
        </FormField>
        <FormField label="موعد المرحلة" hint="إذا لم تحدد موعداً سيُستخدم تاريخ انتهاء المشروع">
          <DateField value={msDate} onChange={setMsDate} title="موعد المرحلة" />
        </FormField>
      </BottomSheet>
    </ScreenContainer>
  );
}

function CommentBubble({ comment, onReply, isReply }: { comment: Comment; onReply?: () => void; isReply?: boolean }) {
  const members = useMemberMap();
  const user = useUser();
  const author = members[comment.authorId];
  const mine = comment.authorId === user.id;
  return (
    <View style={[styles.bubble, mine && styles.bubbleMine]}>
      <View style={styles.bubbleHead}>
        <Avatar name={author?.name ?? '؟'} color={author?.avatarColor} size={isReply ? 26 : 30} />
        <View style={{ flex: 1 }}>
          <AppText variant="captionMedium" numberOfLines={1}>
            {mine ? 'أنت' : author?.name ?? 'مستخدم'}
          </AppText>
          <AppText variant="meta" color={colors.textMuted}>
            {`${author ? personLabel(author) : ''} • ${formatRelative(comment.createdAt)}`}
          </AppText>
        </View>
        {onReply ? (
          <PressableScale onPress={onReply} hitSlop={8} style={styles.replyBtn} accessibilityLabel="رد">
            <Reply size={13} color={colors.goldDark} />
            <AppText variant="meta" color={colors.goldDark}>
              رد
            </AppText>
          </PressableScale>
        ) : null}
      </View>
      <AppText variant="body" style={{ marginTop: spacing.xs }}>
        {comment.message}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  headCard: {
    gap: spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  headRow: { flexDirection: 'row', alignItems: 'center' },
  actions: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  block: { marginBottom: spacing.xl },
  inline: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  teamWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginTop: spacing.sm },
  msRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md },
  msBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  check: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: colors.borderStrong, alignItems: 'center', justifyContent: 'center' },
  checkOn: { backgroundColor: colors.success, borderColor: colors.success },
  strike: { textDecorationLine: 'line-through' },
  bubble: { backgroundColor: colors.white, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.md },
  bubbleMine: { backgroundColor: colors.navyTint, borderColor: '#D9E0EE' },
  bubbleHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  replyBtn: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.pill, backgroundColor: colors.goldSoft },
  reply: { marginStart: spacing.xxl, borderStartWidth: 2, borderStartColor: colors.goldLight, paddingStart: spacing.sm },
  replyChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.navySoft,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    marginBottom: spacing.sm,
  },
  steps: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs + 2 },
  step: { minWidth: 52, height: 36, paddingHorizontal: spacing.sm, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  stepOn: { backgroundColor: colors.navy, borderColor: colors.navy },
});

/** Budget, expenses and remaining amount — rendered only for users with the finance permission. */
function ProjectFinanceCard({ project, onSetBudget }: { project: Project; onSetBudget: () => void }) {
  const f = projectFinance(project);
  const over = f.remaining < 0;
  return (
    <View style={styles.block}>
      <SectionHeader title="الموقف المالي" icon={Wallet} actionLabel={project.budget ? 'تعديل الميزانية' : 'تحديد الميزانية'} onAction={onSetBudget} />
      <Card>
        {project.budget ? (
          <>
            <View style={{ flexDirection: 'row', gap: spacing.sm }}>
              {[
                ['الميزانية', formatCurrency(f.budget)],
                ['المصروف', formatCurrency(f.spent)],
                ['المتبقي', formatCurrency(f.remaining)],
              ].map(([label, value], i) => (
                <View key={label} style={{ flex: 1 }}>
                  <AppText variant="meta" color={colors.textSecondary}>
                    {label}
                  </AppText>
                  <AppText variant="captionMedium" color={i === 2 && over ? colors.error : undefined} numberOfLines={1}>
                    {value}
                  </AppText>
                </View>
              ))}
            </View>
            <ProgressBar value={Math.min(100, f.percent)} color={over ? colors.error : undefined} height={6} style={{ marginTop: spacing.sm }} />
            <AppText variant="meta" color={over ? colors.error : colors.textSecondary} style={{ marginTop: 4 }}>
              {over ? `تجاوز الميزانية بنسبة ${formatPercent(f.percent - 100)}` : `نسبة الصرف ${formatPercent(f.percent)}`}
            </AppText>
            {project.expenses.length ? (
              <View style={{ marginTop: spacing.sm }}>
                {project.expenses.map((e) => (
                  <InfoRow key={e.id} icon={Receipt} label={`${e.label} • ${formatDate(e.date)}`} value={formatCurrency(e.amount)} />
                ))}
              </View>
            ) : null}
          </>
        ) : (
          <AppText variant="caption" color={colors.textSecondary}>
            لم تُخصص ميزانية لهذا المشروع بعد.
          </AppText>
        )}
      </Card>
    </View>
  );
}

