import React, { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, Landmark, MapPin, ShieldAlert } from 'lucide-react-native';
import { AppHeader, AppText, Card, DemoNotice, EmptyState, PressableScale, ScreenContainer, SearchInput, SectionHeader } from '@/components';
import { useAppStore, useUser } from '@/store';
import { colors, radius, spacing } from '@/theme';
import { shortName } from '@/utils/format';
import { can, canViewGovernorate, hasGovernorates } from '@/utils/permissions';

/** «المحافظات» — assistant secretaries see their governorates; الأمين/admin see all. */
export default function GovernoratesScreen() {
  const router = useRouter();
  const user = useUser();
  const governorates = useAppStore((s) => s.governorates);
  const members = useAppStore((s) => s.members);
  const activities = useAppStore((s) => s.activities);
  const proposals = useAppStore((s) => s.proposals);
  const projects = useAppStore((s) => s.projects);
  const [query, setQuery] = useState('');

  const visible = useMemo(() => governorates.filter((g) => canViewGovernorate(user, g.id) && (!query.trim() || g.name.includes(query.trim()))), [governorates, user, query]);
  const regions = useMemo(() => Array.from(new Set(visible.map((g) => g.region))), [visible]);
  const coordinatorOf = (gid: string) => members.find((m) => m.governorateIds.includes(gid));

  if (!hasGovernorates(user) && !can(user, 'governorates.viewAll')) {
    return (
      <ScreenContainer header={<AppHeader title="المحافظات" />}>
        <EmptyState icon={ShieldAlert} title="غير مصرح" message="متابعة المحافظات متاحة للأمناء المساعدين والأمين." />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer header={<AppHeader title={hasGovernorates(user) ? 'محافظاتي' : 'المحافظات'} subtitle="أمناء المحافظات وأنشطتها ومقترحاتها" />}>
      {can(user, 'governorates.viewAll') ? <SearchInput value={query} onChangeText={setQuery} placeholder="ابحث باسم المحافظة…" /> : null}
      {visible.length === 0 ? (
        <Card style={{ marginTop: spacing.md }}>
          <EmptyState compact icon={MapPin} title="لا توجد محافظات مسندة إليك" message="يسند مدير النظام المحافظات إلى الأمناء المساعدين." />
        </Card>
      ) : null}
      {regions.map((region) => (
        <View key={region} style={styles.section}>
          <SectionHeader title={region} />
          <Card padded={false}>
            {visible
              .filter((g) => g.region === region)
              .map((g, i, arr) => {
                const coordinator = coordinatorOf(g.id);
                const counts = [
                  activities.filter((a) => a.governorateId === g.id).length,
                  proposals.filter((p) => p.governorateId === g.id).length,
                  projects.filter((p) => p.governorateId === g.id).length,
                ];
                return (
                  <PressableScale key={g.id} onPress={() => router.push(`/governorates/${g.id}`)} style={[styles.row, i < arr.length - 1 && styles.border]} accessibilityLabel={g.name}>
                    <View style={styles.icon}>
                      <Landmark size={16} color={colors.navy2} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <AppText variant="bodyMedium">{g.name}</AppText>
                      <AppText variant="meta" color={colors.textSecondary} numberOfLines={1}>
                        {[
                          coordinator ? `المنسق: ${shortName(coordinator.name)}` : 'لم يُسند لأمين مساعد',
                          counts[0] ? `${counts[0]} أنشطة` : null,
                          counts[1] ? `${counts[1]} مقترحات` : null,
                          counts[2] ? `${counts[2]} مشروعات` : null,
                        ]
                          .filter(Boolean)
                          .join(' • ')}
                      </AppText>
                    </View>
                    <ChevronLeft size={16} color={colors.textMuted} />
                  </PressableScale>
                );
              })}
          </Card>
        </View>
      ))}
      <DemoNotice style={styles.section} text="توزيع المحافظات على الأمناء المساعدين وأسماء أمناء المحافظات بيانات تجريبية للعرض." />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: spacing.lg },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm + 2, paddingHorizontal: spacing.md, paddingVertical: spacing.sm + 2 },
  border: { borderBottomWidth: 1, borderBottomColor: colors.border },
  icon: { width: 32, height: 32, borderRadius: radius.sm, backgroundColor: colors.navyTint, alignItems: 'center', justifyContent: 'center' },
});
