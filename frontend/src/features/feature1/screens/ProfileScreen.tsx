import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity, Switch } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SymbolView } from 'expo-symbols';
import { Spacing, Radius } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { router } from 'expo-router';

// 60% white  |  30% orange  |  10% blue
const PALETTE = {
  white: '#FFFFFF',        // 60% - screen and card surfaces
  paleOrange: '#FFF4EA',   // soft tint for icon tiles
  line: '#F3E3D3',         // card borders
  orange: '#EA6A0C',       // 30% - hero card, buttons, switches
  navy: '#132455',         // 10% - titles and small details
  muted: '#64748B',
  danger: '#DC2626',
  dangerSoft: '#FEF2F2',
};

const getInitials = (name?: string) => {
  if (!name) return '';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '';
  const first = parts[0].charAt(0);
  const last = parts.length > 1 ? parts[parts.length - 1].charAt(0) : '';
  return (first + last).toUpperCase();
};

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

  const displayName = isGuest ? 'Guest User' : user?.name || 'Unknown';
  const displayEmail = isGuest ? 'Not logged in' : user?.email || 'No email provided';
  const displayRole = isGuest ? 'GUEST' : user?.role;
  const initials = isGuest ? '' : getInitials(user?.name);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.contentContainer, { paddingTop: insets.top + Spacing.four }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.7}>
          <SymbolView name="arrow.left" size={20} tintColor={PALETTE.navy} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Profile</Text>
      </View>

      {/* Hero card */}
      <View style={styles.heroCard}>
        <View style={styles.heroCircleLarge} />
        <View style={styles.heroCircleSmall} />

        <View style={styles.avatarRing}>
          <View style={styles.avatarCircle}>
            {initials ? (
              <Text style={styles.avatarInitials}>{initials}</Text>
            ) : (
              <SymbolView name="person.fill" size={34} tintColor={PALETTE.orange} />
            )}
          </View>
        </View>

        <Text style={styles.userName}>{displayName}</Text>
        <Text style={styles.userEmail}>{displayEmail}</Text>

        <View style={styles.roleBadge}>
          <View style={styles.roleDot} />
          <Text style={styles.roleText}>{displayRole}</Text>
        </View>
      </View>

      {/* Account details */}
      {isGuest ? (
        <View style={styles.guestCard}>
          <View style={styles.guestIconTile}>
            <SymbolView name="lock.fill" size={18} tintColor={PALETTE.orange} />
          </View>
          <Text style={styles.guestText}>
            You are browsing as a guest. Log in to manage your account.
          </Text>
        </View>
      ) : (
        <>
          <Text style={styles.sectionTitle}>ACCOUNT</Text>
          <View style={styles.card}>
            <View style={styles.settingRow}>
              <View style={styles.settingLabelRow}>
                <View style={styles.iconTile}>
                  <SymbolView name="person.fill" size={18} tintColor={PALETTE.orange} />
                </View>
                <View>
                  <Text style={styles.rowCaption}>Name</Text>
                  <Text style={styles.rowValue}>{displayName}</Text>
                </View>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.settingRow}>
              <View style={styles.settingLabelRow}>
                <View style={styles.iconTile}>
                  <SymbolView name="envelope.fill" size={18} tintColor={PALETTE.orange} />
                </View>
                <View style={{ flexShrink: 1 }}>
                  <Text style={styles.rowCaption}>Email</Text>
                  <Text style={styles.rowValue} numberOfLines={1}>{displayEmail}</Text>
                </View>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.settingRow}>
              <View style={styles.settingLabelRow}>
                <View style={styles.iconTile}>
                  <SymbolView name="checkmark.shield.fill" size={18} tintColor={PALETTE.orange} />
                </View>
                <View>
                  <Text style={styles.rowCaption}>Role</Text>
                  <Text style={styles.rowValue}>{displayRole}</Text>
                </View>
              </View>
            </View>
          </View>
        </>
      )}

      {/* App settings */}
      <Text style={styles.sectionTitle}>APP SETTINGS</Text>
      <View style={styles.card}>
        <View style={styles.settingRow}>
          <View style={styles.settingLabelRow}>
            <View style={styles.iconTile}>
              <SymbolView name="bell.fill" size={18} tintColor={PALETTE.orange} />
            </View>
            <Text style={styles.settingLabel}>Push Notifications</Text>
          </View>
          <Switch
            value={pushEnabled}
            onValueChange={setPushEnabled}
            trackColor={{ false: '#E2E8F0', true: PALETTE.orange }}
            thumbColor={PALETTE.white}
          />
        </View>
        <View style={styles.divider} />
        <View style={styles.settingRow}>
          <View style={styles.settingLabelRow}>
            <View style={styles.iconTile}>
              <SymbolView name="moon.fill" size={18} tintColor={PALETTE.orange} />
            </View>
            <Text style={styles.settingLabel}>Dark Mode</Text>
          </View>
          <Switch
            value={darkMode}
            onValueChange={setDarkMode}
            trackColor={{ false: '#E2E8F0', true: PALETTE.orange }}
            thumbColor={PALETTE.white}
          />
        </View>
      </View>

      {/* Action button */}
      {isGuest ? (
        <TouchableOpacity style={styles.loginButton} onPress={handleLogin} activeOpacity={0.85}>
          <Text style={styles.loginButtonText}>Log In or Register</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.85}>
          <SymbolView name="rectangle.portrait.and.arrow.right" size={18} tintColor={PALETTE.danger} />
          <Text style={styles.logoutButtonText}>Log Out</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PALETTE.white,
  },
  contentContainer: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.six,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.five,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: PALETTE.paleOrange,
    borderWidth: 1,
    borderColor: PALETTE.line,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.three,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: PALETTE.navy,
  },

  // Hero
  heroCard: {
    backgroundColor: PALETTE.orange,
    borderRadius: 28,
    paddingVertical: Spacing.five,
    paddingHorizontal: Spacing.four,
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: Spacing.five,
    shadowColor: PALETTE.orange,
    shadowOpacity: 0.3,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  heroCircleLarge: {
    position: 'absolute',
    top: -50,
    right: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  heroCircleSmall: {
    position: 'absolute',
    bottom: -40,
    left: -30,
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
  avatarRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.three,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: PALETTE.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: {
    fontSize: 28,
    fontWeight: '800',
    color: PALETTE.navy,
  },
  userName: {
    fontSize: 22,
    fontWeight: '800',
    color: PALETTE.white,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: Spacing.three,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PALETTE.navy,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
  },
  roleDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: PALETTE.orange,
    marginRight: 6,
  },
  roleText: {
    color: PALETTE.white,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
  },

  // Sections and cards
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: PALETTE.navy,
    marginBottom: Spacing.three,
    letterSpacing: 0.8,
    marginLeft: Spacing.two,
  },
  card: {
    backgroundColor: PALETTE.white,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: PALETTE.line,
    marginBottom: Spacing.five,
    shadowColor: PALETTE.navy,
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
  },
  settingLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconTile: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: PALETTE.paleOrange,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.three,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: PALETTE.navy,
  },
  rowCaption: {
    fontSize: 12,
    color: PALETTE.muted,
    marginBottom: 2,
  },
  rowValue: {
    fontSize: 15,
    fontWeight: '700',
    color: PALETTE.navy,
  },
  divider: {
    height: 1,
    backgroundColor: PALETTE.line,
    marginLeft: Spacing.four + 38 + Spacing.three,
  },

  // Guest note
  guestCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PALETTE.paleOrange,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: PALETTE.line,
    padding: Spacing.four,
    marginBottom: Spacing.five,
  },
  guestIconTile: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: PALETTE.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.three,
  },
  guestText: {
    flex: 1,
    fontSize: 14,
    color: PALETTE.navy,
    lineHeight: 20,
  },

  // Buttons
  logoutButton: {
    flexDirection: 'row',
    backgroundColor: PALETTE.dangerSoft,
    borderWidth: 1,
    borderColor: '#FECACA',
    height: 54,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutButtonText: {
    color: PALETTE.danger,
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  loginButton: {
    backgroundColor: PALETTE.orange,
    height: 54,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: PALETTE.orange,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  loginButtonText: {
    color: PALETTE.white,
    fontSize: 16,
    fontWeight: '700',
  },
});