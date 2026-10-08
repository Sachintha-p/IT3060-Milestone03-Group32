import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity, TextInput, ActivityIndicator, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SymbolView } from 'expo-symbols';
import { BrandColors, Spacing, Radius } from '@/constants/theme';
import { feature4, ReportSummary, handleError } from '@/features/feature4/api';
import { router } from 'expo-router';
import ConfirmModal from '../components/ConfirmModal';
import InlineMessage from '../components/InlineMessage';

const TYPE_OPTIONS = [
  { id: 'USAGE', label: 'Zone Usage', desc: 'Track space utilization' },
  { id: 'OCCUPANCY', label: 'Occupancy', desc: 'Real-time capacities' },
  { id: 'BOOKS', label: 'Book Demand', desc: 'Catalog trends' },
  { id: 'USERS', label: 'User Activity', desc: 'App engagement' }
];

export default function ReportsLandingScreen() {
  const insets = useSafeAreaInsets();
  
  const [reports, setReports] = useState<ReportSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState('');
  
  const [type, setType] = useState('USAGE');
  
  const formatDate = (d: Date) => d.toISOString().split('T')[0];
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [reportToDelete, setReportToDelete] = useState<number | null>(null);

  useEffect(() => {
    handlePreset('Last 30 days');
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const data = await feature4.reports.getAll();
      setReports(data);
      setErrorMsg('');
    } catch (err) {
      setErrorMsg(handleError(err));
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchReports();
    setRefreshing(false);
  };

  const handlePreset = (preset: string) => {
    const today = new Date();
    setDateTo(formatDate(today));
    
    const from = new Date();
    if (preset === 'Last 7 days') {
      from.setDate(today.getDate() - 7);
    } else if (preset === 'Last 30 days') {
      from.setDate(today.getDate() - 30);
    } else if (preset === 'This month') {
      from.setDate(1);
    }
    setDateFrom(formatDate(from));
  };

  const validateDates = () => {
    if (!dateFrom || !dateTo) return 'Both dates are required';
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateFrom) || !regex.test(dateTo)) return 'Format must be YYYY-MM-DD';
    
    const dFrom = new Date(dateFrom);
    const dTo = new Date(dateTo);
    const today = new Date();
    
    if (isNaN(dFrom.getTime()) || isNaN(dTo.getTime())) return 'Invalid date';
    if (dFrom > dTo) return 'From date cannot be after To date';
    if (dTo > today) return 'To date cannot be in the future';
    
    const diffTime = Math.abs(dTo.getTime() - dFrom.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    if (diffDays > 366) return 'Range cannot exceed 366 days';
    
    return '';
  };

  const dateError = validateDates();
  const isGenerateDisabled = generating || !!dateError;

  const handleGenerate = async () => {
    if (dateError) return;
    try {
      setGenerating(true);
      setGenError('');
      const newReport = await feature4.reports.create({ type, dateFrom, dateTo });
      router.push(`/(tabs)/analytics-detail?id=${newReport.id}`);
    } catch (err) {
      setGenError(handleError(err));
    } finally {
      setGenerating(false);
    }
  };

  const confirmDelete = (id: number) => {
    setReportToDelete(id);
    setDeleteModalVisible(true);
  };

  const handleDelete = async () => {
    if (!reportToDelete) return;
    setDeleteModalVisible(false);
    try {
      await feature4.reports.delete(reportToDelete);
      await fetchReports();
    } catch (err) {
      setErrorMsg(handleError(err));
    } finally {
      setReportToDelete(null);
    }
  };

  const selectedTypeDesc = TYPE_OPTIONS.find(t => t.id === type)?.desc;

  return (
    <View style={styles.container}>
      <ScrollView 
        contentContainerStyle={[styles.contentContainer, { paddingTop: insets.top + Spacing.four }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={BrandColors.orange} />}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Analytics</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>GENERATE NEW REPORT</Text>

          <Text style={styles.label}>Report Type</Text>
          <View style={styles.typesContainer}>
            {TYPE_OPTIONS.map(t => (
              <TouchableOpacity 
                key={t.id}
                style={[styles.typeChip, type === t.id && styles.typeChipActive]}
                onPress={() => setType(t.id)}
              >
                <Text style={[styles.typeChipText, type === t.id && styles.typeChipTextActive]}>{t.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.typeDesc}>{selectedTypeDesc}</Text>

          <Text style={styles.label}>Date Range</Text>
          <View style={styles.presetContainer}>
            {['Last 7 days', 'Last 30 days', 'This month'].map(p => (
              <TouchableOpacity key={p} style={styles.presetChip} onPress={() => handlePreset(p)}>
                <Text style={styles.presetText}>{p}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.dateInputs}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={styles.subLabel}>From (YYYY-MM-DD)</Text>
              <TextInput style={styles.input} value={dateFrom} onChangeText={setDateFrom} />
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={styles.subLabel}>To (YYYY-MM-DD)</Text>
              <TextInput style={styles.input} value={dateTo} onChangeText={setDateTo} />
            </View>
          </View>

          {dateError ? <Text style={styles.validationError}>{dateError}</Text> : null}

          <InlineMessage type="error" message={genError} />

          <TouchableOpacity 
            style={[styles.generateButton, isGenerateDisabled && styles.generateButtonDisabled]} 
            onPress={handleGenerate} 
            disabled={isGenerateDisabled}
          >
            {generating ? <ActivityIndicator color="#FFF" /> : <Text style={styles.generateButtonText}>Generate</Text>}
          </TouchableOpacity>
        </View>

        <Text style={[styles.sectionTitle, { marginTop: Spacing.four }]}>SAVED REPORTS</Text>
        
        <InlineMessage type="error" message={errorMsg} />

        {loading && !refreshing ? (
          <ActivityIndicator size="large" color={BrandColors.orange} style={{ marginTop: 20 }} />
        ) : errorMsg && reports.length === 0 ? (
          <TouchableOpacity style={styles.retryBtn} onPress={fetchReports}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        ) : reports.length === 0 ? (
          <Text style={styles.emptyText}>No reports found.</Text>
        ) : (
          reports.map(r => {
            const typeLabel = TYPE_OPTIONS.find(t => t.id === r.type)?.label || r.type;
            return (
              <View key={r.id} style={styles.reportCard}>
                <View style={styles.reportInfo}>
                  <Text style={styles.reportTitle}>{r.headline || `${typeLabel} Report`}</Text>
                  <Text style={styles.reportTypeBadge}>{typeLabel}</Text>
                  <Text style={styles.reportDate}>{r.dateFrom} to {r.dateTo}</Text>
                  <Text style={styles.reportMeta}>Generated: {new Date(r.createdAt).toLocaleString()}</Text>
                </View>
                <View style={styles.reportActions}>
                  <TouchableOpacity style={styles.actionBtn} onPress={() => router.push(`/(tabs)/analytics-detail?id=${r.id}`)}>
                    <SymbolView name="eye" size={20} tintColor={BrandColors.navy} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionBtn} onPress={() => confirmDelete(r.id)}>
                    <SymbolView name="trash" size={20} tintColor="#EF4444" />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      <ConfirmModal
        visible={deleteModalVisible}
        title="Delete Report"
        message="Are you sure you want to delete this report? This cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  contentContainer: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.six,
  },
  header: {
    marginBottom: Spacing.four,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: BrandColors.navy,
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: Spacing.four,
    borderRadius: Radius.lg,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: Spacing.three,
    letterSpacing: 0.5,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: BrandColors.navy,
    marginBottom: Spacing.two,
    marginTop: Spacing.three,
  },
  typesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Radius.md,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  typeChipActive: {
    backgroundColor: '#FFF7ED',
    borderColor: BrandColors.orange,
  },
  typeChipText: {
    fontSize: 14,
    color: BrandColors.navy,
    fontWeight: '600',
  },
  typeChipTextActive: {
    color: BrandColors.orange,
  },
  typeDesc: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 6,
    fontStyle: 'italic',
  },
  presetContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: Spacing.three,
  },
  presetChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius.full,
    backgroundColor: '#E2E8F0',
  },
  presetText: {
    fontSize: 12,
    color: BrandColors.navy,
    fontWeight: '500',
  },
  dateInputs: {
    flexDirection: 'row',
    marginBottom: Spacing.two,
  },
  subLabel: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: Radius.md,
    padding: 10,
    fontSize: 14,
  },
  validationError: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
    marginBottom: Spacing.two,
  },
  generateButton: {
    backgroundColor: BrandColors.orange,
    height: 48,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.two,
  },
  generateButtonDisabled: {
    backgroundColor: '#FDBA74',
  },
  generateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  emptyText: {
    textAlign: 'center',
    color: '#64748B',
    marginTop: Spacing.four,
  },
  retryBtn: {
    alignSelf: 'center',
    padding: Spacing.three,
    backgroundColor: '#E2E8F0',
    borderRadius: Radius.md,
    marginTop: Spacing.three,
  },
  retryText: {
    color: BrandColors.navy,
    fontWeight: '600',
  },
  reportCard: {
    backgroundColor: '#FFFFFF',
    padding: Spacing.four,
    borderRadius: Radius.lg,
    marginBottom: Spacing.three,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  reportInfo: {
    flex: 1,
    paddingRight: Spacing.two,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: BrandColors.navy,
    marginBottom: 4,
  },
  reportTypeBadge: {
    alignSelf: 'flex-start',
    fontSize: 10,
    fontWeight: '700',
    backgroundColor: '#E2E8F0',
    color: '#475569',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 4,
  },
  reportDate: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 2,
  },
  reportMeta: {
    fontSize: 11,
    color: '#94A3B8',
  },
  reportActions: {
    flexDirection: 'column',
    gap: 8,
  },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  }
});
