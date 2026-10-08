import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Modal, Alert } from 'react-native';
import { feature3Api, StaffAlert } from '../api';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

const PALETTE = {
  white: '#FFFFFF',
  navy: '#132455',
  orange: '#EA6A0C',
  red: '#DC2626',
  warning: '#D97706',
  green: '#16A34A',
  muted: '#64748B',
  bgLight: '#F8FAFC',
  bgRedSoft: '#FEF2F2',
  border: '#E2E8F0',
};

export default function Alerts() {
  const [alerts, setAlerts] = useState<StaffAlert[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter state
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'Today' | 'This Week' | 'This Month' | 'This Year' | 'All'>('All');

  useEffect(() => {
    loadAlerts();
  }, [selectedFilter]);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      let rangeParam = 'all';
      if (selectedFilter === 'Today') rangeParam = 'today';
      if (selectedFilter === 'This Week') rangeParam = 'week';
      
      const res = await feature3Api.getAlerts(rangeParam);
      setAlerts(res || []);
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to load alerts.');
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (id: number) => {
    try {
      await feature3Api.resolveAlert(id);
      loadAlerts();
    } catch (e) {
      Alert.alert('Error', 'Failed to resolve alert');
    }
  };

  const handleDismiss = (id: number) => {
    Alert.alert('Dismiss Alert', 'Are you sure you want to dismiss this alert?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Dismiss', style: 'destructive', onPress: async () => {
        try {
          await feature3Api.deleteAlert(id);
          loadAlerts();
        } catch (e) {
          Alert.alert('Error', 'Failed to dismiss alert');
        }
      }}
    ]);
  };

  const handleMarkAllRead = async () => {
    try {
      await feature3Api.markAllAlertsRead();
      loadAlerts();
    } catch (e) {
      Alert.alert('Error', 'Failed to mark all read');
    }
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    let h = d.getHours();
    const m = d.getMinutes().toString().padStart(2, '0');
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${h}:${m} ${ampm}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>System Alerts</Text>
        <TouchableOpacity style={styles.filterBtn} onPress={() => setFilterModalVisible(true)}>
          <Ionicons name="filter" size={16} color={PALETTE.orange} />
          <Text style={styles.filterText}>Filter</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.markReadBtn} onPress={handleMarkAllRead}>
        <Text style={styles.markReadText}>Mark All as Read</Text>
      </TouchableOpacity>

      {loading ? (
        <ActivityIndicator size="large" color={PALETTE.orange} style={{ marginTop: 40 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.listContent}>
          {alerts.length === 0 && (
            <Text style={styles.emptyText}>No alerts found.</Text>
          )}
          {alerts.map(alert => {
            const isHigh = alert.priority === 'HIGH';
            const isResolved = alert.resolved;
            return (
              <View 
                key={alert.id} 
                style={[
                  styles.card,
                  isHigh ? { borderColor: PALETTE.red } : { borderColor: PALETTE.warning },
                  isResolved && { opacity: 0.6, borderColor: PALETTE.border }
                ]}
              >
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>
                    {alert.type === 'SEATING' ? '🚨 ' : '⚠️ '} 
                    {alert.type.charAt(0).toUpperCase() + alert.type.slice(1).toLowerCase()} Alert ({formatTime(alert.createdAt)})
                  </Text>
                  <TouchableOpacity onPress={() => handleDismiss(alert.id)}>
                    <Ionicons name="close" size={20} color={PALETTE.muted} />
                  </TouchableOpacity>
                </View>
                <Text style={[styles.cardMessage, !alert.isRead && { fontWeight: '700' }]}>{alert.message}</Text>
                
                {alert.type === 'SEATING' && alert.zone && !isResolved && (
                  <TouchableOpacity 
                    style={styles.actionBtnLight}
                    onPress={() => router.push({ pathname: '/(tabs)/staff/zone-detail', params: { zone: alert.zone } })}
                  >
                    <Text style={styles.actionBtnTextLight}>View Zone</Text>
                  </TouchableOpacity>
                )}
                
                {!isResolved && alert.type !== 'SEATING' && (
                  <TouchableOpacity 
                    style={styles.actionBtnDanger}
                    onPress={() => handleResolve(alert.id)}
                  >
                    <Text style={styles.actionBtnTextDanger}>Resolve</Text>
                  </TouchableOpacity>
                )}

                {isResolved && (
                  <Text style={styles.resolvedBadge}>✓ Resolved</Text>
                )}
              </View>
            );
          })}
        </ScrollView>
      )}

      {/* Filter Modal */}
      <Modal visible={filterModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter <Ionicons name="filter" size={18} color={PALETTE.orange} /></Text>
              <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
                <Ionicons name="close" size={24} color={PALETTE.navy} />
              </TouchableOpacity>
            </View>
            
            {['Today', 'This Week', 'This Month', 'This Year', 'All'].map(opt => (
              <TouchableOpacity 
                key={opt}
                style={styles.filterOption}
                onPress={() => {
                  setSelectedFilter(opt as any);
                  setFilterModalVisible(false);
                }}
              >
                <Ionicons 
                  name={selectedFilter === opt ? "checkbox" : "square-outline"} 
                  size={20} 
                  color={PALETTE.orange} 
                />
                <Text style={styles.filterOptionText}>{opt}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PALETTE.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 30,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: PALETTE.navy,
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterText: {
    color: PALETTE.orange,
    fontWeight: '700',
    marginLeft: 4,
    fontSize: 15,
  },
  markReadBtn: {
    paddingHorizontal: 20,
    paddingBottom: 10,
    alignSelf: 'flex-start',
  },
  markReadText: {
    color: PALETTE.muted,
    fontSize: 13,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  listContent: {
    padding: 20,
    paddingBottom: 40,
  },
  emptyText: {
    textAlign: 'center',
    color: PALETTE.muted,
    marginTop: 40,
  },
  card: {
    backgroundColor: PALETTE.white,
    borderWidth: 1.5,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: PALETTE.navy,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: PALETTE.navy,
    flex: 1,
  },
  cardMessage: {
    fontSize: 14,
    color: PALETTE.muted,
    lineHeight: 20,
    marginBottom: 16,
  },
  actionBtnLight: {
    backgroundColor: PALETTE.bgLight,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionBtnTextLight: {
    color: PALETTE.navy,
    fontWeight: '700',
    fontSize: 14,
  },
  actionBtnDanger: {
    backgroundColor: PALETTE.bgRedSoft,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionBtnTextDanger: {
    color: PALETTE.red,
    fontWeight: '700',
    fontSize: 14,
  },
  resolvedBadge: {
    color: PALETTE.green,
    fontWeight: '700',
    fontSize: 13,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: PALETTE.white,
    width: '85%',
    borderRadius: 24,
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: PALETTE.orange,
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  filterOptionText: {
    fontSize: 16,
    color: PALETTE.navy,
    marginLeft: 12,
    fontWeight: '500',
  }
});
