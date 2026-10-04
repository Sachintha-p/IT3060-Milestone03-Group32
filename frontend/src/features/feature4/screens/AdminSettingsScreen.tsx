import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity, Switch } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SymbolView } from 'expo-symbols';
import { BrandColors, Spacing, Radius } from '@/constants/theme';

export default function AdminSettingsScreen() {
  const insets = useSafeAreaInsets();
  const [autoReport, setAutoReport] = useState(true);
  const [guestLookup, setGuestLookup] = useState(true);

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={[styles.contentContainer, { paddingTop: insets.top + Spacing.four }]}
    >
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <SymbolView name="arrow.left" size={20} tintColor={BrandColors.navy} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Admin Settings</Text>
      </View>

      <Text style={styles.sectionTitle}>CAPACITY ALERT THRESHOLD</Text>

      {/* Progress Bar visual simulation */}
      <View style={styles.progressTrack}>
        <View style={styles.progressFill} />
      </View>
      <Text style={styles.progressCaption}>Flag a zone as critical at 90% occupancy</Text>

      <Text style={[styles.sectionTitle, { marginTop: Spacing.five }]}>SYSTEM</Text>

      <View style={styles.settingRow}>
        <Text style={styles.settingLabel}>Auto-generate weekly report</Text>
        <Switch 
          value={autoReport} 
          onValueChange={setAutoReport} 
          trackColor={{ false: '#E2E8F0', true: BrandColors.orange }}
        />
      </View>

      <View style={styles.settingRow}>
        <Text style={styles.settingLabel}>Allow guest seat/book lookups</Text>
        <Switch 
          value={guestLookup} 
          onValueChange={setGuestLookup} 
          trackColor={{ false: '#E2E8F0', true: BrandColors.orange }}
        />
      </View>

      <TouchableOpacity style={styles.saveButton}>
        <Text style={styles.saveButtonText}>Save Changes</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutButton}>
        <Text style={styles.logoutButtonText}>Log Out</Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.six,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.three,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: BrandColors.navy,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: Spacing.three,
    letterSpacing: 0.5,
  },
  progressTrack: {
    height: 12,
    backgroundColor: '#E2E8F0',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: Spacing.two,
  },
  progressFill: {
    height: '100%',
    width: '90%',
    backgroundColor: BrandColors.orange,
    borderRadius: 6,
  },
  progressCaption: {
    fontSize: 14,
    color: '#64748B',
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
  saveButton: {
    backgroundColor: BrandColors.orange,
    height: 52,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.five,
    marginBottom: Spacing.three,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  logoutButton: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    height: 52,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutButtonText: {
    color: BrandColors.navy,
    fontSize: 16,
    fontWeight: '700',
  }
});
