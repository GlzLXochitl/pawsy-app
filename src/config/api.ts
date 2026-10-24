import Constants from 'expo-constants';
import { Platform } from 'react-native';

const configuredApiUrl = process.env.EXPO_PUBLIC_API_URL;
const expoHostUri = Constants.expoConfig?.hostUri;
const expoHost = expoHostUri ? new URL(`http://${expoHostUri}`).hostname : undefined;
const webHost = Platform.OS === 'web' ? globalThis.location?.hostname || 'localhost' : undefined;
const apiHost = Platform.OS === 'web' ? webHost : expoHost;

if (!configuredApiUrl && !apiHost) {
  throw new Error('No se pudo determinar la dirección del servidor. Define EXPO_PUBLIC_API_URL.');
}

export const API_BASE_URL = (configuredApiUrl ?? `http://${apiHost}:3000`).replace(/\/$/, '');
