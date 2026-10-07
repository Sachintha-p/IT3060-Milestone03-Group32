import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SymbolView } from 'expo-symbols';
import { BrandColors, Spacing, Radius } from '@/constants/theme';
import { feature2Api, Book, SearchHistory, RestockAlert } from '../api';
import { router, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function CatalogueScreen() {
  const { user, isGuest, logout } = useAuth();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [books, setBooks] = useState<Book[]>([]);
  const [history, setHistory] = useState<SearchHistory[]>([]);
  const [myAlerts, setMyAlerts] = useState<number[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isWakingUp, setIsWakingUp] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (user) {
        loadHistory();
        loadAlerts();
      }
      // Only load books if we already have a query or if it's the first load
      loadBooks(debouncedQuery);
    }, [user])
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    loadBooks(debouncedQuery);
    if (debouncedQuery.trim().length > 0) {
      feature2Api.addSearchHistory(debouncedQuery.trim()).then(loadHistory).catch(() => {});
    }
  }, [debouncedQuery]);

  const loadHistory = async () => {
    try {
      const data = await feature2Api.getSearchHistory();
      setHistory(data);
    } catch (err) {
      console.log('Failed to load history');
    }
  };

  const loadAlerts = async () => {
    if (!user) return;
    try {
      const alerts = await feature2Api.getMyAlerts();
      setMyAlerts(alerts.map(a => a.book.id));
    } catch (err) {
      console.log('Failed to load alerts');
    }
  };

  const loadBooks = async (query: string) => {
    try {
      setLoading(true);
      setError(null);
      let isSlow = false;
      const timeout = setTimeout(() => {
        isSlow = true;
        setIsWakingUp(true);
      }, 3000);
      
      const data = await feature2Api.searchBooks(query);
      clearTimeout(timeout);
      setBooks(data);
      setIsWakingUp(false);
    } catch (err: any) {
      setIsWakingUp(false);
      setError(err.response?.data?.message || 'Failed to load books. The server might be down.');
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = async () => {
    try {
      await feature2Api.clearSearchHistory();
      setHistory([]);
    } catch (err) {
      console.log('Failed to clear history');
    }
  };

  const handleHistorySelect = (query: string) => {
    setSearchQuery(query);
    setShowHistory(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return { bg: '#DCFCE7', text: '#166534' };
      case 'CHECKED_OUT': return { bg: '#FEF3C7', text: '#92400E' };
      case 'MISSING': return { bg: '#FEE2E2', text: '#DC2626' };
      default: return { bg: '#F1F5F9', text: '#64748B' };
    }
  };

  const getStatusLabel = (status: string) => {
    return status.replace('_', ' ');
  };

  const handleNotifyPress = (book: Book) => {
    if (isGuest || !user) {
      Alert.alert('Login Required', 'Guests cannot set reminders. Please log in.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Log in', onPress: () => { logout().then(() => router.replace('/(auth)/login')); } }
      ]);
      return;
    }
    if (myAlerts.includes(book.id)) {
      router.push({ pathname: '/(tabs)/books/detail', params: { id: book.id } });
    } else {
      router.push({ pathname: '/(tabs)/books/notify', params: { id: book.id, title: book.title } });
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + Spacing.four }]}>
      <View style={{ paddingHorizontal: Spacing.four }}>
        <Text style={styles.headerTitle}>Catalogue</Text>

        <View style={styles.searchContainer}>
          <SymbolView name="magnifyingglass" size={18} tintColor="#64748B" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search title, author, ISBN..."
            placeholderTextColor="#64748B"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={() => setShowHistory(true)}
            onBlur={() => setTimeout(() => setShowHistory(false), 200)}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={{ padding: 4 }}>
              <SymbolView name="xmark.circle.fill" size={16} tintColor="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {showHistory && searchQuery.length === 0 && history.length > 0 ? (
        <ScrollView style={styles.historyContainer} keyboardShouldPersistTaps="handled">
          <View style={styles.historyHeader}>
            <Text style={styles.historyTitle}>Recent Searches</Text>
            <TouchableOpacity onPress={handleClearHistory}>
              <Text style={styles.clearHistoryText}>Clear All</Text>
            </TouchableOpacity>
          </View>
          {history.map(item => (
            <TouchableOpacity 
              key={item.id} 
              style={styles.historyItem}
              onPress={() => handleHistorySelect(item.query)}
            >
              <SymbolView name="clock" size={16} tintColor="#94A3B8" style={styles.historyIcon} />
              <Text style={styles.historyItemText}>{item.query}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : (
        <ScrollView 
          style={styles.resultsContainer} 
          contentContainerStyle={styles.contentContainer}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.resultsText}>RESULTS ({books.length})</Text>

          {isWakingUp && loading && (
            <Text style={styles.wakingUpText}>Server is waking up, please wait...</Text>
          )}

          {loading && <ActivityIndicator size="large" color="#EA6A0C" style={{ marginTop: 20 }} />}
          
          {!loading && error && (
            <View style={{ alignItems: 'center', marginTop: 20 }}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity onPress={() => loadBooks(debouncedQuery)} style={styles.retryButton}>
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          )}

          {!loading && !error && books.length === 0 && (
            <Text style={styles.emptyText}>No books found matching your search.</Text>
          )}

          {!loading && !error && books.map((book) => {
            const colors = getStatusColor(book.status);
            const hasAlert = myAlerts.includes(book.id);
            return (
              <TouchableOpacity 
                key={book.id} 
                style={styles.bookCard}
                onPress={() => router.push({ pathname: '/(tabs)/books/detail', params: { id: book.id } })}
              >
                <View style={styles.bookHeaderRow}>
                  <Text style={styles.bookTitle} numberOfLines={1}>{book.title}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: colors.bg }]}>
                    <Text style={[styles.statusText, { color: colors.text }]}>{getStatusLabel(book.status)}</Text>
                  </View>
                </View>
                <Text style={styles.bookAuthorInfo}>{book.author} · {book.floor}, {book.shelf}</Text>
                
                {book.status !== 'AVAILABLE' && (
                  <TouchableOpacity 
                    style={styles.notifyRowButton}
                    onPress={() => handleNotifyPress(book)}
                  >
                    <Text style={[styles.notifyRowButtonText, hasAlert && { color: '#16A34A' }]}>
                      {hasAlert ? 'Reminder set' : 'Notify me'}
                    </Text>
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </View>
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
    color: '#132455',
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
    color: '#132455',
  },
  resultsContainer: {
    flex: 1,
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
    color: '#132455',
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
  },
  errorText: {
    color: '#DC2626',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  wakingUpText: {
    color: '#EA6A0C',
    textAlign: 'center',
    marginBottom: 10,
    fontStyle: 'italic',
  },
  retryButton: {
    backgroundColor: '#132455',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: Radius.md,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  emptyText: {
    color: '#64748B',
    textAlign: 'center',
    marginTop: 20,
    fontStyle: 'italic',
  },
  notifyRowButton: {
    marginTop: Spacing.three,
    alignSelf: 'flex-start',
  },
  notifyRowButtonText: {
    color: '#EA6A0C',
    fontSize: 14,
    fontWeight: '600',
  },
  historyContainer: {
    flex: 1,
    paddingHorizontal: Spacing.four,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.three,
  },
  historyTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  clearHistoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#EA6A0C',
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  historyIcon: {
    marginRight: Spacing.three,
  },
  historyItemText: {
    fontSize: 15,
    color: '#132455',
  }
});
