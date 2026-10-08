import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity, ActivityIndicator, Switch } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SymbolView } from 'expo-symbols';
import { BrandColors, Spacing, Radius } from '@/constants/theme';
import { feature4, AdminSetting, handleError } from '@/features/feature4/api';
import InlineMessage from '../components/InlineMessage';
import { useAuth } from '@/context/AuthContext';
import { router } from 'expo-router';

export default function AdminSettingsScreen() {
  const insets = useSafeAreaInsets();
  const { logout, user } = useAuth();
  
  const [settings, setSettings] = useState<AdminSetting | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const data = await feature4.settings.get();
      setSettings(data);
    } catch (err) {
      setErrorMsg(handleError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;
    try {
      setSaving(true);
      setErrorMsg('');
      setSuccessMsg('');
      await feature4.settings.update(settings);
      setSuccessMsg('Settings saved successfully.');
    } catch (err) {
      setErrorMsg(handleError(err));
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/');
  };

  const changeThreshold = (amount: number) => {
    if (settings) {
      let next = settings.occupancyThreshold + amount;
      if (next < 0) next = 0;
      if (next > 100) next = 100;
      setSettings({ ...settings, occupancyThreshold: next });
    }
  };

  const setThreshold = (val: number) => {
    if (settings) {
      setSettings({ ...settings, occupancyThreshold: val });
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={[styles.contentContainer, { paddingTop: insets.top + Spacing.four }]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Admin Settings</Text>
        </View>

        <InlineMessage type="error" message={errorMsg} />
        <InlineMessage type="success" message={successMsg} />

        {loading ? (
          <ActivityIndicator size="large" color={BrandColors.orange} style={{ marginTop: 20 }} />
        ) : errorMsg && !settings ? (
          <TouchableOpacity style={styles.retryBtn} onPress={fetchSettings}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        ) : settings ? (
          <>
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>OCCUPANCY ALERTS</Text>
              
              <Text style={styles.label}>Threshold Percentage</Text>
              <Text style={styles.helperText}>Used by the Occupancy report to flag busy zones</Text>
              
              <View style={styles.thresholdControl}>
                <TouchableOpacity style={styles.stepBtn} onPress={() => changeThreshold(-5)}>
                  <SymbolView name="minus" size={20} tintColor={BrandColors.navy} />
                </TouchableOpacity>
                <View style={styles.thresholdDisplay}>
                  <Text style={styles.thresholdValue}>{settings.occupancyThreshold}%</Text>
                </View>
                <TouchableOpacity style={styles.stepBtn} onPress={() => changeThreshold(5)}>
                  <SymbolView name="plus" size={20} tintColor={BrandColors.navy} />
                </TouchableOpacity>
              </View>

              <View style={styles.presetContainer}>
                {[70, 80, 90].map(val => (
                  <TouchableOpacity 
                    key={val} 
                    style={[styles.presetChip, settings.occupancyThreshold === val && styles.presetChipActive]}
                    onPress={() => setThreshold(val)}
                  >
                    <Text style={[styles.presetText, settings.occupancyThreshold === val && styles.presetTextActive]}>{val}%</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.card}>
              <Text style={styles.sectionTitle}>SYSTEM TOGGLES</Text>
              
              <View style={styles.toggleRow}>
                <View style={{ flex: 1, paddingRight: 12 }}>
                  <Text style={styles.toggleLabel}>Auto-Generate Weekly Report</Text>
                  <Text style={styles.helperText}>Used by backend scheduled tasks.</Text>
                </View>
                <Switch 
                  value={settings.autoGenerateWeeklyReport} 
                  onValueChange={v => setSettings({ ...settings, autoGenerateWeeklyReport: v })}
                  trackColor={{ false: '#E2E8F0', true: BrandColors.orange }}
                  thumbColor="#FFF"
                />
              </View>

              <View style={styles.divider} />

              <View style={styles.toggleRow}>
                <View style={{ flex: 1, paddingRight: 12 }}>
                  <Text style={styles.toggleLabel}>Allow Guest Lookups</Text>
                  <Text style={styles.helperText}>Used by other modules to allow anonymous searches.</Text>
                </View>
                <Switch 
                  value={settings.allowGuestLookups} 
                  onValueChange={v => setSettings({ ...settings, allowGuestLookups: v })}
                  trackColor={{ false: '#E2E8F0', true: BrandColors.orange }}
                  thumbColor="#FFF"
                />
              </View>
            </View>

            <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
              {saving ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveBtnText}>Save Settings</Text>}
            </TouchableOpacity>
          </>
        ) : null}

        <View style={styles.accountSection}>
          <Text style={styles.sectionTitle}>ACCOUNT</Text>
          <View style={styles.accountCard}>
            <View style={styles.accountInfo}>
              <View style={styles.avatar}>
                <SymbolView name="person.fill" size={20} tintColor="#FFF" />
              </View>
              <View>
                <Text style={styles.accountName}>{user?.name || 'Admin User'}</Text>
                <Text style={styles.accountEmail}>{user?.email}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
              <Text style={styles.logoutBtnText}>Log Out</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
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
    marginBottom: Spacing.four,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: BrandColors.navy,
  },
  retryBtn: {
    alignSelf: 'center',
    padding: Spacing.three,
    backgroundColor: '#E2E8F0',
    borderRadius: Radius.md,
    marginTop: Spacing.three,
  },
  retryText: {
    color: BrandColors.navy,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.lg,
    padding: Spacing.four,
    marginBottom: Spacing.four,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: Spacing.three,
    letterSpacing: 0.5,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    color: BrandColors.navy,
  },
  helperText: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 4,
    marginBottom: Spacing.three,
  },
  thresholdControl: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.four,
  },
  stepBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  thresholdDisplay: {
    width: 100,
    alignItems: 'center',
  },
  thresholdValue: {
    fontSize: 32,
    fontWeight: '800',
    color: BrandColors.orange,
  },
  presetContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  presetChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: Radius.full,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  presetChipActive: {
    backgroundColor: '#FFF7ED',
    borderColor: BrandColors.orange,
  },
  presetText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  presetTextActive: {
    color: BrandColors.orange,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.two,
  },
  toggleLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: BrandColors.navy,
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: Spacing.two,
  },
  saveBtn: {
    backgroundColor: BrandColors.orange,
    height: 48,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.six,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  accountSection: {
    marginTop: Spacing.two,
  },
  accountCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.lg,
    padding: Spacing.four,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  accountInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.four,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: BrandColors.navy,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.three,
  },
  accountName: {
    fontSize: 16,
    fontWeight: '700',
    color: BrandColors.navy,
  },
  accountEmail: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 2,
  },
  logoutBtn: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: Radius.md,
    padding: Spacing.three,
    alignItems: 'center',
  },
  logoutBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: BrandColors.navy,
  }
});
