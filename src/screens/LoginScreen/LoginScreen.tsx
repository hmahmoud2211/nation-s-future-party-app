import React, { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { zodResolver } from '@hookform/resolvers/zod';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronDown, ChevronUp, Eye, EyeOff, Lock, LogIn, Phone } from 'lucide-react-native';
import { z } from 'zod';
import { AppText } from '@/components/common/AppText';
import { Avatar } from '@/components/common/Avatar';
import { BrandMark } from '@/components/common/BrandMark';
import { Button } from '@/components/common/Button';
import { PressableScale } from '@/components/common/PressableScale';
import { AppInput } from '@/components/forms/AppInput';
import { FormField } from '@/components/forms/FormField';
import { DEMO_ACCOUNT_GROUP_LABELS, demoAccounts } from '@/data';
import { useAuthActions } from '@/features/auth/hooks/useSession';
import type { DemoAccountGroup } from '@/features/auth/types';
import { RoleBadges } from '@/features/members/components/RoleBadges';
import { useMemberMap } from '@/features/members/hooks/useMembers';
import { DemoNotice } from '@/features/settings/components/DemoNotice';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useToast } from '@/hooks/useOverlays';
import { toWesternDigits } from '@/utils/format';
import { loginCopy as copy } from './LoginScreen.data';
import { ACCOUNT_AVATAR_SIZE, BRAND_MARK_SIZE, createStyles, TOGGLE_ICON_SIZE } from './LoginScreen.styles';

const ACCOUNT_GROUPS = Object.keys(DEMO_ACCOUNT_GROUP_LABELS) as DemoAccountGroup[];

const schema = z.object({
  phone: z
    .string()
    .min(1, copy.phoneRequired)
    .transform((v) => toWesternDigits(v).replace(/\s|-/g, ''))
    .refine((v) => /^01\d{9}$/.test(v), copy.phoneInvalid),
  password: z.string().min(1, copy.passwordRequired).min(6, copy.passwordTooShort),
});

type FormInput = z.input<typeof schema>;
type FormOutput = z.output<typeof schema>;

