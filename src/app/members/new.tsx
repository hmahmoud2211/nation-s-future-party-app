import React from 'react';
import { ShieldAlert } from 'lucide-react-native';
import { AppHeader, EmptyState, ScreenContainer } from '@/components';
import { MemberForm } from '@/features/members/MemberForm';
import { useAppStore, useUser } from '@/store';
import { isAdmin } from '@/utils/permissions';

export default function NewMemberScreen() {
  const user = useUser();
  const createDemoMember = useAppStore((s) => s.createDemoMember);

  if (!isAdmin(user)) {
    return (
      <ScreenContainer header={<AppHeader title="إضافة عضو" />}>
        <EmptyState icon={ShieldAlert} title="غير مصرح" message="إدارة الأعضاء متاحة لمدير النظام فقط (صلاحيات تجريبية)." />
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
