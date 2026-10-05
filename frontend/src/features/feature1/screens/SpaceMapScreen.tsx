import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl, ActivityIndicator, TextInput, Alert } from 'react-native';
import { useRouter, useFocusEffect, useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { useFeature1 } from '../context/Feature1Context';
import { Icons } from '../icons';
import { getSpaces } from '../api/spaces';
import { createAlert, getFilters } from '../api/reservations';
import { SpaceSummaryDTO } from '../types';

// 60% white  |  30% blue  |  10% orange
const PALETTE = {
  white: '#FFFFFF',       // 60% - screen and card surfaces
  paleBlue: '#EEF3FD',    // 60% - soft tint for inputs and toggle track
  line: '#E1E8F5',        // card borders
  navy: '#132455',        // 30% - titles
  blue: '#2352C8',        // 30% - active states, primary buttons
  orange: '#F47B20',      // 10% - accents only (Filters, Notify me)
  orangeSoft: '#FFF1E6',
  muted: '#64748B',
  danger: '#DC2626',
};

type ViewMode = 'list' | 'floor_plan';

export default function SpaceMapScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { user, isGuest } = useAuth();
  const { filters, setFilters } = useFeature1();

  const [mode, setMode] = useState<ViewMode>('list'); // Default to list view
  const [spaces, setSpaces] = useState<SpaceSummaryDTO[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      navigation.setOptions({
        title: mode === 'list' ? 'Space Map' : 'Floor Plan', // Dynamic title based on mode
      });
    }, [navigation, isGuest, user, mode])
  );

  const loadData = useCallback(async () => {
    try {
      setError(null);
      const res = await getSpaces(filters);
      setSpaces(res);
    } catch (err: any) {
      if (err.message?.includes('timeout') || err.message?.includes('Network')) {
        setError('Server is waking up, please try again');
      } else {
        setError('Failed to load data');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filters]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      // Auto-load saved filters from database once
      if (!isGuest && Object.keys(filters).length === 0) {
        getFilters().then(data => {
          if (data) {
            setFilters({
              floor: data.floor || undefined,
              zone: data.zone ? data.zone.split(',') : [],
              hasPower: data.hasPower !== null ? data.hasPower : undefined,
              hasPc: data.hasPc !== null ? data.hasPc : undefined,
            });
          }
        }).catch(e => console.log('Failed to auto-load filters', e))
          .finally(() => loadData());
      } else {
        loadData();
      }

      const interval = setInterval(loadData, 30000);
      return () => clearInterval(interval);
    }, [loadData, isGuest])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  // Status Pill Styles for List View
  const getListStyles = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return { text: '#065F46', bg: '#D1FAE5', bar: '#22C55E' };
      case 'OCCUPIED': return { text: '#DC2626', bg: '#FEE2E2', bar: '#EF4444' };
      case 'RESERVED': return { text: '#B45309', bg: '#FEF3C7', bar: '#F59E0B' };
      default: return { text: PALETTE.muted, bg: '#F1F5F9', bar: PALETTE.line };
    }
  };

  // Status Colors for Floor Plan View (Matches screenshot exactly)
  const getFloorPlanColors = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return { border: '#22C55E', bg: '#DCFCE7', text: '#16A34A' };
      case 'OCCUPIED': return { border: '#EF4444', bg: '#FEE2E2', text: '#DC2626' };
      case 'RESERVED': return { border: '#F59E0B', bg: '#FEF3C7', text: '#D97706' };
      default: return { border: '#E2E8F0', bg: '#F8FAFC', text: '#64748B' };
    }
  };

  const renderToggle = () => (
    <View style={styles.toggleContainer}>
      <TouchableOpacity
        style={[styles.toggleBtn, mode === 'list' && styles.toggleActive]}
        onPress={() => setMode('list')}
      >
        <Ionicons
          name={Icons.listView}
          size={18}
          color={mode === 'list' ? PALETTE.white : PALETTE.muted}
          style={{ marginBottom: 4 }}
        />
        <Text style={[styles.toggleText, mode === 'list' && styles.toggleTextActive]}>List View</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.toggleBtn, mode === 'floor_plan' && styles.toggleActive]}
        onPress={() => setMode('floor_plan')}
      >
        <Ionicons
          name={Icons.floorPlan}
          size={18}
          color={mode === 'floor_plan' ? PALETTE.white : PALETTE.muted}
          style={{ marginBottom: 4 }}
        />
        <Text style={[styles.toggleText, mode === 'floor_plan' && styles.toggleTextActive]}>Floor Plan</Text>
      </TouchableOpacity>
    </View>
  );

  const renderSearchBar = () => (
    <View style={styles.searchContainer}>
      <Ionicons name="search-outline" size={20} color={PALETTE.blue} style={styles.searchIcon} />
      <TextInput
        style={styles.searchInput}
        placeholder="Search zones or desks..."
        placeholderTextColor={PALETTE.muted}
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
    </View>
  );

  const renderSectionHeader = () => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>Floor 3 (Group)</Text>
      <TouchableOpacity style={styles.filterBtn} onPress={() => router.push('/feature1/filters')}>
        <Text style={styles.filterText}>Filters</Text>
      </TouchableOpacity>
    </View>
  );

  const handleNotify = async (space: SpaceSummaryDTO) => {
    try {
      await createAlert(space.zone);
      if (typeof window !== 'undefined') window.alert(`Success!\n\nPreferred-zone seat alert for ${space.name} created!`);
      else Alert.alert('Success', `Preferred-zone seat alert for ${space.name} created!`);
    } catch (e) {
      if (typeof window !== 'undefined') window.alert('Error\n\nFailed to create seat alert.');
      else Alert.alert('Error', 'Failed to create seat alert.');
    }
  };

  const renderContent = () => {
    if (loading) return <ActivityIndicator size="large" color={PALETTE.blue} style={{ marginTop: 50 }} />;
    if (error) return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={() => { setLoading(true); loadData(); }}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );

    const filteredSpaces = spaces.filter(s =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.floor.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (filteredSpaces.length === 0) return <Text style={styles.emptyText}>No spaces match your filters.</Text>;

    if (mode === 'list') {
      return filteredSpaces.map(s => {
        const { text: textColor, bg: bgColor, bar: barColor } = getListStyles(s.status);
        return (
          <TouchableOpacity
            key={s.id}
            style={[styles.listCard, { borderLeftColor: barColor }]}
            onPress={() => router.push({ pathname: '/feature1/reservation', params: { spaceId: s.id } })}
          >
            <View style={styles.listCardLeft}>
              <Text style={styles.listCardTitle}>{s.name}</Text>
              <Text style={styles.listCardSubtitle}>{s.floor} • Power</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <View style={[styles.statusPill, { backgroundColor: bgColor, marginBottom: s.status !== 'AVAILABLE' ? 8 : 0 }]}>
                <Text style={[styles.statusPillText, { color: textColor }]}>{s.status}</Text>
              </View>
              {s.status !== 'AVAILABLE' && (
                <TouchableOpacity style={styles.notifyBtn} onPress={() => handleNotify(s)}>
                  <Text style={styles.notifyText}>Notify me</Text>
                </TouchableOpacity>
              )}
            </View>
          </TouchableOpacity>
        );
      });
    }

    // Floor Plan Grid View
    return (
      <View style={styles.grid}>
        {filteredSpaces.map(s => {
          const colors = getFloorPlanColors(s.status);
          // Make rooms take full width, desks take half width
          const isFullWidth = s.name.toLowerCase().includes('rm') || s.name.toLowerCase().includes('room');

          return (
            <TouchableOpacity
              key={s.id}
              style={[
                styles.floorPlanTile,
                {
                  width: isFullWidth ? '100%' : '48%',
                  backgroundColor: colors.bg,
                  borderColor: colors.border
                }
              ]}
              onPress={() => {
                if (typeof window !== 'undefined') window.alert('Success\n\nDesk selected!');
                else Alert.alert('Success', 'Desk selected!');
                setTimeout(() => {
                  router.push({ pathname: '/feature1/reservation', params: { spaceId: s.id } });
                }, 500);
              }}
            >
              <Text style={styles.floorPlanName}>{s.name}</Text>
              <Text style={styles.floorPlanFloor}>
                {s.floor}{isFullWidth ? ' · seats 6' : ''}
              </Text>
              <Text style={[styles.floorPlanStatus, { color: colors.text }]}>{s.status}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={PALETTE.blue}
          colors={[PALETTE.blue]}
        />
      }
    >
      <View style={{ padding: 16 }}>
        {renderToggle()}

        {/* Only show Search Bar and Filter Header in List Mode */}
        {mode === 'list' && (
          <>
            {renderSearchBar()}
            {renderSectionHeader()}
          </>
        )}

        {/* Only show Legend in Floor Plan Mode */}
        {mode === 'floor_plan' && (
          <View style={styles.legendContainer}>
            <Text style={styles.legendTextTitle}>TAP A SPACE TO VIEW DETAILS</Text>
            <View style={styles.legendDots}>
              <View style={styles.legendItem}><View style={[styles.dot, { backgroundColor: '#16A34A' }]} /><Text style={styles.legendLabel}>Available</Text></View>
              <View style={styles.legendItem}><View style={[styles.dot, { backgroundColor: '#DC2626' }]} /><Text style={styles.legendLabel}>Occupied</Text></View>
              <View style={styles.legendItem}><View style={[styles.dot, { backgroundColor: '#D97706' }]} /><Text style={styles.legendLabel}>Reserved</Text></View>
            </View>
          </View>
        )}

        {renderContent()}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PALETTE.white,
  },

  // Toggle: pale blue track, solid blue active segment
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: PALETTE.paleBlue,
    borderRadius: 16,
    padding: 5,
    marginBottom: 20,
  },
  toggleBtn: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 12,
  },
  toggleActive: {
    backgroundColor: PALETTE.blue,
    shadowColor: PALETTE.blue,
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  toggleText: {
    fontSize: 12,
    color: PALETTE.muted,
    fontWeight: '600',
  },
  toggleTextActive: {
    color: PALETTE.white,
  },

  // Search
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PALETTE.paleBlue,
    borderWidth: 1,
    borderColor: PALETTE.line,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 11,
    marginBottom: 20,
  },
  searchIcon: { marginRight: 10 },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: PALETTE.navy,
  },

  // Section header
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: PALETTE.navy,
  },
  filterBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: PALETTE.orange,
    backgroundColor: PALETTE.orangeSoft,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '700',
    color: PALETTE.orange,
  },

  // List cards
  listCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: PALETTE.white,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: PALETTE.line,
    borderLeftWidth: 5,
    marginBottom: 12,
    shadowColor: PALETTE.navy,
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  listCardLeft: { flex: 1 },
  listCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: PALETTE.navy,
    marginBottom: 4,
  },
  listCardSubtitle: {
    fontSize: 13,
    color: PALETTE.muted,
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  notifyBtn: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: PALETTE.orange,
    backgroundColor: PALETTE.orangeSoft,
  },
  notifyText: {
    fontSize: 12,
    color: PALETTE.orange,
    fontWeight: '700',
  },

  // Legend (floor plan)
  legendContainer: {
    marginBottom: 20,
  },
  legendTextTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: PALETTE.blue,
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  legendDots: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  legendLabel: {
    fontSize: 13,
    color: PALETTE.navy,
  },

  // Floor plan grid
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  floorPlanTile: {
    borderWidth: 1.5,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  floorPlanName: {
    fontSize: 16,
    fontWeight: '700',
    color: PALETTE.navy,
    marginBottom: 6,
  },
  floorPlanFloor: {
    fontSize: 12,
    color: PALETTE.muted,
    marginBottom: 16,
  },
  floorPlanStatus: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  // Empty and error states
  emptyText: { textAlign: 'center', marginTop: 40, color: PALETTE.muted },
  errorContainer: { marginTop: 40, alignItems: 'center' },
  errorText: { color: PALETTE.danger, marginBottom: 16 },
  retryBtn: { paddingVertical: 12, paddingHorizontal: 28, backgroundColor: PALETTE.blue, borderRadius: 12 },
  retryText: { color: PALETTE.white, fontWeight: '700' },
});