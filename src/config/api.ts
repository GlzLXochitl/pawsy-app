import Constants from 'expo-constants';
import { Platform } from 'react-native';

const configuredApiUrl = process.env.EXPO_PUBLIC_API_URL;
const expoHostUri = Constants.expoConfig?.hostUri;
const expoHost = expoHostUri
  ? new URL(`http://${expoHostUri}`).hostname
  : undefined;

function getWebApiUrl(): string {
  if (typeof window === 'undefined') return 'http://localhost:3000';
  return `http://${window.location.hostname}:3000`;
}

export const API_BASE_URL =
  configuredApiUrl ||
  (Platform.OS === 'web'
    ? getWebApiUrl()
    : expoHost
      ? `http://${expoHost}:3000`
      : 'http://10.0.2.2:3000');