import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Lock, RotateCcw, ShieldAlert, ShieldCheck } from 'lucide-react-native';
import { AppHeader, AppText, Button, Card, DemoNotice, EmptyState, ScreenContainer, SectionHeader, SwitchRow } from '@/components';
import { useAppStore, useUser } from '@/store';
import { confirmDialog, toast } from '@/store/uiStore';
import { colors, radius, spacing } from '@/theme';
import { isAdmin } from '@/utils/permissions';

export default function AdminSettingsScreen() {
  const user = useUser();
  const settings = useAppStore((s) => s.settings);
  const updateSettings = useAppStore((s) => s.updateSettings);
  const resetMockData = useAppStore((s) => s.resetMockData);

  if (!isAdmin(user)) {
    return (
      <ScreenContainer header={<AppHeader title="الإعدادات" />}>
        <EmptyState icon={ShieldAlert} title="غير مصرح" message="إعدادات النظام متاحة لمدير النظام فقط." />
      </ScreenContainer>
    );
  }

  const onReset = async () => {
    const ok = await confirmDialog({
      title: 'إعادة تعيين جميع البيانات؟',
      message: 'سيتم حذف كل التغييرات والعودة للبيانات التجريبية الأولية. لا يمكن التراجع.',
      confirmLabel: 'إعادة التعيين',
      tone: 'danger',
    });
    if (!ok) return;
    resetMockData();
    toast.success('تمت إعادة تعيين البيانات التجريبية');
  };

  return (
    <ScreenContainer header={<AppHeader title="الإعدادات" subtitle="إعدادات العرض والبيانات التجريبية" />}>
      <View style={{ gap: spacing.xl }}>
        <View>
          <SectionHeader title="الصلاحيات" icon={ShieldCheck} />
          <View style={styles.rule}>
            <Lock size={18} color={colors.navy2} />
            <View style={{ flex: 1 }}>
              <AppText variant="cardTitle">مصفوفة صلاحيات مركزية</AppText>
              <AppText variant="caption" color={colors.textSecondary}>
                الأمين يرى كل اللجان والبيانات المالية ويبت في المقترحات. الأمين المساعد يتابع المحافظات المسندة إليه. مسؤول اللجنة صلاحية تُضاف لأي شخص لتقديم مقترحات لجنته وإدارة أنشطتها.
              </AppText>
            </View>
          </View>
        </View>

        <View>
          <SectionHeader title="العرض" />
          <Card>
            <SwitchRow
              label="إظهار تنبيهات النسخة التجريبية"
              description="عرض ملاحظات توضح أن الإجراءات محاكاة وأن البيانات وهمية"
              value={settings.showDemoHints}
              onChange={(v) => {
                updateSettings({ showDemoHints: v });
                toast.success(v ? 'تم إظهار التنبيهات التجريبية' : 'تم إخفاء التنبيهات التجريبية');
              }}
            />
          </Card>
        </View>

        <View style={{ gap: spacing.sm }}>
          <SectionHeader title="البيانات التجريبية" />
          <Button title="إعادة تعيين جميع البيانات" icon={RotateCcw} variant="dangerOutline" onPress={onReset} />
          <DemoNotice text="الصلاحيات في هذه النسخة محاكاة على الواجهة فقط وليست حماية أمنية حقيقية." />
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  rule: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.navyTint,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
