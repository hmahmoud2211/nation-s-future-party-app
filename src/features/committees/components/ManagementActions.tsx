import React from 'react';
import { useRouter } from 'expo-router';
import { CalendarPlus, FilePlus, FolderPlus, Lightbulb, Sparkles } from 'lucide-react-native';
import { QuickAction, QuickActionGrid } from '@/components/ui/StatCard';

/** Management shortcut tiles for a committee (people responsible for it / admin only). */
export function ManagementActions({ committeeId }: { committeeId: string }) {
  const router = useRouter();
  return (
    <QuickActionGrid>
      <QuickAction label="تقديم مقترح" icon={Lightbulb} onPress={() => router.push(`/proposals/new?committeeId=${committeeId}`)} />
      <QuickAction label="نشاط جديد" icon={Sparkles} onPress={() => router.push(`/activities/new?committeeId=${committeeId}`)} />
      <QuickAction label="إضافة اجتماع" icon={CalendarPlus} onPress={() => router.push(`/meetings/new?committeeId=${committeeId}`)} />
      <QuickAction label="إضافة مشروع" icon={FolderPlus} onPress={() => router.push(`/projects/new?committeeId=${committeeId}`)} />
      <QuickAction label="تقرير جديد" icon={FilePlus} onPress={() => router.push(`/report/new?committeeId=${committeeId}`)} />
    </QuickActionGrid>
  );
}
