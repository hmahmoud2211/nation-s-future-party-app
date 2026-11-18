import React, { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Building2, Plus, ShieldAlert } from 'lucide-react-native';
import {
  AppHeader,
  AppInput,
  AppText,
  BottomSheet,
  Button,
  Card,
  ChoiceChips,
  CommitteeIcon,
  EmptyState,
  FormField,
  FormSelect,
  IconButton,
  PressableScale,
  ScreenContainer,
  SwitchRow,
  TextArea,
} from '@/components';
import { COMMITTEE_ICON_LABELS } from '@/constants/icons';
import { runResult } from '@/features/feedback/runResult';
import { useAppStore, useUser } from '@/store';
import { confirmDialog, toast } from '@/store/uiStore';
import { colors, radius, spacing } from '@/theme';
import type { Committee, CommitteeIconKey } from '@/types';
import { isAdmin, isMemberRole, isSectorWide } from '@/utils/permissions';
import { rolesLabel } from '@/utils/roles';

const COLORS = ['#0B2B68', '#3D4FB0', '#2E6B5B', '#9E3D5A', '#B5782A', '#1F5A8A', '#5B4A2E', '#3E8A4A'];

function CommitteeAdminRow({ committee }: { committee: Committee }) {
  const router = useRouter();
  const members = useAppStore((s) => s.members);
  const toggleCommittee = useAppStore((s) => s.toggleCommittee);
  const setCommitteeOfficials = useAppStore((s) => s.setCommitteeOfficials);
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
            ? `مسؤول حالي • ${rolesLabel(m)}`
            : m.committeeIds.includes(committee.id)
              ? 'عضو في اللجنة'
              : isMemberRole(m)
                ? 'من خارج اللجنة'
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
        title: 'تعطيل اللجنة؟',
        message: 'ستظهر اللجنة كمعطلة في الدليل. يمكن إعادة تفعيلها في أي وقت.',
        confirmLabel: 'تعطيل',
        tone: 'danger',
      });
      if (!ok) return;
    }
    const res = toggleCommittee(committee.id);
    if (res.ok) toast.success(res.data ? 'تم تفعيل اللجنة' : 'تم تعطيل اللجنة');
    else toast.error(res.error);
  };

  const onAssign = async (next: string[]) => {
    const added = next.filter((id) => !officialIds.includes(id));
    const removed = officialIds.filter((id) => !next.includes(id));
    if (!added.length && !removed.length) return;
    const names = (ids: string[]) => ids.map((id) => members.find((m) => m.id === id)?.name).filter(Boolean).join('، ');
    const lines = [added.length ? `إضافة: ${names(added)}` : null, removed.length ? `إزالة: ${names(removed)}` : null].filter(Boolean).join('\n');
    const ok = await confirmDialog({
      title: 'تحديث مسؤولي اللجنة',
      message: `${lines}\n\nتُمنح صلاحيات إدارة ${committee.name} لكل المسؤولين المختارين، مع احتفاظ كل منهم بأدواره الأخرى (محاكاة).`,
      confirmLabel: 'حفظ',
    });
    if (ok) runResult(setCommitteeOfficials(committee.id, next), 'تم تحديث مسؤولي اللجنة');
  };

  return (
    <Card style={!committee.enabled && { opacity: 0.75 }}>
      <PressableScale onPress={() => router.push(`/committee/${committee.id}`)} style={styles.head} scaleTo={0.99} accessibilityLabel={committee.name}>
        <CommitteeIcon committee={committee} size={42} />
        <View style={{ flex: 1 }}>
          <AppText variant="cardTitle" numberOfLines={2}>
            {committee.name}
          </AppText>
          <AppText variant="meta" color={committee.enabled ? colors.success : colors.textSecondary}>
            {committee.enabled ? 'مفعّلة' : 'معطلة'}
          </AppText>
        </View>
      </PressableScale>
      <SwitchRow label="إظهار اللجنة في الدليل" value={committee.enabled} onChange={onToggle} />
      <FormField label="مسؤولو اللجنة" hint="يمكن تعيين أكثر من مسؤول للجنة الواحدة" style={{ marginBottom: 0 }}>
        <FormSelect multiple options={eligible} value={officialIds} onChange={onAssign} placeholder="تعيين مسؤولين" title={`مسؤولو ${committee.shortName}`} searchable />
      </FormField>
    </Card>
  );
}

