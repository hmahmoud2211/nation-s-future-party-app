import React, { useMemo } from 'react';
import { View } from 'react-native';
import { Lock, RotateCcw, ShieldAlert, ShieldCheck } from 'lucide-react-native';
import { AppText } from '@/components/common/AppText';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { EmptyState } from '@/components/feedback/States';
import { SwitchRow } from '@/components/forms/ChoiceChips';
import { AppHeader } from '@/components/layout/AppHeader';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { useUser } from '@/features/auth/hooks/useSession';
import { isAdmin } from '@/features/auth/services/permissions';
import { DemoNotice } from '@/features/settings/components/DemoNotice';
import { useSettings, useSettingsActions } from '@/features/settings/hooks/useSettings';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useDialogs, useToast } from '@/hooks/useOverlays';
import { settingsCopy as copy } from './SettingsScreen.data';
import { createStyles, RULE_ICON_SIZE } from './SettingsScreen.styles';

export function SettingsScreen() {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const toast = useToast();
  const { confirmDialog } = useDialogs();
  const user = useUser();
  const settings = useSettings();
  const { updateSettings, resetMockData } = useSettingsActions();

  if (!isAdmin(user)) {
    return (
      <ScreenContainer header={<AppHeader title={copy.title} />}>
        <EmptyState icon={ShieldAlert} title={copy.unauthorizedTitle} message={copy.unauthorizedMessage} />
      </ScreenContainer>
    );
  }

  const onReset = async () => {
    const ok = await confirmDialog({
      title: copy.resetConfirmTitle,
      message: copy.resetConfirmMessage,
      confirmLabel: copy.resetConfirmLabel,
      tone: 'danger',
    });
    if (!ok) return;
    resetMockData();
    toast.success(copy.resetSuccess);
  };

  return (
    <ScreenContainer header={<AppHeader title={copy.title} subtitle={copy.subtitle} />}>
      <View style={styles.content}>
        <View>
          <SectionHeader title={copy.permissionsTitle} icon={ShieldCheck} />
          <View style={styles.rule}>
            <Lock size={RULE_ICON_SIZE} color={theme.colors.primary} />
            <View style={styles.ruleText}>
              <AppText variant="cardTitle">{copy.permissionsRuleTitle}</AppText>
              <AppText variant="caption" color={theme.colors.textSecondary}>
                {copy.permissionsRuleBody}
              </AppText>
            </View>
          </View>
        </View>

        <View>
          <SectionHeader title={copy.displayTitle} />
          <Card>
            <SwitchRow
              label={copy.demoHintsLabel}
              description={copy.demoHintsDescription}
              value={settings.showDemoHints}
              onChange={(v) => {
                updateSettings({ showDemoHints: v });
                toast.success(v ? copy.demoHintsShown : copy.demoHintsHidden);
              }}
            />
          </Card>
        </View>

        <View style={styles.demoDataSection}>
          <SectionHeader title={copy.demoDataTitle} />
          <Button title={copy.resetButton} icon={RotateCcw} variant="dangerOutline" onPress={onReset} />
          <DemoNotice text={copy.demoNotice} />
        </View>
      </View>
    </ScreenContainer>
  );
}
