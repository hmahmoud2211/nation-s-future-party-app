import React from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FolderKanban } from 'lucide-react-native';
import { AppHeader, EmptyState, ScreenContainer } from '@/components';
import { ProjectForm } from '@/features/projects/ProjectForm';
import { useAppStore, useUser } from '@/store';
import { canManageCommittee } from '@/utils/permissions';

export default function EditProjectScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const user = useUser();
  const project = useAppStore((s) => s.projects.find((p) => p.id === id));

  if (!project || !canManageCommittee(user, project.committeeId)) {
    return (
      <ScreenContainer header={<AppHeader title="تعديل المشروع" />}>
        <EmptyState
          icon={FolderKanban}
          title={project ? 'ليست لديك صلاحية تعديل هذا المشروع' : 'المشروع غير موجود'}
          actionLabel="رجوع"
          onAction={() => router.back()}
        />
      </ScreenContainer>
    );
  }
  return <ProjectForm mode="edit" project={project} />;
}
