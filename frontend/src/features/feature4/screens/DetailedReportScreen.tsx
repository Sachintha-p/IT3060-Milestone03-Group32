import React from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SymbolView } from 'expo-symbols';
import { BrandColors, Spacing, Radius } from '@/constants/theme';

export default function DetailedReportScreen() {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={[styles.contentContainer, { paddingTop: insets.top + Spacing.four }]}
    >
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <SymbolView name="arrow.left" size={20} tintColor={BrandColors.navy} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Usage Report</Text>
      </View>

      <Text style={styles.reportDate}>Aug 01 – Aug 09, 2026</Text>
      <Text style={styles.reportAudience}>Audience: All Students</Text>

      {/* Card 1 */}
      <View style={styles.dataCard}>
        <Text style={styles.cardTitle}>Overcrowded Zone</Text>
        <Text style={styles.cardDetail}>Floor 1 (Quiet) (avg 100%)</Text>
      </View>

      {/* Card 2 */}
      <View style={styles.dataCard}>
        <Text style={styles.cardTitle}>Peak Occupancy Windows</Text>
        <Text style={styles.cardDetail}>10:00 AM – 12:00 PM · 02:00 PM – 04:00 PM</Text>
      </View>

      <Text style={[styles.sectionTitle, { marginTop: Spacing.three }]}>EXPORT OPTIONS</Text>

      <TouchableOpacity style={styles.exportCard}>
        <SymbolView name="doc.fill" size={16} tintColor="#94A3B8" style={styles.exportIcon} />
        <Text style={styles.exportText}>PDF Document (.pdf)</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.downloadButton}>
        <Text style={styles.downloadButtonText}>Download Data</Text>
      </TouchableOpacity>
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
    alignItems: 'center',
    marginBottom: Spacing.five,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.three,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: BrandColors.navy,
  },
  reportDate: {
    fontSize: 20,
    fontWeight: '700',
    color: BrandColors.navy,
    marginBottom: 6,
  },
  reportAudience: {
    fontSize: 15,
    color: '#64748B',
    marginBottom: Spacing.six,
  },
  dataCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: Radius.md,
    padding: Spacing.four,
    marginBottom: Spacing.four,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: BrandColors.navy,
    marginBottom: 6,
  },
  cardDetail: {
    fontSize: 15,
    color: '#64748B',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: Spacing.three,
    letterSpacing: 0.5,
  },
  exportCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: Radius.md,
    height: 52,
    paddingHorizontal: Spacing.four,
    marginBottom: Spacing.five,
  },
  exportIcon: {
    marginRight: Spacing.three,
  },
  exportText: {
    fontSize: 16,
    color: BrandColors.navy,
  },
  downloadButton: {
    backgroundColor: BrandColors.orange,
    height: 52,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  downloadButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  }
});
