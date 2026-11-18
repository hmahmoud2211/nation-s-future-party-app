import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import {
  Bell,
  Building2,
  ChartColumn,
  ChevronLeft,
  FolderKanban,
  Inbox,
  LogOut,
  MapPin,
  Megaphone,
  MessagesSquare,
  Phone,
  RefreshCw,
  RotateCcw,
  Settings,
  Sparkles,
  UserCog,
  Wallet,
  type LucideIcon,
} from 'lucide-react-native';
import { AppHeader, AppText, Avatar, Badge, Button, Card, PressableScale, RoleBadges, ScreenContainer, SectionHeader } from '@/components';
import { useAppStore, useCommitteeMap, useUnreadCount, useUser } from '@/store';
import { confirmDialog, toast, useUIStore } from '@/store/uiStore';
import { colors, radius, spacing } from '@/theme';
import { toArabicDigits } from '@/utils/format';
import { can, canSeeAnnouncement, canViewFinance, hasGovernorates, isMemberRole, isSectorWide, relevantCommitteeIds } from '@/utils/permissions';

interface LinkItem {
  key: string;
  label: string;
  icon: LucideIcon;
  onPress: () => void;
  count?: number;
}

function LinkList({ items }: { items: LinkItem[] }) {
  return (
    <Card padded={false}>
      {items.map((it, i) => {
        const Icon = it.icon;
        return (
          <PressableScale key={it.key} scaleTo={0.99} onPress={it.onPress} style={[styles.link, i < items.length - 1 && styles.linkBorder]} accessibilityLabel={it.label}>
            <View style={styles.linkIcon}>
              <Icon size={17} color={colors.navy2} />
            </View>
            <AppText variant="bodyMedium" style={{ flex: 1 }}>
              {it.label}
            </AppText>
            {it.count ? <Badge label={toArabicDigits(it.count)} tone="error" solid /> : null}
            <ChevronLeft size={16} color={colors.textMuted} />
          </PressableScale>
        );
      })}
    </Card>
  );
}

