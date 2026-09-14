import { Redirect, Stack } from 'expo-router';
import { useAuth } from '../../context/auth-context';

export default function AppLayout() {
  const { isLoggedIn } = useAuth();

  if (!isLoggedIn) {
    return <Redirect href="/sign-in" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}