export function LoginScreen() {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { loginDemoUser: login } = useAuthActions();
  const members = useMemberMap();
  const toast = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showAccounts, setShowAccounts] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const { control, handleSubmit, setValue, formState } = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(schema),
    defaultValues: { phone: '', password: '' },
  });

  const doLogin = (phone: string, password: string) => {
    setSubmitting(true);
    // Small artificial delay to simulate a request (no network involved).
    setTimeout(() => {
      const res = login(phone, password);
      setSubmitting(false);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success(copy.welcome(res.data.name.split(' ')[0]));
      router.replace('/home');
    }, 450);
  };

  const onSubmit = handleSubmit((values) => doLogin(values.phone, values.password), () => toast.error(copy.formIncomplete));

  return (
    <View style={styles.root}>
      <LinearGradient colors={theme.gradients.header as unknown as [string, string, ...string[]]} style={StyleSheet.absoluteFill} start={{ x: 1, y: 0 }} end={{ x: 0, y: 1 }} />
      <View pointerEvents="none" style={styles.ring1} />
      <View pointerEvents="none" style={styles.ring2} />
      <KeyboardAvoidingView style={styles.keyboard} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingTop: insets.top + theme.spacing.xxl, paddingBottom: insets.bottom + theme.spacing.xxl }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View entering={FadeInUp.duration(theme.motion.duration.intro)} style={styles.brand}>
            <BrandMark size={BRAND_MARK_SIZE} />
            <AppText variant="display" color={theme.colors.white} align="center" style={styles.brandTitle}>
              {copy.brandTitle}
            </AppText>
            <AppText variant="body" color={theme.colors.accentLight} align="center">
              {copy.brandSubtitle}
            </AppText>
            <AppText variant="caption" color={theme.colors.onPrimaryMuted} align="center" style={styles.brandIntro}>
              {copy.intro}
            </AppText>
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(theme.motion.duration.intro).delay(theme.motion.introStagger)} style={styles.card}>
            <AppText variant="sectionTitle" style={styles.cardTitle}>
              {copy.formTitle}
            </AppText>
            <Controller
              control={control}
              name="phone"
              render={({ field, fieldState }) => (
                <FormField label={copy.phoneLabel} required error={fieldState.error?.message}>
                  <AppInput
                    icon={Phone}
                    value={field.value}
                    onChangeText={field.onChange}
                    onBlur={field.onBlur}
                    placeholder={copy.phonePlaceholder}
                    keyboardType="phone-pad"
                    maxLength={14}
                    error={!!fieldState.error}
                    accessibilityLabel={copy.phoneLabel}
                  />
                </FormField>
              )}
            />
            <Controller
              control={control}
              name="password"
              render={({ field, fieldState }) => (
                <FormField label={copy.passwordLabel} required error={fieldState.error?.message}>
                  <AppInput
                    icon={Lock}
                    value={field.value}
                    onChangeText={field.onChange}
                    onBlur={field.onBlur}
                    placeholder={copy.passwordPlaceholder}
                    secureTextEntry={!showPassword}
                    error={!!fieldState.error}
                    accessibilityLabel={copy.passwordLabel}
                    right={
                      <PressableScale hitSlop={10} onPress={() => setShowPassword((v) => !v)} accessibilityLabel={showPassword ? copy.hidePassword : copy.showPassword}>
                        {showPassword ? <EyeOff size={TOGGLE_ICON_SIZE} color={theme.colors.textSecondary} /> : <Eye size={TOGGLE_ICON_SIZE} color={theme.colors.textSecondary} />}
                      </PressableScale>
                    }
                  />
                </FormField>
              )}
            />
            <Button title={copy.submit} icon={LogIn} size="lg" onPress={onSubmit} loading={submitting} disabled={formState.isSubmitting} fullWidth />
            <DemoNotice style={styles.demoNotice} text={copy.demoNotice} />
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(theme.motion.duration.intro).delay(theme.motion.introStagger * 2)} style={styles.accounts}>
            <PressableScale onPress={() => setShowAccounts((v) => !v)} style={styles.accountsHeader} accessibilityLabel={copy.demoAccountsTitle}>
              <AppText variant="cardTitle" color={theme.colors.white}>
                {copy.demoAccountsTitle}
              </AppText>
              {showAccounts ? <ChevronUp size={TOGGLE_ICON_SIZE} color={theme.colors.accentLight} /> : <ChevronDown size={TOGGLE_ICON_SIZE} color={theme.colors.accentLight} />}
            </PressableScale>
            {showAccounts ? (
              <View style={styles.accountGroups}>
                {ACCOUNT_GROUPS.map((group) => {
                  const accounts = demoAccounts.filter((a) => a.group === group);
                  if (!accounts.length) return null;
                  return (
                    <View key={group} style={styles.accountGroup}>
                      <AppText variant="captionMedium" color={theme.colors.accentLight}>
                        {copy.accountGroupTitle(DEMO_ACCOUNT_GROUP_LABELS[group], accounts.length)}
                      </AppText>
                      {accounts.map((acc) => {
                        const m = members[acc.memberId];
                        if (!m) return null;
                        return (
                          <PressableScale
                            key={acc.memberId}
                            onPress={() => {
                              setValue('phone', acc.phone);
                              setValue('password', acc.password);
                              doLogin(acc.phone, acc.password);
                            }}
                            style={styles.account}
                            accessibilityLabel={copy.loginAs(m.name)}
                          >
                            <Avatar name={m.name} color={m.avatarColor} size={ACCOUNT_AVATAR_SIZE} />
                            <View style={styles.accountText}>
                              <AppText variant="bodyMedium" color={theme.colors.white} numberOfLines={2}>
                                {m.name}
                              </AppText>
                              <AppText variant="meta" color={theme.colors.onPrimarySubtle} numberOfLines={1}>
                                {acc.label}
                              </AppText>
                              {m.managedCommitteeIds.length && m.role !== 'member' ? <RoleBadges member={m} /> : null}
                            </View>
                            {!m.managedCommitteeIds.length || m.role === 'member' ? <RoleBadges member={m} /> : null}
                          </PressableScale>
                        );
                      })}
                    </View>
                  );
                })}
              </View>
            ) : null}
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
