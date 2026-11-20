import { Redirect } from 'expo-router';
import { useAuth } from '../context/auth-context';

export default function Index() {
  const { isLoggedIn } = useAuth();

  if (isLoggedIn) {
    return <Redirect href={'/(app)/dashboard' as any} />;
  }

  return <Redirect href={'/(auth)/sign-in' as any} />;
}