import React from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SymbolView } from 'expo-symbols';
import { BrandColors, Spacing, Radius } from '@/constants/theme';

export default function SystemAlertsScreen() {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={[styles.contentContainer, { paddingTop: insets.top + Spacing.four }]}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>System Alerts</Text>
        <TouchableOpacity style={styles.filterBtn}>
          <SymbolView name="line.3.horizontal.decrease.circle.fill" size={16} tintColor={BrandColors.orange} style={{ marginRight: 4 }} />
          <Text style={styles.filterText}>Filter</Text>
        </TouchableOpacity>
      </View>

      {/* Alert Card 1 (Red) */}
      <View style={[styles.alertCard, { borderColor: BrandColors.danger }]}>
        <Text style={styles.alertTitle}>🚨 Seating Alert (10:45 AM)</Text>
        <Text style={styles.alertBody}>Floor 3 Group Zone reached 95% capacity. Action: Redirect students.</Text>
        <TouchableOpacity style={styles.viewZoneBtn}>
          <Text style={styles.viewZoneText}>View Zone</Text>
        </TouchableOpacity>
      </View>

      {/* Alert Card 2 (Orange) */}
      <View style={[styles.alertCard, { borderColor: '#D97706' }]}>
        <Text style={styles.alertTitle}>⚠️ Book Alert (09:30 AM)</Text>
        <Text style={styles.alertBody}>5 students requested 'Advanced Java'. Missing. Verify Shelf 4B.</Text>
        <TouchableOpacity style={styles.resolveBtn}>
          <Text style={styles.resolveText}>Resolve</Text>
        </TouchableOpacity>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.five,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: BrandColors.navy,
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterText: {
    color: BrandColors.orange,
    fontWeight: '600',
    fontSize: 14,
  },
  alertCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.four,
    marginBottom: Spacing.four,
  },
  alertTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: BrandColors.navy,
    marginBottom: 6,
  },
  alertBody: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
    marginBottom: Spacing.four,
  },
  viewZoneBtn: {
    backgroundColor: '#F1F5F9',
    borderRadius: Radius.md,
    paddingVertical: 12,
    alignItems: 'center',
  },
  viewZoneText: {
    color: BrandColors.navy,
    fontWeight: '700',
    fontSize: 14,
  },
  resolveBtn: {
    backgroundColor: '#FEE2E2',
    borderRadius: Radius.md,
    paddingVertical: 12,
    alignItems: 'center',
  },
  resolveText: {
    color: BrandColors.danger,
    fontWeight: '700',
    fontSize: 14,
  }
});
