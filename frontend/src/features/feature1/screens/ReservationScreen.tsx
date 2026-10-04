import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, BrandColors } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { Icons } from '../icons';
import { getSpaceDetail } from '../api/spaces';
import { createReservation } from '../api/reservations';
import { SpaceDetailDTO, TimeSlotDTO } from '../types';

export default function ReservationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const { isGuest, logout } = useAuth();
  
  const spaceId = Number(params.spaceId);

  const [detail, setDetail] = useState<SpaceDetailDTO | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlotDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (isGuest) {
        logout();
      }
    }, [isGuest, logout])
  );

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getSpaceDetail(spaceId);
      setDetail(res);
      setSelectedSlot(null);
    } catch (err: any) {
      if (err.message?.includes('timeout') || err.message?.includes('Network')) {
        setError('Server is waking up, please try again');
      } else {
        setError('Failed to load space details');
      }
    } finally {
      setLoading(false);
    }
  }, [spaceId]);

  useEffect(() => {
    if (!isGuest) {
      loadData();
    }
  }, [isGuest, loadData]);

  const handleConfirm = async () => {
    if (!selectedSlot) return;
    try {
      setSubmitting(true);
      const todayStr = new Date().toISOString().split('T')[0];
      const res = await createReservation({
        spaceId,
        date: todayStr,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime
      });
      router.replace({ pathname: '/feature1/booking-confirmed', params: { data: JSON.stringify(res) } });
    } catch (err: any) {
      let msg = 'Failed to create reservation';
      if (err.response?.status === 409) {
        msg = err.response.data?.message || 'Space already booked';
      }
      Alert.alert('Booking Failed', msg, [{ text: 'OK', onPress: () => loadData() }]);
    } finally {
      setSubmitting(false);
    }
  };

  if (isGuest) return <View style={styles.container} />;

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name={Icons.back} size={24} color={Colors.light.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Booking</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView style={styles.content}>
        {loading ? (
          <ActivityIndicator size="large" color={BrandColors.primary} style={{ marginTop: 50 }} />
        ) : error ? (
          <View style={{ alignItems: 'center', marginTop: 50 }}>
            <Text style={{ color: BrandColors.danger, marginBottom: 16 }}>{error}</Text>
            <TouchableOpacity style={styles.confirmBtn} onPress={loadData}><Text style={styles.confirmBtnText}>Retry</Text></TouchableOpacity>
          </View>
        ) : detail && (
          <>
            <View style={styles.card}>
              <Text style={styles.spaceName}>{detail.space.name}</Text>
              <Text style={styles.spaceFloor}>{detail.space.floor}</Text>
              <View style={styles.badgeWrapper}>
                 <Text style={[styles.badgeText, { color: detail.space.status === 'AVAILABLE' ? BrandColors.success : (detail.space.status === 'RESERVED' ? BrandColors.warning : BrandColors.danger) }]}>{detail.space.status}</Text>
              </View>
            </View>

            <Text style={styles.sectionTitle}>TIME SLOT</Text>
            <View style={styles.slotGrid}>
              {detail.slots.map((slot, i) => {
                const isActive = selectedSlot?.startTime === slot.startTime;
                const timeStr = slot.startTime.substring(0, 5); // 10:00
                const isPast = false; // Simplified, ideally check if past current time
                const disabled = slot.isBooked || isPast;

                return (
                  <TouchableOpacity
                    key={i}
                    style={[styles.slotItem, isActive && styles.slotItemActive, disabled && styles.slotItemDisabled]}
                    disabled={disabled}
                    onPress={() => setSelectedSlot(slot)}
                  >
                    <Text style={[styles.slotText, isActive && styles.slotTextActive, disabled && styles.slotTextDisabled]}>{timeStr}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        )}
      </ScrollView>

      {!loading && !error && (
        <View style={styles.footer}>
          <TouchableOpacity 
            style={[styles.confirmBtn, (!selectedSlot || submitting) && styles.confirmBtnDisabled]} 
            onPress={handleConfirm}
            disabled={!selectedSlot || submitting}
          >
            {submitting ? <ActivityIndicator color="white" /> : <Text style={styles.confirmBtnText}>Confirm Booking</Text>}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: Colors.light.text },
  content: { flex: 1, padding: 20 },
  card: { backgroundColor: 'white', padding: 20, borderRadius: 12, marginBottom: 30, borderWidth: 1, borderColor: Colors.light.backgroundSelected, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  spaceName: { fontSize: 24, fontWeight: '700', marginBottom: 4 },
  spaceFloor: { fontSize: 14, color: Colors.light.textSecondary, marginBottom: 12 },
  badgeWrapper: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, backgroundColor: '#F8F9FA' },
  badgeText: { fontSize: 12, fontWeight: '700' },
  sectionTitle: { fontSize: 12, fontWeight: '700', color: Colors.light.textSecondary, marginBottom: 16, letterSpacing: 0.5 },
  slotGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  slotItem: { paddingVertical: 12, paddingHorizontal: 20, borderRadius: 24, borderWidth: 1, borderColor: Colors.light.backgroundSelected, backgroundColor: 'white' },
  slotItemActive: { backgroundColor: BrandColors.primary, borderColor: BrandColors.primary },
  slotItemDisabled: { backgroundColor: Colors.light.backgroundElement, borderColor: Colors.light.backgroundElement },
  slotText: { fontSize: 14, fontWeight: '600', color: Colors.light.text },
  slotTextActive: { color: 'white' },
  slotTextDisabled: { color: Colors.light.textSecondary },
  footer: { padding: 20, paddingBottom: 40, borderTopWidth: 1, borderTopColor: Colors.light.backgroundSelected },
  confirmBtn: { backgroundColor: BrandColors.primary, borderRadius: 8, paddingVertical: 16, alignItems: 'center' },
  confirmBtnDisabled: { opacity: 0.5 },
  confirmBtnText: { color: 'white', fontSize: 16, fontWeight: '700' }
});
