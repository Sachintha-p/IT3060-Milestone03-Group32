import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Image, ScrollView, Alert } from 'react-native';
import { feature3Api } from '../api';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

const PALETTE = {
  white: '#FFFFFF',
  navy: '#132455',
  orange: '#EA6A0C',
  red: '#DC2626',
  muted: '#64748B',
  bgLight: '#F1F5F9',
  border: '#CBD5E1',
  textSecondary: '#475569',
};

export default function UpdateTool() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [book, setBook] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [showAllLogs, setShowAllLogs] = useState(false);

  // We can hardcode standard statuses for library books based on screenshot
  const statuses = ["Available", "Issued", "Missing / Misplaced", "Reshelved"];
  // Map display labels → backend BookStatus enum values
  const STATUS_MAP: Record<string, string> = {
    "Available":           "AVAILABLE",
    "Issued":              "CHECKED_OUT",
    "Missing / Misplaced": "MISSING",
    "Reshelved":           "AVAILABLE",
  };
  const [selectedStatus, setSelectedStatus] = useState<string>('');

  const handleSearch = async () => {
    if (!query) return;
    try {
      setLoading(true);
      setBook(null);
      setLogs([]);
      setShowAllLogs(false);
      
      const res = await feature3Api.searchBooks(query);
      if (res && res.length > 0) {
        setBook(res[0]); // just take the first match
        setSelectedStatus(res[0].status || '');
        
        // Also fetch shelving logs
        const logsRes = await feature3Api.getShelvingLogs(res[0].id);
        setLogs(logsRes || []);
      } else {
        Alert.alert('Not Found', 'No book found for this query.');
      }
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Server is waking up or search failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!book || !selectedStatus) return;
    // Convert display label to backend enum value
    const backendStatus = STATUS_MAP[selectedStatus] ?? selectedStatus;

    // If no change (compare against current backend status)
    if (backendStatus === book.status) return;

    try {
      setUpdating(true);
      await feature3Api.updateBookStatus(book.id, backendStatus);
      Alert.alert('Success', 'Book status updated successfully');
      // Refresh book & logs
      const updatedRes = await feature3Api.searchBooks(book.title);
      if (updatedRes && updatedRes.length > 0) {
        setBook(updatedRes[0]);
        setSelectedStatus(updatedRes[0].status);
        const logsRes = await feature3Api.getShelvingLogs(updatedRes[0].id);
        setLogs(logsRes || []);
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to update book status.');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={PALETTE.navy} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Inventory</Text>
      </View>

      {!book ? (
        <View style={styles.searchSection}>
          <TextInput
            style={styles.input}
            placeholder="Enter Code"
            placeholderTextColor={PALETTE.muted}
            value={query}
            onChangeText={setQuery}
          />
          <TouchableOpacity style={styles.searchBtn} onPress={handleSearch} disabled={loading}>
            {loading ? <ActivityIndicator color={PALETTE.white} /> : <Text style={styles.searchBtnText}>Search</Text>}
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.detailSection}>
          
          <View style={styles.coverBox}>
            <Ionicons name="book" size={64} color={PALETTE.white} />
          </View>
          
          <Text style={styles.bookTitle}>{book.title}</Text>
          <Text style={styles.bookAuthor}>Author: {book.author}</Text>
          
          <View style={styles.statusCard}>
            <Text style={styles.statusText}>Status: <Text style={{color: PALETTE.red, fontWeight: '700'}}>{book.status}</Text></Text>
            <Text style={styles.shelfText}>{book.section}, Shelf {book.shelf}</Text>
          </View>
          
          <Text style={styles.sectionTitle}>UPDATE STATUS</Text>
          
          <View style={styles.radioGroup}>
            {statuses.map(s => (
              <TouchableOpacity 
                key={s} 
                style={[styles.radioItem, selectedStatus === s && styles.radioItemSelected]}
                onPress={() => setSelectedStatus(s)}
                activeOpacity={0.7}
              >
                <Text style={styles.radioText}>{s === 'Available' ? 'Available (Reshelved)' : s === 'Missing / Misplaced' ? 'Mark as Missing' : s}</Text>
                <View style={[styles.radioCircle, selectedStatus === s && styles.radioCircleSelected]} />
              </TouchableOpacity>
            ))}
          </View>
          
          <TouchableOpacity style={styles.updateBtn} onPress={handleUpdate} disabled={updating || selectedStatus === book.status}>
            {updating ? <ActivityIndicator color={PALETTE.white} /> : <Text style={styles.updateBtnText}>Save Changes</Text>}
          </TouchableOpacity>

          <View style={styles.logsSection}>
            <Text style={styles.sectionTitle}>RECENT LOGS</Text>
            {logs.length > 0 ? (
              <>
                <ScrollView 
                  style={[styles.logsScrollContainer, showAllLogs && logs.length > 5 ? { maxHeight: 300 } : {}]}
                  nestedScrollEnabled={true}
                >
                  {(showAllLogs ? logs : logs.slice(0, 5)).map((l, i) => (
                    <View key={i} style={styles.logItem}>
                      <Text style={styles.logText}>
                        <Text style={{fontWeight: '700'}}>{l.staffName}</Text> changed status from 
                      </Text>
                      <View style={styles.badgeRow}>
                        <View style={[styles.badge, getBadgeStyle(l.oldStatus)]}>
                          <Text style={[styles.badgeText, getBadgeTextStyle(l.oldStatus)]}>{l.oldStatus || 'Unknown'}</Text>
                        </View>
                        <Ionicons name="arrow-forward" size={14} color={PALETTE.muted} style={{marginHorizontal: 8}} />
                        <View style={[styles.badge, getBadgeStyle(l.newStatus)]}>
                          <Text style={[styles.badgeText, getBadgeTextStyle(l.newStatus)]}>{l.newStatus}</Text>
                        </View>
                      </View>
                      <Text style={styles.logDate}>{new Date(l.createdAt).toLocaleString()}</Text>
                    </View>
                  ))}
                </ScrollView>
                {logs.length > 5 && (
                  <TouchableOpacity 
                    style={styles.showAllBtn} 
                    onPress={() => setShowAllLogs(!showAllLogs)}
                  >
                    <Text style={styles.showAllBtnText}>
                      {showAllLogs ? 'Show less' : `Show all (${logs.length})`}
                    </Text>
                  </TouchableOpacity>
                )}
              </>
            ) : (
              <View style={styles.emptyLogs}>
                <Ionicons name="time-outline" size={32} color={PALETTE.border} />
                <Text style={styles.emptyLogsText}>No activity yet for this book</Text>
              </View>
            )}
          </View>
          
          <TouchableOpacity style={styles.clearBtn} onPress={() => setBook(null)}>
            <Text style={styles.clearBtnText}>Search Another Book</Text>
          </TouchableOpacity>

        </View>
      )}
      
    </ScrollView>
  );
}

