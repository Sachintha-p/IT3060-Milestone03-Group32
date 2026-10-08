import { Platform } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import { ReportSummary } from '../api';

const escapeCsv = (str: string) => {
  if (str === null || str === undefined) return '';
  const s = String(str);
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
};

export const buildCsv = (report: ReportSummary) => {
  const lines = [];
  lines.push(`Report Type,${escapeCsv(report.type)}`);
  lines.push(`Date Range,${escapeCsv(report.dateFrom)} to ${escapeCsv(report.dateTo)}`);
  lines.push(`Generated At,${escapeCsv(new Date(report.createdAt).toLocaleString())}`);
  lines.push('');
  lines.push('Section,Label,Value,Source');
  
  if (report.result?.metrics && Array.isArray(report.result.metrics)) {
    report.result.metrics.forEach((m: any) => {
      lines.push(`${escapeCsv(m.key)},${escapeCsv(m.label)},${escapeCsv(m.value)},${escapeCsv(m.source || '')}`);
    });
  }
  lines.push('');
  const dataSources = report.result?.dataSources ? report.result.dataSources.join(', ') : 'Unknown';
  lines.push(`Data sources: ${dataSources}`);
  return lines.join('\n');
};

export const buildHtml = (report: ReportSummary) => {
  const typeLabel = report.type;
  
  let rows = '';
  if (report.result?.metrics && Array.isArray(report.result.metrics)) {
    rows = report.result.metrics.map((m: any) => `
      <tr>
        <td style="padding: 8px; border: 1px solid #E2E8F0;">${m.label}</td>
        <td style="padding: 8px; border: 1px solid #E2E8F0; font-weight: bold;">${m.value}</td>
        <td style="padding: 8px; border: 1px solid #E2E8F0; color: #64748B;">${m.source || ''}</td>
      </tr>
    `).join('');
  }

  return `
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 20px; color: #132455; }
          h1 { color: #EA6A0C; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th { text-align: left; padding: 8px; background-color: #F8FAFC; border: 1px solid #E2E8F0; }
          .footer { margin-top: 40px; font-size: 12px; color: #94A3B8; }
        </style>
      </head>
      <body>
        <h1>${typeLabel} Report</h1>
        <p><strong>Date Range:</strong> ${report.dateFrom} to ${report.dateTo}</p>
        <p><strong>Generated At:</strong> ${new Date(report.createdAt).toLocaleString()}</p>
        
        <table>
          <thead>
            <tr>
              <th>Metric</th>
              <th>Value</th>
              <th>Source</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
        
        <div class="footer">
          Data sources: ${report.result?.dataSources ? report.result.dataSources.join(', ') : 'Unknown'}
        </div>
      </body>
    </html>
  `;
};

export const downloadCsv = async (report: ReportSummary) => {
  try {
    const csvContent = buildCsv(report);
    const filename = `library-report-${report.type}-${report.dateFrom}_${report.dateTo}.csv`;

    if (Platform.OS === 'web') {
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return { success: true, message: 'CSV downloaded successfully.' };
    } else {
      const fileUri = `${FileSystem.documentDirectory}${filename}`;
      await FileSystem.writeAsStringAsync(fileUri, csvContent, { encoding: FileSystem.EncodingType.UTF8 });
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        return { success: false, message: 'Sharing is not available on this device.' };
      }
      await Sharing.shareAsync(fileUri);
      return { success: true, message: 'CSV export complete.' };
    }
  } catch (err: any) {
    return { success: false, message: err.message || 'Failed to download CSV' };
  }
};

export const downloadPdf = async (report: ReportSummary) => {
  try {
    const htmlContent = buildHtml(report);
    if (Platform.OS === 'web') {
      await Print.printAsync({ html: htmlContent });
      return { success: true, message: 'Print dialog opened.' };
    } else {
      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        return { success: false, message: 'Sharing is not available on this device.' };
      }
      await Sharing.shareAsync(uri);
      return { success: true, message: 'PDF export complete.' };
    }
  } catch (err: any) {
    return { success: false, message: err.message || 'Failed to download PDF' };
  }
};
