import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SymbolView } from 'expo-symbols';
import { BrandColors, Spacing, Radius } from '@/constants/theme';
import { useLocalSearchParams, router } from 'expo-router';
import { feature2Api } from '../api';

export default function ReminderConfirmedScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const bookTitle = params.title as string;
  const alertId = params.alertId ? Number(params.alertId) : null;
  const channels = params.channels as string;
  const [loading, setLoading] = useState(false);

  const handleUndo = () => {
    if (!alertId) return;
    Alert.alert(
      'Undo Reminder',
      'Are you sure you want to cancel this reminder?',
      [
        { text: 'No', style: 'cancel' },
        { 
          text: 'Yes, Cancel', 
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await feature2Api.cancelAlert(alertId);
              router.replace('/(tabs)/books');
            } catch (err: any) {
              Alert.alert('Error', err.response?.data?.message || 'Failed to undo');
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + Spacing.four }]}>
      <Text style={styles.headerTitle}>Reminder Set</Text>

      <View style={styles.content}>
        {/* Bell Icon Simulation (Using standard yellow/gold symbol) */}
        <View style={styles.iconContainer}>
          <SymbolView name="bell.fill" size={64} tintColor="#EAB308" />
        </View>

        <Text style={styles.title}>We'll let you know</Text>
        <Text style={styles.message}>
          You'll get a {channels ? channels.toLowerCase().replace(',', ' and ') : 'push'} alert the moment "{bookTitle || 'the book'}" is back on the shelf.
        </Text>

        <TouchableOpacity style={styles.linkButton} onPress={() => router.replace('/(tabs)/notify')}>
          <Text style={styles.linkText}>View My Notifications</Text>
        </TouchableOpacity>

        {alertId && (
          <TouchableOpacity style={styles.linkButton} onPress={handleUndo} disabled={loading}>
            {loading ? <ActivityIndicator color={BrandColors.danger} /> : <Text style={styles.undoText}>Undo</Text>}
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.primaryButton} onPress={() => router.replace('/(tabs)/books')} disabled={loading}>
          <Text style={styles.primaryButtonText}>Back to Search</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: Spacing.four,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: BrandColors.navy,
    marginBottom: Spacing.six,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingTop: Spacing.six,
  },
  iconContainer: {
    marginBottom: Spacing.six,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: BrandColors.navy,
    marginBottom: Spacing.three,
  },
  message: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.six,
    paddingHorizontal: Spacing.four,
  },
  linkButton: {
    marginBottom: Spacing.four,
  },
  linkText: {
    color: BrandColors.orange,
    fontWeight: '700',
    fontSize: 16,
  },
  undoText: {
    color: BrandColors.danger,
    fontWeight: '700',
    fontSize: 16,
  },
  primaryButton: {
    marginTop: Spacing.four,
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    height: 52,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonText: {
    color: BrandColors.navy,
    fontSize: 16,
    fontWeight: '700',
  }
});
