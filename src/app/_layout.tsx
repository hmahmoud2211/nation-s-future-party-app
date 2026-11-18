import React, { useEffect } from 'react';
import { I18nManager, Platform, StyleSheet, View } from 'react-native';
import {
  Cairo_400Regular,
  Cairo_500Medium,
  Cairo_600SemiBold,
  Cairo_700Bold,
  Cairo_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/cairo';
import { LocaleProvider, Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AccountSwitcher } from '@/components/overlays/AccountSwitcher';
import { DialogHost } from '@/components/overlays/DialogHost';
import { ToastHost } from '@/components/overlays/ToastHost';
import { useIsLoggedIn } from '@/store';
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

/** Redirects between the login screen and the app based on the mock session. */
function AuthGate() {
  const loggedIn = useIsLoggedIn();
  const segments = useSegments();
  const router = useRouter();
  const first = segments[0] as string | undefined;

  useEffect(() => {
    const onLogin = first === 'login';
    if (!loggedIn && !onLogin) router.replace('/login');
    else if (loggedIn && (onLogin || first === undefined)) router.replace('/home');
  }, [loggedIn, first, router]);

  return null;
}

export default function RootLayout() {
  const [loaded, error] = useFonts({ Cairo_400Regular, Cairo_500Medium, Cairo_600SemiBold, Cairo_700Bold, Cairo_800ExtraBold });

  useEffect(() => {
    if (loaded || error) SplashScreen.hideAsync().catch(() => undefined);
  }, [loaded, error]);

  if (!loaded && !error) return null;

  return (
    <GestureHandlerRootView style={styles.flex}>
      <SafeAreaProvider>
        <LocaleProvider direction="rtl">
          {/* The whole app is laid out right-to-left regardless of device language. */}
          <View style={styles.root}>
            <StatusBar style="light" />
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: colors.bg },
                animation: 'slide_from_left',
              }}
            >
              <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
              <Stack.Screen name="login" options={{ animation: 'fade' }} />
              <Stack.Screen name="meetings/call/[id]" options={{ presentation: 'fullScreenModal', animation: 'fade', contentStyle: { backgroundColor: '#0A1430' } }} />
            </Stack>
            <AuthGate />
            <AccountSwitcher />
            <DialogHost />
            <ToastHost />
          </View>
        </LocaleProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  root: { flex: 1, backgroundColor: colors.bg, ...RTL_ROOT },
});
