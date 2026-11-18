import React from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { CalendarDays } from 'lucide-react-native';
import { AppHeader, EmptyState, ScreenContainer } from '@/components';
import { MeetingForm } from '@/features/meetings/MeetingForm';
import { useAppStore, useUser } from '@/store';
import { canManageMeeting } from '@/utils/permissions';

export default function EditMeetingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const user = useUser();
  const meeting = useAppStore((s) => s.meetings.find((m) => m.id === id));

  if (!meeting || !canManageMeeting(user, meeting) || meeting.status !== 'scheduled') {
    return (
      <ScreenContainer header={<AppHeader title="تعديل الاجتماع" />}>
        <EmptyState
          icon={CalendarDays}
          title={!meeting ? 'الاجتماع غير موجود' : meeting.status !== 'scheduled' ? 'لا يمكن تعديل اجتماع منعقد أو ملغي' : 'ليست لديك صلاحية تعديل هذا الاجتماع'}
          actionLabel="رجوع"
          onAction={() => router.back()}
        />
      </ScreenContainer>
    );
  }
  return <MeetingForm mode="edit" meeting={meeting} />;
}
