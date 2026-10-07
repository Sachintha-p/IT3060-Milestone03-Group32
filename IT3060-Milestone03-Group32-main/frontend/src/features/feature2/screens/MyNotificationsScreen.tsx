import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SymbolView } from 'expo-symbols';
import { BrandColors, Spacing, Radius } from '@/constants/theme';
import { feature2Api, RestockAlert } from '../api';
import { useFocusEffect, router } from 'expo-router';

export default function MyNotificationsScreen() {
  const insets = useSafeAreaInsets();
  const [alerts, setAlerts] = useState<RestockAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAlerts = async () => {
    try {
      setError(null);
      const data = await feature2Api.getMyAlerts();
      setAlerts(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadAlerts();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadAlerts();
  };

  const handleRemove = (id: number) => {
    Alert.alert(
      'Remove Reminder',
      'Are you sure you want to remove this reminder?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await feature2Api.cancelAlert(id);
              setAlerts(alerts.filter(a => a.id !== id));
            } catch (err: any) {
              Alert.alert('Error', err.response?.data?.message || 'Failed to remove notification');
            }
          }
        }
      ]
    );
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      await feature2Api.cancelAlert(id);
      setAlerts(alerts.filter(a => a.id !== id));
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to mark as read');
    }
  };

  const notifiedAlerts = alerts.filter(a => a.status === 'NOTIFIED');
  const waitingAlerts = alerts.filter(a => a.status === 'WAITING');

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={[styles.contentContainer, { paddingTop: insets.top + Spacing.four }]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <SymbolView name="arrow.left" size={20} tintColor="#132455" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Notifications</Text>
      </View>

      {loading && !refreshing && (
        <ActivityIndicator size="large" color={BrandColors.primary} style={{ marginTop: 20 }} />
      )}

      {!loading && error && (
        <Text style={{ color: BrandColors.danger, textAlign: 'center', marginTop: 20 }}>{error}</Text>
      )}

      {!loading && !error && alerts.length === 0 && (
        <View style={{ alignItems: 'center', marginTop: 40 }}>
          <SymbolView name="bell.slash" size={48} tintColor="#CBD5E1" style={{ marginBottom: 16 }} />
          <Text style={{ color: '#64748B', fontSize: 16 }}>No active notifications</Text>
        </View>
      )}

      {!loading && !error && alerts.length > 0 && (
        <View>
          {notifiedAlerts.length > 0 && (
            <View style={{ marginBottom: Spacing.six }}>
              <Text style={styles.groupTitle}>Available Now</Text>
              {notifiedAlerts.map((alert) => (
                <View key={alert.id} style={[styles.card, { borderColor: '#16A34A', borderWidth: 2 }]}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.bookTitle}>{alert.book.title}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: '#DCFCE7' }]}>
                      <Text style={[styles.statusText, { color: '#166534' }]}>AVAILABLE</Text>
                    </View>
                  </View>
                  <Text style={styles.cardMessage}>Good news! This book is now back on the shelf.</Text>
                  <View style={styles.actionRow}>
                    <TouchableOpacity 
                      style={[styles.actionButton, { backgroundColor: '#16A34A' }]} 
                      onPress={() => router.push({ pathname: '/(tabs)/books/detail', params: { id: alert.book.id } })}
                    >
                      <Text style={[styles.actionButtonText, { color: '#FFFFFF' }]}>View Book</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.actionButton, { backgroundColor: '#F1F5F9' }]} 
                      onPress={() => handleMarkAsRead(alert.id)}
                    >
                      <Text style={[styles.actionButtonText, { color: '#64748B' }]}>Mark as Read</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}

          {waitingAlerts.length > 0 && (
            <View>
              <Text style={styles.groupTitle}>Waiting</Text>
              {waitingAlerts.map((alert) => (
                <View key={alert.id} style={styles.card}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.bookTitle}>{alert.book.title}</Text>
                    <View style={styles.statusBadge}>
                      <Text style={styles.statusText}>RESERVED</Text>
                    </View>
                  </View>
                  <Text style={styles.cardMessage}>You'll be notified when it's back on the shelf</Text>
                  <View style={styles.actionRow}>
                    <TouchableOpacity 
                      style={[styles.actionButton, { backgroundColor: '#132455' }]} 
                      onPress={() => router.push({ pathname: '/(tabs)/books/notify', params: { id: alert.book.id, title: alert.book.title, alertId: alert.id } })}
                    >
                      <Text style={[styles.actionButtonText, { color: '#FFFFFF' }]}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.actionButton, { backgroundColor: '#FEE2E2' }]} 
                      onPress={() => handleRemove(alert.id)}
                    >
                      <Text style={[styles.actionButtonText, { color: '#DC2626' }]}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      )}

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
    color: '#132455',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: Radius.md,
    padding: Spacing.four,
    marginBottom: Spacing.four,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.two,
  },
  bookTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: '#132455',
    marginRight: Spacing.two,
  },
  statusBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#92400E',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  cardMessage: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: Spacing.four,
  },
  groupTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#64748B',
    marginBottom: Spacing.three,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  actionRow: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  actionButton: {
    flex: 1,
    height: 44,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '700',
  }
});
