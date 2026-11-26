import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { colors, spacing } from '@/theme';
import { AppText } from '@/components/common/AppText';

export interface FormFieldProps {
  label?: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

/** Label + control + inline Arabic error message. */
export function FormField({ label, required, error, hint, children, style }: FormFieldProps) {
  return (
    <View style={[styles.field, style]}>
      {label ? (
        <AppText variant="label" style={styles.label}>
          {label}
          {required ? <AppText variant="label" color={colors.error}>{' *'}</AppText> : null}
        </AppText>
      ) : null}
      {children}
      {error ? (
        <AppText variant="caption" color={colors.error} style={styles.msg} accessibilityLiveRegion="polite">
          {error}
        </AppText>
      ) : hint ? (
        <AppText variant="meta" color={colors.textSecondary} style={styles.msg}>
          {hint}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { marginBottom: spacing.lg },
  label: { marginBottom: spacing.xs + 2, color: colors.text },
  msg: { marginTop: spacing.xs },
});

export default FormField;
