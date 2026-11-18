import React from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ShieldAlert, UserRound } from 'lucide-react-native';
import { AppHeader, EmptyState, ScreenContainer } from '@/components';
import { MemberForm } from '@/features/members/MemberForm';
import { useAppStore, useUser } from '@/store';
import { isAdmin } from '@/utils/permissions';

export default function EditMemberScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const user = useUser();
  const member = useAppStore((s) => s.members.find((m) => m.id === id));
  const editDemoMember = useAppStore((s) => s.editDemoMember);

  if (!isAdmin(user)) {
    return (
      <ScreenContainer header={<AppHeader title="تعديل العضو" />}>
        <EmptyState icon={ShieldAlert} title="غير مصرح" message="تعديل بيانات الأعضاء وأدوارهم متاح لمدير النظام فقط (صلاحيات تجريبية)." />
      </ScreenContainer>
    );
  }
  if (!member) {
    return (
      <ScreenContainer header={<AppHeader title="تعديل العضو" />}>
        <EmptyState icon={UserRound} title="العضو غير موجود" actionLabel="العودة" onAction={() => (router.canGoBack() ? router.back() : router.replace('/members'))} />
      </ScreenContainer>
    );
  }

  return (
    <MemberForm
      mode="edit"
      initial={{
        name: member.name,
        title: member.title,
        role: member.role,
        // Committees they run are listed separately; keep only plain memberships here.
        committeeIds: member.committeeIds.filter((c) => !member.managedCommitteeIds.includes(c)),
        managedCommitteeIds: member.managedCommitteeIds,
        supervisedCommitteeIds: member.supervisedCommitteeIds,
        status: member.status,
        phone: member.phone,
        email: member.email,
      }}
      onSubmit={(v) => {
        const res = editDemoMember(member.id, {
          name: v.name,
          title: v.title,
          status: v.status,
          phone: v.phone || member.phone,
          email: v.email.trim() || member.email,
          role: v.role,
          committeeIds: v.committeeIds,
          managedCommitteeIds: v.managedCommitteeIds,
          supervisedCommitteeIds: v.supervisedCommitteeIds,
        });
        if (!res.ok) return { ok: false, error: res.error };
        return { ok: true, id: member.id };
      }}
    />
  );
}
