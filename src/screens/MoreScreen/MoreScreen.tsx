import React, { useMemo } from 'react';
import { View } from 'react-native';
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
import { AppText } from '@/components/common/AppText';
import { Avatar } from '@/components/common/Avatar';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { PressableScale } from '@/components/common/PressableScale';
import { AppHeader } from '@/components/layout/AppHeader';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { useAnnouncements } from '@/features/announcements/hooks/useAnnouncements';
import { useAuthActions, useUser } from '@/features/auth/hooks/useSession';
import { can, canSeeAnnouncement, canViewFinance, hasGovernorates, isMemberRole, isSectorWide, relevantCommitteeIds } from '@/features/auth/services/permissions';
import { useCommitteeMap } from '@/features/committees/hooks/useCommittees';
import { RoleBadges } from '@/features/members/components/RoleBadges';
import { useUnreadCount } from '@/features/notifications/hooks/useNotifications';
import { useRequests } from '@/features/requests/hooks/useRequests';
import { useSettingsActions } from '@/features/settings/hooks/useSettings';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useAccountSwitcher, useDialogs, useToast } from '@/hooks/useOverlays';
import { localizeDigits } from '@/utils/format';
import { moreCopy as copy } from './MoreScreen.data';
import { CONTACT_ICON_SIZE, createStyles, LINK_ICON_SIZE, PROFILE_AVATAR_SIZE } from './MoreScreen.styles';

interface LinkItem {
  key: string;
  label: string;
  icon: LucideIcon;
  onPress: () => void;
  count?: number;
}

function LinkList({ items }: { items: LinkItem[] }) {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  return (
    <Card padded={false}>
      {items.map((it, i) => {
        const Icon = it.icon;
        return (
          <PressableScale key={it.key} scaleTo={0.99} onPress={it.onPress} style={[styles.link, i < items.length - 1 && styles.linkBorder]} accessibilityLabel={it.label}>
            <View style={styles.linkIcon}>
              <Icon size={LINK_ICON_SIZE} color={theme.colors.primary} />
            </View>
            <AppText variant="bodyMedium" style={styles.linkLabel}>
              {it.label}
            </AppText>
            {it.count ? <Badge label={localizeDigits(it.count)} tone="error" solid /> : null}
            <ChevronLeft size={theme.sizes.icon.sm} color={theme.colors.textMuted} />
          </PressableScale>
        );
      })}
    </Card>
  );
}

