import React from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SymbolView } from 'expo-symbols';
import { BrandColors, Spacing, Radius } from '@/constants/theme';

export default function MyNotificationsScreen() {
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
        <Text style={styles.headerTitle}>My Notifications</Text>
      </View>

      {/* Notification Card 1 */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.bookTitle}>Usability Engineering</Text>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>RESERVED</Text>
          </View>
        </View>
        <Text style={styles.cardMessage}>You'll be notified when it's back on the shelf</Text>
        <TouchableOpacity style={styles.removeButton}>
          <Text style={styles.removeButtonText}>Remove</Text>
        </TouchableOpacity>
      </View>

      {/* Notification Card 2 */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.bookTitle}>Advanced Java</Text>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>RESERVED</Text>
          </View>
        </View>
        <Text style={styles.cardMessage}>You'll be notified when it's back on the shelf</Text>
        <TouchableOpacity style={styles.removeButton}>
          <Text style={styles.removeButtonText}>Remove</Text>
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
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: Radius.md,
    padding: Spacing.four,
    marginBottom: Spacing.four,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.two,
  },
  bookTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: BrandColors.navy,
    marginRight: Spacing.two,
  },
  statusBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#92400E',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  cardMessage: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: Spacing.four,
  },
  removeButton: {
    backgroundColor: '#FEE2E2',
    height: 44,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: BrandColors.danger,
    fontSize: 15,
    fontWeight: '700',
  }
});
