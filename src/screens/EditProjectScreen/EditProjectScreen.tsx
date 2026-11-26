import React from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FolderKanban } from 'lucide-react-native';
import { AppHeader } from '@/components/layout/AppHeader';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { EmptyState } from '@/components/feedback/States';
import { ProjectForm } from '@/features/projects/components/ProjectForm';
import { useProject } from '@/features/projects/hooks/useProjects';
import { useUser } from '@/features/auth/hooks/useSession';
import { canManageCommittee } from '@/features/auth/services/permissions';
import { editProjectCopy as copy } from './EditProjectScreen.data';

export function EditProjectScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const user = useUser();
  const project = useProject(id);

  if (!project || !canManageCommittee(user, project.committeeId)) {
    return (
      <ScreenContainer header={<AppHeader title={copy.title} />}>
        <EmptyState
          icon={FolderKanban}
          title={project ? copy.noPermission : copy.notFound}
          actionLabel={copy.back}
          onAction={() => router.back()}
        />
      </ScreenContainer>
    );
  }
  return <ProjectForm mode="edit" project={project} />;
}