/** «المزيد» — profile, role-specific tools (finance, governorates, admin) and secondary sections. */
export default function MoreScreen() {
  const router = useRouter();
  const user = useUser();
  const committees = useCommitteeMap();
  const unread = useUnreadCount();
  const requests = useAppStore((s) => s.requests);
  const announcements = useAppStore((s) => s.announcements);
  const resetMockData = useAppStore((s) => s.resetMockData);
  const logout = useAppStore((s) => s.logoutDemoUser);

  const committeeNames = relevantCommitteeIds(user)
    .map((id) => committees[id]?.shortName)
    .filter(Boolean)
    .join('، ');
  const openRequests = requests.filter((r) => r.authorId === user.id && r.status !== 'closed' && r.status !== 'resolved').length;
  const unreadAnnouncements = announcements.filter((a) => !a.readBy.includes(user.id) && canSeeAnnouncement(user, a.committeeId)).length;

  const leadership: LinkItem[] = [
    ...(canViewFinance(user) ? [{ key: 'finance', label: 'الملخص المالي للمشروعات', icon: Wallet, onPress: () => router.push('/finance') }] : []),
    ...(hasGovernorates(user) || can(user, 'governorates.viewAll')
      ? [{ key: 'gov', label: hasGovernorates(user) ? 'محافظاتي' : 'المحافظات', icon: MapPin, onPress: () => router.push('/governorates') }]
      : []),
    ...(can(user, 'reports.viewAll') ? [{ key: 'reports', label: 'التقارير والإحصاءات', icon: ChartColumn, onPress: () => router.push('/reports') }] : []),
  ];

  const work: LinkItem[] = [
    { key: 'projects', label: 'المشروعات', icon: FolderKanban, onPress: () => router.push('/projects') },
    { key: 'activities', label: 'الأنشطة والفعاليات', icon: Sparkles, onPress: () => router.push('/activities') },
    { key: 'announcements', label: 'الإعلانات', icon: Megaphone, onPress: () => router.push('/announcements'), count: unreadAnnouncements },
    { key: 'notifications', label: 'الإشعارات', icon: Bell, onPress: () => router.push('/notifications'), count: unread },
  ];

  const communication: LinkItem[] = [
    { key: 'feedback', label: isMemberRole(user) ? 'ملاحظاتي واستفساراتي' : 'الملاحظات والاستفسارات', icon: MessagesSquare, onPress: () => router.push('/feedback') },
    { key: 'requests', label: 'الطلبات الإدارية', icon: Inbox, onPress: () => router.push('/requests'), count: openRequests },
  ];

  const admin: LinkItem[] = can(user, 'users.manage')
    ? [
        { key: 'users', label: 'إدارة الأعضاء والأدوار', icon: UserCog, onPress: () => router.push('/members') },
        { key: 'committees', label: 'إدارة اللجان', icon: Building2, onPress: () => router.push('/admin/committees') },
        { key: 'settings', label: 'الإعدادات', icon: Settings, onPress: () => router.push('/admin/settings') },
      ]
    : [];

  const onReset = async () => {
    const ok = await confirmDialog({
      title: 'إعادة تعيين البيانات التجريبية؟',
      message: 'سيتم حذف جميع التغييرات التي أجريتها في هذه الجلسة والعودة للبيانات الأولية.',
      confirmLabel: 'إعادة التعيين',
      tone: 'danger',
    });
    if (!ok) return;
    resetMockData();
    toast.success('تمت إعادة تعيين البيانات التجريبية');
  };

  const onLogout = async () => {
    const ok = await confirmDialog({ title: 'تسجيل الخروج؟', message: 'ستبقى البيانات التجريبية في الذاكرة حتى إعادة تشغيل التطبيق.', confirmLabel: 'تسجيل الخروج', tone: 'danger' });
    if (!ok) return;
    logout();
    toast.info('تم تسجيل الخروج');
  };

  return (
    <ScreenContainer header={<AppHeader title="المزيد" back={false} />}>
      <Card onPress={() => router.push(`/members/${user.id}`)} accessibilityLabel="بياناتي">
        <View style={styles.profile}>
          <Avatar name={user.name} color={user.avatarColor} size={50} />
          <View style={{ flex: 1, gap: 3 }}>
            <AppText variant="cardTitle" numberOfLines={2}>
              {user.name}
            </AppText>
            <RoleBadges member={user} />
            <AppText variant="meta" color={colors.textSecondary} numberOfLines={1}>
              {isSectorWide(user) ? 'جميع لجان الأمانة' : committeeNames || '—'}
            </AppText>
          </View>
          <ChevronLeft size={16} color={colors.textMuted} />
        </View>
        <View style={styles.contact}>
          <Phone size={13} color={colors.textSecondary} />
          <AppText variant="meta" color={colors.textSecondary}>
            {`${toArabicDigits(user.phone)} • بيانات تواصل افتراضية`}
          </AppText>
        </View>
      </Card>

      {leadership.length ? (
        <View style={styles.section}>
          <SectionHeader title="المتابعة والإشراف" />
          <LinkList items={leadership} />
        </View>
      ) : null}

      <View style={styles.section}>
        <SectionHeader title="أعمال الأمانة" />
        <LinkList items={work} />
      </View>

      <View style={styles.section}>
        <SectionHeader title="التواصل" />
        <LinkList items={communication} />
      </View>

      {admin.length ? (
        <View style={styles.section}>
          <SectionHeader title="إدارة النظام" />
          <LinkList items={admin} />
        </View>
      ) : null}

      <View style={[styles.section, { gap: spacing.sm }]}>
        <SectionHeader title="الجلسة التجريبية" />
        <Button title="تبديل الحساب التجريبي" icon={RefreshCw} variant="secondary" onPress={() => useUIStore.getState().setAccountSwitcherOpen(true)} />
        <Button title="إعادة تعيين البيانات" icon={RotateCcw} variant="outline" onPress={onReset} />
        <Button title="تسجيل الخروج" icon={LogOut} variant="dangerOutline" onPress={onLogout} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  profile: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  contact: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: spacing.sm, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border },
  section: { marginTop: spacing.xl },
  link: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm + 2, paddingHorizontal: spacing.md, paddingVertical: spacing.sm + 3 },
  linkBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  linkIcon: { width: 32, height: 32, borderRadius: radius.sm, backgroundColor: colors.navyTint, alignItems: 'center', justifyContent: 'center' },
});
