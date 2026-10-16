import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';
import { ProfileProvider } from '../../(app)/profile/ProfileContext';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider
  value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}
>
  <ProfileProvider>
    <Stack />
  </ProfileProvider>
</ThemeProvider>
  );
}