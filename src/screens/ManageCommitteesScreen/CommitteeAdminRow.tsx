import React, { useMemo } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppText } from '@/components/common/AppText';
import { Card } from '@/components/common/Card';
import { PressableScale } from '@/components/common/PressableScale';
import { SwitchRow } from '@/components/forms/ChoiceChips';
import { FormField } from '@/components/forms/FormField';
import { FormSelect } from '@/components/forms/FormSelect';
import { isMemberRole, isSectorWide } from '@/features/auth/services/permissions';
import { rolesLabel } from '@/features/auth/services/roles';
import { CommitteeIcon } from '@/features/committees/components/CommitteeCard';
import { useCommitteeActions } from '@/features/committees/hooks/useCommittees';
import type { Committee } from '@/features/committees/types';
import { useMembers } from '@/features/members/hooks/useMembers';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useDialogs, useRunResult, useToast } from '@/hooks/useOverlays';
import { manageCommitteesCopy as copy } from './ManageCommitteesScreen.data';
import { createStyles, ROW_ICON_SIZE } from './ManageCommitteesScreen.styles';

/** One committee: enable / disable it and assign its officials. */
export function CommitteeAdminRow({ committee }: { committee: Committee }) {
  const router = useRouter();
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const toast = useToast();
  const { confirmDialog } = useDialogs();
  const runResult = useRunResult();
  const members = useMembers();
  const { toggleCommittee, setCommitteeOfficials } = useCommitteeActions();
  const officialIds = useMemo(() => members.filter((m) => m.managedCommitteeIds.includes(committee.id)).map((m) => m.id), [members, committee.id]);

  const eligible = useMemo(
    () =>
      members
        // Admin and sector secretary already cover every committee, so they aren't offered.
        .filter((m) => !isSectorWide(m) && m.status === 'active')
        .map((m) => ({
          value: m.id,
          label: m.name,
          description: m.managedCommitteeIds.includes(committee.id)
            ? copy.currentOfficial(rolesLabel(m))
            : m.committeeIds.includes(committee.id)
              ? copy.committeeMember
              : isMemberRole(m)
                ? copy.outsideCommittee
                : rolesLabel(m),
          avatarColor: m.avatarColor,
          rank: m.managedCommitteeIds.includes(committee.id) ? 0 : m.committeeIds.includes(committee.id) ? 1 : isMemberRole(m) ? 3 : 2,
        }))
        .sort((a, b) => a.rank - b.rank)
        .map(({ rank: _rank, ...o }) => o),
    [members, committee.id],
  );

  const onToggle = async () => {
    if (committee.enabled) {
      const ok = await confirmDialog({
        title: copy.disableConfirmTitle,
        message: copy.disableConfirmMessage,
        confirmLabel: copy.disableConfirmLabel,
        tone: 'danger',
      });
      if (!ok) return;
    }
    const res = toggleCommittee(committee.id);
    if (res.ok) toast.success(res.data ? copy.enabledToast : copy.disabledToast);
    else toast.error(res.error);
  };

  const onAssign = async (next: string[]) => {
    const added = next.filter((id) => !officialIds.includes(id));
    const removed = officialIds.filter((id) => !next.includes(id));
    if (!added.length && !removed.length) return;
    const names = (ids: string[]) => ids.map((id) => members.find((m) => m.id === id)?.name).filter(Boolean).join(copy.namesSeparator);
    const lines = [added.length ? copy.addedLine(names(added)) : null, removed.length ? copy.removedLine(names(removed)) : null].filter(Boolean).join('\n');
    const ok = await confirmDialog({
      title: copy.assignConfirmTitle,
      message: copy.assignConfirmMessage(lines, committee.name),
      confirmLabel: copy.assignConfirmLabel,
    });
    if (ok) runResult(setCommitteeOfficials(committee.id, next), copy.assignSuccess);
  };

  return (
    <Card style={!committee.enabled && styles.rowDisabled}>
      <PressableScale onPress={() => router.push(`/committee/${committee.id}`)} style={styles.head} scaleTo={0.99} accessibilityLabel={committee.name}>
        <CommitteeIcon committee={committee} size={ROW_ICON_SIZE} />
        <View style={styles.headText}>
          <AppText variant="cardTitle" numberOfLines={2}>
            {committee.name}
          </AppText>
          <AppText variant="meta" color={committee.enabled ? theme.colors.success : theme.colors.textSecondary}>
            {committee.enabled ? copy.enabled : copy.disabled}
          </AppText>
        </View>
      </PressableScale>
      <SwitchRow label={copy.showInDirectory} value={committee.enabled} onChange={onToggle} />
      <FormField label={copy.officialsLabel} hint={copy.officialsHint} style={styles.officialsField}>
        <FormSelect multiple options={eligible} value={officialIds} onChange={onAssign} placeholder={copy.officialsPlaceholder} title={copy.officialsTitle(committee.shortName)} searchable />
      </FormField>
    </Card>
  );
}
