import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { BadgeCheck, Building2, CalendarDays, FolderKanban, IdCard, Landmark, Lightbulb, Mail, MessageSquare, Pencil, Phone, ShieldCheck, UserRound } from 'lucide-react-native';
import {
  ActionBar,
  AppHeader,
  AppText,
  Avatar,
  Badge,
  Button,
  Card,
  EmptyState,
  IconButton,
  InfoRow,
  PressableScale,
  ProjectCard,
  ProposalCard,
  RoleBadges,
  ScreenContainer,
  SectionHeader,
  StatusBadge,
} from '@/components';
import { MEMBERSHIP_STATUS } from '@/constants/labels';
import { useAppStore, useUser } from '@/store';
import { promptDialog, toast } from '@/store/uiStore';
import { colors, radius, spacing } from '@/theme';
import { formatDate, toArabicDigits } from '@/utils/format';
import { canManageCommittee, canViewProposal, isAdmin } from '@/utils/permissions';
import { personLabel, rolesLabel } from '@/utils/roles';

/** Person profile: role, committees (with responsibility), governorates, proposals and projects. */
export default function MemberDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const user = useUser();
  const member = useAppStore((s) => s.members.find((m) => m.id === id));
  const committees = useAppStore((s) => s.committees);
  const governorates = useAppStore((s) => s.governorates);
  const projects = useAppStore((s) => s.projects);
  const proposals = useAppStore((s) => s.proposals);
  const createNotification = useAppStore((s) => s.createNotification);

  const memberCommittees = useMemo(() => {
    if (!member) return [];
    const ids = new Set([...member.managedCommitteeIds, ...member.supervisedCommitteeIds, ...member.committeeIds]);
    return committees.filter((c) => ids.has(c.id));
  }, [committees, member]);
  const memberGovernorates = useMemo(() => (member ? governorates.filter((g) => member.governorateIds.includes(g.id)) : []), [governorates, member]);
  const memberProposals = useMemo(
    () => (member ? proposals.filter((p) => p.createdBy === member.id && canViewProposal(user, p)).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)) : []),
    [proposals, member, user],
  );
  const memberProjects = useMemo(() => (member ? projects.filter((p) => p.leadId === member.id || p.teamIds.includes(member.id)) : []), [projects, member]);

  if (!member) {
    return (
      <ScreenContainer header={<AppHeader title="بيانات العضو" />}>
        <EmptyState icon={UserRound} title="العضو غير موجود" actionLabel="العودة" onAction={() => (router.canGoBack() ? router.back() : router.replace('/home'))} />
      </ScreenContainer>
    );
  }

  const isSelf = member.id === user.id;
  const admin = isAdmin(user);
  const showPrivate = isSelf || admin;
  // People responsible for one of this person's committees can send them an admin note.
  const canNote = !isSelf && member.committeeIds.some((c) => canManageCommittee(user, c));

  const sendNote = async () => {
    const text = await promptDialog({
      title: 'إرسال ملاحظة إدارية',
      message: `ستصل الملاحظة إلى ${member.name} كإشعار داخل التطبيق.`,
      placeholder: 'اكتب الملاحظة الإدارية…',
      confirmLabel: 'إرسال',
      required: true,
      requiredMessage: 'يرجى كتابة نص الملاحظة',
    });
    if (text === null) return;
    createNotification({ recipientId: member.id, type: 'feedback_new', title: 'ملاحظة إدارية', body: text, link: `/members/${member.id}` });
    toast.success('تم إرسال الملاحظة بنجاح');
  };

  const committeeRole = (committeeId: string) =>
    [member.managedCommitteeIds.includes(committeeId) ? 'مسؤول اللجنة' : null, member.supervisedCommitteeIds.includes(committeeId) ? 'إشراف' : null]
      .filter(Boolean)
      .join(' • ') || personLabel(member);

  return (
    <ScreenContainer
      header={
        <AppHeader
          title={isSelf ? 'بياناتي' : 'بيانات العضو'}
          actions={admin ? <IconButton icon={Pencil} variant="glass" accessibilityLabel="تعديل البيانات والدور" onPress={() => router.push(`/members/edit/${member.id}`)} /> : undefined}
        >
          <View style={styles.profile}>
            <Avatar name={member.name} color={member.avatarColor} size={56} ring />
            <View style={{ flex: 1, gap: 4 }}>
              <AppText variant="sectionTitle" color={colors.white} numberOfLines={2}>
                {member.name}
              </AppText>
              <AppText variant="caption" color={colors.goldLight} numberOfLines={2}>
                {member.title}
              </AppText>
              <View style={styles.badges}>
                <RoleBadges member={member} />
                {member.status !== 'active' ? <StatusBadge status={MEMBERSHIP_STATUS[member.status]} /> : null}
              </View>
            </View>
          </View>
        </AppHeader>
      }
      footer={
        canNote ? (
          <ActionBar>
            <Button title="إرسال ملاحظة إدارية" icon={MessageSquare} variant="outline" onPress={sendNote} fullWidth />
          </ActionBar>
        ) : undefined
      }
    >
      <SectionHeader title="اللجان" icon={Building2} count={memberCommittees.length} />
      {memberCommittees.length ? (
        <View style={{ gap: spacing.sm }}>
          {memberCommittees.map((c) => (
            <PressableScale key={c.id} onPress={() => router.push(`/committee/${c.id}`)} style={styles.committee} accessibilityLabel={c.name}>
              <View style={[styles.committeeDot, { backgroundColor: c.color }]} />
              <AppText variant="bodyMedium" style={{ flex: 1 }} numberOfLines={1}>
                {c.name}
              </AppText>
              <AppText variant="meta" color={colors.textSecondary}>
                {committeeRole(c.id)}
              </AppText>
            </PressableScale>
          ))}
        </View>
      ) : (
        <Card>
          <AppText variant="caption" color={colors.textSecondary} align="center">
            {member.role === 'sector_secretary' || member.role === 'admin' ? 'يتابع جميع لجان الأمانة' : 'غير مسجل في أي لجنة'}
          </AppText>
        </Card>
      )}

      {memberGovernorates.length ? (
        <>
          <SectionHeader title="المحافظات المسندة" icon={Landmark} count={memberGovernorates.length} style={styles.section} />
          <View style={styles.chips}>
            {memberGovernorates.map((g) => (
              <PressableScale key={g.id} onPress={() => router.push(`/governorates/${g.id}`)} accessibilityLabel={g.name}>
                <Badge label={g.name} tone="navy" size="md" />
              </PressableScale>
            ))}
          </View>
        </>
      ) : null}

      <SectionHeader title="بيانات العضوية" icon={IdCard} style={styles.section} />
      <Card style={{ paddingVertical: spacing.xs }}>
        <InfoRow icon={ShieldCheck} label="الصفة" value={rolesLabel(member, '، ')} />
        <InfoRow icon={BadgeCheck} label="حالة العضوية" value={MEMBERSHIP_STATUS[member.status].label} />
        <InfoRow icon={CalendarDays} label="تاريخ الانضمام" value={formatDate(member.joinDate)} last={!showPrivate} />
        {showPrivate ? (
          <>
            <InfoRow icon={IdCard} label="رقم العضوية" value={toArabicDigits(member.membershipNumber)} />
            <InfoRow icon={Phone} label="الهاتف (افتراضي)" value={toArabicDigits(member.phone)} />
            <InfoRow icon={Mail} label="البريد الإلكتروني" last>
              <AppText variant="bodyMedium" arabicDigits={false} numberOfLines={1}>
                {member.email}
              </AppText>
            </InfoRow>
          </>
        ) : null}
      </Card>

      {memberProposals.length ? (
        <>
          <SectionHeader title="المقترحات المقدمة" icon={Lightbulb} count={memberProposals.length} style={styles.section} />
          <View style={{ gap: spacing.sm }}>
            {memberProposals.slice(0, 5).map((p) => (
              <ProposalCard key={p.id} proposal={p} onPress={() => router.push(`/proposals/${p.id}`)} />
            ))}
          </View>
        </>
      ) : null}

      {memberProjects.length ? (
        <>
          <SectionHeader title="المشروعات" icon={FolderKanban} count={memberProjects.length} style={styles.section} />
          <View style={{ gap: spacing.sm }}>
            {memberProjects.map((p) => (
              <ProjectCard key={p.id} project={p} onPress={() => router.push(`/projects/${p.id}`)} />
            ))}
          </View>
        </>
      ) : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  profile: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  section: { marginTop: spacing.xl },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  committee: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  committeeDot: { width: 10, height: 10, borderRadius: 5 },
});
