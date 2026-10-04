import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity, Switch, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SymbolView } from 'expo-symbols';
import { BrandColors, Spacing, Radius } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { router } from 'expo-router';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user, isGuest, logout } = useAuth();
  
  const [pushEnabled, setPushEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  const handleLogin = () => {
    logout().then(() => {
      router.replace('/(auth)/login');
    });
  };

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={[styles.contentContainer, { paddingTop: insets.top + Spacing.four }]}
    >
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <SymbolView name="arrow.left" size={20} tintColor={BrandColors.navy} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Profile</Text>
      </View>

      <View style={styles.profileCard}>
        <View style={styles.avatarCircle}>
          <SymbolView name="person.fill" size={32} tintColor={BrandColors.primary} />
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.userName}>{isGuest ? 'Guest User' : user?.name || 'Unknown'}</Text>
          <Text style={styles.userEmail}>{isGuest ? 'Not logged in' : user?.email || 'No email provided'}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{isGuest ? 'GUEST' : user?.role}</Text>
          </View>
        </View>
      </View>

      <Text style={styles.sectionTitle}>APP SETTINGS</Text>
      <View style={styles.settingsCard}>
        <View style={styles.settingRow}>
          <View style={styles.settingLabelRow}>
            <SymbolView name="bell.fill" size={20} tintColor="#64748B" />
            <Text style={styles.settingLabel}>Push Notifications</Text>
          </View>
          <Switch 
            value={pushEnabled} 
            onValueChange={setPushEnabled} 
            trackColor={{ false: '#E2E8F0', true: BrandColors.orange }}
          />
        </View>
        <View style={styles.settingDivider} />
        <View style={styles.settingRow}>
          <View style={styles.settingLabelRow}>
            <SymbolView name="moon.fill" size={20} tintColor="#64748B" />
            <Text style={styles.settingLabel}>Dark Mode</Text>
          </View>
          <Switch 
            value={darkMode} 
            onValueChange={setDarkMode} 
            trackColor={{ false: '#E2E8F0', true: BrandColors.orange }}
          />
        </View>
      </View>

      {isGuest ? (
        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>Log In or Register</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Log Out</Text>
        </TouchableOpacity>
      )}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  contentContainer: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.six,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.six,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.three,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: BrandColors.navy,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.lg,
    padding: Spacing.five,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: Spacing.six,
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.four,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '800',
    color: BrandColors.navy,
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: Spacing.two,
  },
  roleBadge: {
    backgroundColor: BrandColors.navy,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: Spacing.three,
    letterSpacing: 0.5,
    marginLeft: Spacing.two,
  },
  settingsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: Spacing.six,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.four,
  },
  settingLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: 16,
    color: BrandColors.navy,
    marginLeft: Spacing.three,
  },
  settingDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginLeft: Spacing.four + 20 + Spacing.three,
  },
  logoutButton: {
    backgroundColor: '#FEE2E2',
    height: 52,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutButtonText: {
    color: BrandColors.danger,
    fontSize: 16,
    fontWeight: '700',
  },
  loginButton: {
    backgroundColor: BrandColors.orange,
    height: 52,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  }
});
