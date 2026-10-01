import { Tabs } from 'expo-router';
import { useColorScheme } from 'react-native';
import { Colors } from '@/constants/theme';

/**
 * Tab navigator for the main app area.
 * Each feature team adds their screen here once they have a real screen to show.
 * The tab titles below use placeholder names — replace with the actual feature names.
 */
export default function TabsLayout() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.text,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: { backgroundColor: colors.background },
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerShown: true,
      }}>
      {/* Home tab — owned by Team Lead */}
      <Tabs.Screen
        name="index"
        options={{ title: 'Home', tabBarLabel: 'Home' }}
      />
      {/* Feature tabs — rename titles when feature names are confirmed */}
      <Tabs.Screen
        name="feature1/index"
        options={{ title: 'Feature 1', tabBarLabel: 'Feature 1' }}
      />
      <Tabs.Screen
        name="feature2/index"
        options={{ title: 'Feature 2', tabBarLabel: 'Feature 2' }}
      />
      <Tabs.Screen
        name="feature3/index"
        options={{ title: 'Feature 3', tabBarLabel: 'Feature 3' }}
      />
      <Tabs.Screen
        name="feature4/index"
        options={{ title: 'Feature 4', tabBarLabel: 'Feature 4' }}
      />
    </Tabs>
  );
}
