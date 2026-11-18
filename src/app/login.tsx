import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { zodResolver } from '@hookform/resolvers/zod';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronDown, ChevronUp, Eye, EyeOff, Lock, LogIn, Phone } from 'lucide-react-native';
import { z } from 'zod';
import {
  AppInput,
  AppText,
  Avatar,
  BrandMark,
  Button,
  DemoNotice,
  FormField,
  PressableScale,
  RoleBadges,
} from '@/components';
import { DEMO_ACCOUNT_GROUP_LABELS, demoAccounts } from '@/data';
import type { DemoAccountGroup } from '@/types';
import { useAppStore, useMemberMap } from '@/store';
import { toast } from '@/store/uiStore';
import { colors, gradients, GUTTER, radius, shadows, spacing } from '@/theme';
import { toWesternDigits } from '@/utils/format';

const ACCOUNT_GROUPS = Object.keys(DEMO_ACCOUNT_GROUP_LABELS) as DemoAccountGroup[];

const schema = z.object({
  phone: z
    .string()
    .min(1, 'يرجى إدخال رقم الهاتف')
    .transform((v) => toWesternDigits(v).replace(/\s|-/g, ''))
    .refine((v) => /^01\d{9}$/.test(v), 'رقم الهاتف يجب أن يتكون من ١١ رقماً ويبدأ بـ ٠١'),
  password: z.string().min(1, 'يرجى إدخال كلمة المرور').min(6, 'كلمة المرور ٦ أحرف على الأقل'),
});

type FormInput = z.input<typeof schema>;
type FormOutput = z.output<typeof schema>;

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const login = useAppStore((s) => s.loginDemoUser);
  const members = useMemberMap();
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
      toast.success(`مرحباً، ${res.data.name.split(' ')[0]}`);
      router.replace('/home');
    }, 450);
  };

  const onSubmit = handleSubmit((values) => doLogin(values.phone, values.password), () => toast.error('يرجى استكمال البيانات المطلوبة'));

  return (
    <View style={styles.root}>
      <LinearGradient colors={gradients.navyDeep as unknown as [string, string, ...string[]]} style={StyleSheet.absoluteFill} start={{ x: 1, y: 0 }} end={{ x: 0, y: 1 }} />
      <View pointerEvents="none" style={styles.ring1} />
      <View pointerEvents="none" style={styles.ring2} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingTop: insets.top + spacing.xxl, paddingBottom: insets.bottom + spacing.xxl }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View entering={FadeInUp.duration(500)} style={styles.brand}>
            <BrandMark size={84} />
            <AppText variant="display" color={colors.white} align="center" style={{ marginTop: spacing.lg }}>
              مستقبل وطن | قطاع الأعمال
            </AppText>
            <AppText variant="body" color={colors.goldLight} align="center">
              أمانة قطاع الأعمال المركزية
            </AppText>
            <AppText variant="caption" color="rgba(255,255,255,0.7)" align="center" style={{ marginTop: spacing.sm, maxWidth: 320 }}>
              مرحباً بك في منصة إدارة اللجان والمقترحات والاجتماعات. سجّل الدخول للمتابعة.
            </AppText>
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(500).delay(100)} style={styles.card}>
            <AppText variant="sectionTitle" style={{ marginBottom: spacing.lg }}>
              تسجيل الدخول
            </AppText>
            <Controller
              control={control}
              name="phone"
              render={({ field, fieldState }) => (
                <FormField label="رقم الهاتف" required error={fieldState.error?.message}>
                  <AppInput
                    icon={Phone}
                    value={field.value}
                    onChangeText={field.onChange}
                    onBlur={field.onBlur}
                    placeholder="01xxxxxxxxx"
                    keyboardType="phone-pad"
                    maxLength={14}
                    error={!!fieldState.error}
                    accessibilityLabel="رقم الهاتف"
                  />
                </FormField>
              )}
            />
            <Controller
              control={control}
              name="password"
              render={({ field, fieldState }) => (
                <FormField label="كلمة المرور" required error={fieldState.error?.message}>
                  <AppInput
                    icon={Lock}
                    value={field.value}
                    onChangeText={field.onChange}
                    onBlur={field.onBlur}
                    placeholder="••••••"
                    secureTextEntry={!showPassword}
                    error={!!fieldState.error}
                    accessibilityLabel="كلمة المرور"
                    right={
                      <PressableScale hitSlop={10} onPress={() => setShowPassword((v) => !v)} accessibilityLabel={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}>
                        {showPassword ? <EyeOff size={18} color={colors.textSecondary} /> : <Eye size={18} color={colors.textSecondary} />}
                      </PressableScale>
                    }
                  />
                </FormField>
              )}
            />
            <Button title="دخول" icon={LogIn} size="lg" onPress={onSubmit} loading={submitting} disabled={formState.isSubmitting} fullWidth />
            <DemoNotice style={{ marginTop: spacing.lg }} text="دخول تجريبي — لا يوجد تحقق حقيقي أو خادم. كلمة المرور لجميع الحسابات: 123456" />
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(500).delay(200)} style={styles.accounts}>
            <PressableScale onPress={() => setShowAccounts((v) => !v)} style={styles.accountsHeader} accessibilityLabel="الحسابات التجريبية">
              <AppText variant="cardTitle" color={colors.white}>
                الحسابات التجريبية
              </AppText>
              {showAccounts ? <ChevronUp size={18} color={colors.goldLight} /> : <ChevronDown size={18} color={colors.goldLight} />}
            </PressableScale>
            {showAccounts ? (
              <View style={{ gap: spacing.lg }}>
                {ACCOUNT_GROUPS.map((group) => {
                  const accounts = demoAccounts.filter((a) => a.group === group);
                  if (!accounts.length) return null;
                  return (
                    <View key={group} style={{ gap: spacing.sm }}>
                      <AppText variant="captionMedium" color={colors.goldLight}>
                        {`${DEMO_ACCOUNT_GROUP_LABELS[group]} (${accounts.length})`}
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
                      accessibilityLabel={`دخول كـ ${m.name}`}
                    >
                      <Avatar name={m.name} color={m.avatarColor} size={38} />
                      <View style={{ flex: 1, gap: 4 }}>
                        <AppText variant="bodyMedium" color={colors.white} numberOfLines={2}>
                          {m.name}
                        </AppText>
                        <AppText variant="meta" color="rgba(255,255,255,0.65)" numberOfLines={1}>
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

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.navy },
  scroll: { paddingHorizontal: GUTTER, alignItems: 'center' },
  brand: { alignItems: 'center', marginBottom: spacing.xxl },
  card: {
    width: '100%',
    maxWidth: 460,
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    padding: spacing.xl,
    ...shadows.raised,
  },
  accounts: { width: '100%', maxWidth: 460, marginTop: spacing.xl },
  accountsHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md },
  account: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  ring1: { position: 'absolute', width: 340, height: 340, borderRadius: 170, borderWidth: 1.5, borderColor: 'rgba(198,154,53,0.18)', top: -120, end: -120 },
  ring2: { position: 'absolute', width: 260, height: 260, borderRadius: 130, backgroundColor: 'rgba(198,154,53,0.06)', bottom: -80, start: -100 },
});
