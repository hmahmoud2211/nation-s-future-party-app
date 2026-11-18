import { Redirect } from 'expo-router';
import { useIsLoggedIn } from '@/store';

export default function Index() {
  const loggedIn = useIsLoggedIn();
  return <Redirect href={loggedIn ? '/home' : '/login'} />;
}
