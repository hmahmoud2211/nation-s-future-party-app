import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bell, Repeat } from 'lucide-react-native';
import { AppText, Avatar, IconButton, PressableScale } from '@/components';
import { useUnreadCount, useUser } from '@/store';
import { useUIStore } from '@/store/uiStore';
import { colors, gradients, GUTTER, radius, spacing } from '@/theme';
import { firstName } from '@/utils/format';
import { rolesLabel } from '@/utils/roles';

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'صباح الخير';
  if (h < 18) return 'مرحباً';
  return 'مساء الخير';
}

/** Compact personalized header used by every dashboard. */
export function HomeHero({ subtitle }: { subtitle?: string }) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const user = useUser();
  const unread = useUnreadCount();
  const openSwitcher = useUIStore((s) => s.setAccountSwitcherOpen);

  return (
    <LinearGradient
      colors={gradients.navy as unknown as [string, string, ...string[]]}
      start={{ x: 1, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={[styles.hero, { paddingTop: insets.top + spacing.sm }]}
    >
      <View style={styles.top}>
        <PressableScale onPress={() => router.navigate('/more')} style={styles.userRow} accessibilityLabel="الملف الشخصي">
          <Avatar name={user.name} color={user.avatarColor} size={42} />
          <View style={{ flex: 1 }}>
            <AppText variant="meta" color={colors.goldLight}>
              {greeting()}
            </AppText>
            <AppText variant="sectionTitle" color={colors.white} numberOfLines={1}>
              {firstName(user.name)}
            </AppText>
          </View>
        </PressableScale>
        <IconButton icon={Bell} variant="glass" size={38} badge={unread} accessibilityLabel="الإشعارات" onPress={() => router.push('/notifications')} />
      </View>
      <View style={styles.metaRow}>
        <View style={styles.roleBadge}>
          <AppText variant="meta" color={colors.navy}>
            {rolesLabel(user)}
          </AppText>
        </View>
        {subtitle ? (
          <AppText variant="meta" color="rgba(255,255,255,0.75)" numberOfLines={1} style={{ flex: 1 }}>
            {subtitle}
          </AppText>
        ) : (
          <View style={{ flex: 1 }} />
        )}
        <PressableScale onPress={() => openSwitcher(true)} style={styles.switcher} accessibilityLabel="تغيير الحساب التجريبي" hitSlop={8}>
          <Repeat size={12} color={colors.goldLight} />
          <AppText variant="meta" color={colors.goldLight}>
            تبديل الحساب
          </AppText>
        </PressableScale>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  hero: {
    paddingHorizontal: GUTTER,
    paddingBottom: spacing.md,
    borderBottomStartRadius: radius.xl,
    borderBottomEndRadius: radius.xl,
  },
  top: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  userRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm + 2, flex: 1 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.sm },
  roleBadge: { backgroundColor: colors.goldLight, borderRadius: radius.pill, paddingHorizontal: spacing.sm, paddingVertical: 1 },
  switcher: { flexDirection: 'row', alignItems: 'center', gap: 4 },
});
