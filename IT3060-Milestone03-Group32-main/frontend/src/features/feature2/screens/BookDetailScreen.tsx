import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SymbolView } from 'expo-symbols';
import { BrandColors, Spacing, Radius } from '@/constants/theme';
import { useLocalSearchParams, router } from 'expo-router';
import { feature2Api, Book, RestockAlert } from '../api';
import { useAuth } from '@/context/AuthContext';

export default function BookDetailScreen() {
  const { user, isGuest, logout } = useAuth();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const bookId = Number(params.id);

  const [book, setBook] = useState<Book | null>(null);
  const [activeAlert, setActiveAlert] = useState<RestockAlert | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (bookId) {
      loadData();
    }
  }, [bookId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await feature2Api.getBookDetails(bookId);
      setBook(data);
      if (user && data.status !== 'AVAILABLE') {
        const alerts = await feature2Api.getMyAlerts();
        const existing = alerts.find(a => a.book.id === bookId);
        if (existing) setActiveAlert(existing);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load book details');
    } finally {
      setLoading(false);
    }
  };

  const handleSetReminder = () => {
    if (isGuest || !user) {
      Alert.alert('Login Required', 'Guests cannot set reminders. Please log in.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Log in', onPress: () => { logout().then(() => router.replace('/(auth)/login')); } }
      ]);
      return;
    }
    router.push({ pathname: '/(tabs)/books/notify', params: { id: book?.id, title: book?.title } });
  };

  const handleEditReminder = () => {
    router.push({ pathname: '/(tabs)/books/notify', params: { id: book?.id, title: book?.title, alertId: activeAlert?.id } });
  };

  const handleCancelReminder = async () => {
    if (!activeAlert) return;
    try {
      setLoading(true);
      await feature2Api.cancelAlert(activeAlert.id);
      setActiveAlert(null);
      Alert.alert('Success', 'Reminder cancelled.');
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to cancel reminder');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return '#16A34A';
      case 'CHECKED_OUT': return '#EA6A0C';
      case 'MISSING': return '#DC2626';
      default: return '#64748B';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'MISSING': return 'Missing / Misplaced';
      case 'AVAILABLE': return 'Available';
      case 'CHECKED_OUT': return 'Checked Out';
      default: return status;
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={BrandColors.primary} />
      </View>
    );
  }

  if (error || !book) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: Spacing.four }]}>
        <Text style={{ color: BrandColors.danger, fontSize: 16 }}>{error || 'Book not found'}</Text>
        <TouchableOpacity style={[styles.backButton, { marginTop: Spacing.four }]} onPress={() => router.back()}>
          <Text style={{ color: BrandColors.navy }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={[styles.contentContainer, { paddingTop: insets.top + Spacing.four }]}
    >
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <SymbolView name="arrow.left" size={20} tintColor={BrandColors.navy} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Book Info</Text>
      </View>

      <View style={styles.bookCoverCard}>
        <SymbolView name="book.closed.fill" size={60} tintColor="#DC2626" />
      </View>

      <Text style={styles.bookTitle}>{book.title}</Text>
      <Text style={styles.bookAuthor}>Author: {book.author}</Text>

      <View style={styles.infoCard}>
        <Text style={[styles.statusText, { color: getStatusColor(book.status) }]}>
          Status: {getStatusLabel(book.status)}
        </Text>
        <Text style={styles.locationText}>{book.floor}, {book.shelf}</Text>
      </View>

      {book.status !== 'AVAILABLE' && !activeAlert && (
        <TouchableOpacity 
          style={styles.reminderButton}
          onPress={handleSetReminder}
        >
          <Text style={styles.reminderButtonText}>Set a Reminder</Text>
        </TouchableOpacity>
      )}

      {book.status !== 'AVAILABLE' && activeAlert && (
        <View style={styles.activeAlertContainer}>
          <Text style={styles.reminderSetText}>Reminder Set</Text>
          <View style={styles.alertActionsRow}>
            <TouchableOpacity style={styles.editButton} onPress={handleEditReminder}>
              <Text style={styles.editButtonText}>Edit Channels</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancelReminder}>
              <Text style={styles.cancelButtonText}>Cancel Reminder</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
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
    color: '#132455',
  },
  bookCoverCard: {
    height: 180,
    backgroundColor: '#132455',
    borderRadius: Radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.five,
  },
  bookTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#132455',
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
  },
  activeAlertContainer: {
    backgroundColor: '#F8FAFC',
    padding: Spacing.four,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  reminderSetText: {
    color: '#16A34A',
    fontWeight: '800',
    fontSize: 18,
    marginBottom: Spacing.four,
  },
  alertActionsRow: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  editButton: {
    flex: 1,
    backgroundColor: '#132455',
    height: 44,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#FEE2E2',
    height: 44,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#DC2626',
    fontWeight: '700',
  }
});
