import React, { useEffect } from 'react';
import { I18nManager, Platform, StyleSheet, View } from 'react-native';
// Per-weight imports: only the weights the design uses are bundled (the package roots pull in every weight).
import { NotoSansArabic_400Regular } from '@expo-google-fonts/noto-sans-arabic/400Regular';
import { NotoSansArabic_500Medium } from '@expo-google-fonts/noto-sans-arabic/500Medium';
import { NotoSansArabic_600SemiBold } from '@expo-google-fonts/noto-sans-arabic/600SemiBold';
import { NotoSansArabic_700Bold } from '@expo-google-fonts/noto-sans-arabic/700Bold';
import { NotoSansArabic_800ExtraBold } from '@expo-google-fonts/noto-sans-arabic/800ExtraBold';
import { Poppins_400Regular } from '@expo-google-fonts/poppins/400Regular';
import { Poppins_500Medium } from '@expo-google-fonts/poppins/500Medium';
import { Poppins_600SemiBold } from '@expo-google-fonts/poppins/600SemiBold';
import { Poppins_700Bold } from '@expo-google-fonts/poppins/700Bold';
import { useFonts } from 'expo-font';
import { LocaleProvider, Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AccountSwitcher } from '@/features/auth/components/AccountSwitcher';
import { DialogHost } from '@/components/feedback/DialogHost';
import { ToastHost } from '@/components/feedback/ToastHost';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthGate } from '@/navigation/AuthGate';
import { colors, RTL_ROOT } from '@/theme';

SplashScreen.preventAutoHideAsync().catch(() => undefined);

if (Platform.OS === 'web' && typeof document !== 'undefined') {
  // react-native-web follows the document direction for flex rows and logical (start/end) styles.
  document.documentElement.setAttribute('dir', 'rtl');
  document.documentElement.setAttribute('lang', 'ar');
}

try {
  // Allow RTL where the platform supports it (dev builds also force it via app.json).
  I18nManager.allowRTL(true);
} catch {
  // no-op on platforms without I18nManager support
}

export default function RootLayout() {
  // Arabic in Noto Sans Arabic, numbers / Latin in Poppins (see `fonts` / `latinFonts` in the theme).
  const [loaded, error] = useFonts({
    NotoSansArabic_400Regular,
    NotoSansArabic_500Medium,
    NotoSansArabic_600SemiBold,
    NotoSansArabic_700Bold,
    NotoSansArabic_800ExtraBold,
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  useEffect(() => {
    if (loaded || error) SplashScreen.hideAsync().catch(() => undefined);
  }, [loaded, error]);

  if (!loaded && !error) return null;

  return (
    <GestureHandlerRootView style={styles.flex}>
      <SafeAreaProvider>
        <ThemeProvider>
        <LocaleProvider direction="rtl">
          {/* The whole app is laid out right-to-left regardless of device language. */}
          <View style={styles.root}>
            <StatusBar style="light" />
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: colors.background },
                animation: 'slide_from_left',
              }}
            >
              <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
              <Stack.Screen name="login" options={{ animation: 'fade' }} />
              <Stack.Screen name="meetings/call/[id]" options={{ presentation: 'fullScreenModal', animation: 'fade', contentStyle: { backgroundColor: colors.callBackground } }} />
            </Stack>
            <AuthGate />
            <AccountSwitcher />
            <DialogHost />
            <ToastHost />
          </View>
        </LocaleProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  root: { flex: 1, backgroundColor: colors.background, ...RTL_ROOT },
});
