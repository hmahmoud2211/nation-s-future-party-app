import React from 'react';
import { ShieldAlert } from 'lucide-react-native';
import { AppHeader } from '@/components/layout/AppHeader';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { EmptyState } from '@/components/feedback/States';
import { MemberForm } from '@/features/members/components/MemberForm';
import { useUser } from '@/features/auth/hooks/useSession';
import { isAdmin } from '@/features/auth/services/permissions';
import { useMemberActions } from '@/features/members/hooks/useMembers';
import { newMemberCopy as copy } from './NewMemberScreen.data';

export function NewMemberScreen() {
  const user = useUser();
  const { createDemoMember } = useMemberActions();

  if (!isAdmin(user)) {
    return (
      <ScreenContainer header={<AppHeader title={copy.title} />}>
        <EmptyState icon={ShieldAlert} title={copy.unauthorizedTitle} message={copy.unauthorizedMessage} />
      </ScreenContainer>
    );
  }

  return (
    <MemberForm
      mode="create"
      initial={{}}
      onSubmit={(v) => {
        const res = createDemoMember({
          name: v.name,
          title: v.title,
          role: v.role,
          committeeIds: v.committeeIds,
          managedCommitteeIds: v.managedCommitteeIds,
          supervisedCommitteeIds: v.supervisedCommitteeIds,
          status: v.status,
          phone: v.phone || undefined,
          email: v.email.trim() || undefined,
        });
        if (!res.ok) return { ok: false, error: res.error };
        return { ok: true, id: res.data.id };
      }}
    />
  );
}
