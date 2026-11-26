import { Redirect } from 'expo-router';
import { useIsLoggedIn } from '@/features/auth/hooks/useSession';

export default function Index() {
  const loggedIn = useIsLoggedIn();
  return <Redirect href={loggedIn ? '/home' : '/login'} />;
}
