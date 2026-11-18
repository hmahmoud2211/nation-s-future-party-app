import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { CalendarPlus, FilePlus, FolderPlus, Lightbulb, Sparkles } from 'lucide-react-native';
import { AppText, QuickAction, QuickActionGrid } from '@/components';
import { useAppStore, useUser } from '@/store';
import { colors, radius, spacing } from '@/theme';
import type { Committee } from '@/types';
import { canManageCommittee, isAdmin, isCommitteeMember } from '@/utils/permissions';

/**
 * Committees a public list (projects) covers: the explicit `committeeId` param, otherwise every
 * enabled committee — committee work is transparent; only finance and management stay restricted.
 */
export function useListScope(committeeId?: string): string[] {
  const user = useUser();
  const committees = useAppStore((s) => s.committees);
  return useMemo(() => {
    if (committeeId) return [committeeId];
    return committees.filter((c) => c.enabled || isCommitteeMember(user, c.id)).map((c) => c.id);
  }, [committeeId, user, committees]);
}

/** Committees the current user may create records in (official → managed, admin → all enabled). */
export function useManageableCommittees(): Committee[] {
  const user = useUser();
  const committees = useAppStore((s) => s.committees);
  return useMemo(() => {
    if (isAdmin(user)) return committees.filter((c) => c.enabled);
    return committees.filter((c) => user.managedCommitteeIds.includes(c.id));
  }, [user, committees]);
}

/** Whether the "create" action should be offered on a list screen. */
export function useCanCreateIn(committeeId?: string): { canCreate: boolean; targetCommitteeId?: string } {
  const user = useUser();
  const manageable = useManageableCommittees();
  if (committeeId) return { canCreate: canManageCommittee(user, committeeId), targetCommitteeId: committeeId };
  return { canCreate: manageable.length > 0, targetCommitteeId: user.managedCommitteeIds[0] };
}

/** Management shortcut tiles for a committee (people responsible for it / admin only). */
export function ManagementActions({ committeeId }: { committeeId: string }) {
  const router = useRouter();
  return (
    <QuickActionGrid>
      <QuickAction label="تقديم مقترح" icon={Lightbulb} tone="gold" onPress={() => router.push(`/proposals/new?committeeId=${committeeId}`)} />
      <QuickAction label="نشاط جديد" icon={Sparkles} tone="purple" onPress={() => router.push(`/activities/new?committeeId=${committeeId}`)} />
      <QuickAction label="إضافة اجتماع" icon={CalendarPlus} tone="info" onPress={() => router.push(`/meetings/new?committeeId=${committeeId}`)} />
      <QuickAction label="إضافة مشروع" icon={FolderPlus} tone="success" onPress={() => router.push(`/projects/new?committeeId=${committeeId}`)} />
      <QuickAction label="تقرير جديد" icon={FilePlus} tone="warning" onPress={() => router.push(`/report/new?committeeId=${committeeId}`)} />
    </QuickActionGrid>
  );
}

/** Small boxed note (e.g. "management-only" hints). */
export function InlineNote({ text, tone = 'info' }: { text: string; tone?: 'info' | 'gold' }) {
  return (
    <View style={[styles.note, tone === 'gold' ? styles.noteGold : styles.noteInfo]}>
      <AppText variant="caption" color={tone === 'gold' ? colors.goldDark : colors.info}>
        {text}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  note: { borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderWidth: 1 },
  noteInfo: { backgroundColor: colors.infoSoft, borderColor: '#CFDDF8' },
  noteGold: { backgroundColor: colors.goldSoft, borderColor: colors.goldLight },
});
