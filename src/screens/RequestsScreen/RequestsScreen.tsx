import React, { useMemo, useState } from 'react';
import { FlatList, View } from 'react-native';
import { useRouter } from 'expo-router';
import { FilePlus, Inbox } from 'lucide-react-native';
import { IconButton } from '@/components/common/IconButton';
import { EmptyState, LoadingState, useSimulatedLoading } from '@/components/feedback/States';
import { AppHeader } from '@/components/layout/AppHeader';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { type ChipOption, FilterChips, SegmentedTabs } from '@/components/ui/Chips';
import { useUser } from '@/features/auth/hooks/useSession';
import { canHandleRequest, isMemberRole } from '@/features/auth/services/permissions';
import { RequestCard } from '@/features/requests/components/RequestCard';
import { useRequests } from '@/features/requests/hooks/useRequests';
import type { RequestStatus } from '@/features/requests/types';
import { useAppTheme } from '@/hooks/useAppTheme';
import { requestsCopy as copy } from './RequestsScreen.data';
import { createStyles } from './RequestsScreen.styles';

type Box = 'mine' | 'inbox';
type StatusKey = 'all' | RequestStatus;

export function RequestsScreen() {
  const router = useRouter();
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const user = useUser();
  const requests = useRequests();
  const loading = useSimulatedLoading();
  const handlerRole = !isMemberRole(user);
  const [box, setBox] = useState<Box>(handlerRole ? 'inbox' : 'mine');
  const [status, setStatus] = useState<StatusKey>('all');

  const mine = useMemo(() => requests.filter((r) => r.authorId === user.id), [requests, user.id]);
  const inbox = useMemo(() => requests.filter((r) => r.authorId !== user.id && canHandleRequest(user, r)), [requests, user]);
  const base = handlerRole && box === 'inbox' ? inbox : mine;
  const visible = useMemo(
    () => (status === 'all' ? base : base.filter((r) => r.status === status)).slice().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    [base, status],
  );

  const statusOptions: ChipOption<StatusKey>[] = [
    { key: 'all', label: copy.allStatuses, count: base.length },
    ...(Object.keys(copy.statusLabels) as RequestStatus[]).map((k) => ({ key: k, label: copy.statusLabels[k], count: base.filter((r) => r.status === k).length })),
  ];

  const openNew = () => router.push('/requests/new');

  return (
    <ScreenContainer
      scroll={false}
      padded={false}
      header={
        <AppHeader
          title={copy.title}
          subtitle={handlerRole ? copy.handlerSubtitle(inbox.filter((r) => r.status === 'new').length) : copy.memberSubtitle}
          actions={<IconButton icon={FilePlus} variant="glass" accessibilityLabel={copy.newRequestA11y} onPress={openNew} />}
        />
      }
    >
      <FlatList
        data={loading ? [] : visible}
        keyExtractor={(r) => r.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.listHeader}>
            {handlerRole ? (
              <SegmentedTabs
                options={[
                  { key: 'inbox', label: copy.inboxTab, count: inbox.length },
                  { key: 'mine', label: copy.mineTab, count: mine.length },
                ]}
                value={box}
                onChange={(k) => {
                  setBox(k);
                  setStatus('all');
                }}
              />
            ) : null}
            <FilterChips options={statusOptions} value={status} onChange={setStatus} />
            {loading ? <LoadingState count={3} /> : null}
          </View>
        }
        ListEmptyComponent={
          loading ? undefined : (
            <EmptyState
              icon={Inbox}
              title={box === 'inbox' && handlerRole ? copy.emptyInbox : copy.empty}
              message={box === 'mine' || !handlerRole ? copy.mineEmptyMessage : copy.inboxEmptyMessage}
              actionLabel={box === 'mine' || !handlerRole ? copy.submitNew : undefined}
              onAction={box === 'mine' || !handlerRole ? openNew : undefined}
            />
          )
        }
        renderItem={({ item }) => <RequestCard request={item} showAuthor={box === 'inbox' && handlerRole} onPress={() => router.push(`/requests/${item.id}`)} />}
      />
    </ScreenContainer>
  );
}
