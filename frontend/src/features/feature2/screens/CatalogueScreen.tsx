import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Text, TextInput, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SymbolView } from 'expo-symbols';
import { BrandColors, Spacing, Radius } from '@/constants/theme';

export default function CatalogueScreen() {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={[styles.contentContainer, { paddingTop: insets.top + Spacing.four }]}
    >
      <Text style={styles.headerTitle}>Catalogue</Text>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <SymbolView name="magnifyingglass" size={18} tintColor="#64748B" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search title, author, ISBN..."
          placeholderTextColor="#64748B"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <Text style={styles.resultsText}>RESULTS (4)</Text>

      {/* Book 1 */}
      <TouchableOpacity style={styles.bookCard}>
        <View style={styles.bookHeaderRow}>
          <Text style={styles.bookTitle}>Human Comp. Interact.</Text>
          <View style={[styles.statusBadge, { backgroundColor: '#FEE2E2' }]}>
            <Text style={[styles.statusText, { color: BrandColors.danger }]}>MISSING</Text>
          </View>
        </View>
        <Text style={styles.bookAuthorInfo}>Preece, J. · Floor 2, Shelf B4</Text>
      </TouchableOpacity>

      {/* Book 2 */}
      <TouchableOpacity style={styles.bookCard}>
        <View style={styles.bookHeaderRow}>
          <Text style={styles.bookTitle}>Design of Everyday Things</Text>
          <View style={[styles.statusBadge, { backgroundColor: '#DCFCE7' }]}>
            <Text style={[styles.statusText, { color: '#166534' }]}>AVAILABLE</Text>
          </View>
        </View>
        <Text style={styles.bookAuthorInfo}>Don Norman</Text>
      </TouchableOpacity>

      {/* Book 3 */}
      <TouchableOpacity style={styles.bookCard}>
        <View style={styles.bookHeaderRow}>
          <Text style={styles.bookTitle}>Usability Engineering</Text>
          <View style={[styles.statusBadge, { backgroundColor: '#FEF3C7' }]}>
            <Text style={[styles.statusText, { color: '#92400E' }]}>CHECKED OUT</Text>
          </View>
        </View>
        <Text style={styles.bookAuthorInfo}>Nielsen, J. · Shelf C2 (due back)</Text>
      </TouchableOpacity>

      {/* Book 4 */}
      <TouchableOpacity style={styles.bookCard}>
        <View style={styles.bookHeaderRow}>
          <Text style={styles.bookTitle}>Advanced Java</Text>
          <View style={[styles.statusBadge, { backgroundColor: '#FEE2E2' }]}>
            <Text style={[styles.statusText, { color: BrandColors.danger }]}>MISSING</Text>
          </View>
        </View>
        <Text style={styles.bookAuthorInfo}>Schildt, H. · Shelf C2</Text>
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
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: BrandColors.navy,
    marginBottom: Spacing.four,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: Radius.md,
    height: 50,
    paddingHorizontal: Spacing.three,
    marginBottom: Spacing.four,
  },
  searchIcon: {
    marginRight: Spacing.two,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: BrandColors.navy,
  },
  resultsText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: Spacing.three,
    letterSpacing: 0.5,
  },
  bookCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: Radius.md,
    padding: Spacing.four,
    marginBottom: Spacing.three,
  },
  bookHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  bookTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: BrandColors.navy,
    marginRight: Spacing.two,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  bookAuthorInfo: {
    fontSize: 14,
    color: '#64748B',
  }
});
