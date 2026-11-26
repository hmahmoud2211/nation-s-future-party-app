import { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { useIsLoggedIn } from '@/features/auth/hooks/useSession';

/** Redirects between the login screen and the app based on the mock session. */
export function AuthGate() {
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
