import React from 'react';
import { TouchableOpacity, Text, View, Platform } from 'react-native';
import { Tabs, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SymbolView } from 'expo-symbols';

import { Feature1Provider } from '@/features/feature1/context/Feature1Context';
import { useAuth } from '@/context/AuthContext';

// 60% white  |  30% orange  |  10% blue
const PALETTE = {
  white: '#FFFFFF',      // 60% - backgrounds and surfaces
  orange: '#EA6A0C',     // 30% - logo tile, active tab, avatar pill
  navy: '#132455',       // 10% - titles and small details
  inactive: '#94A3B8',
};

export default function TabsLayout() {
  const { user, isGuest } = useAuth();

  // Format role text nicely
  const rawRole = isGuest ? 'GUEST' : user?.role || 'PROFILE';
  const displayRole = rawRole.charAt(0) + rawRole.slice(1).toLowerCase();

  return (
    <Feature1Provider>
      <Tabs
        screenOptions={{
          // --- BOTTOM TAB BAR ---
          tabBarActiveTintColor: PALETTE.orange,
          tabBarInactiveTintColor: PALETTE.inactive,
          tabBarStyle: {
            backgroundColor: PALETTE.white,
            borderTopWidth: 0,
            elevation: 14,
            shadowColor: PALETTE.navy,
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.08,
            shadowRadius: 16,
            height: Platform.OS === 'ios' ? 88 : 70,
            paddingBottom: Platform.OS === 'ios' ? 28 : 12,
            paddingTop: 12,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
            marginTop: 4,
          },

          // --- HEADER (no line underneath) ---
          headerStyle: {
            backgroundColor: PALETTE.white,
            elevation: 0,
            shadowOpacity: 0,
            shadowColor: 'transparent',
            borderBottomWidth: 0,
            height: Platform.OS === 'ios' ? 115 : 85,
          },
          headerShadowVisible: false,
          headerTitleAlign: 'left',
          headerShown: true,

          // 1. Logo in an orange tile
          headerLeft: () => (
            <View
              style={{
                marginLeft: 20,
                marginRight: -4,
                marginTop: Platform.OS === 'ios' ? 0 : 4,
                width: 40,
                height: 40,
                borderRadius: 12,
                backgroundColor: PALETTE.orange,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Ionicons name="library" size={22} color={PALETTE.white} />
            </View>
          ),

          // 2. Title: small orange label, bold navy title
          headerTitle: ({ children }) => (
            <View style={{ marginTop: Platform.OS === 'ios' ? 0 : 4, marginLeft: 8 }}>
              <Text style={{ fontSize: 11, color: PALETTE.orange, fontWeight: '700', letterSpacing: 0.4, marginBottom: 2 }}>
                SLIIT Library
              </Text>
              <Text style={{ fontSize: 22, fontWeight: '800', color: PALETTE.navy }}>
                {children}
              </Text>
            </View>
          ),

          // 3. Avatar pill: orange pill, navy avatar dot, white role text
          headerRight: () => (
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/profile')}
              activeOpacity={0.7}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: PALETTE.orange,
                paddingHorizontal: 6,
                paddingVertical: 6,
                borderRadius: 24,
                marginRight: 20,
                marginTop: Platform.OS === 'ios' ? 0 : 4,
              }}
            >
              <View
                style={{
                  backgroundColor: PALETTE.navy,
                  width: 28,
                  height: 28,
                  borderRadius: 14,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: 8,
                }}
              >
                <Ionicons name="person" size={14} color={PALETTE.white} />
              </View>
              <Text style={{ color: PALETTE.white, fontWeight: '700', fontSize: 13, marginRight: 12 }}>
                {displayRole}
              </Text>
            </TouchableOpacity>
          ),
        }}>

        {/* === TAB SCREENS === */}
        <Tabs.Screen
          name="index"
          options={{
            title: 'Space Map',
            tabBarLabel: 'Map',
            tabBarIcon: ({ focused, color }) => (
              <SymbolView name="map.fill" size={26} tintColor={color} fallback={<Ionicons name={focused ? "map" : "map-outline"} size={26} color={color} />} />
            ),
            href: user?.role === 'ADMIN' ? null : '/',
          }}
        />
        <Tabs.Screen
          name="books"
          options={{
            title: 'Catalogue',
            tabBarLabel: 'Books',
            tabBarIcon: ({ focused, color }) => (
              <SymbolView name="book.fill" size={26} tintColor={color} fallback={<Ionicons name={focused ? "book" : "book-outline"} size={26} color={color} />} />
            ),
            href: user?.role === 'ADMIN' ? null : '/(tabs)/books',
          }}
        />
        <Tabs.Screen
          name="myspace"
          options={{
            title: 'My Bookings',
            tabBarLabel: 'My Space',
            tabBarIcon: ({ focused, color }) => (
              <SymbolView name="calendar" size={26} tintColor={color} fallback={<Ionicons name={focused ? "calendar" : "calendar-outline"} size={26} color={color} />} />
            ),
            href: user?.role === 'ADMIN' ? null : '/(tabs)/myspace',
          }}
        />
        <Tabs.Screen
          name="notify"
          options={{
            title: 'Alerts',
            tabBarLabel: 'Notify',
            tabBarIcon: ({ focused, color }) => (
              <SymbolView name="bell.fill" size={26} tintColor={color} fallback={<Ionicons name={focused ? "notifications" : "notifications-outline"} size={26} color={color} />} />
            ),
            href: user?.role === 'ADMIN' ? null : '/(tabs)/notify',
          }}
        />
        <Tabs.Screen
          name="staff"
          options={{
            headerShown: false,
            tabBarStyle: { display: 'none' },
            title: 'Staff Control',
            tabBarLabel: 'Staff',
            tabBarIcon: ({ focused, color }) => (
              <SymbolView name="person.crop.circle.badge.checkmark" size={26} tintColor={color} fallback={<Ionicons name={focused ? "shield" : "shield-outline"} size={26} color={color} />} />
            ),
            href: user?.role === 'STAFF' ? '/(tabs)/staff' : null,
          }}
        />
        <Tabs.Screen
          name="analytics"
          options={{
            title: 'Analytics',
            tabBarLabel: 'Reports',
            tabBarIcon: ({ focused, color }) => (
              <SymbolView name="chart.xyaxis.line" size={26} tintColor={color} fallback={<Ionicons name={focused ? "bar-chart" : "bar-chart-outline"} size={26} color={color} />} />
            ),
            href: user?.role === 'ADMIN' ? '/(tabs)/analytics' : null,
          }}
        />
        <Tabs.Screen
          name="users"
          options={{
            title: 'Manage Users',
            tabBarLabel: 'Users',
            tabBarIcon: ({ focused, color }) => (
              <SymbolView name="person.2.fill" size={26} tintColor={color} fallback={<Ionicons name={focused ? "people" : "people-outline"} size={26} color={color} />} />
            ),
            href: user?.role === 'ADMIN' ? '/(tabs)/users' : null,
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Admin Setup',
            tabBarLabel: 'Settings',
            tabBarIcon: ({ focused, color }) => (
              <SymbolView name="wrench.and.screwdriver" size={26} tintColor={color} fallback={<Ionicons name={focused ? "settings" : "settings-outline"} size={26} color={color} />} />
            ),
            href: user?.role === 'ADMIN' ? '/(tabs)/settings' : null,
          }}
        />

        {/* Hidden Screens */}
        <Tabs.Screen name="books/detail" options={{ href: null, headerShown: false }} />
        <Tabs.Screen name="books/notify" options={{ href: null, headerShown: false }} />
        <Tabs.Screen name="books/reminder-confirmed" options={{ href: null, headerShown: false }} />
        <Tabs.Screen name="profile" options={{ href: null, headerShown: false }} />
        <Tabs.Screen name="analytics-detail" options={{ href: null, headerShown: true, title: 'Detailed Report' }} />
      </Tabs>
    </Feature1Provider>
  );
}