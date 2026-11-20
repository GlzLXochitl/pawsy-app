import { Stack } from 'expo-router';
import { AuthProvider } from '../context/auth-context';
import { ProfileProvider } from '../context/ProfileContext';

const SCREEN_OPTIONS = { headerShown: false };

export default function RootLayout() {
  return (
    <AuthProvider>
      <ProfileProvider>
        <Stack screenOptions={SCREEN_OPTIONS} />
      </ProfileProvider>
    </AuthProvider>
  );
}