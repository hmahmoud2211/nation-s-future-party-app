import React, { useMemo } from 'react';
import { View } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { AppText } from '@/components/common/AppText';
import { PressableScale } from '@/components/common/PressableScale';
import { useAppTheme } from '@/hooks/useAppTheme';
import { createStyles } from './MeetingCallScreen.styles';

type Props = { icon: LucideIcon; label: string; onPress: () => void; active?: boolean; danger?: boolean };

/** Round control button (mic / camera / participants / leave) in the call's bottom bar. */
export function CallControl({ icon: Icon, label, onPress, active, danger }: Props) {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  return (
    <PressableScale onPress={onPress} style={styles.control} accessibilityLabel={label} haptic>
      <View style={[styles.controlIcon, active && styles.controlActive, danger && styles.controlDanger]}>
        <Icon size={theme.sizes.icon.md} color={theme.colors.white} />
      </View>
      <AppText variant="meta" color={theme.colors.onPrimaryMuted} numberOfLines={1}>
        {label}
      </AppText>
    </PressableScale>
  );
}