const getBadgeStyle = (status: string) => {
  if (!status) return { backgroundColor: '#F1F5F9' };
  switch (status.toUpperCase()) {
    case 'AVAILABLE': return { backgroundColor: '#DCFCE7' };
    case 'CHECKED_OUT': return { backgroundColor: '#FEF3C7' };
    case 'MISSING': return { backgroundColor: '#FEE2E2' };
    default: return { backgroundColor: '#F1F5F9' };
  }
};

const getBadgeTextStyle = (status: string) => {
  if (!status) return { color: '#64748B' };
  switch (status.toUpperCase()) {
    case 'AVAILABLE': return { color: '#166534' };
    case 'CHECKED_OUT': return { color: '#92400E' };
    case 'MISSING': return { color: '#DC2626' };
    default: return { color: '#64748B' };
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PALETTE.bgLight,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: PALETTE.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: PALETTE.navy,
  },
  searchSection: {
    marginTop: 20,
  },
  input: {
    backgroundColor: PALETTE.white,
    borderWidth: 1,
    borderColor: PALETTE.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
  },
  searchBtn: {
    backgroundColor: PALETTE.orange,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  searchBtnText: {
    color: PALETTE.white,
    fontSize: 16,
    fontWeight: '700',
  },
  detailSection: {
    marginTop: 10,
  },
  coverBox: {
    backgroundColor: PALETTE.navy,
    borderRadius: 16,
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  bookTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: PALETTE.navy,
    marginBottom: 4,
  },
  bookAuthor: {
    fontSize: 14,
    color: PALETTE.textSecondary,
    marginBottom: 16,
  },
  statusCard: {
    backgroundColor: PALETTE.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: PALETTE.border,
    padding: 16,
    marginBottom: 24,
  },
  statusText: {
    fontSize: 15,
    fontWeight: '700',
    color: PALETTE.navy,
    marginBottom: 4,
  },
  redText: {
    color: PALETTE.red,
  },
  shelfText: {
    fontSize: 13,
    color: PALETTE.textSecondary,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: PALETTE.muted,
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  radioGroup: {
    marginBottom: 24,
  },
  radioItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: PALETTE.border,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    backgroundColor: PALETTE.white,
  },
  radioItemSelected: {
    borderColor: PALETTE.orange,
    backgroundColor: '#FDF7F3', // very light orange
  },
  radioText: {
    fontSize: 15,
    color: PALETTE.navy,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: PALETTE.border,
  },
  radioCircleSelected: {
    borderColor: PALETTE.orange,
    backgroundColor: PALETTE.orange,
  },
  updateBtn: {
    backgroundColor: PALETTE.orange,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  updateBtnText: {
    color: PALETTE.white,
    fontSize: 16,
    fontWeight: '700',
  },
  clearBtn: {
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: PALETTE.border,
    borderRadius: 12,
  },
  clearBtnText: {
    color: PALETTE.textSecondary,
    fontWeight: '600',
  },
  logsSection: {
    marginBottom: 24,
  },
  logItem: {
    backgroundColor: PALETTE.white,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: PALETTE.border,
  },
  logText: {
    fontSize: 14,
    color: PALETTE.navy,
    fontWeight: '600',
    marginBottom: 4,
  },
  logDate: {
    fontSize: 12,
    color: PALETTE.muted,
  },
  logsScrollContainer: {
    width: '100%',
  },
  showAllBtn: {
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 8,
  },
  showAllBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: PALETTE.navy,
  },
  emptyLogs: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: PALETTE.border,
    borderStyle: 'dashed',
  },
  emptyLogsText: {
    marginTop: 8,
    color: PALETTE.muted,
    fontSize: 14,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  }
});
