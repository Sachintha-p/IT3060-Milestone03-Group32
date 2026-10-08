import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity, Switch } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BrandColors, Spacing, Radius } from '@/constants/theme';

export default function StaffSettingsScreen() {
  const insets = useSafeAreaInsets();
  const [pushAlerts, setPushAlerts] = useState(true);
  const [emailDigest, setEmailDigest] = useState(false);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.contentContainer, { paddingTop: insets.top + Spacing.four }]}
    >
      <Text style={styles.sectionTitle}>NOTIFICATIONS</Text>

      <View style={styles.settingRow}>
        <Text style={styles.settingLabel}>Push alerts for critical zones</Text>
        <Switch
          value={pushAlerts}
          onValueChange={setPushAlerts}
          trackColor={{ false: '#E2E8F0', true: BrandColors.orange }}
          thumbColor="#FFFFFF"
        />
      </View>

      <View style={styles.settingRow}>
        <Text style={styles.settingLabel}>Email digest</Text>
        <Switch
          value={emailDigest}
          onValueChange={setEmailDigest}
          trackColor={{ false: '#E2E8F0', true: BrandColors.orange }}
          thumbColor="#FFFFFF"
        />
      </View>

      <Text style={[styles.sectionTitle, { marginTop: Spacing.four }]}>ACCOUNT</Text>

      <View style={styles.accountCard}>
        <Text style={styles.accountName}>Nimeshi Perera</Text>
        <Text style={styles.accountRole}>Library Reading Room Assistant</Text>
      </View>

      {/* Spacer to push logout button down if needed, or just standard margin */}
      <View style={{ height: 40 }} />

      <TouchableOpacity style={styles.logoutButton}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  contentContainer: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.six,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: BrandColors.navy,
    marginBottom: Spacing.five,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: Spacing.three,
    letterSpacing: 0.5,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.three,
    marginBottom: Spacing.two,
  },
  settingLabel: {
    fontSize: 16,
    color: BrandColors.navy,
  },
  accountCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: Radius.md,
    padding: Spacing.four,
    marginBottom: Spacing.four,
  },
  accountName: {
    fontSize: 16,
    fontWeight: '700',
    color: BrandColors.navy,
    marginBottom: 4,
  },
  accountRole: {
    fontSize: 14,
    color: '#64748B',
  },
  logoutButton: {
    backgroundColor: BrandColors.orange,
    borderRadius: Radius.md,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 'auto',
  },
  logoutText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  }
});
