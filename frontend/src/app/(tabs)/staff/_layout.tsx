import React from 'react';
import { Platform, useColorScheme, View, Text, TouchableOpacity } from 'react-native';
import { Tabs, router } from 'expo-router';
import { Colors, BrandColors } from '@/constants/theme';
import { SymbolView } from 'expo-symbols';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';

export default function StaffTabsLayout() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const { user, isGuest } = useAuth();
  
  const rawRole = isGuest ? 'GUEST' : user?.role || 'PROFILE';
  const displayRole = rawRole.charAt(0) + rawRole.slice(1).toLowerCase();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: BrandColors.orange, // Brand Orange for active tab
        tabBarInactiveTintColor: '#94A3B8', // Modern slate gray for inactive
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopWidth: 0, // Removes the harsh default top line
          elevation: 12, // Shadow for Android
          shadowColor: '#132455', // Brand Navy shadow for iOS
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.06,
          shadowRadius: 14,
          height: Platform.OS === 'ios' ? 88 : 70, // Taller, modern height
          paddingBottom: Platform.OS === 'ios' ? 28 : 12,
          paddingTop: 12,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 4,
        },
        headerStyle: {
          backgroundColor: colors.background,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: scheme === 'dark' ? '#1E293B' : '#F1F5F9',
          height: Platform.OS === 'ios' ? 115 : 85,
        },
        headerTitleAlign: 'left',
        headerShown: true,
        headerLeft: () => (
          <View style={{ marginLeft: 20, marginRight: -10, marginTop: Platform.OS === 'ios' ? 0 : 4 }}>
            <Ionicons name="library" size={32} color={BrandColors.primary} />
          </View>
        ),
        headerTitle: ({ children }) => (
          <View style={{ marginTop: Platform.OS === 'ios' ? 0 : 4, marginLeft: 8 }}>
            <Text style={{ fontSize: 10, color: '#64748B', fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 2 }}>
              SLIIT Library
            </Text>
            <Text style={{ fontSize: 22, fontWeight: '800', color: scheme === 'dark' ? colors.text : '#132455' }}>
              {children}
            </Text>
          </View>
        ),
        headerRight: () => (
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/profile')}
            activeOpacity={0.7}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#1E293B',
              paddingHorizontal: 6,
              paddingVertical: 6,
              borderRadius: 24,
              marginRight: 20,
              marginTop: Platform.OS === 'ios' ? 0 : 4
            }}
          >
            <View style={{
              backgroundColor: BrandColors.primary,
              width: 28,
              height: 28,
              borderRadius: 14,
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: 8,
            }}>
              <Ionicons name="person" size={14} color="white" />
            </View>
            <Text style={{ color: '#64748B', fontWeight: '700', fontSize: 13, marginRight: 12 }}>
              {displayRole}
            </Text>
          </TouchableOpacity>
        ),
      }}>

      {/* If you have any hidden screens, hide them cleanly using href: null */}
      {/* <Tabs.Screen name="hidden" options={{ href: null }} /> */}

      <Tabs.Screen
        name="index"
        options={{
          title: 'Staff Dashboard',
          tabBarLabel: 'Dash',
          tabBarIcon: ({ focused, color }) => (
            <SymbolView
              name="chart.bar.fill"
              size={26}
              tintColor={color}
              fallback={<Ionicons name={focused ? "stats-chart" : "stats-chart-outline"} size={24} color={color} />}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="inventory"
        options={{
          title: 'Inventory',
          tabBarLabel: 'Inventory',
          tabBarIcon: ({ focused, color }) => (
            <SymbolView
              name="camera.fill"
              size={26}
              tintColor={color}
              fallback={<Ionicons name={focused ? "camera" : "camera-outline"} size={24} color={color} />}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="alerts"
        options={{
          title: 'System Alerts',
          tabBarLabel: 'Alerts',
          tabBarIcon: ({ focused, color }) => (
            <SymbolView
              name="light.beacon.max.fill"
              size={26}
              tintColor={color}
              fallback={<Ionicons name={focused ? "warning" : "warning-outline"} size={24} color={color} />}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarLabel: 'Settings',
          tabBarIcon: ({ focused, color }) => (
            <SymbolView
              name="gearshape.fill"
              size={26}
              tintColor={color}
              fallback={<Ionicons name={focused ? "settings" : "settings-outline"} size={24} color={color} />}
            />
          ),
        }}
      />
    </Tabs>
  );
}