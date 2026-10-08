import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, RefreshControl, Alert, Modal } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Colors, BrandColors } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { getMyReservations, updateSlot } from '../api/reservations';
import { getSpaceDetail } from '../api/spaces';
import { ReservationResponse, TimeSlotDTO } from '../types';

export default function MyReservationsScreen() {
  const router = useRouter();
  const { isGuest, logout } = useAuth();
  
  const [reservations, setReservations] = useState<ReservationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Edit Modal State
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [reservationToEdit, setReservationToEdit] = useState<ReservationResponse | null>(null);
  const [availableSlots, setAvailableSlots] = useState<TimeSlotDTO[]>([]);
  const [fetchingSlots, setFetchingSlots] = useState(false);
  const [newSelectedSlot, setNewSelectedSlot] = useState<TimeSlotDTO | null>(null);
  const [updating, setUpdating] = useState(false);

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

  const openEditModal = async (r: ReservationResponse) => {
    setReservationToEdit(r);
    setEditModalVisible(true);
    setFetchingSlots(true);
    setNewSelectedSlot(null);
    try {
      // Fetch space details to get the current day's availability grid
      const spaceDetail = await getSpaceDetail(r.space.id);
      setAvailableSlots(spaceDetail.slots);
    } catch (e) {
      if (typeof window !== 'undefined') window.alert('Failed to load available slots.');
      else Alert.alert('Error', 'Failed to load available slots.');
      setEditModalVisible(false);
    } finally {
      setFetchingSlots(false);
    }
  };

  const handleConfirmEdit = async () => {
    if (!reservationToEdit || !newSelectedSlot) return;
    try {
      setUpdating(true);
      await updateSlot(
        reservationToEdit.id,
        reservationToEdit.reservationDate,
        newSelectedSlot.startTime,
        newSelectedSlot.endTime
      );
      if (typeof window !== 'undefined') window.alert('Success\n\nReservation time updated successfully!');
      else Alert.alert('Success', 'Reservation time updated successfully!');
      setEditModalVisible(false);
      loadData(); // Refresh the list
    } catch (e: any) {
      if (e.response?.status === 409) {
        if (typeof window !== 'undefined') window.alert('Conflict\n\nThis time slot is already booked. Please try another time.');
        else Alert.alert('Conflict', 'This time slot is already booked. Please try another time.');
      } else {
        if (typeof window !== 'undefined') window.alert('Error\n\nFailed to update reservation time.');
        else Alert.alert('Error', 'Failed to update reservation time.');
      }
    } finally {
      setUpdating(false);
    }
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
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TouchableOpacity 
                style={[styles.cancelBtn, { flex: 1, backgroundColor: '#E0F2FE' }]}
                onPress={() => openEditModal(r)}
              >
                <Text style={[styles.cancelBtnText, { color: '#0284C7' }]}>Edit Time</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.cancelBtn, { flex: 1 }]}
                onPress={() => router.push({ pathname: '/feature1/cancel', params: { data: JSON.stringify(r) } })}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      );
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={{ padding: 16 }}>
          {renderContent()}
        </View>
      </ScrollView>

      {/* Edit Time Modal */}
      <Modal
        visible={editModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Reschedule Reservation</Text>
            <Text style={styles.modalSubtitle}>Select a new time for {reservationToEdit?.space.name}</Text>

            {fetchingSlots ? (
              <ActivityIndicator size="large" color={BrandColors.primary} style={{ marginVertical: 30 }} />
            ) : (
              <View style={styles.slotGrid}>
                {availableSlots.map((slot, i) => {
                  const isActive = newSelectedSlot?.startTime === slot.startTime;
                  const timeStr = slot.startTime.substring(0, 5);
                  // Check if slot is booked (jackson mapping handling included)
                  // We also ignore the current reservation's own slot so they can click it if they want
                  let disabled = slot.isBooked || (slot as any).booked;
                  if (reservationToEdit && slot.startTime === reservationToEdit.startTime) {
                    disabled = false; // Allow them to select their current slot
                  }

                  return (
                    <TouchableOpacity
                      key={i}
                      style={[
                        styles.slotItem, 
                        isActive && styles.slotItemActive, 
                        disabled && styles.slotItemDisabled
                      ]}
                      disabled={disabled}
                      onPress={() => setNewSelectedSlot(slot)}
                    >
                      <Text style={[
                        styles.slotText, 
                        isActive && styles.slotTextActive, 
                        disabled && styles.slotTextDisabled
                      ]}>{timeStr}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.modalBtn, styles.modalBtnCancel]} 
                onPress={() => setEditModalVisible(false)}
                disabled={updating}
              >
                <Text style={styles.modalBtnCancelText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalBtn, (!newSelectedSlot || updating) && { opacity: 0.5 }]} 
                onPress={handleConfirmEdit}
                disabled={!newSelectedSlot || updating}
              >
                {updating ? <ActivityIndicator color="white" /> : <Text style={styles.modalBtnText}>Confirm</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
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
  cancelBtnText: { color: BrandColors.danger, fontWeight: '600', fontSize: 14 },

  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: 'white', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, minHeight: 400 },
  modalTitle: { fontSize: 20, fontWeight: '700', marginBottom: 8, color: Colors.light.text },
  modalSubtitle: { fontSize: 14, color: Colors.light.textSecondary, marginBottom: 24 },
  slotGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 30 },
  slotItem: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 20, borderWidth: 1, borderColor: Colors.light.backgroundSelected, backgroundColor: 'white' },
  slotItemActive: { backgroundColor: BrandColors.primary, borderColor: BrandColors.primary },
  slotItemDisabled: { backgroundColor: '#E2E8F0', borderColor: '#E2E8F0', opacity: 0.7 },
  slotText: { fontSize: 14, fontWeight: '600', color: Colors.light.text },
  slotTextActive: { color: 'white' },
  slotTextDisabled: { color: '#94A3B8', textDecorationLine: 'line-through' },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 'auto' },
  modalBtn: { flex: 1, backgroundColor: BrandColors.primary, paddingVertical: 16, borderRadius: 8, alignItems: 'center' },
  modalBtnCancel: { backgroundColor: '#F1F5F9' },
  modalBtnText: { color: 'white', fontWeight: '700', fontSize: 16 },
  modalBtnCancelText: { color: Colors.light.text, fontWeight: '700', fontSize: 16 }
});
