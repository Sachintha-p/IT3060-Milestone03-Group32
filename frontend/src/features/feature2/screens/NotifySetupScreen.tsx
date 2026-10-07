import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity, Switch } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SymbolView } from 'expo-symbols';
import { BrandColors, Spacing, Radius } from '@/constants/theme';

export default function NotifySetupScreen() {
  const insets = useSafeAreaInsets();
  const [pushNotification, setPushNotification] = useState(true);
  const [emailAlert, setEmailAlert] = useState(false);

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={[styles.contentContainer, { paddingTop: insets.top + Spacing.four }]}
    >
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <SymbolView name="arrow.left" size={20} tintColor={BrandColors.navy} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Alert Setup</Text>
      </View>

      <View style={styles.targetCard}>
        <Text style={styles.targetLabel}>Notify me for:</Text>
        <Text style={styles.targetName}>Human Computer Interaction</Text>
      </View>

      <Text style={styles.sectionTitle}>METHOD</Text>

      <View style={styles.settingRow}>
        <Text style={styles.settingLabel}>Push Notification</Text>
        <Switch 
          value={pushNotification} 
          onValueChange={setPushNotification} 
          trackColor={{ false: '#E2E8F0', true: BrandColors.orange }}
        />
      </View>

      <View style={styles.settingRow}>
        <Text style={styles.settingLabel}>Email Alert</Text>
        <Switch 
          value={emailAlert} 
          onValueChange={setEmailAlert} 
          trackColor={{ false: '#E2E8F0', true: BrandColors.orange }}
        />
      </View>

      <TouchableOpacity style={styles.saveButton}>
        <Text style={styles.saveButtonText}>Set Reminder</Text>
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
    marginBottom: Spacing.five,
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
  targetCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: Radius.md,
    padding: Spacing.four,
    marginBottom: Spacing.six,
  },
  targetLabel: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 4,
  },
  targetName: {
    fontSize: 16,
    fontWeight: '700',
    color: BrandColors.navy,
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
    fontSize: 15,
    color: BrandColors.navy,
  },
  saveButton: {
    backgroundColor: BrandColors.orange,
    height: 52,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.five,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  }
});