export default function AdminCommitteesScreen() {
  const user = useUser();
  const committees = useAppStore((s) => s.committees);
  const createCommittee = useAppStore((s) => s.createCommittee);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [shortName, setShortName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState<CommitteeIconKey>('investment');
  const [color, setColor] = useState(COLORS[0]);
  const [error, setError] = useState<string | null>(null);

  if (!isAdmin(user)) {
    return (
      <ScreenContainer header={<AppHeader title="إدارة اللجان" />}>
        <EmptyState icon={ShieldAlert} title="غير مصرح" message="إدارة اللجان متاحة لمدير النظام فقط." />
      </ScreenContainer>
    );
  }

  const enabledCount = committees.filter((c) => c.enabled).length;

  const submit = () => {
    if (!name.trim()) {
      setError('يرجى إدخال اسم اللجنة');
      toast.error('يرجى استكمال البيانات المطلوبة');
      return;
    }
    const res = createCommittee({ name, shortName, description, icon, color });
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    toast.success('تمت إضافة اللجنة بنجاح');
    setOpen(false);
    setName('');
    setShortName('');
    setDescription('');
    setError(null);
  };

  return (
    <ScreenContainer
      header={
        <AppHeader
          title="إدارة اللجان"
          subtitle={`${enabledCount} لجنة مفعّلة من ${committees.length}`}
          actions={<IconButton icon={Plus} variant="glass" accessibilityLabel="إضافة لجنة" onPress={() => setOpen(true)} />}
        />
      }
    >
      <View style={{ gap: spacing.md }}>
        {committees.map((c) => (
          <CommitteeAdminRow key={c.id} committee={c} />
        ))}
        <Button title="إضافة لجنة جديدة" icon={Building2} variant="secondary" onPress={() => setOpen(true)} />
      </View>

      <BottomSheet
        visible={open}
        onClose={() => setOpen(false)}
        title="إضافة لجنة جديدة"
        footer={<Button title="حفظ اللجنة" onPress={submit} fullWidth />}
      >
        <FormField label="اسم اللجنة" required error={error ?? undefined}>
          <AppInput
            value={name}
            onChangeText={(t) => {
              setName(t);
              if (error) setError(null);
            }}
            placeholder="مثال: لجنة الصادرات"
            error={!!error}
          />
        </FormField>
        <FormField label="الاسم المختصر">
          <AppInput value={shortName} onChangeText={setShortName} placeholder="مثال: الصادرات" />
        </FormField>
        <FormField label="الوصف">
          <TextArea value={description} onChangeText={setDescription} placeholder="نبذة عن مهام اللجنة…" />
        </FormField>
        <FormField label="الأيقونة">
          <ChoiceChips
            options={(Object.keys(COMMITTEE_ICON_LABELS) as CommitteeIconKey[]).map((k) => ({ value: k, label: COMMITTEE_ICON_LABELS[k] }))}
            value={icon}
            onChange={setIcon}
            columns={3}
          />
        </FormField>
        <FormField label="اللون">
          <View style={styles.colors}>
            {COLORS.map((c) => (
              <PressableScale key={c} onPress={() => setColor(c)} style={[styles.swatch, { backgroundColor: c }, color === c && styles.swatchOn]} accessibilityLabel="اختيار اللون" />
            ))}
          </View>
        </FormField>
        <View style={styles.preview}>
          <CommitteeIcon committee={{ icon, color }} size={44} />
          <AppText variant="cardTitle" style={{ flex: 1 }}>
            {name || 'معاينة اللجنة'}
          </AppText>
        </View>
      </BottomSheet>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.xs },
  colors: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  swatch: { width: 36, height: 36, borderRadius: 18, borderWidth: 3, borderColor: colors.white },
  swatchOn: { borderColor: colors.gold },
  preview: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md, backgroundColor: colors.white, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border },
});
