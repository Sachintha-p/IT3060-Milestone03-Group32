import { Tabs } from 'expo-router';
import { useColorScheme } from 'react-native';
import { Colors, BrandColors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { SymbolView } from 'expo-symbols';

import { Feature1Provider } from '@/features/feature1/context/Feature1Context';

/**
 * Tab navigator for the main app area.
 * Each feature team adds their screen here once they have a real screen to show.
 * The tab titles below use placeholder names — replace with the actual feature names.
 */
export default function TabsLayout() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  return (
    <Feature1Provider>
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: BrandColors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: { backgroundColor: colors.background },
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerShown: true,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Map',
          tabBarLabel: 'Map',
          tabBarIcon: ({ focused, color }) => (
            <SymbolView name="map" size={24} tintColor={color} fallback={<Ionicons name={focused ? "map" : "map-outline"} size={24} color={color} />} />
          ),
        }}
      />
      <Tabs.Screen
        name="books"
        options={{
          title: 'Books',
          tabBarLabel: 'Books',
          tabBarIcon: ({ focused, color }) => (
            <SymbolView name="book" size={24} tintColor={color} fallback={<Ionicons name={focused ? "book" : "book-outline"} size={24} color={color} />} />
          ),
        }}
      />
      <Tabs.Screen
        name="myspace"
        options={{
          title: 'My Space',
          tabBarLabel: 'My Space',
          tabBarIcon: ({ focused, color }) => (
            <SymbolView name="calendar" size={24} tintColor={color} fallback={<Ionicons name={focused ? "calendar" : "calendar-outline"} size={24} color={color} />} />
          ),
        }}
      />
      <Tabs.Screen
        name="notify"
        options={{
          title: 'Notify',
          tabBarLabel: 'Notify',
          tabBarIcon: ({ focused, color }) => (
            <SymbolView name="bell" size={24} tintColor={color} fallback={<Ionicons name={focused ? "notifications" : "notifications-outline"} size={24} color={color} />} />
          ),
        }}
      />
    </Tabs>
    </Feature1Provider>
  );
}
