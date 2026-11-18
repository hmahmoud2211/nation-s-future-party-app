import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { MeetingForm } from '@/features/meetings/MeetingForm';

export default function NewMeetingScreen() {
  const { committeeId } = useLocalSearchParams<{ committeeId?: string }>();
  return <MeetingForm mode="new" defaultCommitteeId={committeeId} />;
}
