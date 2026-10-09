import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BrandColors, Spacing, Radius } from '@/constants/theme';
import { useLocalSearchParams, router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { feature3Api } from '../api';
import { getSpaces } from '@/features/feature1/api/spaces';
import { SpaceSummaryDTO } from '@/features/feature1/types';

export default function ZoneDetailScreen() {
  const insets = useSafeAreaInsets();
  const { zone } = useLocalSearchParams();
  const { user } = useAuth();
  
  const isStaff = user?.role === 'STAFF' || user?.role === 'ADMIN';

  const [spaces, setSpaces] = useState<SpaceSummaryDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  useEffect(() => {
    loadSpaces();
  }, [zone]);

  const loadSpaces = async () => {
    try {
      setLoading(true);
      const data = await getSpaces(zone ? { zone: [zone as any] } : undefined);
      setSpaces(data);
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to load spaces');
    } finally {
      setLoading(false);
    }
  };

  const handlePress = async (space: SpaceSummaryDTO) => {
    if (!isStaff || updatingId === space.id) return;

    const cycle = {
      'AVAILABLE': 'OCCUPIED',
      'OCCUPIED': 'RESERVED',
      'RESERVED': 'AVAILABLE'
    };
    const nextStatus = cycle[space.status as keyof typeof cycle] || 'AVAILABLE';

    // Optimistic update
    const previousSpaces = [...spaces];
    setSpaces(spaces.map(s => s.id === space.id ? { ...s, status: nextStatus as any } : s));
    setUpdatingId(space.id);

    try {
      await feature3Api.updateDeskStatus(space.id, nextStatus);
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to update space status');
      setSpaces(previousSpaces); // revert
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return { bg: '#DCFCE7', text: '#166534' };
      case 'RESERVED': return { bg: '#FEF3C7', text: '#92400E' };
      case 'OCCUPIED': return { bg: '#FEE2E2', text: '#991B1B' };
      default: return { bg: '#E2E8F0', text: '#475569' };
    }
  };

  const formatZoneName = (z?: string | string[]) => {
    if (!z) return 'Zone Details';
    return String(z).replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
  };

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={[styles.contentContainer, { paddingTop: insets.top + Spacing.four }]}
    >
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={BrandColors.navy} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{formatZoneName(zone)}</Text>
      </View>

      {isStaff && (
        <Text style={styles.instructions}>
          Tap a desk to cycle its status — changes reflect immediately on the student Map.
        </Text>
      )}

      {loading ? (
        <ActivityIndicator size="large" color={BrandColors.orange} style={{ marginTop: 40 }} />
      ) : (
        spaces.map((space) => {
          const colors = getStatusColor(space.status);
          return (
            <TouchableOpacity 
              key={space.id}
              style={[styles.deskCard, updatingId === space.id && { opacity: 0.6 }]}
              onPress={() => handlePress(space)}
              activeOpacity={isStaff ? 0.7 : 1}
            >
              <View>
                <Text style={styles.deskName}>{space.name}</Text>
                <View style={styles.amenityRow}>
                  {space.hasPowerOutlet && (
                    <View style={styles.amenityItem}>
                      <Ionicons name="flash" size={12} color="#64748B" />
                      <Text style={styles.amenityText}>Power</Text>
                    </View>
                  )}
                  {space.hasDesktopPc && (
                    <View style={styles.amenityItem}>
                      <Ionicons name="desktop" size={12} color="#64748B" />
                      <Text style={styles.amenityText}>PC</Text>
                    </View>
                  )}
                </View>
              </View>
              <View style={[styles.statusChip, { backgroundColor: colors.bg }]}>
                {updatingId === space.id ? (
                  <ActivityIndicator size="small" color={colors.text} />
                ) : (
                  <Text style={[styles.statusText, { color: colors.text }]}>{space.status}</Text>
                )}
              </View>
            </TouchableOpacity>
          );
        })
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
    marginBottom: Spacing.four,
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
  instructions: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
    marginBottom: Spacing.five,
  },
  deskCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: Radius.md,
    padding: Spacing.four,
    marginBottom: Spacing.three,
  },
  deskName: {
    fontSize: 16,
    fontWeight: '700',
    color: BrandColors.navy,
    marginBottom: 4,
  },
  amenityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  amenityText: {
    fontSize: 13,
    color: '#64748B',
    marginLeft: 4,
  },
  statusChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  }
});
