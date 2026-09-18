import { Redirect } from 'expo-router';
import { useAuth } from '../context/auth-context';

export default function Index() {
  const { isLoggedIn } = useAuth();

  if (isLoggedIn) {
    return <Redirect href="/dashboard" />;
  }

  return <Redirect href="/welcome" />;
}