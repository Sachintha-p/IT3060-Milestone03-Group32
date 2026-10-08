import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { feature3Api } from '../../../features/feature3/api';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

const PALETTE = {
  white: '#FFFFFF',
  navy: '#132455',
  orange: '#EA6A0C',
  red: '#DC2626',
  redSoft: '#FEF2F2',
  muted: '#64748B',
  border: '#E2E8F0',
  bgLight: '#F8FAFC',
};

export default function StaffSettings() {
  const [settings, setSettings] = useState<{ pushAlerts: boolean, emailDigest: boolean }>({
    pushAlerts: false,
    emailDigest: false
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const res = await feature3Api.getSettings();
      if (res) {
        setSettings(res);
      }
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const toggleSetting = async (key: 'pushAlerts' | 'emailDigest') => {
    const newSettings = { ...settings, [key]: !settings[key] };
    setSettings(newSettings);
    
    try {
      setSaving(true);
      await feature3Api.updateSettings(newSettings);
    } catch (e) {
      // Revert if failed
      setSettings(settings);
      Alert.alert('Error', 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: () => {
        // Simple logout for demo purposes
        router.replace('/');
      }}
    ]);
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={PALETTE.orange} />
      </View>
    );
  }

  return (
    <View style={styles.container}>

      <Text style={styles.sectionTitle}>NOTIFICATION PREFERENCES</Text>
      
      <View style={styles.card}>
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Ionicons name="notifications" size={24} color={PALETTE.navy} style={styles.icon} />
            <Text style={styles.settingLabel}>Push Alerts (High Priority)</Text>
          </View>
          <Switch 
            value={settings.pushAlerts} 
            onValueChange={() => toggleSetting('pushAlerts')} 
            trackColor={{ false: PALETTE.border, true: PALETTE.orange }}
            thumbColor="#FFFFFF"
            {...({ activeThumbColor: '#FFFFFF' } as any)}
            disabled={saving}
          />
        </View>
        <View style={styles.divider} />
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Ionicons name="mail" size={24} color={PALETTE.navy} style={styles.icon} />
            <Text style={styles.settingLabel}>Email Daily Digest</Text>
          </View>
          <Switch 
            value={settings.emailDigest} 
            onValueChange={() => toggleSetting('emailDigest')}
            trackColor={{ false: PALETTE.border, true: PALETTE.orange }}
            thumbColor="#FFFFFF"
            {...({ activeThumbColor: '#FFFFFF' } as any)}
            disabled={saving}
          />
        </View>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color={PALETTE.red} />
        <Text style={styles.logoutBtnText}>Logout</Text>
      </TouchableOpacity>
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PALETTE.bgLight,
    padding: 20,
    paddingTop: 30,
  },
  header: {
    marginBottom: 30,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: PALETTE.navy,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: PALETTE.muted,
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  card: {
    backgroundColor: PALETTE.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: PALETTE.border,
    marginBottom: 40,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 16,
    color: PALETTE.navy,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: PALETTE.border,
    marginLeft: 52, // align with text
  },
  logoutBtn: {
    flexDirection: 'row',
    backgroundColor: PALETTE.redSoft,
    padding: 16,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  logoutBtnText: {
    color: PALETTE.red,
    fontWeight: '700',
    fontSize: 16,
    marginLeft: 8,
  }
});
