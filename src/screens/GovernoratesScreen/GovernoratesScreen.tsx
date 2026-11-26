import React, { useMemo, useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, Landmark, MapPin, ShieldAlert } from 'lucide-react-native';
import { AppHeader } from '@/components/layout/AppHeader';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { AppText } from '@/components/common/AppText';
import { Card } from '@/components/common/Card';
import { PressableScale } from '@/components/common/PressableScale';
import { SearchInput } from '@/components/forms/SearchInput';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { EmptyState } from '@/components/feedback/States';
import { DemoNotice } from '@/features/settings/components/DemoNotice';
import { useActivities } from '@/features/activities/hooks/useActivities';
import { useUser } from '@/features/auth/hooks/useSession';
import { useGovernorates } from '@/features/governorates/hooks/useGovernorates';
import { useMembers } from '@/features/members/hooks/useMembers';
import { useProjects } from '@/features/projects/hooks/useProjects';
import { useProposals } from '@/features/proposals/hooks/useProposals';
import { useAppTheme } from '@/hooks/useAppTheme';
import { shortName } from '@/utils/format';
import { can, canViewGovernorate, hasGovernorates } from '@/features/auth/services/permissions';
import { createStyles } from './GovernoratesScreen.styles';
import { governoratesCopy as copy } from './GovernoratesScreen.data';

/** «المحافظات» — assistant secretaries see their governorates; الأمين/admin see all. */
export function GovernoratesScreen() {
  const router = useRouter();
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const user = useUser();
  const governorates = useGovernorates();
  const members = useMembers();
  const activities = useActivities();
  const proposals = useProposals();
  const projects = useProjects();
  const [query, setQuery] = useState('');

  const visible = useMemo(() => governorates.filter((g) => canViewGovernorate(user, g.id) && (!query.trim() || g.name.includes(query.trim()))), [governorates, user, query]);
  const regions = useMemo(() => Array.from(new Set(visible.map((g) => g.region))), [visible]);
  const coordinatorOf = (gid: string) => members.find((m) => m.governorateIds.includes(gid));

  if (!hasGovernorates(user) && !can(user, 'governorates.viewAll')) {
    return (
      <ScreenContainer header={<AppHeader title={copy.title} />}>
        <EmptyState icon={ShieldAlert} title={copy.unauthorizedTitle} message={copy.unauthorizedMessage} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer header={<AppHeader title={hasGovernorates(user) ? copy.myTitle : copy.title} subtitle={copy.subtitle} />}>
      {can(user, 'governorates.viewAll') ? <SearchInput value={query} onChangeText={setQuery} placeholder={copy.searchPlaceholder} /> : null}
      {visible.length === 0 ? (
        <Card style={styles.emptyCard}>
          <EmptyState compact icon={MapPin} title={copy.emptyTitle} message={copy.emptyMessage} />
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
                      <Landmark size={theme.sizes.icon.sm} color={theme.colors.primary} />
                    </View>
                    <View style={styles.rowText}>
                      <AppText variant="bodyMedium">{g.name}</AppText>
                      <AppText variant="meta" color={theme.colors.textSecondary} numberOfLines={1}>
                        {[
                          coordinator ? copy.coordinator(shortName(coordinator.name)) : copy.noCoordinator,
                          counts[0] ? copy.activitiesCount(counts[0]) : null,
                          counts[1] ? copy.proposalsCount(counts[1]) : null,
                          counts[2] ? copy.projectsCount(counts[2]) : null,
                        ]
                          .filter(Boolean)
                          .join(copy.metaSeparator)}
                      </AppText>
                    </View>
                    <ChevronLeft size={theme.sizes.icon.sm} color={theme.colors.textMuted} />
                  </PressableScale>
                );
              })}
          </Card>
        </View>
      ))}
      <DemoNotice style={styles.section} text={copy.demoNotice} />
    </ScreenContainer>
  );
}
