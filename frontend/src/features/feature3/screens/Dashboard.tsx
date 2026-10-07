import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { feature3Api } from '../api';
import { router } from 'expo-router';

const PALETTE = {
  white: '#FFFFFF',
  navy: '#132455',
  orange: '#EA6A0C',
  green: '#16A34A',
  red: '#DC2626',
  muted: '#94A3B8',
  bgDark: '#0A1128',
  lightGray: '#E2E8F0',
};

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [creating, setCreating] = useState(false);

  const loadData = async () => {
    try {
      const res = await feature3Api.getDashboard();
      setDashboardData(res);
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Server is waking up or failed to load data. Please retry.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, []);

  const handleCreateAlert = async () => {
    try {
      setCreating(true);
      await feature3Api.createManualAlert({
        message: 'Manual alert from Dashboard',
        priority: 'HIGH',
      });
      Alert.alert('Success', 'Manual alert created');
      loadData();
    } catch (e) {
      Alert.alert('Error', 'Failed to create alert');
    } finally {
      setCreating(false);
    }
  };

  const rawZones = dashboardData?.zones || [];
  
  const aggregatedZones = useMemo(() => {
    const map = new Map<string, any>();
    rawZones.forEach((z: any) => {
      const key = z.zone;
      if (!map.has(key)) {
        map.set(key, { zone: key, floorLabel: z.floorLabel || z.zone, total: 0, available: 0, reserved: 0, occupied: 0 });
      }
      const existing = map.get(key);
      existing.total += z.total;
      existing.available += z.available;
      existing.reserved += z.reserved;
      existing.occupied += z.occupied;
    });
    return Array.from(map.values());
  }, [rawZones]);

  const totalCapacity = aggregatedZones.reduce((sum: number, z: any) => sum + z.total, 0);
  const totalOccupied = aggregatedZones.reduce((sum: number, z: any) => sum + (z.total - z.available), 0);
  const overallPercent = totalCapacity > 0 ? Math.round((totalOccupied / totalCapacity) * 100) : 0;

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={PALETTE.orange} />
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.contentContainer}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={PALETTE.orange} />}
    >
      
      <View style={styles.topCard}>
        <Text style={styles.topCardSubtitle}>LIBRARY OVERALL CAPACITY</Text>
        <Text style={styles.topCardTitle}>{overallPercent}% Full</Text>
      </View>

      <Text style={styles.sectionTitle}>LIVE ZONES</Text>
      
      {aggregatedZones.map((z: any, idx: number) => {
        const percent = Math.min(100, ((z.total - z.available) / (z.total || 1)) * 100);
        const percentRounded = Math.round(percent);
        const isCritical = percent >= 95;
        
        return (
          <TouchableOpacity 
            key={idx} 
            style={styles.zoneCard}
            onPress={() => router.push({ pathname: '/(tabs)/staff/zone-detail', params: { zone: z.zone } })}
            activeOpacity={0.7}
          >
            <View style={styles.zoneHeader}>
              <Text style={styles.zoneTitle}>{z.floorLabel}</Text>
              {isCritical ? (
                <Text style={[styles.zonePercent, { color: PALETTE.red }]}>⚠️ CRITICAL {percentRounded}%</Text>
              ) : (
                <Text style={[styles.zonePercent, { color: PALETTE.green }]}>{percentRounded}%</Text>
              )}
            </View>
            
            <View style={styles.progressBg}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${percent}%` },
                  isCritical ? { backgroundColor: PALETTE.red } : { backgroundColor: PALETTE.green }
                ]} 
              />
            </View>
          </TouchableOpacity>
        );
      })}
      
      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.actionBtn} onPress={handleCreateAlert} disabled={creating}>
          <Text style={styles.actionBtnText}>{creating ? 'Creating...' : 'Create Manual Alert'}</Text>
        </TouchableOpacity>
      </View>
      
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PALETTE.white,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  topCard: {
    backgroundColor: PALETTE.navy,
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
  },
  topCardSubtitle: {
    color: PALETTE.white,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  topCardTitle: {
    color: PALETTE.white,
    fontSize: 36,
    fontWeight: '800',
  },
  sectionTitle: {
    color: PALETTE.muted,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 16,
  },
  zoneCard: {
    backgroundColor: PALETTE.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: PALETTE.lightGray,
    padding: 16,
    marginBottom: 16,
  },
  zoneHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  zoneTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: PALETTE.navy,
  },
  zonePercent: {
    fontSize: 15,
    fontWeight: '700',
  },
  progressBg: {
    height: 8,
    backgroundColor: PALETTE.lightGray,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  actionsContainer: {
    marginTop: 20,
  },
  actionBtn: {
    backgroundColor: PALETTE.orange,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionBtnText: {
    color: PALETTE.white,
    fontWeight: '700',
    fontSize: 15,
  }
});
