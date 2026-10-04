import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import { Colors, BrandColors } from '@/constants/theme';
import { ReservationResponse } from '../types';
import { checkIn } from '../api/reservations';

export default function BookingConfirmedScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();

  const reservationStr = params.data as string;
  const reservation: ReservationResponse | null = reservationStr ? JSON.parse(reservationStr) : null;

  const [submitting, setSubmitting] = useState(false);
  const [checkInCode, setCheckInCode] = useState('');

  useEffect(() => {
    if (reservation) {
      setCheckInCode(reservation.code);
    }
  }, [reservation]);

  const handleCheckIn = async () => {
    if (!reservation) return;
    try {
      setSubmitting(true);
      const res = await checkIn(reservation.id);
      router.replace({ pathname: '/feature1/check-in', params: { spaceName: reservation.space.name, occupiedUntil: res.occupiedUntil } });
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Check-in failed';
      Alert.alert('Error', msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (!reservation) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={BrandColors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>

      {/* Left Aligned Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Booking Confirmed</Text>
      </View>

      <View style={styles.content}>
        {/* Green Square Success Icon */}
        <View style={styles.successBox}>
          <Ionicons name="checkmark" size={48} color="white" />
        </View>

        <Text style={styles.title}>You're all set!</Text>
        <Text style={styles.subtitle}>{reservation.space.name} · {reservation.space.floor}</Text>
        <Text style={styles.subtitle}>Today · {reservation.startTime.substring(0, 5)}</Text>

        <TouchableOpacity style={styles.linkWrapper} onPress={() => router.replace('/(tabs)/myspace' as any)}>
          <Text style={styles.linkText}>View My Bookings</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.backBtn} onPress={() => router.replace('/' as any)} activeOpacity={0.7}>
          <Text style={styles.backBtnText}>Back to Map</Text>
        </TouchableOpacity>

        {/* Dashed QR Box */}
        <View style={styles.qrSection}>
          <Text style={styles.qrTitle}>SHOW THIS AT THE DESK TO CHECK IN</Text>
          <View style={styles.qrBox}>
            <QRCode value={reservation.code || 'UNKNOWN'} size={100} color="#1E293B" backgroundColor="transparent" />
          </View>
          <Text style={{ marginTop: 16, fontSize: 16, fontWeight: '700', color: BrandColors.navy }}>
            CODE: {reservation.code}
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.checkInBtn} onPress={handleCheckIn} disabled={submitting} activeOpacity={0.8}>
          {submitting ? <ActivityIndicator color="white" /> : <Text style={styles.checkInBtnText}>Check In Now</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF'
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    alignItems: 'flex-start'
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B'
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 20,
    paddingHorizontal: 20
  },
  successBox: {
    backgroundColor: '#00C853',
    width: 64,
    height: 64,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 12
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 4
  },
  linkWrapper: {
    marginTop: 24,
    marginBottom: 24,
    padding: 8
  },
  linkText: {
    fontSize: 15,
    color: BrandColors.primary,
    fontWeight: '700'
  },
  backBtn: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center'
  },
  backBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B'
  },
  qrSection: {
    alignItems: 'center',
    marginTop: 40
  },
  qrTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 16,
    letterSpacing: 0.5
  },
  qrBox: {
    width: 140,
    height: 140,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center'
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 30
  },
  checkInBtn: {
    backgroundColor: BrandColors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center'
  },
  checkInBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700'
  }
});