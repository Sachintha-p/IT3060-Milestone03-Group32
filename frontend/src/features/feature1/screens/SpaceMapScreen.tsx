import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl, ActivityIndicator, TextInput } from 'react-native';
import { useRouter, useFocusEffect, useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, BrandColors } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useFeature1 } from '../context/Feature1Context';
import { Icons } from '../icons';
import { getSpaces } from '../api/spaces';
import { SpaceSummaryDTO } from '../types';

type ViewMode = 'list' | 'floor_plan';

export default function SpaceMapScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { user, isGuest } = useAuth();
  const { filters } = useFeature1();

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
        headerRight: () => (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 15 }}>
            <Ionicons name={Icons.legendPerson} size={18} color={Colors.light.textSecondary} />
            <Text style={{ marginLeft: 6, fontSize: 14, color: Colors.light.textSecondary }}>
              {isGuest ? 'Guest' : user?.email?.split('@')[0]}
            </Text>
          </View>
        ),
        headerLeft: () => null
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
      loadData();
      const interval = setInterval(loadData, 30000);
      return () => clearInterval(interval);
    }, [loadData])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  // Status Pill Styles for List View
  const getListStyles = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return { text: '#065F46', bg: '#D1FAE5' };
      case 'OCCUPIED': return { text: '#DC2626', bg: '#FEE2E2' };
      case 'RESERVED': return { text: '#D97706', bg: '#FEF3C7' };
      default: return { text: Colors.light.textSecondary, bg: '#F1F5F9' };
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
          color={mode === 'list' ? BrandColors.primary : Colors.light.textSecondary}
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
          color={mode === 'floor_plan' ? BrandColors.primary : Colors.light.textSecondary}
          style={{ marginBottom: 4 }}
        />
        <Text style={[styles.toggleText, mode === 'floor_plan' && styles.toggleTextActive]}>Floor Plan</Text>
      </TouchableOpacity>
    </View>
  );

  const renderSearchBar = () => (
    <View style={styles.searchContainer}>
      <Ionicons name="search-outline" size={20} color={Colors.light.textSecondary} style={styles.searchIcon} />
      <TextInput
        style={styles.searchInput}
        placeholder="Search zones or desks..."
        placeholderTextColor={Colors.light.textSecondary}
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
    </View>
  );

  const renderSectionHeader = () => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>Floor 3 (Group)</Text>
      <TouchableOpacity onPress={() => router.push('/feature1/filters')}>
        <Text style={styles.filterText}>Filters</Text>
      </TouchableOpacity>
    </View>
  );

  const renderContent = () => {
    if (loading) return <ActivityIndicator size="large" color={BrandColors.primary} style={{ marginTop: 50 }} />;
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
        const { text: textColor, bg: bgColor } = getListStyles(s.status);
        return (
          <TouchableOpacity
            key={s.id}
            style={styles.listCard}
            onPress={() => router.push({ pathname: '/feature1/reservation', params: { spaceId: s.id } })}
          >
            <View style={styles.listCardLeft}>
              <Text style={styles.listCardTitle}>{s.name}</Text>
              <Text style={styles.listCardSubtitle}>{s.floor} • Power</Text>
            </View>
            <View style={[styles.statusPill, { backgroundColor: bgColor }]}>
              <Text style={[styles.statusPillText, { color: textColor }]}>{s.status}</Text>
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
              onPress={() => router.push({ pathname: '/feature1/reservation', params: { spaceId: s.id } })}
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
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
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
    backgroundColor: '#FFFFFF'
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 6,
    marginBottom: 20
  },
  toggleBtn: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 10
  },
  toggleActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2
  },
  toggleText: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    fontWeight: '600'
  },
  toggleTextActive: {
    color: BrandColors.primary
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 20
  },
  searchIcon: { marginRight: 8 },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.light.text
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B'
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: BrandColors.primary
  },
  listCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  listCardLeft: { flex: 1 },
  listCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4
  },
  listCardSubtitle: {
    fontSize: 13,
    color: Colors.light.textSecondary
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5
  },
  legendContainer: {
    marginBottom: 20
  },
  legendTextTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 12,
    letterSpacing: 0.5
  },
  legendDots: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6
  },
  legendLabel: {
    fontSize: 13,
    color: '#334155'
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },
  floorPlanTile: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16
  },
  floorPlanName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 6
  },
  floorPlanFloor: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 16
  },
  floorPlanStatus: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5
  },
  emptyText: { textAlign: 'center', marginTop: 40, color: Colors.light.textSecondary },
  errorContainer: { marginTop: 40, alignItems: 'center' },
  errorText: { color: BrandColors.danger, marginBottom: 16 },
  retryBtn: { padding: 12, backgroundColor: BrandColors.primary, borderRadius: 8 },
  retryText: { color: 'white', fontWeight: '600' }
});