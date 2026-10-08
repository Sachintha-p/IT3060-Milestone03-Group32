import React from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { BrandColors, Spacing, Radius } from '@/constants/theme';

type BookStatus = 'AVAILABLE' | 'CHECKED_OUT' | 'MISSING';

function getStatusStyle(status: BookStatus) {
  switch (status) {
    case 'AVAILABLE':
      return { bg: '#DCFCE7', color: '#166534', label: 'AVAILABLE' };
    case 'CHECKED_OUT':
      return { bg: '#FEF3C7', color: '#92400E', label: 'CHECKED OUT' };
    case 'MISSING':
    default:
      return { bg: '#FEE2E2', color: BrandColors.danger, label: 'MISSING' };
  }
}

export default function BookDetailScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{
    id: string;
    title: string;
    author: string;
    isbn: string;
    status: BookStatus;
    floor: string;
    shelf: string;
  }>();

  const status = params.status ?? 'MISSING';
  const statusStyle = getStatusStyle(status);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.contentContainer, { paddingTop: insets.top + Spacing.four }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={20} color={BrandColors.navy} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Book Info</Text>
      </View>

      {/* Cover card */}
      <View style={styles.bookCoverCard}>
        <Ionicons name="book" size={56} color={BrandColors.orange} />
      </View>

      {/* Title & Author */}
      <Text style={styles.bookTitle}>{params.title ?? '—'}</Text>
      <Text style={styles.bookAuthor}>Author: {params.author ?? '—'}</Text>

      {/* Info card */}
      <View style={styles.infoCard}>
        {/* Status row */}
        <View style={styles.infoRow}>
          <Ionicons name="ellipse" size={12} color={statusStyle.color} style={{ marginRight: 8 }} />
          <Text style={styles.infoLabel}>Status</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
            <Text style={[styles.statusBadgeText, { color: statusStyle.color }]}>{statusStyle.label}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Location row */}
        <View style={styles.infoRow}>
          <Ionicons name="location" size={16} color="#64748B" style={{ marginRight: 8 }} />
          <Text style={styles.infoLabel}>Location</Text>
          <Text style={styles.infoValue}>{params.floor ?? '—'}, {params.shelf ?? '—'}</Text>
        </View>

        <View style={styles.divider} />

        {/* ISBN row */}
        <View style={styles.infoRow}>
          <Ionicons name="barcode" size={16} color="#64748B" style={{ marginRight: 8 }} />
          <Text style={styles.infoLabel}>ISBN</Text>
          <Text style={styles.infoValue}>{params.isbn ?? '—'}</Text>
        </View>
      </View>

      {/* Reminder button */}
      <TouchableOpacity
        style={styles.reminderButton}
        activeOpacity={0.85}
        onPress={() => router.push({ pathname: '/(tabs)/books/reminder-confirmed', params: { title: params.title ?? '' } })}
      >
        <Ionicons name="notifications" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
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
    borderWidth: 1,
    borderColor: '#E2E8F0',
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
    paddingHorizontal: Spacing.four,
    marginBottom: Spacing.five,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.three,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: BrandColors.navy,
    fontWeight: '500',
    flexShrink: 1,
    textAlign: 'right',
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  reminderButton: {
    backgroundColor: BrandColors.orange,
    height: 52,
    borderRadius: Radius.md,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: BrandColors.orange,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  reminderButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
