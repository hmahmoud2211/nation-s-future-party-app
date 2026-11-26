import React from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { CalendarDays } from 'lucide-react-native';
import { AppHeader } from '@/components/layout/AppHeader';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { EmptyState } from '@/components/feedback/States';
import { MeetingForm } from '@/features/meetings/components/MeetingForm';
import { useMeeting } from '@/features/meetings/hooks/useMeetings';
import { useUser } from '@/features/auth/hooks/useSession';
import { canManageMeeting } from '@/features/auth/services/permissions';
import { editMeetingCopy as copy } from './EditMeetingScreen.data';

export function EditMeetingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const user = useUser();
  const meeting = useMeeting(id);

  if (!meeting || !canManageMeeting(user, meeting) || meeting.status !== 'scheduled') {
    return (
      <ScreenContainer header={<AppHeader title={copy.title} />}>
        <EmptyState
          icon={CalendarDays}
          title={!meeting ? copy.notFound : meeting.status !== 'scheduled' ? copy.notEditable : copy.noPermission}
          actionLabel={copy.back}
          onAction={() => router.back()}
        />
      </ScreenContainer>
    );
  }
  return <MeetingForm mode="edit" meeting={meeting} />;
}
