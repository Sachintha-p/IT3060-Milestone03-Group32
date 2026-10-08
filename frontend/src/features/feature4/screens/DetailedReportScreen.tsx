import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SymbolView } from 'expo-symbols';
import { BrandColors, Spacing, Radius } from '@/constants/theme';
import { feature4, ReportSummary, handleError } from '@/features/feature4/api';
import { useLocalSearchParams, router } from 'expo-router';
import ConfirmModal from '../components/ConfirmModal';
import InlineMessage from '../components/InlineMessage';
import { downloadCsv, downloadPdf } from '../utils/exportReport';

export default function DetailedReportScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  
  const [report, setReport] = useState<ReportSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  
  const [exporting, setExporting] = useState(false);
  const [exportMsg, setExportMsg] = useState<{type: 'error' | 'success', text: string} | null>(null);

  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  useEffect(() => {
    if (id) fetchReport(Number(id));
  }, [id]);

  const fetchReport = async (reportId: number) => {
    try {
      setLoading(true);
      setErrorMsg('');
      const data = await feature4.reports.getById(reportId);
      setReport(data);
    } catch (err) {
      setErrorMsg(handleError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleCsv = async () => {
    if (!report) return;
    setExporting(true);
    setExportMsg(null);
    const res = await downloadCsv(report);
    setExporting(false);
    setExportMsg({ type: res.success ? 'success' : 'error', text: res.message });
  };

  const handlePdf = async () => {
    if (!report) return;
    setExporting(true);
    setExportMsg(null);
    const res = await downloadPdf(report);
    setExporting(false);
    setExportMsg({ type: res.success ? 'success' : 'error', text: res.message });
  };

  const handleDelete = async () => {
    if (!report) return;
    setDeleteModalVisible(false);
    try {
      setLoading(true);
      await feature4.reports.delete(report.id);
      router.back();
    } catch (err) {
      setLoading(false);
      setErrorMsg(handleError(err));
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={BrandColors.orange} />
      </View>
    );
  }

  if (errorMsg || !report) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + Spacing.four, paddingHorizontal: Spacing.four }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <SymbolView name="arrow.left" size={20} tintColor={BrandColors.navy} />
        </TouchableOpacity>
        <InlineMessage type="error" message={errorMsg || 'Report not found'} />
        {errorMsg && (
          <TouchableOpacity style={styles.retryBtn} onPress={() => fetchReport(Number(id))}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  const metrics = report.result?.metrics || [];
  const typeLabel = report.type;

  // Find max numeric value for simple bar charts of breakdowns
  const numericValues = metrics
    .filter((m: any) => !m.key.includes('total') && !m.key.includes('note') && !m.key.includes('threshold') && !String(m.value).includes('%'))
    .map((m: any) => {
      const num = parseFloat(m.value);
      return !isNaN(num) ? num : 0;
    });
  const maxValue = numericValues.length > 0 ? Math.max(...numericValues, 1) : 1;

  const renderBar = (m: any) => {
    const val = String(m.value);
    const num = parseFloat(val);
    if (isNaN(num)) return null;

    let widthPct = 0;
    if (val.includes('%')) {
      widthPct = num;
    } else if (!m.key.includes('total') && !m.key.includes('note') && !m.key.includes('threshold')) {
      // It's a breakdown count
      widthPct = (num / maxValue) * 100;
    }

    if (widthPct > 0) {
      if (widthPct > 100) widthPct = 100;
      return (
        <View style={styles.barTrack}>
          <View style={[styles.barFill, { width: `${widthPct}%` }]} />
        </View>
      );
    }
    return null;
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        contentContainerStyle={[styles.contentContainer, { paddingTop: insets.top + Spacing.four }]}
      >
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <SymbolView name="arrow.left" size={20} tintColor={BrandColors.navy} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{typeLabel} Report</Text>
        </View>

        <Text style={styles.reportDate}>{report.dateFrom} – {report.dateTo}</Text>
        <Text style={styles.reportAudience}>Generated at: {new Date(report.createdAt).toLocaleString()} by Admin</Text>
        
        {report.headline && (
          <View style={styles.headlineCard}>
            <Text style={styles.headlineText}>{report.headline}</Text>
          </View>
        )}

        <Text style={[styles.sectionTitle, { marginTop: Spacing.three }]}>METRICS</Text>
        
        {metrics.length === 0 ? (
          <View style={styles.emptyDataCard}>
            <Text style={styles.cardDetail}>No data in this period</Text>
          </View>
        ) : (
          metrics.map((m: any, index: number) => {
            const isOccupancyHighlight = report.type === 'OCCUPANCY' && m.key === 'threshold';
            return (
              <View key={index} style={[styles.dataCard, isOccupancyHighlight && styles.dataCardHighlight]}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>{m.label}</Text>
                  <Text style={[styles.cardDetail, isOccupancyHighlight && styles.cardDetailHighlight]}>{m.value}</Text>
                  {m.source ? <Text style={styles.cardSource}>Source: {m.source}</Text> : null}
                </View>
                <View style={{ width: 100, justifyContent: 'center' }}>
                  {renderBar(m)}
                </View>
              </View>
            );
          })
        )}

        <Text style={styles.dataSourceNote}>
          Data sources: {report.result?.dataSources ? report.result.dataSources.join(', ') : 'Unknown'}
        </Text>

        <Text style={[styles.sectionTitle, { marginTop: Spacing.four }]}>EXPORT & ACTIONS</Text>

        {exportMsg && <InlineMessage type={exportMsg.type} message={exportMsg.text} />}

        {exporting ? (
          <ActivityIndicator color={BrandColors.orange} style={{ marginVertical: Spacing.four }} />
        ) : (
          <>
            <TouchableOpacity style={styles.exportCard} onPress={handleCsv}>
              <SymbolView name="doc.text" size={16} tintColor="#94A3B8" style={styles.exportIcon} />
              <Text style={styles.exportText}>Download CSV</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.exportCard} onPress={handlePdf}>
              <SymbolView name="doc.fill" size={16} tintColor="#94A3B8" style={styles.exportIcon} />
              <Text style={styles.exportText}>Download PDF</Text>
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity style={styles.deleteButton} onPress={() => setDeleteModalVisible(true)}>
          <SymbolView name="trash.fill" size={16} tintColor="#FFF" style={styles.exportIcon} />
          <Text style={styles.deleteButtonText}>Delete Report</Text>
        </TouchableOpacity>
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
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.five,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.three,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: BrandColors.navy,
    flex: 1,
  },
  retryBtn: {
    alignSelf: 'flex-start',
    padding: Spacing.three,
    backgroundColor: '#E2E8F0',
    borderRadius: Radius.md,
    marginTop: Spacing.three,
  },
  retryText: {
    color: BrandColors.navy,
    fontWeight: '600',
  },
  reportDate: {
    fontSize: 20,
    fontWeight: '700',
    color: BrandColors.navy,
    marginBottom: 6,
  },
  reportAudience: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: Spacing.four,
  },
  headlineCard: {
    backgroundColor: '#1E293B',
    padding: Spacing.four,
    borderRadius: Radius.md,
    marginBottom: Spacing.five,
  },
  headlineText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  dataCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: Radius.md,
    padding: Spacing.four,
    marginBottom: Spacing.three,
    flexDirection: 'row',
  },
  emptyDataCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: Radius.md,
    padding: Spacing.four,
    marginBottom: Spacing.three,
    alignItems: 'center',
  },
  dataCardHighlight: {
    backgroundColor: '#FFF7ED',
    borderColor: BrandColors.orange,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: BrandColors.navy,
    marginBottom: 6,
  },
  cardDetail: {
    fontSize: 15,
    color: '#64748B',
  },
  cardDetailHighlight: {
    color: BrandColors.orange,
    fontWeight: '700',
  },
  cardSource: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 8,
  },
  barTrack: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: BrandColors.orange,
  },
  dataSourceNote: {
    fontSize: 11,
    color: '#94A3B8',
    fontStyle: 'italic',
    marginTop: Spacing.two,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: Spacing.three,
    letterSpacing: 0.5,
  },
  exportCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: Radius.md,
    height: 52,
    paddingHorizontal: Spacing.four,
    marginBottom: Spacing.three,
  },
  exportIcon: {
    marginRight: Spacing.three,
  },
  exportText: {
    fontSize: 16,
    color: BrandColors.navy,
  },
  deleteButton: {
    flexDirection: 'row',
    backgroundColor: '#EF4444',
    height: 52,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.two,
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  }
});
