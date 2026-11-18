import React, { useMemo, useState } from 'react';
import { FlatList, View } from 'react-native';
import { useRouter } from 'expo-router';
import { FilePlus, Inbox } from 'lucide-react-native';
import {
  AppHeader,
  EmptyState,
  FilterChips,
  IconButton,
  LoadingState,
  RequestCard,
  ScreenContainer,
  SegmentedTabs,
  useSimulatedLoading,
  type ChipOption,
} from '@/components';
import { useAppStore, useUser } from '@/store';
import { GUTTER, spacing } from '@/theme';
import type { RequestStatus } from '@/types';
import { canHandleRequest, isMemberRole } from '@/utils/permissions';

type Box = 'mine' | 'inbox';
type StatusKey = 'all' | RequestStatus;

const STATUS_LABELS: Record<RequestStatus, string> = {
  new: 'جديد',
  under_review: 'قيد المراجعة',
  info_requested: 'مطلوب معلومات',
  resolved: 'تم الحل',
  closed: 'مغلق',
};

export default function RequestsScreen() {
  const router = useRouter();
  const user = useUser();
  const requests = useAppStore((s) => s.requests);
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
    { key: 'all', label: 'الكل', count: base.length },
    ...(Object.keys(STATUS_LABELS) as RequestStatus[]).map((k) => ({ key: k, label: STATUS_LABELS[k], count: base.filter((r) => r.status === k).length })),
  ];

  const openNew = () => router.push('/requests/new');

  return (
    <ScreenContainer
      scroll={false}
      padded={false}
      header={
        <AppHeader
          title="الطلبات الإدارية"
          subtitle={handlerRole ? `${inbox.filter((r) => r.status === 'new').length} طلبات جديدة واردة` : 'تابع طلباتك وردود الجهات المختصة'}
          actions={<IconButton icon={FilePlus} variant="glass" accessibilityLabel="طلب جديد" onPress={openNew} />}
        />
      }
    >
      <FlatList
        data={loading ? [] : visible}
        keyExtractor={(r) => r.id}
        contentContainerStyle={{ padding: GUTTER, gap: spacing.md, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={{ gap: spacing.md }}>
            {handlerRole ? (
              <SegmentedTabs
                options={[
                  { key: 'inbox', label: 'الواردة', count: inbox.length },
                  { key: 'mine', label: 'طلباتي', count: mine.length },
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
              title={box === 'inbox' && handlerRole ? 'لا توجد طلبات واردة' : 'لا توجد طلبات'}
              message={box === 'mine' || !handlerRole ? 'يمكنك تقديم طلب تحديث بيانات أو استفسار إداري أو طلب مستند.' : 'ستظهر هنا طلبات أعضاء اللجان ضمن نطاقك.'}
              actionLabel={box === 'mine' || !handlerRole ? 'تقديم طلب جديد' : undefined}
              onAction={box === 'mine' || !handlerRole ? openNew : undefined}
            />
          )
        }
        renderItem={({ item }) => <RequestCard request={item} showAuthor={box === 'inbox' && handlerRole} onPress={() => router.push(`/requests/${item.id}`)} />}
      />
    </ScreenContainer>
  );
}
