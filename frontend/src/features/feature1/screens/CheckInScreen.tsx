import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, BrandColors } from '@/constants/theme';
import { Icons } from '../icons';

export default function CheckInScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  
  const spaceName = params.spaceName as string;
  const occupiedUntil = params.occupiedUntil as string;
  const timeStr = occupiedUntil ? occupiedUntil.substring(0, 5) : '';

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Checked In</Text>
      </View>

      <View style={styles.content}>
        <Ionicons name={Icons.checkedIn} size={64} color="#FFC107" style={{ marginBottom: 16 }} />
        <Text style={styles.title}>You're checked in!</Text>
        <Text style={styles.subtitle}>{spaceName}</Text>
        <Text style={styles.subtitle}>Occupied until {timeStr}</Text>

        <TouchableOpacity style={{ marginTop: 30 }} onPress={() => router.replace('/(tabs)/myspace' as any)}>
          <Text style={styles.linkText}>View My Reservations</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.backBtn} onPress={() => router.replace('/' as any)}>
          <Text style={styles.backBtnText}>Back to Map</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background },
  header: { paddingHorizontal: 16, paddingVertical: 12, alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '600', color: Colors.light.text },
  content: { flex: 1, alignItems: 'center', paddingTop: 60, paddingHorizontal: 20 },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 8, color: Colors.light.text },
  subtitle: { fontSize: 16, color: Colors.light.textSecondary, marginBottom: 4 },
  linkText: { fontSize: 16, color: BrandColors.primary, fontWeight: '600', marginBottom: 24 },
  backBtn: { paddingVertical: 12, paddingHorizontal: 24, backgroundColor: Colors.light.backgroundElement, borderRadius: 8 },
  backBtnText: { fontSize: 14, fontWeight: '600', color: Colors.light.text }
});
