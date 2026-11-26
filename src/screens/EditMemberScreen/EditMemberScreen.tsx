import React from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ShieldAlert, UserRound } from 'lucide-react-native';
import { AppHeader } from '@/components/layout/AppHeader';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { EmptyState } from '@/components/feedback/States';
import { MemberForm } from '@/features/members/components/MemberForm';
import { useUser } from '@/features/auth/hooks/useSession';
import { isAdmin } from '@/features/auth/services/permissions';
import { useMember, useMemberActions } from '@/features/members/hooks/useMembers';
import { editMemberCopy as copy } from './EditMemberScreen.data';

export function EditMemberScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const user = useUser();
  const member = useMember(id);
  const { editDemoMember } = useMemberActions();

  if (!isAdmin(user)) {
    return (
      <ScreenContainer header={<AppHeader title={copy.title} />}>
        <EmptyState icon={ShieldAlert} title={copy.unauthorizedTitle} message={copy.unauthorizedMessage} />
      </ScreenContainer>
    );
  }
  if (!member) {
    return (
      <ScreenContainer header={<AppHeader title={copy.title} />}>
        <EmptyState icon={UserRound} title={copy.notFoundTitle} actionLabel={copy.back} onAction={() => (router.canGoBack() ? router.back() : router.replace('/members'))} />
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
