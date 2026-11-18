import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Landmark, Phone, UserRound } from 'lucide-react-native';
import {
  ActivityCard,
  AppHeader,
  AppText,
  Avatar,
  Card,
  DemoNotice,
  EmptyState,
  FormField,
  FormSelect,
  MemberCard,
  ProjectCard,
  ProposalCard,
  ScreenContainer,
  SectionHeader,
} from '@/components';
import { runResult } from '@/features/feedback/runResult';
import { useAppStore, useCommitteeMap, useUser } from '@/store';
import { colors, spacing } from '@/theme';
import { toArabicDigits } from '@/utils/format';
import { can, canViewGovernorate, canViewProposal } from '@/utils/permissions';

/** One governorate: coordinator, local secretaries/representatives, and work in that governorate. */
export default function GovernorateDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const user = useUser();
  const governorate = useAppStore((s) => s.governorates.find((g) => g.id === id));
  const members = useAppStore((s) => s.members);
  const contacts = useAppStore((s) => s.governorateContacts);
  const activities = useAppStore((s) => s.activities);
  const proposals = useAppStore((s) => s.proposals);
  const projects = useAppStore((s) => s.projects);
  const assignGovernorate = useAppStore((s) => s.assignGovernorate);
  const committees = useCommitteeMap();

  const data = useMemo(
    () => ({
      coordinator: members.find((m) => m.governorateIds.includes(id)),
      assistants: members.filter((m) => m.role === 'assistant_secretary' && m.status === 'active'),
      contacts: contacts.filter((c) => c.governorateId === id),
      activities: activities.filter((a) => a.governorateId === id).sort((a, b) => b.date.localeCompare(a.date)),
      proposals: proposals.filter((p) => p.governorateId === id && canViewProposal(user, p)),
      projects: projects.filter((p) => p.governorateId === id),
    }),
    [members, contacts, activities, proposals, projects, id, user],
  );

  if (!governorate || !canViewGovernorate(user, governorate.id)) {
    return (
      <ScreenContainer header={<AppHeader title="المحافظة" />}>
        <EmptyState icon={Landmark} title={governorate ? 'غير مصرح' : 'المحافظة غير موجودة'} message={governorate ? 'هذه المحافظة خارج نطاق إشرافك.' : undefined} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer header={<AppHeader title={governorate.name} eyebrow={governorate.region} />}>
      <SectionHeader title="الأمين المساعد المنسق" icon={UserRound} />
      {data.coordinator ? (
        <MemberCard member={data.coordinator} showStats={false} onPress={() => router.push(`/members/${data.coordinator?.id}`)} />
      ) : (
        <Card>
          <AppText variant="caption" color={colors.textSecondary}>
            لم تُسند المحافظة لأمين مساعد بعد.
          </AppText>
        </Card>
      )}
      {can(user, 'governorates.manage') ? (
        <FormField label="تغيير المنسق" style={{ marginTop: spacing.sm, marginBottom: 0 }}>
          <FormSelect
            options={data.assistants.map((m) => ({ value: m.id, label: m.name, avatarColor: m.avatarColor }))}
            value={data.coordinator?.id}
            onChange={(v) => runResult(assignGovernorate(governorate.id, v), v ? 'تم إسناد المحافظة' : 'تم إلغاء الإسناد')}
            title={`منسق ${governorate.name}`}
            placeholder="اختر الأمين المساعد"
            allowClear
          />
        </FormField>
      ) : null}

      <View style={styles.section}>
        <SectionHeader title="أمناء وممثلو المحافظة" count={data.contacts.length} />
        <View style={{ gap: spacing.sm }}>
          {data.contacts.map((c) => (
            <Card key={c.id}>
              <View style={styles.contactRow}>
                <Avatar name={c.name} size={38} />
                <View style={{ flex: 1 }}>
                  <AppText variant="cardTitle">{c.name}</AppText>
                  <AppText variant="meta" color={colors.goldDark}>
                    {c.title}
                  </AppText>
                </View>
              </View>
              <AppText variant="caption" color={colors.textSecondary} style={{ marginTop: spacing.sm }}>
                {c.responsibilities}
                {c.committeeId ? ` (${committees[c.committeeId]?.shortName ?? ''})` : ''}
              </AppText>
              <View style={styles.phone}>
                <Phone size={12} color={colors.textMuted} />
                <AppText variant="meta" color={colors.textMuted}>
                  {`${toArabicDigits(c.phone)} • رقم افتراضي`}
                </AppText>
              </View>
            </Card>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <SectionHeader title="أنشطة في المحافظة" count={data.activities.length} />
        {data.activities.length ? (
          <View style={{ gap: spacing.sm }}>
            {data.activities.map((a) => (
              <ActivityCard key={a.id} activity={a} onPress={() => router.push(`/activities/${a.id}`)} />
            ))}
          </View>
        ) : (
          <EmptyState compact title="لا توجد أنشطة مسجلة في المحافظة" />
        )}
      </View>

      <View style={styles.section}>
        <SectionHeader title="مقترحات تخص المحافظة" count={data.proposals.length} />
        {data.proposals.length ? (
          <View style={{ gap: spacing.sm }}>
            {data.proposals.map((p) => (
              <ProposalCard key={p.id} proposal={p} onPress={() => router.push(`/proposals/${p.id}`)} />
            ))}
          </View>
        ) : (
          <EmptyState compact title="لا توجد مقترحات" />
        )}
      </View>

      {data.projects.length ? (
        <View style={styles.section}>
          <SectionHeader title="مشروعات في المحافظة" count={data.projects.length} />
          <View style={{ gap: spacing.sm }}>
            {data.projects.map((p) => (
              <ProjectCard key={p.id} project={p} onPress={() => router.push(`/projects/${p.id}`)} />
            ))}
          </View>
        </View>
      ) : null}

      <DemoNotice style={styles.section} text="أسماء أمناء المحافظات وأرقامهم وتوزيع المحافظات بيانات تجريبية." />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: spacing.xl },
  contactRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  phone: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: spacing.xs },
});
