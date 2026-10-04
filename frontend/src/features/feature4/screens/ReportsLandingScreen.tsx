import React from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SymbolView } from 'expo-symbols';
import { BrandColors, Spacing, Radius } from '@/constants/theme';

export default function ReportsLandingScreen() {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={[styles.contentContainer, { paddingTop: insets.top + Spacing.four }]}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Analytics</Text>
        <TouchableOpacity style={styles.iconButton}>
          <SymbolView name="wrench.and.screwdriver" size={16} tintColor={BrandColors.navy} />
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>REPORT TYPE</Text>

      <TouchableOpacity style={[styles.selectorCard, styles.selectorCardActive]}>
        <Text style={styles.selectorCardTextActive}>Zone Usage</Text>
        <View style={styles.radioDot} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.selectorCard}>
        <Text style={styles.selectorCardText}>Book Demand</Text>
      </TouchableOpacity>

      <Text style={[styles.sectionTitle, { marginTop: Spacing.three }]}>PARAMETERS</Text>

      <TouchableOpacity style={styles.parameterCard}>
        <SymbolView name="calendar" size={16} tintColor="#64748B" style={styles.parameterIcon} />
        <Text style={styles.parameterText}>Aug 01 – Aug 09, 2026</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.parameterCard}>
        <SymbolView name="person.fill" size={16} tintColor="#64748B" style={styles.parameterIcon} />
        <Text style={styles.parameterText}>All Students</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.generateButton}>
        <Text style={styles.generateButtonText}>Generate</Text>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.six,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: BrandColors.navy,
  },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: Spacing.three,
    letterSpacing: 0.5,
  },
  selectorCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: Radius.md,
    height: 52,
    paddingHorizontal: Spacing.four,
    marginBottom: Spacing.three,
  },
  selectorCardActive: {
    backgroundColor: '#FFF7ED',
    borderColor: BrandColors.orange,
  },
  selectorCardText: {
    fontSize: 16,
    color: BrandColors.navy,
  },
  selectorCardTextActive: {
    fontSize: 16,
    fontWeight: '700',
    color: BrandColors.navy,
  },
  radioDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: BrandColors.orange,
  },
  parameterCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: Radius.md,
    height: 52,
    paddingHorizontal: Spacing.four,
    marginBottom: Spacing.three,
  },
  parameterIcon: {
    marginRight: Spacing.three,
  },
  parameterText: {
    fontSize: 16,
    color: BrandColors.navy,
  },
  generateButton: {
    backgroundColor: BrandColors.orange,
    height: 52,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.four,
  },
  generateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  }
});
