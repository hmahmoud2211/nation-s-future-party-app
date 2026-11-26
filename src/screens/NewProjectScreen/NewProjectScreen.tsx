import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { ProjectForm } from '@/features/projects/components/ProjectForm';

export function NewProjectScreen() {
  const { committeeId } = useLocalSearchParams<{ committeeId?: string }>();
  return <ProjectForm mode="new" defaultCommitteeId={committeeId} />;
}
