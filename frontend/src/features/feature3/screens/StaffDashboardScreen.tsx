import React from 'react';
import { View, StyleSheet, ScrollView, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, BrandColors, Spacing, Radius, FontSizes, FontWeights } from '@/constants/theme';

export default function StaffDashboardScreen() {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={[styles.contentContainer, { paddingTop: insets.top + Spacing.four }]}
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
  }
});