/** «المزيد» — profile, role-specific tools (finance, governorates, admin) and secondary sections. */
export function MoreScreen() {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const router = useRouter();
  const user = useUser();
  const committees = useCommitteeMap();
  const unread = useUnreadCount();
  const requests = useRequests();
  const announcements = useAnnouncements();
  const { resetMockData } = useSettingsActions();
  const { logoutDemoUser: logout } = useAuthActions();
  const toast = useToast();
  const { confirmDialog } = useDialogs();
  const { setOpen: setAccountSwitcherOpen } = useAccountSwitcher();

  const committeeNames = relevantCommitteeIds(user)
    .map((id) => committees[id]?.shortName)
    .filter(Boolean)
    .join(copy.committeeSeparator);
  const openRequests = requests.filter((r) => r.authorId === user.id && r.status !== 'closed' && r.status !== 'resolved').length;
  const unreadAnnouncements = announcements.filter((a) => !a.readBy.includes(user.id) && canSeeAnnouncement(user, a.committeeId)).length;

  const leadership: LinkItem[] = [
    ...(canViewFinance(user) ? [{ key: 'finance', label: copy.finance, icon: Wallet, onPress: () => router.push('/finance') }] : []),
    ...(hasGovernorates(user) || can(user, 'governorates.viewAll')
      ? [{ key: 'gov', label: hasGovernorates(user) ? copy.myGovernorates : copy.governorates, icon: MapPin, onPress: () => router.push('/governorates') }]
      : []),
    ...(can(user, 'reports.viewAll') ? [{ key: 'reports', label: copy.reports, icon: ChartColumn, onPress: () => router.push('/reports') }] : []),
  ];

  const work: LinkItem[] = [
    { key: 'projects', label: copy.projects, icon: FolderKanban, onPress: () => router.push('/projects') },
    { key: 'activities', label: copy.activities, icon: Sparkles, onPress: () => router.push('/activities') },
    { key: 'announcements', label: copy.announcements, icon: Megaphone, onPress: () => router.push('/announcements'), count: unreadAnnouncements },
    { key: 'notifications', label: copy.notifications, icon: Bell, onPress: () => router.push('/notifications'), count: unread },
  ];

  const communication: LinkItem[] = [
    { key: 'feedback', label: isMemberRole(user) ? copy.myFeedback : copy.feedback, icon: MessagesSquare, onPress: () => router.push('/feedback') },
    { key: 'requests', label: copy.requests, icon: Inbox, onPress: () => router.push('/requests'), count: openRequests },
  ];

  const admin: LinkItem[] = can(user, 'users.manage')
    ? [
        { key: 'users', label: copy.manageMembers, icon: UserCog, onPress: () => router.push('/members') },
        { key: 'committees', label: copy.manageCommittees, icon: Building2, onPress: () => router.push('/admin/committees') },
        { key: 'settings', label: copy.settings, icon: Settings, onPress: () => router.push('/admin/settings') },
      ]
    : [];

  const onReset = async () => {
    const ok = await confirmDialog({
      title: copy.resetDialogTitle,
      message: copy.resetDialogMessage,
      confirmLabel: copy.resetDialogConfirm,
      tone: 'danger',
    });
    if (!ok) return;
    resetMockData();
    toast.success(copy.resetDone);
  };

  const onLogout = async () => {
    const ok = await confirmDialog({ title: copy.logoutDialogTitle, message: copy.logoutDialogMessage, confirmLabel: copy.logoutDialogConfirm, tone: 'danger' });
    if (!ok) return;
    logout();
    toast.info(copy.logoutDone);
  };

  return (
    <ScreenContainer header={<AppHeader title={copy.title} back={false} />}>
      <Card onPress={() => router.push(`/members/${user.id}`)} accessibilityLabel={copy.profileA11y}>
        <View style={styles.profile}>
          <Avatar name={user.name} color={user.avatarColor} size={PROFILE_AVATAR_SIZE} />
          <View style={styles.profileText}>
            <AppText variant="cardTitle" numberOfLines={2}>
              {user.name}
            </AppText>
            <RoleBadges member={user} />
            <AppText variant="meta" color={theme.colors.textSecondary} numberOfLines={1}>
              {isSectorWide(user) ? copy.allSectorCommittees : committeeNames || copy.emptyValue}
            </AppText>
          </View>
          <ChevronLeft size={theme.sizes.icon.sm} color={theme.colors.textMuted} />
        </View>
        <View style={styles.contact}>
          <Phone size={CONTACT_ICON_SIZE} color={theme.colors.textSecondary} />
          <AppText variant="meta" color={theme.colors.textSecondary}>
            {copy.contactLine(localizeDigits(user.phone))}
          </AppText>
        </View>
      </Card>

      {leadership.length ? (
        <View style={styles.section}>
          <SectionHeader title={copy.leadershipTitle} />
          <LinkList items={leadership} />
        </View>
      ) : null}

      <View style={styles.section}>
        <SectionHeader title={copy.workTitle} />
        <LinkList items={work} />
      </View>

      <View style={styles.section}>
        <SectionHeader title={copy.communicationTitle} />
        <LinkList items={communication} />
      </View>

      {admin.length ? (
        <View style={styles.section}>
          <SectionHeader title={copy.adminTitle} />
          <LinkList items={admin} />
        </View>
      ) : null}

      <View style={[styles.section, styles.sessionActions]}>
        <SectionHeader title={copy.sessionTitle} />
        <Button title={copy.switchAccount} icon={RefreshCw} variant="secondary" onPress={() => setAccountSwitcherOpen(true)} />
        <Button title={copy.resetData} icon={RotateCcw} variant="outline" onPress={onReset} />
        <Button title={copy.logout} icon={LogOut} variant="dangerOutline" onPress={onLogout} />
      </View>
    </ScreenContainer>
  );
}
