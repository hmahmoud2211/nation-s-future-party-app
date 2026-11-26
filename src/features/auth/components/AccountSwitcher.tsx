import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Check, RefreshCw } from 'lucide-react-native';
import { DEMO_ACCOUNT_GROUP_LABELS, demoAccounts } from '@/data';
import { useMemberMap } from '@/features/members/hooks/useMembers';
import { useAuthActions, useCurrentUserId } from '@/features/auth/hooks/useSession';
import { useNotifications } from '@/features/notifications/hooks/useNotifications';
import { useAccountSwitcherState, useToast } from '@/hooks/useOverlays';
import { borderRadius, colors, spacing } from '@/theme';
import { AppText } from '@/components/common/AppText';
import { Avatar } from '@/components/common/Avatar';
import { RoleBadges } from '@/features/members/components/RoleBadges';
import { PressableScale } from '@/components/common/PressableScale';
import { BottomSheet } from '@/components/ui/BottomSheet';

/**
 * "تغيير الحساب التجريبي" — instantly switch between demo roles.
 * All data stays in the same in-memory store, so workflows continue across accounts.
 */
export function AccountSwitcher() {
  const { open, setOpen } = useAccountSwitcherState();
  const toast = useToast();
  const currentUserId = useCurrentUserId();
  const { switchDemoUser } = useAuthActions();
  const notifications = useNotifications();
  const members = useMemberMap();
  const router = useRouter();

  const onSelect = (memberId: string) => {
    if (memberId === currentUserId) {
      setOpen(false);
      return;
    }
    const res = switchDemoUser(memberId);
    setOpen(false);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    if (router.canDismiss()) router.dismissAll();
    router.replace('/home');
    toast.success(`تم التبديل إلى حساب ${res.data.name}`);
  };

  return (
    <BottomSheet visible={open} onClose={() => setOpen(false)} title="تغيير الحساب التجريبي" subtitle="بدّل بين الأدوار لتجربة سير العمل كاملاً — البيانات مشتركة في الذاكرة">
      <View style={{ gap: spacing.sm }}>
        {demoAccounts.map((acc, index) => {
          const m = members[acc.memberId];
          if (!m) return null;
          const active = m.id === currentUserId;
          const unread = notifications.filter((n) => n.recipientId === m.id && !n.read).length;
          const groupStart = index === 0 || demoAccounts[index - 1].group !== acc.group;
          return (
            <React.Fragment key={acc.memberId}>
            {groupStart ? (
              <AppText variant="captionMedium" color={colors.accentStrong} style={index > 0 ? { marginTop: spacing.sm } : undefined}>
                {DEMO_ACCOUNT_GROUP_LABELS[acc.group]}
              </AppText>
            ) : null}
            <PressableScale onPress={() => onSelect(m.id)} style={[styles.row, active && styles.rowActive]} accessibilityLabel={`التبديل إلى ${m.name}`}>
              <Avatar name={m.name} color={m.avatarColor} size={44} ring={active} />
              <View style={{ flex: 1, gap: 4 }}>
                <AppText variant="cardTitle" numberOfLines={2}>
                  {m.name}
                </AppText>
                <AppText variant="caption" color={colors.textSecondary} numberOfLines={1}>
                  {acc.label}
                </AppText>
                <RoleBadges member={m} />
                {unread > 0 ? <AppText variant="meta" color={colors.error}>{`${unread} إشعار جديد`}</AppText> : null}
              </View>
              {active ? (
                <View style={styles.check}>
                  <Check size={14} color={colors.white} strokeWidth={3} />
                </View>
              ) : null}
            </PressableScale>
            </React.Fragment>
          );
        })}
        <View style={styles.hint}>
          <RefreshCw size={14} color={colors.textSecondary} />
          <AppText variant="meta" color={colors.textSecondary} style={{ flex: 1 }}>
            كلمة المرور لجميع الحسابات التجريبية: 123456
          </AppText>
        </View>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.frostStrong,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rowActive: { borderColor: colors.accent, backgroundColor: colors.accentSoft },
  check: { width: 22, height: 22, borderRadius: 11, backgroundColor: colors.success, alignItems: 'center', justifyContent: 'center' },
  hint: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingTop: spacing.sm },
});

export default AccountSwitcher;
