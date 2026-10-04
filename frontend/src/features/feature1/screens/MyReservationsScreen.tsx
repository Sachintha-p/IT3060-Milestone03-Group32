import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Colors, BrandColors } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { getMyReservations } from '../api/reservations';
import { ReservationResponse } from '../types';

export default function MyReservationsScreen() {
  const router = useRouter();
  const { isGuest, logout } = useAuth();
  
  const [reservations, setReservations] = useState<ReservationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setError(null);
      const res = await getMyReservations();
      setReservations(res);
    } catch (err: any) {
      if (err.message?.includes('timeout') || err.message?.includes('Network')) {
        setError('Server is waking up, please try again');
      } else {
        setError('Failed to load reservations');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (isGuest) {
        return; // Don't try to load reservations for guests
      }
      setLoading(true);
      loadData();
    }, [isGuest, loadData])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  if (isGuest) {
    return (
      <View style={[styles.container, { alignItems: 'center', justifyContent: 'center', padding: 20 }]}>
        <Text style={{ fontSize: 24, fontWeight: '700', color: Colors.light.text, marginBottom: 8 }}>Guest Mode</Text>
        <Text style={{ fontSize: 16, color: Colors.light.textSecondary, textAlign: 'center', marginBottom: 20 }}>
          Guests cannot make or view reservations. Please log in with a student or staff account.
        </Text>
        <TouchableOpacity style={styles.retryBtn} onPress={() => { logout(); router.replace('/'); }}>
          <Text style={styles.retryText}>Go to Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderContent = () => {
    if (loading) return <ActivityIndicator size="large" color={BrandColors.primary} style={{ marginTop: 50 }} />;
    if (error) return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={loadData}><Text style={styles.retryText}>Retry</Text></TouchableOpacity>
      </View>
    );

    if (reservations.length === 0) return <Text style={styles.emptyText}>You have no upcoming reservations.</Text>;

    return reservations.map(r => {
      const isReserved = r.status === 'RESERVED';
      const timeStr = r.startTime.substring(0, 5);
      // Determine if today or tomorrow
      const todayStr = new Date().toISOString().split('T')[0];
      const dateDisplay = r.reservationDate === todayStr ? 'Today' : r.reservationDate;

      return (
        <View key={r.id} style={styles.card}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.spaceName}>{r.space.name}</Text>
              <Text style={styles.spaceDetail}>{r.space.floor} | {dateDisplay} - {timeStr}</Text>
            </View>
            <View style={[styles.badgeWrapper, !isReserved && styles.badgeWrapperGreen]}>
              <Text style={[styles.badgeText, !isReserved && styles.badgeTextGreen]}>{r.status}</Text>
            </View>
          </View>
          
          {isReserved && (
            <TouchableOpacity 
              style={styles.cancelBtn}
              onPress={() => router.push({ pathname: '/feature1/cancel', params: { data: JSON.stringify(r) } })}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          )}
        </View>
      );
    });
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={{ padding: 16 }}>
        {renderContent()}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background },
  errorContainer: { marginTop: 40, alignItems: 'center' },
  errorText: { color: BrandColors.danger, marginBottom: 16 },
  retryBtn: { padding: 12, backgroundColor: BrandColors.primary, borderRadius: 8 },
  retryText: { color: 'white', fontWeight: '600' },
  emptyText: { textAlign: 'center', marginTop: 40, color: Colors.light.textSecondary },
  card: { backgroundColor: 'white', padding: 16, borderRadius: 12, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  spaceName: { fontSize: 18, fontWeight: '700', marginBottom: 4 },
  spaceDetail: { fontSize: 14, color: Colors.light.textSecondary },
  badgeWrapper: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, backgroundColor: '#FFF9E6' },
  badgeWrapperGreen: { backgroundColor: '#E6F4EA' },
  badgeText: { fontSize: 10, fontWeight: '700', color: BrandColors.warning },
  badgeTextGreen: { color: BrandColors.success },
  cancelBtn: { backgroundColor: '#FFF0F0', paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  cancelBtnText: { color: BrandColors.danger, fontWeight: '600', fontSize: 14 }
});
