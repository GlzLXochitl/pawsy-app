import { Redirect, Stack } from 'expo-router';
import { useAuth } from '../../context/auth-context';
import { ProfileProvider } from '../../context/ProfileContext';

export default function AppLayout() {
  const { isLoggedIn } = useAuth();

  if (!isLoggedIn) {
    return <Redirect href="/sign-in" />;
  }

  return (
    <ProfileProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </ProfileProvider>
  );
}