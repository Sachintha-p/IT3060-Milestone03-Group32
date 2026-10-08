import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, BrandColors } from '@/constants/theme';
import { useFeature1, FilterState } from '../context/Feature1Context';
import { Zone } from '../types';
import { saveFilter, getFilters } from '../api/reservations';
import { Alert } from 'react-native';

// Custom Switch component to match the exact Figma design
const CustomSwitch = ({ value, onValueChange }: { value: boolean, onValueChange: (v: boolean) => void }) => (
  <TouchableOpacity
    activeOpacity={0.8}
    onPress={() => onValueChange(!value)}
    style={[
      styles.customSwitch,
      {
        backgroundColor: value ? BrandColors.primary : '#E2E8F0',
        alignItems: value ? 'flex-end' : 'flex-start'
      }
    ]}
  >
    <View style={styles.switchThumb} />
  </TouchableOpacity>
);

export default function FiltersScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { filters, setFilters } = useFeature1();

  const [localFilters, setLocalFilters] = useState<FilterState>(filters);

  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    getFilters().then(data => {
      if (data) {
        setLocalFilters({
          floor: data.floor || undefined,
          zone: data.zone ? data.zone.split(',') : [],
          hasPower: data.hasPower !== null ? data.hasPower : undefined,
          hasPc: data.hasPc !== null ? data.hasPc : undefined,
        });
      }
    }).catch(e => {
      console.log('Error loading filter', e);
      if (typeof window !== 'undefined') window.alert('Error\n\nFailed to load saved filters.');
      else Alert.alert('Error', 'Failed to load saved filters.');
    }).finally(() => setLoading(false));
  }, []);

  const handleSaveFilter = async () => {
    try {
      setLoading(true);
      await saveFilter({
        floor: localFilters.floor || null,
        zone: localFilters.zone.length > 0 ? localFilters.zone.join(',') : null,
        hasPower: localFilters.hasPower !== undefined ? localFilters.hasPower : null,
        hasPc: localFilters.hasPc !== undefined ? localFilters.hasPc : null
      });
      if (typeof window !== 'undefined') window.alert('Success\n\nFilters successfully saved to database!');
      else Alert.alert('Success', 'Filters successfully saved to database!');
    } catch (e) {
      if (typeof window !== 'undefined') window.alert('Error\n\nFailed to save filters.');
      else Alert.alert('Error', 'Failed to save filters.');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadSavedFilter = async () => {
    try {
      setLoading(true);
      const data = await getFilters();
      if (data && (data.floor || data.zone || data.hasPower !== null || data.hasPc !== null)) {
        setLocalFilters({
          floor: data.floor || undefined,
          zone: data.zone ? (data.zone as string).split(',') as Zone[] : [],
          hasPower: data.hasPower !== null ? data.hasPower : undefined,
          hasPc: data.hasPc !== null ? data.hasPc : undefined,
        });
        if (typeof window !== 'undefined') window.alert('Success\n\nLoaded saved filters from database!');
        else Alert.alert('Success', 'Loaded saved filters from database!');
      } else {
        if (typeof window !== 'undefined') window.alert('Info\n\nNo saved filters found in database.');
        else Alert.alert('Info', 'No saved filters found in database.');
      }
    } catch (e) {
      if (typeof window !== 'undefined') window.alert('Error\n\nFailed to load saved filters.');
      else Alert.alert('Error', 'Failed to load saved filters.');
    } finally {
      setLoading(false);
    }
  };

  // Matched exactly to the screenshot
  const floors = ['Floor 3 (Group)', 'Floor 1 (Quiet)', 'Floor 2 (Silent Pods)'];
  const zones: { label: string, value: Zone }[] = [
    { label: 'Group Study Zone', value: 'GROUP_STUDY' },
    { label: 'Silent Study Zone', value: 'SILENT_STUDY' },
    { label: 'Reading Room Zone', value: 'READING_ROOM' }
  ];

  const handleApply = () => {
    setFilters(localFilters);
    router.back();
  };

  const toggleZone = (z: Zone) => {
    const current = localFilters.zone;
    if (current.includes(z)) {
      setLocalFilters({ ...localFilters, zone: current.filter(x => x !== z) });
    } else {
      setLocalFilters({ ...localFilters, zone: [...current, z] });
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={20} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Filters</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>

        {/* SELECT FLOOR */}
        <Text style={styles.sectionTitle}>SELECT FLOOR</Text>
        {floors.map(f => {
          const isActive = localFilters.floor === f;
          return (
            <TouchableOpacity
              key={f}
              style={[styles.floorCard, isActive ? styles.floorCardActive : styles.floorCardInactive]}
              onPress={() => setLocalFilters({ ...localFilters, floor: isActive ? undefined : f })}
              activeOpacity={0.7}
            >
              <Text style={styles.label}>{f}</Text>
              <View style={[styles.radioOuter, isActive ? styles.radioActive : styles.radioInactive]}>
                {isActive && <View style={styles.radioInner} />}
              </View>
            </TouchableOpacity>
          );
        })}

        {/* AMENITIES */}
        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>AMENITIES</Text>
        <View style={styles.toggleRow}>
          <Text style={styles.label}>Power Outlet</Text>
          <CustomSwitch
            value={localFilters.hasPower || false}
            onValueChange={v => setLocalFilters({ ...localFilters, hasPower: v ? true : undefined })}
          />
        </View>
        <View style={styles.toggleRow}>
          <Text style={styles.label}>Desktop PC</Text>
          <CustomSwitch
            value={localFilters.hasPc || false}
            onValueChange={v => setLocalFilters({ ...localFilters, hasPc: v ? true : undefined })}
          />
        </View>

        {/* ZONE (SELECT ANY) */}
        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>ZONE (SELECT ANY)</Text>
        {zones.map(z => (
          <View key={z.value} style={styles.toggleRow}>
            <Text style={styles.label}>{z.label}</Text>
            <CustomSwitch
              value={localFilters.zone.includes(z.value)}
              onValueChange={() => toggleZone(z.value)}
            />
          </View>
        ))}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.applyBtn} onPress={handleApply} activeOpacity={0.8}>
          <Text style={styles.applyBtnText}>Apply Filters</Text>
        </TouchableOpacity>
        
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 }}>
          <TouchableOpacity style={[styles.applyBtn, { flex: 1, marginRight: 6, backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0' }]} onPress={handleLoadSavedFilter} activeOpacity={0.8} disabled={loading}>
            <Text style={[styles.applyBtnText, { color: loading ? '#94A3B8' : BrandColors.navy, fontSize: 14 }]}>Load Saved</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.applyBtn, { flex: 1, marginLeft: 6, backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0' }]} onPress={handleSaveFilter} activeOpacity={0.8} disabled={loading}>
            <Text style={[styles.applyBtnText, { color: loading ? '#94A3B8' : BrandColors.navy, fontSize: 14 }]}>{loading ? 'Saving...' : 'Save Current'}</Text>
          </TouchableOpacity>
        </View>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8FAFC', // Light gray circle from the design
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B' // Dark Navy
  },
  content: {
    flex: 1,
    paddingHorizontal: 20
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 16,
    letterSpacing: 0.5
  },
  floorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12
  },
  floorCardActive: {
    borderColor: BrandColors.primary,
    backgroundColor: '#FFF7ED' // Very light orange background
  },
  floorCardInactive: {
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF'
  },
  label: {
    fontSize: 15,
    color: '#1E293B'
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center'
  },
  radioActive: {
    borderColor: BrandColors.primary,
  },
  radioInactive: {
    borderColor: '#E2E8F0',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: BrandColors.primary
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    marginBottom: 8
  },
  customSwitch: {
    width: 46,
    height: 26,
    borderRadius: 13,
    padding: 2,
    justifyContent: 'center'
  },
  switchThumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    paddingBottom: 30
  },
  applyBtn: {
    backgroundColor: BrandColors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center'
  },
  applyBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700'
  }
});