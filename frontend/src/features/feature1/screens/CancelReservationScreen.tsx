import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, BrandColors } from '@/constants/theme';
import { Icons } from '../icons';
import { ReservationResponse } from '../types';
import { cancelReservation } from '../api/reservations';

export default function CancelReservationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  
  const reservation: ReservationResponse = JSON.parse(params.data as string);

  const [submitting, setSubmitting] = useState(false);

  const handleCancel = async () => {
    try {
      setSubmitting(true);
      await cancelReservation(reservation.id);
      router.back(); // Returns to My Reservations which will refresh on focus
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to cancel reservation');
      setSubmitting(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name={Icons.back} size={24} color={Colors.light.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cancel Reservation</Text>
        <View style={{ width: 32 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.spaceName}>{reservation.space.name}</Text>
          <Text style={styles.spaceFloor}>{reservation.space.floor}</Text>
          <View style={styles.badgeWrapper}>
             <Text style={styles.badgeText}>{reservation.status}</Text>
          </View>
        </View>

        <Text style={styles.confirmTitle}>ARE YOU SURE?</Text>
        <Text style={styles.confirmText}>You'll lose this time slot and it may be booked by someone else. This can't be undone.</Text>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel} disabled={submitting}>
          {submitting ? <ActivityIndicator color="white" /> : <Text style={styles.cancelBtnText}>Cancel Reservation</Text>}
        </TouchableOpacity>
        <TouchableOpacity style={styles.keepBtn} onPress={() => router.back()} disabled={submitting}>
          <Text style={styles.keepBtnText}>Keep Reservation</Text>
        </TouchableOpacity>
      </View>
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
  badgeWrapper: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, backgroundColor: '#FFF9E6' },
  badgeText: { fontSize: 12, fontWeight: '700', color: BrandColors.warning },
  confirmTitle: { fontSize: 14, fontWeight: '700', color: Colors.light.text, marginBottom: 8 },
  confirmText: { fontSize: 16, color: Colors.light.textSecondary, lineHeight: 24 },
  footer: { padding: 20, paddingBottom: 40 },
  cancelBtn: { backgroundColor: '#FFF0F0', borderRadius: 8, paddingVertical: 16, alignItems: 'center', marginBottom: 12 },
  cancelBtnText: { color: BrandColors.danger, fontSize: 16, fontWeight: '700' },
  keepBtn: { backgroundColor: Colors.light.backgroundElement, borderRadius: 8, paddingVertical: 16, alignItems: 'center' },
  keepBtnText: { color: Colors.light.text, fontSize: 16, fontWeight: '600' }
});
