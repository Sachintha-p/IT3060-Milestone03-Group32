import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Text, RefreshControl, ActivityIndicator } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { feature3Api } from '../api';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, BrandColors, Spacing, Radius, FontSizes, FontWeights } from '@/constants/theme';

export default function StaffDashboardScreen() {
  const insets = useSafeAreaInsets();
  
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = async () => {
    try {
      setError(null);
      const res = await feature3Api.getRecentLogs();
      setLogs(res || []);
    } catch (e) {
      console.error(e);
      setError('Failed to load recent activity.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchLogs();
    }, [])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchLogs();
  }, []);

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={[styles.contentContainer, { paddingTop: insets.top + Spacing.four }]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={BrandColors.navy} />}
    >
      <Text style={styles.headerTitle}>Staff Dash</Text>

      {/* Main Capacity Card */}
      <View style={styles.capacityCard}>
        <Text style={styles.capacitySubtitle}>LIBRARY OVERALL CAPACITY</Text>
        <Text style={styles.capacityTitle}>66% Full</Text>
      </View>

      <Text style={styles.sectionTitle}>LIVE ZONES</Text>

      {/* Zone 1 */}
      <View style={styles.zoneCard}>
        <View style={styles.zoneHeader}>
          <Text style={styles.zoneName}>Floor 3 (Group)</Text>
          <Text style={[styles.zonePercent, { color: BrandColors.success }]}>50%</Text>
        </View>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: '50%', backgroundColor: BrandColors.success }]} />
        </View>
      </View>

      {/* Zone 2 (Critical) */}
      <View style={styles.zoneCard}>
        <View style={styles.zoneHeader}>
          <Text style={styles.zoneName}>Floor 1 (Quiet)</Text>
          <Text style={[styles.zonePercent, { color: BrandColors.danger, fontWeight: '700' }]}>⚠️ CRITICAL 100%</Text>
        </View>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: '100%', backgroundColor: BrandColors.danger }]} />
        </View>
      </View>

      {/* Zone 3 */}
      <View style={styles.zoneCard}>
        <View style={styles.zoneHeader}>
          <Text style={styles.zoneName}>Floor 2 (Silent Pods)</Text>
          <Text style={[styles.zonePercent, { color: BrandColors.success }]}>50%</Text>
        </View>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: '50%', backgroundColor: BrandColors.success }]} />
        </View>
      </View>

      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>RECENT ACTIVITY</Text>
        <View style={styles.accentLine} />
      </View>

      <View style={styles.activityCard}>
        {loading ? (
          <ActivityIndicator size="small" color={BrandColors.navy} style={{ padding: Spacing.four }} />
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : logs.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="time-outline" size={24} color={Colors.light.textSecondary} />
            <Text style={styles.emptyText}>No recent staff activity</Text>
          </View>
        ) : (
          logs.map((log, index) => (
            <View key={log.id || index} style={[styles.logRow, index !== logs.length - 1 && styles.logRowBorder]}>
              <View style={styles.logIconBox}>
                <Ionicons name="swap-horizontal" size={16} color={BrandColors.navy} />
              </View>
              <View style={styles.logContent}>
                <Text style={styles.logBookTitle}>{log.bookTitle || 'Unknown Book'}</Text>
                <Text style={styles.logActionText}>
                  <Text style={{fontWeight: '700'}}>{log.staffName}</Text>: {log.oldStatus || 'Unknown'} → {log.newStatus}
                </Text>
                <Text style={styles.logTime}>{new Date(log.createdAt).toLocaleString()}</Text>
              </View>
            </View>
          ))
        )}
      </View>

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
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: BrandColors.navy,
    marginBottom: Spacing.four,
  },
  capacityCard: {
    backgroundColor: BrandColors.navy,
    borderRadius: Radius.lg,
    padding: Spacing.five,
    marginBottom: Spacing.five,
  },
  capacitySubtitle: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: Spacing.two,
    opacity: 0.9,
  },
  capacityTitle: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '800',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.light.textSecondary,
    marginBottom: Spacing.three,
    letterSpacing: 0.5,
  },
  zoneCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: Radius.md,
    padding: Spacing.four,
    marginBottom: Spacing.three,
  },
  zoneHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.three,
  },
  zoneName: {
    fontSize: FontSizes.base,
    fontWeight: '700',
    color: BrandColors.navy,
  },
  zonePercent: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.four,
    marginBottom: Spacing.three,
  },
  accentLine: {
    height: 2,
    width: 24,
    backgroundColor: BrandColors.orange,
    marginLeft: Spacing.three,
    borderRadius: 1,
  },
  activityCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: Radius.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    overflow: 'hidden',
  },
  logRow: {
    flexDirection: 'row',
    padding: Spacing.four,
  },
  logRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  logIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.three,
  },
  logContent: {
    flex: 1,
  },
  logBookTitle: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
    color: BrandColors.navy,
    marginBottom: 2,
  },
  logActionText: {
    fontSize: FontSizes.sm,
    color: Colors.light.text,
    marginBottom: 4,
  },
  logTime: {
    fontSize: 11,
    color: Colors.light.textSecondary,
  },
  emptyState: {
    padding: Spacing.six,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    marginTop: Spacing.two,
    fontSize: FontSizes.sm,
    color: Colors.light.textSecondary,
  },
  errorText: {
    padding: Spacing.four,
    color: BrandColors.danger,
    fontSize: FontSizes.sm,
    textAlign: 'center',
  }
});
