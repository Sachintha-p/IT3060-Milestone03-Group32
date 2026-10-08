import React from 'react';
import { Platform, View, Text, TouchableOpacity } from 'react-native';
import { Tabs, router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';

// 60% white  |  30% orange  |  10% blue  (same as the student layout)
const PALETTE = {
  white: '#FFFFFF',      // 60% - backgrounds and surfaces
  orange: '#EA6A0C',     // 30% - logo tile, active tab, avatar pill
  navy: '#132455',       // 10% - titles and small details
  inactive: '#94A3B8',
};

export default function StaffTabsLayout() {
  const { user, isGuest } = useAuth();

  const rawRole = isGuest ? 'GUEST' : user?.role || 'PROFILE';
  const displayRole = rawRole.charAt(0) + rawRole.slice(1).toLowerCase();

  return (
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
              name="archivebox.fill"
              size={26}
              tintColor={color}
              fallback={<Ionicons name={focused ? "archive" : "archive-outline"} size={24} color={color} />}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="zone-details"
        options={{
          title: 'Zone Details',
          tabBarLabel: 'Zones',
          tabBarIcon: ({ focused, color }) => (
            <SymbolView
              name="square.grid.2x2.fill"
              size={26}
              tintColor={color}
              fallback={<Ionicons name={focused ? "grid" : "grid-outline"} size={24} color={color} />}
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