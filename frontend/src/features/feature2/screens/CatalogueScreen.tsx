import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Text, TextInput, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { BrandColors, Spacing, Radius } from '@/constants/theme';

export default function CatalogueScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.contentContainer, { paddingTop: insets.top + Spacing.four }]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* Header */}
      <View style={styles.headerBlock}>
        <Text style={styles.headerTitle}>Catalogue</Text>
        <View style={styles.headerAccent} />
      </View>

      {/* Search Input */}
      <View style={[styles.searchContainer, searchFocused && styles.searchContainerFocused]}>
        <Ionicons
          name="search"
          size={20}
          color={searchFocused ? BrandColors.orange : '#64748B'}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search title, author, ISBN..."
          placeholderTextColor="#64748B"
          value={searchQuery}
          onChangeText={setSearchQuery}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={10}>
            <Ionicons name="close-circle" size={20} color="#64748B" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.resultsRow}>
        <Text style={styles.resultsText}>RESULTS (4)</Text>
        <View style={styles.resultsLine} />
      </View>

      {/* Book 1 */}
      <TouchableOpacity style={styles.bookCard} activeOpacity={0.85} onPress={() => router.push({ pathname: '/(tabs)/books/detail', params: { id: '1', title: 'Human Comp. Interact.', author: 'Preece, J.', isbn: '978-1-119-08531-1', status: 'MISSING', floor: 'Floor 2', shelf: 'Shelf B4' } })}>
        <View style={[styles.accentBar, { backgroundColor: BrandColors.danger }]} />
        <Ionicons name="book" size={26} color={BrandColors.navy} style={styles.bookIcon} />
        <View style={styles.bookContent}>
          <View style={styles.bookHeaderRow}>
            <Text style={styles.bookTitle}>Human Comp. Interact.</Text>
            <View style={[styles.statusBadge, { backgroundColor: '#FEE2E2' }]}>
              <View style={[styles.statusDot, { backgroundColor: BrandColors.danger }]} />
              <Text style={[styles.statusText, { color: BrandColors.danger }]}>MISSING</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="location" size={14} color="#64748B" />
            <Text style={styles.bookAuthorInfo}>Preece, J. · Floor 2, Shelf B4</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={18} color="#64748B" style={styles.chevron} />
      </TouchableOpacity>

      {/* Book 2 */}
      <TouchableOpacity style={styles.bookCard} activeOpacity={0.85} onPress={() => router.push({ pathname: '/(tabs)/books/detail', params: { id: '2', title: 'Design of Everyday Things', author: 'Don Norman', isbn: '978-0-465-06710-7', status: 'AVAILABLE', floor: 'Floor 1', shelf: 'Shelf A1' } })}>
        <View style={[styles.accentBar, { backgroundColor: '#166534' }]} />
        <Ionicons name="book" size={26} color={BrandColors.navy} style={styles.bookIcon} />
        <View style={styles.bookContent}>
          <View style={styles.bookHeaderRow}>
            <Text style={styles.bookTitle}>Design of Everyday Things</Text>
            <View style={[styles.statusBadge, { backgroundColor: '#DCFCE7' }]}>
              <View style={[styles.statusDot, { backgroundColor: '#166534' }]} />
              <Text style={[styles.statusText, { color: '#166534' }]}>AVAILABLE</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="person" size={14} color="#64748B" />
            <Text style={styles.bookAuthorInfo}>Don Norman</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={18} color="#64748B" style={styles.chevron} />
      </TouchableOpacity>

      {/* Book 3 */}
      <TouchableOpacity style={styles.bookCard} activeOpacity={0.85} onPress={() => router.push({ pathname: '/(tabs)/books/detail', params: { id: '3', title: 'Usability Engineering', author: 'Nielsen, J.', isbn: '978-0-125-18406-4', status: 'CHECKED_OUT', floor: 'Floor 2', shelf: 'Shelf C2' } })}>
        <View style={[styles.accentBar, { backgroundColor: '#92400E' }]} />
        <Ionicons name="book" size={26} color={BrandColors.navy} style={styles.bookIcon} />
        <View style={styles.bookContent}>
          <View style={styles.bookHeaderRow}>
            <Text style={styles.bookTitle}>Usability Engineering</Text>
            <View style={[styles.statusBadge, { backgroundColor: '#FEF3C7' }]}>
              <View style={[styles.statusDot, { backgroundColor: '#92400E' }]} />
              <Text style={[styles.statusText, { color: '#92400E' }]}>CHECKED OUT</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="location" size={14} color="#64748B" />
            <Text style={styles.bookAuthorInfo}>Nielsen, J. · Shelf C2 (due back)</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={18} color="#64748B" style={styles.chevron} />
      </TouchableOpacity>

      {/* Book 4 */}
      <TouchableOpacity style={styles.bookCard} activeOpacity={0.85} onPress={() => router.push({ pathname: '/(tabs)/books/detail', params: { id: '4', title: 'Advanced Java', author: 'Schildt, H.', isbn: '978-0-07-180855-4', status: 'MISSING', floor: 'Floor 3', shelf: 'Shelf C2' } })}>
        <View style={[styles.accentBar, { backgroundColor: BrandColors.danger }]} />
        <Ionicons name="book" size={26} color={BrandColors.navy} style={styles.bookIcon} />
        <View style={styles.bookContent}>
          <View style={styles.bookHeaderRow}>
            <Text style={styles.bookTitle}>Advanced Java</Text>
            <View style={[styles.statusBadge, { backgroundColor: '#FEE2E2' }]}>
              <View style={[styles.statusDot, { backgroundColor: BrandColors.danger }]} />
              <Text style={[styles.statusText, { color: BrandColors.danger }]}>MISSING</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="location" size={14} color="#64748B" />
            <Text style={styles.bookAuthorInfo}>Schildt, H. · Shelf C2</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={18} color="#64748B" style={styles.chevron} />
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

  // ---------- Header ----------
  headerBlock: {
    marginBottom: Spacing.four,
  },
  headerTitle: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '800',
    color: BrandColors.navy,
    letterSpacing: 0.3,
  },
  headerAccent: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: BrandColors.orange,
    marginTop: 6,
  },

  // ---------- Search ----------
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: Radius.md,
    height: 54,
    paddingHorizontal: Spacing.three,
    marginBottom: Spacing.four,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  searchContainerFocused: {
    borderColor: BrandColors.orange,
    shadowColor: BrandColors.orange,
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 4,
  },
  searchIcon: {
    marginRight: Spacing.two,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: BrandColors.navy,
    height: '100%',
    paddingVertical: 0,
  },

  // ---------- Results label ----------
  resultsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.three,
  },
  resultsText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 1,
    marginRight: Spacing.two,
  },
  resultsLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },

  // ---------- Book card ----------
  bookCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: Radius.md,
    paddingVertical: Spacing.three,
    paddingLeft: Spacing.four,
    paddingRight: Spacing.three,
    marginBottom: Spacing.three,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  accentBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 5,
  },
  bookIcon: {
    marginRight: Spacing.three,
  },
  bookContent: {
    flex: 1,
  },
  bookHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  bookTitle: {
    flex: 1,
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '700',
    color: BrandColors.navy,
    marginRight: Spacing.two,
  },
  chevron: {
    marginLeft: Spacing.two,
  },

  // ---------- Status badge ----------
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.6,
  },

  // ---------- Author / shelf info ----------
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bookAuthorInfo: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
    marginLeft: 5,
    flexShrink: 1,
  },
});