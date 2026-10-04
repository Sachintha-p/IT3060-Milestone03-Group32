import React from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SymbolView } from 'expo-symbols';
import { BrandColors, Spacing, Radius } from '@/constants/theme';

export default function ZoneDetailScreen() {
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
        <Text style={styles.headerTitle}>Floor 1 (Quiet)</Text>
      </View>

      <Text style={styles.instructions}>
        Tap a desk to cycle its status — changes reflect immediately on the student Map.
      </Text>

      {/* Desk Card 1 */}
      <View style={styles.deskCard}>
        <View>
          <Text style={styles.deskName}>Desk B1</Text>
          <View style={styles.amenityRow}>
            <SymbolView name="bolt.fill" size={12} tintColor="#64748B" />
            <Text style={styles.amenityText}>Power</Text>
          </View>
        </View>
        <View style={[styles.statusChip, { backgroundColor: '#DCFCE7' }]}>
          <Text style={[styles.statusText, { color: '#166534' }]}>AVAILABLE</Text>
        </View>
      </View>

      {/* Desk Card 2 */}
      <View style={styles.deskCard}>
        <View>
          <Text style={styles.deskName}>Desk B2</Text>
          <View style={styles.amenityRow}>
            <SymbolView name="bolt.fill" size={12} tintColor="#64748B" />
            <Text style={styles.amenityText}>Power</Text>
          </View>
        </View>
        <View style={[styles.statusChip, { backgroundColor: '#FEF3C7' }]}>
          <Text style={[styles.statusText, { color: '#92400E' }]}>RESERVED</Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.four,
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
  instructions: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
    marginBottom: Spacing.five,
  },
  deskCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: Radius.md,
    padding: Spacing.four,
    marginBottom: Spacing.three,
  },
  deskName: {
    fontSize: 16,
    fontWeight: '700',
    color: BrandColors.navy,
    marginBottom: 4,
  },
  amenityRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  amenityText: {
    fontSize: 13,
    color: '#64748B',
    marginLeft: 4,
  },
  statusChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  }
});
