import React from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SymbolView } from 'expo-symbols';
import { BrandColors, Spacing, Radius } from '@/constants/theme';

export default function BookDetailScreen() {
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
        <Text style={styles.headerTitle}>Book Info</Text>
      </View>

      <View style={styles.bookCoverCard}>
        <SymbolView name="book.closed.fill" size={48} tintColor={BrandColors.danger} />
      </View>

      <Text style={styles.bookTitle}>Human Computer Interaction</Text>
      <Text style={styles.bookAuthor}>Author: Preece, J.</Text>

      <View style={styles.infoCard}>
        <Text style={styles.statusText}>Status: Missing / Misplaced</Text>
        <Text style={styles.locationText}>Floor 2, Shelf B4</Text>
      </View>

      <TouchableOpacity style={styles.reminderButton}>
        <Text style={styles.reminderButtonText}>Set a Reminder</Text>
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
  bookCoverCard: {
    height: 180,
    backgroundColor: BrandColors.navy,
    borderRadius: Radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.five,
  },
  bookTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: BrandColors.navy,
    marginBottom: 4,
  },
  bookAuthor: {
    fontSize: 15,
    color: '#64748B',
    marginBottom: Spacing.five,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: Radius.md,
    padding: Spacing.four,
    marginBottom: Spacing.five,
  },
  statusText: {
    fontSize: 15,
    fontWeight: '700',
    color: BrandColors.danger,
    marginBottom: 4,
  },
  locationText: {
    fontSize: 14,
    color: '#64748B',
  },
  reminderButton: {
    backgroundColor: BrandColors.orange,
    height: 52,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reminderButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  }
});
