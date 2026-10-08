import { Redirect } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import SpaceMapScreen from '../../features/feature1/screens/SpaceMapScreen';

export default function Index() {
  const { user } = useAuth();

  if (user?.role === 'ADMIN') {
    return <Redirect href="/(tabs)/analytics" />;
  }

  if (user?.role === 'STAFF') {
    return <Redirect href="/(tabs)/staff" />;
  }

  return <SpaceMapScreen />;
}
